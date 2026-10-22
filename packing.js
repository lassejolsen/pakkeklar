import { validImageId } from "./trip-images.js";

export const STORAGE_KEY = "pakkeklar.trip.v1";
export const WORKSPACE_KEY = "pakkeklar.trips.v2";
export const MAX_DAYS = 30;
export const MAX_QUANTITY = 99;
export const MAX_TRIPS = 12;
export const MAX_ITEMS = 200;
const EXAMPLE_SET_VERSION = 2;

export const TRIP_TYPES = {
  city: { name: "Storbytur", short: "Storby", title: "En liten storbyferie", image: "storby.jpg" },
  mountain: { name: "Fjelltur", short: "Fjell", title: "Ut på tur, opp i høyden", image: "fjell.jpg" },
  beach: { name: "Strandferie", short: "Strand", title: "Noen dager i solen", image: "strand.jpg" }
};

export const CATEGORIES = {
  clothes: { name: "Klær", icon: "shirt" },
  toiletries: { name: "Toalettsaker", icon: "bottle" },
  electronics: { name: "Elektronikk", icon: "plug" },
  essentials: { name: "Det viktigste", icon: "ticket" },
  outdoors: { name: "Til turen", icon: "mountain" },
  beach: { name: "Til stranden", icon: "sun" },
  extra: { name: "Dine tillegg", icon: "sparkles" }
};

const common = [
  ["underwear", "Undertøy", "clothes", d => d],
  ["toothbrush", "Tannbørste og tannkrem", "toiletries"],
  ["deodorant", "Deodorant", "toiletries"],
  ["care", "Hud- og hårpleie", "toiletries"],
  ["phone", "Mobil og lader", "electronics"],
  ["powerbank", "Powerbank", "electronics"],
  ["wallet", "Lommebok og ID", "essentials"],
  ["bookings", "Billetter og reservasjoner", "essentials"]
];

const templates = {
  city: [
    ["tops", "T-skjorter / overdeler", "clothes", d => Math.ceil(d / 2)],
    ["socks", "Sokker", "clothes", d => d],
    ["trousers", "Bukser", "clothes", d => Math.ceil(d / 4)],
    ["jacket", "Jakke etter været", "clothes"],
    ["shoes", "Gode gåsko", "clothes"],
    ["suncream", "Solkrem", "toiletries"],
    ["headphones", "Hodetelefoner", "electronics"],
    ["passport", "Pass, hvis reisen krever det", "essentials"],
    ["daybag", "Liten dagstursekk", "essentials"],
    ["umbrella", "Liten paraply", "essentials"]
  ],
  mountain: [
    ["wool", "Ullundertøy", "clothes", d => Math.ceil(d / 3)],
    ["socks", "Tursokker", "clothes", d => d],
    ["trousers", "Turbukse", "clothes"],
    ["fleece", "Varm genser", "clothes"],
    ["shell", "Vind- og vanntett jakke", "clothes"],
    ["boots", "Tursko", "clothes"],
    ["hat", "Lue og hansker", "clothes"],
    ["suncream", "Solkrem", "toiletries"],
    ["bottle", "Drikkeflaske", "outdoors"],
    ["food", "Mat og tursnacks", "outdoors"],
    ["map", "Kart og kompass", "outdoors"],
    ["firstaid", "Lite førstehjelpssett", "outdoors"],
    ["headlamp", "Hodelykt", "outdoors"],
    ["backpack", "Tursekk", "outdoors"]
  ],
  beach: [
    ["tops", "T-skjorter / topper", "clothes", d => Math.ceil(d / 2)],
    ["shorts", "Shorts / lette underdeler", "clothes", d => Math.ceil(d / 3)],
    ["swimwear", "Badetøy", "clothes", d => d > 3 ? 2 : 1],
    ["layer", "Lett genser til kvelden", "clothes"],
    ["sandals", "Sandaler", "clothes"],
    ["suncream", "Solkrem", "toiletries"],
    ["passport", "Pass, hvis reisen krever det", "essentials"],
    ["sunglasses", "Solbriller", "beach"],
    ["sunhat", "Solhatt / caps", "beach"],
    ["towel", "Strandhåndkle", "beach"],
    ["beachbag", "Strandveske", "beach"],
    ["bottle", "Drikkeflaske", "beach"],
    ["book", "En god bok", "beach"]
  ]
};

export function validDays(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= MAX_DAYS;
}

