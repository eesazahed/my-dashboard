import {
  StorageKeys,
  type DashboardEvent,
  type Habit,
  type PortfolioHolding,
  type QuickLink,
  type Settings,
} from "@/lib/types";

export type LegacyLocalStoragePayload = {
  habits: Habit[];
  quickLinks: QuickLink[];
  portfolio: PortfolioHolding[];
  settings: Settings | null;
  events: DashboardEvent[];
  thoughtDump: string | null;
};

function ReadJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function ReadLegacyLocalStorage(): LegacyLocalStoragePayload | null {
  if (typeof window === "undefined") return null;

  const habits = ReadJson<Habit[]>(StorageKeys.habits);
  const quickLinks = ReadJson<QuickLink[]>(StorageKeys.quickLinks);
  const portfolio = ReadJson<PortfolioHolding[]>(StorageKeys.portfolio);
  const settings = ReadJson<Settings>(StorageKeys.settings);
  const events = ReadJson<DashboardEvent[]>(StorageKeys.events);
  const thoughtDump = localStorage.getItem(StorageKeys.thoughtDump);

  const hasLegacy =
    habits != null ||
    quickLinks != null ||
    portfolio != null ||
    settings != null ||
    events != null ||
    thoughtDump != null;

  if (!hasLegacy) return null;

  return {
    habits: habits ?? [],
    quickLinks: quickLinks ?? [],
    portfolio: portfolio ?? [],
    settings: settings ?? null,
    events: events ?? [],
    thoughtDump,
  };
}

export function ClearLegacyLocalStorage(): void {
  if (typeof window === "undefined") return;

  for (const key of Object.values(StorageKeys)) {
    localStorage.removeItem(key);
  }
}

type BootstrapSnapshot = {
  habits: Habit[];
  quickLinks: QuickLink[];
  portfolio: PortfolioHolding[];
  thoughtDump: string;
};

function IsLikelySeedOnly(snapshot: BootstrapSnapshot): boolean {
  const habitNames = snapshot.habits.map((habit) => habit.name);
  const linkLabels = snapshot.quickLinks.map((link) => link.label);

  return (
    snapshot.portfolio.length === 0 &&
    snapshot.habits.length <= 1 &&
    habitNames.every((name) => name === "Morning workout") &&
    snapshot.quickLinks.length <= 2 &&
    linkLabels.every((label) => label === "GitHub" || label === "LinkedIn")
  );
}

export function ShouldMigrateLegacyData(
  server: BootstrapSnapshot,
  legacy: LegacyLocalStoragePayload,
): boolean {
  const legacyHasUserData =
    legacy.habits.length > 0 ||
    legacy.quickLinks.length > 0 ||
    legacy.portfolio.length > 0 ||
    legacy.events.length > 0 ||
    (legacy.thoughtDump?.trim().length ?? 0) > 0 ||
    (legacy.settings?.name.trim().length ?? 0) > 0;

  if (!legacyHasUserData) return false;

  if (IsLikelySeedOnly(server)) return true;

  return (
    legacy.habits.length > server.habits.length ||
    legacy.quickLinks.length > server.quickLinks.length ||
    legacy.portfolio.length > server.portfolio.length
  );
}

export function MergeSettings(
  server: Settings,
  legacy: Settings | null,
): Settings {
  if (!legacy) return server;

  return {
    ...server,
    ...legacy,
    location: legacy.location ?? server.location,
    timezone: legacy.timezone ?? server.timezone,
  };
}
