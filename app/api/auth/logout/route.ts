import { NextResponse } from "next/server";
import { SessionCookieName } from "@/lib/server/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
