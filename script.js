/* ============================================
   ENRIKA CREATES — Portfolio JS
   ============================================ */

/* PORTFOLIO data — each item:
   { title, category, color, year, tagline?, image?, layout? (1-5, optional override) }
   Non-writing items render as cinematic "Netflix doc" cards (image-driven).
   Writing items render as bold graphic shape cards. */
const PORTFOLIO = [
  // Fashion
  { title: "Modern Tribe Clothing", category: "fashion", color: "#FC7F5A", year: "2024", tagline: "Heritage prints, modern silhouettes", image: "" },
  {
    title: "3D Pattern Design Collection",
    category: "fashion",
    color: "#3498CE",
    year: "2023",
    tagline: "Textile patterns for daily wear",
    image: "/assets/patterndesigns/CoverColorBlockAfroPrintDressImg.png",
    slides: ["/assets/patterndesigns/1.png", "/assets/patterndesigns/2.png", "/assets/patterndesigns/3.png", "/assets/patterndesigns/4.png"],
    skills: ["CLO3D", "Surface Design", "Pattern Design", "Production Mgt."],
    galleryIntro: "From inspiration to design fabrication.",
    gallery: [
      { src: "/assets/gallery_patterndesigncollection/IMG_3740.JPG", caption: "Full bodice silhouette test" },
      { src: "/assets/gallery_patterndesigncollection/IMG_4819.JPG", caption: "Miniature silhouette test: barrel skirt, long puff sleeve" },
      { src: "/assets/gallery_patterndesigncollection/IMG_4917.JPG", caption: "Full dress sizing" },
      { src: "/assets/gallery_patterndesigncollection/bluedress3Dwork.png", caption: "CLO3D pattern construction & 3D drape" },
      { src: "/assets/gallery_patterndesigncollection/IMG_4920.JPG", caption: "Custom surface design dye treatment test" },
      { src: "/assets/gallery_patterndesigncollection/IMG_4925.JPG", caption: "Custom surface design dye treatment test" }
    ],
    story: {
      oneline: "Three handmade garments designed in 3D from sketch to stitch.",
      challenge: "Bridge the gap between digital pattern design and handmade fashion craft. Each piece needed to translate cleanly from 3D plan to wearable garment.",
      action: "Built each piece in 3D pattern software with full measurements, printed sample patterns, then printed, sewn, and fitted the final pieces by hand.",
      result: "Four completed pieces — an afro-print dress, barrel pants with build-up linen blouse, and a black cowl-sleeve blouse — proven from concept to wardrobe."
    }
  },
  { title: "Textile Explorations", category: "fashion", color: "#F7B5B1", year: "2023", tagline: "Hand-dyed fabric studies", image: "" },
  { title: "Woven Stories Series", category: "fashion", color: "#7A8B6A", year: "2022", tagline: "Stories you can wear", image: "" },
  // Product
  { title: "What Is Love", category: "product", color: "#3498CE", year: "2025", tagline: "Conversation card deck", image: "" },
  // Apps
  { title: "SignatureStyle", category: "apps", color: "#FC7F5A", year: "2026", tagline: "Personal style OS", image: "" },
  { title: "GoGoMagic List", category: "apps", color: "#F2C052", year: "2025", tagline: "Lists you actually use", image: "" },
  { title: "StoryKeepr", category: "apps", color: "#F7B5B1", year: "2026", tagline: "Memory vault for your stories", image: "" },
  { title: "Workshop Blocks", category: "apps", color: "#3498CE", year: "2025", tagline: "Plan workshops in blocks", image: "" },
  { title: "Speak Up", category: "apps", color: "#0F2A44", year: "2026", tagline: "Voice training, daily", image: "" },
  // Web
  { title: "Enrika Creates", category: "web", color: "#F2C052", year: "2026", tagline: "This very site", image: "" },
  { title: "Small Gorilla Site", category: "web", color: "#7A8B6A", year: "2024", tagline: "Studio site + portfolio", image: "" },
  // Event
  { title: "Creative Entrepreneur Summit", category: "event", color: "#FC7F5A", year: "2024", tagline: "A day for makers + sellers", image: "" },
  { title: "Pattern Design Workshop", category: "event", color: "#3498CE", year: "2023", tagline: "Hands-on print studio", image: "" },
  { title: "Storytelling Experience", category: "event", color: "#F7B5B1", year: "2024", tagline: "An evening of voices", image: "" },
  // Writing — bold graphic shape style
  { title: "Notes to Self", category: "writing", color: "#F2C052", year: "2026", tagline: "Weekly newsletter on creative living" },
  { title: "The Storytelling Edge", category: "writing", color: "#3498CE", year: "2025", tagline: "Field notes for makers" },
  { title: "How to Begin", category: "writing", color: "#FC7F5A", year: "2026", tagline: "Forthcoming book — creative starts" },
  { title: "Small Gorilla Letters", category: "writing", color: "#7A8B6A", year: "2024", tagline: "Studio dispatches" },
  { title: "On Hope, Daily", category: "writing", color: "#F7B5B1", year: "2026", tagline: "Forthcoming book — practice of hope" },
];

