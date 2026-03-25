"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const slots = [
  { id: "thu-18", label: "Thursday 6:00 PM" },
  { id: "thu-20", label: "Thursday 8:00 PM" },
  { id: "fri-18", label: "Friday 6:00 PM" },
  { id: "fri-20", label: "Friday 8:00 PM" },
  { id: "sat-13", label: "Saturday 1:00 PM" },
  { id: "sat-15", label: "Saturday 3:00 PM" },
  { id: "sat-19", label: "Saturday 7:00 PM" }
] as const;

interface SetupPayload {
  cycleKey: string;
  setupDeadlineISO: string;
  matchingRunISO: string;
  canEdit: boolean;
  submission: {
    availability: string[];
    discussionEntryOne: string;
    discussionEntryTwo: string | null;
    updatedAt: string;
  } | null;
}

export default function SetupPage() {
  const router = useRouter();
  const [setupData, setSetupData] = useState<SetupPayload | null>(null);
  const [availability, setAvailability] = useState<string[]>([]);
  const [discussionEntryOne, setDiscussionEntryOne] = useState("");
  const [discussionEntryTwo, setDiscussionEntryTwo] = useState("");
  const [showSecondEntry, setShowSecondEntry] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSetup = useCallback(async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/setup");
    if (res.status === 401) {
      router.replace("/auth");
      return;
    }

    const payload = (await res.json()) as SetupPayload & { error?: string };
    if (!res.ok) {
      setError(payload.error ?? "Could not load weekly setup.");
      setLoading(false);
      return;
    }

    setSetupData(payload);
    if (payload.submission) {
      setAvailability(payload.submission.availability ?? []);
      setDiscussionEntryOne(payload.submission.discussionEntryOne ?? "");
      setDiscussionEntryTwo(payload.submission.discussionEntryTwo ?? "");
      setShowSecondEntry(Boolean(payload.submission.discussionEntryTwo));
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadSetup();
  }, [loadSetup]);

  function toggleSlot(slotId: string) {
    setAvailability((prev) => (prev.includes(slotId) ? prev.filter((slot) => slot !== slotId) : [...prev, slotId]));
  }

  function wordCount(text: string) {
    return text
      .split(/\s+/)
      .map((part) => part.trim())
      .filter(Boolean).length;
  }

  async function submit() {
    setError("");
    setMessage("");

    if (!setupData?.canEdit) {
      return setError("Setup is locked after Monday.");
    }
    if (availability.length === 0) return setError("Choose at least one meeting slot.");
    if (!discussionEntryOne.trim()) return setError("Please add your first discussion entry.");
    if (wordCount(discussionEntryOne) > 50 || (discussionEntryTwo.trim() && wordCount(discussionEntryTwo) > 50)) {
      return setError("Each discussion entry must be 50 words or fewer.");
    }

    setIsSaving(true);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        availability,
        discussionEntryOne,
        discussionEntryTwo: showSecondEntry ? discussionEntryTwo : ""
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Could not save setup.");
      setIsSaving(false);
      return;
    }

    setMessage("Saved. You can check Status for this week and History anytime.");
    setIsSaving(false);
    await loadSetup();
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-moss">Loading weekly setup...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-lg font-serif leading-tight sm:text-3xl">Synchria Weekly Setup</h1>
        <p className="mt-2 text-sm text-moss">You can edit this form until Monday deadline.</p>
        {setupData ? (
          <div className="mt-4 rounded-xl border border-moss/30 bg-paper p-4 text-sm">
            <p><strong>Cycle:</strong> {setupData.cycleKey}</p>
            <p><strong>Setup closes:</strong> {new Date(setupData.setupDeadlineISO).toLocaleString()}</p>
            <p><strong>Matching runs:</strong> {new Date(setupData.matchingRunISO).toLocaleString()}</p>
            <p><strong>Edit status:</strong> {setupData.canEdit ? "Open" : "Locked"}</p>
          </div>
        ) : null}
      </Card>

      <Card className="p-6 space-y-5">
        <div>
          <p className="mb-1 text-sm font-medium">Availability (Thu-Fri-Sat)</p>
          <p className="mb-2 text-xs text-moss">Choose all time slots that could work for you this week.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {slots.map((slot) => {
              const active = availability.includes(slot.id);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleSlot(slot.id)}
                  disabled={!setupData?.canEdit}
                  className={`rounded-xl border border-moss/40 px-3 py-2 text-left text-sm disabled:opacity-60 ${active ? "bg-pine text-paper" : "bg-paper"}`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">Intention Entry (required, max 50 words)</label>
            <textarea
              className="w-full rounded-xl border border-moss/40 bg-paper px-3 py-2"
              rows={4}
              value={discussionEntryOne}
              disabled={!setupData?.canEdit}
              onChange={(e) => setDiscussionEntryOne(e.target.value)}
              placeholder="What’s been on your mind lately? Anything—ideas, questions, feelings, or even a recent dream."
            />
            <p className="mt-1 text-xs text-moss">{wordCount(discussionEntryOne)}/50 words</p>
          </div>

          {showSecondEntry ? (
            <div>
              <label className="mb-1 block text-sm">Intention Entry 2 (optional, max 50 words)</label>
              <textarea
                className="w-full rounded-xl border border-moss/40 bg-paper px-3 py-2"
                rows={4}
                value={discussionEntryTwo}
                disabled={!setupData?.canEdit}
                onChange={(e) => setDiscussionEntryTwo(e.target.value)}
                placeholder="What else are you quietly thinking about this week?"
              />
              <p className="mt-1 text-xs text-moss">{wordCount(discussionEntryTwo)}/50 words</p>
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-moss/40 px-4 py-2 text-sm disabled:opacity-60"
              onClick={() => setShowSecondEntry(true)}
              disabled={!setupData?.canEdit}
            >
              <span className="text-base leading-none">+</span>
              Add another intention entry
            </button>
          )}
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={submit} disabled={isSaving || !setupData?.canEdit}>
            {isSaving ? "Saving..." : setupData?.canEdit ? "Save Weekly Setup" : "Setup Locked"}
          </Button>
          <a href="/status" className="inline-flex items-center rounded-full border border-moss/40 px-4 py-2 text-sm">Go to Status</a>
          <a href="/history" className="inline-flex items-center rounded-full border border-moss/40 px-4 py-2 text-sm">Go to History</a>
        </div>
      </Card>
    </div>
  );
}
