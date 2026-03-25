"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Mode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          router.replace("/setup");
        }
      })
      .catch(() => undefined);
  }, [router]);

  async function submit() {
    setError("");
    const normalized = email.trim().toLowerCase();

    if (!normalized.endsWith(".edu")) {
      return setError("Use your school email (.edu).");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (mode === "register" && password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalized,
        password
      })
    });
    const payload = await res.json();

    if (!res.ok) {
      setError(payload.error ?? "Could not continue.");
      setLoading(false);
      return;
    }

    router.push("/setup");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card className="p-6 space-y-4">
        <h1 className="text-xl font-serif sm:text-3xl">Synchria Account</h1>
        <p className="text-sm text-moss">Create your account to keep weekly setup, status, and history private.</p>

        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-full border px-4 py-1.5 text-sm ${mode === "login" ? "bg-pine text-paper" : ""}`}
            onClick={() => setMode("login")}
          >
            Log In
          </button>
          <button
            type="button"
            className={`rounded-full border px-4 py-1.5 text-sm ${mode === "register" ? "bg-pine text-paper" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm">School Email</label>
            <input
              className="w-full rounded-xl border border-moss/40 bg-paper px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-moss/40 bg-paper px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>

          {mode === "register" ? (
            <div>
              <label className="mb-1 block text-sm">Confirm Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-moss/40 bg-paper px-3 py-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}

        <Button onClick={submit} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
        </Button>
      </Card>
    </div>
  );
}