export function createPreparation(type) {
  if (!Object.hasOwn(TRIP_TYPES, type)) throw new RangeError("Velg en gyldig turtype.");
  const travelTasks = type === "mountain"
    ? [["offline-map", "Last ned kart for turen"], ["route", "Sjekk ruten og forholdene"]]
    : [["documents", "Sjekk ID og reisedokumenter"], ["tickets", "Last ned billetter og reservasjoner"]];
  return [
    ["charge", "Lad mobil og powerbank"],
    ["weather", "Sjekk værmeldingen"],
    ...travelTasks,
    ["home", "Ta ut søpla og lukk vinduene"]
  ].map(([id, name]) => ({ id, name, done: false }));
}

export function preparationProgress(trip) {
  return { done: trip.preparation.filter(task => task.done).length, total: trip.preparation.length };
}

export function createTrip(type = "city", days = 3) {
  if (!Object.hasOwn(TRIP_TYPES, type) || !validDays(days)) {
    throw new RangeError("Velg en turtype og mellom 1 og 30 dager.");
  }
  const duration = Number(days);
  return {
    version: 1,
    type,
    days: duration,
    imageId: null,
    items: [...common, ...templates[type]].map(([id, name, category, quantity]) => ({
      id,
      name,
      category,
      quantity: quantity ? quantity(duration) : 1,
      quantityEdited: false,
      packed: false,
      custom: false
    })),
    preparation: createPreparation(type)
  };
}

export function validQuantity(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_QUANTITY;
}

export function suggestedQuantity(trip, item) {
  if (item.custom) return null;
  return createTrip(trip.type, trip.days).items.find(suggestion => suggestion.id === item.id)?.quantity ?? null;
}

export function setItemQuantity(trip, id, value, { useSuggestion = false } = {}) {
  const item = trip.items.find(candidate => candidate.id === id);
  if (!item) return { error: "Denne tingen finnes ikke på listen." };
  const quantity = useSuggestion ? suggestedQuantity(trip, item) : Number(value);
  if (!validQuantity(quantity)) return { error: "Velg et helt antall fra 1 til 99." };
  const needsRepacking = item.packed && quantity > item.quantity;
  return {
    trip: {
      ...trip,
      items: trip.items.map(candidate => candidate.id === id ? {
        ...candidate, quantity, quantityEdited: !useSuggestion,
        packed: needsRepacking ? false : candidate.packed
      } : { ...candidate })
    },
    needsRepacking
  };
}

export function updateTripDays(trip, days) {
  if (!validDays(days)) throw new RangeError("Velg mellom 1 og 30 dager.");
  const suggestions = new Map(createTrip(trip.type, days).items.map(item => [item.id, item.quantity]));
  return {
    ...trip,
    days: Number(days),
    // Map the current list so removed suggestions stay removed and custom items stay put.
    items: trip.items.map(item => {
      const quantity = item.custom || item.quantityEdited ? item.quantity : suggestions.get(item.id) ?? item.quantity;
      return { ...item, quantity, packed: quantity > item.quantity ? false : item.packed };
    }),
    preparation: trip.preparation.map(task => ({ ...task }))
  };
}

export function changeTripType(source, type, days = source.days) {
  if (type === source.type) return updateTripDays(source, days);
  const target = createTrip(type, days);
  const previousTemplate = createTrip(source.type, source.days);
  const current = new Map(source.items.map(item => [item.id, item]));
  const customIds = new Set(source.items.filter(item => item.custom).map(item => item.id));
  const removedSuggestions = new Set(previousTemplate.items.filter(item => !current.has(item.id)).map(item => item.id));
  const items = target.items.filter(item => !removedSuggestions.has(item.id) && !customIds.has(item.id)).map(suggestion => {
    const previous = current.get(suggestion.id);
    // A shared ID can have a different purpose (e.g. socks vs hiking socks).
    // Only genuinely common items inherit checked state and manual quantities.
    if (!previous || previous.custom || previous.name !== suggestion.name) return suggestion;
    const quantity = previous.quantityEdited ? previous.quantity : suggestion.quantity;
    return {
      ...previous, category: suggestion.category, quantity,
      packed: quantity > previous.quantity ? false : previous.packed
    };
  });
  items.push(...source.items.filter(item => item.custom).map(item => ({ ...item })));
  if (items.length > MAX_ITEMS) throw new RangeError("Den nye turtypen gir mer enn 200 punkter. Fjern noen ting før du bytter turtype.");
  const previousTasks = new Map(source.preparation.map(task => [task.id, task]));
  return {
    ...source, type, days: Number(days), items,
    preparation: target.preparation.map(task => ({ ...task, done: previousTasks.get(task.id)?.done ?? false }))
  };
}

