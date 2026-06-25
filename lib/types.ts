import { DefaultTimezone } from "@/lib/timezones";

export type EventRecurrence = {
  frequency: "daily" | "weekly";
  weekdays?: number[];
  until: string;
};

export type DashboardEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  type: "event" | "task";
  completed?: boolean;
  recurrence?: EventRecurrence;
  color?: string;
};

export type Habit = {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  target: number;
  log: { date: string }[];
  streak?: number;
};

export type QuickLink = {
  id: string;
  label: string;
  url: string;
  icon: string;
  color?: string;
};

export type PortfolioHolding = {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;
  datePurchased: string;
};

export type EditableWidgetType = "news" | "watchlist" | "notes" | "pomodoro";

export type Settings = {
  name: string;
  location: { lat: number; lon: number; label: string };
  activeWidget: EditableWidgetType;
  newsCategory?: string;
  timezone?: string;
};

export type NewsArticle = {
  title: string;
  source: string;
  url: string;
  commentsUrl?: string;
};

export type NewsFeed = "world" | "hn";

export const StorageKeys = {
  events: "dashboard:events",
  habits: "dashboard:habits",
  quickLinks: "dashboard:quickLinks",
  portfolio: "dashboard:portfolio",
  settings: "dashboard:settings",
  thoughtDump: "dashboard:thoughtDump",
} as const;

export const DefaultSettings: Settings = {
  name: "",
  location: { lat: 40.7128, lon: -74.006, label: "New York" },
  activeWidget: "news",
  newsCategory: "general",
  timezone: DefaultTimezone,
};

export const CuratedBrandIcons = [
  "brand-tiktok",
  "brand-instagram",
  "brand-twitter",
  "brand-github",
  "brand-youtube",
  "brand-linkedin",
  "brand-reddit",
  "brand-discord",
  "brand-spotify",
  "link",
] as const;

export type CuratedBrandIcon = (typeof CuratedBrandIcons)[number];
