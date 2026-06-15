"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { FormatMilitaryDateTime } from "@/lib/time-utils";

export function Header() {
  const { settings, ready } = useDashboard();
  const [timeLabel, setTimeLabel] = useState("");

  useEffect(() => {
    const update = () => setTimeLabel(FormatMilitaryDateTime(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const displayName = settings.name.trim() || "there";

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-4 lg:mb-5">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
        {ready ? `Good to see you, ${displayName}` : "Dashboard"}
      </h1>

      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <span className="tabular-nums">{timeLabel}</span>
        <span className="text-zinc-700">·</span>
        <Link
          href="/settings"
          className="text-zinc-400 transition hover:text-zinc-200"
        >
          Settings
        </Link>
      </div>
    </header>
  );
}
