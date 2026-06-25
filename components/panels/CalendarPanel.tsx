"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import {
  EventEditorModal,
  type EventFormState,
} from "@/components/events/EventEditorModal";
import { useDashboard } from "@/context/DashboardContext";
import { ExpandAllEventOccurrences, ParseBaseEventId } from "@/lib/recurrence-utils";
import {
  CreateEventFromForm,
  GetEventSpanPosition,
  GetMultiDayLaneMap,
  IsMultiDayEvent,
  UpdateEventFromForm,
} from "@/lib/event-utils";
import {
  filterEventsByDate,
  formatIsoDate,
  generateId,
  getTodayIso,
  parseIsoDate,
} from "@/lib/date-utils";
import { GetEventRangeBuffer, GetWeekEventRange } from "@/lib/event-range";
import {
  formatDayTitle,
  formatMonthTitle,
  formatWeekTitle,
  getMonthCells,
  getWeekCells,
  getWeekdayLabels,
  groupEventsByDate,
  shiftViewDate,
  type CalendarView,
} from "@/lib/calendar-utils";
import { FormatEventSchedule } from "@/lib/time-utils";
import {
  GetEventBarClasses,
  GetEventCardClasses,
  GetEventChipClasses,
} from "@/lib/link-colors";
import type { DashboardEvent } from "@/lib/types";
import { ItemActionBar } from "@/components/ui/ItemActionBar";
import { Panel } from "@/components/ui/Panel";

type CalendarPanelProps = {
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
};

