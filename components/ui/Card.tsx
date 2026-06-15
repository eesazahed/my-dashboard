import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export function Card({ title, children, className = "", action }: CardProps) {
  return (
    <section
      className={`rounded-lg border border-stone-600/40 bg-[#696969] p-4 lg:p-5 ${className}`}
    >
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {title && (
            <h2 className="text-sm font-medium text-zinc-100">{title}</h2>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
