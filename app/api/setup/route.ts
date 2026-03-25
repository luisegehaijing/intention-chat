import { NextResponse } from "next/server";
import { getCurrentCycleInfo } from "@/lib/server/cycle";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";
import { SetupInput } from "@/lib/server/pilot-types";
import { getAuthenticatedUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cycle = getCurrentCycleInfo();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("pilot_submissions")
    .select("availability,discussion_entry_one,discussion_entry_two,updated_at")
    .eq("cycle_key", cycle.cycleKey)
    .eq("email", user.email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const canEdit = new Date() <= new Date(cycle.setupDeadlineISO);

  return NextResponse.json({
    cycleKey: cycle.cycleKey,
    setupDeadlineISO: cycle.setupDeadlineISO,
    matchingRunISO: cycle.matchingRunISO,
    canEdit,
    submission: data
      ? {
          availability: data.availability,
          discussionEntryOne: data.discussion_entry_one,
          discussionEntryTwo: data.discussion_entry_two,
          updatedAt: data.updated_at
        }
      : null
  });
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as SetupInput;
    const entryOne = body.discussionEntryOne?.trim() ?? "";
    const entryTwo = body.discussionEntryTwo?.trim() ?? "";

    const wordCount = (value: string) =>
      value
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean).length;

    if (!Array.isArray(body.availability) || body.availability.length === 0) {
      return NextResponse.json({ error: "Select at least one availability slot." }, { status: 400 });
    }

    if (!entryOne) {
      return NextResponse.json({ error: "Please submit at least one discussion entry." }, { status: 400 });
    }

    if (wordCount(entryOne) > 50 || (entryTwo && wordCount(entryTwo) > 50)) {
      return NextResponse.json({ error: "Each discussion entry must be 50 words or fewer." }, { status: 400 });
    }

    const pace = "balanced";
    const { cycleKey, setupDeadlineISO } = getCurrentCycleInfo();

    if (new Date() > new Date(setupDeadlineISO)) {
      return NextResponse.json({ error: "Weekly setup is locked after Tuesday 11:59 PM." }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("pilot_submissions").upsert(
      {
        cycle_key: cycleKey,
        email: user.email,
        availability: body.availability,
        pace,
        no_go_topics: null,
        discussion_entry_one: entryOne,
        discussion_entry_two: entryTwo || null,
        updated_at: new Date().toISOString()
      },
      {
        onConflict: "cycle_key,email"
      }
    );

    if (error) throw error;

    return NextResponse.json({ ok: true, cycleKey });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
