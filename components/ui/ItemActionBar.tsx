type ItemActionBarProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export function ItemActionBar({ onEdit, onDelete }: ItemActionBarProps) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="rounded-md px-2 py-1 text-[11px] font-medium text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-200"
      >
        Edit
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="rounded-md px-2 py-1 text-[11px] font-medium text-red-400/80 transition hover:bg-red-500/10 hover:text-red-300"
      >
        Delete
      </button>
    </div>
  );
}
