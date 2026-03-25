export type SlotId =
  | "thu-18"
  | "thu-20"
  | "fri-18"
  | "fri-20"
  | "sat-13"
  | "sat-15"
  | "sat-19";

export interface SetupInput {
  availability: SlotId[];
  discussionEntryOne: string;
  discussionEntryTwo?: string;
}

export interface FeedbackInput {
  matchId: string;
  happened: boolean;
  durationMinutes: number;
  overallSatisfaction: number;
  meaningfulScore: number;
  enjoymentScore: number;
  learnedSomethingNew: boolean;
  increaseFutureMatchChance: "yes" | "maybe" | "no";
  promptProposal?: string;
  safetyReport?: string;
}

export interface SubmissionRow {
  id: string;
  cycle_key: string;
  email: string;
  availability: SlotId[];
  pace: "gentle" | "balanced" | "challenging";
  no_go_topics: string | null;
  discussion_entry_one: string;
  discussion_entry_two: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchRow {
  id: string;
  cycle_key: string;
  group_code: string;
  meeting_time: string;
  whereby_link: string;
  status: "matched" | "completed";
  matching_reason: string | null;
  created_at: string;
}
