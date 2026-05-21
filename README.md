# Enrika Creates — Portfolio + Journal

Next.js 14 (App Router) + Sanity CMS. A storytelling portfolio with a
scroll-driven collage hero, a filterable work catalog, deep-linkable project
pages, and a blog/journal — all editable from an embedded Sanity Studio.

**This repo doubles as the reusable template** for migrating a vanilla
HTML/CSS/JS site to Next.js + Sanity. Files carry `MIGRATION TEMPLATE NOTE`
comments explaining the patterns so they can be lifted into future projects
(e.g. the Modern Tribe / Afros & Kinks stores).

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| CMS | Sanity v3 (project `enrikacreates-v2`, id `4ovydy4p`) |
| Studio | Embedded at `/studio` |
| Animation | GSAP + ScrollTrigger (the collage hero) |
| Hosting | Vercel (Git auto-deploy on push to `main`) |
| Images | Sanity CDN with on-the-fly transforms |

## Local development

```bash
npm install
npm run dev          # http://localhost:3000  (site + /studio)
npm run build        # production build
```

Requires `.env.local` (gitignored) — see `.env.example`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=4ovydy4p
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-12-01
SANITY_API_READ_TOKEN=sk...
SANITY_API_WRITE_TOKEN=sk...   # only needed for the migration scripts
```

## Editing content

Two ways — they coexist:

1. **Studio (no code):** go to `/studio`, edit Projects / Blog posts / Site
   settings, hit Publish. Live in ~60s (pages revalidate every 60s).
2. **Programmatic:** the Sanity client / migration scripts (bulk changes).

## Architecture

```
app/
├── (site)/                  ← public pages: footer + floating actions chrome
│   ├── page.tsx             ← home (single page: hero → collage → catalog)
│   ├── work/[slug]/         ← project detail (SSR, deep-linkable)
│   └── blog/ , blog/[slug]/ ← journal index + post
├── studio/[[...tool]]/      ← embedded Sanity Studio (outside the (site) group)
└── layout.tsx               ← root html/body/fonts

components/                  ← HeroLogo, HeroCollage, WorkSection, ProjectCard,
                               CardInner, Slideshow, Gallery, FloatingActions,
                               SiteFooter, PortableTextBody, HomeExperience
lib/
├── sanity/                  ← client, env, image URL builder, queries, fetch
├── types.ts                 ← hand-written TS interfaces (matches schemas)
└── colorUtils.ts            ← isDarkColor + filter labels
sanity/schemas/              ← project, blogPost, siteSettings + objects
scripts/                     ← migrate-portfolio.mjs, seed-settings.mjs
```

**Single-page model:** the home page renders the hero animation AND the work
catalog. "View Work" reveals the catalog and scrolls to it; scrolling back up
returns to the animation. Only individual project/blog pages are separate
routes (for deep-linking + SEO).

---

## The migration playbook (vanilla → Next.js + Sanity)

The order this project followed, reusable for the next site:

1. **Foundation** — create the Sanity project + datasets; scaffold Next.js;
   embed Studio at `/studio`; wire `lib/sanity/{client,env,image}`. Keep the
   old vanilla site live on `main`; build on a `next-rebuild` branch so Vercel
   preview-deploys every push and production stays untouched until merge.
2. **Schemas** — model content as documents (`project`, `blogPost`) + a
   `siteSettings` singleton + reusable object types (`slide`, `galleryItem`,
   `pullQuote`) and a shared `brandColor` palette. Shape them to mirror the
   legacy data so migration is a direct copy.
3. **Frontend port** — copy `styles.css` wholesale into `globals.css`; rebuild
   the DOM as React components keeping the same classNames; port GSAP into a
   client component with `gsap.context()` for cleanup; fetch from Sanity in
   Server Components.
4. **Content migration** — `scripts/migrate-portfolio.mjs` uploads images to
   Sanity and `createOrReplace`s documents with deterministic `_id`s
   (idempotent — safe to re-run). `scripts/seed-settings.mjs` seeds the
   singleton.
5. **Polish + ship** — README, then merge `next-rebuild` → `main` to swap
   production.

### Running the migration scripts

```bash
node scripts/migrate-portfolio.mjs   # uploads images + seeds project docs
node scripts/seed-settings.mjs       # seeds the siteSettings singleton
```

## Deploying

Push to `main` → Vercel auto-builds + deploys to production. Branch pushes get
their own preview URLs. No manual `vercel deploy` needed.

## Optional future enhancements

- **Type generation:** wrap queries in `defineQuery` and run `npm run typegen`
  to replace hand-written `lib/types.ts` with auto-generated types.
- **Visual editing:** add Sanity's Presentation tool for click-on-page editing
  with live preview.
- **Newsletter:** wire the subscribe form (`FloatingActions`, `// TODO`) to a
  real endpoint (ConvertKit / Beehiiv / etc.).
