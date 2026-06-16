"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Invalid password");
        setLoading(false);
        return;
      }

      const from = searchParams.get("from") || "/";
      router.replace(from);
      router.refresh();
    } catch {
      setError("Could not sign in");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#191919] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#252525] p-6 shadow-panel">
        <h1 className="text-lg font-semibold text-zinc-50">My dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Enter your password to continue</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#191919]">
          <p className="text-zinc-500">Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
