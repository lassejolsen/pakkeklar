import { TRIP_IMAGES } from "./trip-images.js";
export const HERO_SLIDES = TRIP_IMAGES;

const INTERVAL_MS = 15000;
const FADE_MS = 1200;

export function initHeroCarousel(icon) {
  const root = document.getElementById("hero-slideshow");
  if (!root) return;
  const toggle = document.getElementById("hero-toggle");
  const dots = document.getElementById("hero-pagination");
  const controls = document.getElementById("hero-controls");
  const captionLabel = root.querySelector(".image-label");
  const caption = root.querySelector(".image-label-text");
  const captionIcon = root.querySelector(".image-label [data-icon]");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  root.style.setProperty("--hero-caption-fade", `${FADE_MS / 2}ms`);
  root.style.setProperty("--hero-zoom-duration", `${INTERVAL_MS + FADE_MS}ms`);
  let current = 0;
  let selected = 0;
  let paused = false;
  let changing = false;
  let timer;
  let front = root.querySelector(".hero-image");
  let back = front.cloneNode();
  back.removeAttribute("fetchpriority");
  back.className = "hero-image";
  back.setAttribute("aria-hidden", "true");
  back.alt = "";
  root.insertBefore(back, front.nextSibling);
  front.classList.add("is-zooming");
  const ready = new Map();

  function preload(index) {
    if (!ready.has(index)) {
      const image = new Image();
      image.decoding = "async";
      image.src = HERO_SLIDES[index].src;
      ready.set(index, image.decode().then(() => true, () => false));
    }
    return ready.get(index);
  }

  function updateControls() {
    const label = paused ? "Start bildefremvisningen" : "Sett bildefremvisningen på pause";
    // Keep the button's children stable during pointer focus and image changes.
    if (toggle.getAttribute("aria-label") !== label) toggle.innerHTML = icon(paused ? "play" : "pause");
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    for (const [index, button] of [...dots.children].entries()) {
      button.setAttribute("aria-pressed", String(index === selected));
    }
  }

  function updateCaption(slide) {
    caption.textContent = slide.caption;
    captionIcon.innerHTML = icon(slide.captionIcon);
  }

  function schedule() {
    clearInterval(timer);
    root.classList.toggle("is-zoom-paused", paused || document.hidden);
    if (!paused && !document.hidden) {
      timer = setInterval(() => { void showSlide((current + 1) % HERO_SLIDES.length); }, INTERVAL_MS);
    }
  }

  function setPaused(value) {
    if (paused === value) return;
    paused = value;
    updateControls();
    schedule();
  }

  function finishChange(index, succeeded) {
    changing = false;
    if (!succeeded && selected === index) selected = current;
    updateControls();
    // A click during the fade should select the last requested picture, not disappear.
    if (selected !== current) void showSlide(selected);
  }

  async function showSlide(index) {
    selected = index;
    updateControls();
    if (index === current || changing) return;
    changing = true;
    // Keep the current picture visible until the next one is decoded.
    if (!await preload(index)) {
      ready.delete(index);
      finishChange(index, false);
      return;
    }
    const slide = HERO_SLIDES[index];
    back.src = slide.src;
    back.style.objectPosition = slide.position;
    try { await back.decode(); } catch { finishChange(index, false); return; }
    back.classList.add("is-incoming", "is-zooming");
    if (motion.matches) {
      updateCaption(slide);
    } else {
      // Change the text and pill width only while hidden, halfway through the image fade.
      captionLabel.classList.add("is-changing");
      setTimeout(() => {
        updateCaption(slide);
        captionLabel.classList.remove("is-changing");
      }, FADE_MS / 2);
    }
    setTimeout(() => {
      front.classList.remove("is-current", "is-zooming");
      front.setAttribute("aria-hidden", "true");
      front.alt = "";
      back.classList.replace("is-incoming", "is-current");
      back.removeAttribute("aria-hidden");
      back.alt = slide.alt;
      [front, back] = [back, front];
      current = index;
      finishChange(index, true);
      void preload((current + 1) % HERO_SLIDES.length);
    }, motion.matches ? 0 : FADE_MS);
  }

  for (const [index, slide] of HERO_SLIDES.entries()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hero-dot";
    button.setAttribute("aria-label", `Vis bilde ${index + 1} av ${HERO_SLIDES.length}: ${slide.name}`);
    button.title = slide.name;
    button.addEventListener("click", () => {
      if (!motion.matches) {
        button.classList.remove("is-clicked");
        // Restart the brief halo even when the same dot is clicked twice.
        void button.offsetWidth;
        button.classList.add("is-clicked");
      }
      void showSlide(index);
      // Give a manually selected picture a full interval without changing playback.
      schedule();
    });
    button.addEventListener("animationend", () => button.classList.remove("is-clicked"));
    dots.append(button);
  }

  // Only this control changes the user's playback choice; focus and hover do not.
  toggle.addEventListener("click", () => setPaused(!paused));
  document.addEventListener("visibilitychange", schedule);
  controls.hidden = false;
  updateCaption(HERO_SLIDES[current]);
  updateControls();
  void preload(1);
  schedule();
}
