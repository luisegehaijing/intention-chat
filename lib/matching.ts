import { GroupMatch, QuestionStatus, StudentProfile, TimeSlot, WeeklyQuestion } from "@/lib/types";

function overlap<T>(a: T[], b: T[]): T[] {
  return a.filter((item) => b.includes(item));
}

function intersectionsAcrossMembers(memberIds: string[], byMember: Record<string, string[]>): string[] {
  return memberIds.reduce<string[]>((acc, id, idx) => {
    if (idx === 0) return byMember[id] ?? [];
    return overlap(acc, byMember[id] ?? []);
  }, []);
}

function questionScore(status: QuestionStatus): number {
  if (status === "excited") return 3;
  if (status === "open") return 1;
  return -50;
}

function arePairwiseCompatible(a: StudentProfile, b: StudentProfile): boolean {
  if (a.campus !== b.campus) return false;
  return overlap(a.availabilitySlotIds, b.availabilitySlotIds).length > 0;
}

function compatiblePromptsForGroup(members: StudentProfile[], questions: WeeklyQuestion[]): string[] {
  const options = questions
    .filter((q) => members.every((member) => member.questionStatuses[q.id] && member.questionStatuses[q.id] !== "refuse"))
    .map((q) => {
      const score = members.reduce((sum, member) => sum + questionScore(member.questionStatuses[q.id]), 0);
      return { id: q.id, score };
    })
    .sort((a, b) => b.score - a.score);

  return options.slice(0, 3).map((q) => q.id);
}

function buildScore(params: {
  members: StudentProfile[];
  questions: WeeklyQuestion[];
  slots: TimeSlot[];
}): { score: number; slotId: string; promptIds: string[] } | null {
  const { members, questions, slots } = params;

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      if (!arePairwiseCompatible(members[i], members[j])) return null;
    }
  }

  const slotLookup = Object.fromEntries(members.map((m) => [m.id, m.availabilitySlotIds]));
  const sharedSlots = intersectionsAcrossMembers(
    members.map((m) => m.id),
    slotLookup
  );
  if (sharedSlots.length === 0) return null;

  const promptIds = compatiblePromptsForGroup(members, questions);
  if (promptIds.length < 2) return null;

  const preferredSlot = slots.find((slot) => sharedSlots.includes(slot.id) && slot.day !== "Fri" && slot.day !== "Sat")?.id;
  const slotId = preferredSlot ?? sharedSlots[0];

  const score = sharedSlots.length * 6 + promptIds.length * 4 + (members.length === 3 ? 1.5 : 0);
  return { score, slotId, promptIds };
}

function anonymize(memberIds: string[]): Record<string, string> {
  const labels = ["Member A", "Member B", "Member C"];
  return Object.fromEntries(memberIds.map((id, idx) => [id, labels[idx] ?? `Member ${idx + 1}`]));
}

export function buildAutomaticGroups(params: {
  weekOf: string;
  students: StudentProfile[];
  questions: WeeklyQuestion[];
  slots: TimeSlot[];
}): GroupMatch[] {
  const { weekOf, students, questions, slots } = params;
  const unmatched = [...students];
  const results: GroupMatch[] = [];

  while (unmatched.length >= 2) {
    const anchor = unmatched[0];
    const candidates = unmatched.slice(1).filter((s) => arePairwiseCompatible(anchor, s));

    if (candidates.length === 0) {
      unmatched.shift();
      continue;
    }

    let best:
      | {
          members: StudentProfile[];
          score: number;
          slotId: string;
          promptIds: string[];
        }
      | undefined;

    for (const partner of candidates) {
      const pairMembers = [anchor, partner];
      const pairScore = buildScore({ members: pairMembers, questions, slots });
      if (pairScore && (!best || pairScore.score > best.score)) {
        best = { members: pairMembers, ...pairScore };
      }
    }

    const trioCandidates = candidates.slice(0, 6);
    for (let i = 0; i < trioCandidates.length; i++) {
      for (let j = i + 1; j < trioCandidates.length; j++) {
        const trioMembers = [anchor, trioCandidates[i], trioCandidates[j]];
        const trioScore = buildScore({ members: trioMembers, questions, slots });
        if (trioScore && (!best || trioScore.score > best.score)) {
          best = { members: trioMembers, ...trioScore };
        }
      }
    }

    if (!best) {
      unmatched.shift();
      continue;
    }

    const memberIds = best.members.map((m) => m.id);
    const zoomHostStudentId = memberIds[0];

    results.push({
      id: `g-${Date.now()}-${results.length}`,
      weekOf,
      memberIds,
      slotId: best.slotId,
      promptIds: best.promptIds,
      zoomHostStudentId,
      anonymizedLabels: anonymize(memberIds),
      status: "matched"
    });

    for (const memberId of memberIds) {
      const idx = unmatched.findIndex((s) => s.id === memberId);
      if (idx >= 0) unmatched.splice(idx, 1);
    }
  }

  return results;
}
