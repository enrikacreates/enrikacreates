# Poster prompts, round two

Five projects that are invisible on the grid because they have no artwork.
Same house style as the first six, so the row still reads as one system.

Run each in ChatGPT Image. Ask for the **individual elements on transparent
backgrounds** as a second pass, the way we did for Hummingbird and
betterstories: layering separate pieces is what lets one element be large, one
small and one sit behind, which a single flattened rectangle cannot do.

---

## The house style, repeated in every prompt

> Flat vector cut-paper collage illustration. Warm cream ground (#FBF7EF).
> Elements knocked out with clean hard edges, no drop shadows, no gradients,
> no feathering. A limited palette of coral #FC7F5A, blue #3498CE, soft pink
> #F7B5B1, gold #E8B84A, sage #7FA481. Thin single-weight black line details
> and small hand-drawn marks. Centred composition with generous empty cream
> around it. No text, no lettering, no words anywhere in the image.

Two rules that caused the most rework last time:

- **No text.** Generated lettering is always slightly wrong and always has to
  be removed by hand.
- **Generous cream margin.** The composition gets scaled and shifted into
  three different card shapes, and anything tight to the edge clips.

---

## 1. BTI Production Hub

The lead card. Client work, video production operations.

> [house style]
> Subject: a film production scene rendered as flat cut-paper shapes. A
> shoulder-mount video camera in profile as the hero element, large and
> centred. Behind it a simple clapperboard and a studio light on a tripod,
> smaller and set back. In front, a small stack of call sheets as plain
> rectangles. A few thin black line marks suggesting motion near the camera.

Second pass: *camera, clapperboard and light, call sheets* as separate
transparent PNGs.

---

## 2. The Daily Story

A planner where tasks are promoted rather than rewritten.

> [house style]
> Subject: an open paper day-planner seen from above, flat cut-paper style,
> large and centred. Above it, four small cards floating upward in a rising
> diagonal, each a plain rounded rectangle in a different palette colour, as
> if moving from a pile into place. A small sand timer to one side. Thin black
> line marks suggesting upward motion.

Second pass: *planner, the four rising cards, timer* separately.

---

## 3. thestoryoftelling.com

Archival migration of a ten-year blog. The idea is preservation, not growth.

> [house style]
> Subject: a tall stack of bound books and loose paper, flat cut-paper style,
> centred, as though a decade of writing has been gathered into one place. A
> simple archival box behind the stack, open at the top. A few loose pages
> drifting at the edges, caught mid-settle rather than scattering. Calm and
> still rather than busy.

Second pass: *book stack, archive box, loose pages* separately.

---

## 4. bernadettejiwa.com

Author site. Book-first.

> [house style]
> Subject: a single hardback book standing upright and facing forward, flat
> cut-paper style, large and centred, its cover blank. Behind it a soft
> circular shape like a rising sun. Two smaller books lying flat at its base.
> A thin black line underline beneath, like a pen stroke.

Second pass: *standing book, sun circle, two flat books* separately.

---

## 5. whatislovebook.org

Story collection benefiting a girls' education nonprofit.

> [house style]
> Subject: an open book seen from the front, flat cut-paper style, centred,
> with small paper hearts rising out of it in a loose upward cluster, in
> coral, pink and gold. A few thin black line marks radiating outward. Warm
> and generous rather than sentimental. Keep the hearts simple geometric
> shapes, not glossy or decorative.

Second pass: *open book, heart cluster, line marks* separately.

---

## After the images land

Drop the files in `public/assets/projects/<slug>/`, tell me, and I will knock
out the backgrounds, split any layers that arrived flattened, add them to
`lib/posters.ts` and tune each composition across the three card shapes.

Two of these already exist as Sanity projects and will appear the moment the
art does: **bernadettejiwa** and **what-is-love**. The other three need a
project entry creating first: **BTI Production Hub**, **thestoryoftelling**
and **The Daily Story**.
