"use client";

import { useDashboard } from "@/context/DashboardContext";
import { Panel } from "@/components/ui/Panel";
import { NewsFeedWidget } from "@/components/widgets/NewsFeedWidget";
import { NotesWidget } from "@/components/widgets/NotesWidget";
import { PomodoroWidget } from "@/components/widgets/PomodoroWidget";
import { WatchlistWidget } from "@/components/widgets/WatchlistWidget";
import type { EditableWidgetType } from "@/lib/types";

const WidgetMeta: Record<
  EditableWidgetType,
  { title: string; subtitle: string }
> = {
  news: { title: "", subtitle: "" },
  watchlist: { title: "Watchlist", subtitle: "Coming soon" },
  notes: { title: "Notes", subtitle: "Coming soon" },
  pomodoro: { title: "Pomodoro", subtitle: "Coming soon" },
};

export function EditableWidgetPanel() {
  const { settings } = useDashboard();
  const meta = WidgetMeta[settings.activeWidget] ?? WidgetMeta.news;
  const isNews = settings.activeWidget === "news";

  const renderWidget = () => {
    switch (settings.activeWidget) {
      case "news":
        return <NewsFeedWidget />;
      case "watchlist":
        return <WatchlistWidget />;
      case "notes":
        return <NotesWidget />;
      case "pomodoro":
        return <PomodoroWidget />;
      default:
        return <NewsFeedWidget />;
    }
  };

  if (isNews) {
    return (
      <Panel hideHeader fillHeight noPadding className="h-full">
        {renderWidget()}
      </Panel>
    );
  }

  return (
    <Panel title={meta.title} subtitle={meta.subtitle} className="min-h-[200px]">
      {renderWidget()}
    </Panel>
  );
}
