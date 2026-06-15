import type { ReactNode } from "react";

type PanelProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  noPadding?: boolean;
  fillHeight?: boolean;
  hideHeader?: boolean;
};

export function Panel({
  title,
  subtitle,
  children,
  className = "",
  action,
  noPadding = false,
  fillHeight = false,
  hideHeader = false,
}: PanelProps) {
  return (
    <section
      className={`panel flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#252525] shadow-panel ${fillHeight ? "h-full min-h-0" : ""} ${className}`}
    >
      {!hideHeader && (title || action) && (
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.05] px-5 py-3.5">
          <div>
            {title && (
              <h2 className="text-[13px] font-semibold text-zinc-100">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[11px] text-zinc-500">{subtitle}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div
        className={`${noPadding ? "flex min-h-0 flex-1 flex-col" : "flex min-h-0 flex-1 flex-col overflow-y-auto p-5"}`}
      >
        {children}
      </div>
    </section>
  );
}
