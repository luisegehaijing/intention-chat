import { NextResponse } from "next/server";
import { getCurrentCycleInfo } from "@/lib/server/cycle";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

function isAuthorized(req: Request) {
  const adminKey = process.env.ADMIN_DASHBOARD_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const header = req.headers.get("x-admin-key");
  const bearer = req.headers.get("authorization")?.replace("Bearer ", "");

  return Boolean(
    (adminKey && (header === adminKey || bearer === adminKey)) ||
      (cronSecret && (header === cronSecret || bearer === cronSecret))
  );
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cycleKey } = getCurrentCycleInfo();
    const supabase = getSupabaseAdmin();

    const [submissionsRes, matchesRes, feedbackRes] = await Promise.all([
      supabase.from("pilot_submissions").select("id,email,availability,pace,no_go_topics,discussion_entry_one,discussion_entry_two,updated_at").eq("cycle_key", cycleKey).order("updated_at", { ascending: false }),
      supabase.from("pilot_matches").select("id,group_code,meeting_time,whereby_link,status,matching_reason").eq("cycle_key", cycleKey).order("meeting_time", { ascending: true }),
      supabase.from("pilot_feedback").select("id,email,match_id,happened,duration_minutes,overall_satisfaction,meaningful_score,enjoyment_score,learned_something_new,increase_future_match_chance,safety_report,created_at").order("created_at", { ascending: false })
    ]);

    if (submissionsRes.error) throw submissionsRes.error;
    if (matchesRes.error) throw matchesRes.error;
    if (feedbackRes.error) throw feedbackRes.error;

    return NextResponse.json({
      cycleKey,
      submissions: submissionsRes.data,
      matches: matchesRes.data,
      feedback: feedbackRes.data
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
