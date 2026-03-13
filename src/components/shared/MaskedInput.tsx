"use client";

import { Input } from "@/components/ui/input";
import { type ChangeEvent } from "react";

interface MaskedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function formatSSN(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export default function MaskedInput({
  value,
  onChange,
  placeholder = "XXX-XX-XXXX",
  className,
}: MaskedInputProps) {
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatSSN(e.target.value);
    onChange(formatted);
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      maxLength={11}
      autoComplete="off"
    />
  );
}
