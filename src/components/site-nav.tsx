"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const shellX = "px-5 sm:px-8 lg:px-10";

function isPublicRoute(pathname: string): boolean {
  return pathname === "/" || pathname.startsWith("/city/");
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

type SiteNavLinksProps = {
  /** Canonical public dashboard entry (default city slug path). */
  defaultPublicHref?: string;
};

export function SiteNavLinks({ defaultPublicHref = "/" }: SiteNavLinksProps) {
  const pathname = usePathname();
  const publicActive = isPublicRoute(pathname);
  const adminActive = isAdminRoute(pathname);

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1 font-heading text-xs uppercase tracking-[0.16em] text-white">
      <Link
        href={defaultPublicHref}
        className={cn(
          "rounded-full px-4 py-2 transition",
          publicActive
            ? "bg-brand-blue text-white ring-1 ring-brand-accent/40"
            : "text-white/80 hover:bg-brand-blue hover:text-white",
        )}
      >
        Public
      </Link>
      <Link
        href="/admin"
        className={cn(
          "rounded-full px-4 py-2 transition",
          adminActive
            ? "bg-brand-blue text-brand-accent ring-1 ring-brand-accent/40"
            : "text-white/80 hover:bg-brand-blue hover:text-white",
        )}
      >
        Admin
      </Link>
    </div>
  );
}

export function SiteHeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-bg/90 backdrop-blur-xl">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between py-4 ${shellX}`}
      >
        {children}
      </nav>
    </header>
  );
}
