# Poster prompts, round three

The three catalog projects: DeeplyReader, Hummingbird, betterstories.

These already have artwork, but it is the old layered kind: transparent PNGs
stacked and positioned in CSS. The three featured projects have been redone as
single finished posters, and until these three match, the home page is running
two systems side by side. One row reads as finished and the other as a working
sketch.

Use the same prompt that produced Create Space, 50 States and SignatureStyle.
Only the subject changes.

---

## What the format now requires

Learned from wiring the first three in, not guessed:

- **4:5, every time.** 1122 x 1402 is what the model returns and what the cards
  are built around.
- **The bottom fifth is margin, not canvas.** The card crops to a square from
  the top. That crop exists because the generated cream ran into the page's own
  cream and the card lost its bottom edge: the artwork dissolved instead of
  ending. So the composition has to resolve in the **top 80%**. Anything below
  that line will not be seen.
- **No reserved space for text.** The title and tagline sit under the poster
  now, not on it. Nothing has to be kept clear for type.
- **The browser window stays in the artwork.** It is drawn into the image in all
  three of the new posters, so the CSS one is switched off. Keep asking for it:
  it is what makes a card say "software" at a glance.
- **A coloured ground that bleeds to all four edges**, with the cream organic
  shape sitting on it. That colour is what gives the card its edge against the
  page.

## The subjects

**1. DeeplyReader** — reading, listened to rather than read.

> Subject: a figure reclining and reading, rendered as flat cut-paper shapes,
> large and centred. Behind it a gramophone horn in engraved-illustration style,
> smaller and set back, and a few concentric arcs suggesting sound travelling
> outward. Thin black line marks near the arcs.

**2. Hummingbird** — catching a song idea before it goes.

> Subject: a hummingbird mid-hover as the hero element, large and centred, wings
> rendered as overlapping cut-paper planes in layered colour. Behind it a low row
> of simple buildings in engraved-illustration style, much smaller, sitting along
> the bottom of the composition. A few thin wavy line marks either side of the
> bird.

**3. betterstories** — watching someone use the thing you made.

> Subject: a desk scene as flat cut-paper shapes. A screen showing a simple
> stacked layout as the hero element, centred. Overlapping it at lower left, a
> circular portrait of a person in engraved-illustration style, as though a
> camera feed. Behind, a large circle in a warm accent colour. Small thin black
> line marks at the edges.

## When each one lands

Save it as `public/assets/posters/<slug>.png` and add the slug to
`FLAT_POSTERS` in `lib/posters.ts`. The slugs are `deeplyreader`,
`hummingbird`, `betterstories`. Nothing else: the card picks up the ratio, the
crop and the caption layout on its own.

Once all three are in, the catalog cards can move to the same square plate as
the featured row and the layered system can be deleted outright, along with
`--tier-scale`, `--tier-shift`, the drawn `.poster-frame` and the blob.
