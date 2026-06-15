"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FormatQuickLinkUrl } from "@/lib/quick-link-utils";
import type { QuickLink } from "@/lib/types";

type QuickLinkTooltipProps = {
  link: QuickLink;
  onEdit: () => void;
  onDelete: () => void;
  children: ReactElement;
};

export function QuickLinkTooltip({
  link,
  onEdit,
  onDelete,
  children,
}: QuickLinkTooltipProps) {
  const [Visible, SetVisible] = useState(false);
  const [Coords, SetCoords] = useState({ top: 0, left: 0 });
  const AnchorRef = useRef<HTMLSpanElement>(null);
  const HideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const UpdatePosition = useCallback(() => {
    const anchor = AnchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    SetCoords({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  }, []);

  const Show = useCallback(() => {
    if (HideTimerRef.current) {
      clearTimeout(HideTimerRef.current);
      HideTimerRef.current = null;
    }
    UpdatePosition();
    SetVisible(true);
  }, [UpdatePosition]);

  const ScheduleHide = useCallback(() => {
    HideTimerRef.current = setTimeout(() => SetVisible(false), 120);
  }, []);

  useEffect(() => {
    if (!Visible) return;

    UpdatePosition();
    window.addEventListener("scroll", UpdatePosition, true);
    window.addEventListener("resize", UpdatePosition);

    return () => {
      window.removeEventListener("scroll", UpdatePosition, true);
      window.removeEventListener("resize", UpdatePosition);
    };
  }, [Visible, UpdatePosition]);

  useEffect(() => {
    return () => {
      if (HideTimerRef.current) clearTimeout(HideTimerRef.current);
    };
  }, []);

  const TooltipUrl = FormatQuickLinkUrl(link.url);

  const PopoverNode: ReactNode =
    Visible && typeof document !== "undefined"
      ? createPortal(
          <div
            role="tooltip"
            style={{
              position: "fixed",
              top: Coords.top,
              left: Coords.left,
              transform: "translate(-50%, -100%)",
              zIndex: 9999,
            }}
            className="pointer-events-auto w-max max-w-[min(300px,calc(100vw-2rem))] rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-xl"
            onMouseEnter={Show}
            onMouseLeave={ScheduleHide}
          >
            <p className="truncate text-[11px] text-zinc-400">{TooltipUrl}</p>
            <div className="mt-2 flex items-center gap-1.5 border-t border-white/[0.06] pt-2">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  SetVisible(false);
                  onEdit();
                }}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  SetVisible(false);
                  onDelete();
                }}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-red-400/90 transition hover:bg-red-500/10 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={AnchorRef}
        className="flex w-full"
        onMouseEnter={Show}
        onMouseLeave={ScheduleHide}
        onFocus={Show}
        onBlur={ScheduleHide}
      >
        {children}
      </span>
      {PopoverNode}
    </>
  );
}
