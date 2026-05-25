import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SystemStateShell } from "@/components/system-states";

export function AdminLoginRequired() {
  return (
    <SystemStateShell
      eyebrow="Authentication required"
      title="Admin workspace is gated"
      actions={
        <>
          <Link href="/admin/login">
            <Button size="lg">Sign in</Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="secondary">
              Public viewer
            </Button>
          </Link>
        </>
      }
    >
      <p>
        This deployment has{" "}
        <code className="font-mono text-[0.7rem]">ADMIN_DEMO_SECRET</code> set. Sign in with
        the same value to continue (stored as an HTTP-only{" "}
        <code className="font-mono text-[0.7rem]">admin_demo</code> cookie).
      </p>
    </SystemStateShell>
  );
}

export function AdminDatabaseConfigRequired() {
  return (
    <SystemStateShell
      eyebrow="Database unavailable"
      title="Set DATABASE_URL to enable admin writes"
    >
      <p>
        Copy <code className="font-mono text-[0.7rem]">.env.example</code> to{" "}
        <code className="font-mono text-[0.7rem]">.env.local</code>, boot Docker Postgres, run{" "}
        <code className="font-mono text-[0.7rem]">npm run db:migrate</code>, then refresh this
        page.
      </p>
    </SystemStateShell>
  );
}

export function AdminDatabaseUnreachable() {
  return (
    <SystemStateShell
      eyebrow="Connection failure"
      title="Postgres did not respond"
      tone="warn"
    >
      <p>
        Ensure <code className="font-mono text-[0.7rem]">docker compose up -d</code> is healthy
        and <code className="font-mono text-[0.7rem]">DATABASE_URL</code> points at localhost.
      </p>
    </SystemStateShell>
  );
}

export function AdminSeedMissing() {
  return (
    <SystemStateShell eyebrow="Seed missing" title="No cities found in the database">
      <p>
        Run <code className="font-mono text-[0.7rem]">npm run db:migrate</code> and{" "}
        <code className="font-mono text-[0.7rem]">npm run db:check</code>, then reload.
      </p>
    </SystemStateShell>
  );
}
