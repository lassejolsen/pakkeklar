import test from "node:test";
import assert from "node:assert/strict";
import { createWorkspace, restoreWorkspace } from "../packing.js";
import { BINGO, ACTIVITIES, emptyAdventure, starterAdventure, restoreAdventure, tripAdventure, setTripAdventure, bingoProgress, pickActivity, nextTrip, tripOverview, canStamp, spotifyPlaylistUrl, tripFromDream } from "../adventure-data.js";

test("nye reiseglede-data endrer ikke eksisterende turer, og tom drømmeskuff forblir tom", () => {
  const workspace = createWorkspace();
  const original = JSON.stringify(workspace);
  const state = restoreAdventure(null);
  assert.equal(state.dreams.length, 3);
  assert.ok(state.dreams.every(d => d.isExample && !d.tripId));
  assert.deepEqual(restoreAdventure(JSON.stringify(emptyAdventure())).dreams, []);
  assert.equal(JSON.stringify(restoreWorkspace(original)), original);
  assert.equal(restoreAdventure("broken"), null);
  assert.equal(restoreAdventure('{"version":3}'), null);
});

test("reisebingo gjenkjenner rader, kolonner, diagonaler og et helt brett", () => {
  for (const indexes of [[0,1,2],[0,3,6],[0,4,8],[2,4,6]]) {
    const result = bingoProgress(indexes.map(i => BINGO[i].id));
    assert.equal(result.lines, 1);
    assert.equal(result.winning.size, 3);
  }
  assert.equal(bingoProgress(["taste", "taste", "missing"]).count, 1);
  assert.equal(bingoProgress(["taste", "photo", "kind"]).lines, 0);
  const full = bingoProgress(BINGO.map(cell => cell.id));
  assert.equal(full.count, 9);
  assert.equal(full.lines, 8);
});

test("hjulet kan velge alle aktiviteter og unngår samme forslag to ganger på rad", () => {
  const choices = new Set(Array.from({ length: 6 }, (_, i) => pickActivity(null, i / 6).id));
  assert.equal(choices.size, 6);
  for (const previous of ACTIVITIES) for (const random of [0, .2, .4, .8, .999, 1]) {
    assert.notEqual(pickActivity(previous.id, random).id, previous.id);
  }
});

test("neste billett velger nærmeste avreise, viser pågående tur og hopper over gjennomførte", () => {
  const base = createWorkspace().trips[0];
  const trips = [
    { ...base, id: "future", departureDate: "2026-11-13" },
    { ...base, id: "past", departureDate: "2026-10-01" },
    { ...base, id: "current", departureDate: "2026-10-20" },
    { ...base, id: "undated", departureDate: "" }
  ];
  assert.equal(nextTrip(trips, [], "2026-10-21").id, "current");
  assert.equal(nextTrip(trips, [{ tripId: "current" }], "2026-10-21").id, "future");
  assert.equal(nextTrip(trips, [], "2027-01-01").id, "undated");
  assert.equal(nextTrip([trips[1]], [], "2027-01-01"), null);
});

test("pass-stempel blir tilgjengelig etter siste turdag, også rundt sommertid", () => {
  const trip = { departureDate: "2026-03-28", days: 3 };
  assert.equal(canStamp(trip, "2026-03-30"), false);
  assert.equal(canStamp(trip, "2026-03-31"), true);
  assert.equal(canStamp({ departureDate: "", days: 1 }, "2026-03-31"), false);
  assert.equal(canStamp({ departureDate: "2027-06-19", days: 10 }, "2026-10-21"), false);
});

