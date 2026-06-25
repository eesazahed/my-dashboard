"use client";

import { useEffect, useState } from "react";
import { IconCopy, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";

type CalendarFeedPanelProps = {
  showToast: (message: string) => void;
};

function ResolveFeedUrl(apiFeedUrl: string): string {
  try {
    const path = new URL(apiFeedUrl).pathname;
    if (typeof window !== "undefined") {
      return `${window.location.origin}${path}`;
    }
    return apiFeedUrl;
  } catch {
    return apiFeedUrl;
  }
}

export function CalendarFeedPanel({ showToast }: CalendarFeedPanelProps) {
  const [FeedUrl, SetFeedUrl] = useState("");
  const [Loading, SetLoading] = useState(true);
  const [Regenerating, SetRegenerating] = useState(false);

  const loadFeedUrl = async () => {
    SetLoading(true);
    try {
      const response = await fetch("/api/calendar/feed");
      if (!response.ok) throw new Error("Failed to load feed URL");
      const data = (await response.json()) as { feedUrl: string };
      SetFeedUrl(ResolveFeedUrl(data.feedUrl));
    } catch {
      showToast("Could not load calendar feed URL");
    } finally {
      SetLoading(false);
    }
  };

  useEffect(() => {
    void loadFeedUrl();
  }, []);

  const copyFeedUrl = async () => {
    if (!FeedUrl) return;
    try {
      await navigator.clipboard.writeText(FeedUrl);
      showToast("Calendar URL copied ✓");
    } catch {
      showToast("Could not copy URL");
    }
  };

  const regenerateToken = async () => {
    const confirmed = window.confirm(
      "Regenerating invalidates the old URL. Update Google Calendar with the new link. Continue?",
    );
    if (!confirmed) return;

    SetRegenerating(true);
    try {
      const response = await fetch("/api/calendar/feed", { method: "POST" });
      if (!response.ok) throw new Error("Failed to regenerate");
      const data = (await response.json()) as { feedUrl: string };
      SetFeedUrl(ResolveFeedUrl(data.feedUrl));
      showToast("New calendar URL generated ✓");
    } catch {
      showToast("Could not regenerate URL");
    } finally {
      SetRegenerating(false);
    }
  };

  return (
    <Panel
      title="Calendar subscription"
      subtitle="Add this iCal URL in Google Calendar → Other calendars → From URL"
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2.5">
          <p className="break-all font-mono text-xs text-zinc-300">
            {Loading ? "Loading…" : FeedUrl || "Unavailable"}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            onClick={() => void copyFeedUrl()}
            disabled={!FeedUrl}
          >
            <IconCopy size={16} />
            Copy URL
          </Button>
          <Button
            variant="secondary"
            onClick={() => void regenerateToken()}
            disabled={Regenerating}
          >
            <IconRefresh size={16} />
            {Regenerating ? "Regenerating…" : "Regenerate URL"}
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-zinc-500">
          This feed is public to anyone with the URL (events only, no tasks).
          Keep the link private like a Google Calendar secret address. Google
          re-fetches subscribed calendars on its own schedule — often every few
          hours, not instantly. Remove and re-add the calendar in Google to force
          a refresh.
        </p>
      </div>
    </Panel>
  );
}
