export const CalendarDragMime = "application/x-dashboard-calendar-event";

export type CalendarDragPayload = {
  eventId: string;
  fromIso: string;
};

export function EncodeCalendarDragPayload(payload: CalendarDragPayload): string {
  return JSON.stringify(payload);
}

export function DecodeCalendarDragPayload(
  dataTransfer: DataTransfer,
): CalendarDragPayload | null {
  const raw =
    dataTransfer.getData(CalendarDragMime) ||
    dataTransfer.getData("text/plain");

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as CalendarDragPayload;
    if (!parsed.eventId || !parsed.fromIso) return null;
    return parsed;
  } catch {
    return null;
  }
}
