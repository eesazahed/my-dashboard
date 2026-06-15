import { CuratedBrandIcons, type CuratedBrandIcon } from "@/lib/types";

const HostBrandMap: Record<string, CuratedBrandIcon> = {
  "github.com": "brand-github",
  "tiktok.com": "brand-tiktok",
  "instagram.com": "brand-instagram",
  "twitter.com": "brand-twitter",
  "x.com": "brand-twitter",
  "youtube.com": "brand-youtube",
  "youtu.be": "brand-youtube",
  "linkedin.com": "brand-linkedin",
  "reddit.com": "brand-reddit",
  "discord.com": "brand-discord",
  "discord.gg": "brand-discord",
  "spotify.com": "brand-spotify",
};

function DetectBrandFromUrl(url: string): CuratedBrandIcon | null {
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const host = new URL(normalized).hostname.toLowerCase().replace(/^www\./, "");

    for (const [domain, brand] of Object.entries(HostBrandMap)) {
      if (host === domain || host.endsWith(`.${domain}`)) {
        return brand;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function ResolveQuickLinkIcon(
  url: string,
  icon: string,
): CuratedBrandIcon {
  const isExplicitBrand =
    icon !== "link" && (CuratedBrandIcons as readonly string[]).includes(icon);

  if (isExplicitBrand) {
    return icon as CuratedBrandIcon;
  }

  return DetectBrandFromUrl(url) ?? "link";
}

export function FormatQuickLinkUrl(url: string): string {
  try {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return new URL(normalized).href.replace(/\/$/, "");
  } catch {
    return url;
  }
}
