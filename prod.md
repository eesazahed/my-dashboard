# Personal Dashboard — Product Spec

## 1. Overview

A personal, single-user dashboard web app. No authentication, no backend database — all user data persists in `localStorage`. Built with Next.js (App Router) and Tailwind CSS.

The app has one primary view: the dashboard itself, laid out as a header bar plus a fixed 3x2 grid of panels. A settings page/modal handles user configuration (name, location, quick links, active widget choice, habit definitions).

## 2. Tech stack

- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Calendar**: FullCalendar (`@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction` for drag-and-drop)
- **State**: React state + Context for cross-panel shared state (selected date)
- **Persistence**: `localStorage`, wrapped in a custom `useLocalStorage` hook
- **External APIs** (all client-side fetch, no API keys committed to repo — use `.env.local`):
  - Weather: Open-Meteo (no key required)
  - News: any free RSS/news API
  - Stock prices: any free-tier stock API

## 3. Project structure

```
app/
  layout.tsx              # root layout, theme provider, font setup
  page.tsx                # main dashboard page (header + grid)
  settings/
    page.tsx              # settings page

components/
  layout/
    Header.tsx            # welcome message, date/time, weather, settings link
  panels/
    AgendaPanel.tsx        # today's/selected-day agenda (derived from events)
    CalendarPanel.tsx       # FullCalendar wrapper
    HabitsPanel.tsx         # tasks/habits progress bars
    QuickLinksPanel.tsx     # social/quick link icons
    EditableWidgetPanel.tsx # renders active widget based on settings
    PortfolioPanel.tsx      # stock portfolio
  widgets/
    NewsFeedWidget.tsx       # first editable-widget option
    WatchlistWidget.tsx      # future option (placeholder)
    NotesWidget.tsx           # future option (placeholder)
    PomodoroWidget.tsx        # future option (placeholder)
  ui/
    Card.tsx                 # shared panel wrapper (border, radius, padding)
    ProgressBar.tsx
    Checkbox.tsx

lib/
  storage.ts               # useLocalStorage hook
  types.ts                  # shared TypeScript types
  date-utils.ts             # helpers for filtering events by date, week ranges, etc.

context/
  DashboardContext.tsx      # selectedDate + setSelectedDate shared across panels
```

## 4. Layout specification

### Header bar
Full width, flex row, `justify-between`, items centered:
- Left: `Welcome, {settings.name}` (from settings, default "there" if unset)
- Center/right group: live date/time (updates every minute), weather (`{temp}°F · {condition}`, from Open-Meteo using `settings.location`), settings icon/link (`/settings`)

### Main grid
CSS grid, 3 columns x 2 rows:

```css
display: grid;
grid-template-columns: 1fr 2fr 1fr;
grid-template-rows: auto auto;
gap: 12px;
```

Panel placement:

| Row | Col 1 | Col 2 (2fr) | Col 3 |
|---|---|---|---|
| 1 | Agenda Panel | Calendar Panel | Habits Panel |
| 2 | Quick Links Panel | Editable Widget Panel (News Feed) | Portfolio Panel |

