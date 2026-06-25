import { NextResponse } from "next/server";
import { BuildPublicUrl } from "@/lib/public-origin";
import {
  GetCalendarFeedToken,
  RegenerateCalendarFeedToken,
} from "@/lib/server/data";

function BuildFeedUrl(request: Request, token: string): string {
  return BuildPublicUrl(request, `/api/calendar/${token}`);
}

export async function GET(request: Request) {
  const token = GetCalendarFeedToken();
  return NextResponse.json({ feedUrl: BuildFeedUrl(request, token) });
}

export async function POST(request: Request) {
  const token = RegenerateCalendarFeedToken();
  return NextResponse.json({ feedUrl: BuildFeedUrl(request, token) });
}
