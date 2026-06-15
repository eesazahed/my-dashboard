"use client";

import { useEffect, useState } from "react";

type ToastProps = {
  message: string;
  onDone: () => void;
};

export function Toast({ message, onDone }: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const hideTimer = setTimeout(() => setExiting(true), 2200);
    return () => clearTimeout(hideTimer);
  }, [message]);

  useEffect(() => {
    if (!exiting) return;
    const removeTimer = setTimeout(onDone, 200);
    return () => clearTimeout(removeTimer);
  }, [exiting, onDone]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-lg border border-white/10 bg-[#2f2f2f] px-4 py-2.5 text-sm text-zinc-200 shadow-xl ${
        exiting ? "animate-fade-out" : "animate-fade-in"
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
