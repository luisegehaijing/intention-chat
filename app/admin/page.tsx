"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Overview {
  cycleKey: string;
  submissions: Array<{ id: string; email: string; availability: string[]; pace: string; no_go_topics: string | null; discussion_entry_one: string | null; discussion_entry_two: string | null; updated_at: string }>;
  matches: Array<{ id: string; group_code: string; meeting_time: string; whereby_link: string; status: string; matching_reason: string | null }>;
  feedback: Array<{ id: string; email: string; match_id: string; happened: boolean; duration_minutes: number | null; overall_satisfaction: number | null; meaningful_score: number; enjoyment_score: number | null; learned_something_new: boolean | null; increase_future_match_chance: string | null; safety_report: string | null; created_at: string }>;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadOverview() {
    setError("");
    const res = await fetch("/api/admin/overview", { headers: { "x-admin-key": adminKey } });
    const payload = await res.json();
    if (!res.ok) return setError(payload.error ?? "Failed to load admin overview");
    setOverview(payload);
  }

  async function runMatching() {
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/run-matching", {
      method: "POST",
      headers: { "x-admin-key": adminKey }
    });
    const payload = await res.json();
    if (!res.ok) return setError(payload.error ?? "Failed to run matching");
    setMessage(`Matching complete. Groups created: ${payload.created}`);
    await loadOverview();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <h1 className="text-3xl font-serif">Synchria Admin</h1>
        <input
          className="w-full max-w-md rounded-xl border border-moss/40 bg-paper px-3 py-2"
          placeholder="Admin dashboard key"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={loadOverview}>Load Overview</Button>
          <Button variant="secondary" onClick={runMatching}>Run Matching + Send Emails</Button>
        </div>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      </Card>

      {overview ? (
        <>
          <Card className="p-6">
            <h2 className="text-xl font-serif">Cycle {overview.cycleKey}</h2>
            <p className="mt-2 text-sm">Submissions: {overview.submissions.length} | Matches: {overview.matches.length} | Feedback: {overview.feedback.length}</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium">Submissions</h3>
            <div className="mt-3 space-y-2 text-sm">
              {overview.submissions.map((s) => (
                <div key={s.id} className="rounded-xl border border-moss/30 p-3">
                  <p><strong>{s.email}</strong></p>
                  <p>Availability: {s.availability.join(", ")}</p>
                  <p>Pace: {s.pace}</p>
                  <p>Entry 1: {s.discussion_entry_one ?? "-"}</p>
                  <p>Entry 2: {s.discussion_entry_two ?? "-"}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium">Matches</h3>
            <div className="mt-3 space-y-2 text-sm">
              {overview.matches.map((m) => (
                <div key={m.id} className="rounded-xl border border-moss/30 p-3">
                  <p><strong>{m.group_code}</strong> | {new Date(m.meeting_time).toLocaleString()}</p>
                  <p><a className="underline" href={m.whereby_link} target="_blank" rel="noreferrer">{m.whereby_link}</a></p>
                  <p className="mt-1 text-moss">Reason: {m.matching_reason ?? "Pending reasoning"}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-medium">Safety Reports</h3>
            <div className="mt-3 space-y-2 text-sm">
              {overview.feedback.filter((f) => !!f.safety_report).length === 0 ? <p>None.</p> : null}
              {overview.feedback.filter((f) => !!f.safety_report).map((f) => (
                <div key={f.id} className="rounded-xl border border-red-300 p-3">
                  <p><strong>{f.email}</strong> (match {f.match_id})</p>
                  <p>{f.safety_report}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
