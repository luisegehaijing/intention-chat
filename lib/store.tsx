"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ACTIVE_WEEK_ID, CAMPUS_NAME, GROUP_MATCHES, STUDENTS, WEEKLY_QUESTIONS, WEEKLY_TIME_SLOTS } from "@/lib/mock-data";
import { buildAutomaticGroups } from "@/lib/matching";
import { GroupMatch, QuestionStatus, ReflectionRecord, StudentProfile } from "@/lib/types";

interface WeeklySubmissionInput {
  schoolEmail: string;
  availabilitySlotIds: string[];
  questionStatuses: Record<string, QuestionStatus>;
}

interface AppState {
  currentUserId: string;
  students: StudentProfile[];
  groupMatches: GroupMatch[];
  reflections: ReflectionRecord[];
  submitWeeklySetup: (input: WeeklySubmissionInput) => void;
  submitReflection: (record: Omit<ReflectionRecord, "id">) => void;
  runAutoMatching: () => void;
  assignZoomHost: (groupId: string, studentId: string) => void;
  assignMeetingLink: (groupId: string, link: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = "heartfelt-group-prototype-v1";

function defaultQuestionStatuses() {
  return Object.fromEntries(WEEKLY_QUESTIONS.map((q) => [q.id, "open"] as const));
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "Student";
  const normalized = local.replace(/[^a-zA-Z]/g, " ").trim();
  const base = normalized ? normalized.split(" ")[0] : "Student";
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState("");
  const [students, setStudents] = useState<StudentProfile[]>(STUDENTS);
  const [groupMatches, setGroupMatches] = useState<GroupMatch[]>(GROUP_MATCHES);
  const [reflections, setReflections] = useState<ReflectionRecord[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        currentUserId: string;
        students: StudentProfile[];
        groupMatches: GroupMatch[];
        reflections: ReflectionRecord[];
      };
      setCurrentUserId(parsed.currentUserId);
      setStudents(parsed.students);
      setGroupMatches(parsed.groupMatches);
      setReflections(parsed.reflections);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentUserId, students, groupMatches, reflections }));
  }, [currentUserId, students, groupMatches, reflections]);

  const submitWeeklySetup = (input: WeeklySubmissionInput) => {
    const email = input.schoolEmail.trim().toLowerCase();
    const existing = students.find((student) => student.schoolEmail === email);

    if (existing) {
      setStudents((prev) =>
        prev.map((student) =>
          student.id === existing.id
            ? {
                ...student,
                availabilitySlotIds: input.availabilitySlotIds,
                questionStatuses: input.questionStatuses
              }
            : student
        )
      );
      setCurrentUserId(existing.id);
      return;
    }

    const newStudent: StudentProfile = {
      id: `u-${Date.now()}`,
      firstName: nameFromEmail(email),
      schoolEmail: email,
      campus: CAMPUS_NAME,
      availabilitySlotIds: input.availabilitySlotIds,
      questionStatuses: input.questionStatuses
    };

    setStudents((prev) => [newStudent, ...prev]);
    setCurrentUserId(newStudent.id);
  };

  const submitReflection = (record: Omit<ReflectionRecord, "id">) => {
    setReflections((prev) => [{ ...record, id: `rf-${Date.now()}` }, ...prev]);
  };

  const runAutoMatching = () => {
    const generated = buildAutomaticGroups({
      weekOf: "2026-03-23",
      students,
      questions: WEEKLY_QUESTIONS.filter((q) => q.weekId === ACTIVE_WEEK_ID),
      slots: WEEKLY_TIME_SLOTS
    });

    setGroupMatches(generated);
  };

  const assignZoomHost = (groupId: string, studentId: string) => {
    setGroupMatches((prev) => prev.map((group) => (group.id === groupId ? { ...group, zoomHostStudentId: studentId } : group)));
  };

  const assignMeetingLink = (groupId: string, link: string) => {
    setGroupMatches((prev) => prev.map((group) => (group.id === groupId ? { ...group, zoomLink: link } : group)));
  };

  const value: AppState = {
    currentUserId,
    students,
    groupMatches,
    reflections,
    submitWeeklySetup,
    submitReflection,
    runAutoMatching,
    assignZoomHost,
    assignMeetingLink
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used inside AppProvider");
  return ctx;
}

export function getDefaultQuestionStatuses() {
  return defaultQuestionStatuses();
}
