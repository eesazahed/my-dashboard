import type { DashboardEvent, EventRecurrence } from "@/lib/types";
import { formatIsoDate, parseIsoDate } from "@/lib/date-utils";

export function ParseBaseEventId(id: string): string {
  return id.split("@")[0] ?? id;
}

export function BuildOccurrenceId(baseId: string, date: string): string {
  return `${baseId}@${date}`;
}

function ShiftEndDate(
  baseStart: string,
  baseEnd: string | undefined,
  occurrenceStart: string,
): string | undefined {
  if (!baseEnd || baseEnd <= baseStart) return undefined;

  const start = parseIsoDate(baseStart);
  const end = parseIsoDate(baseEnd);
  const offsetDays = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );

  const shifted = parseIsoDate(occurrenceStart);
  shifted.setDate(shifted.getDate() + offsetDays);
  return formatIsoDate(shifted);
}

function OccurrenceMatchesRecurrence(
  date: Date,
  recurrence: EventRecurrence,
): boolean {
  const weekday = date.getDay();

  if (recurrence.frequency === "daily") {
    return true;
  }

  const weekdays =
    recurrence.weekdays && recurrence.weekdays.length > 0
      ? recurrence.weekdays
      : [weekday];

  return weekdays.includes(weekday);
}

export function ExpandEventOccurrences(event: DashboardEvent): DashboardEvent[] {
  if (event.type === "task" || !event.recurrence) {
    return [event];
  }

  const occurrences: DashboardEvent[] = [];
  const start = parseIsoDate(event.date);
  const until = parseIsoDate(event.recurrence.until);
  const cursor = new Date(start);

  while (cursor <= until) {
    if (OccurrenceMatchesRecurrence(cursor, event.recurrence)) {
      const iso = formatIsoDate(cursor);
      occurrences.push({
        ...event,
        id: BuildOccurrenceId(event.id, iso),
        date: iso,
        endDate: ShiftEndDate(event.date, event.endDate, iso),
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return occurrences.length > 0 ? occurrences : [event];
}

export function ExpandAllEventOccurrences(
  events: DashboardEvent[],
): DashboardEvent[] {
  return events.flatMap(ExpandEventOccurrences);
}

export function BuildRecurrenceUntil(startDate: string, weeks: number): string {
  const start = parseIsoDate(startDate);
  const until = new Date(start);
  until.setDate(until.getDate() + Math.max(1, weeks) * 7 - 1);
  return formatIsoDate(until);
}

export const WeekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