### Responsive behavior
- `lg` and above: 3 columns as specified
- below `lg`: collapse to 1 column, panels stack in the order: Calendar, Agenda, Habits, Editable Widget, Portfolio, Quick Links (calendar first since it's the primary panel)

### Theming
Dark theme by default (matches reference mockup: near-black background `#1f1c1b`-ish, panels `#4a4a4a`-ish gray cards, white/light text). Implement via Tailwind's `dark:` variant with `class` strategy, defaulting `<html class="dark">`. Light mode optional/secondary — dark is primary.

### Panel styling (all panels)
- Rounded corners (`rounded-lg`)
- Subtle border or slightly lighter background than page background to create contrast
- Consistent padding (`p-4` to `p-5`)
- Panel title at top, `text-sm font-medium`

## 5. Shared state

`DashboardContext` provides:
```ts
{
  selectedDate: string;        // ISO date, defaults to today
  setSelectedDate: (date: string) => void;
}
```
- `CalendarPanel` calls `setSelectedDate` when a day is clicked
- `AgendaPanel` reads `selectedDate` and filters events accordingly

## 6. Data models (`lib/types.ts`)

```ts
export type DashboardEvent = {
  id: string;
  title: string;
  date: string;        // ISO date, e.g. "2026-06-15"
  time?: string;        // "HH:mm", optional for all-day/undated items
  type: "event" | "task";
  completed?: boolean;   // only relevant when type === "task"
};

export type Habit = {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  target: number;        // e.g. 1 for daily, 3 for "3x per week"
  log: { date: string }[]; // completion timestamps (ISO dates)
};

export type QuickLink = {
  id: string;
  label: string;
  url: string;
  icon: string;          // tabler icon name, e.g. "brand-tiktok"
};

export type PortfolioHolding = {
  id: string;
  ticker: string;
  shares: number;
  costBasis: number;     // price per share at purchase
  datePurchased: string; // ISO date
};

export type EditableWidgetType = "news" | "watchlist" | "notes" | "pomodoro";

export type Settings = {
  name: string;
  location: { lat: number; lon: number; label: string };
  activeWidget: EditableWidgetType;
  newsCategory?: string;  // configurable for NewsFeedWidget
};
```

## 7. Panel specs

### CalendarPanel
- FullCalendar with `dayGridMonth`, `timeGridWeek`, `timeGridDay` views, view switcher in toolbar
- `@fullcalendar/interaction` enabled for drag-and-drop and click-to-create
- Events sourced from `events` array (localStorage), mapped to FullCalendar's event format
- `dateClick` and `eventClick` handlers update `selectedDate` via context
- Dragging an event updates its `date`/`time` in storage
- "+" button or click-on-empty-slot opens a small inline form (title, date, time, type: event/task)




### AgendaPanel ("Today's agenda")
- Title reflects `selectedDate` (e.g. "Today" if it equals today's date, otherwise the formatted date)
- Filters `events` where `event.date === selectedDate`, sorted by `time` ascending (undated items last)
- Renders as a list; items with `type: "task"` get a checkbox toggling `completed`; items with `type: "event"` render as plain rows (no checkbox)

### HabitsPanel ("Tasks & habits")
- Renders one row per habit from `habits` array
- Each row: name, progress bar (`completions in current period / target`), and a button/checkbox to log a completion for today
- Period calculation:
  - `frequency: "daily"` → resets each day; progress = count of `log` entries with today's date / target (target usually 1)
  - `frequency: "weekly"` → progress = count of `log` entries within the current week (Mon-Sun) / target

### QuickLinksPanel
- Renders `quickLinks` array as a row of circular icon buttons (Tabler brand icons), each an `<a>` to `link.url`
- Managed via Settings page (add/remove links)

### EditableWidgetPanel
- Reads `settings.activeWidget`
- Renders the corresponding widget component (`NewsFeedWidget`, etc.) based on a simple switch/map
- Initial build: only `NewsFeedWidget` is implemented; other options exist as stubs/placeholders in the settings dropdown for future use

#### NewsFeedWidget
- Fetches headlines from a free news/RSS API based on `settings.newsCategory` (default: general/top headlines)
- Caches results client-side with a timestamp, refetches if cache is older than ~30 minutes
- Renders a short list of headlines (title + source), each linking out to the article

### PortfolioPanel
- Renders `portfolio` array as a list: ticker, shares, current price (fetched), gain/loss % vs `costBasis`
- Gain/loss color-coded (green/red) using semantic Tailwind colors
- Editable inline or via a small "edit" mode (add/remove holdings, adjust shares/cost basis)

## 8. Settings page (`/settings`)

Sections:
- **Profile**: name (text input), location (search/select for weather — store lat/lon + display label)
- **Quick links**: list with add/remove, each entry has label, URL, and icon picker (from a small curated set of Tabler brand icons)
- **Editable widget**: dropdown to choose `activeWidget` (News feed selectable now; other options shown but marked "coming soon" or simply functional stubs)
- **Habits**: list with add/remove/edit, each habit configurable with name, frequency (daily/weekly), and target

All settings persist to `localStorage` under `dashboard:settings`, `dashboard:quickLinks`, `dashboard:habits`.

## 9. Persistence layer (`lib/storage.ts`)

A `useLocalStorage<T>(key: string, defaultValue: T)` hook:
- On mount, reads from `localStorage`, falling back to `defaultValue` if missing/invalid
- Returns `[value, setValue]` like `useState`, but `setValue` also writes to `localStorage`
- Used by every panel for its respective data slice:
  - `dashboard:events`
  - `dashboard:habits`
  - `dashboard:quickLinks`
  - `dashboard:portfolio`
  - `dashboard:settings`

## 10. Build order

1. Scaffold Next.js + Tailwind, set up dark theme, root layout, `Card` component
2. Build header (static first, then live clock + weather)
3. Build grid shell with placeholder panels in correct positions/sizes
4. Implement `useLocalStorage` + types
5. Build CalendarPanel (FullCalendar integration, basic month view first, then week/day + drag)
6. Build AgendaPanel wired to `selectedDate` via context
7. Build HabitsPanel + Settings habit configuration
8. Build QuickLinksPanel + Settings quick links configuration
9. Build PortfolioPanel
10. Build EditableWidgetPanel + NewsFeedWidget + Settings widget selector
11. Polish: responsive collapse, loading states, empty states