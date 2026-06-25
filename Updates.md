# Updates

## 2026-06-25 (event/task delete in editor)

- Edit modal: trash icon in header instantly deletes events and tasks (not only events in advanced options)

## 2026-06-23 (calendar new tab + feed URL fix)

- Replaced fullscreen calendar with “open in new tab” (`/calendar` page)
- Calendar subscription URL uses browser origin in Settings; server uses `APP_URL` / forwarded host headers

## 2026-06-23 (event colors, calendar fullscreen, iCal feed)

- Calendar events/tasks: color picker in editor (same palette as quick links); colors on month/week/day views and agenda dots
- Calendar fullscreen button — other widgets slide out; header/thought dump collapse; toggle back with minimize
- Public iCal subscription URL in Settings (secret token) — add to Google Calendar via “From URL”; `/api/calendar/[token]`

## 2026-06-16 (Nest update.sh)

- `update.sh` — pull, install, build, restart systemd; backs up `.db` before each deploy
- `data/.gitignore` — extra guard so database files are never committed

## 2026-06-16 (thought dump scrollbars + resize)

- Thought dump shows scrollbars when content overflows, vertically resizable, default height on each load

## 2026-06-16 (database export backup API)

- Export uses SQLite backup API so tables/data are included (fixes empty backup imports)

## 2026-06-16 (database backup import fix)

- Export checkpoints SQLite WAL before download so backups import cleanly
- Import accepts .db/.dbi, clears stale WAL files, clearer error messages

## 2026-06-16 (login refresh loop fix)

- Login page no longer fetches bootstrap or redirects to itself on 401

## 2026-06-15 (settings latest commit)

- Settings shows latest GitHub commit hash and relative time for eesazahed/my-dashboard

## 2026-06-15 (SQLite, auth, lazy events, backup)

- Replaced localStorage with SQLite (`data/dashboard.db`, gitignored)
- Password login at `/login` with session cookie (`DASHBOARD_PASSWORD`, `SESSION_SECRET` in `.env`)
- Events lazy-loaded by month range; habits/portfolio/settings load on bootstrap
- Habit streaks computed server-side on bootstrap
- Settings: download/import full `.db` backup
- Portfolio duplicate-ticker fix (`key` + remove by `id`)
- Nest: set `PORT=33541` in `.env`, `npm run build && npm run start`

## 2026-06-15 (week view day select)

- Week view: entire day column is clickable to switch selected date

## 2026-06-15 (habit streaks)

- Orange Nx streak when a habit hits 100% of target for 2+ consecutive days (or weeks)

## 2026-06-15 (habit multi-log)

- Daily/weekly habits use +/− to log multiple completions up to target (e.g. 3/5 prayers)

## 2026-06-15 (agenda add button)

- Agenda panel header + opens new event/task modal for the selected day

## 2026-06-15 (news top 10, larger text)

- BBC + Hacker News show top 10 headlines each with slightly larger type

## 2026-06-15 (news stack, portfolio fixes, page title)

- News: BBC stacked above Hacker News
- Portfolio summary: Total above Today; holdings show today’s change not all-time
- Browser tab: default "My dashboard", with name set → "[name] - dashboard"

## 2026-06-15 (news typography and limit)

- BBC + Hacker News show top 5 headlines each, side by side, no scroll
- Improved headline size, contrast, and Last updated header line

## 2026-06-15 (grid column alignment)

- Bottom row columns align with top row: Quick links ↔ Agenda, News ↔ Calendar, Portfolio ↔ Habits
- Both rows share 640px height

## 2026-06-15 (2×3 grid layout)

- Bottom row: Quick links (full height) | News (narrow) | Portfolio (full height, right of news)
- News stacked vertically, smaller type, tighter truncation, icon-only comments

## 2026-06-15 (hidden scrollbars, portfolio last updated)

- Scrollbars hidden app-wide; scrolling still works
- Portfolio header shows Last updated at HH:mm like news feeds

## 2026-06-15 (quick links grid)

- Quick links: 4-column grid, larger square tiles, scroll for overflow

## 2026-06-15 (settings trim, homepage quick links, stocks API fix)