export function tripChangeSummary(before, after) {
  const sameItem = (a, b) => a.id === b.id && a.name === b.name;
  return {
    added: after.items.filter(item => !before.items.some(previous => sameItem(item, previous))),
    removed: before.items.filter(item => !after.items.some(next => sameItem(item, next))),
    kept: after.items.filter(item => before.items.some(previous => sameItem(item, previous))),
    reopened: after.items.filter(item => !item.packed && before.items.some(previous => sameItem(item, previous) && previous.packed))
  };
}

export function sameTripDetails(first, second) {
  return first.type === second.type && Number(first.days) === Number(second.days) &&
    normaliseName(first.name) === normaliseName(second.name) &&
    first.departureDate === second.departureDate && (first.imageId ?? null) === (second.imageId ?? null);
}

export function copyName(name) {
  return `${normaliseName(name).slice(0, 73).trimEnd()} (kopi)`;
}

export function copyTrip(source, { id, name = copyName(source.name), departureDate = "" }) {
  if (!source.id || id === source.id) throw new TypeError("Kopien må ha en egen tur-ID.");
  const copy = restoreTrip(JSON.stringify({
    ...source, id, name, departureDate, isExample: false,
    items: source.items.map(item => ({ ...item, packed: false })),
    preparation: source.preparation.map(task => ({ ...task, done: false }))
  }));
  if (!copy?.id) throw new TypeError("Kopien trenger gyldig navn, dato og tur-ID.");
  return copy;
}

export function progress(trip) {
  const total = trip.items.length;
  const packed = trip.items.filter(item => item.packed).length;
  return { total, packed, remaining: total - packed, percent: total ? Math.round(packed / total * 100) : 0 };
}

export function normaliseName(value) {
  return String(value).trim().replace(/\s+/g, " ");
}

export function addItem(trip, value, id) {
  const name = normaliseName(value);
  if (!name || name.length > 80) return { error: "Skriv et navn på mellom 1 og 80 tegn." };
  if (trip.items.length >= MAX_ITEMS) return { error: "Listen har plass til 200 ting." };
  if (trip.items.some(item => item.name.toLocaleLowerCase("nb") === name.toLocaleLowerCase("nb"))) {
    return { error: "Dette står allerede på pakkelisten." };
  }
  return {
    trip: {
      ...trip,
      items: [...trip.items, { id, name, category: "extra", quantity: 1, quantityEdited: false, packed: false, custom: true }]
    }
  };
}

export function restoreTrip(raw) {
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !Object.hasOwn(TRIP_TYPES, value.type) ||
        !validDays(value.days) || !Array.isArray(value.items) || value.items.length > MAX_ITEMS) return null;
    const ids = new Set();
    const items = value.items.map(item => {
      if (!item || typeof item.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(item.id) ||
          ids.has(item.id) || typeof item.name !== "string" || !normaliseName(item.name) ||
          item.name.length > 80 || !Object.hasOwn(CATEGORIES, item.category) ||
          !Number.isInteger(item.quantity) || !validQuantity(item.quantity) ||
          (item.quantityEdited !== undefined && typeof item.quantityEdited !== "boolean") ||
          typeof item.packed !== "boolean" || typeof item.custom !== "boolean") {
        throw new TypeError("Invalid saved item");
      }
      ids.add(item.id);
      return {
        id: item.id, name: normaliseName(item.name), category: item.category,
        quantity: item.quantity, quantityEdited: item.quantityEdited ?? false,
        packed: item.packed, custom: item.custom
      };
    });
    // Older saved trips gain the new checklist without losing packing progress.
    const preparation = createPreparation(value.type);
    if (value.preparation !== undefined) {
      if (!Array.isArray(value.preparation) || value.preparation.length !== preparation.length) return null;
      const tasks = new Map(value.preparation.map(task => [task?.id, task]));
      if (tasks.size !== preparation.length) return null;
      for (const task of preparation) {
        const saved = tasks.get(task.id);
        if (typeof saved?.done !== "boolean") return null;
        task.done = saved.done;
      }
    }
    const trip = { version: 1, type: value.type, days: Number(value.days), imageId: validImageId(value.imageId) ? value.imageId : null, items, preparation };
    if (value.id !== undefined) {
      if (typeof value.id !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(value.id) ||
          typeof value.name !== "string" || !normaliseName(value.name) || value.name.length > 80 ||
          typeof value.departureDate !== "string" || (value.departureDate && !isCalendarDate(value.departureDate)) ||
          typeof value.isExample !== "boolean") return null;
      Object.assign(trip, {
        id: value.id, name: normaliseName(value.name),
        departureDate: value.departureDate, isExample: value.isExample
      });
    }
    return trip;
  } catch {
    return null;
  }
}

// Calendar-day arithmetic avoids 23/25-hour errors around daylight-saving time.
export function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 2000 || year > 2100) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function dayNumber(value) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

