import {
  STORAGE_KEY, WORKSPACE_KEY, TRIP_TYPES, CATEGORIES, MAX_DAYS, MAX_TRIPS, MAX_QUANTITY,
  createTrip, validDays, progress, addItem, normaliseName, createWorkspace,
  restoreWorkspace, countdown, formatDeparture, isCalendarDate, osloToday,
  copyTrip, copyName, preparationProgress, validQuantity, suggestedQuantity,
  setItemQuantity, updateTripDays, changeTripType, tripChangeSummary, sameTripDetails
} from "./packing.js";
import { initHeroCarousel } from "./carousel.js";
import { TRIP_IMAGES, tripImage } from "./trip-images.js";
import { initDashboard, renderSuitcase } from "./dashboard.js";
import { tripFromDream } from "./adventure-data.js";
import { readResetBackup, resetLocalData, undoLocalReset } from "./settings-data.js";

// Small, local SVG icon set. User-entered text is always inserted with textContent.
const paths = {
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="var(--bg)"/><circle cx="15" cy="17" r="3" fill="var(--bg)"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v.1"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  book: '<path d="M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1ZM12 5v16"/>',
  luggage: '<rect x="5" y="6" width="14" height="15" rx="3"/><path d="M9 6V3h6v3M9 10v7m6-7v7M8 21v1m8-1v1"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  "arrow-right": '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  "arrow-down": '<path d="M12 4v15m-6-6 6 6 6-6"/>',
  "arrow-left": '<path d="M20 12H5m6-6-6 6 6 6"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  edit: '<path d="m16 3 5 5-12 12-6 1 1-6ZM13 6l5 5"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>',
  "arrow-up-right": '<path d="M6 18 18 6M6 6h12v12"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  leaf: '<path d="M20 3c-7-1-15 1-15 8a6 6 0 0 0 6 6c7 0 9-7 9-14ZM4 21 15 10"/>',
  heart: '<path d="m12 20-8-8a5 5 0 0 1 8-6 5 5 0 0 1 8 6Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
  shirt: '<path d="m8 3-6 4 3 5 3-2v11h8V10l3 2 3-5-6-4c0 4-8 4-8 0Z"/>',
  bottle: '<rect x="7" y="8" width="10" height="13" rx="3"/><path d="M9 8V3h6v5M8 14h8"/>',
  plug: '<path d="M8 2v5m8-5v5M5 7h14v3a7 7 0 0 1-14 0ZM12 17v5"/>',
  ticket: '<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4ZM15 5v3m0 3v2m0 3v3"/>',
  mountain: '<path d="m2 20 8-15 5 9 3-5 4 11ZM6 12l4 2 3-3"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
  lightbulb: '<path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0l-1 2H9Z"/>',
  rotate: '<path d="M3 4v6h6M3 10a9 9 0 1 1 1 7"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M5 16H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
  printer: '<path d="M6 8V3h12v5M6 17H3V8h18v9h-3M6 14h12v7H6ZM17 11h1"/>'
};
const icon = name => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.luggage}</svg>`;
document.querySelectorAll("[data-icon]").forEach(element => { element.innerHTML = icon(element.dataset.icon); });
initHeroCarousel(icon);

const $ = id => document.getElementById(id);
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};
const iconElement = (name, className = "") => {
  const node = el("span", className);
  node.innerHTML = icon(name);
  return node;
};

let workspace;
let storageAvailable = true;
try {
  workspace = restoreWorkspace(localStorage.getItem(WORKSPACE_KEY)) ||
    createWorkspace(localStorage.getItem(STORAGE_KEY));
} catch {
  storageAvailable = false;
}
workspace ||= createWorkspace();
// An unsaved form uses a preview object; it never becomes a stored trip until submitted.
let trip = workspace.trips.find(item => item.id === workspace.activeTripId) || {
  ...createTrip(), id: "unsaved", name: "Din første tur", departureDate: "", isExample: false
};
let creatingTrip = workspace.trips.length === 0;
let filter = "all";
let pendingConfirm = null;
let undoAction = null;
let toastTimeout;
let printTitle = null;
let quantityItemId = null;
let editingPlan = false;
let draftImageId = null;
let pendingNavigation = null;
let packingMode = false;
let dashboard = null;
const mobileScreen = window.matchMedia("(max-width: 760px)");
const collapsedCategories = new Map();

const tips = {
  city: "Rull klærne i stedet for å brette dem. Det gir bedre oversikt i kofferten.",
  mountain: "Pakk det du trenger underveis øverst. En ekstra tørr pose holder skiftet klart.",
  beach: "Legg badetøyet lett tilgjengelig. Kanskje frister et bad før du rekker å pakke ut?"
};

function persist() {
  if (trip.id !== "unsaved") {
    const index = workspace.trips.findIndex(item => item.id === trip.id);
    if (index >= 0) workspace.trips[index] = trip;
    else workspace.trips.push(trip);
    workspace.activeTripId = trip.id;
  }
  try {
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  const status = $("save-status");
  status.classList.toggle("save-warning", !storageAvailable);
  status.replaceChildren(iconElement(storageAvailable ? "check-circle" : "lock"),
    el("span", "", storageAvailable ? "Lagret på denne enheten" : "Kan ikke lagre – behold siden åpen"));
  $("plan-saved-label").replaceChildren(iconElement(storageAvailable ? "check-circle" : "lock"),
    el("span", "", storageAvailable ? "Turdetaljene er lagret" : "Kan ikke lagre – behold siden åpen"));
  renderTripCards();
}

function renderTripCards() {
  const empty = workspace.trips.length === 0;
  document.body.classList.toggle("workspace-empty", empty);
  $("trips-empty").hidden = !empty;
  $("reiseglede").hidden = empty;
  document.querySelector('[data-nav="reiseglede"]').hidden = empty;
  document.querySelector(".checklist").hidden = empty;
  document.querySelector(".workspace-note").hidden = empty;
  $("new-trip-button").hidden = empty;
  const cards = $("trip-cards");
  cards.replaceChildren();
  const today = osloToday();
  const overview = dashboard?.overview();
  cards.setAttribute("aria-label", overview?.featured ? "Andre turer" : "Dine turer");
  for (const saved of overview?.others || workspace.trips) {
    const card = el("button", `trip-card${saved.id === trip.id ? " selected" : ""}`);
    card.type = "button";
    card.dataset.tripId = saved.id;
    card.setAttribute("aria-label", `Åpne ${saved.name}`);
    card.setAttribute("aria-pressed", saved.id === trip.id);
    const image = el("img", "trip-card-image");
    const cover = tripImage(saved.type, saved.imageId);
    image.src = cover.src;
    image.style.objectPosition = cover.position;
    image.alt = "";
    image.width = 180;
    image.height = 190;
    image.loading = "lazy";
    const body = el("span", "trip-card-body");
    const badges = el("span", "trip-card-badges");
    if (saved.id === trip.id) badges.append(el("span", "selected-badge", "Valgt"));
    badges.hidden = !badges.children.length;
    const title = el("span", "trip-card-title", saved.name);
    const meta = el("span", "trip-card-meta", `${formatDeparture(saved.departureDate)} · ${saved.days} ${saved.days === 1 ? "dag" : "dager"}`);
    const result = progress(saved);
    const packing = el("span", "trip-card-packing", `${result.packed} av ${result.total} pakket`);
    const track = el("span", "trip-card-track");
    const fill = el("span");
    fill.style.width = `${result.percent}%`;
    track.append(fill);
    const preparations = preparationProgress(saved);
    const prepared = el("span", `trip-card-preparation${preparations.done === preparations.total ? " complete" : ""}`);
    prepared.append(iconElement("check-circle"), el("span", "", `${preparations.done} av ${preparations.total} forberedelser`));
    body.append(badges, title, meta, packing, track, prepared);
    const timer = countdown(saved.departureDate, saved.days, today);
    const counter = el("span", `trip-card-countdown${timer.number === null ? " no-number" : ""}`);
    if (timer.number !== null) counter.append(el("strong", "", timer.number));
    else counter.append(iconElement(timer.daysUntil === null ? "calendar" : "sun"));
    counter.append(el("span", "", timer.label));
    card.append(image, body, counter);
    cards.append(card);
  }
  cards.hidden = !cards.children.length;
  const activeTimer = countdown(trip.departureDate, trip.days, today);
  $("list-countdown").textContent = activeTimer.detail;
  $("delete-trip-button").disabled = workspace.trips.length <= 1;
  dashboard?.render();
}

function announce(message) {
  $("live-status").textContent = message;
}

function hideToast() {
  clearTimeout(toastTimeout);
  $("toast").hidden = true;
  undoAction = null;
}

function showToast(message, undo = null) {
  clearTimeout(toastTimeout);
  $("toast-message").textContent = message;
  $("toast").hidden = false;
  $("toast-undo").hidden = !undo;
  undoAction = undo;
  toastTimeout = setTimeout(hideToast, undo ? 10000 : 4500);
}

function updateProgress() {
  const result = progress(trip);
  renderSuitcase(result);
  $("progress-count").textContent = `${result.packed} av ${result.total} pakket`;
  $("progress-message").textContent = result.total > 0 && result.remaining === 0
    ? "Alt på listen er pakket."
    : result.packed ? `${result.remaining} igjen, du er på vei!` : "Litt etter litt, så er du klar.";
  $("progress-fill").style.width = `${result.percent}%`;
  $("progress-track").setAttribute("aria-valuenow", result.percent);
  $("progress-track").setAttribute("aria-valuetext", `${result.packed} av ${result.total} pakket`);
  document.querySelector(".progress-block").classList.toggle("complete", result.total > 0 && result.remaining === 0);
  $("all-count").textContent = result.total;
  $("reset-button").disabled = result.packed === 0;
  $("packing-mode-name").textContent = trip.name;
  $("packing-mode-count").textContent = `${result.packed} av ${result.total} pakket`;
  $("packing-mode-fill").style.width = `${result.percent}%`;
  $("packing-mode-progress").setAttribute("aria-valuenow", result.percent);
  $("packing-mode-progress").setAttribute("aria-valuetext", `${result.packed} av ${result.total} pakket`);
}

function renderList() {
  const grid = $("category-grid");
  grid.replaceChildren();
  const visible = trip.items.filter(item => filter === "all" || (filter === "packed" ? item.packed : !item.packed));
  for (const [key, category] of Object.entries(CATEGORIES)) {
    // Keep every item in the document. Print CSS reveals them independently
    // of the screen filter, including when a print preview is already open.
    const items = trip.items.filter(item => item.category === key);
    if (!items.length) continue;
    const section = el("section", "category");
    section.hidden = !visible.some(item => item.category === key);
    const heading = el("div", "category-heading");
    const title = el("h4");
    title.id = `category-${key}`;
    section.setAttribute("aria-labelledby", title.id);
    const allCategoryItems = trip.items.filter(item => item.category === key);
    const done = allCategoryItems.filter(item => item.packed).length;
    const collapsed = collapsedCategories.get(trip.id)?.has(key) ?? false;
    section.classList.toggle("complete", done === allCategoryItems.length);
    const toggle = el("button", "category-toggle");
    toggle.type = "button";
    toggle.id = `toggle-${key}`;
    toggle.dataset.category = key;
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-controls", `items-${key}`);
    toggle.setAttribute("aria-label", `${collapsed ? "Vis" : "Skjul"} ${category.name}`);
    toggle.setAttribute("aria-description", `${done} av ${allCategoryItems.length} pakket`);
    const categoryCount = el("span", "category-count", `${done}/${allCategoryItems.length}`);
    categoryCount.setAttribute("aria-label", `${done} av ${allCategoryItems.length} pakket`);
    toggle.append(iconElement(category.icon, "category-icon category-symbol"));
    if (done === allCategoryItems.length) toggle.append(iconElement("check-circle", "category-icon category-done"));
    toggle.append(el("span", "", category.name), categoryCount, iconElement("chevron-down", "category-chevron"));
    title.append(toggle);
    heading.append(title);
    const list = el("ul", "item-list");
    list.id = `items-${key}`;
    list.hidden = collapsed;
    for (const item of items) {
      const row = el("li", `packing-item${item.packed ? " packed" : ""}`);
      row.hidden = filter !== "all" && (filter === "packed" ? !item.packed : item.packed);
      const label = el("label", "item-label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `check-${item.id}`;
      checkbox.checked = item.packed;
      checkbox.dataset.itemId = item.id;
      label.append(checkbox, el("span", "item-name", item.name));
      if (item.quantity > 1) {
        label.append(el("span", "item-quantity print-quantity", `${item.quantity} stk.`));
      }
      const quantity = el("button", `quantity-button${item.quantityEdited ? " is-custom" : ""}`);
      quantity.type = "button";
      quantity.id = `quantity-${item.id}`;
      quantity.dataset.quantityId = item.id;
      quantity.setAttribute("aria-label", `Endre antall for ${item.name}`);
      quantity.setAttribute("aria-description", `${item.quantity} stk.${item.quantityEdited ? " Ditt valgte antall." : ""}`);
      quantity.title = item.quantityEdited ? "Ditt antall – trykk for å endre" : "Endre antall";
      quantity.append(el("span", "item-quantity", `${item.quantity} stk.`));
      const remove = el("button", "remove-item");
      remove.type = "button";
      remove.dataset.removeId = item.id;
      remove.setAttribute("aria-label", `Fjern ${item.name}`);
      remove.title = `Fjern ${item.name}`;
      remove.append(iconElement("x"));
      row.append(label, quantity, remove);
      list.append(row);
    }
    section.append(heading, list);
    grid.append(section);
  }
  // The completion card already explains an empty Remaining filter.
  $("empty-state").hidden = visible.length > 0 || (filter === "remaining" && trip.items.length > 0);
  if (!visible.length) {
    if (!trip.items.length) {
      $("empty-title").textContent = "Plass til det du trenger.";
      $("empty-description").textContent = "Legg til dine egne ting nedenfor, eller lag en ny liste.";
    } else if (filter === "packed") {
      $("empty-title").textContent = "Kofferten venter.";
      $("empty-description").textContent = "Kryss av en ting på listen, så dukker den opp her.";
    } else {
      $("empty-title").textContent = "Du er pakkeklar!";
      $("empty-description").textContent = "Alt på listen er pakket. Nå er det bare å glede seg til turen.";
    }
  }
  document.querySelectorAll("[data-filter]").forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active);
  });
  updateProgress();
  renderPreparation();
}

function renderPreparation() {
  const list = $("preparation-list");
  list.replaceChildren();
  for (const task of trip.preparation) {
    const row = el("li", `preparation-item${task.done ? " done" : ""}`);
    const label = el("label", "item-label");
    const checkbox = el("input");
    checkbox.type = "checkbox";
    checkbox.id = `prepare-${task.id}`;
    checkbox.dataset.preparationId = task.id;
    checkbox.checked = task.done;
    label.append(checkbox, el("span", "item-name", task.name));
    row.append(label);
    list.append(row);
  }
  const result = preparationProgress(trip);
  $("preparation-count").textContent = `${result.done} av ${result.total} gjort`;
  document.querySelector(".preparation").classList.toggle("complete", result.done === result.total);
  renderCompletion();
}

function renderCompletion() {
  const packed = progress(trip);
  const preparation = preparationProgress(trip);
  const remaining = preparation.total - preparation.done;
  $("completion-panel").hidden = packed.total === 0 || packed.remaining !== 0;
  $("completion-title").textContent = remaining ? "Alt er pakket." : "Klar for avreise.";
  $("completion-description").textContent = remaining
    ? `Bagasjen er klar. Du har ${remaining} ${remaining === 1 ? "liten forberedelse" : "små forberedelser"} igjen før avreise.`
    : "Bagasjen er pakket, og forberedelsene er gjort. Nå kan du glede deg til turen.";
  $("finish-preparation-button").hidden = remaining === 0;
}

function currentDraft() {
  return {
    type: new FormData($("trip-form")).get("trip-type"),
    days: $("days").value,
    name: $("trip-name").value,
    departureDate: $("departure-date").value,
    imageId: draftImageId
  };
}

function hasUnsavedPlan() {
  if (!editingPlan) return false;
  const baseline = creatingTrip
    ? { type: "city", days: 3, name: "", departureDate: "", imageId: null }
    : trip;
  return !sameTripDetails(currentDraft(), baseline);
}

function updatePlanStatus() {
  const dirty = hasUnsavedPlan();
  $("plan-save-state").classList.toggle("is-dirty", dirty);
  $("plan-save-state").textContent = dirty ? "Ulagrede endringer" : creatingTrip ? "Ny tur – ikke opprettet ennå" : "Ingen ulagrede endringer";
  $("cancel-new-trip").textContent = dirty ? "Forkast endringene" : creatingTrip ? "Avbryt ny tur" : "Lukk redigering";
  $("cancel-new-trip").hidden = !editingPlan || (!workspace.trips.length && !dirty);
  const draft = currentDraft();
  const cover = tripImage(draft.type, draft.imageId);
  $("draft-cover-image").src = cover.src;
  $("draft-cover-image").style.objectPosition = cover.position;
  $("draft-cover-name").textContent = draft.imageId ? cover.name : `${cover.name} · automatisk`;
}

function setPlanEditing(value) {
  editingPlan = value;
  $("trip-form").hidden = !value;
  $("plan-summary").hidden = value;
  $("cancel-new-trip").hidden = !value;
  updatePlanStatus();
  requestAnimationFrame(updateNavigation);
}

function syncTripDetails() {
  if (trip.id === "unsaved") { startNewTrip(false); return; }
  const info = TRIP_TYPES[trip.type];
  creatingTrip = false;
  draftImageId = trip.imageId ?? null;
  $("list-title").textContent = trip.name;
  $("list-eyebrow").textContent = "DIN PAKKELISTE";
  const cover = tripImage(trip.type, trip.imageId);
  $("list-cover").src = cover.src;
  $("list-cover").style.objectPosition = cover.position;
  const summary = $("trip-summary");
  summary.replaceChildren(iconElement("calendar"), el("span", "", `${formatDeparture(trip.departureDate)} · ${trip.days} ${trip.days === 1 ? "dag" : "dager"}`),
    el("span", "summary-dot", "·"), el("span", "", info.name));
  $("trip-name").value = trip.name;
  $("trip-name").setCustomValidity("");
  $("departure-date").value = trip.departureDate;
  document.querySelector(`input[name="trip-type"][value="${trip.type}"]`).checked = true;
  $("days").value = trip.days;
  $("packing-tip").textContent = tips[trip.type];
  $("planner-title").textContent = "Planen for turen";
  $("planner-subtitle").textContent = "Små detaljer. Bedre oversikt.";
  $("generate-label").textContent = "Lagre reiseplan";
  $("plan-summary-name").textContent = trip.name;
  $("plan-facts").replaceChildren();
  for (const [label, value] of [["Avreise", formatDeparture(trip.departureDate)], ["Varighet", `${trip.days} ${trip.days === 1 ? "dag" : "dager"}`], ["Turtype", info.name]]) {
    const row = el("div");
    row.append(el("dt", "", label), el("dd", "", value));
    $("plan-facts").append(row);
  }
  setPlanEditing(false);
  updateStepper();
}

function updateStepper() {
  const days = Number($("days").value);
  $("days-minus").disabled = validDays(days) && days <= 1;
  $("days-plus").disabled = validDays(days) && days >= MAX_DAYS;
}

function focusList() {
  if (window.matchMedia("(max-width: 760px)").matches) {
    document.querySelector(".checklist").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  }
}

function replaceTrip(nextTrip, message = "Turen er oppdatert. Gjør listen til din!") {
  hideToast();
  trip = nextTrip;
  filter = "all";
  $("custom-item").value = "";
  syncTripDetails();
  renderList();
  persist();
  showToast(message);
  announce(`${trip.name}, ${trip.items.length} ting på pakkelisten.`);
  focusList();
}

function confirmAction({ title, description, accept, cancel = "Behold listen", action }) {
  $("type-change-preview").replaceChildren();
  $("type-change-preview").hidden = true;
  $("confirm-title").textContent = title;
  $("confirm-description").textContent = description;
  $("confirm-accept").textContent = accept;
  $("confirm-cancel").textContent = cancel;
  pendingConfirm = action;
  $("confirm-dialog").showModal();
  $("confirm-cancel").focus();
}

function cancelConfirmation() {
  pendingConfirm = null;
  $("confirm-dialog").close();
}

function previewTypeChange(before, after) {
  const changes = tripChangeSummary(before, after);
  const preview = $("type-change-preview");
  for (const [label, items] of [["Legges til", changes.added], ["Tas ut", changes.removed]]) {
    const column = el("div");
    column.append(el("h3", "", label));
    if (!items.length) column.append(el("p", "", "Ingen punkter"));
    else {
      const list = el("ul");
      for (const item of items) list.append(el("li", "", item.name));
      column.append(list);
    }
    preview.append(column);
  }
  preview.hidden = false;
  return changes;
}

function savePlan(afterSave = null) {
  const draft = currentDraft();
  const name = normaliseName(draft.name);
  $("trip-name").setCustomValidity(name ? "" : "Gi turen et navn.");
  if (!$("trip-form").reportValidity() || !validDays(draft.days) ||
      (draft.departureDate && !isCalendarDate(draft.departureDate))) return;
  const changed = !sameTripDetails(draft, trip);
  const details = { name, departureDate: draft.departureDate, imageId: draft.imageId, isExample: changed ? false : trip.isExample };
  const finish = (nextTrip, message) => {
    replaceTrip(nextTrip, message);
    afterSave?.();
  };
  if (creatingTrip) {
    if (workspace.trips.length >= MAX_TRIPS) {
      showToast("Du har plass til 12 turer. Fjern en gammel tur for å lage en ny.");
      return;
    }
    finish({ ...createTrip(draft.type, draft.days), ...details, isExample: false, id: `trip-${crypto.randomUUID()}` }, "Ny tur lagt til. Nå har du noe å glede deg til!");
    return;
  }
  if (draft.type === trip.type) {
    const updated = updateTripDays(trip, draft.days);
    const reopened = progress(trip).packed - progress(updated).packed;
    const message = reopened
      ? `Reiseplanen er lagret. ${reopened} ${reopened === 1 ? "punkt trenger" : "punkter trenger"} flere ting og er satt til gjenstående.`
      : "Reiseplanen er lagret. Tilpasningene dine er beholdt.";
    finish({ ...updated, ...details }, message);
    return;
  }
  let updated;
  try { updated = { ...changeTripType(trip, draft.type, draft.days), ...details }; }
  catch (error) { showToast(error.message); return; }
  const changes = tripChangeSummary(trip, updated);
  const own = changes.kept.filter(item => item.custom).length;
  const shared = changes.kept.length - own;
  confirmAction({
    title: `Bytte til ${TRIP_TYPES[draft.type].short.toLocaleLowerCase("nb")}?`,
    description: `Vi beholder ${own} egne tillegg og ${shared} felles punkter. Felles forberedelser beholdes også. ` +
      (changes.reopened.length ? `${changes.reopened.length} pakket punkt trenger flere ting og blir gjenstående. ` : "") +
      "Forslagene nedenfor tilpasses den nye turtypen.",
    accept: "Bytt turtype",
    cancel: "Fortsett å redigere",
    action: () => finish(updated, "Turtypen er endret. Egne tillegg og felles punkter er beholdt.")
  });
  previewTypeChange(trip, updated);
}

$("trip-form").addEventListener("submit", event => {
  event.preventDefault();
  savePlan();
});
$("trip-form").addEventListener("input", () => {
  $("trip-name").setCustomValidity("");
  updatePlanStatus();
});
$("trip-form").addEventListener("change", updatePlanStatus);
$("edit-trip-button").addEventListener("click", () => {
  setPlanEditing(true);
  $("trip-name").focus();
});

function withSavedPlan(action) {
  if (!hasUnsavedPlan()) {
    action();
    return;
  }
  pendingNavigation = action;
  $("unsaved-dialog").showModal();
  $("unsaved-stay").focus();
}

for (const id of ["unsaved-close", "unsaved-stay"]) {
  $(id).addEventListener("click", () => $("unsaved-dialog").close());
}
$("unsaved-dialog").addEventListener("close", () => { pendingNavigation = null; });
$("unsaved-discard").addEventListener("click", () => {
  const action = pendingNavigation;
  pendingNavigation = null;
  $("unsaved-dialog").close();
  syncTripDetails();
  action?.();
});
$("unsaved-save").addEventListener("click", () => {
  const action = pendingNavigation;
  pendingNavigation = null;
  $("unsaved-dialog").close();
  savePlan(action);
});
window.addEventListener("beforeunload", event => {
  if (!hasUnsavedPlan()) return;
  event.preventDefault();
  event.returnValue = "";
});

function selectSavedTrip(selectedId, target = null) {
  withSavedPlan(() => {
    // Re-read after a possible save; the workspace may now contain a newer object.
    const selected = workspace.trips.find(saved => saved.id === selectedId);
    if (!selected) return;
    hideToast();
    trip = selected;
    filter = "all";
    $("custom-item").value = "";
    syncTripDetails();
    renderList();
    persist();
    if (target) $(target).scrollIntoView({ behavior: "instant", block: "start" });
    announce(`Viser pakkelisten for ${trip.name}.`);
  });
}
$("trip-cards").addEventListener("click", event => {
  const card = event.target.closest("[data-trip-id]");
  if (!card) return;
  const selectedId = card.dataset.tripId;
  if (selectedId === trip.id && !creatingTrip) return;
  selectSavedTrip(selectedId);
});

function startNewTrip(focus = true) {
  if (workspace.trips.length >= MAX_TRIPS) {
    showToast("Du har plass til 12 turer. Fjern en gammel tur for å lage en ny.");
    return;
  }
  creatingTrip = true;
  draftImageId = null;
  $("trip-name").value = "";
  $("trip-name").setCustomValidity("");
  $("departure-date").value = "";
  $("days").value = "3";
  document.querySelector('input[name="trip-type"][value="city"]').checked = true;
  $("planner-title").textContent = workspace.trips.length ? "Planlegg en ny tur" : "Din første tur";
  $("planner-subtitle").textContent = workspace.trips.length ? "De andre turene dine blir beholdt." : "Et navn, en plan og noe å glede seg til.";
  $("generate-label").textContent = "Opprett turen";
  $("packing-tip").textContent = tips.city;
  setPlanEditing(true);
  updateStepper();
  if (focus) $("trip-name").focus();
}
$("new-trip-button").addEventListener("click", () => withSavedPlan(startNewTrip));

$("cancel-new-trip").addEventListener("click", () => {
  syncTripDetails();
  (workspace.trips.length ? $("edit-trip-button") : $("trip-name")).focus({ preventScroll: true });
});

$("copy-trip-button").addEventListener("click", () => withSavedPlan(() => {
  if (workspace.trips.length >= MAX_TRIPS) {
    showToast("Du har plass til 12 turer. Fjern en gammel tur for å lage en kopi.");
    return;
  }
  $("copy-name").value = copyName(trip.name);
  $("copy-name").setCustomValidity("");
  $("copy-date").value = "";
  $("copy-dialog").showModal();
  $("copy-name").focus();
  $("copy-name").select();
}));
$("copy-name").addEventListener("input", () => $("copy-name").setCustomValidity(""));
$("copy-form").addEventListener("submit", event => {
  event.preventDefault();
  const name = normaliseName($("copy-name").value);
  if (!name) {
    $("copy-name").setCustomValidity("Gi kopien et navn.");
    $("copy-name").reportValidity();
    return;
  }
  const departureDate = $("copy-date").value;
  if (name.length > 80 || (departureDate && !isCalendarDate(departureDate))) return;
  if (workspace.trips.length >= MAX_TRIPS) {
    $("copy-dialog").close();
    showToast("Du har plass til 12 turer. Fjern en gammel tur for å lage en kopi.");
    return;
  }
  const copy = copyTrip(trip, { id: `trip-${crypto.randomUUID()}`, name, departureDate });
  $("copy-dialog").close();
  replaceTrip(copy, "Turen er kopiert. En ny liste, klar til neste reise!");
});
for (const id of ["copy-cancel", "copy-close"]) {
  $(id).addEventListener("click", () => $("copy-dialog").close());
}

function updateQuantityStepper() {
  const value = $("quantity-value").value;
  $("quantity-minus").disabled = validQuantity(value) && Number(value) <= 1;
  $("quantity-plus").disabled = validQuantity(value) && Number(value) >= MAX_QUANTITY;
}

function openQuantity(id) {
  const item = trip.items.find(candidate => candidate.id === id);
  if (!item) return;
  quantityItemId = id;
  $("quantity-item-name").textContent = item.name;
  $("quantity-value").value = item.quantity;
  $("quantity-value").setCustomValidity("");
  const suggestion = suggestedQuantity(trip, item);
  $("quantity-auto").hidden = suggestion === null;
  $("quantity-auto").textContent = suggestion === null ? "" : `Bruk forslag (${suggestion} stk.)`;
  updateQuantityStepper();
  $("quantity-dialog").showModal();
  $("quantity-value").focus();
  $("quantity-value").select();
}

function saveQuantity(useSuggestion = false) {
  const id = quantityItemId;
  const result = setItemQuantity(trip, id, $("quantity-value").value, { useSuggestion });
  if (result.error) {
    $("quantity-value").setCustomValidity(result.error);
    $("quantity-value").reportValidity();
    return;
  }
  hideToast();
  trip = result.trip;
  $("quantity-dialog").close();
  renderList();
  persist();
  const button = $(`quantity-${id}`);
  const focusTarget = button && !button.closest("li").hidden ? button : document.querySelector(`[data-filter="${filter}"]`);
  focusTarget?.focus({ preventScroll: true });
  const message = result.needsRepacking
    ? "Antallet er økt. Punktet er satt til gjenstående, så du husker å pakke resten."
    : useSuggestion ? "Forslaget er valgt. Antallet tilpasses reisedagene igjen." : "Antallet er lagret.";
  showToast(message);
  announce(message);
}

$("quantity-form").addEventListener("submit", event => {
  event.preventDefault();
  saveQuantity();
});
$("quantity-auto").addEventListener("click", () => saveQuantity(true));
$("quantity-value").addEventListener("input", () => {
  $("quantity-value").setCustomValidity("");
  updateQuantityStepper();
});
for (const [id, change] of [["quantity-minus", -1], ["quantity-plus", 1]]) {
  $(id).addEventListener("click", () => {
    const input = $("quantity-value");
    const current = validQuantity(input.value) ? Number(input.value) : 1;
    input.value = Math.max(1, Math.min(MAX_QUANTITY, current + change));
    input.setCustomValidity("");
    updateQuantityStepper();
  });
}
for (const id of ["quantity-cancel", "quantity-close"]) {
  $(id).addEventListener("click", () => $("quantity-dialog").close());
}
$("quantity-dialog").addEventListener("close", () => { quantityItemId = null; });

for (const image of TRIP_IMAGES) {
  const option = el("label", "image-option");
  const radio = el("input");
  radio.type = "radio";
  radio.name = "trip-image";
  radio.value = image.id;
  const thumbnail = el("img");
  thumbnail.src = image.src;
  thumbnail.alt = "";
  thumbnail.loading = "lazy";
  thumbnail.width = 160;
  thumbnail.height = 100;
  thumbnail.style.objectPosition = image.position;
  option.append(radio, thumbnail, el("span", "", image.name));
  $("image-options").append(option);
}
$("choose-cover-button").addEventListener("click", () => {
  document.querySelector(`input[name="trip-image"][value="${draftImageId ?? "auto"}"]`).checked = true;
  $("image-dialog").showModal();
  document.querySelector('input[name="trip-image"]:checked').focus({ preventScroll: true });
});
$("image-form").addEventListener("submit", event => {
  event.preventDefault();
  const selected = new FormData(event.currentTarget).get("trip-image");
  draftImageId = selected === "auto" ? null : selected;
  $("image-dialog").close();
  updatePlanStatus();
  $("choose-cover-button").focus({ preventScroll: true });
});
for (const id of ["image-close", "image-cancel"]) {
  $(id).addEventListener("click", () => $("image-dialog").close());
}

function setPackingMode(enabled, { scroll = true } = {}) {
  packingMode = enabled && mobileScreen.matches;
  if (packingMode && editingPlan) syncTripDetails();
  document.body.classList.toggle("packing-mode", packingMode);
  $("packing-mode-bar").hidden = !packingMode;
  if (scroll) {
    if (packingMode) {
      window.scrollTo({ top: 0, behavior: "instant" });
      $("list-title").focus({ preventScroll: true });
    } else {
      $("turer").scrollIntoView({ behavior: "instant", block: "start" });
      document.querySelector(`[data-trip-id="${trip.id}"]`)?.focus({ preventScroll: true });
    }
  }
  requestAnimationFrame(updateNavigation);
}
$("packing-mode-button").addEventListener("click", () => withSavedPlan(() => setPackingMode(true)));
$("packing-mode-exit").addEventListener("click", () => setPackingMode(false));
mobileScreen.addEventListener("change", () => { if (!mobileScreen.matches && packingMode) setPackingMode(false, { scroll: false }); });

$("finish-preparation-button").addEventListener("click", () => {
  const target = document.querySelector('.preparation input:not(:checked)');
  document.querySelector(".preparation").scrollIntoView({ behavior: "instant", block: "start" });
  target?.focus({ preventScroll: true });
});

function updateNavigation() {
  document.querySelector(".site-header").classList.toggle("is-scrolled", window.scrollY > 8);
  const threshold = Math.min(window.innerHeight * .35, 200);
  const section = ["turer", "reiseglede", "planlegg"].filter(id => !$(id).hidden && $(id).getBoundingClientRect().top <= threshold).at(-1) || "turer";
  for (const link of document.querySelectorAll("[data-nav]")) {
    const active = link.dataset.nav === section;
    link.classList.toggle("nav-active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}
let navigationFrame = null;
const queueNavigationUpdate = () => {
  if (navigationFrame !== null) return;
  navigationFrame = requestAnimationFrame(() => {
    navigationFrame = null;
    updateNavigation();
  });
};
window.addEventListener("scroll", queueNavigationUpdate, { passive: true });
window.addEventListener("resize", queueNavigationUpdate);
window.addEventListener("hashchange", queueNavigationUpdate);
for (const link of document.querySelectorAll('a.brand[href="./"]')) {
  link.addEventListener("click", event => {
    event.preventDefault();
    withSavedPlan(() => {
      syncTripDetails();
      setPackingMode(false, { scroll: false });
      window.scrollTo({ top: 0, behavior: "instant" });
      history.replaceState(null, "", location.pathname);
      updateNavigation();
    });
  });
}

$("delete-trip-button").addEventListener("click", () => withSavedPlan(() => {
  if (workspace.trips.length < 2) return;
  const id = trip.id;
  confirmAction({
    title: "Fjerne denne turen?",
    description: `«${trip.name}», pakkelisten, bingoen, spillelistekoblingen og minnene i glasset blir fjernet. Stempler i reisepasset og de andre turene beholdes.`,
    accept: "Fjern turen",
    cancel: "Behold turen",
    action: () => {
      dashboard.removeTrip(id);
      workspace.trips = workspace.trips.filter(saved => saved.id !== id);
      replaceTrip(workspace.trips[0], "Turen er fjernet.");
    }
  });
}));

for (const [id, change] of [["days-minus", -1], ["days-plus", 1]]) {
  $(id).addEventListener("click", () => {
    const current = validDays($("days").value) ? Number($("days").value) : 3;
    $("days").value = Math.max(1, Math.min(MAX_DAYS, current + change));
    updateStepper();
    updatePlanStatus();
  });
}
$("days").addEventListener("input", updateStepper);
document.querySelectorAll('input[name="trip-type"]').forEach(input => {
  input.addEventListener("change", () => { $("packing-tip").textContent = tips[input.value]; });
});

$("category-grid").addEventListener("change", event => {
  const id = event.target.dataset.itemId;
  if (!id) return;
  const currentBoxes = [...document.querySelectorAll("[data-item-id]")].filter(box => !box.closest("li").hidden && !box.closest("ul").hidden);
  const index = currentBoxes.indexOf(event.target);
  const item = trip.items.find(candidate => candidate.id === id);
  if (!item) return;
  item.packed = event.target.checked;
  renderList();
  persist();
  const visibleBoxes = [...document.querySelectorAll("[data-item-id]")].filter(box => !box.closest("li").hidden && !box.closest("ul").hidden);
  const focusTarget = visibleBoxes.find(box => box.dataset.itemId === id) || visibleBoxes[index] ||
    visibleBoxes[index - 1] || document.querySelector(`[data-filter="${filter}"]`);
  focusTarget?.focus({ preventScroll: true });
  const result = progress(trip);
  announce(result.remaining ? `${result.packed} av ${result.total} pakket.` : "Alt er pakket. God tur!");
});

$("preparation-list").addEventListener("change", event => {
  const task = trip.preparation.find(candidate => candidate.id === event.target.dataset.preparationId);
  if (!task) return;
  task.done = event.target.checked;
  renderPreparation();
  persist();
  $(`prepare-${task.id}`).focus({ preventScroll: true });
  const result = preparationProgress(trip);
  announce(`Før avreise: ${result.done} av ${result.total} gjort.`);
});

$("category-grid").addEventListener("click", event => {
  const categoryButton = event.target.closest("[data-category]");
  if (categoryButton) {
    const key = categoryButton.dataset.category;
    const collapsed = collapsedCategories.get(trip.id) || new Set();
    if (collapsed.has(key)) collapsed.delete(key);
    else collapsed.add(key);
    collapsedCategories.set(trip.id, collapsed);
    renderList();
    $(`toggle-${key}`).focus({ preventScroll: true });
    return;
  }
  const quantityButton = event.target.closest("[data-quantity-id]");
  if (quantityButton) {
    openQuantity(quantityButton.dataset.quantityId);
    return;
  }
  const removeButton = event.target.closest("[data-remove-id]");
  if (!removeButton) return;
  const index = trip.items.findIndex(item => item.id === removeButton.dataset.removeId);
  if (index < 0) return;
  const [removed] = trip.items.splice(index, 1);
  renderList();
  persist();
  $("custom-item").focus({ preventScroll: true });
  showToast(`${removed.name} ble fjernet.`, () => {
    trip.items.splice(Math.min(index, trip.items.length), 0, removed);
    renderList();
    persist();
    announce(`${removed.name} er tilbake på listen.`);
  });
});

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    renderList();
  });
});

$("add-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = $("custom-item");
  const id = `custom-${crypto.randomUUID()}`;
  const result = addItem(trip, input.value, id);
  if (result.error) {
    showToast(result.error);
    input.focus();
    return;
  }
  trip = result.trip;
  filter = "all";
  input.value = "";
  renderList();
  persist();
  showToast("Lagt til på pakkelisten.");
  input.focus({ preventScroll: true });
});

$("reset-button").addEventListener("click", () => {
  confirmAction({
    title: "Pakke en gang til?",
    description: "Vi fjerner avkryssingene i pakkelisten. Alle tingene, inkludert dine egne tillegg, blir beholdt. «Før avreise» beholdes som den er.",
    accept: "Nullstill avkryssing",
    cancel: "Avbryt",
    action: () => {
      trip.items.forEach(item => { item.packed = false; });
      filter = "all";
      renderList();
      persist();
      showToast("Avkryssingene er nullstilt.");
    }
  });
});

$("confirm-cancel").addEventListener("click", cancelConfirmation);
$("confirm-close").addEventListener("click", cancelConfirmation);
$("confirm-dialog").addEventListener("cancel", () => { pendingConfirm = null; });
$("confirm-accept").addEventListener("click", () => {
  const action = pendingConfirm;
  pendingConfirm = null;
  $("confirm-dialog").close();
  action?.();
});

function showInfo(mode) {
  $("info-dialog").setAttribute("aria-labelledby", "info-title");
  if (mode === "privacy") {
    $("info-title").textContent = "Din liste blir hos deg.";
    $("info-content").innerHTML = "<p>Turene, pakkelistene, drømmene, bingoen og minnene lagres i denne nettleseren på denne enheten. De sendes ikke til en server, og du trenger ingen konto.</p><p>Du kan lukke siden og fortsette senere. Listene følger ikke med til andre enheter eller nettlesere. Hvis du sletter nettleserdata eller bruker privat nettlesing, kan de forsvinne.</p><p>Hver tur har sin egen pakkeliste. Ved første besøk får du tre fiktive reiseplaner og avkryssinger som viser hvordan appen fungerer. I innstillingene kan du hente tilbake eksempelinnholdet eller starte helt tomt. Siste bytte kan angres; én lokal sikkerhetskopi beholdes til neste bytte. Nedtellingen beregnes med norsk kalenderdato.</p><p>Spillelistekortet lagrer en lenke du velger. Musikk åpnes i Spotify. Drømmer og minner deles ikke med Spotify.</p>";
  } else {
    $("info-title").textContent = "Fra reiseplan til reiseklar.";
    $("info-content").innerHTML = "<ol><li><strong>Åpne en tur eller velg «Ny tur».</strong> Gi turen navn, dato, turtype og varighet. Velg et bilde om du vil. Reiseplanen vises kompakt etter lagring; bruk «Rediger reiseplan» for å gjøre endringer.</li><li><strong>Gjør listen til din.</strong> Legg til egne ting, fjern det du ikke trenger, eller trykk på antallet ved en ting for å endre det.</li><li><strong>Kryss av mens du pakker.</strong> Huk også av de små forberedelsene i «Før avreise». Alt lagres automatisk i denne nettleseren.</li></ol><p>Bruk «Kopier tur» for å gjenbruke listen og antallene med nye avkryssinger. «Lagre som PDF» åpner utskriftsvinduet. Papirlisten får tomme avkryssingsbokser, og hele listen blir med uansett filter. Fremdriften i appen beholdes.</p><p>Egne tillegg, fjernede ting og manuelt valgte antall beholdes når du endrer varigheten. Automatiske antall tilpasses reisedagene. Når et pakket punkt trenger flere ting, blir det gjenstående igjen. «Bruk forslag» lar antallet følge varigheten igjen.</p><p>Ved ny turtype får du se hvilke forslag som endres. Egne tillegg og felles ting beholdes, sammen med felles forberedelser. Du får velge om ulagrede turdetaljer skal lagres før du bytter tur.</p><p>På mobil gir «Start pakkemodus» en rolig visning med listen og fast fremdrift. Trykk på en kategori for å folde den sammen. Papirlisten inneholder fortsatt alle punktene. «Klar for avreise» vises når både pakkingen og forberedelsene er ferdige.</p><p>Under «Reiseglede» finner du aktivitetshjul, bingo og en Spotify-lenke for den valgte turen. I «Drømmer» kan en idé uten dato bli en tur med egen pakkeliste. «Minner» har reisepass for gjennomførte turer og et minneglass der du kan trykke på lappene. Tidligere turer kan også registreres direkte i passet.</p><p>Listene er forslag; tilpass dem til vær, reisemål og egne behov.</p>";
  }
  $("info-dialog").showModal();
}

function openSettings() {
  $("settings-summary").textContent = `${workspace.trips.length} ${workspace.trips.length === 1 ? "tur" : "turer"} lagret`;
  try { $("settings-undo").hidden = !readResetBackup(localStorage); }
  catch { $("settings-undo").hidden = true; }
  $("settings-error").hidden = true;
  $("settings-dialog").showModal();
}
function applyStartChoice(action) {
  try {
    action();
    editingPlan = false;
    history.replaceState(null, "", `${location.pathname}#turer`);
    location.reload();
  } catch (error) {
    openSettings();
    $("settings-error").textContent = error.message || "Byttet kunne ikke lagres. Prøv igjen.";
    $("settings-error").hidden = false;
  }
}
$("settings-button").addEventListener("click", openSettings);
$("settings-close").addEventListener("click", () => $("settings-dialog").close());
for (const mode of ["examples", "empty"]) {
  $(`settings-${mode}`).addEventListener("click", () => {
    $("settings-dialog").close();
    withSavedPlan(() => confirmAction({
      title: mode === "examples" ? "Hente tilbake eksempelinnholdet?" : "Begynne med blanke ark?",
      description: mode === "examples"
        ? "Dette erstatter alle turer, pakkelister, drømmer, stempler, minner og spillelistekoblinger med de opprinnelige startverdiene. Dagens innhold kan hentes tilbake med «Angre siste bytte» i innstillingene."
        : "Dette tømmer turer, pakkelister, drømmer, stempler, minner og spillelistekoblinger. Du kan lage din første tur etterpå. Dagens innhold kan hentes tilbake med «Angre siste bytte» i innstillingene.",
      accept: mode === "examples" ? "Bruk eksempelinnhold" : "Start helt tomt",
      cancel: "Behold innholdet",
      action: () => applyStartChoice(() => resetLocalData(localStorage, mode))
    }));
  });
}
$("settings-undo").addEventListener("click", () => {
  $("settings-dialog").close();
  withSavedPlan(() => confirmAction({
    title: "Gå tilbake til forrige innhold?",
    description: "Turene og reisegleden fra før siste bytte kommer tilbake. Det du har lagt til eller endret etter byttet, blir erstattet.",
    accept: "Hent tilbake innholdet", cancel: "Behold dagens innhold",
    action: () => applyStartChoice(() => undoLocalReset(localStorage))
  }));
});
$("how-button").addEventListener("click", () => showInfo("how"));
$("privacy-button").addEventListener("click", () => showInfo("privacy"));
document.querySelectorAll(".dialog-close").forEach(button => button.addEventListener("click", () => $("info-dialog").close()));
for (const dialog of document.querySelectorAll("dialog")) {
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      dialog.close();
      if (dialog.id === "confirm-dialog") pendingConfirm = null;
    }
  });
}
$("toast-undo").addEventListener("click", () => {
  const action = undoAction;
  hideToast();
  action?.();
});
$("toast-close").addEventListener("click", hideToast);
$("toast").addEventListener("mouseenter", () => clearTimeout(toastTimeout));
$("toast").addEventListener("focusin", () => clearTimeout(toastTimeout));
$("toast").addEventListener("mouseleave", () => { toastTimeout = setTimeout(hideToast, 6000); });
window.addEventListener("beforeprint", () => {
  if (printTitle !== null) return;
  printTitle = document.title;
  document.title = `Pakkeklar - ${trip.name}`;
});
window.addEventListener("afterprint", () => {
  if (printTitle !== null) {
    document.title = printTitle;
    printTitle = null;
  }
});
$("print-button").addEventListener("click", () => window.print());

dashboard = initDashboard({
  getWorkspace: () => workspace,
  getTrip: () => trip,
  onSelectTrip: selectSavedTrip,
  onOverviewChange: renderTripCards,
  onConvertDream: dream => withSavedPlan(() => {
    if (workspace.trips.length >= MAX_TRIPS) {
      showToast("Du har plass til 12 turer. Fjern en gammel tur før du planlegger denne drømmen.");
      return;
    }
    const planned = tripFromDream(dream, `trip-${crypto.randomUUID()}`);
    replaceTrip(planned, "Drømmen har blitt en tur! Velg avreisedato og varighet når du vet mer.");
    dashboard.linkDream(dream.id, planned.id);
    setPlanEditing(true);
    $("planlegg").scrollIntoView({ behavior: "instant", block: "start" });
    $("departure-date").focus({ preventScroll: true });
  }),
  icon, toast: showToast, announce
});
syncTripDetails();
renderList();
persist();
// Keep countdowns correct when a page stays open across midnight or is reopened.
let lastCalendarDay = osloToday();
function refreshCountdowns() {
  const today = osloToday();
  if (today !== lastCalendarDay) {
    lastCalendarDay = today;
    renderTripCards();
  }
}
setInterval(refreshCountdowns, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshCountdowns(); });
