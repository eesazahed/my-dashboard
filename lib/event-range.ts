import { formatIsoDate, parseIsoDate } from "@/lib/date-utils";
import type { DashboardEvent } from "@/lib/types";

export function GetEventRangeBuffer(
  reference: Date,
  bufferDays = 7,
): { from: string; to: string } {
  const year = reference.getFullYear();
  const month = reference.getMonth();
  const from = new Date(year, month, 1);
  from.setDate(from.getDate() - bufferDays);
  const to = new Date(year, month + 1, 0);
  to.setDate(to.getDate() + bufferDays);
  return {
    from: formatIsoDate(from),
    to: formatIsoDate(to),
  };
}

export function GetWeekEventRange(
  referenceIso: string,
  bufferDays = 3,
): { from: string; to: string } {
  const reference = parseIsoDate(referenceIso);
  const sunday = new Date(reference);
  sunday.setDate(reference.getDate() - reference.getDay());
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  sunday.setDate(sunday.getDate() - bufferDays);
  saturday.setDate(saturday.getDate() + bufferDays);
  return {
    from: formatIsoDate(sunday),
    to: formatIsoDate(saturday),
  };
}

export function MergeBaseEvents(
  existing: DashboardEvent[],
  incoming: DashboardEvent[],
): DashboardEvent[] {
  const map = new Map(existing.map((event) => [event.id, event]));
  for (const event of incoming) {
    map.set(event.id, event);
  }
  return Array.from(map.values());
}

export function RangeKey(from: string, to: string): string {
  return `${from}:${to}`;
}
