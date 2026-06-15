import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      {icon && (
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white/5 text-zinc-400">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-zinc-200">{title}</p>
      <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-zinc-500">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