- Settings: Profile + Portfolio only (removed habits, widget picker, quick links)
- Quick links addable from homepage via + button and modal
- Stock API switched to Yahoo chart endpoint (v7 quote was returning empty)

## 2026-06-15 (news cache, portfolio widget)

- BBC + Hacker News cached in localStorage for 6 hours with "Last updated at HH:mm"
- Portfolio panel under quick links (50/50 split, matches news column height, internal scroll)
- Stock prices fetched hourly via /api/stocks with localStorage cache; holdings added manually

## 2026-06-15 (event modal advanced + recurring)

- Event popup: default shows Title, Start date/time, Type only
- Advanced options expands modal width: end date/time, recurring settings, delete
- Recurring events: daily or weekly on selected days for N weeks
- Tasks remain one-time only; events support multi-day + recurrence

## 2026-06-15 (continuous time wheel)

- Time picker wheel: free continuous scroll, infinite loop (hours 00–23, minutes 00–59), no snap

## 2026-06-15 (time picker wheel)

- Removed HH:mm hint; manual typing still works (e.g. 15:00)
- Double-click time input opens scroll wheel picker (12hr labels, infinite AM/PM scroll)

## 2026-06-15 (military time app-wide)

- Replaced native time pickers with 24-hour HH:mm inputs (no AM/PM)
- All time display uses military format (header, agenda, calendar)

## 2026-06-15 (multi-day events)

- Optional end date/time on events; spans multiple calendar days like Google Calendar
- Month view shows connected blue bars across days; agenda/week/day show full schedule

## 2026-06-15 (news comments spacing)

- More gap between HN headlines and comments link; titles truncate earlier

## 2026-06-15 (links, news, scroll polish)

- Quick links: icon-only tiles, hover popover with edit/delete, color tint on edit
- News: no panel header, BBC news + Hacker news linked column titles, 20 items, scrollable max height, truncated titles
- Habits and agenda lists scroll internally when content overflows

## 2026-06-15 (quick links tooltip + centering)

- Tooltips render via portal so they are no longer clipped by panel overflow
- Link grid centered with fixed-width tiles

## 2026-06-15 (news feed two-column)

- Split news feed into two equal columns: World news (BBC) and Tech news (Hacker News)
- HN items link to article and comments
- Removed dividers and source pills under headlines
- Settings no longer has news category picker (layout is fixed)

## 2026-06-15 (quick links polish)

