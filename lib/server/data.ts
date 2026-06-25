import type {
  DashboardEvent,
  EventRecurrence,
  Habit,
  PortfolioHolding,
  QuickLink,
  Settings,
} from "@/lib/types";
import { DefaultSettings } from "@/lib/types";
import { GetHabitStreak } from "@/lib/date-utils";
import { ExpandAllEventOccurrences } from "@/lib/recurrence-utils";
import { generateId, getTodayIso } from "@/lib/date-utils";
import { ResolveTimezone } from "@/lib/timezones";
import { GetDb } from "@/lib/server/db";

type EventRow = {
  id: string;
  title: string;
  date: string;
  time: string | null;
  end_date: string | null;
  end_time: string | null;
  type: string;
  completed: number;
  recurrence: string | null;
  color: string | null;
};

export type HabitWithStreak = Habit & { streak: number };

export type BootstrapPayload = {
  settings: Settings;
  habits: HabitWithStreak[];
  quickLinks: QuickLink[];
  portfolio: PortfolioHolding[];
  thoughtDump: string;
};

function RowToEvent(row: EventRow): DashboardEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time ?? undefined,
    endDate: row.end_date ?? undefined,
    endTime: row.end_time ?? undefined,
    type: row.type as DashboardEvent["type"],
    completed: row.completed === 1,
    recurrence: row.recurrence
      ? (JSON.parse(row.recurrence) as EventRecurrence)
      : undefined,
    color: row.color ?? undefined,
  };
}

function EventToRow(event: DashboardEvent) {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time ?? null,
    end_date: event.endDate ?? null,
    end_time: event.endTime ?? null,
    type: event.type,
    completed: event.completed ? 1 : 0,
    recurrence: event.recurrence ? JSON.stringify(event.recurrence) : null,
    color: event.color ?? null,
  };
}

