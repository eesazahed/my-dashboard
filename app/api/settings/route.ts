import { NextResponse } from "next/server";
import type { Settings } from "@/lib/types";
import { WriteSettings } from "@/lib/server/data";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { settings?: Settings };
    if (!body.settings) {
      return NextResponse.json({ error: "settings is required" }, { status: 400 });
    }
    WriteSettings(body.settings);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Settings save failed:", error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}
