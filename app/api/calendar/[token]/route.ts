import { NextResponse } from "next/server";
import { BuildIcsCalendar } from "@/lib/ical";
import { GetEventsTimezone } from "@/lib/timezones";
import {
  ReadEventsForCalendarFeed,
  ReadSettings,
  VerifyCalendarFeedToken,
} from "@/lib/server/data";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { token } = await context.params;

  if (!VerifyCalendarFeedToken(token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const origin = new URL(request.url).host;
  const settings = ReadSettings();
  const calendarName = settings.name.trim()
    ? `${settings.name.trim()} — Dashboard`
    : "My Dashboard";
  const events = ReadEventsForCalendarFeed();
  const body = BuildIcsCalendar(
    events,
    origin,
    calendarName,
    GetEventsTimezone(),
  );

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}
