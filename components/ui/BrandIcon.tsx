import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandReddit,
  IconBrandSpotify,
  IconBrandTiktok,
  IconBrandTwitter,
  IconBrandYoutube,
  IconLink,
  type TablerIcon,
} from "@tabler/icons-react";
import type { CuratedBrandIcon } from "@/lib/types";

const IconMap: Record<CuratedBrandIcon, TablerIcon> = {
  "brand-tiktok": IconBrandTiktok,
  "brand-instagram": IconBrandInstagram,
  "brand-twitter": IconBrandTwitter,
  "brand-github": IconBrandGithub,
  "brand-youtube": IconBrandYoutube,
  "brand-linkedin": IconBrandLinkedin,
  "brand-reddit": IconBrandReddit,
  "brand-discord": IconBrandDiscord,
  "brand-spotify": IconBrandSpotify,
  link: IconLink,
};

export function BrandIcon({
  name,
  size = 20,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon =
    IconMap[name as CuratedBrandIcon] ?? IconLink;

  return <Icon size={size} className={className} aria-hidden />;
}
