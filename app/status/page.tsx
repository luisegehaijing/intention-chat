"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StatusResponse = {
  status: "not_submitted" | "waiting" | "matched" | "completed";
  cycleKey: string;
  setupDeadlineISO: string;
  matchingRunISO: string;
  canEditSetup: boolean;
  submission: {
    availability: string[];
    discussionEntryOne: string;
    discussionEntryTwo: string | null;
    updatedAt: string;
  } | null;
  match: {
    id: string;
    meeting_time: string;
    whereby_link: string;
    group_code: string;
    status: "matched" | "completed";
    matching_reason?: string | null;
  } | null;
  feedback: {
    meaningfulScore: number;
    enjoymentScore: number | null;
    overallSatisfaction: number | null;
    durationMinutes: number | null;
    submittedAt: string;
  } | null;
};

export default function StatusPage() {
  const router = useRouter();
  const [data, setData] = useState<StatusResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [happened, setHappened] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [overallSatisfaction, setOverallSatisfaction] = useState(4);
  const [meaningfulScore, setMeaningfulScore] = useState(4);
  const [enjoymentScore, setEnjoymentScore] = useState(4);
  const [learnedSomethingNew, setLearnedSomethingNew] = useState(true);
  const [increaseFutureMatchChance, setIncreaseFutureMatchChance] = useState<"yes" | "maybe" | "no">("yes");
  const [promptProposal, setPromptProposal] = useState("");
  const [safetyReport, setSafetyReport] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/status");
    if (res.status === 401) {
      router.replace("/auth");
      return;
    }

    const payload = (await res.json()) as StatusResponse & { error?: string };
    if (!res.ok) {
      setError(payload.error ?? "Could not load status.");
      setLoading(false);
      return;
    }

    setData(payload);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function submitFeedback() {
    if (!data?.match?.id) return;

    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: data.match.id,
        happened,
        durationMinutes,
        overallSatisfaction,
        meaningfulScore,
        enjoymentScore,
        learnedSomethingNew,
        increaseFutureMatchChance,
        promptProposal,
        safetyReport
      })
    });

    const payload = await res.json();

    if (!res.ok) {
      setFeedbackMessage(payload.error ?? "Could not submit feedback.");
      return;
    }

    setFeedbackMessage("Feedback saved. Thank you.");
    await loadStatus();
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-moss">Loading this week status...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-3">
        <h1 className="text-xl font-serif leading-tight sm:text-3xl">This Week Status</h1>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {data ? <p className="text-sm text-moss">Cycle: {data.cycleKey}</p> : null}
      </Card>

      {data ? (
        <Card className="p-6 space-y-4">
          {data.status === "not_submitted" ? (
            <>
              <h2 className="text-base font-serif sm:text-xl">Not submitted yet</h2>
              <p className="text-sm">Submit setup before {new Date(data.setupDeadlineISO).toLocaleString()}.</p>
              <a href="/setup" className="inline-flex items-center rounded-full border border-moss/40 px-4 py-2 text-sm">Go to Weekly Setup</a>
            </>
          ) : null}

          {data.status === "waiting" ? (
            <>
              <h2 className="text-base font-serif sm:text-xl">Waiting for matching</h2>
              <p className="text-sm">Matching runs on {new Date(data.matchingRunISO).toLocaleString()}.</p>
              <p className="text-sm text-moss">You can still view and edit setup until Monday deadline.</p>
              <a href="/setup" className="inline-flex items-center rounded-full border border-moss/40 px-4 py-2 text-sm">View Setup</a>
            </>
          ) : null}

          {(data.status === "matched" || data.status === "completed") && data.match ? (
            <>
              <h2 className="text-base font-serif sm:text-xl">{data.status === "completed" ? "Completed" : "Matched"}</h2>
              <p className="text-sm"><strong>Group:</strong> {data.match.group_code}</p>
              <p className="text-sm"><strong>Meeting time:</strong> {new Date(data.match.meeting_time).toLocaleString()}</p>
              <p className="text-sm break-all"><strong>Whereby:</strong> <a className="underline" href={data.match.whereby_link} target="_blank" rel="noreferrer">{data.match.whereby_link}</a></p>
              <p className="text-sm"><strong>Why this match:</strong> {data.match.matching_reason ?? "Matched for shared timing and discussion interests."}</p>

              {data.status === "matched" ? (
                <div className="mt-2 rounded-xl border border-moss/30 p-4 space-y-3">
                  <h3 className="text-sm font-medium sm:text-base">Post-meeting feedback</h3>

                  <div className="flex gap-2">
                    <button type="button" className={`rounded-full border px-3 py-1 text-sm ${happened ? "bg-pine text-paper" : ""}`} onClick={() => setHappened(true)}>Happened</button>
                    <button type="button" className={`rounded-full border px-3 py-1 text-sm ${!happened ? "bg-pine text-paper" : ""}`} onClick={() => setHappened(false)}>Did not happen</button>
                  </div>

                  <label className="block text-sm">Duration (minutes)</label>
                  <input type="number" min={0} max={240} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="w-full rounded-xl border border-moss/40 bg-paper px-3 py-2" />

                  <label className="block text-sm">Overall satisfaction: {overallSatisfaction}/5</label>
                  <input type="range" min={1} max={5} value={overallSatisfaction} onChange={(e) => setOverallSatisfaction(Number(e.target.value))} className="w-full" />

                  <label className="block text-sm">Meaningful: {meaningfulScore}/5</label>
                  <input type="range" min={1} max={5} value={meaningfulScore} onChange={(e) => setMeaningfulScore(Number(e.target.value))} className="w-full" />

                  <label className="block text-sm">Enjoyment: {enjoymentScore}/5</label>
                  <input type="range" min={1} max={5} value={enjoymentScore} onChange={(e) => setEnjoymentScore(Number(e.target.value))} className="w-full" />

                  <label className="block text-sm">Did you learn anything new?</label>
                  <div className="flex gap-2">
                    <button type="button" className={`rounded-full border px-3 py-1 text-sm ${learnedSomethingNew ? "bg-pine text-paper" : ""}`} onClick={() => setLearnedSomethingNew(true)}>Yes</button>
                    <button type="button" className={`rounded-full border px-3 py-1 text-sm ${!learnedSomethingNew ? "bg-pine text-paper" : ""}`} onClick={() => setLearnedSomethingNew(false)}>No</button>
                  </div>

                  <label className="block text-sm">Increase chance of meeting this person again soon?</label>
                  <select className="w-full rounded-xl border border-moss/40 bg-paper px-3 py-2" value={increaseFutureMatchChance} onChange={(e) => setIncreaseFutureMatchChance(e.target.value as "yes" | "maybe" | "no")}>
                    <option value="yes">Yes</option>
                    <option value="maybe">Maybe</option>
                    <option value="no">No</option>
                  </select>

                  <textarea className="w-full rounded-xl border border-moss/40 bg-paper px-3 py-2" rows={2} value={promptProposal} onChange={(e) => setPromptProposal(e.target.value)} placeholder="Optional: suggest a future question" />
                  <textarea className="w-full rounded-xl border border-moss/40 bg-paper px-3 py-2" rows={2} value={safetyReport} onChange={(e) => setSafetyReport(e.target.value)} placeholder="Optional: safety concern" />

                  <Button onClick={submitFeedback}>Submit Feedback</Button>
                  {feedbackMessage ? <p className="text-sm">{feedbackMessage}</p> : null}
                </div>
              ) : (
                <p className="text-sm text-moss">Feedback already submitted for this week.</p>
              )}
            </>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <a href="/setup" className="inline-flex items-center rounded-full border border-moss/40 px-4 py-2 text-sm">Weekly Setup</a>
            <a href="/history" className="inline-flex items-center rounded-full border border-moss/40 px-4 py-2 text-sm">History</a>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
