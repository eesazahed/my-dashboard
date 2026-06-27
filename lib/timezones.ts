export const DefaultTimezone = "America/Chicago";

/** Event date/time strings in SQLite are wall-clock values in this zone. */
export const EventsTimezone = DefaultTimezone;

/** Default time when creating a new timed event (stored in EventsTimezone). */
export const DefaultEventStorageTime = "17:00";

export function GetEventsTimezone(): string {
  return EventsTimezone;
}

export const TimezoneOptions = [
  { id: "America/Chicago", label: "Central Time (CST/CDT)" },
  { id: "America/New_York", label: "Eastern Time (EST/EDT)" },
  { id: "America/Denver", label: "Mountain Time (MST/MDT)" },
  { id: "America/Los_Angeles", label: "Pacific Time (PST/PDT)" },
  { id: "America/Phoenix", label: "Arizona (MST, no DST)" },
  { id: "America/Anchorage", label: "Alaska Time (AKST/AKDT)" },
  { id: "Pacific/Honolulu", label: "Hawaii Time (HST)" },
  { id: "UTC", label: "UTC" },
  { id: "Europe/London", label: "London (GMT/BST)" },
  { id: "Europe/Paris", label: "Central Europe (CET/CEST)" },
  { id: "Asia/Dubai", label: "Gulf (GST)" },
  { id: "Asia/Kolkata", label: "India (IST)" },
  { id: "Asia/Tokyo", label: "Japan (JST)" },
  { id: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
] as const;

export type TimezoneId = (typeof TimezoneOptions)[number]["id"];

export function ResolveTimezone(timezone?: string): string {
  const match = TimezoneOptions.find((option) => option.id === timezone);
  return match?.id ?? DefaultTimezone;
}

export function GetTimezoneLabel(timezone?: string): string {
  const resolved = ResolveTimezone(timezone);
  return (
    TimezoneOptions.find((option) => option.id === resolved)?.label ??
    DefaultTimezone
  );
}

export function GetNowMinutesInTimezone(timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = parseInt(
    parts.find((part) => part.type === "hour")?.value ?? "0",
    10,
  );
  const minute = parseInt(
    parts.find((part) => part.type === "minute")?.value ?? "0",
    10,
  );

  return hour * 60 + minute;
}
