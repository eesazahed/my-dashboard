"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  DayHourHeightPx,
  DayHours,
  FormatCompactTimeRange,
  FormatHourLabel,
  GetScrollToMinutesForDay,
  GetTimedBoundsForDate,
  LayoutTimedEventsForDay,
  SplitDayEvents,
} from "@/lib/day-schedule";
import { GetNowMinutesInTimezone } from "@/lib/timezones";
import { GetEventBarClasses } from "@/lib/link-colors";
import type { DashboardEvent } from "@/lib/types";

type DayScheduleViewProps = {
  displayDate: string;
  todayIso: string;
  clockTimezone: string;
  events: DashboardEvent[];
  onOpenEvent: (event: DashboardEvent) => void;
  onCreateAtTime: (date: string, time: string) => void;
};

export function DayScheduleView({
  displayDate,
  todayIso,
  clockTimezone,
  events,
  onOpenEvent,
  onCreateAtTime,
}: DayScheduleViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { allDay, timed } = useMemo(
    () => SplitDayEvents(events, displayDate),
    [events, displayDate],
  );
  const layouts = useMemo(
    () => LayoutTimedEventsForDay(timed, displayDate),
    [timed, displayDate],
  );
  const gridHeightPx = DayHours * DayHourHeightPx;
  const isToday = displayDate === todayIso;
  const nowMinutes = useMemo(
    () => GetNowMinutesInTimezone(clockTimezone),
    [clockTimezone],
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollMinutes = GetScrollToMinutesForDay(
      displayDate,
      todayIso,
      layouts,
    );
    container.scrollTop = (scrollMinutes / 60) * DayHourHeightPx;
  }, [displayDate, todayIso, layouts]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
      {allDay.length > 0 && (
        <div className="flex shrink-0 border-b border-white/[0.06]">
          <div className="w-16 shrink-0 border-r border-white/[0.05] px-2 py-2 text-[10px] text-zinc-500">
            All day
          </div>
          <div className="flex min-h-[44px] flex-1 flex-wrap gap-1 p-2">
            {allDay.map((event) => (
              <button
                key={event.id}
                type="button"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onOpenEvent(event);
                }}
                className={`truncate rounded px-2 py-1 text-left text-[11px] text-white ${GetEventBarClasses(event.color)}`}
              >
                {event.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex">
          <div
            className="relative w-16 shrink-0 border-r border-white/[0.05]"
            style={{ height: gridHeightPx }}
          >
            {Array.from({ length: DayHours }, (_, hour) => (
              <div
                key={hour}
                className="relative border-b border-white/[0.04]"
                style={{ height: DayHourHeightPx }}
              >
                <span className="absolute -top-2.5 right-2 text-[10px] tabular-nums text-zinc-500">
                  {FormatHourLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          <div className="relative flex-1" style={{ height: gridHeightPx }}>
            {Array.from({ length: DayHours }, (_, hour) => (
              <div
                key={hour}
                role="button"
                tabIndex={0}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  onCreateAtTime(
                    displayDate,
                    `${String(hour).padStart(2, "0")}:00`,
                  );
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onCreateAtTime(
                      displayDate,
                      `${String(hour).padStart(2, "0")}:00`,
                    );
                  }
                }}
                className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                style={{ height: DayHourHeightPx }}
              />
            ))}

            {isToday && (
              <div
                className="pointer-events-none absolute right-0 left-0 z-20"
                style={{ top: (nowMinutes / 60) * DayHourHeightPx }}
              >
                <div className="relative">
                  <div className="absolute -left-1.5 size-2.5 rounded-full bg-red-500" />
                  <div className="h-0.5 bg-red-500" />
                </div>
              </div>
            )}

            {layouts.map((layout) => {
              const bounds = GetTimedBoundsForDate(layout.event, displayDate);
              const widthPercent = 100 / layout.columnCount;
              const leftPercent = layout.column * widthPercent;

              return (
                <button
                  key={layout.event.id}
                  type="button"
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    onOpenEvent(layout.event);
                  }}
                  className={`absolute z-10 overflow-hidden rounded-md border border-white/10 px-2 py-1 text-left text-white shadow-sm transition hover:brightness-110 ${GetEventBarClasses(layout.event.color)}`}
                  style={{
                    top: layout.topPx,
                    height: layout.heightPx,
                    left: `calc(${leftPercent}% + 4px)`,
                    width: `calc(${widthPercent}% - 8px)`,
                  }}
                >
                  <p className="truncate text-xs font-medium leading-tight">
                    {layout.event.title}
                  </p>
                  {bounds && layout.heightPx >= DayHourHeightPx * 0.45 ? (
                    <p className="mt-0.5 truncate text-[10px] opacity-90">
                      {FormatCompactTimeRange(
                        bounds.startMinutes,
                        bounds.endMinutes,
                      )}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
