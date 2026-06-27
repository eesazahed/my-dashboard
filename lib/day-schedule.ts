import type { DashboardEvent } from "@/lib/types";
import { GetEventEndDate } from "@/lib/event-utils";

export const DayHourHeightPx = 56;
export const DayHours = 24;

export type TimedEventLayout = {
  event: DashboardEvent;
  topPx: number;
  heightPx: number;
  column: number;
  columnCount: number;
};

export function FormatHourLabel(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function FormatCompactTimeRange(
  startMinutes: number,
  endMinutes: number,
): string {
  const format = (totalMinutes: number) => {
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period = hours24 < 12 ? "am" : "pm";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return minutes === 0
      ? `${hours12}${period}`
      : `${hours12}:${String(minutes).padStart(2, "0")}${period}`;
  };

  return `${format(startMinutes)} – ${format(endMinutes)}`;
}

export function TimeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => parseInt(part, 10));
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function IsAllDayOnDate(
  event: DashboardEvent,
  displayDate: string,
): boolean {
  if (event.type === "task") return true;
  if (!event.time) return true;
  return false;
}

export function GetTimedBoundsForDate(
  event: DashboardEvent,
  displayDate: string,
): { startMinutes: number; endMinutes: number } | null {
  if (IsAllDayOnDate(event, displayDate)) return null;
  if (!event.time) return null;

  const startMinutes = TimeStringToMinutes(event.time);
  let endMinutes = event.endTime
    ? TimeStringToMinutes(event.endTime)
    : startMinutes + 60;

  const endDate = GetEventEndDate(event);
  if (endDate > displayDate) {
    endMinutes = DayHours * 60;
  } else if (endDate < displayDate) {
    return null;
  }

  if (endMinutes <= startMinutes) {
    endMinutes = Math.min(startMinutes + 60, DayHours * 60);
  }

  endMinutes = Math.min(endMinutes, DayHours * 60);
  return { startMinutes, endMinutes };
}

function EventsOverlap(
  left: { startMinutes: number; endMinutes: number },
  right: { startMinutes: number; endMinutes: number },
): boolean {
  return (
    left.startMinutes < right.endMinutes && right.startMinutes < left.endMinutes
  );
}

export function LayoutTimedEventsForDay(
  events: DashboardEvent[],
  displayDate: string,
  hourHeightPx = DayHourHeightPx,
): TimedEventLayout[] {
  const entries = events
    .map((event) => {
      const bounds = GetTimedBoundsForDate(event, displayDate);
      if (!bounds) return null;

      const durationMinutes = Math.max(
        bounds.endMinutes - bounds.startMinutes,
        15,
      );

      return {
        event,
        startMinutes: bounds.startMinutes,
        endMinutes: bounds.startMinutes + durationMinutes,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry != null)
    .sort((left, right) => left.startMinutes - right.startMinutes);

  const layouts: TimedEventLayout[] = [];
  const active: Array<{
    layoutIndex: number;
    startMinutes: number;
    endMinutes: number;
    column: number;
  }> = [];

  for (const entry of entries) {
    const stillActive = active.filter(
      (item) => item.endMinutes > entry.startMinutes,
    );
    active.length = 0;
    active.push(...stillActive);

    const usedColumns = new Set(stillActive.map((item) => item.column));
    let column = 0;
    while (usedColumns.has(column)) column += 1;

    const layoutIndex = layouts.length;
    layouts.push({
      event: entry.event,
      topPx: (entry.startMinutes / 60) * hourHeightPx,
      heightPx: Math.max(
        ((entry.endMinutes - entry.startMinutes) / 60) * hourHeightPx,
        hourHeightPx * 0.35,
      ),
      column,
      columnCount: 1,
    });

    active.push({
      layoutIndex,
      startMinutes: entry.startMinutes,
      endMinutes: entry.endMinutes,
      column,
    });

    const cluster = active.filter((item) =>
      EventsOverlap(
        { startMinutes: entry.startMinutes, endMinutes: entry.endMinutes },
        { startMinutes: item.startMinutes, endMinutes: item.endMinutes },
      ),
    );

    const columnCount = Math.max(...cluster.map((item) => item.column), 0) + 1;
    for (const item of cluster) {
      layouts[item.layoutIndex].columnCount = columnCount;
    }
  }

  return layouts;
}

export function SplitDayEvents(
  events: DashboardEvent[],
  displayDate: string,
): { allDay: DashboardEvent[]; timed: DashboardEvent[] } {
  const allDay: DashboardEvent[] = [];
  const timed: DashboardEvent[] = [];

  for (const event of events) {
    if (IsAllDayOnDate(event, displayDate)) {
      allDay.push(event);
    } else {
      timed.push(event);
    }
  }

  return { allDay, timed };
}

export function GetScrollToMinutesForDay(
  displayDate: string,
  todayIso: string,
  layouts: TimedEventLayout[],
): number {
  if (layouts.length > 0) {
    return Math.max(0, layouts[0].topPx / DayHourHeightPx - 1) * 60;
  }

  if (displayDate === todayIso) {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() - 60;
  }

  return 8 * 60;
}
