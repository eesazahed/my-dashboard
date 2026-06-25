"use client";

import { useEffect, type ReactNode } from "react";
import { IconX } from "@tabler/icons-react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  headerActions?: ReactNode;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  wide = false,
  headerActions,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        className={`relative w-full rounded-2xl border border-white/10 bg-[#2a2726] p-6 shadow-2xl transition-[max-width] duration-300 ease-in-out animate-fade-in ${
          wide ? "max-w-3xl" : "max-w-md"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-zinc-50">{title}</h3>
          <div className="flex items-center gap-1">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
