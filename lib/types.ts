export type QuestionStatus = "excited" | "open" | "refuse";

export type QuestionType = "mind" | "eyes" | "heart";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type GroupStatus = "pending" | "matched" | "completed" | "missed";

export interface TimeSlot {
  id: string;
  day: Weekday;
  label: string;
  startHour24: number;
}

export interface WeeklyQuestion {
  id: string;
  weekId: string;
  type: QuestionType;
  frontText: string;
  detailsText: string;
  emotionalIntensity: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface StudentProfile {
  id: string;
  firstName: string;
  schoolEmail: string;
  campus: string;
  availabilitySlotIds: string[];
  questionStatuses: Record<string, QuestionStatus>;
}

export interface GroupMatch {
  id: string;
  weekOf: string;
  memberIds: string[];
  slotId: string;
  promptIds: string[];
  zoomHostStudentId?: string;
  zoomLink?: string;
  coordinationNote?: string;
  anonymizedLabels: Record<string, string>;
  status: GroupStatus;
}

export interface ReflectionRecord {
  id: string;
  groupMatchId: string;
  studentId: string;
  happened: boolean;
  meaningfulScore: number;
  comfortScore: number;
  fitScore: number;
  promptScore: number;
  again: "yes" | "maybe" | "no";
  proposedPrompt?: string;
  safetyReport?: string;
}
