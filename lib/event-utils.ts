import type { EventFormState } from "@/components/events/EventEditorModal";
import { formatIsoDate, parseIsoDate } from "@/lib/date-utils";
import { BuildRecurrenceUntil } from "@/lib/recurrence-utils";
import type { DashboardEvent, EventRecurrence } from "@/lib/types";

export type EventSpanPosition = "start" | "middle" | "end";

export function GetEventEndDate(event: DashboardEvent): string {
  return event.endDate ?? event.date;
}

export function IsMultiDayEvent(event: DashboardEvent): boolean {
  return GetEventEndDate(event) > event.date;
}

export function GetEventSpanDates(event: DashboardEvent): string[] {
  const endIso = GetEventEndDate(event);
  const dates: string[] = [];
  const current = parseIsoDate(event.date);
  const end = parseIsoDate(endIso);

  while (current <= end) {
    dates.push(formatIsoDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function EventOccursOnDate(
  event: DashboardEvent,
  dateStr: string,
): boolean {
  return dateStr >= event.date && dateStr <= GetEventEndDate(event);
}

export function GetEventSpanPosition(
  event: DashboardEvent,
  dateStr: string,
): EventSpanPosition | null {
  if (!IsMultiDayEvent(event)) return null;
  if (!EventOccursOnDate(event, dateStr)) return null;

  const endIso = GetEventEndDate(event);
  if (dateStr === event.date) return "start";
  if (dateStr === endIso) return "end";
  return "middle";
}

export function GetMultiDayLaneMap(
  events: DashboardEvent[],
): Record<string, number> {
  const multiDay = events
    .filter(IsMultiDayEvent)
    .sort((left, right) => left.date.localeCompare(right.date));

  const laneEndDates: string[] = [];
  const lanes: Record<string, number> = {};

  for (const event of multiDay) {
    const endIso = GetEventEndDate(event);
    let lane = laneEndDates.findIndex((laneEnd) => laneEnd < event.date);

    if (lane === -1) {
      lane = laneEndDates.length;
      laneEndDates.push(endIso);
    } else {
      laneEndDates[lane] = endIso;
    }

    lanes[event.id] = lane;
  }

  return lanes;
}

function BuildRecurrenceFromForm(form: EventFormState): EventRecurrence | undefined {
  if (form.type === "task" || !form.recurring) return undefined;

  const weeks = Math.max(1, parseInt(form.recurrenceWeeks, 10) || 1);
  const startWeekday = parseIsoDate(form.date).getDay();

  return {
    frequency: form.recurrenceFrequency,
    weekdays:
      form.recurrenceFrequency === "weekly"
        ? form.recurrenceWeekdays.length > 0
          ? form.recurrenceWeekdays
          : [startWeekday]
        : undefined,
    until: BuildRecurrenceUntil(form.date, weeks),
  };
}

export function NormalizeEventTiming(
  form: EventFormState,
): Pick<DashboardEvent, "date" | "time" | "endDate" | "endTime"> {
  const date = form.date;
  const time = form.time.trim() || undefined;

  if (form.type === "task") {
    return { date, time };
  }

  const endDate = form.endDate.trim();
  const endTime = form.endTime.trim();

  if (!endDate) {
    return { date, time };
  }

  if (endDate < date) {
    return { date, time, endDate: date, endTime: endTime || undefined };
  }

  return {
    date,
    time,
    endDate,
    endTime: endTime || undefined,
  };
}

export function CreateEventFromForm(
  form: EventFormState,
  id: string,
): DashboardEvent {
  const timing = NormalizeEventTiming(form);
  const recurrence = BuildRecurrenceFromForm(form);

  return {
    id,
    title: form.title.trim(),
    type: form.type,
    completed: form.type === "task" ? false : undefined,
    recurrence,
    color: form.color,
    ...timing,
  };
}

export function UpdateEventFromForm(
  event: DashboardEvent,
  form: EventFormState,
): DashboardEvent {
  const timing = NormalizeEventTiming(form);
  const recurrence = BuildRecurrenceFromForm(form);

  return {
    ...event,
    title: form.title.trim(),
    type: form.type,
    time: timing.time,
    date: timing.date,
    endDate: timing.endDate,
    endTime: timing.endTime,
    recurrence,
    color: form.color,
    completed: form.type === "task" ? (event.completed ?? false) : undefined,
  };
}

export function CompareEventsBySchedule(
  left: DashboardEvent,
  right: DashboardEvent,
): number {
  const leftStart = `${left.date}T${left.time ?? "00:00"}`;
  const rightStart = `${right.date}T${right.time ?? "00:00"}`;
  return leftStart.localeCompare(rightStart);
}

export function InferRecurrenceWeeks(
  startDate: string,
  until?: string,
): string {
  if (!until) return "4";

  const start = parseIsoDate(startDate);
  const end = parseIsoDate(until);
  const days =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return String(Math.max(1, Math.ceil(days / 7)));
}

export function GetDayOffset(fromIso: string, toIso: string): number {
  const from = parseIsoDate(fromIso);
  const to = parseIsoDate(toIso);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function ShiftEventDates(
  event: DashboardEvent,
  dayOffset: number,
): DashboardEvent {
  if (dayOffset === 0) return event;

  const shiftIso = (iso: string) => {
    const date = parseIsoDate(iso);
    date.setDate(date.getDate() + dayOffset);
    return formatIsoDate(date);
  };

  const next: DashboardEvent = {
    ...event,
    date: shiftIso(event.date),
  };

  if (event.endDate) {
    next.endDate = shiftIso(event.endDate);
  }

  if (event.recurrence?.until) {
    next.recurrence = {
      ...event.recurrence,
      until: shiftIso(event.recurrence.until),
    };
  }

  return next;
}

export function MoveEventOccurrenceToDate(
  event: DashboardEvent,
  occurrenceIso: string,
  targetIso: string,
): DashboardEvent {
  return ShiftEventDates(event, GetDayOffset(occurrenceIso, targetIso));
}
