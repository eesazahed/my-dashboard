import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, className = "", id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block space-y-1.5" htmlFor={inputId}>
      {label && (
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`w-full rounded-xl border border-white/[0.08] bg-[#1a1a1a] px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-white/20 focus:ring-2 focus:ring-white/[0.06] ${className}`}
        {...props}
      />
      {hint && <span className="text-xs text-zinc-600">{hint}</span>}
    </label>
  );
});
