import { countdown, isCalendarDate, osloToday, TRIP_TYPES, createTrip } from "./packing.js";
import { validImageId } from "./trip-images.js";

export const ADVENTURE_KEY = "pakkeklar.reiseglede.v1";
export const LIMITS = { dreams: 20, stamps: 60, memories: 30 };
export const BINGO = [
  { id: "taste", label: "Smak noe nytt", icon: "sun" },
  { id: "view", label: "Finn en fin utsikt", icon: "mountain" },
  { id: "photo", label: "Ta et spontant bilde", icon: "image" },
  { id: "slow", label: "Nyt en rolig morgen", icon: "leaf" },
  { id: "kind", label: "Gjør noen glad", icon: "heart" },
  { id: "walk", label: "Gå en ny liten runde", icon: "compass" },
  { id: "local", label: "Oppdag noe lokalt", icon: "sparkles" },
  { id: "offline", label: "En time uten skjerm", icon: "book" },
  { id: "sky", label: "Se himmelen skifte farge", icon: "sun" }
];
export const ACTIVITIES = [
  { id: "picnic", title: "En liten piknik", icon: "sun", text: "Ta med noe godt og finn et hyggelig sted å sitte. Det trenger ikke være langt unna." },
  { id: "games", title: "Tid for en spillkveld", icon: "sparkles", text: "Finn frem en kortstokk eller et brettspill. Litt snacks og god tid gjør resten." },
  { id: "light", title: "Fang det fine lyset", icon: "image", text: "Gå en liten runde når lyset er mykt. Ta et bilde av noe du vil huske." },
  { id: "wander", title: "Ta en ny liten vei", icon: "compass", text: "Velg en trygg, kort runde du ikke har gått før. Kanskje venter en fin utsikt rundt hjørnet." },
  { id: "taste", title: "Prøv noe godt", icon: "heart", text: "Smak noe nytt, bak noe sammen eller finn en hyggelig kafé. La nysgjerrigheten bestemme." },
  { id: "pause", title: "En pause uten planer", icon: "leaf", text: "Finn et godt sted, legg bort mobilen og bli sittende litt. Bare vær der du er." }
];

const text = (v, max) => typeof v === "string" ? v.trim().slice(0, max) : "";
const id = v => typeof v === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(v);
const type = v => Object.hasOwn(TRIP_TYPES, v) ? v : "city";
const image = v => validImageId(v) ? v : null;
const unique = (items, key = "id") => items.filter((item, index) => items.findIndex(other => other[key] === item[key]) === index);

export function emptyAdventure() {
  return { version: 1, dreams: [], trips: [], stamps: [] };
}
export function starterAdventure() {
  return { ...emptyAdventure(), dreams: [
    { id: "idea-train", name: "Sakte gjennom Alpene", type: "mountain", imageId: "train", note: "Togvindu, en god bok og ingen hast.", isExample: true, tripId: null },
    { id: "idea-winter", name: "En helg med peiskos", type: "mountain", imageId: "winter", note: "Snø utenfor. God tid innenfor.", isExample: true, tripId: null },
    { id: "idea-sea", name: "Et sted ved havet", type: "beach", imageId: "mediterranean", note: "Salte bad og lange frokoster.", isExample: true, tripId: null }
  ] };
}

// Only actual Spotify playlist links are opened. No embedded player or network request.
export function spotifyPlaylistUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "open.spotify.com" || url.port || url.username || url.password ||
        !/^\/(?:intl-[a-z]{2}\/)?playlist\/[a-zA-Z0-9]{22}\/?$/.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}

export function restoreAdventure(raw) {
  if (raw === null) return starterAdventure();
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.dreams) || !Array.isArray(value.trips) || !Array.isArray(value.stamps)) return null;
    return {
      version: 1,
      dreams: unique(value.dreams.filter(d => id(d?.id) && text(d.name, 80)).map(d => ({
        id: d.id, name: text(d.name, 80), note: text(d.note, 240), type: type(d.type), imageId: image(d.imageId),
        isExample: d.isExample === true, tripId: id(d.tripId) ? d.tripId : null
      }))).slice(0, LIMITS.dreams),
      trips: unique(value.trips.filter(t => id(t?.tripId)).map(t => ({
        tripId: t.tripId,
        bingo: [...new Set(Array.isArray(t.bingo) ? t.bingo.filter(key => BINGO.some(cell => cell.id === key)) : [])],
        activity: ACTIVITIES.some(a => a.id === t.activity) ? t.activity : null,
        playlist: t.playlist && text(t.playlist.title, 80) && spotifyPlaylistUrl(t.playlist.url)
          ? { title: text(t.playlist.title, 80), url: spotifyPlaylistUrl(t.playlist.url) } : null,
        memories: unique((Array.isArray(t.memories) ? t.memories : []).filter(m => id(m?.id) && text(m.text, 600) && isCalendarDate(m.date))
          .map(m => ({ id: m.id, text: text(m.text, 600), date: m.date }))).slice(0, LIMITS.memories)
      })), "tripId").slice(0, 120),
      stamps: unique(value.stamps.filter(s => id(s?.id) && text(s.name, 80) && isCalendarDate(s.date)).map(s => ({
        id: s.id, tripId: id(s.tripId) ? s.tripId : null, name: text(s.name, 80), date: s.date, type: type(s.type)
      }))).slice(0, LIMITS.stamps)
    };
  } catch { return null; }
}

export function tripAdventure(state, tripId) {
  return state.trips.find(t => t.tripId === tripId) || { tripId, bingo: [], activity: null, playlist: null, memories: [] };
}
export function setTripAdventure(state, entry) {
  const rest = state.trips.filter(t => t.tripId !== entry.tripId);
  return { ...state, trips: [...rest, entry] };
}
export function bingoProgress(checked) {
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const done = new Set(checked);
  const lines = wins.filter(line => line.every(index => done.has(BINGO[index].id)));
  return { count: BINGO.filter(cell => done.has(cell.id)).length, lines: lines.length, winning: new Set(lines.flat().map(i => BINGO[i].id)) };
}
export function pickActivity(previousId, random = Math.random()) {
  const options = ACTIVITIES.filter(a => a.id !== previousId);
  return options[Math.min(options.length - 1, Math.max(0, Math.floor(random * options.length)))];
}
export function nextTrip(trips, stamps = [], today = osloToday()) {
  const completed = new Set(stamps.map(s => s.tripId));
  const candidates = trips.filter(t => !completed.has(t.id));
  return candidates.filter(t => {
    const timer = countdown(t.departureDate, t.days, today);
    return timer.daysUntil !== null && timer.daysUntil > -t.days;
  }).sort((a, b) => a.departureDate.localeCompare(b.departureDate))[0] || candidates.find(t => !t.departureDate) || null;
}
export function canStamp(trip, today = osloToday()) {
  const timer = countdown(trip.departureDate, trip.days, today);
  return timer.daysUntil !== null && timer.daysUntil <= -trip.days;
}

export function tripOverview(trips, stamps = [], today = osloToday()) {
  const featured = nextTrip(trips, stamps, today);
  const others = trips.filter(trip => trip.id !== featured?.id)
    .sort((a, b) => (a.departureDate || "9999").localeCompare(b.departureDate || "9999"));
  return { featured, others };
}
export function tripFromDream(dream, tripId) {
  return { ...createTrip(dream.type, 3), id: tripId, name: dream.name, imageId: dream.imageId, departureDate: "", isExample: false };
}