const FILTER_LABELS = {
  all: "All",
  web: "Web",
  apps: "Apps",
  product: "Product",
  fashion: "Fashion",
  event: "Event",
  writing: "Writing"
};

function init() {
  window.scrollTo(0, 0);
  setupCollageScroll();
  setupScrollAnimations();
  renderCatalog();
  setupRouting();
  setupSmoothAnchors();
  setupProjectDetail();
  setupLightbox();
  setupNewsletter();
}

/* ---- Newsletter panel — open/close + simple subscribe handler ---- */
function setupNewsletter() {
  const panel = document.getElementById("newsletter-panel");
  const openBtn = document.getElementById("newsletter-open");
  const closeBtn = document.getElementById("newsletter-close");
  const form = document.getElementById("newsletter-form");
  if (!panel || !openBtn) return;

  const open = () => {
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => panel.querySelector("input")?.focus(), 200);
  };
  const close = () => {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  openBtn.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  panel.addEventListener("click", (e) => { if (e.target === panel) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) close();
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.querySelector("input")?.value?.trim();
    if (!email) return;
    // TODO: wire to real subscription endpoint
    form.classList.add("is-success");
    setTimeout(close, 1800);
  });
}

/* ---- Wire up close button + ESC key + popstate for the detail page ---- */
function setupProjectDetail() {
  const back = document.getElementById("project-back");
  back?.addEventListener("click", closeProjectDetail);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const detail = document.getElementById("project-detail");
      if (detail?.classList.contains("is-open")) closeProjectDetail();
    }
  });

  window.addEventListener("popstate", (e) => {
    const detail = document.getElementById("project-detail");
    if (e.state?.project) {
      // Browser forward to a project — re-open
      const project = PORTFOLIO.find((p) => slugify(p.title) === e.state.project);
      if (project) openProjectDetail(project);
    } else if (detail?.classList.contains("is-open")) {
      // Browser back from project — close
      detail.classList.remove("is-open");
      detail.setAttribute("aria-hidden", "true");
      document.body.classList.remove("detail-open");
    }
  });

  // Deep link — if URL is /work/[slug], open that project
  const path = window.location.pathname.replace(/^\//, "").toLowerCase();
  const m = path.match(/^work\/(.+)$/);
  if (m) {
    const project = PORTFOLIO.find((p) => slugify(p.title) === m[1]);
    if (project) {
      // Reveal work first so back-button returns to the right place
      document.querySelector(".work")?.classList.add("is-revealed");
      document.querySelector(".site-footer")?.classList.add("is-revealed");
      setTimeout(() => openProjectDetail(project), 100);
    }
  }
}

