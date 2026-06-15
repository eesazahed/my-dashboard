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
