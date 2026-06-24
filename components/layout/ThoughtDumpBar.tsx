"use client";

import { IconNotes } from "@tabler/icons-react";
import { useDashboard } from "@/context/DashboardContext";

export function ThoughtDumpBar() {
  const { thoughtDump, setThoughtDump } = useDashboard();

  return (
    <section className="panel mb-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#252525] shadow-panel lg:mb-6">
      <div className="flex items-center gap-2 border-b border-white/[0.05] px-5 py-3">
        <IconNotes size={16} className="text-zinc-500" />
        <h2 className="text-sm font-medium text-zinc-300">Thought dump</h2>
        <span className="ml-auto text-[11px] text-zinc-600">Auto-saves</span>
      </div>
      <textarea
        value={thoughtDump}
        onChange={(e) => setThoughtDump(e.target.value)}
        placeholder="Jot down ideas, tasks, reminders — anything on your mind…"
        rows={3}
        className="thought-dump-textarea w-full resize-y overflow-y-auto bg-transparent px-5 py-4 text-sm leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-600"
      />
    </section>
  );
}
