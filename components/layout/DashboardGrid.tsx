"use client";

import { Header } from "@/components/layout/Header";
import { ThoughtDumpBar } from "@/components/layout/ThoughtDumpBar";
import { AgendaPanel } from "@/components/panels/AgendaPanel";
import { CalendarPanel } from "@/components/panels/CalendarPanel";
import { HabitsPanel } from "@/components/panels/HabitsPanel";
import { PortfolioPanel } from "@/components/panels/PortfolioPanel";
import { QuickLinksPanel } from "@/components/panels/QuickLinksPanel";
import { EditableWidgetPanel } from "@/components/panels/EditableWidgetPanel";
import { Button } from "@/components/ui/Button";
import { useDashboard } from "@/context/DashboardContext";

export function DashboardGrid() {
  const { ready, loadError, retryLoad } = useDashboard();

  if (loadError) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1400px] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-zinc-300">Could not load your dashboard data.</p>
        <p className="max-w-md text-sm text-zinc-500">{loadError}</p>
        <Button onClick={retryLoad}>Try again</Button>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1400px] items-center justify-center px-4">
        <p className="text-zinc-500">Loading dashboard…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1400px] flex-1 px-4 py-5 lg:px-8 lg:py-6">
      <Header />
      <ThoughtDumpBar />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-[640px_640px] lg:gap-4">
        <div className="order-2 flex min-h-0 flex-col lg:order-none lg:col-span-3 lg:row-start-1 lg:h-full">
          <AgendaPanel />
        </div>
        <div className="order-1 flex min-h-0 flex-col lg:order-none lg:col-span-6 lg:row-start-1 lg:h-full">
          <CalendarPanel />
        </div>
        <div className="order-3 flex min-h-0 flex-col lg:order-none lg:col-span-3 lg:row-start-1 lg:h-full">
          <HabitsPanel />
        </div>

        <div className="order-5 flex min-h-0 flex-col lg:order-none lg:col-span-3 lg:row-start-2 lg:h-full">
          <QuickLinksPanel />
        </div>

        <div className="order-4 flex min-h-0 flex-col lg:order-none lg:col-span-6 lg:row-start-2 lg:h-full">
          <EditableWidgetPanel />
        </div>

        <div className="order-6 flex min-h-0 flex-col lg:order-none lg:col-span-3 lg:row-start-2 lg:h-full">
          <PortfolioPanel />
        </div>
      </div>
    </main>
  );
}
