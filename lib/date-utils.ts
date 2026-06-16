import type { DashboardEvent, Habit } from "./types";
import {
  CompareEventsBySchedule,
  EventOccursOnDate,
} from "./event-utils";
import { ExpandAllEventOccurrences } from "./recurrence-utils";

export function getTodayIso(): string {
  return formatIsoDate(new Date());
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayIso();
}

export function formatAgendaTitle(dateStr: string): string {
  if (isToday(dateStr)) return "Today";
  const date = parseIsoDate(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function parseIsoDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function isDateInWeek(dateStr: string, reference: Date): boolean {
  const date = parseIsoDate(dateStr);
  const start = getWeekStart(reference);
  const end = getWeekEnd(reference);
  return date >= start && date <= end;
}

export function countHabitLogsForDate(habit: Habit, dateStr: string): number {
  return habit.log.filter((entry) => entry.date === dateStr).length;
}

export function countHabitCompletions(habit: Habit, reference: Date): number {
  const today = formatIsoDate(reference);
  if (habit.frequency === "daily") {
    return countHabitLogsForDate(habit, today);
  }
  return habit.log.filter((entry) =>
    isDateInWeek(entry.date, reference),
  ).length;
}

function IsHabitDayComplete(habit: Habit, dateStr: string): boolean {
  return countHabitLogsForDate(habit, dateStr) >= habit.target;
}

function IsHabitWeekComplete(habit: Habit, reference: Date): boolean {
  return (
    habit.log.filter((entry) => isDateInWeek(entry.date, reference)).length >=
    habit.target
  );
}

export function GetHabitStreak(habit: Habit, reference: Date = new Date()): number {
  if (habit.frequency === "daily") {
    let streak = 0;
    const cursor = new Date(reference);
    const todayIso = formatIsoDate(reference);

    if (!IsHabitDayComplete(habit, todayIso)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (streak < 3650) {
      const dateIso = formatIsoDate(cursor);
      if (!IsHabitDayComplete(habit, dateIso)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  let streak = 0;
  const cursor = getWeekStart(reference);

  if (!IsHabitWeekComplete(habit, reference)) {
    cursor.setDate(cursor.getDate() - 7);
  }

  while (streak < 520) {
    if (!IsHabitWeekComplete(habit, cursor)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 7);
  }

  return streak;
}

export function filterEventsByDate(
  events: DashboardEvent[],
  dateStr: string,
): DashboardEvent[] {
  return ExpandAllEventOccurrences(events)
    .filter((event) => EventOccursOnDate(event, dateStr))
    .sort(CompareEventsBySchedule);
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
