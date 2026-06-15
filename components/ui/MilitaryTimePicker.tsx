"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { BuildMilitaryTime, ParseMilitaryTimeParts } from "@/lib/time-utils";

const ItemHeight = 36;
const RepeatBlocks = 31;
const EdgeMarginBlocks = 3;
const CenterOffsetItems = 2;

type WheelOption = {
  value: number;
  label: string;
};

type ContinuousLoopWheelProps = {
  options: WheelOption[];
  value: number;
  onChange: (value: number) => void;
};

function ContinuousLoopWheel({
  options,
  value,
  onChange,
}: ContinuousLoopWheelProps) {
  const ContainerRef = useRef<HTMLDivElement>(null);
  const IsAdjustingRef = useRef(false);
  const RafRef = useRef<number | null>(null);
  const ValueRef = useRef(value);

  ValueRef.current = value;

  const repeatedOptions = useMemo(
    () => Array.from({ length: RepeatBlocks }, () => options).flat(),
    [options],
  );

  const scrollToValue = useCallback(
    (nextValue: number) => {
      const container = ContainerRef.current;
      if (!container) return;

      const baseIndex = options.findIndex((option) => option.value === nextValue);
      if (baseIndex === -1) return;

      const middleBlock = Math.floor(RepeatBlocks / 2);
      const targetIndex = middleBlock * options.length + baseIndex;

      IsAdjustingRef.current = true;
      container.scrollTop = targetIndex * ItemHeight;
      requestAnimationFrame(() => {
        IsAdjustingRef.current = false;
      });
    },
    [options],
  );

  useEffect(() => {
    scrollToValue(value);
  }, [scrollToValue, value]);

  const handleScroll = () => {
    if (IsAdjustingRef.current) return;

    if (RafRef.current !== null) cancelAnimationFrame(RafRef.current);

    RafRef.current = requestAnimationFrame(() => {
      const container = ContainerRef.current;
      if (!container) return;

      const cycleLength = options.length;
      const rawIndex = Math.round(container.scrollTop / ItemHeight);
      const modIndex =
        ((rawIndex % cycleLength) + cycleLength) % cycleLength;
      const selected = options[modIndex];

      if (selected.value !== ValueRef.current) {
        onChange(selected.value);
      }

      const margin = cycleLength * EdgeMarginBlocks;
      const minIndex = margin;
      const maxIndex = cycleLength * RepeatBlocks - margin;

      if (rawIndex < minIndex || rawIndex > maxIndex) {
        const middleIndex = cycleLength * Math.floor(RepeatBlocks / 2);
        IsAdjustingRef.current = true;
        container.scrollTop = (middleIndex + modIndex) * ItemHeight;
        requestAnimationFrame(() => {
          IsAdjustingRef.current = false;
        });
      }
    });
  };

  useEffect(() => {
    return () => {
      if (RafRef.current !== null) cancelAnimationFrame(RafRef.current);
    };
  }, []);

  return (
    <div className="relative h-[180px] flex-1">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-9 -translate-y-1/2 rounded-lg border border-white/10 bg-white/[0.06]" />
      <div
        ref={ContainerRef}
        onScroll={handleScroll}
        className="time-wheel h-full overflow-y-auto"
      >
        {Array.from({ length: CenterOffsetItems }).map((_, index) => (
          <div key={`pad-top-${index}`} style={{ height: ItemHeight }} aria-hidden />
        ))}
        {repeatedOptions.map((option, index) => (
          <div
            key={`${option.value}-${index}`}
            style={{ height: ItemHeight }}
            className={`flex items-center justify-center text-sm tabular-nums ${
              option.value === value
                ? "font-medium text-zinc-100"
                : "text-zinc-500"
            }`}
          >
            {option.label}
          </div>
        ))}
        {Array.from({ length: CenterOffsetItems }).map((_, index) => (
          <div
            key={`pad-bottom-${index}`}
            style={{ height: ItemHeight }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

type MilitaryTimePickerProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
};

export function MilitaryTimePicker({
  open,
  anchorRef,
  value,
  onChange,
  onClose,
}: MilitaryTimePickerProps) {
  const [Coords, SetCoords] = useState({ top: 0, left: 0 });
  const parsed = ParseMilitaryTimeParts(value) ?? { hours: 12, minutes: 0 };
  const [Hours, SetHours] = useState(parsed.hours);
  const [Minutes, SetMinutes] = useState(parsed.minutes);

  const hourOptions = useMemo<WheelOption[]>(
    () =>
      Array.from({ length: 24 }, (_, hour) => ({
        value: hour,
        label: String(hour).padStart(2, "0"),
      })),
    [],
  );

  const minuteOptions = useMemo<WheelOption[]>(
    () =>
      Array.from({ length: 60 }, (_, minute) => ({
        value: minute,
        label: String(minute).padStart(2, "0"),
      })),
    [],
  );

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    SetCoords({
      top: rect.bottom + 8,
      left: rect.left,
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) return;

    const next = ParseMilitaryTimeParts(value) ?? { hours: 12, minutes: 0 };
    SetHours(next.hours);
    SetMinutes(next.minutes);
    updatePosition();
  }, [open, value, updatePosition]);

  const handleHourChange = useCallback(
    (nextHours: number) => {
      SetHours(nextHours);
      onChange(BuildMilitaryTime(nextHours, Minutes));
    },
    [Minutes, onChange],
  );

  const handleMinuteChange = useCallback(
    (nextMinutes: number) => {
      SetMinutes(nextMinutes);
      onChange(BuildMilitaryTime(Hours, nextMinutes));
    },
    [Hours, onChange],
  );

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const handlePointer = (event: MouseEvent) => {
      const anchor = anchorRef.current;
      const target = event.target as Node;
      if (anchor?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-military-time-picker]")
      ) {
        return;
      }
      onClose();
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("mousedown", handlePointer);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, onClose, anchorRef, updatePosition]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      data-military-time-picker
      style={{
        position: "fixed",
        top: Coords.top,
        left: Coords.left,
        zIndex: 9999,
        minWidth: 220,
      }}
      className="rounded-xl border border-white/10 bg-[#1f1f1f] p-3 shadow-2xl"
    >
      <div className="flex gap-1">
        <ContinuousLoopWheel
          key={`hour-${Hours}-${open}`}
          options={hourOptions}
          value={Hours}
          onChange={handleHourChange}
        />
        <ContinuousLoopWheel
          key={`minute-${Minutes}-${open}`}
          options={minuteOptions}
          value={Minutes}
          onChange={handleMinuteChange}
        />
      </div>
      <p className="mt-2 border-t border-white/[0.06] pt-2 text-center font-mono text-xs tabular-nums text-zinc-400">
        {BuildMilitaryTime(Hours, Minutes)}
      </p>
    </div>,
    document.body,
  );
}
