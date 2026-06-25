import { formatIsoDate, parseIsoDate } from "@/lib/date-utils";
import { GetEventEndDate } from "@/lib/event-utils";
import { ExpandAllEventOccurrences } from "@/lib/recurrence-utils";
import { ResolveTimezone } from "@/lib/timezones";
import type { DashboardEvent } from "@/lib/types";

function EscapeIcalText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function FoldIcalLine(line: string): string {
  const chunks: string[] = [];
  let remaining = line;

  while (remaining.length > 75) {
    chunks.push(remaining.slice(0, 75));
    remaining = ` ${remaining.slice(75)}`;
  }

  chunks.push(remaining);
  return chunks.join("\r\n");
}

function FormatIcalTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    "T",
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
    pad(date.getUTCSeconds()),
    "Z",
  ].join("");
}

function FormatIcalDate(isoDate: string): string {
  return isoDate.replace(/-/g, "");
}

function FormatIcalLocalDateTime(isoDate: string, time: string): string {
  const [hours, minutes] = time.split(":");
  const safeHours = String(parseInt(hours ?? "0", 10)).padStart(2, "0");
  const safeMinutes = String(parseInt(minutes ?? "0", 10)).padStart(2, "0");
  return `${FormatIcalDate(isoDate)}T${safeHours}${safeMinutes}00`;
}

function AddDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return formatIsoDate(date);
}

function BuildEventUid(event: DashboardEvent, origin: string): string {
  return `${event.id}@${origin}`;
}

function BuildEventLines(
  event: DashboardEvent,
  origin: string,
  timezone: string,
): string[] {
  const lines: string[] = [];
  const uid = BuildEventUid(event, origin);
  const summary = EscapeIcalText(event.title);
  const endDate = GetEventEndDate(event);
  const isAllDay = !event.time;
  const isMultiDay = endDate > event.date;
  const stamp = FormatIcalTimestamp(new Date());

  lines.push("BEGIN:VEVENT");
  lines.push(FoldIcalLine(`UID:${uid}`));
  lines.push(FoldIcalLine(`DTSTAMP:${stamp}`));
  lines.push(FoldIcalLine(`LAST-MODIFIED:${stamp}`));
  lines.push(FoldIcalLine(`SEQUENCE:1`));
  lines.push(FoldIcalLine(`SUMMARY:${summary}`));

  if (isAllDay) {
    lines.push(FoldIcalLine(`DTSTART;VALUE=DATE:${FormatIcalDate(event.date)}`));
    const exclusiveEnd = isMultiDay ? AddDays(endDate, 1) : AddDays(event.date, 1);
    lines.push(FoldIcalLine(`DTEND;VALUE=DATE:${FormatIcalDate(exclusiveEnd)}`));
  } else if (timezone === "UTC") {
    lines.push(
      FoldIcalLine(
        `DTSTART:${FormatIcalLocalDateTime(event.date, event.time ?? "00:00")}Z`,
      ),
    );
    const endTime = event.endTime ?? event.time ?? "00:00";
    const endDateTime = event.endDate ?? event.date;
    lines.push(
      FoldIcalLine(`DTEND:${FormatIcalLocalDateTime(endDateTime, endTime)}Z`),
    );
  } else {
    lines.push(
      FoldIcalLine(
        `DTSTART;TZID=${timezone}:${FormatIcalLocalDateTime(event.date, event.time ?? "00:00")}`,
      ),
    );
    const endTime = event.endTime ?? event.time ?? "00:00";
    const endDateTime = event.endDate ?? event.date;
    lines.push(
      FoldIcalLine(
        `DTEND;TZID=${timezone}:${FormatIcalLocalDateTime(endDateTime, endTime)}`,
      ),
    );
  }

  lines.push("END:VEVENT");
  return lines;
}

export function BuildIcsCalendar(
  events: DashboardEvent[],
  origin: string,
  calendarName = "My Dashboard",
  timezone?: string,
): string {
  const resolvedTimezone = ResolveTimezone(timezone);
  const today = formatIsoDate(new Date());
  const from = AddDays(today, -365);
  const to = AddDays(today, 730);
  const expanded = ExpandAllEventOccurrences(events).filter(
    (event) => event.date >= from && event.date <= to,
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//My Dashboard//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    FoldIcalLine(`X-WR-CALNAME:${EscapeIcalText(calendarName)}`),
    FoldIcalLine(`X-WR-TIMEZONE:${resolvedTimezone}`),
    "REFRESH-INTERVAL;VALUE=DURATION:PT15M",
    "X-PUBLISHED-TTL:PT15M",
  ];

  for (const event of expanded) {
    lines.push(...BuildEventLines(event, origin, resolvedTimezone));
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}
