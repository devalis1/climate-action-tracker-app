"use client";

import type { FormEvent } from "react";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { submitAdminDemoLogin } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
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
          toast({
            tone: "error",
            title: "Sign-in failed",
            description: result.message,
          });
          return;
        }

        toast({
          tone: "success",
          title: "Signed in",
          description: "Admin workspace unlocked for this browser session.",
        });
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
          When <span className="font-mono text-[0.7rem]">ADMIN_DEMO_SECRET</span> is set,
          mutations and LLM import require this value. It is stored as an HTTP-only{" "}
          <span className="font-mono text-[0.7rem]">admin_demo</span> cookie.
        </p>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <FormField label="ADMIN_DEMO_SECRET">
            <Input
              autoComplete="current-password"
              name="password"
              required
              type="password"
            />
          </FormField>

          {message ? (
            <p
              className="rounded-[10px] border border-[#ffb877]/55 bg-brand-bg-deep/80 p-4 text-xs text-[#ffb877]"
              role="alert"
            >
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={isPending} size="lg" type="submit">
              {isPending ? "Signing in…" : "Sign in"}
            </Button>
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
