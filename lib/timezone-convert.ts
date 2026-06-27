import {
  DefaultEventStorageTime,
  GetEventsTimezone,
} from "@/lib/timezones";
import type { DashboardEvent } from "@/lib/types";

export type ZonedDateTimeParts = {
  date: string;
  time: string;
};

function TimeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => parseInt(part, 10));
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

function MinutesToTimeString(totalMinutes: number): string {
  const normalized =
    ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function GetDayOffset(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T12:00:00Z`);
  const to = new Date(`${toIso}T12:00:00Z`);
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function UtcToZonedParts(
  utc: Date,
  timeZone: string,
): ZonedDateTimeParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(utc);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  let hour = get("hour");
  if (hour === "24") hour = "00";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${hour.padStart(2, "0")}:${get("minute").padStart(2, "0")}`,
  };
}

export function ZonedTimeToUtc(
  isoDate: string,
  time: string,
  timeZone: string,
): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  let utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const zoned = UtcToZonedParts(new Date(utcGuess), timeZone);
    const dayOffset = GetDayOffset(isoDate, zoned.date);
    const minuteOffset =
      TimeStringToMinutes(time) - TimeStringToMinutes(zoned.time);
    const totalOffsetMinutes = dayOffset * 24 * 60 + minuteOffset;

    if (totalOffsetMinutes === 0) break;
    utcGuess += totalOffsetMinutes * 60 * 1000;
  }

  return new Date(utcGuess);
}

export function ConvertZonedDateTime(
  isoDate: string,
  time: string,
  fromTimeZone: string,
  toTimeZone: string,
): ZonedDateTimeParts {
  if (fromTimeZone === toTimeZone) {
    return { date: isoDate, time };
  }

  const utc = ZonedTimeToUtc(isoDate, time, fromTimeZone);
  return UtcToZonedParts(utc, toTimeZone);
}

function MapTimedEventBetweenTimezones(
  event: DashboardEvent,
  fromTimeZone: string,
  toTimeZone: string,
): DashboardEvent {
  if (!event.time) return event;

  const start = ConvertZonedDateTime(
    event.date,
    event.time,
    fromTimeZone,
    toTimeZone,
  );

  let endDate = event.endDate;
  let endTime = event.endTime;

  if (event.endDate || event.endTime) {
    const end = ConvertZonedDateTime(
      event.endDate ?? event.date,
      event.endTime ?? event.time,
      fromTimeZone,
      toTimeZone,
    );
    endDate = end.date;
    endTime = end.time;
  }

  return {
    ...event,
    date: start.date,
    time: start.time,
    endDate,
    endTime,
  };
}

export function MapEventToDisplayTimezone(
  event: DashboardEvent,
  displayTimeZone: string,
): DashboardEvent {
  return MapTimedEventBetweenTimezones(
    event,
    GetEventsTimezone(),
    displayTimeZone,
  );
}

export function MapEventToStorageTimezone(
  event: DashboardEvent,
  displayTimeZone: string,
): DashboardEvent {
  return MapTimedEventBetweenTimezones(
    event,
    displayTimeZone,
    GetEventsTimezone(),
  );
}

export function ConvertEventFormTimesToStorage(
  form: {
    date: string;
    time: string;
    endDate: string;
    endTime: string;
    type: "event" | "task";
  },
  displayTimeZone: string,
): {
  date: string;
  time: string;
  endDate: string;
  endTime: string;
} {
  if (form.type === "task" || !form.time.trim()) {
    return {
      date: form.date,
      time: form.time,
      endDate: form.endDate,
      endTime: form.endTime,
    };
  }

  const start = ConvertZonedDateTime(
    form.date,
    form.time,
    displayTimeZone,
    GetEventsTimezone(),
  );

  if (!form.endDate.trim() && !form.endTime.trim()) {
    return {
      date: start.date,
      time: start.time,
      endDate: form.endDate,
      endTime: form.endTime,
    };
  }

  const end = ConvertZonedDateTime(
    form.endDate.trim() || form.date,
    form.endTime.trim() || form.time,
    displayTimeZone,
    GetEventsTimezone(),
  );

  return {
    date: start.date,
    time: start.time,
    endDate: end.date,
    endTime: end.time,
  };
}

export function ConvertEventFormTimesToDisplay(
  form: {
    date: string;
    time: string;
    endDate: string;
    endTime: string;
    type: "event" | "task";
  },
  displayTimeZone: string,
): {
  date: string;
  time: string;
  endDate: string;
  endTime: string;
} {
  if (form.type === "task" || !form.time.trim()) {
    return {
      date: form.date,
      time: form.time,
      endDate: form.endDate,
      endTime: form.endTime,
    };
  }

  const start = ConvertZonedDateTime(
    form.date,
    form.time,
    GetEventsTimezone(),
    displayTimeZone,
  );

  if (!form.endDate.trim() && !form.endTime.trim()) {
    return {
      date: start.date,
      time: start.time,
      endDate: form.endDate,
      endTime: form.endTime,
    };
  }

  const end = ConvertZonedDateTime(
    form.endDate.trim() || form.date,
    form.endTime.trim() || form.time,
    GetEventsTimezone(),
    displayTimeZone,
  );

  return {
    date: start.date,
    time: start.time,
    endDate: end.date,
    endTime: end.time,
  };
}

export function MoveStoredEventByDisplayDates(
  event: DashboardEvent,
  displayFromIso: string,
  displayToIso: string,
  displayTimeZone: string,
): DashboardEvent {
  const displayEvent = MapEventToDisplayTimezone(event, displayTimeZone);
  const dayOffset = GetDayOffset(displayFromIso, displayToIso);

  const shiftIso = (iso: string) => {
    const date = new Date(`${iso}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    return date.toISOString().slice(0, 10);
  };

  const shiftedDisplay: DashboardEvent = {
    ...displayEvent,
    date: shiftIso(displayEvent.date),
    endDate: displayEvent.endDate ? shiftIso(displayEvent.endDate) : undefined,
  };

  return MapEventToStorageTimezone(shiftedDisplay, displayTimeZone);
}

export function GetDefaultEventTimeForDisplay(
  displayTimeZone: string,
  referenceDate: string,
): string {
  return ConvertZonedDateTime(
    referenceDate,
    DefaultEventStorageTime,
    GetEventsTimezone(),
    displayTimeZone,
  ).time;
}

export { MinutesToTimeString, TimeStringToMinutes };