export function SeedDatabaseIfEmpty(): void {
  const database = GetDb();
  const settingsCount = database
    .prepare("SELECT COUNT(*) as count FROM settings")
    .get() as { count: number };

  if (settingsCount.count > 0) return;

  const today = getTodayIso();

  database
    .prepare(
      `INSERT INTO settings (
        id, name, location_lat, location_lon, location_label, active_widget, news_category, timezone
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      "Eesa",
      DefaultSettings.location.lat,
      DefaultSettings.location.lon,
      DefaultSettings.location.label,
      DefaultSettings.activeWidget,
      DefaultSettings.newsCategory ?? "general",
      DefaultSettings.timezone ?? ResolveTimezone(),
    );

  const insertEvent = database.prepare(
    `INSERT INTO events (
      id, title, date, time, end_date, end_time, type, completed, recurrence, color
    ) VALUES (
      @id, @title, @date, @time, @end_date, @end_time, @type, @completed, @recurrence, @color
    )`,
  );

  insertEvent.run(
    EventToRow({
      id: generateId(),
      title: "Investor demo",
      date: today,
      time: "14:00",
      type: "event",
    }),
  );

  insertEvent.run(
    EventToRow({
      id: generateId(),
      title: "Review pitch deck",
      date: today,
      type: "task",
      completed: false,
    }),
  );

  const habitId = generateId();
  database
    .prepare(
      "INSERT INTO habits (id, name, frequency, target) VALUES (?, ?, ?, ?)",
    )
    .run(habitId, "Morning workout", "daily", 1);

  database
    .prepare(
      "INSERT INTO quick_links (id, label, url, icon, color) VALUES (?, ?, ?, ?, ?)",
    )
    .run(generateId(), "GitHub", "https://github.com", "brand-github", null);

  database
    .prepare(
      "INSERT INTO quick_links (id, label, url, icon, color) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      generateId(),
      "LinkedIn",
      "https://linkedin.com",
      "brand-linkedin",
      null,
    );

  database
    .prepare("INSERT INTO thought_dump (id, content) VALUES (1, '')")
    .run();
}

export function ReadSettings(): Settings {
  const database = GetDb();
  const row = database
    .prepare(
      `SELECT name, location_lat, location_lon, location_label, active_widget, news_category, timezone
       FROM settings WHERE id = 1`,
    )
    .get() as
    | {
        name: string;
        location_lat: number;
        location_lon: number;
        location_label: string;
        active_widget: string;
        news_category: string | null;
        timezone: string | null;
      }
    | undefined;

  if (!row) return DefaultSettings;

  return {
    name: row.name,
    location: {
      lat: row.location_lat,
      lon: row.location_lon,
      label: row.location_label,
    },
    activeWidget: row.active_widget as Settings["activeWidget"],
    newsCategory: row.news_category ?? undefined,
    timezone: ResolveTimezone(row.timezone ?? undefined),
  };
}

export function WriteSettings(settings: Settings): void {
  const database = GetDb();
  database
    .prepare(
      `INSERT INTO settings (
        id, name, location_lat, location_lon, location_label, active_widget, news_category, timezone
      ) VALUES (1, @name, @lat, @lon, @label, @activeWidget, @newsCategory, @timezone)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        location_lat = excluded.location_lat,
        location_lon = excluded.location_lon,
        location_label = excluded.location_label,
        active_widget = excluded.active_widget,
        news_category = excluded.news_category,
        timezone = excluded.timezone`,
    )
    .run({
      name: settings.name,
      lat: settings.location.lat,
      lon: settings.location.lon,
      label: settings.location.label,
      activeWidget: settings.activeWidget,
      newsCategory: settings.newsCategory ?? null,
      timezone: ResolveTimezone(settings.timezone),
    });
}

export function ReadHabits(): HabitWithStreak[] {
  const database = GetDb();
  const habitRows = database
    .prepare("SELECT id, name, frequency, target FROM habits ORDER BY rowid")
    .all() as Array<{
    id: string;
    name: string;
    frequency: string;
    target: number;
  }>;

  const logRows = database
    .prepare("SELECT habit_id, date FROM habit_logs ORDER BY id")
    .all() as Array<{ habit_id: string; date: string }>;

  const logsByHabit = new Map<string, { date: string }[]>();
  for (const log of logRows) {
    const existing = logsByHabit.get(log.habit_id) ?? [];
    existing.push({ date: log.date });
    logsByHabit.set(log.habit_id, existing);
  }

  const reference = new Date();

  return habitRows.map((row) => {
    const habit: Habit = {
      id: row.id,
      name: row.name,
      frequency: row.frequency as Habit["frequency"],
      target: row.target,
      log: logsByHabit.get(row.id) ?? [],
    };

    return {
      ...habit,
      streak: GetHabitStreak(habit, reference),
    };
  });
}

export function WriteHabits(habits: Habit[]): void {
  const database = GetDb();
  const transaction = database.transaction((nextHabits: Habit[]) => {
    database.prepare("DELETE FROM habit_logs").run();
    database.prepare("DELETE FROM habits").run();

    const insertHabit = database.prepare(
      "INSERT INTO habits (id, name, frequency, target) VALUES (?, ?, ?, ?)",
    );
    const insertLog = database.prepare(
      "INSERT INTO habit_logs (habit_id, date) VALUES (?, ?)",
    );

    for (const habit of nextHabits) {
      insertHabit.run(habit.id, habit.name, habit.frequency, habit.target);
      for (const entry of habit.log) {
        insertLog.run(habit.id, entry.date);
      }
    }
  });

  transaction(habits);
}

export function ReadQuickLinks(): QuickLink[] {
  const database = GetDb();
  const rows = database
    .prepare(
      "SELECT id, label, url, icon, color FROM quick_links ORDER BY rowid",
    )
    .all() as QuickLink[];

  return rows.map((row) => ({
    ...row,
    color: row.color ?? undefined,
  }));
}

export function WriteQuickLinks(quickLinks: QuickLink[]): void {
  const database = GetDb();
  const transaction = database.transaction((links: QuickLink[]) => {
    database.prepare("DELETE FROM quick_links").run();
    const insert = database.prepare(
      "INSERT INTO quick_links (id, label, url, icon, color) VALUES (?, ?, ?, ?, ?)",
    );
    for (const link of links) {
      insert.run(link.id, link.label, link.url, link.icon, link.color ?? null);
    }
  });

  transaction(quickLinks);
}

export function ReadPortfolio(): PortfolioHolding[] {
  const database = GetDb();
  return database
    .prepare(
      `SELECT id, ticker, shares, cost_basis as costBasis, date_purchased as datePurchased
       FROM portfolio_holdings ORDER BY rowid`,
    )
    .all() as PortfolioHolding[];
}

export function WritePortfolio(portfolio: PortfolioHolding[]): void {
  const database = GetDb();
  const transaction = database.transaction((holdings: PortfolioHolding[]) => {
    database.prepare("DELETE FROM portfolio_holdings").run();
    const insert = database.prepare(
      `INSERT INTO portfolio_holdings (id, ticker, shares, cost_basis, date_purchased)
       VALUES (?, ?, ?, ?, ?)`,
    );
    for (const holding of holdings) {
      insert.run(
        holding.id,
        holding.ticker,
        holding.shares,
        holding.costBasis,
        holding.datePurchased,
      );
    }
  });

  transaction(portfolio);
}

export function ReadThoughtDump(): string {
  const database = GetDb();
  const row = database
    .prepare("SELECT content FROM thought_dump WHERE id = 1")
    .get() as { content: string } | undefined;
  return row?.content ?? "";
}

export function WriteThoughtDump(content: string): void {
  const database = GetDb();
  database
    .prepare(
      `INSERT INTO thought_dump (id, content) VALUES (1, ?)
       ON CONFLICT(id) DO UPDATE SET content = excluded.content`,
    )
    .run(content);
}

export function ReadBootstrap(): BootstrapPayload {
  SeedDatabaseIfEmpty();
  return {
    settings: ReadSettings(),
    habits: ReadHabits(),
    quickLinks: ReadQuickLinks(),
    portfolio: ReadPortfolio(),
    thoughtDump: ReadThoughtDump(),
  };
}

export function ReadBaseEventsForRange(
  from: string,
  to: string,
): DashboardEvent[] {
  const database = GetDb();
  const rows = database
    .prepare(
      `SELECT id, title, date, time, end_date, end_time, type, completed, recurrence, color
       FROM events
       WHERE (
         recurrence IS NULL
         AND date <= @to
         AND COALESCE(end_date, date) >= @from
       ) OR (
         recurrence IS NOT NULL
         AND date <= @to
         AND json_extract(recurrence, '$.until') >= @from
       )
       ORDER BY date, time`,
    )
    .all({ from, to }) as EventRow[];

  return rows.map(RowToEvent);
}

export function ReadExpandedEventsForRange(
  from: string,
  to: string,
): DashboardEvent[] {
  const baseEvents = ReadBaseEventsForRange(from, to);
  return ExpandAllEventOccurrences(baseEvents).filter(
    (event) => event.date >= from && event.date <= to,
  );
}

export function InsertEvent(event: DashboardEvent): void {
  const database = GetDb();
  database
    .prepare(
      `INSERT INTO events (
        id, title, date, time, end_date, end_time, type, completed, recurrence, color
      ) VALUES (
        @id, @title, @date, @time, @end_date, @end_time, @type, @completed, @recurrence, @color
      )`,
    )
    .run(EventToRow(event));
}

export function UpdateEvent(event: DashboardEvent): void {
  const database = GetDb();
  database
    .prepare(
      `UPDATE events SET
        title = @title,
        date = @date,
        time = @time,
        end_date = @end_date,
        end_time = @end_time,
        type = @type,
        completed = @completed,
        recurrence = @recurrence,
        color = @color
      WHERE id = @id`,
    )
    .run(EventToRow(event));
}

export function DeleteEvent(id: string): void {
  const database = GetDb();
  database.prepare("DELETE FROM events WHERE id = ?").run(id);
}

export function SyncEvents(
  previous: DashboardEvent[],
  next: DashboardEvent[],
): void {
  const previousIds = new Set(previous.map((event) => event.id));
  const nextIds = new Set(next.map((event) => event.id));

  for (const event of next) {
    if (!previousIds.has(event.id)) {
      InsertEvent(event);
      continue;
    }

    const old = previous.find((item) => item.id === event.id);
    if (JSON.stringify(old) !== JSON.stringify(event)) {
      UpdateEvent(event);
    }
  }

  for (const id of previousIds) {
    if (!nextIds.has(id)) {
      DeleteEvent(id);
    }
  }
}

const CalendarFeedTokenKey = "calendar_feed_token";

function GenerateCalendarFeedToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export function GetCalendarFeedToken(): string {
  const database = GetDb();
  const row = database
    .prepare("SELECT value FROM meta WHERE key = ?")
    .get(CalendarFeedTokenKey) as { value: string } | undefined;

  if (row?.value) return row.value;

  const token = GenerateCalendarFeedToken();
  database
    .prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)")
    .run(CalendarFeedTokenKey, token);

  return token;
}

export function RegenerateCalendarFeedToken(): string {
  const database = GetDb();
  const token = GenerateCalendarFeedToken();
  database
    .prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)")
    .run(CalendarFeedTokenKey, token);

  return token;
}

export function VerifyCalendarFeedToken(token: string): boolean {
  if (!token.trim()) return false;
  const stored = GetCalendarFeedToken();
  return token === stored;
}

export function ReadEventsForCalendarFeed(): DashboardEvent[] {
  const database = GetDb();
  const rows = database
    .prepare(
      `SELECT id, title, date, time, end_date, end_time, type, completed, recurrence, color
       FROM events
       WHERE type = 'event'
       ORDER BY date, time`,
    )
    .all() as EventRow[];

  return rows.map(RowToEvent);
}
