"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ThoughtDumpBar } from "@/components/layout/ThoughtDumpBar";
import { AgendaPanel } from "@/components/panels/AgendaPanel";
import { CalendarPanel } from "@/components/panels/CalendarPanel";
import { HabitsPanel } from "@/components/panels/HabitsPanel";
import { PortfolioPanel } from "@/components/panels/PortfolioPanel";
import { QuickLinksPanel } from "@/components/panels/QuickLinksPanel";
import { EditableWidgetPanel } from "@/components/panels/EditableWidgetPanel";
import { useDashboard } from "@/context/DashboardContext";

const PanelTransition =
  "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]";

export function DashboardGrid() {
  const { ready } = useDashboard();
  const [CalendarFullscreen, SetCalendarFullscreen] = useState(false);

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-[1400px] items-center justify-center px-4">
        <p className="text-zinc-500">Loading dashboard…</p>
      </main>
    );
  }

  const toggleCalendarFullscreen = () => {
    SetCalendarFullscreen((value) => !value);
  };

  return (
    <main
      className={`mx-auto max-w-[1400px] flex-1 px-4 py-5 lg:px-8 lg:py-6 ${
        CalendarFullscreen ? "relative" : ""
      }`}
    >
      <div
        className={`${PanelTransition} ${
          CalendarFullscreen
            ? "pointer-events-none max-h-0 -translate-y-4 overflow-hidden opacity-0"
            : "max-h-[500px] translate-y-0 opacity-100"
        }`}
      >
        <Header />
        <ThoughtDumpBar />
      </div>

      <div
        className={`grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-4 ${
          CalendarFullscreen
            ? "lg:grid-rows-1 lg:min-h-[calc(100vh-3rem)]"
            : "lg:grid-rows-[640px_640px]"
        }`}
      >
        <div
          className={`order-2 flex min-h-0 flex-col lg:order-none lg:col-span-3 lg:row-start-1 lg:h-full ${PanelTransition} ${
            CalendarFullscreen
              ? "pointer-events-none max-h-0 -translate-x-16 overflow-hidden opacity-0 lg:col-span-0 lg:max-h-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          <AgendaPanel />
        </div>

        <div
          className={`order-1 flex min-h-0 flex-col lg:order-none lg:row-start-1 ${PanelTransition} ${
            CalendarFullscreen
              ? "fixed inset-0 z-50 bg-[#191919] p-4 lg:p-6"
              : "lg:col-span-6 lg:h-full"
          }`}
        >
          <CalendarPanel
            fullscreen={CalendarFullscreen}
            onToggleFullscreen={toggleCalendarFullscreen}
          />
        </div>

        <div
          className={`order-3 flex min-h-0 flex-col lg:order-none lg:col-span-3 lg:row-start-1 lg:h-full ${PanelTransition} ${
            CalendarFullscreen
              ? "pointer-events-none max-h-0 translate-x-16 overflow-hidden opacity-0 lg:col-span-0 lg:max-h-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          <HabitsPanel />
        </div>

        <div
          className={`order-5 flex min-h-0 flex-col lg:order-none lg:col-span-3 lg:row-start-2 lg:h-full ${PanelTransition} ${
            CalendarFullscreen
              ? "pointer-events-none max-h-0 -translate-x-12 translate-y-12 overflow-hidden opacity-0 lg:col-span-0 lg:max-h-0"
              : "translate-x-0 translate-y-0 opacity-100"
          }`}
        >
          <QuickLinksPanel />
        </div>

        <div
          className={`order-4 flex min-h-0 flex-col lg:order-none lg:col-span-6 lg:row-start-2 lg:h-full ${PanelTransition} ${
            CalendarFullscreen
              ? "pointer-events-none max-h-0 translate-y-16 overflow-hidden opacity-0 lg:col-span-0 lg:max-h-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <EditableWidgetPanel />
        </div>

        <div
          className={`order-6 flex min-h-0 flex-col lg:order-none lg:col-span-3 lg:row-start-2 lg:h-full ${PanelTransition} ${
            CalendarFullscreen
              ? "pointer-events-none max-h-0 translate-x-12 translate-y-12 overflow-hidden opacity-0 lg:col-span-0 lg:max-h-0"
              : "translate-x-0 translate-y-0 opacity-100"
          }`}
        >
          <PortfolioPanel />
        </div>
      </div>
    </main>
  );
}
