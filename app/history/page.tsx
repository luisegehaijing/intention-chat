"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

type HistoryPayload = {
  cycleKey: string;
  matchHistory: Array<{
    matchId: string;
    cycleKey: string;
    groupCode: string;
    meetingTime: string;
    matchingReason: string | null;
    completed: boolean;
    feedback: {
      meaningfulScore: number;
      enjoymentScore: number | null;
      overallSatisfaction: number | null;
      durationMinutes: number | null;
      submittedAt: string;
    } | null;
  }>;
  discussionHistory: Array<{
    cycleKey: string;
    availability: string[];
    discussionEntryOne: string;
    discussionEntryTwo: string | null;
    updatedAt: string;
    isCurrentCycle: boolean;
  }>;
};

export default function HistoryPage() {
  const router = useRouter();
  const [data, setData] = useState<HistoryPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/history");
    if (res.status === 401) {
      router.replace("/auth");
      return;
    }

    const payload = (await res.json()) as HistoryPayload & { error?: string };
    if (!res.ok) {
      setError(payload.error ?? "Could not load history.");
      setLoading(false);
      return;
    }

    setData(payload);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-moss">Loading history...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-2">
        <h1 className="text-xl font-serif leading-tight sm:text-3xl">History</h1>
        <p className="text-sm text-moss">Match history and your own discussion history across cycles.</p>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="text-base font-serif sm:text-xl">Match History</h2>
        {!data || data.matchHistory.length === 0 ? <p className="text-sm text-moss">No matches yet.</p> : null}
        <div className="space-y-3">
          {data?.matchHistory.map((item) => (
            <div key={item.matchId} className="rounded-xl border border-moss/30 p-4 text-sm">
              <p><strong>{item.cycleKey}</strong> — Group {item.groupCode}</p>
              <p>Meeting: {new Date(item.meetingTime).toLocaleString()}</p>
              <p>Reason: {item.matchingReason ?? "No reason stored"}</p>
              <p>Completed: {item.completed ? "Yes" : "No feedback yet"}</p>
              {item.feedback ? (
                <p className="text-moss">
                  Feedback: meaningful {item.feedback.meaningfulScore}/5, enjoyment {item.feedback.enjoymentScore ?? "-"}/5, duration {item.feedback.durationMinutes ?? "-"} min
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="text-base font-serif sm:text-xl">Discussion History</h2>
        {!data || data.discussionHistory.length === 0 ? <p className="text-sm text-moss">No discussion entries yet.</p> : null}
        <div className="space-y-3">
          {data?.discussionHistory.map((entry) => (
            <div key={`${entry.cycleKey}-${entry.updatedAt}`} className="rounded-xl border border-moss/30 p-4 text-sm">
              <p>
                <strong>{entry.cycleKey}</strong>{" "}
                {entry.isCurrentCycle ? <span className="rounded-full border border-moss/40 px-2 py-0.5 text-xs">Current</span> : null}
              </p>
              <p className="mt-2"><strong>Entry 1:</strong> {entry.discussionEntryOne}</p>
              {entry.discussionEntryTwo ? <p><strong>Entry 2:</strong> {entry.discussionEntryTwo}</p> : null}
              <p><strong>Availability:</strong> {entry.availability.join(", ")}</p>
              <p className="text-moss">Updated: {new Date(entry.updatedAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
