import { NextResponse } from "next/server";
import type { DashboardEvent } from "@/lib/types";
import { SyncEvents } from "@/lib/server/data";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      previous?: DashboardEvent[];
      next?: DashboardEvent[];
    };

    const previous = body.previous ?? [];
    const next = body.next ?? [];

    SyncEvents(previous, next);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Events sync failed:", error);
    return NextResponse.json(
      { error: "Failed to save events" },
      { status: 500 },
    );
  }
}
