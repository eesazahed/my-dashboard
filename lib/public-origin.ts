function IsLocalHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

export function GetPublicOrigin(request: Request): string {
  const configured =
    process.env.APP_URL?.trim() || process.env.PUBLIC_APP_URL?.trim();

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    const proto = forwardedProto.split(",")[0]?.trim() ?? "https";
    if (host && !IsLocalHost(host)) {
      return `${proto}://${host}`;
    }
  }

  const host = request.headers.get("host");
  if (host && !IsLocalHost(host)) {
    const proto = forwardedProto.split(",")[0]?.trim() ?? "https";
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

export function BuildPublicUrl(request: Request, pathname: string): string {
  const origin = GetPublicOrigin(request);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}
