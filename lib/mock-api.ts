import { GROUP_MATCHES, STUDENTS, WEEKLY_QUESTIONS, WEEKLY_TIME_SLOTS } from "@/lib/mock-data";

const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWeeklyQuestions() {
  await delay();
  return WEEKLY_QUESTIONS;
}

export async function fetchWeeklySlots() {
  await delay();
  return WEEKLY_TIME_SLOTS;
}

export async function fetchStudents() {
  await delay();
  return STUDENTS;
}

export async function fetchGroupMatches() {
  await delay();
  return GROUP_MATCHES;
}
