import { NextResponse } from "next/server";
import { WriteThoughtDump } from "@/lib/server/data";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { content?: string };
    WriteThoughtDump(body.content ?? "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Thought dump save failed:", error);
    return NextResponse.json(
      { error: "Failed to save thought dump" },
      { status: 500 },
    );
  }
}
