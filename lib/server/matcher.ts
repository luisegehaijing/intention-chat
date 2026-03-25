import { sendMatchEmail } from "@/lib/server/email";
import { SubmissionRow } from "@/lib/server/pilot-types";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

function overlap(a: string[], b: string[]) {
  return a.filter((slot) => b.includes(slot));
}

function groupScore(group: SubmissionRow[]) {
  const sharedSlots = group.reduce<string[]>((acc, person, idx) => {
    if (idx === 0) return person.availability;
    return overlap(acc, person.availability);
  }, []);

  if (sharedSlots.length === 0) return { score: -1, slot: null as string | null };

  let paceScore = 0;
  if (group.every((person) => person.pace === group[0].pace)) paceScore = 2;

  return { score: sharedSlots.length * 5 + paceScore + (group.length === 3 ? 1 : 0), slot: sharedSlots[0] };
}

function slotToMeetingISO(slot: string) {
  const now = new Date();
  const monday = new Date(now);
  const day = (monday.getDay() + 6) % 7;
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);

  const mapping: Record<string, { offset: number; hour: number }> = {
    "thu-18": { offset: 3, hour: 18 },
    "thu-20": { offset: 3, hour: 20 },
    "fri-18": { offset: 4, hour: 18 },
    "fri-20": { offset: 4, hour: 20 },
    "sat-13": { offset: 5, hour: 13 },
    "sat-15": { offset: 5, hour: 15 },
    "sat-19": { offset: 5, hour: 19 }
  };

  const selected = mapping[slot] ?? mapping["fri-18"];
  const meeting = new Date(monday);
  meeting.setDate(monday.getDate() + selected.offset);
  meeting.setHours(selected.hour, 0, 0, 0);
  return meeting.toISOString();
}

function buildPlaceholderReason(group: SubmissionRow[]) {
  const focusPreview = group
    .map((person) => person.discussion_entry_one || person.discussion_entry_two || "shared reflection")
    .slice(0, 2)
    .join(" | ");

  return `Provisional reasoning: shared availability and aligned discussion intentions (${focusPreview}).`;
}

export async function runMatchingForCycle(cycleKey: string) {
  const supabase = getSupabaseAdmin();

  const { data: submissions, error } = await supabase
    .from("pilot_submissions")
    .select("*")
    .eq("cycle_key", cycleKey)
    .order("updated_at", { ascending: true });

  if (error) throw error;
  if (!submissions || submissions.length < 2) return { created: 0 };

  const unmatched = [...(submissions as SubmissionRow[])];
  let groupCounter = 1;
  let created = 0;

  while (unmatched.length >= 2) {
    const anchor = unmatched[0];
    const candidates = unmatched.slice(1);

    let bestGroup: SubmissionRow[] | null = null;
    let bestScore = -1;
    let bestSlot: string | null = null;

    for (const partner of candidates) {
      const pair = [anchor, partner];
      const pairResult = groupScore(pair);
      if (pairResult.score > bestScore) {
        bestScore = pairResult.score;
        bestGroup = pair;
        bestSlot = pairResult.slot;
      }
    }

    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        const trio = [anchor, candidates[i], candidates[j]];
        const trioResult = groupScore(trio);
        if (trioResult.score > bestScore) {
          bestScore = trioResult.score;
          bestGroup = trio;
          bestSlot = trioResult.slot;
        }
      }
    }

    if (!bestGroup || !bestSlot || bestScore < 0) {
      unmatched.shift();
      continue;
    }

    const groupCode = `H-${String(groupCounter).padStart(3, "0")}`;
    const wherebyLink = `https://whereby.com/synchria-${cycleKey.toLowerCase()}-${groupCode.toLowerCase()}`;
    const meetingTime = slotToMeetingISO(bestSlot);
    const matchingReason = buildPlaceholderReason(bestGroup);

    const { data: matchRow, error: matchError } = await supabase
      .from("pilot_matches")
      .insert({
        cycle_key: cycleKey,
        group_code: groupCode,
        meeting_time: meetingTime,
        whereby_link: wherebyLink,
        matching_reason: matchingReason,
        status: "matched"
      })
      .select("id")
      .single();

    if (matchError) throw matchError;

    const membersPayload = bestGroup.map((person) => ({
      match_id: matchRow.id,
      submission_id: person.id,
      email: person.email
    }));

    const { error: memberError } = await supabase.from("pilot_match_members").insert(membersPayload);
    if (memberError) throw memberError;

    for (const person of bestGroup) {
      await sendMatchEmail({
        to: person.email,
        cycleKey,
        meetingTime,
        wherebyLink,
        groupCode
      });
    }

    for (const member of bestGroup) {
      const idx = unmatched.findIndex((item) => item.id === member.id);
      if (idx >= 0) unmatched.splice(idx, 1);
    }

    groupCounter += 1;
    created += 1;
  }

  return { created };
}
