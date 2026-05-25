"use client";

import { usePathname, useRouter } from "next/navigation";

import { Select } from "@/components/ui/input";
import {
  publicCityPath,
  resolveDefaultPublicCitySlug,
  slugFromPublicCityPath,
} from "@/lib/public-default-city";
import { cn } from "@/lib/utils";

export type PublicCityOption = {
  id: number;
  name: string;
  slug: string;
};

type PublicCityPickerProps = {
  cities: PublicCityOption[];
  className?: string;
};

export function PublicCityPicker({ cities, className }: PublicCityPickerProps) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith("/admin") || cities.length === 0) {
    return null;
  }

  const pathSlug = slugFromPublicCityPath(pathname);
  const fallbackSlug = resolveDefaultPublicCitySlug(cities) ?? cities[0]!.slug;
  const selectedSlug =
    cities.some((city) => city.slug === pathSlug) && pathSlug
      ? pathSlug
      : fallbackSlug;

  return (
    <label
      className={cn(
        "flex min-w-[11rem] flex-col gap-1.5 sm:min-w-[13rem]",
        className,
      )}
    >
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-brand-cyan-soft">
        Viewing city
      </span>
      <Select
        aria-label="Select city to view"
        className="py-2 text-xs"
        onChange={(event) => {
          router.push(publicCityPath(event.target.value));
        }}
        value={selectedSlug}
      >
        {cities.map((city) => (
          <option key={city.id} value={city.slug}>
            {city.name}
          </option>
        ))}
      </Select>
    </label>
  );
}
