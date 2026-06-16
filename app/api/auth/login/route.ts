import { NextResponse } from "next/server";
import {
  CreateSessionToken,
  GetSessionMaxAgeSeconds,
  SessionCookieName,
  VerifyDashboardPassword,
} from "@/lib/server/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim() ?? "";

    if (!password || !VerifyDashboardPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const secret = process.env.SESSION_SECRET?.trim();
    if (!secret) {
      return NextResponse.json(
        { error: "SESSION_SECRET is not configured" },
        { status: 500 },
      );
    }

    const token = await CreateSessionToken(secret);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: GetSessionMaxAgeSeconds(),
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("DASHBOARD_PASSWORD")
        ? "DASHBOARD_PASSWORD is not configured"
        : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
