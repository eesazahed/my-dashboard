import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import {
  GetSessionMaxAgeSeconds,
  VerifySessionToken as VerifyToken,
} from "@/lib/session-token";

export const SessionCookieName = "dashboard_session";

export function GetDashboardPassword(): string {
  const password = process.env.DASHBOARD_PASSWORD?.trim();
  if (!password) {
    throw new Error("DASHBOARD_PASSWORD is not configured");
  }
  return password;
}

export function VerifyDashboardPassword(candidate: string): boolean {
  const expected = GetDashboardPassword();
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(candidateBuffer, expectedBuffer);
}

export async function IsAuthenticated(): Promise<boolean> {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) return false;

  const cookieStore = await cookies();
  return VerifyToken(cookieStore.get(SessionCookieName)?.value, secret);
}

export function GetSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: GetSessionMaxAgeSeconds(),
  };
}

export { CreateSessionToken, GetSessionMaxAgeSeconds } from "@/lib/session-token";
