# Project poster prompts

Prompts for generating the featured-card artwork in ChatGPT (GPT Image), matched
to the two posters that already exist: the Hummingbird collage and the 50 States
torn hero.

## How to use these

1. Attach **both** existing posters to the chat as style references
   (`public/assets/projects/hummingbird/bird.png` + `city.png`, and
   `public/assets/projects/50-states-of-freedom/torn-hero.png`).
2. Paste the **style block** for the lane you want, then the **subject line**
   for the project.
3. Generate square or 4:5. Card art gets composed in CSS afterwards, so the
   generation does not need to match the card's ratio.
4. Ask for elements on a plain flat ground, then knock them out. Do not expect
   the model to hand back transparent layers; that step still happens in Canva
   or by background removal.

**Two lanes, and which project goes in which.** Products and apps go in Lane A,
the built vector collage. Work that is about a person, a client, or a body of
writing goes in Lane B, the photographic torn collage. The lane is the fastest
way to keep ten posters looking like one family without making them identical.

---

## Lane A: vector collage (Hummingbird)

> Flat vector collage illustration in a mid-century editorial poster style,
> graphically bold and eye-catching, built to read as a single silhouette from
> across a room.
>
> **Subject:** one dominant subject rendered in faceted low-polygon planes, each
> plane a flat solid colour with a fine paper grain, edges hard and clean with no
> gradients, no glow, no drop shadow and no soft or feathered edges anywhere.
> The subject occupies most of the frame and is unmistakably the hero.
>
> **Behind it:** a single flat amber-gold disc, partially hidden by the subject.
>
> **Supporting element:** one finely detailed ink line drawing in the manner of a
> vintage engraving, rendered entirely in greyscale so it recedes, sized clearly
> smaller than the subject and sitting lower in the frame.
>
> **Accents:** a few small hand-drawn black ink marks, short radiating strokes and
> small wave squiggles, used sparingly.
>
> **Palette, strictly:** deep teal green, navy blue, warm orange, amber gold,
> warm cream, brick red, black ink. Nothing outside this set.
>
> **Ground:** flat solid cream, edge to edge, no vignette and no texture overlay
> across the whole image.
>
> **Absolutely no text, no letters, no numbers, no logos and no watermarks.**
> Leave generous empty space around every element so each can be cut out cleanly.

### Subject lines, Lane A

| Project | Subject | Supporting engraving |
|---|---|---|
| Hummingbird *(done)* | a hummingbird in flight, wings spread | a row of brownstone shopfronts |
| betterstories.tech | a human head in profile, one eye a flat disc, a small record dot at the temple | a cluster of desktop monitors on a desk |
| SignatureStyle | a standing figure abstracted into garment panels | a rail of hanging coats and dresses |
| Create Space Collective | two hands meeting over a shared object | a workshop interior with benches and tools |
| DeeplyReader | an open book whose pages fan into sound waves | a stack of hardback books and a reading lamp |
| Visionmap.coach | a mountain ridge line with a single path over it | a surveyor's tripod and a horizon of hills |
| Workshop Blocks | a stack of interlocking blocks, slightly off-balance | people seated around a long table |

---

## Lane B: photographic torn collage (50 States)

> Mixed-media collage on a torn sheet of aged paper, graphically bold and
> eye-catching, in the manner of a contemporary editorial cover.
>
> **Subject:** a photographic portrait, desaturated to near black and white with
> deep contrast, cut out cleanly and placed left of centre, filling most of the
> height of the sheet.
>
> **Behind it:** flat hard-edged shapes of solid colour, one large half-disc in
> deep brick red and one rectangle in slate blue, overlapping the figure but never
> softening against it.
>
> **Texture layer:** faint handwritten manuscript script in pale grey, and a panel
> of aged paper, sitting well behind everything else.
>
> **One inset:** a small warm sepia photograph in a hard rectangle, offset to the
> right, the only warm-toned photographic element.
>
> **Edges:** the whole composition sits on a sheet of paper with a rough torn
> deckle edge on all four sides, against pure white.
>
> **Palette, strictly:** warm cream, aged paper beige, deep brick red, slate blue,
> warm grey, sepia, near-black. Nothing outside this set.
>
> **Absolutely no text, no letters, no numbers, no logos and no watermarks.**

### Subject lines, Lane B

| Project | Portrait | Inset photograph |
|---|---|---|
| 50 States of Freedom *(done)* | a woman in profile, hair wrapped | a lone oak tree at golden hour |
| BernadetteJiwa.com | a writer at a desk, three-quarter view, mid-thought | an open notebook and fountain pen |
| GoldcoastLaw.com | a lawyer standing, arms folded, direct to camera | a courthouse colonnade in low sun |

---

## If a generation misses

The three failure modes so far, and the line to add:

- **Type creeps in.** Add: *no text of any kind, no signage, no book titles, no
  labels on any object.*
- **Edges go soft.** Add: *every edge hard and crisp, vector-sharp, no blur, no
  feathering, no glow, no atmospheric haze.*
- **Palette drifts.** Repeat the palette list and add: *use only these colours,
  do not introduce purple, pink, or bright green.*

## What to ask for once a composition is right

Regenerate each element on its own, one per image, same framing, on flat cream:
the subject alone, the engraving alone, the disc alone. That is what makes the
layered card work, and it is the step the flattened poster could not support.
See `components/WorkSection.tsx` for how layers get placed.
