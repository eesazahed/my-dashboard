"use client";

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { CalendarPanel } from "@/components/panels/CalendarPanel";
import { useDashboard } from "@/context/DashboardContext";

export default function CalendarPage() {
  const { ready } = useDashboard();

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loading calendar…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col p-4 lg:p-6">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/"
          className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100"
          aria-label="Back to dashboard"
        >
          <IconArrowLeft size={18} />
        </Link>
        <h1 className="text-lg font-semibold text-zinc-100">Calendar</h1>
      </div>
      <div className="min-h-0 flex-1">
        <CalendarPanel />
      </div>
    </main>
  );
}
