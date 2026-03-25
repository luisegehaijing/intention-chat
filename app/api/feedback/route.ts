import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { FeedbackInput } from "@/lib/server/pilot-types";
import { getAuthenticatedUser } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as FeedbackInput;

    if (!body.matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: memberRow, error: memberError } = await supabase
      .from("pilot_match_members")
      .select("id")
      .eq("match_id", body.matchId)
      .eq("email", user.email)
      .maybeSingle();

    if (memberError) throw memberError;
    if (!memberRow) {
      return NextResponse.json({ error: "You are not a member of this match." }, { status: 403 });
    }

    const { error } = await supabase.from("pilot_feedback").upsert(
      {
        match_id: body.matchId,
        email: user.email,
        happened: body.happened,
        duration_minutes: body.durationMinutes,
        overall_satisfaction: body.overallSatisfaction,
        meaningful_score: body.meaningfulScore,
        enjoyment_score: body.enjoymentScore,
        learned_something_new: body.learnedSomethingNew,
        increase_future_match_chance: body.increaseFutureMatchChance,
        comfort_score: body.enjoymentScore,
        would_join_again: body.increaseFutureMatchChance,
        prompt_proposal: body.promptProposal?.trim() || null,
        safety_report: body.safetyReport?.trim() || null
      },
      {
        onConflict: "match_id,email"
      }
    );

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
