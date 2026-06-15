import { parseIsoDate } from "./date-utils";
import type { DashboardEvent } from "./types";

export function FormatMilitaryDateTime(date: Date): string {
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${weekday}, ${month} ${day} · ${hours}:${minutes}:${seconds}`;
}

/** @deprecated Use FormatMilitaryDateTime */
export const formatMilitaryDateTime = FormatMilitaryDateTime;

export function FormatMilitaryTime(time: string): string {
  const normalized = NormalizeMilitaryTimeValue(time);
  if (!normalized) return time;
  return `${normalized}:00`;
}

/** @deprecated Use FormatMilitaryTime */
export const formatMilitaryTime = FormatMilitaryTime;

export function NormalizeMilitaryTimeDraft(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function NormalizeMilitaryTimeValue(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const match = trimmed.match(/^(\d{1,2}):?(\d{0,2})$/);
  if (!match) return trimmed;

  let hours = parseInt(match[1], 10);
  let minutes = parseInt(match[2] || "0", 10);

  if (Number.isNaN(hours)) hours = 0;
  if (Number.isNaN(minutes)) minutes = 0;

  hours = Math.min(23, Math.max(0, hours));
  minutes = Math.min(59, Math.max(0, minutes));

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function IsValidMilitaryTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function FormatWheelHourLabel(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${period}`;
}

export function ParseMilitaryTimeParts(
  value: string,
): { hours: number; minutes: number } | null {
  const normalized = NormalizeMilitaryTimeValue(value);
  if (!normalized || !IsValidMilitaryTime(normalized)) return null;

  const [hours, minutes] = normalized.split(":").map(Number);
  return { hours, minutes };
}

export function BuildMilitaryTime(hours: number, minutes: number): string {
  const safeHours = Math.min(23, Math.max(0, hours));
  const safeMinutes = Math.min(59, Math.max(0, minutes));
  return `${String(safeHours).padStart(2, "0")}:${String(safeMinutes).padStart(2, "0")}`;
}

export function FormatShortDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function FormatEventSchedule(event: DashboardEvent): string | null {
  const startTime = event.time ? FormatMilitaryTime(event.time) : null;
  const endTime = event.endTime ? FormatMilitaryTime(event.endTime) : null;
  const endDate = event.endDate;

  if (endDate && endDate !== event.date) {
    const endLabel = FormatShortDate(endDate);
    if (startTime && endTime) {
      return `${startTime} → ${endLabel} ${endTime}`;
    }
    if (startTime) {
      return `${startTime} → ${endLabel}`;
    }
    return `→ ${endLabel}${endTime ? ` ${endTime}` : ""}`;
  }

  if (startTime && endTime) {
    return `${startTime} – ${endTime}`;
  }

  return startTime;
}
