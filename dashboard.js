import { TRIP_TYPES, countdown, formatDeparture, osloToday, isCalendarDate, progress, preparationProgress } from "./packing.js";
import { TRIP_IMAGES, tripImage } from "./trip-images.js";
import { ADVENTURE_KEY, LIMITS, BINGO, ACTIVITIES, emptyAdventure, restoreAdventure, tripAdventure, setTripAdventure, bingoProgress, pickActivity, tripOverview, canStamp, spotifyPlaylistUrl } from "./adventure-data.js";

const $ = id => document.getElementById(id);
const node = (tag, cls = "", text) => {
  const element = document.createElement(tag);
  element.className = cls;
  if (text !== undefined) element.textContent = text;
  return element;
};
const uid = prefix => `${prefix}-${crypto.randomUUID()}`;

export function initDashboard({ getWorkspace, getTrip, onSelectTrip, onOverviewChange, onConvertDream, icon, toast, announce }) {
  const symbol = (name, cls = "") => { const span = node("span", cls); span.innerHTML = icon(name); return span; };
  let state;
  let storageWarning = "";
  try {
    state = restoreAdventure(localStorage.getItem(ADVENTURE_KEY));
    if (!state) storageWarning = "Lagrede reiseglede-data kunne ikke leses. Pakkelistene dine er beholdt.";
  } catch { storageWarning = "Reiseglede kan ikke lagres akkurat nå. Behold siden åpen."; }
  state ||= emptyAdventure();
  let renderedTripId = null;
  let spinTimer = null;
  let wheelAngle = 0;
  let spinning = false;
  const dialog = $("adventure-dialog");
  const current = () => tripAdventure(state, getTrip().id);
  const overview = () => tripOverview(getWorkspace().trips, state.stamps);

  function save(next) {
    state = next;
    try { localStorage.setItem(ADVENTURE_KEY, JSON.stringify(state)); storageWarning = ""; }
    catch { storageWarning = "Endringene er bare i denne økten. Nettleseren kunne ikke lagre dem."; }
    renderStorage();
  }
  function saveCurrent(entry) { save(setTripAdventure(state, entry)); }
  function renderStorage() {
    $("adventure-save-warning").hidden = !storageWarning;
    $("adventure-save-warning").textContent = storageWarning;
  }
  function button(text, action, cls = "button button-secondary") {
    const b = node("button", cls, text); b.type = "button"; b.addEventListener("click", action); return b;
  }
  function openModal(title, content) {
    $("adventure-dialog-title").textContent = title;
    $("adventure-dialog-body").replaceChildren(content);
    if (!dialog.open) dialog.showModal();
  }
  $("adventure-close").addEventListener("click", () => dialog.close());

  function openForm(title, fields, submitLabel, onSubmit, extra = null) {
    const form = node("form", "adventure-form");
    const inputs = {};
    for (const field of fields) {
      const wrap = node("div", "form-field");
      const label = node("label", "", field.label);
      const input = node(field.options ? "select" : field.multiline ? "textarea" : "input");
      input.id = `adventure-${field.key}`;
      label.htmlFor = input.id;
      if (field.options) for (const [value, name] of field.options) { const opt = node("option", "", name); opt.value = value; input.append(opt); }
      else if (!field.multiline) input.type = field.type || "text";
      if (field.maxLength) input.maxLength = field.maxLength;
      if (field.max) input.max = field.max;
      if (field.type === "date") input.min = "2000-01-01";
      if (field.multiline) input.rows = 4;
      input.required = field.required ?? true;
      input.value = field.value || "";
      input.placeholder = field.placeholder || "";
      input.addEventListener("input", () => input.setCustomValidity(""));
      wrap.append(label, input);
      inputs[field.key] = input;
      form.append(wrap);
    }
    const actions = node("div", "dialog-actions");
    const submit = node("button", "button button-primary", submitLabel); submit.type = "submit";
    actions.append(button("Avbryt", () => dialog.close()), submit);
    form.append(actions);
    if (extra) form.append(extra);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const values = Object.fromEntries(Object.entries(inputs).map(([key, input]) => [key, input.value.trim()]));
      for (const [key, input] of Object.entries(inputs)) {
        if (input.required && !values[key]) { input.setCustomValidity("Fyll inn dette feltet."); input.reportValidity(); return; }
      }
      onSubmit(values, inputs);
    });
    openModal(title, form);
    Object.values(inputs)[0].focus();
    return inputs;
  }

  function renderTicket() {
    const trip = overview().featured;
    const root = $("next-ticket");
    root.replaceChildren();
    if (!trip) return;
    const ticket = node("article", `travel-ticket${trip.id === getTrip().id ? " selected" : ""}`);
    ticket.dataset.tripId = trip.id;
    ticket.setAttribute("aria-label", `Reisebillett for ${trip.name}`);
    const visual = node("div", "ticket-visual");
    const cover = node("img", "ticket-photo");
    const photo = tripImage(trip.type, trip.imageId);
    cover.src = photo.src; cover.style.objectPosition = photo.position; cover.alt = ""; cover.width = 220; cover.height = 180;
    const photoLabel = node("span", "ticket-photo-label", "pakkeklar.");
    visual.append(cover, photoLabel);
    const main = node("div", "ticket-main");
    const kicker = node("span", "eyebrow"); kicker.append(symbol("ticket"), document.createTextNode("DIN REISEBILLETT"));
    const heading = node("div", "ticket-heading");
    const badges = node("div", "ticket-badges");
    if (trip.id === getTrip().id) badges.append(node("span", "selected-badge", "Valgt"));
    heading.append(kicker, badges);
    const title = node("h3", "", trip.name);
    const facts = node("dl", "ticket-facts");
    for (const [key, value] of [["Avreise", formatDeparture(trip.departureDate)], ["Varighet", `${trip.days} ${trip.days === 1 ? "dag" : "dager"}`], ["Turtype", TRIP_TYPES[trip.type].short]]) {
      const pair = node("div"); pair.append(node("dt", "", key), node("dd", "", value)); facts.append(pair);
    }
    const packed = progress(trip);
    const prepared = preparationProgress(trip);
    const status = node("div", "ticket-status");
    const statusLine = node("div", "ticket-status-line");
    const preparationLabel = node("span", "ticket-preparation");
    preparationLabel.append(symbol("check-circle"), node("span", "", `${prepared.done} av ${prepared.total} forberedelser`));
    statusLine.append(node("span", "", `${packed.packed} av ${packed.total} pakket`), preparationLabel);
    const track = node("span", "trip-card-track");
    const fill = node("span"); fill.style.width = `${packed.percent}%`; track.append(fill);
    status.append(statusLine, track);
    const footer = node("div", "ticket-footer");
    // Decorative reference derived from the trip, not a booking or transport ticket.
    let reference = 0;
    for (const char of trip.id) reference = (reference * 31 + char.charCodeAt(0)) >>> 0;
    const serial = `PK-${reference.toString(36).toUpperCase().padStart(6, "0").slice(-6)}`;
    footer.append(node("span", "ticket-reference", serial), node("span", "", "NESTE STOPP: NOE Å GLEDE SEG TIL"));
    main.append(heading, title, facts, status, footer);
    const stub = node("div", "ticket-stub");
    const timer = countdown(trip.departureDate, trip.days);
    stub.append(node("span", "ticket-caption", timer.number !== null ? "AVREISE OM" : "DIN NESTE TUR"));
    if (timer.number !== null) stub.append(node("strong", "ticket-number", timer.number));
    else stub.append(symbol(timer.daysUntil === null ? "calendar" : "sun", "ticket-number"));
    const barcode = node("div", "ticket-barcode"); barcode.setAttribute("aria-hidden", "true");
    stub.append(node("span", "ticket-days", timer.number !== null ? (timer.number === 1 ? "dag" : "dager") : timer.label), barcode,
      button("Åpne pakkelisten ↗", () => onSelectTrip(trip.id, "planlegg"), "text-button"));
    ticket.append(visual, main, stub);
    root.append(ticket);
  }

  function selectTab(name, focus = false) {
    for (const tab of document.querySelectorAll(".adventure-tabs [role=tab]")) {
      const selected = tab.id === `tab-${name}`;
      tab.setAttribute("aria-selected", String(selected)); tab.tabIndex = selected ? 0 : -1;
      $(tab.getAttribute("aria-controls")).hidden = !selected;
    }
    if (focus) $(`tab-${name}`).focus({ preventScroll: true });
  }
  document.querySelectorAll(".adventure-tabs [role=tab]").forEach((tab, index, all) => {
    tab.addEventListener("click", () => selectTab(tab.id.slice(4)));
    tab.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % all.length;
      if (event.key === "ArrowLeft") next = (index + all.length - 1) % all.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = all.length - 1;
      if (next === undefined) return;
      event.preventDefault(); selectTab(all[next].id.slice(4), true);
    });
  });
  $("adventure-trip").addEventListener("change", event => {
    const id = event.target.value;
    event.target.value = getTrip().id;
    onSelectTrip(id);
  });

  ACTIVITIES.forEach((activity, index) => {
    const angle = (index + .5) * Math.PI / 3;
    const mark = symbol(activity.icon, "wheel-mark");
    mark.style.left = `${50 + Math.sin(angle) * 32}%`;
    mark.style.top = `${50 - Math.cos(angle) * 32}%`;
    $("wheel-disc").append(mark);
  });
  function renderActivity() {
    const result = ACTIVITIES.find(activity => activity.id === current().activity);
    const root = $("activity-result");
    root.replaceChildren(node("h4", "", result?.title || "Et lite eventyr venter."), node("p", "", result?.text || "Seks enkle ideer. Ett lite snurr. Hva blir det i dag?"));
  }
  function cancelSpin() {
    clearTimeout(spinTimer); spinning = false;
    $("spin-wheel").disabled = false;
    $("spin-wheel").replaceChildren(symbol("rotate"), document.createTextNode("Snurr hjulet"));
  }
  $("spin-wheel").addEventListener("click", () => {
    if (spinning) return;
    const tripId = getTrip().id;
    const result = pickActivity(current().activity);
    const index = ACTIVITIES.indexOf(result);
    const finish = () => {
      if (getTrip().id !== tripId) return;
      saveCurrent({ ...current(), activity: result.id });
      cancelSpin(); renderActivity(); announce(result.title);
    };
    spinning = true;
    $("spin-wheel").disabled = true;
    $("spin-wheel").textContent = "Hjulet snurrer …";
    wheelAngle = Math.ceil(wheelAngle / 360) * 360 + 1080 + (360 - index * 60 - 30);
    $("wheel-disc").style.transform = `rotate(${wheelAngle}deg)`;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    else spinTimer = setTimeout(finish, 1900);
  });

  function renderBingo() {
    const entry = current();
    const result = bingoProgress(entry.bingo);
    const board = $("bingo-board"); board.replaceChildren();
    for (const cell of BINGO) {
      const checked = entry.bingo.includes(cell.id);
      const b = button("", () => {
        const entry = current();
        const checked = entry.bingo.includes(cell.id);
        saveCurrent({ ...entry, bingo: checked ? entry.bingo.filter(id => id !== cell.id) : [...entry.bingo, cell.id] });
        renderBingo(); $(`bingo-${cell.id}`).focus({ preventScroll: true });
      }, `bingo-cell${result.winning.has(cell.id) ? " winning" : ""}`);
      b.id = `bingo-${cell.id}`;
      b.setAttribute("aria-pressed", String(checked));
      b.append(symbol(checked ? "check" : cell.icon), node("span", "", cell.label));
      board.append(b);
    }
    $("bingo-count").textContent = `${result.count} / 9`;
    $("bingo-message").textContent = result.count === 9 ? "Fullt brett! Ni minner rikere." : result.lines ? `Bingo! ${result.lines} ${result.lines === 1 ? "rekke" : "rekker"} fullført.` : "Ta det i ditt eget tempo.";
    $("bingo-reset").disabled = result.count === 0;
  }
  $("bingo-reset").addEventListener("click", () => {
    const tripId = getTrip().id; const before = [...current().bingo];
    saveCurrent({ ...current(), bingo: [] }); renderBingo();
    toast("Bingobrettet er klart for nye opplevelser.", () => {
      save(setTripAdventure(state, { ...tripAdventure(state, tripId), bingo: before })); renderBingo();
    });
  });

  function renderPlaylist() {
    const playlist = current().playlist;
    const trip = getTrip();
    $("playlist-cover").src = tripImage(trip.type, trip.imageId).src;
    $("playlist-title").textContent = playlist?.title || "Turens spilleliste";
    $("playlist-description").textContent = playlist ? "Et lydspor til små og store omveier." : "Gi turen sitt eget lydspor. Legg til en Spotify-spilleliste.";
    $("playlist-open").hidden = !playlist;
    if (playlist) $("playlist-open").href = playlist.url; else $("playlist-open").removeAttribute("href");
    $("playlist-edit").textContent = playlist ? "Rediger" : "Legg til spilleliste +";
  }
  $("playlist-edit").addEventListener("click", () => {
    const entry = current();
    openForm("Lyden av denne turen.", [
      { key: "playlist-name", label: "Navn på spillelisten", maxLength: 80, value: entry.playlist?.title, placeholder: "Tre timer til hytta" },
      { key: "playlist-url", label: "Spotify-lenke", type: "url", maxLength: 1500, value: entry.playlist?.url, placeholder: "https://open.spotify.com/playlist/…" }
    ], "Lagre spillelisten", (values, inputs) => {
      const url = spotifyPlaylistUrl(values["playlist-url"]);
      if (!url) { inputs["playlist-url"].setCustomValidity("Bruk en spillelistelenke fra open.spotify.com/playlist/…"); inputs["playlist-url"].reportValidity(); return; }
      saveCurrent({ ...current(), playlist: { title: values["playlist-name"], url } });
      dialog.close(); renderPlaylist(); toast("Spillelisten er knyttet til turen.");
    }, entry.playlist ? button("Fjern koblingen fra turen", () => { saveCurrent({ ...current(), playlist: null }); dialog.close(); renderPlaylist(); }, "text-button") : null);
  });

  function editDream(dream = null) {
    if (!dream && state.dreams.length >= LIMITS.dreams) { toast("Drømmeskuffen har plass til 20 ideer. Fjern en for å lage en ny."); return; }
    const fields = [
      { key: "dream-name", label: "Hva drømmer du om?", maxLength: 80, value: dream?.name, placeholder: "En langhelg langs kysten" },
      { key: "dream-note", label: "Et lite notat (valgfritt)", multiline: true, maxLength: 240, required: false, value: dream?.note, placeholder: "Hva gjør at du har lyst til å dra?" },
      { key: "dream-type", label: "Turtype", value: dream?.type || "city", options: Object.entries(TRIP_TYPES).map(([id, t]) => [id, t.short]) },
      { key: "dream-image", label: "Velg reisemotiv", value: dream?.imageId || "mediterranean", options: TRIP_IMAGES.map(i => [i.id, i.name]) }
    ];
    const inputs = openForm(dream ? "Gi drømmen litt form." : "En ny drøm i skuffen.", fields, "Lagre drømmen", values => {
      const saved = { id: dream?.id || uid("dream"), name: values["dream-name"], note: values["dream-note"], type: values["dream-type"], imageId: values["dream-image"], isExample: false, tripId: dream?.tripId || null };
      save({ ...state, dreams: dream ? state.dreams.map(d => d.id === dream.id ? saved : d) : [...state.dreams, saved] });
      dialog.close(); renderDreams(); toast("Drømmen er lagt trygt i skuffen.");
    });
    const preview = node("img", "dream-preview"); preview.alt = "Valgt reisemotiv";
    const update = () => { preview.src = tripImage("city", inputs["dream-image"].value).src; };
    update(); inputs["dream-image"].addEventListener("change", update);
    inputs["dream-image"].after(preview);
  }
  function renderDreams() {
    const root = $("dream-cards"); root.replaceChildren();
    if (!state.dreams.length) root.append(node("p", "feature-empty", "Her er det plass til noe å glede seg til. Legg din første reiseidé i skuffen."));
    for (const dream of state.dreams) {
      const card = node("article", "dream-card");
      const image = node("img", "dream-image"); image.src = tripImage(dream.type, dream.imageId).src; image.alt = ""; image.loading = "lazy"; image.width = 600; image.height = 360;
      const body = node("div", "dream-body");
      const planned = getWorkspace().trips.some(t => t.id === dream.tripId);
      body.append(node("span", "dream-kicker", planned ? "EN DRØM HAR BLITT EN PLAN" : dream.isExample ? "IDÉFORSLAG · UTEN DATO" : "EN DAG, KANSKJE"), node("h4", "", dream.name), node("p", "", dream.note || "Litt rom for det som kan bli."));
      const actions = node("div", "dream-actions");
      actions.append(button(planned ? "Åpne turen ↗" : "Gjør dette til en tur ↗", () => planned ? onSelectTrip(dream.tripId, "planlegg") : onConvertDream(dream), "text-button dream-plan"));
      const edit = button("", () => editDream(dream), "icon-button"); edit.setAttribute("aria-label", `Rediger ${dream.name}`); edit.append(symbol("edit"));
      const remove = button("", () => {
        save({ ...state, dreams: state.dreams.filter(d => d.id !== dream.id) }); renderDreams();
        toast("Drømmen er fjernet. Eventuelle turer beholdes.", () => { if (state.dreams.length < LIMITS.dreams) { save({ ...state, dreams: [...state.dreams, dream] }); renderDreams(); } });
      }, "icon-button"); remove.setAttribute("aria-label", `Fjern drømmen ${dream.name}`); remove.append(symbol("trash"));
      actions.append(edit, remove); body.append(actions); card.append(image, body); root.append(card);
    }
  }
  $("new-dream").addEventListener("click", () => editDream());

  function editStamp(existing = null, trip = null) {
    if (!existing && state.stamps.length >= LIMITS.stamps) { toast("Reisepasset har plass til 60 stempler."); return; }
    if (trip && (!canStamp(trip) || state.stamps.some(s => s.tripId === trip.id))) return;
    openForm(existing ? "Et stempel fra turen." : "Et nytt stempel i passet.", [
      { key: "stamp-name", label: "Navn på turen", maxLength: 80, value: existing?.name || trip?.name, placeholder: "Sommerhelg i Bergen" },
      { key: "stamp-date", label: "Turdato", type: "date", max: osloToday(), value: existing?.date || trip?.departureDate || osloToday() },
      { key: "stamp-type", label: "Stempelmotiv", value: existing?.type || trip?.type || "city", options: Object.entries(TRIP_TYPES).map(([id, t]) => [id, t.short]) }
    ], "Lagre stempelet", (values, inputs) => {
      const date = values["stamp-date"];
      if (!isCalendarDate(date) || date > osloToday()) { inputs["stamp-date"].setCustomValidity("Velg en dato i dag eller tidligere."); inputs["stamp-date"].reportValidity(); return; }
      const stamp = { id: existing?.id || uid("stamp"), tripId: existing?.tripId || trip?.id || null, name: values["stamp-name"], date, type: values["stamp-type"] };
      save({ ...state, stamps: existing ? state.stamps.map(s => s.id === existing.id ? stamp : s) : [...state.stamps, stamp] });
      dialog.close(); onOverviewChange(); toast("Et nytt minne i reisepasset.");
    }, existing ? button("Fjern stempelet", () => {
      save({ ...state, stamps: state.stamps.filter(s => s.id !== existing.id) }); dialog.close(); onOverviewChange();
      toast("Stempelet er fjernet.", () => { save({ ...state, stamps: [...state.stamps, existing] }); onOverviewChange(); });
    }, "text-button") : null);
  }
  function renderPassport() {
    const root = $("passport-page"); root.replaceChildren();
    const stamps = [...state.stamps].sort((a, b) => b.date.localeCompare(a.date));
    if (!stamps.length) {
      const empty = node("div", "stamp-empty"); empty.append(symbol("compass"), node("span", "", "Her begynner reisehistorien din.")); root.append(empty);
    }
    for (const stamp of stamps) {
      const b = button("", () => editStamp(stamp), `passport-stamp stamp-${stamp.type}`);
      b.setAttribute("aria-label", `Stempel: ${stamp.name}, ${formatDeparture(stamp.date)}`);
      b.append(symbol(stamp.type === "mountain" ? "mountain" : stamp.type === "beach" ? "sun" : "compass"), node("strong", "", stamp.name), node("span", "", formatDeparture(stamp.date)));
      root.append(b);
    }
    $("passport-total").textContent = `${stamps.length} ${stamps.length === 1 ? "stempel" : "stempler"}`;
    const already = stamps.some(s => s.tripId === getTrip().id);
    $("stamp-current").disabled = already || !canStamp(getTrip());
    $("stamp-current").textContent = already ? "Turen er stemplet ✓" : "Stemple denne turen";
    $("stamp-hint").textContent = already ? "Et lite avtrykk fra en gjennomført tur." : canStamp(getTrip()) ? `Er «${getTrip().name}» gjennomført? Gi den et stempel.` : "Den valgte turen kan stemples etter hjemkomst. Tidligere turer kan du legge til allerede nå.";
  }
  $("stamp-current").addEventListener("click", () => editStamp(null, getTrip()));
  $("stamp-previous").addEventListener("click", () => editStamp());

  function editMemory(memory = null) {
    if (!memory && current().memories.length >= LIMITS.memories) { toast("Glasset har plass til 30 minner per tur."); return; }
    openForm(memory ? "Ta vare på øyeblikket." : "Et lite minne å ta med hjem.", [
      { key: "memory-text", label: "Hva vil du huske?", multiline: true, maxLength: 600, value: memory?.text, placeholder: "Den første kaffekoppen med utsikt over fjorden …" },
      { key: "memory-date", label: "Dato", type: "date", max: osloToday(), value: memory?.date || osloToday() }
    ], "Legg i glasset", (values, inputs) => {
      if (!isCalendarDate(values["memory-date"]) || values["memory-date"] > osloToday()) { inputs["memory-date"].setCustomValidity("Velg en dato i dag eller tidligere."); inputs["memory-date"].reportValidity(); return; }
      const saved = { id: memory?.id || uid("memory"), text: values["memory-text"], date: values["memory-date"] };
      const entry = current();
      saveCurrent({ ...entry, memories: memory ? entry.memories.map(m => m.id === memory.id ? saved : m) : [...entry.memories, saved] });
      dialog.close(); renderMemories(); toast("Et fint øyeblikk er tatt vare på.");
    });
  }
  function readMemory(memory) {
    const body = node("div", "memory-reading");
    body.append(node("span", "eyebrow", formatDeparture(memory.date)), node("blockquote", "", memory.text));
    const actions = node("div", "dialog-actions");
    actions.append(button("Rediger", () => editMemory(memory)), button("Fjern minnet", () => {
      const tripId = getTrip().id;
      saveCurrent({ ...current(), memories: current().memories.filter(m => m.id !== memory.id) });
      dialog.close(); renderMemories();
      toast("Minnet er tatt ut av glasset.", () => {
        const entry = tripAdventure(state, tripId);
        if (entry.memories.length < LIMITS.memories) save(setTripAdventure(state, { ...entry, memories: [...entry.memories, memory] }));
        renderMemories();
      });
    }, "text-button"));
    body.append(actions); openModal("Et øyeblikk fra turen.", body);
  }
  function renderMemories() {
    const memories = [...current().memories].sort((a, b) => b.date.localeCompare(a.date));
    $("memory-count").textContent = `${memories.length} ${memories.length === 1 ? "minne" : "minner"}`;
    const papers = $("jar-papers"); papers.replaceChildren();
    for (let i = 0; i < Math.min(8, memories.length); i++) {
      const memory = memories[i];
      const slip = button("", () => readMemory(memory), "jar-paper");
      slip.setAttribute("aria-label", `Les minne: ${memory.text.slice(0, 70)}`);
      slip.title = memory.text.slice(0, 100);
      slip.style.setProperty("--paper-index", i);
      papers.append(slip);
    }
    const notes = $("memory-notes"); notes.replaceChildren();
    if (!memories.length) notes.append(node("p", "feature-empty", "Glasset venter på sitt første lille øyeblikk."));
    for (const memory of memories) {
      const b = button("", () => readMemory(memory), "memory-note");
      b.append(symbol("book"), node("span", "", memory.text.length > 58 ? `${memory.text.slice(0, 58)}…` : memory.text), symbol("arrow-up-right"));
      notes.append(b);
    }
  }
  $("new-memory").addEventListener("click", () => editMemory());

  function render() {
    if (!getWorkspace().trips.length) { cancelSpin(); renderTicket(); return; }
    const trip = getTrip();
    const select = $("adventure-trip");
    select.replaceChildren(...getWorkspace().trips.map(t => { const option = node("option", "", t.name); option.value = t.id; return option; }));
    select.value = trip.id;
    const cover = tripImage(trip.type, trip.imageId);
    $("adventure-trip-cover").src = cover.src;
    $("adventure-trip-cover").style.objectPosition = cover.position;
    if (renderedTripId !== trip.id) {
      cancelSpin(); renderedTripId = trip.id;
      const index = ACTIVITIES.findIndex(activity => activity.id === current().activity);
      wheelAngle = index < 0 ? 0 : 360 - index * 60 - 30;
      $("wheel-disc").style.transition = "none";
      $("wheel-disc").style.transform = `rotate(${wheelAngle}deg)`;
      requestAnimationFrame(() => { $("wheel-disc").style.transition = ""; });
    }
    renderStorage(); renderTicket(); renderBingo(); renderPlaylist(); renderDreams(); renderPassport(); renderMemories();
    if (!spinning) renderActivity();
  }
  render();
  return {
    render,
    overview,
    linkDream(dreamId, tripId) { save({ ...state, dreams: state.dreams.map(d => d.id === dreamId ? { ...d, tripId } : d) }); renderDreams(); },
    removeTrip(tripId) { save({ ...state, trips: state.trips.filter(t => t.tripId !== tripId), dreams: state.dreams.map(d => d.tripId === tripId ? { ...d, tripId: null } : d) }); }
  };
}

