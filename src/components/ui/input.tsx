import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const fieldClassName =
  "rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 text-sm text-white outline-hidden ring-brand-accent/40 focus:ring-2";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  mono?: boolean;
};

export function Input({ className, mono, ...props }: InputProps) {
  return (
    <input
      className={cn(fieldClassName, mono && "font-mono", className)}
      {...props}
    />
  );
}

type SelectProps = InputHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(fieldClassName, "capitalize", className)}
      {...props}
    />
  );
}

type TextareaProps = InputHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        fieldClassName,
        "min-h-[156px] leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}
