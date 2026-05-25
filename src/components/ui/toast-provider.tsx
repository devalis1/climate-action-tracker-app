"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastRecord = ToastInput & {
  id: number;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClasses: Record<ToastTone, string> = {
  success: "border-brand-accent/55 text-brand-accent",
  error: "border-[#ffb877]/55 text-[#ffb877]",
  info: "border-brand-blue/55 text-brand-cyan-soft",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const record: ToastRecord = {
        tone: "info",
        durationMs: 4500,
        ...input,
        id,
      };

      setToasts((current) => [...current, record]);

      window.setTimeout(() => {
        dismiss(id);
      }, record.durationMs);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[110] flex w-full max-w-sm flex-col gap-3 px-4 sm:bottom-6 sm:right-6 sm:px-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto rounded-[10px] border bg-brand-bg-deep/95 p-4 shadow-brand backdrop-blur-md",
              toneClasses[item.tone ?? "info"],
            )}
            role="status"
          >
            <p className="font-heading text-sm font-semibold text-white">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                {item.description}
              </p>
            ) : null}
            <button
              className="mt-3 font-heading text-[0.65rem] uppercase tracking-[0.14em] text-white/55 hover:text-white"
              onClick={() => dismiss(item.id)}
              type="button"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }
  return context;
}
