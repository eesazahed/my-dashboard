import { NextResponse, type NextRequest } from "next/server";
import { VerifySessionToken } from "@/lib/session-token";

const PublicPaths = ["/login", "/api/auth/login"];

function IsPublicCalendarFeed(pathname: string): boolean {
  if (pathname === "/api/calendar/feed") return false;
  return /^\/api\/calendar\/[^/]+$/.test(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PublicPaths.some((path) => pathname === path) ||
    IsPublicCalendarFeed(pathname) ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Server is not configured" },
        { status: 500 },
      );
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("dashboard_session")?.value;
  const authenticated = await VerifySessionToken(token, secret);

  if (!authenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
