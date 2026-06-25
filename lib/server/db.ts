import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const SchemaVersion = 2;

let DatabaseInstance: Database.Database | null = null;

export function GetDatabasePath(): string {
  const configured = process.env.DATABASE_PATH?.trim();
  if (configured) return configured;

  return path.join(process.cwd(), "data", "dashboard.db");
}

function EnsureDataDirectory(dbPath: string): void {
  const directory = path.dirname(dbPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function RunMigrations(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT '',
      location_lat REAL NOT NULL DEFAULT 40.7128,
      location_lon REAL NOT NULL DEFAULT -74.006,
      location_label TEXT NOT NULL DEFAULT 'New York',
      active_widget TEXT NOT NULL DEFAULT 'news',
      news_category TEXT DEFAULT 'general'
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT,
      end_date TEXT,
      end_time TEXT,
      type TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      recurrence TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      frequency TEXT NOT NULL,
      target INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date
      ON habit_logs(habit_id, date);

    CREATE TABLE IF NOT EXISTS quick_links (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      url TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS portfolio_holdings (
      id TEXT PRIMARY KEY,
      ticker TEXT NOT NULL,
      shares REAL NOT NULL,
      cost_basis REAL NOT NULL,
      date_purchased TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS thought_dump (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      content TEXT NOT NULL DEFAULT ''
    );
  `);

  const versionRow = database
    .prepare("SELECT value FROM meta WHERE key = 'schema_version'")
    .get() as { value: string } | undefined;

  const currentVersion = versionRow ? parseInt(versionRow.value, 10) : 0;

  if (!versionRow) {
    database
      .prepare(
        "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)",
      )
      .run(String(SchemaVersion));
  } else if (currentVersion < SchemaVersion) {
    RunSchemaUpgrades(database, currentVersion);
    database
      .prepare(
        "INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)",
      )
      .run(String(SchemaVersion));
  }
}

function RunSchemaUpgrades(
  database: Database.Database,
  fromVersion: number,
): void {
  if (fromVersion < 2) {
    const eventColumns = database
      .prepare("PRAGMA table_info(events)")
      .all() as { name: string }[];

    if (!eventColumns.some((column) => column.name === "color")) {
      database.exec("ALTER TABLE events ADD COLUMN color TEXT");
    }
  }
}

export function GetDb(): Database.Database {
  if (DatabaseInstance) return DatabaseInstance;

  const dbPath = GetDatabasePath();
  EnsureDataDirectory(dbPath);
  DatabaseInstance = new Database(dbPath);
  DatabaseInstance.pragma("journal_mode = WAL");
  DatabaseInstance.pragma("foreign_keys = ON");
  RunMigrations(DatabaseInstance);

  return DatabaseInstance;
}

export function CloseDb(): void {
  if (DatabaseInstance) {
    DatabaseInstance.close();
    DatabaseInstance = null;
  }
}

export function ReopenDb(): Database.Database {
  CloseDb();
  return GetDb();
}

export async function CreateDatabaseBackup(destinationPath: string): Promise<void> {
  const database = GetDb();
  await database.backup(destinationPath);
}

export function CheckpointDatabase(): void {
  const database = GetDb();
  database.pragma("wal_checkpoint(TRUNCATE)");
}

export function ValidateDatabaseFile(filePath: string): {
  valid: boolean;
  reason?: string;
} {
  let testDb: Database.Database | null = null;

  try {
    const header = fs.readFileSync(filePath).subarray(0, 16).toString("utf8");
    if (!header.startsWith("SQLite format 3")) {
      return {
        valid: false,
        reason:
          "File is not a SQLite database. If you renamed it, make sure the export ended in .db and is not an HTML/JSON error page.",
      };
    }

    testDb = new Database(filePath, { readonly: true });
    const integrity = testDb.pragma("integrity_check", {
      simple: true,
    }) as string;
    if (integrity !== "ok") {
      return { valid: false, reason: `Integrity check failed: ${integrity}` };
    }

    const settingsTable = testDb
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'settings'",
      )
      .get();

    if (!settingsTable) {
      return {
        valid: false,
        reason: "Missing dashboard tables. Use a backup exported from this app.",
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Could not open file as SQLite database" };
  } finally {
    testDb?.close();
  }
}

export function RemoveWalFiles(dbPath: string): void {
  for (const suffix of ["-wal", "-shm"]) {
    try {
      fs.unlinkSync(`${dbPath}${suffix}`);
    } catch {
      /* file may not exist */
    }
  }
}

export const ExpectedTables = [
  "meta",
  "settings",
  "events",
  "habits",
  "habit_logs",
  "quick_links",
  "portfolio_holdings",
  "thought_dump",
] as const;