export function CalendarPanel({
  fullscreen = false,
  onToggleFullscreen,
}: CalendarPanelProps) {
  const {
    selectedDate,
    setSelectedDate,
    events,
    setEvents,
    fetchEventsForRange,
    showToast,
  } = useDashboard();
  const [view, setView] = useState<CalendarView>("month");
  const [viewDate, setViewDate] = useState(() => parseIsoDate(getTodayIso()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DashboardEvent | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const todayIso = getTodayIso();
  const activeDate = selectedDate || todayIso;
  const displayDate = view === "day" ? formatIsoDate(viewDate) : activeDate;
  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const expandedEvents = useMemo(
    () => ExpandAllEventOccurrences(events),
    [events],
  );
  const multiDayLaneMap = useMemo(
    () => GetMultiDayLaneMap(expandedEvents),
    [expandedEvents],
  );
  const weekdayLabels = getWeekdayLabels();

  useEffect(() => {
    const range =
      view === "week"
        ? GetWeekEventRange(formatIsoDate(viewDate))
        : view === "month"
          ? GetEventRangeBuffer(viewDate)
          : GetEventRangeBuffer(viewDate, 0);

    void fetchEventsForRange(range.from, range.to);
  }, [view, viewDate, fetchEventsForRange]);

  const openCreateModal = (date: string) => {
    setSelectedDate(date);
    setEditingEvent(null);
    setModalOpen(true);
  };

  const resolveBaseEvent = (event: DashboardEvent) => {
    const baseId = ParseBaseEventId(event.id);
    return events.find((item) => item.id === baseId) ?? event;
  };

  const openEditModal = (event: DashboardEvent) => {
    setEditingEvent(resolveBaseEvent(event));
    setModalOpen(true);
  };

  const handleSelectDate = (iso: string) => {
    setSelectedDate(iso);
    setViewDate(parseIsoDate(iso));
    setActiveEventId(null);
  };

  const navigate = (direction: -1 | 1) => {
    const next = shiftViewDate(viewDate, view, direction);
    setViewDate(next);
    if (view === "day") {
      setSelectedDate(formatIsoDate(next));
    }
    setActiveEventId(null);
  };

  const handleViewChange = (option: CalendarView) => {
    setView(option);
    if (option === "day") {
      setViewDate(parseIsoDate(activeDate));
    }
    setActiveEventId(null);
  };

  const goToday = () => {
    const today = parseIsoDate(todayIso);
    setViewDate(today);
    setSelectedDate(todayIso);
    setActiveEventId(null);
  };

  const deleteEvent = (id: string) => {
    const baseId = ParseBaseEventId(id);
    setEvents((prev) => prev.filter((event) => event.id !== baseId));
    setActiveEventId(null);
    setModalOpen(false);
    setEditingEvent(null);
    showToast("Deleted");
  };

  const handleSave = (form: EventFormState, editingId: string | null) => {
    if (editingId) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingId ? UpdateEventFromForm(event, form) : event,
        ),
      );
      setSelectedDate(form.date);
      showToast("Updated ✓");
    } else {
      setEvents((prev) => [...prev, CreateEventFromForm(form, generateId())]);
      setSelectedDate(form.date);
      showToast(`${form.type === "task" ? "Task" : "Event"} added ✓`);
    }
    setModalOpen(false);
    setEditingEvent(null);
  };

  const title =
    view === "month"
      ? formatMonthTitle(viewDate)
      : view === "week"
        ? formatWeekTitle(formatIsoDate(viewDate))
        : formatDayTitle(displayDate);

  const monthCells = getMonthCells(viewDate, todayIso);
  const weekCells = getWeekCells(formatIsoDate(viewDate), todayIso);
  const dayEvents = filterEventsByDate(events, displayDate);

  const renderEventCard = (item: DashboardEvent, compact = false) => {
    const isActive = activeEventId === item.id;

    return (
      <div
        key={item.id}
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          setActiveEventId(isActive ? null : item.id);
        }}
        onDoubleClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            setActiveEventId(isActive ? null : item.id);
          }
        }}
        className={`rounded-lg border text-left transition ${
          compact ? "px-2 py-1.5" : "px-4 py-3"
        } ${GetEventCardClasses(item.color, item.type)} ${
          item.completed ? "opacity-50 line-through" : ""
        } ${isActive ? "ring-1 ring-white/20" : ""}`}
      >
        {FormatEventSchedule(item) ? (
          <p className="text-[10px] tabular-nums text-zinc-500">
            {FormatEventSchedule(item)}
          </p>
        ) : null}
        <p className={`leading-snug text-zinc-200 ${compact ? "text-[11px]" : "text-sm"}`}>
          {item.title}
        </p>
        {isActive && (
          <div
            className={`flex justify-end border-t border-white/[0.06] ${compact ? "mt-1.5 pt-1.5" : "mt-2 pt-2"}`}
          >
            <ItemActionBar
              onEdit={() => openEditModal(item)}
              onDelete={() => deleteEvent(item.id)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Panel noPadding fillHeight className="relative">
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100"
                aria-label="Previous"
              >
                <IconChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goToday}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.06]"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => navigate(1)}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100"
                aria-label="Next"
              >
                <IconChevronRight size={18} />
              </button>
            </div>

            <h2 className="text-base font-semibold text-zinc-100">{title}</h2>

            <div className="flex items-center">
              <div className="flex rounded-lg bg-white/[0.04] p-0.5">
                {(["month", "week", "day"] as CalendarView[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleViewChange(option)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                      view === option
                        ? "bg-white/[0.1] text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => openCreateModal(displayDate)}
                className="ml-3 flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-400 active:scale-95"
                aria-label="Add event"
              >
                <IconPlus size={16} stroke={2.5} />
              </button>
              {onToggleFullscreen && (
                <button
                  type="button"
                  onClick={onToggleFullscreen}
                  className="ml-2 flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100"
                  aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen calendar"}
                >
                  {fullscreen ? (
                    <IconArrowsMinimize size={16} />
                  ) : (
                    <IconArrowsMaximize size={16} />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {view === "month" && (
              <div className="overflow-visible rounded-xl border border-white/[0.06]">
                <div className="grid grid-cols-7 border-b border-white/[0.05] bg-white/[0.02]">
                  {weekdayLabels.map((label) => (
                    <div
                      key={label}
                      className="px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-zinc-500"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {monthCells.map((cell) => {
                    const dayEventsList = eventsByDate[cell.iso] ?? [];
                    const multiDayEvents = dayEventsList.filter(IsMultiDayEvent);
                    const singleDayEvents = dayEventsList.filter(
                      (item) => !IsMultiDayEvent(item),
                    );
                    const isSelected = cell.iso === activeDate;

                    const cellTint = isSelected
                      ? "bg-emerald-500/18"
                      : cell.isToday
                        ? "bg-emerald-500/10"
                        : "";

                    return (
                      <button
                        key={cell.iso}
                        type="button"
                        onClick={() => handleSelectDate(cell.iso)}
                        onDoubleClick={() => openCreateModal(cell.iso)}
                        className={`calendar-cell flex min-h-[92px] flex-col items-start overflow-visible border-b border-r border-white/[0.04] pt-1.5 pl-1.5 pr-0 pb-1 text-left ${cellTint}`}
                      >
                        <span
                          className={`text-xs font-medium leading-none ${
                            cell.isCurrentMonth ? "text-zinc-300" : "text-zinc-600"
                          }`}
                        >
                          {cell.date.getDate()}
                        </span>
                        <div className="relative mt-1 w-full overflow-visible">
                          {multiDayEvents.map((item) => {
                            const position = GetEventSpanPosition(item, cell.iso);
                            if (!position) return null;

                            const lane = multiDayLaneMap[item.id] ?? 0;

                            return (
                              <div
                                key={item.id}
                                style={{ marginTop: lane > 0 ? lane * 20 : 0 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(item);
                                }}
                                className={`relative z-10 mb-0.5 h-[18px] cursor-pointer truncate px-1.5 text-[10px] leading-[18px] text-white transition ${GetEventBarClasses(item.color)} ${
                                  position === "start"
                                    ? "mr-[-4px] rounded-l-md"
                                    : position === "end"
                                      ? "ml-[-4px] rounded-r-md"
                                      : "mx-[-4px] rounded-none"
                                }`}
                              >
                                {position === "start" ? item.title : "\u00a0"}
                              </div>
                            );
                          })}
                          <div className="space-y-0.5 pr-1">
                            {singleDayEvents.slice(0, 2).map((item) => (
                              <div
                                key={item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(item);
                                }}
                                className={`cursor-pointer truncate rounded border px-1 py-0.5 text-[10px] hover:ring-1 hover:ring-white/20 ${GetEventChipClasses(item.color)} ${
                                  item.type === "task" && !item.color
                                    ? "bg-blue-500/15 text-blue-300 border-blue-500/25"
                                    : ""
                                } ${item.completed ? "line-through opacity-50" : ""}`}
                              >
                                {item.title}
                              </div>
                            ))}
                            {singleDayEvents.length > 2 && (
                              <p className="text-[10px] text-zinc-600">
                                +{singleDayEvents.length - 2} more
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {view === "week" && (
              <div className="grid h-full min-h-[480px] grid-cols-7 gap-2">
                {weekCells.map((cell) => {
                  const dayEventsList = eventsByDate[cell.iso] ?? [];
                  const isSelected = cell.iso === activeDate;

                  return (
                    <div
                      key={cell.iso}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectDate(cell.iso)}
                      onDoubleClick={() => openCreateModal(cell.iso)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSelectDate(cell.iso);
                      }}
                      className={`flex min-h-[480px] cursor-pointer flex-col rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? "border-white/20 bg-white/[0.06]"
                          : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="shrink-0 border-b border-white/[0.05] pb-2">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          {cell.date.toLocaleDateString(undefined, {
                            weekday: "short",
                          })}
                        </p>
                        <p
                          className={`mt-0.5 text-xl font-semibold ${
                            cell.isToday ? "text-zinc-100" : "text-zinc-300"
                          }`}
                        >
                          {cell.date.getDate()}
                        </p>
                      </div>
                      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
                        {dayEventsList.length === 0 ? (
                          <p className="py-4 text-center text-[11px] text-zinc-600">
                            No events
                          </p>
                        ) : (
                          dayEventsList.map((item) => renderEventCard(item, true))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {view === "day" && (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                {dayEvents.length === 0 ? (
                  <p className="py-12 text-center text-sm text-zinc-500">
                    Nothing scheduled. Click + to add.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {dayEvents.map((item) => (
                      <li key={item.id}>{renderEventCard(item)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </Panel>

      <EventEditorModal
        open={modalOpen}
        editingEvent={editingEvent}
        defaultDate={displayDate}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSave}
        onDelete={deleteEvent}
      />
    </>
  );
}
