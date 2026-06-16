import { NextResponse } from "next/server";
import { ReadBootstrap } from "@/lib/server/data";

export const runtime = "nodejs";

export async function GET() {
  try {
    const payload = ReadBootstrap();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Bootstrap failed:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}
