import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const VariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-zinc-100 text-zinc-900 hover:bg-white",
  secondary:
    "bg-white/[0.06] text-zinc-200 hover:bg-white/[0.1] border border-white/[0.06]",
  ghost: "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200",
  danger: "bg-red-500/10 text-red-300 hover:bg-red-500/15 border border-red-500/15",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${VariantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
