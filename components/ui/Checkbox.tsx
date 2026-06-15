type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
};

export function Checkbox({ checked, onChange, label, id }: CheckboxProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-white/20 bg-black/30 text-emerald-500 accent-emerald-500 focus:ring-emerald-500/30"
      />
      {label && <span className="text-sm text-zinc-200">{label}</span>}
    </label>
  );
}
