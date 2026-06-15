"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toast } from "@/components/ui/Toast";
import { generateId, getTodayIso } from "@/lib/date-utils";
import {
  DefaultSettings,
  StorageKeys,
  type DashboardEvent,
  type Habit,
  type QuickLink,
  type PortfolioHolding,
  type Settings,
} from "@/lib/types";

type DashboardContextValue = {
  ready: boolean;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  events: DashboardEvent[];
  setEvents: (
    value: DashboardEvent[] | ((prev: DashboardEvent[]) => DashboardEvent[]),
  ) => void;
  habits: Habit[];
  setHabits: (value: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  settings: Settings;
  setSettings: (value: Settings | ((prev: Settings) => Settings)) => void;
  quickLinks: QuickLink[];
  setQuickLinks: (
    value: QuickLink[] | ((prev: QuickLink[]) => QuickLink[]),
  ) => void;
  portfolio: PortfolioHolding[];
  setPortfolio: (
    value:
      | PortfolioHolding[]
      | ((prev: PortfolioHolding[]) => PortfolioHolding[]),
  ) => void;
  thoughtDump: string;
  setThoughtDump: (value: string | ((prev: string) => string)) => void;
  toast: string | null;
  showToast: (message: string) => void;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw) as T;
  } catch {
    /* corrupt data */
  }
  return fallback;
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function seedFirstVisitData(): void {
  if (localStorage.getItem("dashboard:seeded")) return;

  const today = getTodayIso();

  writeStorage(StorageKeys.settings, {
    ...DefaultSettings,
    name: "Eesa",
  });

  writeStorage(StorageKeys.events, [
    {
      id: generateId(),
      title: "Investor demo",
      date: today,
      time: "14:00",
      type: "event",
    },
    {
      id: generateId(),
      title: "Review pitch deck",
      date: today,
      type: "task",
      completed: false,
    },
  ] satisfies DashboardEvent[]);

  writeStorage(StorageKeys.habits, [
    {
      id: generateId(),
      name: "Morning workout",
      frequency: "daily",
      target: 1,
      log: [],
    },
  ] satisfies Habit[]);

  writeStorage(StorageKeys.quickLinks, [
    {
      id: generateId(),
      label: "GitHub",
      url: "https://github.com",
      icon: "brand-github",
    },
    {
      id: generateId(),
      label: "LinkedIn",
      url: "https://linkedin.com",
      icon: "brand-linkedin",
    },
  ] satisfies QuickLink[]);

  localStorage.setItem("dashboard:seeded", "1");
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [events, setEventsState] = useState<DashboardEvent[]>([]);
  const [habits, setHabitsState] = useState<Habit[]>([]);
  const [settings, setSettingsState] = useState<Settings>(DefaultSettings);
  const [quickLinks, setQuickLinksState] = useState<QuickLink[]>([]);
  const [portfolio, setPortfolioState] = useState<PortfolioHolding[]>([]);
  const [thoughtDump, setThoughtDumpState] = useState("");
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null,
  );
  const toastIdRef = useRef(0);

  useEffect(() => {
    seedFirstVisitData();

    setEventsState(readStorage(StorageKeys.events, []));
    setHabitsState(readStorage(StorageKeys.habits, []));
    setSettingsState(readStorage(StorageKeys.settings, DefaultSettings));
    setQuickLinksState(readStorage(StorageKeys.quickLinks, []));
    setPortfolioState(readStorage(StorageKeys.portfolio, []));
    setThoughtDumpState(readStorage(StorageKeys.thoughtDump, ""));
    setSelectedDate(getTodayIso());
    setReady(true);
  }, []);

  const showToast = useCallback((message: string) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message });
  }, []);

  const setEvents = useCallback(
    (
      value: DashboardEvent[] | ((prev: DashboardEvent[]) => DashboardEvent[]),
    ) => {
      setEventsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        writeStorage(StorageKeys.events, next);
        return next;
      });
    },
    [],
  );

  const setHabits = useCallback(
    (value: Habit[] | ((prev: Habit[]) => Habit[])) => {
      setHabitsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        writeStorage(StorageKeys.habits, next);
        return next;
      });
    },
    [],
  );

  const setSettings = useCallback(
    (value: Settings | ((prev: Settings) => Settings)) => {
      setSettingsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        writeStorage(StorageKeys.settings, next);
        return next;
      });
    },
    [],
  );

  const setQuickLinks = useCallback(
    (value: QuickLink[] | ((prev: QuickLink[]) => QuickLink[])) => {
      setQuickLinksState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        writeStorage(StorageKeys.quickLinks, next);
        return next;
      });
    },
    [],
  );

  const setPortfolio = useCallback(
    (
      value:
        | PortfolioHolding[]
        | ((prev: PortfolioHolding[]) => PortfolioHolding[]),
    ) => {
      setPortfolioState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        writeStorage(StorageKeys.portfolio, next);
        return next;
      });
    },
    [],
  );

  const setThoughtDump = useCallback(
    (value: string | ((prev: string) => string)) => {
      setThoughtDumpState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        writeStorage(StorageKeys.thoughtDump, next);
        return next;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      ready,
      selectedDate,
      setSelectedDate,
      events,
      setEvents,
      habits,
      setHabits,
      settings,
      setSettings,
      quickLinks,
      setQuickLinks,
      portfolio,
      setPortfolio,
      thoughtDump,
      setThoughtDump,
      toast: toast?.message ?? null,
      showToast,
    }),
    [
      ready,
      selectedDate,
      events,
      setEvents,
      habits,
      setHabits,
      settings,
      setSettings,
      quickLinks,
      setQuickLinks,
      portfolio,
      setPortfolio,
      thoughtDump,
      setThoughtDump,
      toast,
      showToast,
    ],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          onDone={() => setToast(null)}
        />
      )}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
