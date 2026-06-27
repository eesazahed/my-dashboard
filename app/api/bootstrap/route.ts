import { NextResponse } from "next/server";
import { ReadBootstrap } from "@/lib/server/data";

export const runtime = "nodejs";

export async function GET() {
  try {
    const payload = ReadBootstrap();
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Bootstrap failed:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}
