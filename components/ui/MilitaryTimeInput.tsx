"use client";

import { useRef, useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";
import { MilitaryTimePicker } from "@/components/ui/MilitaryTimePicker";
import {
  NormalizeMilitaryTimeDraft,
  NormalizeMilitaryTimeValue,
} from "@/lib/time-utils";

type MilitaryTimeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

export function MilitaryTimeInput({
  label,
  value,
  onChange,
  className = "",
  onDoubleClick,
  ...props
}: MilitaryTimeInputProps) {
  const InputRef = useRef<HTMLInputElement>(null);
  const [PickerOpen, SetPickerOpen] = useState(false);

  return (
    <>
      <Input
        ref={InputRef}
        label={label}
        inputMode="numeric"
        placeholder="15:00"
        autoComplete="off"
        maxLength={5}
        value={value}
        className={`font-mono tabular-nums ${className}`}
        onChange={(event) => onChange(NormalizeMilitaryTimeDraft(event.target.value))}
        onBlur={() => onChange(NormalizeMilitaryTimeValue(value))}
        onDoubleClick={(event) => {
          event.preventDefault();
          SetPickerOpen(true);
          onDoubleClick?.(event);
        }}
        {...props}
      />
      <MilitaryTimePicker
        open={PickerOpen}
        anchorRef={InputRef}
        value={value}
        onChange={onChange}
        onClose={() => SetPickerOpen(false)}
      />
    </>
  );
}
