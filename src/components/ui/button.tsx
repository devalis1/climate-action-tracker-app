import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const variantClasses = {
  primary:
    "bg-brand-accent/90 text-[#07130c] shadow-[0_14px_40px_-18px_rgba(98,245,138,0.55)] hover:bg-brand-accent",
  secondary:
    "border border-white/35 text-white hover:border-white hover:bg-white/5",
  outline:
    "border border-brand-accent/80 text-brand-accent hover:bg-brand-accent/10",
  destructive:
    "border border-[#ffb877]/50 text-[#ffb877] hover:bg-[#ffb877]/10",
  ghost: "text-white/80 hover:bg-white/10",
} as const;

const sizeClasses = {
  sm: "px-3 py-2 text-[0.65rem] tracking-[0.12em]",
  md: "px-5 py-2 text-xs tracking-[0.14em]",
  lg: "px-6 py-3 text-xs tracking-[0.16em]",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-full font-heading uppercase disabled:opacity-55 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
