import { NextResponse } from "next/server";
import type { QuickLink } from "@/lib/types";
import { WriteQuickLinks } from "@/lib/server/data";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { quickLinks?: QuickLink[] };
    WriteQuickLinks(body.quickLinks ?? []);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Quick links save failed:", error);
    return NextResponse.json(
      { error: "Failed to save quick links" },
      { status: 500 },
    );
  }
}
