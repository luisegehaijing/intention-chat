"use client";

import { useState } from "react";
import { QuestionStatus, WeeklyQuestion } from "@/lib/types";

interface Props {
  question: WeeklyQuestion;
  value: QuestionStatus | undefined;
  onChange: (status: QuestionStatus) => void;
}

const options: { value: QuestionStatus; label: string; className: string }[] = [
  { value: "excited", label: "Excited", className: "bg-emerald-100 text-emerald-800" },
  { value: "open", label: "Open", className: "bg-amber-100 text-amber-800" },
  { value: "refuse", label: "Prefer not", className: "bg-rose-100 text-rose-800" }
];

export function QuestionCard({ question, value, onChange }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="rounded-2xl border border-moss/15 bg-paper p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-sand px-2 py-0.5 text-xs capitalize text-moss">{question.type}</span>
        <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-moss">Intensity {question.emotionalIntensity}/5</span>
      </div>

      <p className="text-sm text-ink">{question.frontText}</p>

      <button
        type="button"
        onClick={() => setShowDetails((prev) => !prev)}
        className="mt-3 text-xs text-terracotta underline"
      >
        {showDetails ? "Hide details" : "Flip card for details"}
      </button>

      {showDetails ? <p className="mt-2 text-xs text-moss">{question.detailsText}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              value === option.value ? option.className : "bg-sand text-moss"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