- Redesigned link tiles: icon + label, cleaner layout for narrow panel
- Hover tooltip shows full URL (e.g. https://github.com/eesazahed)
- Generic / unknown links use link icon; brand icons auto-detected from URL when icon is "link"
- New links default to generic link icon in Settings

## 2026-06-15 (toast fade-out)

- Toast now fades out smoothly before disappearing (was instant unmount)

## 2026-06-15 (calendar hover removed)

- Removed hover tint on month-view day cells

## 2026-06-15 (calendar day cell styling)

- Day numbers top-left with equal padding (top matches left)
- Today: subtle green cell tint (no white number badge)
- Selected day: slightly darker green tint

## 2026-06-15 (habit unlog, Sunday week, + button move)

- **Unlog today** — toggles off today's habit log only (past days untouched)
- **Week starts Sunday** — calendar + weekly habit counting aligned
- **+ button** — small green button next to Month/Week/Day picker with left margin

## 2026-06-15 (military time + edit/delete)

- Header clock: **24-hour time with seconds** (updates every second)
- Click any **event/task** in agenda, day view, or week view → **Edit / Delete**
- Click any **habit** → **Edit / Delete** (modal for edit)
- Month view: click event chip to edit directly

## 2026-06-15 (Notion polish + UX fixes)

- **Fixed day view navigation** — arrows now advance/rewind the selected day
- **Week view** — taller columns (480px) with scrollable event cards per day
- **Equal-height sidebars** — agenda & habits match 640px calendar height
- **Thought dump bar** — full-width notepad above the grid, auto-saves
- **Habits** — reorganized cards + add habits inline from homepage (+ button)
- **Notion-like UI** — #191919 background, softer panels, minimal borders
- **News** — divider layout, relaxed line-height, source pills
- **Quick links** — horizontal cards with icon + label + external link hint
- **Calendar + button** — repositioned with more spacing (bottom-7 right-7)
- **Settings dropdowns** — chevron with proper right padding

## 2026-06-15 (PRODUCTION FIX — all buttons work)

- **Root cause:** React hydration was failing (datetime SSR mismatch) → zero click handlers attached
- **Fix:** Centralized ALL data in `DashboardContext` — one source of truth, instant cross-panel sync
- **Fix:** Header clock loads client-side only (no hydration crash)
- **Fix:** Settings + all panels share same context — add event → agenda updates instantly
- **Demo seed:** First visit auto-populates sample events, habits, quick links, name "Eesa"
- **Toast feedback** on every action (add event, log habit, save settings)
- Run for demo: `npm run build && npm run start` then hard refresh

## 2026-06-15 (settings page actually renders)

- **Fixed settings showing empty skeleton boxes forever** — removed broken loading gate; form renders immediately with labeled inputs
- Settings now uses `useLocalStorage` directly — edits save automatically as you type
- **Save & go back** button returns to dashboard with confirmation
- Clear section labels: Profile, Quick links, Dashboard widget, Habits

## 2026-06-15 (settings fix, remove weather/stocks, overscroll fix)

- **Fixed settings stuck on "Loading settings"** — replaced broken hydration hook with `useSyncExternalStore`; settings form renders immediately with skeleton placeholders
- **Removed weather** from header and location search from settings
- **Removed portfolio/stocks** panel and stock API route
- **Fixed white flash on overscroll** — solid `#141312` background on `html`/`body`, `overscroll-behavior: none`, `color-scheme: dark`
- Bottom row layout: Quick Links + wider News widget (no portfolio slot)

## 2026-06-15 (major UI overhaul + working calendar)

- **Replaced broken FullCalendar** with a custom-built calendar that renders instantly — month grid with day numbers, week view, day view, event chips, today highlight, selected day ring
- **Calendar interactions**: click day to select, double-click or **+** to add events/tasks, modal form with Save/Cancel
- **Full UI redesign**: new Panel/Button/Input/Modal/EmptyState components, gradient background, rounded cards, better typography and spacing
- **Settings page rebuilt** with draft state, sticky **Save changes** footer, unsaved-changes indicator, success confirmation
- **All panels polished**: empty states with icons, skeleton loading for news, improved habits progress bars, portfolio edit mode
- Fixed storage hydration hook for reliable client-side data loading

## 2026-06-15 (fix — calendar + functionality)

- **Fixed calendar stuck on "Loading calendar…"** — removed broken `next/dynamic` import that never hydrated; calendar now renders FullCalendar directly
- Calendar matches Canva mockup: large center panel, green **+** FAB, click any day to create events/tasks, drag-and-drop, month/week/day views
- Improved FullCalendar dark-theme styling (visible day grid, today highlight, toolbar)
- Header shows live date/time and weather; Settings as text link like mockup
- Panel color updated to `#696969` to match Canva design
- News feed now fetches via `/api/news` server route (more reliable than client-only RSS)

## 2026-06-15

Built the Personal Dashboard from `prod.md`:

- Scaffolded Next.js 16 (App Router) + Tailwind CSS 4 + TypeScript
- Dark theme (`#1f1c1b` page, `#4a4a4a` panels) with responsive 3×2 grid
- `useLocalStorage` hook and shared types for events, habits, quick links, portfolio, settings
- `DashboardContext` for cross-panel `selectedDate` state
- Header with welcome message, live clock, Open-Meteo weather, settings link
- Panels: Calendar (FullCalendar month/week/day + drag-and-drop + inline create), Agenda, Habits, Quick Links, Editable Widget (News Feed), Portfolio
- Settings page: profile, location search, quick links, widget selector, habits
- External integrations: Open-Meteo weather/geocoding, RSS2JSON news (BBC feeds), Yahoo Finance stock proxy API route
- Widget stubs: Watchlist, Notes, Pomodoro (coming soon)

Run with `npm run dev`. Optional: set `NEXT_PUBLIC_FINNHUB_API_KEY` in `.env.local` for direct client-side stock quotes.