/* ---- Smooth-scroll for in-page anchor links ---- */
function setupSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ---- Scroll-driven collage hero ---- */
function setupCollageScroll() {
  const zone = document.getElementById("hero-zone");
  const collage = document.getElementById("hero-collage");
  const heroQuote = document.getElementById("hero-quote");
  const viewWorkCue = document.getElementById("view-work-cue");
  const progressFill = document.getElementById("hero-progress-fill");

  ScrollTrigger.create({
    trigger: zone,
    start: "top bottom",
    end: "bottom bottom",
    onUpdate: (self) => {
      progressFill.style.width = `${self.progress * 100}%`;
    },
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: zone,
      start: "top bottom",
      end: "bottom bottom",
      scrub: 2.0,
    },
  });

  // Collage starts visible in clustered state
  gsap.set(collage, { opacity: 1 });

  // --- Layers: tight cluster (from) → spread open (to) ---
  // Spread fills most of the timeline → no dead zone → continuous scroll experience
  const t = 0.0;
  const d = 0.85;

  // Portrait — starts hidden BEHIND plants (z-index in CSS) AND pushed below
  // Rises and is revealed as plants spread away
  tl.fromTo("#layer-portrait",
    { y: 600, scale: 0.65 },
    { y: -80, scale: 1, duration: d }, t);

  // --- Plants: start clustered in front of portrait, spread outward ---
  tl.fromTo("#layer-banana",
    { x: 0, y: 0 },
    { x: -200, y: -20, duration: d }, t);
  tl.fromTo("#layer-palm-left",
    { x: 0, y: 0, scaleX: -1, rotation: 0 },
    { x: -120, y: 30, scaleX: -1, rotation: -20, duration: d }, t);
  tl.fromTo("#layer-palm-right",
    { x: 0, rotation: 0 },
    { x: 10, rotation: -12, duration: d }, t);
  tl.fromTo("#layer-leaf-2",
    { y: 0 },
    { y: 280, duration: d }, t);
  tl.fromTo("#layer-leaf-large",
    { y: 0 },
    { y: 280, duration: d }, t);
  tl.fromTo("#layer-leaf-1",
    { y: 0 },
    { y: 250, duration: d }, t);
  tl.fromTo("#layer-leaf-3",
    { x: 0, y: 0 },
    { x: -40, y: -40, duration: d }, t);
  tl.fromTo("#layer-leaf-4",
    { x: 0, y: 0 },
    { x: 120, y: 80, duration: d }, t);

  // --- Foreground objects — lifted UP so they peek above the hard bottom crop ---
  // Typewriter — bottom right, lifted clear above the hard crop
  tl.fromTo("#layer-typewriter",
    { x: 0, y: 0 },
    { x: 220, y: -200, duration: d }, t);
  tl.fromTo("#layer-camera",
    { x: 0, y: 0, rotation: 0 },
    { x: -50, y: -180, rotation: 10, duration: d }, t);
  // Mic sits mid-left, below the heart — sound waves emanate from it
  tl.fromTo("#layer-mic",
    { x: 0, y: 0 },
    { x: -60, y: -90, duration: d }, t);
  // Soundwave radiates out of the mic — same y level, just right of mic mouth
  tl.fromTo("#layer-soundwave",
    { x: 150, opacity: 0 },
    { x: 30, y: -90, opacity: 1, duration: d }, t);
  tl.fromTo("#layer-heart",
    { x: 0, y: 0, scale: 1 },
    { x: -310, y: -120, scale: 0.75, duration: d }, t);
  tl.fromTo("#layer-sunflower",
    { x: 0, y: 0 },
    { x: -150, y: -170, rotation: -20, duration: d }, t);
  tl.fromTo("#layer-cassette",
    { x: 0, y: 0, rotation: 0 },
    { x: -100, y: -180, rotation: -40, duration: d }, t);
  tl.fromTo("#layer-sewing",
    { x: 0, y: 0, rotation: 0 },
    { x: -180, y: -150, rotation: -5, duration: d }, t);
  tl.fromTo("#layer-colorchips",
    { x: 0, y: 0, rotation: 0 },
    { x: 170, y: -170, rotation: 8, duration: d }, t);

  // --- Small details ---
  tl.fromTo("#layer-brain",
    { x: 0, y: 0 },
    { x: 100, y: -120, duration: d }, t);
  tl.fromTo("#layer-lightbulb",
    { y: 0, rotation: 0 },
    { y: -300, rotation: 20, duration: d }, t);
  // Hummingbird flies up to the bird-of-paradise flowers — beak tilts up
  // toward the tall yellow flower above (gentle tilt so tail clears the plant)
  tl.fromTo("#layer-hummingbird",
    { x: 0, y: 0, rotation: 0 },
    { x: -190, y: -440, rotation: -12, duration: d }, t);

  // --- Background shapes ---
  tl.fromTo("#layer-bg-orange",
    { scale: 0.85 },
    { scale: 1.15, duration: d }, t);
  tl.fromTo("#layer-bg-blue",
    { scale: 0.85, x: 0, y: 0 },
    { scale: 1.1, x: 70, y: -80, duration: d }, t);
  tl.fromTo("#layer-bg-triangle",
    { x: 0, rotation: 0 },
    { x: -80, rotation: -20, duration: d }, t);
  tl.fromTo("#layer-bg-stripes",
    { x: 0 },
    { x: 80, duration: d }, t);

  // Mid-spread: plants drop BEHIND portrait so it emerges from foliage
  const plantsBack = "#layer-palm-left, #layer-palm-right, #layer-banana, #layer-leaf-1, #layer-leaf-2, #layer-leaf-3, #layer-leaf-4";
  tl.set(plantsBack, { zIndex: 2 }, 0.50);

  // Designer quote fades in mid-spread, stays through to the end
  tl.fromTo(heroQuote,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.20 }, 0.55);

  // View Work cue fades in during the last leg of the spread
  tl.fromTo(viewWorkCue,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.15 }, 0.85);

  // Click View Work → reveal the work section + footer, then scroll to them
  // (Work section is hidden by default — user must click to reveal)
  viewWorkCue.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    const work = document.querySelector(".work");
    const footer = document.querySelector(".site-footer");
    if (!work?.classList.contains("is-revealed")) {
      work?.classList.add("is-revealed");
      footer?.classList.add("is-revealed");
      // Wait for layout to settle before scrolling
      requestAnimationFrame(() => {
        if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
        requestAnimationFrame(() => {
          work?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    } else {
      work?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

/* ---- GSAP scroll-triggered entrance animations ---- */
function setupScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  const animConfigs = {
    "fade-up":    { y: 50, opacity: 0 },
    "fade-down":  { y: -50, opacity: 0 },
    "fade-left":  { x: 60, opacity: 0 },
    "fade-right": { x: -60, opacity: 0 },
    "zoom-in":    { scale: 0.85, opacity: 0 },
  };

  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    const anim = el.dataset.anim || "fade-up";
    const delay = parseFloat(el.dataset.delay || 0) / 1000;
    const from = animConfigs[anim] || animConfigs["fade-up"];

    gsap.from(el, {
      ...from,
      duration: 0.9,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        once: true,
      },
    });
  });
}

/* ---- Catalog rendering ----
   Two card styles:
     • Cinematic (Netflix-doc style) — for projects with imagery
       (web/apps/product/fashion/event) — 4 layout variants
     • Graphic (bold shape style) — for writing — 5 layout variants */
function renderCatalog(filter = "all") {
  const grid = document.getElementById("catalog-grid");
  const items = filter === "all"
    ? PORTFOLIO
    : PORTFOLIO.filter((p) => p.category === filter);

  grid.innerHTML = "";

  if (items.length === 0) {
    grid.innerHTML = '<div class="catalog-empty">No work in this category yet.</div>';
    return;
  }

  items.forEach((item, i) => {
    const layout = item.layout || ((i % 5) + 1);
    const isDark = isDarkColor(item.color);
    const hasImage = item.image && item.image.length > 0;

    const el = document.createElement("article");
    el.className = `catalog-item style-graphic layout-${layout}${isDark ? " dark-card" : ""}${hasImage ? " has-collage" : ""}`;
    el.style.setProperty("--card-color", item.color);
    el.style.animationDelay = `${i * 0.05}s`;
    el.innerHTML = renderCardLayout(layout, item);
    // Make card clickable to open project detail
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.dataset.slug = slugify(item.title);
    el.addEventListener("click", () => openProjectDetail(item));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProjectDetail(item);
      }
    });
    grid.appendChild(el);
  });
}