export function renderSuitcase({ percent, packed, total }) {
  const root = $("packing-suitcase");
  root.setAttribute("aria-label", `Kofferten er ${percent} prosent pakket. ${packed} av ${total} ting.`);
  root.innerHTML = `<svg viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><clipPath id="suitcase-clip"><rect x="21" y="21" width="78" height="68" rx="10"/></clipPath></defs><ellipse cx="60" cy="95" rx="44" ry="3" fill="#24382f0b"/><path d="M46 20V10h28v10" fill="none" stroke="#64755a" stroke-width="3"/><rect x="21" y="21" width="78" height="68" rx="10" fill="#f1f4ec" stroke="#809271" stroke-width="2"/><g clip-path="url(#suitcase-clip)"><rect x="22" y="${89 - percent * .67}" width="76" height="${percent * .67}" fill="#b6c5a5" class="suitcase-fill"/>${packed ? '<rect x="29" y="70" width="39" height="12" rx="4" fill="#f5e5cd"/><path d="M33 75h29" stroke="#ceba98"/>' : ""}${percent >= 35 ? '<rect x="51" y="52" width="39" height="13" rx="4" fill="#eef0e5"/><path d="M56 57h29" stroke="#abb99c"/>' : ""}${percent >= 65 ? '<rect x="29" y="35" width="36" height="12" rx="4" fill="#c4d8db"/><path d="M34 40h26" stroke="#8ca7ab"/>' : ""}</g><path d="M39 24v63m42-63v63" stroke="#6a805d" stroke-width="2" opacity=".6"/><rect x="30" y="89" width="7" height="6" rx="2" fill="#52654e"/><rect x="83" y="89" width="7" height="6" rx="2" fill="#52654e"/>${percent === 100 ? '<circle cx="96" cy="25" r="12" fill="#294c3e"/><path d="m91 25 3 3 6-7" stroke="white" stroke-width="2" fill="none"/>' : ""}</svg>`;
}
