import { GroupMatch, StudentProfile, TimeSlot, WeeklyQuestion } from "@/lib/types";

export const CAMPUS_NAME = "Lakeside University";
export const ACTIVE_WEEK_ID = "2026-w13";

export const WEEKLY_TIME_SLOTS: TimeSlot[] = [
  { id: "mon-19", day: "Mon", label: "7:00 PM", startHour24: 19 },
  { id: "tue-18", day: "Tue", label: "6:00 PM", startHour24: 18 },
  { id: "wed-20", day: "Wed", label: "8:00 PM", startHour24: 20 },
  { id: "thu-19", day: "Thu", label: "7:00 PM", startHour24: 19 },
  { id: "fri-17", day: "Fri", label: "5:00 PM", startHour24: 17 },
  { id: "sat-14", day: "Sat", label: "2:00 PM", startHour24: 14 },
  { id: "sun-16", day: "Sun", label: "4:00 PM", startHour24: 16 }
];

export const WEEKLY_QUESTIONS: WeeklyQuestion[] = [
  {
    id: "mind",
    weekId: ACTIVE_WEEK_ID,
    type: "mind",
    frontText: "What idea are you still actively wrestling with this week?",
    detailsText: "Share what you have read, heard, or noticed so far, and what you still want to understand better.",
    emotionalIntensity: 2,
    tags: ["thinking", "research"]
  },
  {
    id: "eyes",
    weekId: ACTIVE_WEEK_ID,
    type: "eyes",
    frontText: "What are you seeing differently on campus now than a month ago?",
    detailsText: "Focus on one concrete shift in perspective and where it came from.",
    emotionalIntensity: 3,
    tags: ["observation", "perspective"]
  },
  {
    id: "heart",
    weekId: ACTIVE_WEEK_ID,
    type: "heart",
    frontText: "What has felt most emotionally true for you lately?",
    detailsText: "Share at your own pace. Others should listen without fixing unless advice is invited.",
    emotionalIntensity: 4,
    tags: ["emotion", "meaning"]
  }
];

function defaultStatuses(): Record<string, "excited" | "open" | "refuse"> {
  return Object.fromEntries(WEEKLY_QUESTIONS.map((q) => [q.id, "open"]));
}

export const STUDENTS: StudentProfile[] = [
  {
    id: "u1",
    firstName: "Maya",
    schoolEmail: "maya@lakeside.edu",
    campus: CAMPUS_NAME,
    availabilitySlotIds: ["thu-19", "sun-16"],
    questionStatuses: { ...defaultStatuses(), mind: "excited", eyes: "open", heart: "open" }
  },
  {
    id: "u2",
    firstName: "Theo",
    schoolEmail: "theo@lakeside.edu",
    campus: CAMPUS_NAME,
    availabilitySlotIds: ["thu-19", "sat-14"],
    questionStatuses: { ...defaultStatuses(), mind: "open", eyes: "excited", heart: "open" }
  },
  {
    id: "u3",
    firstName: "Rin",
    schoolEmail: "rin@lakeside.edu",
    campus: CAMPUS_NAME,
    availabilitySlotIds: ["thu-19", "sun-16"],
    questionStatuses: { ...defaultStatuses(), mind: "open", eyes: "open", heart: "excited" }
  },
  {
    id: "u4",
    firstName: "Asha",
    schoolEmail: "asha@lakeside.edu",
    campus: CAMPUS_NAME,
    availabilitySlotIds: ["tue-18", "wed-20"],
    questionStatuses: { ...defaultStatuses(), mind: "excited", eyes: "open", heart: "refuse" }
  }
];

export const GROUP_MATCHES: GroupMatch[] = [
  {
    id: "g1",
    weekOf: "2026-03-23",
    memberIds: ["u1", "u2", "u3"],
    slotId: "thu-19",
    promptIds: ["mind", "eyes", "heart"],
    zoomHostStudentId: "u2",
    zoomLink: "https://zoom.us/j/12345678901",
    coordinationNote: "Host opens room 3 minutes early. Cameras optional.",
    anonymizedLabels: { u1: "Member A", u2: "Member B", u3: "Member C" },
    status: "matched"
  }
];
