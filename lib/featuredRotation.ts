/**
 * Which three of the featured projects lead the page right now.
 *
 * The brief was "random on refresh", which the site's own caching makes
 * impossible as stated: pages are statically rendered with `revalidate: 60`, so
 * everyone arriving inside the same minute is served identical HTML. Randomness
 * per refresh would need either `force-dynamic`, which gives up static caching
 * on the one row that is above the fold, or a shuffle after hydration, which
 * visibly reorders the first thing a visitor sees.
 *
 * So the rotation turns over once per cache window instead. The page changes
 * through the day, a returning visitor sees different work, it stays fully
 * static, and nothing moves on screen. The only person who can tell the
 * difference is someone hitting reload to test it.
 *
 * Deterministic for a given window, which is the whole point: the server must
 * produce one answer for the entire minute, or the cached HTML and a later
 * render would disagree.
 */

/** Matches DEFAULT_NEXT_OPTS.revalidate in lib/sanity/fetch.ts. */
const WINDOW_MS = 60_000;

/** How many lead the page. The grid is built for three across. */
export const FEATURED_SLOTS = 3;

/** mulberry32: small, fast, and stable across runtimes, which matters here. */
function seeded(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick the lead projects for the current window.
 *
 * Falls through untouched when the pool is no bigger than the number of slots,
 * so marking only three projects featured behaves exactly as it did before
 * any of this existed.
 *
 * @param now injectable so this can be tested without waiting a minute.
 */
export function rotateFeatured<T>(
  pool: T[],
  slots: number = FEATURED_SLOTS,
  now: number = Date.now()
): T[] {
  if (pool.length <= slots) return pool;

  const rand = seeded(Math.floor(now / WINDOW_MS));

  // Fisher-Yates over a copy: the caller's array is the fetch result and may
  // be reused elsewhere on the page.
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, slots);
}
