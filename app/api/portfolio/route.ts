import { NextResponse } from "next/server";
import type { PortfolioHolding } from "@/lib/types";
import { WritePortfolio } from "@/lib/server/data";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { portfolio?: PortfolioHolding[] };
    WritePortfolio(body.portfolio ?? []);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Portfolio save failed:", error);
    return NextResponse.json(
      { error: "Failed to save portfolio" },
      { status: 500 },
    );
  }
}