/* ---- URL-friendly slug from a title ---- */
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/* ---- Project Detail Page — opens when a card is clicked ---- */
function openProjectDetail(item) {
  const detail = document.getElementById("project-detail");
  const inner = document.getElementById("project-detail-inner");
  if (!detail || !inner) return;

  const slug = slugify(item.title);
  detail.style.setProperty("--detail-color", item.color);
  detail.classList.toggle("dark-detail", isDarkColor(item.color));

  const story = item.story || {};
  const slides = item.slides || [];

  // Hero = the card design at large scale (shapes + collage image + text band)
  const heroMarkup = renderCardLayout(item.layout || 2, item);
  const isDark = isDarkColor(item.color);

  inner.innerHTML = `
    <div class="project-hero catalog-item style-graphic layout-${item.layout || 2}${isDark ? " dark-card" : ""}${item.image ? " has-collage" : ""}" style="--card-color: ${item.color};">
      ${heroMarkup}
    </div>

    <div class="project-story">
      ${story.oneline ? `<p class="project-oneline">${story.oneline}</p>` : ""}
      ${story.oneline ? `<hr class="project-divider">` : ""}
      ${story.challenge ? `
        <section class="project-section">
          <h3>Challenge</h3>
          <p>${story.challenge}</p>
        </section>` : ""}
      ${story.action ? `
        <section class="project-section">
          <h3>Action</h3>
          <p>${story.action}</p>
        </section>` : ""}
      ${story.result ? `
        <section class="project-section">
          <h3>Result</h3>
          <p>${story.result}</p>
        </section>` : ""}
      ${(item.skills && item.skills.length) ? `
        <section class="project-skills">
          <p class="project-skills-label">Skills</p>
          <ul class="project-skills-list">
            ${item.skills.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </section>` : ""}
    </div>

    ${slides.length ? `
      <section class="project-slideshow-section">
        <h2 class="project-section-title">Designs</h2>
        <div class="project-slideshow" id="project-slideshow">
          <div class="slideshow-viewport">
            <div class="slideshow-track">
              ${slides.map((src, i) => `<img class="slideshow-slide" src="${src}" alt="${item.title} — slide ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}">`).join("")}
            </div>
          </div>
          <button class="slideshow-nav prev" aria-label="Previous slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button class="slideshow-nav next" aria-label="Next slide">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="slideshow-dots">
            ${slides.map((_, i) => `<button class="slideshow-dot${i === 0 ? " is-active" : ""}" aria-label="Slide ${i + 1}" data-index="${i}"></button>`).join("")}
          </div>
        </div>
      </section>` : ""}

    ${(item.gallery && item.gallery.length) ? `
      <section class="project-gallery">
        <h2 class="project-section-title">Process</h2>
        ${item.galleryIntro ? `<p class="project-section-intro">${item.galleryIntro}</p>` : ""}
        <div class="gallery-grid" id="gallery-grid">
          ${item.gallery.map((g, i) => {
            const src = typeof g === "string" ? g : g.src;
            const cap = typeof g === "string" ? "" : (g.caption || "");
            return `
              <figure class="gallery-item${cap ? " has-caption" : ""}" data-index="${i}">
                <img src="${src}" alt="${cap || `${item.title} — process ${i + 1}`}" loading="lazy">
                ${cap ? `<figcaption class="gallery-caption">${cap}</figcaption>` : ""}
              </figure>`;
          }).join("")}
        </div>
      </section>` : ""}
  `;

  // Wire up slideshow + gallery lightbox after innerHTML is set
  initSlideshow();
  initGallery(item.gallery || []);

  detail.setAttribute("aria-hidden", "false");
  detail.classList.add("is-open");
  document.body.classList.add("detail-open");

  history.pushState({ project: slug }, "", `/work/${slug}`);
  // Reset scroll inside detail page
  detail.scrollTop = 0;
}

function closeProjectDetail() {
  const detail = document.getElementById("project-detail");
  if (!detail) return;
  detail.classList.remove("is-open");
  detail.setAttribute("aria-hidden", "true");
  document.body.classList.remove("detail-open");
  history.pushState({}, "", "/");
}

/* ---- Gallery — wire up grid image clicks to open the lightbox ---- */
let LIGHTBOX_IMAGES = [];
let LIGHTBOX_INDEX = 0;

function initGallery(images) {
  // Normalize so every item has { src, caption }
  LIGHTBOX_IMAGES = (images || []).map((g) =>
    typeof g === "string" ? { src: g, caption: "" } : { src: g.src, caption: g.caption || "" }
  );
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;
  grid.querySelectorAll(".gallery-item").forEach((fig) => {
    fig.style.cursor = "zoom-in";
    fig.addEventListener("click", () => {
      const idx = Number(fig.dataset.index) || 0;
      openLightbox(idx);
    });
  });
}

function openLightbox(index) {
  if (!LIGHTBOX_IMAGES.length) return;
  LIGHTBOX_INDEX = (index + LIGHTBOX_IMAGES.length) % LIGHTBOX_IMAGES.length;
  const lb = document.getElementById("lightbox");
  const img = document.getElementById("lightbox-image");
  const counter = document.getElementById("lightbox-counter");
  const caption = document.getElementById("lightbox-caption");
  const current = LIGHTBOX_IMAGES[LIGHTBOX_INDEX];
  img.src = current.src;
  img.alt = current.caption || "";
  if (caption) caption.textContent = current.caption || "";
  counter.textContent = `${LIGHTBOX_INDEX + 1} / ${LIGHTBOX_IMAGES.length}`;
  lb.classList.add("is-open");
  lb.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  const lb = document.getElementById("lightbox");
  lb.classList.remove("is-open");
  lb.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
}

function setupLightbox() {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  document.getElementById("lightbox-close")?.addEventListener("click", closeLightbox);
  document.getElementById("lightbox-prev")?.addEventListener("click", () => openLightbox(LIGHTBOX_INDEX - 1));
  document.getElementById("lightbox-next")?.addEventListener("click", () => openLightbox(LIGHTBOX_INDEX + 1));
  // Click outside the image (on the backdrop) closes
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });
  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") openLightbox(LIGHTBOX_INDEX - 1);
    else if (e.key === "ArrowRight") openLightbox(LIGHTBOX_INDEX + 1);
  });
}

