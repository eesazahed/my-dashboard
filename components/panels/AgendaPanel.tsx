"use client";

import { useState } from "react";
import { IconChecklist, IconPlus } from "@tabler/icons-react";
import { useDashboard } from "@/context/DashboardContext";
import {
  EventEditorModal,
  type EventFormState,
} from "@/components/events/EventEditorModal";
import { filterEventsByDate, formatAgendaTitle, generateId, getTodayIso } from "@/lib/date-utils";
import { CreateEventFromForm, UpdateEventFromForm } from "@/lib/event-utils";
import { ParseBaseEventId } from "@/lib/recurrence-utils";
import { FormatEventSchedule } from "@/lib/time-utils";
import { GetEventDotClasses } from "@/lib/link-colors";
import type { DashboardEvent } from "@/lib/types";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { ItemActionBar } from "@/components/ui/ItemActionBar";
import { Panel } from "@/components/ui/Panel";

export function AgendaPanel() {
  const { selectedDate, events, setEvents, showToast } = useDashboard();
  const activeDate = selectedDate || getTodayIso();
  const dayEvents = filterEventsByDate(events, activeDate);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<DashboardEvent | null>(null);

  const toggleTask = (id: string, completed: boolean) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, completed } : event,
      ),
    );
    showToast(completed ? "Task completed ✓" : "Task reopened");
  };

  const openEdit = (event: DashboardEvent) => {
    const baseId = ParseBaseEventId(event.id);
    const base = events.find((item) => item.id === baseId) ?? event;
    setEditingEvent(base);
    setModalOpen(true);
  };

  const deleteEvent = (id: string) => {
    const baseId = ParseBaseEventId(id);
    setEvents((prev) => prev.filter((event) => event.id !== baseId));
    setActiveId(null);
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
      showToast("Updated ✓");
    } else {
      setEvents((prev) => [...prev, CreateEventFromForm(form, generateId())]);
      showToast("Added ✓");
    }
    setModalOpen(false);
    setEditingEvent(null);
  };

  const openCreate = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  return (
    <>
      <Panel
        fillHeight
        title={`${formatAgendaTitle(activeDate)}'s agenda`}
        subtitle="Click an item to edit or delete"
        action={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
            aria-label="Add event or task"
          >
            <IconPlus size={16} />
          </button>
        }
      >
        {dayEvents.length === 0 ? (
          <EmptyState
            icon={<IconChecklist size={20} />}
            title="Clear schedule"
            description="Add an event or task with +"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <ul className="space-y-1.5">
            {dayEvents.map((event) => {
              const isActive = activeId === event.id;

              return (
                <li
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveId(isActive ? null : event.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setActiveId(isActive ? null : event.id)
                  }
                  className={`cursor-pointer rounded-lg border px-3 py-2.5 transition ${
                    isActive
                      ? "border-white/15 bg-white/[0.06]"
                      : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {event.type === "task" ? (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={event.completed ?? false}
                          onChange={(checked) => toggleTask(event.id, checked)}
                        />
                      </div>
                    ) : (
                      <span
                        className={`mt-1.5 size-1.5 shrink-0 rounded-full ${GetEventDotClasses(event.color, event.type)}`}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[13px] text-zinc-200 ${
                          event.completed ? "line-through opacity-40" : ""
                        }`}
                      >
                        {event.title}
                      </p>
                      {FormatEventSchedule(event) && (
                        <p className="mt-0.5 text-[11px] tabular-nums text-zinc-500">
                          {FormatEventSchedule(event)}
                        </p>
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <div className="mt-2 flex justify-end border-t border-white/[0.05] pt-2">
                      <ItemActionBar
                        onEdit={() => openEdit(event)}
                        onDelete={() => deleteEvent(event.id)}
                      />
                    </div>
                  )}
                </li>
              );
            })}
            </ul>
          </div>
        )}
      </Panel>

      <EventEditorModal
        open={modalOpen}
        editingEvent={editingEvent}
        defaultDate={activeDate}
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
