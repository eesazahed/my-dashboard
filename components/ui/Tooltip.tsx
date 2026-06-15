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

type TooltipProps = {
  content: string;
  children: ReactElement;
  placement?: "top" | "bottom";
};

export function Tooltip({
  content,
  children,
  placement = "top",
}: TooltipProps) {
  const [Visible, SetVisible] = useState(false);
  const [Coords, SetCoords] = useState({ top: 0, left: 0 });
  const AnchorRef = useRef<HTMLSpanElement>(null);

  const UpdatePosition = useCallback(() => {
    const anchor = AnchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    SetCoords({
      top: placement === "top" ? rect.top - 8 : rect.bottom + 8,
      left: rect.left + rect.width / 2,
    });
  }, [placement]);

  const Show = useCallback(() => {
    UpdatePosition();
    SetVisible(true);
  }, [UpdatePosition]);

  const Hide = useCallback(() => {
    SetVisible(false);
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

  const Transform =
    placement === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)";

  const TooltipNode: ReactNode =
    Visible && typeof document !== "undefined"
      ? createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              top: Coords.top,
              left: Coords.left,
              transform: Transform,
              zIndex: 9999,
            }}
            className="pointer-events-none max-w-[min(280px,calc(100vw-2rem))] truncate rounded-lg border border-white/10 bg-[#1a1a1a] px-2.5 py-1.5 text-[11px] text-zinc-300 shadow-xl"
          >
            {content}
          </span>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={AnchorRef}
        className="inline-flex"
        onMouseEnter={Show}
        onMouseLeave={Hide}
        onFocus={Show}
        onBlur={Hide}
      >
        {children}
      </span>
      {TooltipNode}
    </>
  );
}
