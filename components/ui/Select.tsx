import type { SelectHTMLAttributes } from "react";
import { IconChevronDown } from "@tabler/icons-react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({
  label,
  className = "",
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block space-y-1.5" htmlFor={selectId}>
      {label && (
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-xl border border-white/[0.08] bg-[#1a1a1a] py-2.5 pl-3.5 pr-10 text-sm text-zinc-100 outline-none transition focus:border-white/20 focus:ring-2 focus:ring-white/[0.06] ${className}`}
          {...props}
        >
          {children}
        </select>
        <IconChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
          aria-hidden
        />
      </div>
    </label>
  );
}
