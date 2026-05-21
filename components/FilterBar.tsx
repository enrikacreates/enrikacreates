"use client";

/**
 * Filter bar — sticky category nav for the work catalog.
 *
 * MIGRATION TEMPLATE NOTE:
 *   Vanilla used history.pushState to /fashion etc. Here we use a `?filter=`
 *   query param via Next's router — shareable, shallow, no full reload.
 *   The active project list is filtered client-side from the full set passed
 *   in (avoids a round-trip per filter click).
 */

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FILTER_LABELS } from "@/lib/colorUtils";

export function FilterBar({ active }: { active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setFilter(filter: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === "all") params.delete("filter");
    else params.set("filter", filter);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <nav className="filter-bar" id="filter-bar">
      {Object.entries(FILTER_LABELS).map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={`filter-btn${active === value ? " active" : ""}`}
          data-filter={value}
          onClick={() => setFilter(value)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
