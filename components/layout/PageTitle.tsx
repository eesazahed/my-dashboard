"use client";

import { useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";

export function PageTitle() {
  const { settings, ready } = useDashboard();

  useEffect(() => {
    if (!ready) {
      document.title = "My dashboard";
      return;
    }

    const name = settings.name.trim();
    document.title = name ? `${name} - dashboard` : "My dashboard";
  }, [ready, settings.name]);

  return null;
}