export function osloToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const part = type => parts.find(value => value.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function countdown(departureDate, duration, today = osloToday()) {
  if (!isCalendarDate(departureDate) || !isCalendarDate(today)) {
    return { number: null, label: "Dato kommer", detail: "Legg til avreisedato", daysUntil: null };
  }
  const difference = dayNumber(departureDate) - dayNumber(today);
  if (difference > 0) return {
    number: difference, label: difference === 1 ? "dag igjen" : "dager igjen",
    detail: `${difference} ${difference === 1 ? "dag" : "dager"} til avreise`, daysUntil: difference
  };
  if (difference === 0) return { number: null, label: "I dag!", detail: "Avreise i dag. God tur!", daysUntil: 0 };
  if (-difference < Number(duration)) return {
    number: null, label: "På tur", detail: `Dag ${1 - difference} av ${duration}`, daysUntil: difference
  };
  return { number: null, label: "Dato passert", detail: "Turdatoen er passert", daysUntil: difference };
}

export function formatDeparture(value) {
  if (!isCalendarDate(value)) return "Dato ikke valgt";
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
  }).format(new Date(`${value}T12:00:00Z`));
}

export function createExamples() {
  let cabin = {
    ...createTrip("mountain", 3), id: "example-cabin",
    name: "Hyttehelg på fjellet", departureDate: "2026-11-13", isExample: true
  };
  cabin = addItem(cabin, "Innesko til hytta", "cabin-slippers").trip;
  cabin = addItem(cabin, "Kortstokk og spill", "cabin-games").trip;
  const cabinPacked = new Set(["underwear", "wool", "socks", "fleece", "hat", "bottle", "cabin-slippers", "cabin-games"]);
  cabin.items.forEach(item => { item.packed = cabinPacked.has(item.id); });
  const city = {
    ...createTrip("city", 3), id: "example-city",
    name: "Vårhelg i København", departureDate: "2027-04-16", isExample: true
  };
  const cityPacked = new Set(["toothbrush", "deodorant", "socks", "shoes"]);
  city.items.forEach(item => { item.packed = cityPacked.has(item.id); });
  const beach = {
    ...createTrip("beach", 10), id: "example-beach",
    name: "Sydentur 2027", departureDate: "2027-06-19", isExample: true
  };
  const beachPacked = new Set(["swimwear", "sunglasses", "sunhat"]);
  beach.items.forEach(item => { item.packed = beachPacked.has(item.id); });
  return [cabin, city, beach];
}

export function createWorkspace(legacyRaw = null) {
  const trips = createExamples();
  let activeTripId = trips[0].id;
  const legacy = restoreTrip(legacyRaw);
  // Keep real changes from the first version. An untouched starter has no unique content.
  if (legacy && JSON.stringify(legacy) !== JSON.stringify(createTrip())) {
    const restored = {
      ...legacy, id: "previous-trip", name: "Min tidligere pakkeliste",
      departureDate: "", isExample: false
    };
    trips.push(restored);
    activeTripId = restored.id;
  }
  return { version: 2, exampleSetVersion: EXAMPLE_SET_VERSION, activeTripId, trips };
}

export function createEmptyWorkspace() {
  return { version: 2, exampleSetVersion: EXAMPLE_SET_VERSION, activeTripId: null, trips: [] };
}

export function restoreWorkspace(raw) {
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 2 || !Array.isArray(value.trips) ||
        value.trips.length > MAX_TRIPS) return null;
    // An intentional empty start must survive reload, without seeding old examples.
    if (!value.trips.length) return value.activeTripId === null && value.exampleSetVersion === EXAMPLE_SET_VERSION
      ? createEmptyWorkspace() : null;
    const trips = value.trips.map(trip => restoreTrip(JSON.stringify(trip)));
    if (trips.some(trip => !trip?.id)) return null;
    const ids = trips.map(trip => trip.id);
    if (new Set(ids).size !== ids.length || !ids.includes(value.activeTripId)) return null;
    // Extend the old example set once, preserving edits and the active trip.
    // Saving this version also ensures a deleted example never comes back on reload.
    if ((value.exampleSetVersion ?? 1) < EXAMPLE_SET_VERSION && trips.length < MAX_TRIPS &&
        !ids.includes("example-city") &&
        ["example-cabin", "example-beach"].every(id => trips.some(trip => trip.id === id && trip.isExample))) {
      trips.splice(trips.findIndex(trip => trip.id === "example-beach"), 0, createExamples().find(trip => trip.id === "example-city"));
    }
    return { version: 2, exampleSetVersion: EXAMPLE_SET_VERSION, activeTripId: value.activeTripId, trips };
  } catch {
    return null;
  }
}
