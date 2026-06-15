"use client";

import { useEffect, useState } from "react";
import type { DashboardEvent } from "@/lib/types";
import { InferRecurrenceWeeks } from "@/lib/event-utils";
import { WeekdayLabels } from "@/lib/recurrence-utils";
import { parseIsoDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MilitaryTimeInput } from "@/components/ui/MilitaryTimeInput";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

export type EventFormState = {
  title: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  type: "event" | "task";
  recurring: boolean;
  recurrenceFrequency: "daily" | "weekly";
  recurrenceWeekdays: number[];
  recurrenceWeeks: string;
};

type EventEditorModalProps = {
  open: boolean;
  editingEvent: DashboardEvent | null;
  defaultDate: string;
  onClose: () => void;
  onSave: (form: EventFormState, editingId: string | null) => void;
  onDelete?: (id: string) => void;
};

function BuildInitialForm(
  editingEvent: DashboardEvent | null,
  defaultDate: string,
): EventFormState {
  const startWeekday = parseIsoDate(
    editingEvent?.date ?? defaultDate,
  ).getDay();

  return {
    title: editingEvent?.title ?? "",
    date: editingEvent?.date ?? defaultDate,
    time: editingEvent?.time ?? "",
    endDate: editingEvent?.endDate ?? "",
    endTime: editingEvent?.endTime ?? "",
    type: editingEvent?.type ?? "event",
    recurring: Boolean(editingEvent?.recurrence),
    recurrenceFrequency: editingEvent?.recurrence?.frequency ?? "weekly",
    recurrenceWeekdays: editingEvent?.recurrence?.weekdays ?? [startWeekday],
    recurrenceWeeks: editingEvent?.recurrence
      ? InferRecurrenceWeeks(
          editingEvent.date,
          editingEvent.recurrence.until,
        )
      : "4",
  };
}

export function EventEditorModal({
  open,
  editingEvent,
  defaultDate,
  onClose,
  onSave,
  onDelete,
}: EventEditorModalProps) {
  const [ShowAdvanced, SetShowAdvanced] = useState(false);
  const isEditing = editingEvent !== null;

  useEffect(() => {
    if (!open) SetShowAdvanced(false);
  }, [open]);

  return (
    <Modal
      open={open}
      wide={ShowAdvanced}
      title={isEditing ? "Edit event or task" : "New event or task"}
      onClose={() => {
        SetShowAdvanced(false);
        onClose();
      }}
    >
      <EventEditorForm
        key={editingEvent?.id ?? `new-${defaultDate}`}
        editingEvent={editingEvent}
        defaultDate={defaultDate}
        showAdvanced={ShowAdvanced}
        setShowAdvanced={SetShowAdvanced}
        onClose={() => {
          SetShowAdvanced(false);
          onClose();
        }}
        onSave={onSave}
        onDelete={onDelete}
      />
    </Modal>
  );
}

function EventEditorForm({
  editingEvent,
  defaultDate,
  showAdvanced,
  setShowAdvanced,
  onClose,
  onSave,
  onDelete,
}: {
  editingEvent: DashboardEvent | null;
  defaultDate: string;
  showAdvanced: boolean;
  setShowAdvanced: (value: boolean) => void;
  onClose: () => void;
  onSave: (form: EventFormState, editingId: string | null) => void;
  onDelete?: (id: string) => void;
}) {
  const [Form, SetForm] = useState<EventFormState>(() =>
    BuildInitialForm(editingEvent, defaultDate),
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!Form.title.trim()) return;
    onSave(Form, editingEvent?.id ?? null);
  };

  const isEvent = Form.type === "event";

  const toggleWeekday = (day: number) => {
    SetForm((prev) => {
      const selected = prev.recurrenceWeekdays.includes(day)
        ? prev.recurrenceWeekdays.filter((value) => value !== day)
        : [...prev.recurrenceWeekdays, day].sort((a, b) => a - b);

      return {
        ...prev,
        recurrenceWeekdays: selected.length > 0 ? selected : [day],
      };
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-start overflow-hidden">
        <div className="min-w-[280px] flex-1 space-y-4">
          <Input
            label="Title"
            value={Form.title}
            onChange={(e) => SetForm({ ...Form, title: e.target.value })}
            placeholder="Meeting, workout, etc."
            autoFocus
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start date"
              type="date"
              value={Form.date}
              onChange={(e) => SetForm({ ...Form, date: e.target.value })}
            />
            <MilitaryTimeInput
              label="Start time"
              value={Form.time}
              onChange={(time) => SetForm({ ...Form, time })}
            />
          </div>
          <Select
            label="Type"
            value={Form.type}
            onChange={(e) => {
              const type = e.target.value as "event" | "task";
              SetForm({
                ...Form,
                type,
                endDate: type === "task" ? "" : Form.endDate,
                endTime: type === "task" ? "" : Form.endTime,
                recurring: type === "task" ? false : Form.recurring,
              });
              if (type === "task") setShowAdvanced(false);
            }}
          >
            <option value="event">Event</option>
            <option value="task">Task</option>
          </Select>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              {editingEvent ? "Save changes" : "Save"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>

          {isEvent && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide advanced options" : "Advanced options"}
            </Button>
          )}
        </div>

        <div
          className={`shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
            showAdvanced && isEvent
              ? "ml-6 w-[280px] opacity-100"
              : "ml-0 w-0 opacity-0"
          }`}
        >
          {isEvent && (
            <div className="space-y-4 border-l border-white/[0.08] pl-6">
              <div className="space-y-3">
                <Input
                  label="End date"
                  type="date"
                  value={Form.endDate}
                  min={Form.date}
                  onChange={(e) =>
                    SetForm({ ...Form, endDate: e.target.value })
                  }
                />
                <MilitaryTimeInput
                  label="End time"
                  value={Form.endTime}
                  onChange={(endTime) => SetForm({ ...Form, endTime })}
                />
              </div>

              <fieldset className="space-y-3 rounded-xl border border-white/[0.08] bg-black/20 p-3.5">
                <label className="flex items-center gap-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={Form.recurring}
                    onChange={(e) =>
                      SetForm({ ...Form, recurring: e.target.checked })
                    }
                    className="rounded border-white/20 bg-transparent"
                  />
                  Recurring event
                </label>

                {Form.recurring && (
                  <div className="space-y-3">
                    <Select
                      label="How often"
                      value={Form.recurrenceFrequency}
                      onChange={(e) =>
                        SetForm({
                          ...Form,
                          recurrenceFrequency: e.target.value as
                            | "daily"
                            | "weekly",
                        })
                      }
                    >
                      <option value="daily">Every day</option>
                      <option value="weekly">Weekly on selected days</option>
                    </Select>

                    {Form.recurrenceFrequency === "weekly" && (
                      <div>
                        <span className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          Days
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {WeekdayLabels.map((label, index) => {
                            const selected = Form.recurrenceWeekdays.includes(
                              index,
                            );
                            return (
                              <button
                                key={label}
                                type="button"
                                onClick={() => toggleWeekday(index)}
                                className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
                                  selected
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : "bg-white/[0.06] text-zinc-400 hover:text-zinc-200"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Input
                      label="For how many weeks"
                      type="number"
                      min={1}
                      value={Form.recurrenceWeeks}
                      onChange={(e) =>
                        SetForm({
                          ...Form,
                          recurrenceWeeks: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </fieldset>

              {editingEvent && onDelete && (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full text-red-400 hover:text-red-300"
                  onClick={() => {
                    onDelete(editingEvent.id);
                    onClose();
                  }}
                >
                  Delete calendar item
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
