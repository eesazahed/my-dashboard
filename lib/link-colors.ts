export const LinkColorOptions = [
  {
    id: "emerald",
    label: "Emerald",
    tile: "border-emerald-500/30 bg-emerald-500/12 text-emerald-400 hover:border-emerald-500/45 hover:bg-emerald-500/20",
  },
  {
    id: "blue",
    label: "Blue",
    tile: "border-blue-500/30 bg-blue-500/12 text-blue-400 hover:border-blue-500/45 hover:bg-blue-500/20",
  },
  {
    id: "purple",
    label: "Purple",
    tile: "border-purple-500/30 bg-purple-500/12 text-purple-400 hover:border-purple-500/45 hover:bg-purple-500/20",
  },
  {
    id: "pink",
    label: "Pink",
    tile: "border-pink-500/30 bg-pink-500/12 text-pink-400 hover:border-pink-500/45 hover:bg-pink-500/20",
  },
  {
    id: "amber",
    label: "Amber",
    tile: "border-amber-500/30 bg-amber-500/12 text-amber-400 hover:border-amber-500/45 hover:bg-amber-500/20",
  },
  {
    id: "rose",
    label: "Rose",
    tile: "border-rose-500/30 bg-rose-500/12 text-rose-400 hover:border-rose-500/45 hover:bg-rose-500/20",
  },
  {
    id: "cyan",
    label: "Cyan",
    tile: "border-cyan-500/30 bg-cyan-500/12 text-cyan-400 hover:border-cyan-500/45 hover:bg-cyan-500/20",
  },
  {
    id: "zinc",
    label: "Neutral",
    tile: "border-white/10 bg-white/[0.05] text-zinc-300 hover:border-white/20 hover:bg-white/[0.08]",
  },
] as const;

export type LinkColorId = (typeof LinkColorOptions)[number]["id"];

export const DefaultLinkColor: LinkColorId = "emerald";

export function GetLinkColorTileClasses(color?: string): string {
  const match = LinkColorOptions.find((option) => option.id === color);
  return match?.tile ?? LinkColorOptions[0].tile;
}

export function GetLinkColorSwatchClasses(color: LinkColorId): string {
  const match = LinkColorOptions.find((option) => option.id === color);
  if (!match) return "bg-emerald-500";
  const map: Record<LinkColorId, string> = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    cyan: "bg-cyan-500",
    zinc: "bg-zinc-500",
  };
  return map[color];
}

const EventChipClasses: Record<LinkColorId, string> = {
  emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/25",
  blue: "bg-blue-500/20 text-blue-300 border-blue-500/25",
  purple: "bg-purple-500/20 text-purple-300 border-purple-500/25",
  pink: "bg-pink-500/20 text-pink-300 border-pink-500/25",
  amber: "bg-amber-500/20 text-amber-300 border-amber-500/25",
  rose: "bg-rose-500/20 text-rose-300 border-rose-500/25",
  cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/25",
  zinc: "bg-white/[0.08] text-zinc-300 border-white/10",
};

const EventBarClasses: Record<LinkColorId, string> = {
  emerald: "bg-emerald-500/90 hover:bg-emerald-400",
  blue: "bg-blue-500/90 hover:bg-blue-400",
  purple: "bg-purple-500/90 hover:bg-purple-400",
  pink: "bg-pink-500/90 hover:bg-pink-400",
  amber: "bg-amber-500/90 hover:bg-amber-400",
  rose: "bg-rose-500/90 hover:bg-rose-400",
  cyan: "bg-cyan-500/90 hover:bg-cyan-400",
  zinc: "bg-zinc-500/90 hover:bg-zinc-400",
};

const EventCardClasses: Record<LinkColorId, string> = {
  emerald: "border-emerald-500/25 bg-emerald-500/10",
  blue: "border-blue-500/25 bg-blue-500/10",
  purple: "border-purple-500/25 bg-purple-500/10",
  pink: "border-pink-500/25 bg-pink-500/10",
  amber: "border-amber-500/25 bg-amber-500/10",
  rose: "border-rose-500/25 bg-rose-500/10",
  cyan: "border-cyan-500/25 bg-cyan-500/10",
  zinc: "border-white/[0.06] bg-white/[0.04]",
};

const EventDotClasses: Record<LinkColorId, string> = {
  emerald: "bg-emerald-400",
  blue: "bg-blue-400",
  purple: "bg-purple-400",
  pink: "bg-pink-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  cyan: "bg-cyan-400",
  zinc: "bg-zinc-400",
};

function ResolveColorId(color?: string): LinkColorId {
  const match = LinkColorOptions.find((option) => option.id === color);
  return match?.id ?? DefaultLinkColor;
}

export function GetEventChipClasses(color?: string): string {
  return EventChipClasses[ResolveColorId(color)];
}

export function GetEventBarClasses(color?: string): string {
  return EventBarClasses[ResolveColorId(color)];
}

export function GetEventCardClasses(color?: string, type?: "event" | "task"): string {
  if (type === "task") {
    return "border-blue-500/20 bg-blue-500/10";
  }
  return EventCardClasses[ResolveColorId(color)];
}

export function GetEventDotClasses(color?: string, type?: "event" | "task"): string {
  if (type === "task") {
    return "bg-blue-400";
  }
  return EventDotClasses[ResolveColorId(color)];
}
