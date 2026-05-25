import type { LabelHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  children: ReactNode;
};

export function FieldLabel({ className, children, ...props }: FieldLabelProps) {
  return (
    <span
      className={cn(
        "font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

type FormFieldProps = {
  label: ReactNode;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, children, className }: FormFieldProps) {
  return (
    <label className={cn("flex flex-col gap-2 text-sm text-white/70", className)}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </label>
  );
}
