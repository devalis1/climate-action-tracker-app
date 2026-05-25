"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement;
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        aria-label="Close dialog"
        className="absolute inset-0 bg-brand-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        type="button"
      />
      <div
        ref={panelRef}
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cn(
          "relative z-10 max-h-[min(90vh,720px)] w-full max-w-lg overflow-y-auto rounded-[12px] border border-white/15 bg-brand-surface p-6 shadow-brand outline-hidden sm:p-8",
          className,
        )}
        role="dialog"
        tabIndex={-1}
      >
        <div className="space-y-2 border-b border-white/10 pb-5">
          <h2 className="font-heading text-2xl font-semibold text-white" id={titleId}>
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-white/65" id={descriptionId}>
              {description}
            </p>
          ) : null}
        </div>

        {children ? <div className="py-6">{children}</div> : null}

        {footer ? (
          <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
