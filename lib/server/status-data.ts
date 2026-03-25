import { getCurrentCycleInfo } from "@/lib/server/cycle";
import { getSupabaseAdmin } from "@/lib/server/supabase-admin";

type MatchRow = {
  id: string;
  cycle_key: string;
  group_code: string;
  meeting_time: string;
  whereby_link: string;
  status: "matched" | "completed";
  matching_reason: string | null;
};

type FeedbackRow = {
  match_id: string;
  meaningful_score: number;
  enjoyment_score: number | null;
  overall_satisfaction: number | null;
  duration_minutes: number | null;
  created_at: string;
};

async function getMatchAndFeedbackByEmail(email: string) {
  const supabase = getSupabaseAdmin();

  const { data: membershipRows, error: membershipError } = await supabase
    .from("pilot_match_members")
    .select("match_id")
    .eq("email", email);

  if (membershipError) throw membershipError;

  const matchIds = (membershipRows ?? []).map((row) => row.match_id);
  if (matchIds.length === 0) {
    return { matchesById: {} as Record<string, MatchRow>, feedbackByMatchId: {} as Record<string, FeedbackRow> };
  }

  const [matchesRes, feedbackRes] = await Promise.all([
    supabase
      .from("pilot_matches")
      .select("id,cycle_key,group_code,meeting_time,whereby_link,status,matching_reason")
      .in("id", matchIds),
    supabase
      .from("pilot_feedback")
      .select("match_id,meaningful_score,enjoyment_score,overall_satisfaction,duration_minutes,created_at")
      .eq("email", email)
      .in("match_id", matchIds)
  ]);

  if (matchesRes.error) throw matchesRes.error;
  if (feedbackRes.error) throw feedbackRes.error;

  const matchesById = Object.fromEntries(((matchesRes.data ?? []) as MatchRow[]).map((row) => [row.id, row]));
  const feedbackByMatchId = Object.fromEntries(((feedbackRes.data ?? []) as FeedbackRow[]).map((row) => [row.match_id, row]));

  return { matchesById, feedbackByMatchId };
}

export async function getCurrentStatusPayload(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!email) {
    return { status: 400 as const, body: { error: "email is required" } };
  }

  const supabase = getSupabaseAdmin();
  const cycle = getCurrentCycleInfo();

  const { data: currentSubmission, error: submissionError } = await supabase
    .from("pilot_submissions")
    .select("id,availability,discussion_entry_one,discussion_entry_two,updated_at")
    .eq("cycle_key", cycle.cycleKey)
    .eq("email", email)
    .maybeSingle();

  if (submissionError) {
    return { status: 500 as const, body: { error: submissionError.message } };
  }

  let matchesById: Record<string, MatchRow>;
  let feedbackByMatchId: Record<string, FeedbackRow>;

  try {
    ({ matchesById, feedbackByMatchId } = await getMatchAndFeedbackByEmail(email));
  } catch (error) {
    return { status: 500 as const, body: { error: (error as Error).message } };
  }

  const currentMatch = Object.values(matchesById).find((match) => match.cycle_key === cycle.cycleKey) ?? null;
  const currentFeedback = currentMatch ? feedbackByMatchId[currentMatch.id] : null;

  const currentStatus = !currentSubmission
    ? "not_submitted"
    : !currentMatch
      ? "waiting"
      : currentFeedback
        ? "completed"
        : "matched";

  const canEditSetup = new Date() <= new Date(cycle.setupDeadlineISO);

  return {
    status: 200 as const,
    body: {
      status: currentStatus,
      cycleKey: cycle.cycleKey,
      setupDeadlineISO: cycle.setupDeadlineISO,
      matchingRunISO: cycle.matchingRunISO,
      canEditSetup,
      submission: currentSubmission
        ? {
            availability: currentSubmission.availability,
            discussionEntryOne: currentSubmission.discussion_entry_one,
            discussionEntryTwo: currentSubmission.discussion_entry_two,
            updatedAt: currentSubmission.updated_at
          }
        : null,
      match: currentMatch
        ? {
            id: currentMatch.id,
            meeting_time: currentMatch.meeting_time,
            whereby_link: currentMatch.whereby_link,
            group_code: currentMatch.group_code,
            status: currentMatch.status,
            matching_reason: currentMatch.matching_reason
          }
        : null,
      feedback: currentFeedback
        ? {
            meaningfulScore: currentFeedback.meaningful_score,
            enjoymentScore: currentFeedback.enjoyment_score,
            overallSatisfaction: currentFeedback.overall_satisfaction,
            durationMinutes: currentFeedback.duration_minutes,
            submittedAt: currentFeedback.created_at
          }
        : null
    }
  };
}

export async function getHistoryPayload(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!email) {
    return { status: 400 as const, body: { error: "email is required" } };
  }

  const supabase = getSupabaseAdmin();
  const cycle = getCurrentCycleInfo();

  let matchesById: Record<string, MatchRow>;
  let feedbackByMatchId: Record<string, FeedbackRow>;
  try {
    ({ matchesById, feedbackByMatchId } = await getMatchAndFeedbackByEmail(email));
  } catch (error) {
    return { status: 500 as const, body: { error: (error as Error).message } };
  }

  const { data: submissionRows, error: submissionError } = await supabase
    .from("pilot_submissions")
    .select("cycle_key,availability,discussion_entry_one,discussion_entry_two,updated_at")
    .eq("email", email)
    .order("updated_at", { ascending: false });

  if (submissionError) {
    return { status: 500 as const, body: { error: submissionError.message } };
  }

  const matchHistory = Object.values(matchesById)
    .map((match) => {
      const feedback = feedbackByMatchId[match.id];
      return {
        matchId: match.id,
        cycleKey: match.cycle_key,
        groupCode: match.group_code,
        meetingTime: match.meeting_time,
        matchingReason: match.matching_reason,
        completed: Boolean(feedback),
        feedback: feedback
          ? {
              meaningfulScore: feedback.meaningful_score,
              enjoymentScore: feedback.enjoyment_score,
              overallSatisfaction: feedback.overall_satisfaction,
              durationMinutes: feedback.duration_minutes,
              submittedAt: feedback.created_at
            }
          : null
      };
    })
    .sort((a, b) => new Date(b.meetingTime).getTime() - new Date(a.meetingTime).getTime());

  const discussionHistory = (submissionRows ?? []).map((row) => ({
    cycleKey: row.cycle_key,
    availability: row.availability,
    discussionEntryOne: row.discussion_entry_one,
    discussionEntryTwo: row.discussion_entry_two,
    updatedAt: row.updated_at,
    isCurrentCycle: row.cycle_key === cycle.cycleKey
  }));

  return {
    status: 200 as const,
    body: {
      cycleKey: cycle.cycleKey,
      matchHistory,
      discussionHistory
    }
  };
}
