"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { submitAdminDemoLogin } from "@/app/admin/login/actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(() => {
      void (async () => {
        const result = await submitAdminDemoLogin(formData);
        if (!result.ok) {
          setMessage(result.message);
          return;
        }
        router.refresh();
        router.push("/admin");
      })();
    });
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16 sm:px-8">
      <div className="rounded-[12px] border border-white/15 bg-brand-surface p-10 shadow-brand">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-accent">
          City Admin access
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold text-white">
          Sign in with the demo secret
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          When <span className="font-mono text-[0.7rem]">ADMIN_DEMO_SECRET</span>{" "}
          is set, mutations require this value. It is stored as an HTTP-only{" "}
          <span className="font-mono text-[0.7rem]">admin_demo</span> cookie (
          <span className="font-mono text-[0.7rem]">SameSite=Lax</span>,{" "}
          <span className="font-mono text-[0.7rem]">Path=/</span>,{" "}
          <span className="font-mono text-[0.65rem] text-white/65">
            Secure in production
          </span>
          ).
        </p>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm text-white/75">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-brand-cyan-soft">
              ADMIN_DEMO_SECRET
            </span>
            <input
              autoComplete="current-password"
              className="rounded-[10px] border border-white/15 bg-brand-bg-deep/80 px-4 py-3 font-mono text-sm text-white outline-hidden ring-brand-accent/40 focus:ring-2"
              name="password"
              required
              type="password"
            />
          </label>

          {message ? (
            <p
              className="rounded-[10px] border border-[#ffb877]/55 bg-brand-bg-deep/80 p-4 text-xs text-[#ffb877]"
              role="alert"
            >
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-full bg-brand-accent/90 px-6 py-3 font-heading text-xs uppercase tracking-[0.16em] text-[#07130c] shadow-[0_14px_40px_-18px_rgba(98,245,138,0.55)] hover:bg-brand-accent disabled:opacity-55"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Signing in…" : "Sign in"}
            </button>
            <Link
              className="font-heading text-xs uppercase tracking-[0.14em] text-white/70 hover:text-white"
              href="/"
            >
              ← Public viewer
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
