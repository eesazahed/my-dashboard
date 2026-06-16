"use client";

import { useState } from "react";
import { IconMinus, IconPlus, IconTarget } from "@tabler/icons-react";
import { useDashboard } from "@/context/DashboardContext";
import {
  countHabitCompletions,
  countHabitLogsForDate,
  generateId,
  GetHabitStreak,
  getTodayIso,
} from "@/lib/date-utils";
import type { Habit } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { ItemActionBar } from "@/components/ui/ItemActionBar";
import { Modal } from "@/components/ui/Modal";
import { Panel } from "@/components/ui/Panel";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Select } from "@/components/ui/Select";

export function HabitsPanel() {
  const { habits, setHabits, showToast } = useDashboard();
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = new Date();
  const todayIso = getTodayIso();

  const logCompletion = (habit: Habit) => {
    const completions = countHabitCompletions(habit, today);
    if (completions >= habit.target) return;

    setHabits((prev) =>
      prev.map((item) =>
        item.id === habit.id
          ? { ...item, log: [...item.log, { date: todayIso }] }
          : item,
      ),
    );
    showToast("Habit logged ✓");
  };

  const unlogToday = (habitId: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        const todayIndex = habit.log.findLastIndex(
          (entry) => entry.date === todayIso,
        );
        if (todayIndex === -1) return habit;
        const log = [...habit.log];
        log.splice(todayIndex, 1);
        return { ...habit, log };
      }),
    );
    showToast("Habit unlogged");
  };

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits((prev) => [
      ...prev,
      {
        id: generateId(),
        name: newName.trim(),
        frequency: "daily",
        target: 1,
        log: [],
      },
    ]);
    setNewName("");
    setShowAdd(false);
    showToast("Habit added ✓");
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id));
    setActiveId(null);
    showToast("Habit deleted");
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditModalOpen(true);
  };

  const saveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingHabit) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const frequency = formData.get("frequency") as "daily" | "weekly";
    const target = parseInt(String(formData.get("target") ?? "1"), 10) || 1;

    if (!name) return;

    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === editingHabit.id
          ? { ...habit, name, frequency, target }
          : habit,
      ),
    );
    setEditModalOpen(false);
    setEditingHabit(null);
    showToast("Habit updated ✓");
  };

  const canLogMore = (habit: Habit) =>
    countHabitCompletions(habit, today) < habit.target;

  const canUnlogToday = (habit: Habit) =>
    countHabitLogsForDate(habit, todayIso) > 0;

  return (
    <>
      <Panel
        fillHeight
        title="Habits"
        subtitle="Weekly habits reset every Sunday · data persists in browser"
        action={
          <button
            type="button"
            onClick={() => setShowAdd((prev) => !prev)}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
            aria-label="Add habit"
          >
            <IconPlus size={16} />
          </button>
        }
      >
        {showAdd && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              placeholder="New habit…"
              className="flex-1 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-white/20"
              autoFocus
            />
            <button
              type="button"
              onClick={addHabit}
              className="rounded-lg bg-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/[0.12]"
            >
              Add
            </button>
          </div>
        )}

        {habits.length === 0 ? (
          <EmptyState
            icon={<IconTarget size={20} />}
            title="No habits yet"
            description="Tap + above to add your first habit"
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <ul className="space-y-3">
            {habits.map((habit) => {
              const completions = countHabitCompletions(habit, today);
              const streak = GetHabitStreak(habit, today);
              const isActive = activeId === habit.id;

              return (
                <li
                  key={habit.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveId(isActive ? null : habit.id)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setActiveId(isActive ? null : habit.id)
                  }
                  className={`cursor-pointer rounded-xl border p-3.5 transition ${
                    isActive
                      ? "border-white/15 bg-white/[0.06]"
                      : "border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="mb-2.5 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium text-zinc-100">
                        {habit.name}
                      </span>
                      {streak >= 2 && (
                        <p className="mt-0.5 text-[11px] font-medium tabular-nums text-orange-400">
                          {streak}x streak
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] capitalize text-zinc-500">
                      {habit.frequency}
                    </span>
                  </div>
                  <ProgressBar value={completions} max={habit.target} />
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] tabular-nums text-zinc-500">
                      {completions}/{habit.target} done
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          unlogToday(habit.id);
                        }}
                        disabled={!canUnlogToday(habit)}
                        className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.08] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Remove one log for today"
                      >
                        <IconMinus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          logCompletion(habit);
                        }}
                        disabled={!canLogMore(habit)}
                        className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.08] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
                        aria-label="Log one completion"
                      >
                        <IconPlus size={14} />
                      </button>
                    </div>
                  </div>
                  {isActive && (
                    <div className="mt-2.5 flex justify-end border-t border-white/[0.05] pt-2">
                      <ItemActionBar
                        onEdit={() => openEdit(habit)}
                        onDelete={() => deleteHabit(habit.id)}
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

      <Modal
        open={editModalOpen}
        title="Edit habit"
        onClose={() => {
          setEditModalOpen(false);
          setEditingHabit(null);
        }}
      >
        {editingHabit && (
          <form onSubmit={saveEdit} className="space-y-4">
            <Input
              label="Name"
              name="name"
              defaultValue={editingHabit.name}
              required
            />
            <Select
              label="Frequency"
              name="frequency"
              defaultValue={editingHabit.frequency}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </Select>
            <Input
              label="Target"
              name="target"
              type="number"
              min={1}
              defaultValue={editingHabit.target}
              required
            />
            <Button type="submit" className="w-full">
              Save changes
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
}
