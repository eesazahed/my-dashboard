import { NextResponse } from "next/server";
import { ReadBaseEventsForRange } from "@/lib/server/data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to query parameters are required" },
      { status: 400 },
    );
  }

  try {
    const events = ReadBaseEventsForRange(from, to);
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Events fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 },
    );
  }
}
