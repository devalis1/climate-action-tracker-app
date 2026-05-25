import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SystemStateShellProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
  tone?: "accent" | "warn";
  actions?: ReactNode;
  className?: string;
};

export function SystemStateShell({
  eyebrow,
  title,
  children,
  tone = "accent",
  actions,
  className,
}: SystemStateShellProps) {
  const eyebrowClass =
    tone === "warn" ? "text-[#ffb877]" : "text-brand-accent";
  const borderClass =
    tone === "warn" ? "border-[#ffb877]/55" : "border-brand-accent/40";

  return (
    <div className={cn("mx-auto max-w-3xl px-5 py-16 sm:px-8", className)}>
      <div
        className={cn(
          "rounded-[12px] border bg-brand-surface p-10 shadow-brand",
          borderClass,
        )}
      >
        <p className={cn("font-mono text-xs uppercase tracking-[0.22em]", eyebrowClass)}>
          {eyebrow}
        </p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-white">{title}</h1>
        <div className="mt-4 text-sm leading-relaxed text-white/72">{children}</div>
        {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

export function DatabaseConfigRequired() {
  return (
    <SystemStateShell eyebrow="Database unavailable" title="Configure DATABASE_URL">
      <p>
        Copy <code className="font-mono text-[0.7rem]">.env.example</code> to{" "}
        <code className="font-mono text-[0.7rem]">.env.local</code>, start Docker Postgres,
        and run migrations.
      </p>
    </SystemStateShell>
  );
}

export function DatabaseConnectionFailed() {
  return (
    <SystemStateShell
      eyebrow="Connection failure"
      title="Cannot reach Postgres"
      tone="warn"
    >
      <p>
        Confirm Compose is healthy and{" "}
        <code className="font-mono text-[0.7rem]">DATABASE_URL</code> matches your local
        port, user, and database.
      </p>
    </SystemStateShell>
  );
}

export function SeedDataMissing({
  title = "Baseline data not found",
  detail,
}: {
  title?: string;
  detail?: ReactNode;
}) {
  return (
    <SystemStateShell eyebrow="Seed missing" title={title}>
      {detail ?? (
        <p>
          Run <code className="font-mono text-[0.7rem]">npm run db:migrate</code> and refresh.
        </p>
      )}
    </SystemStateShell>
  );
}
