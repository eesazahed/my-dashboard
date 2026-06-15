import type { DashboardEvent } from "./types";
import { formatIsoDate, parseIsoDate } from "./date-utils";
import { ExpandAllEventOccurrences } from "./recurrence-utils";
import { GetEventSpanDates as GetSingleEventSpanDates } from "./event-utils";

export type CalendarView = "month" | "week" | "day";

export type CalendarCell = {
  date: Date;
  iso: string;
  isCurrentMonth: boolean;
  isToday: boolean;
};

const WeekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getWeekdayLabels(): string[] {
  return WeekdayLabels;
}

export function getMonthCells(viewDate: Date, todayIso: string): CalendarCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);

  let startPad = firstDay.getDay();

  const start = new Date(firstDay);
  start.setDate(start.getDate() - startPad);

  const cells: CalendarCell[] = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = formatIsoDate(date);
    cells.push({
      date,
      iso,
      isCurrentMonth: date.getMonth() === month,
      isToday: iso === todayIso,
    });
  }

  return cells;
}

export function getWeekCells(referenceIso: string, todayIso: string): CalendarCell[] {
  const reference = parseIsoDate(referenceIso);
  const sunday = new Date(reference);
  sunday.setDate(reference.getDate() - reference.getDay());
  sunday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    const iso = formatIsoDate(date);
    return {
      date,
      iso,
      isCurrentMonth: true,
      isToday: iso === todayIso,
    };
  });
}

export function formatMonthTitle(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function formatWeekTitle(referenceIso: string): string {
  const cells = getWeekCells(referenceIso, referenceIso);
  const start = cells[0].date;
  const end = cells[6].date;
  const sameMonth = start.getMonth() === end.getMonth();

  if (sameMonth) {
    return `${start.toLocaleDateString(undefined, { month: "short" })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }

  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

export function formatDayTitle(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function groupEventsByDate(
  events: DashboardEvent[],
): Record<string, DashboardEvent[]> {
  const grouped: Record<string, DashboardEvent[]> = {};

  for (const event of ExpandAllEventOccurrences(events)) {
    for (const iso of GetSingleEventSpanDates(event)) {
      if (!grouped[iso]) grouped[iso] = [];
      grouped[iso].push(event);
    }
  }

  return grouped;
}

export function shiftViewDate(
  viewDate: Date,
  view: CalendarView,
  direction: -1 | 1,
): Date {
  const next = new Date(viewDate);
  if (view === "month") {
    next.setMonth(next.getMonth() + direction);
  } else if (view === "week") {
    next.setDate(next.getDate() + direction * 7);
  } else {
    next.setDate(next.getDate() + direction);
  }
  return next;
}
