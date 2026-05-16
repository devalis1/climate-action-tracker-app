import Link from "next/link";

const shellX = "px-5 sm:px-8 lg:px-10";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-bg/90 backdrop-blur-xl">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between py-4 ${shellX}`}
      >
        <Link href="/" className="group flex items-center gap-3">
          <span className="h-9 w-9 rounded-full border border-brand-accent bg-[radial-gradient(circle_at_35%_35%,#62f58a_0,#2352dc_45%,#00001f_76%)] shadow-glow" />
          <span className="font-heading text-sm font-semibold uppercase tracking-[0.22em] text-white">
            City Climate Tracker
          </span>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 p-1 font-heading text-xs uppercase tracking-[0.16em] text-white">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-brand-accent transition hover:bg-brand-blue hover:text-white"
          >
            Public
          </Link>
          <Link
            href="/admin"
            className="rounded-full px-4 py-2 text-white/80 transition hover:bg-brand-blue hover:text-white"
          >
            Admin
          </Link>
        </div>
      </nav>
    </header>
  );
}
