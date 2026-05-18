import Link from "next/link";

export default function CityNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <div className="rounded-[12px] border border-white/12 bg-brand-surface p-10 shadow-brand">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-muted">
          Viewer
        </p>
        <h1 className="mt-4 font-heading text-3xl font-semibold text-white">
          City not found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/72">
          No seeded profile matches that slug.{" "}
          <Link href="/" className="font-mono text-brand-accent underline-offset-4 hover:underline">
            Return home
          </Link>{" "}
          or verify migrations (<code className="font-mono text-[0.7rem]">npm run db:migrate</code>
          ).
        </p>
      </div>
    </div>
  );
}
