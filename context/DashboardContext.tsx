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
import { ApiGet, ApiPut } from "@/lib/api-client";
import { getTodayIso } from "@/lib/date-utils";
import {
  GetEventRangeBuffer,
  MergeBaseEvents,
  RangeKey,
} from "@/lib/event-range";
import {
  DefaultSettings,
  type DashboardEvent,
  type Habit,
  type PortfolioHolding,
  type QuickLink,
  type Settings,
} from "@/lib/types";

type BootstrapResponse = {
  settings: Settings;
  habits: Habit[];
  quickLinks: QuickLink[];
  portfolio: PortfolioHolding[];
  thoughtDump: string;
};

type DashboardContextValue = {
  ready: boolean;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  events: DashboardEvent[];
  setEvents: (
    value: DashboardEvent[] | ((prev: DashboardEvent[]) => DashboardEvent[]),
  ) => void;
  fetchEventsForRange: (from: string, to: string) => Promise<void>;
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
  reloadDashboard: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

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
  const eventsRef = useRef<DashboardEvent[]>([]);
  const loadedRangesRef = useRef<Set<string>>(new Set());
  const pendingRangeFetchesRef = useRef<Map<string, Promise<void>>>(new Map());

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  const showToast = useCallback((message: string) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message });
  }, []);

  const fetchEventsForRange = useCallback(async (from: string, to: string) => {
    const key = RangeKey(from, to);
    if (loadedRangesRef.current.has(key)) return;

    const pending = pendingRangeFetchesRef.current.get(key);
    if (pending) {
      await pending;
      return;
    }

    const request = (async () => {
      const data = await ApiGet<{ events: DashboardEvent[] }>(
        `/api/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      loadedRangesRef.current.add(key);
      setEventsState((prev) => MergeBaseEvents(prev, data.events));
    })();

    pendingRangeFetchesRef.current.set(key, request);

    try {
      await request;
    } finally {
      pendingRangeFetchesRef.current.delete(key);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    const bootstrap = await ApiGet<BootstrapResponse>("/api/bootstrap");
    setSettingsState(bootstrap.settings);
    setHabitsState(bootstrap.habits);
    setQuickLinksState(bootstrap.quickLinks);
    setPortfolioState(bootstrap.portfolio);
    setThoughtDumpState(bootstrap.thoughtDump);

    const initialRange = GetEventRangeBuffer(new Date());
    loadedRangesRef.current.clear();
    setEventsState([]);
    await fetchEventsForRange(initialRange.from, initialRange.to);
    setSelectedDate(getTodayIso());
    setReady(true);
  }, [fetchEventsForRange]);

  useEffect(() => {
    loadDashboard().catch(() => {
      setReady(true);
    });
  }, [loadDashboard]);

  const setEvents = useCallback(
    (
      value: DashboardEvent[] | ((prev: DashboardEvent[]) => DashboardEvent[]),
    ) => {
      setEventsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        void ApiPut("/api/events/sync", { previous: prev, next }).catch(() => {
          showToast("Failed to save events");
        });
        return next;
      });
    },
    [showToast],
  );

  const setHabits = useCallback(
    (value: Habit[] | ((prev: Habit[]) => Habit[])) => {
      setHabitsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        const persistable = next.map(({ id, name, frequency, target, log }) => ({
          id,
          name,
          frequency,
          target,
          log,
        }));
        void ApiPut("/api/habits", { habits: persistable }).catch(() => {
          showToast("Failed to save habits");
        });
        return next;
      });
    },
    [showToast],
  );

  const setSettings = useCallback(
    (value: Settings | ((prev: Settings) => Settings)) => {
      setSettingsState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        void ApiPut("/api/settings", { settings: next }).catch(() => {
          showToast("Failed to save settings");
        });
        return next;
      });
    },
    [showToast],
  );

  const setQuickLinks = useCallback(
    (value: QuickLink[] | ((prev: QuickLink[]) => QuickLink[])) => {
      setQuickLinksState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        void ApiPut("/api/quick-links", { quickLinks: next }).catch(() => {
          showToast("Failed to save quick links");
        });
        return next;
      });
    },
    [showToast],
  );

  const setPortfolio = useCallback(
    (
      value:
        | PortfolioHolding[]
        | ((prev: PortfolioHolding[]) => PortfolioHolding[]),
    ) => {
      setPortfolioState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        void ApiPut("/api/portfolio", { portfolio: next }).catch(() => {
          showToast("Failed to save portfolio");
        });
        return next;
      });
    },
    [showToast],
  );

  const setThoughtDump = useCallback(
    (value: string | ((prev: string) => string)) => {
      setThoughtDumpState((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        void ApiPut("/api/thought-dump", { content: next }).catch(() => {
          showToast("Failed to save thought dump");
        });
        return next;
      });
    },
    [showToast],
  );

  const reloadDashboard = useCallback(async () => {
    setReady(false);
    await loadDashboard();
  }, [loadDashboard]);

  const value = useMemo(
    () => ({
      ready,
      selectedDate,
      setSelectedDate,
      events,
      setEvents,
      fetchEventsForRange,
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
      reloadDashboard,
    }),
    [
      ready,
      selectedDate,
      events,
      setEvents,
      fetchEventsForRange,
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
      reloadDashboard,
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