test("en tur vises bare en gang i billett og kort, også når neste tur endres", () => {
  const trips = createWorkspace().trips.reverse();
  const original = JSON.stringify(trips);
  for (const today of ["2026-10-21", "2027-04-17", "2027-08-01"]) {
    const { featured, others } = tripOverview(trips, [], today);
    const visible = [...(featured ? [featured] : []), ...others];
    assert.equal(visible.length, trips.length);
    assert.equal(new Set(visible.map(t => t.id)).size, trips.length);
    assert.ok(!others.some(t => t.id === featured?.id));
    assert.deepEqual(others.map(t => t.departureDate), others.map(t => t.departureDate).sort());
  }
  const single = tripOverview([trips[0]], [], "2026-10-21");
  assert.equal(single.featured.id, trips[0].id);
  assert.deepEqual(single.others, []);
  const stamped = tripOverview(trips, [{ tripId: "example-cabin" }], "2026-10-21");
  assert.equal(stamped.featured.id, "example-city");
  assert.ok(stamped.others.some(t => t.id === "example-cabin"));
  assert.equal(JSON.stringify(trips), original);
});

test("bingo, minner og musikk lagres separat per tur og overlever gjenåpning", () => {
  const source = emptyAdventure();
  const first = { ...tripAdventure(source, "trip-a"), bingo: ["taste"], activity: "games", memories: [{ id: "m1", text: "Kaffe i morgensolen.", date: "2026-10-21" }] };
  let state = setTripAdventure(source, first);
  state = setTripAdventure(state, { ...tripAdventure(state, "trip-b"), bingo: ["view"] });
  const restored = restoreAdventure(JSON.stringify(state));
  assert.deepEqual(tripAdventure(restored, "trip-a"), first);
  assert.deepEqual(tripAdventure(restored, "trip-b").bingo, ["view"]);
  assert.deepEqual(tripAdventure(restored, "copy").memories, []);
  assert.deepEqual(source.trips, []);
});

test("Spotify-lenker avviser skript, falske vertsnavn, innlogging i URL og feil innholdstype", () => {
  const url = "https://open.spotify.com/playlist/1234567890123456789012?si=example";
  assert.equal(spotifyPlaylistUrl(url), url);
  for (const invalid of ["javascript:alert(1)", "http://open.spotify.com/playlist/1234567890123456789012", "https://open.spotify.com.evil.test/playlist/1234567890123456789012", "https://name@open.spotify.com/playlist/1234567890123456789012", "https://open.spotify.com/track/1234567890123456789012", "https://open.spotify.com/playlist/short", "not a url"]) {
    assert.equal(spotifyPlaylistUrl(invalid), null, invalid);
  }
});

test("delvis ugyldige reiseglede-data påvirker ikke gyldige minner eller andre turer", () => {
  const state = emptyAdventure();
  state.trips.push({ tripId: "trip-a", bingo: ["taste", "taste", "fake"], activity: "unknown", playlist: { title: "Unsafe", url: "javascript:alert(1)" }, memories: [{ id: "valid", text: "Et fint minne", date: "2026-10-21" }, { id: "bad", text: "Feil dato", date: "2026-02-31" }] });
  state.dreams.push({ id: "dream-a", name: "En drøm", imageId: "https://evil.test/img", type: "unknown" });
  const restored = restoreAdventure(JSON.stringify(state));
  assert.deepEqual(restored.trips[0].bingo, ["taste"]);
  assert.equal(restored.trips[0].playlist, null);
  assert.equal(restored.trips[0].activity, null);
  assert.equal(restored.trips[0].memories.length, 1);
  assert.equal(restored.dreams[0].imageId, null);
  assert.equal(restored.dreams[0].type, "city");
});

test("en drøm blir en uavhengig tur med riktig motiv og blanke avkryssinger", () => {
  const dream = starterAdventure().dreams[0];
  const before = structuredClone(dream);
  const trip = tripFromDream(dream, "new-trip");
  assert.equal(trip.name, dream.name);
  assert.equal(trip.type, dream.type);
  assert.equal(trip.imageId, dream.imageId);
  assert.equal(trip.departureDate, "");
  assert.equal(trip.isExample, false);
  assert.ok(trip.items.every(item => !item.packed));
  assert.ok(trip.preparation.every(task => !task.done));
  assert.deepEqual(dream, before);
});
