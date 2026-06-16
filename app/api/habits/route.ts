import { NextResponse } from "next/server";
import type { Habit } from "@/lib/types";
import { WriteHabits } from "@/lib/server/data";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { habits?: Habit[] };
    WriteHabits(body.habits ?? []);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Habits save failed:", error);
    return NextResponse.json(
      { error: "Failed to save habits" },
      { status: 500 },
    );
  }
}