/* ---- Slideshow — chevron + dot navigation for the project slides ---- */
function initSlideshow() {
  const slideshow = document.getElementById("project-slideshow");
  if (!slideshow) return;
  const track = slideshow.querySelector(".slideshow-track");
  const slides = slideshow.querySelectorAll(".slideshow-slide");
  const dots = slideshow.querySelectorAll(".slideshow-dot");
  const prevBtn = slideshow.querySelector(".slideshow-nav.prev");
  const nextBtn = slideshow.querySelector(".slideshow-nav.next");
  if (!track || slides.length === 0) return;

  let index = 0;
  const total = slides.length;

  function go(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
  }

  prevBtn?.addEventListener("click", () => go(index - 1));
  nextBtn?.addEventListener("click", () => go(index + 1));
  dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.index))));

  // Keyboard arrows (when detail page is open and focused inside)
  slideshow.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
  });
  slideshow.tabIndex = 0;
}

/* ---- Luminance check — does the bg color need light or dark text? ---- */
function isDarkColor(hex) {
  if (!hex || hex[0] !== "#" || hex.length < 7) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Perceived luminance (0..1)
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L < 0.6;
}


/* ---- 5 card layouts — bold geometric "micro-story" cards ----
   Optional collage imagery (cut-out PNG) layers ON TOP of the shapes
   for non-writing categories when item.image is provided. */
