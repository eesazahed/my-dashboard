import { NextResponse } from "next/server";
import {
  GetCalendarFeedToken,
  RegenerateCalendarFeedToken,
} from "@/lib/server/data";

function BuildFeedUrl(request: Request, token: string): string {
  const url = new URL(request.url);
  return `${url.origin}/api/calendar/${token}`;
}

export async function GET(request: Request) {
  const token = GetCalendarFeedToken();
  return NextResponse.json({ feedUrl: BuildFeedUrl(request, token) });
}

export async function POST(request: Request) {
  const token = RegenerateCalendarFeedToken();
  return NextResponse.json({ feedUrl: BuildFeedUrl(request, token) });
}