function renderCardLayout(layout, item) {
  const cat = item.category;
  const year = item.year || "";
  const title = item.title;
  const tagline = item.tagline || "";

  const collage = (item.image && item.image.length > 0)
    ? `<img class="card-collage" src="${item.image}" alt="" loading="lazy" aria-hidden="true">`
    : "";

  switch (layout) {
    // Layout 1 — Portrait Block: shape upper-left, content lower
    case 1:
      return `
        <div class="card-shape-zone">
          <span class="shape shape-circle"></span>
          <span class="shape shape-half"></span>
        </div>
        ${collage}
        <div class="card-content">
          <span class="card-year">${year}</span>
          <h3 class="card-title">${title}</h3>
          <p class="card-tagline">${tagline}</p>
        </div>
      `;

    // Layout 2 — Center Stage: big central shape + accent
    case 2:
      return `
        <div class="card-shape-zone center">
          <span class="shape shape-circle big"></span>
          <span class="shape shape-triangle"></span>
        </div>
        ${collage}
        <div class="card-content bottom">
          <span class="card-year inline">${year}</span>
          <h3 class="card-title">${title}</h3>
          <p class="card-tagline">${tagline}</p>
        </div>
      `;

    // Layout 3 — Year Hero: oversized italic year as the sole design element
    case 3:
      return `
        <div class="card-year-hero">${year}</div>
        ${collage}
        <div class="card-content bottom">
          <h3 class="card-title">${title}</h3>
          <p class="card-tagline">${tagline}</p>
        </div>
      `;

    // Layout 4 — Diagonal Split: two-tone with content in the bottom corner
    case 4:
      return `
        <div class="card-split"></div>
        <div class="card-shape-zone tucked">
          <span class="shape shape-half"></span>
        </div>
        ${collage}
        <div class="card-content bottom">
          <span class="card-year">${year}</span>
          <h3 class="card-title">${title}</h3>
          <p class="card-tagline">${tagline}</p>
        </div>
      `;

    // Layout 5 — Shape Grid: clean geometric composition
    case 5:
    default:
      return `
        <div class="card-shape-zone grid">
          <span class="shape shape-square"></span>
          <span class="shape shape-circle small"></span>
        </div>
        ${collage}
        <div class="card-content bottom">
          <span class="card-year">${year}</span>
          <h3 class="card-title">${title}</h3>
          <p class="card-tagline">${tagline}</p>
        </div>
      `;
  }
}

/* ---- URL Routing ---- */
function setupRouting() {
  const path = window.location.pathname.replace(/^\//, "").toLowerCase();
  const validFilters = Object.keys(FILTER_LABELS);

  // If user lands on a filter URL (e.g. /fashion), pre-set the filter state
  // but DO NOT reveal work — gate is absolute, user must click View Work first
  if (validFilters.includes(path) && path !== "all") {
    setActiveFilter(path);
    renderCatalog(path);
  }

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const filter = btn.dataset.filter;
      setActiveFilter(filter);
      renderCatalog(filter);

      const newPath = filter === "all" ? "/" : `/${filter}`;
      history.pushState({ filter }, "", newPath);
    });
  });

  window.addEventListener("popstate", (e) => {
    const filter = e.state?.filter || "all";
    setActiveFilter(filter);
    renderCatalog(filter);
  });
}

function setActiveFilter(filter) {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });
}

/* ---- Boot ---- */
document.addEventListener("DOMContentLoaded", init);
