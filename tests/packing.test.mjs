import test from "node:test";
import assert from "node:assert/strict";
import { createTrip, addItem, restoreTrip, progress, validDays } from "../packing.js";

test("turtypene gir relevante lister med forskjellige ting", () => {
  const city = createTrip("city", 3);
  const mountain = createTrip("mountain", 3);
  const beach = createTrip("beach", 3);
  assert.ok(city.items.some(item => item.name === "Liten paraply"));
  assert.ok(mountain.items.some(item => item.name === "Kart og kompass"));
  assert.ok(beach.items.some(item => item.name === "Badetøy"));
  assert.ok(!mountain.items.some(item => item.name === "Badetøy"));
  for (const trip of [city, mountain, beach]) {
    assert.equal(new Set(trip.items.map(item => item.id)).size, trip.items.length);
  }
});

test("antall plagg følger varigheten og grenseverdier fungerer", () => {
  for (const days of [1, 3, 7, 30]) {
    const trip = createTrip("city", days);
    assert.equal(trip.items.find(item => item.id === "underwear").quantity, days);
    assert.equal(trip.items.find(item => item.id === "tops").quantity, Math.ceil(days / 2));
  }
  assert.ok(validDays("3"));
  for (const days of [0, -1, 31, 2.5, "", null, NaN, Infinity, "abc"]) {
    assert.equal(validDays(days), false);
    assert.throws(() => createTrip("city", days), RangeError);
  }
  assert.throws(() => createTrip("__proto__", 3), RangeError);
});

test("egne ting lagres, normaliseres og dubletter avvises", () => {
  const initial = createTrip("city", 3);
  const result = addItem(initial, "  En   god bok  ", "custom-book");
  assert.equal(result.trip.items.at(-1).name, "En god bok");
  assert.equal(result.trip.items.at(-1).category, "extra");
  assert.equal(initial.items.length + 1, result.trip.items.length);
  assert.ok(addItem(result.trip, "en god bok", "duplicate").error);
  assert.ok(addItem(initial, "   ", "blank").error);
  assert.ok(addItem(initial, "x".repeat(81), "long").error);
});

test("avkryssing og egne ting overlever lagring og gjenoppretting", () => {
  const original = addItem(createTrip("mountain", 7), "Kamera", "custom-camera").trip;
  original.items[0].packed = true;
  original.items.at(-1).packed = true;
  const restored = restoreTrip(JSON.stringify(original));
  assert.deepEqual(restored, original);
  assert.equal(progress(restored).packed, 2);
  const fresh = createTrip("mountain", 7);
  assert.equal(progress(fresh).packed, 0);
});

test("fremdrift er riktig for tom, delvis og ferdig liste", () => {
  const trip = createTrip("city", 3);
  assert.equal(progress(trip).percent, 0);
  trip.items[0].packed = true;
  assert.equal(progress(trip).packed, 1);
  trip.items.forEach(item => { item.packed = true; });
  assert.equal(progress(trip).percent, 100);
  assert.equal(progress(trip).remaining, 0);
  assert.deepEqual(progress({ items: [] }), { packed: 0, total: 0, remaining: 0, percent: 0 });
});

test("ugyldige eller gamle lagrede data avvises uten krasj", () => {
  for (const raw of [null, "", "{bad json", "[]", "null", '{"version":99}']) {
    assert.equal(restoreTrip(raw), null);
  }
  for (const mutate of [
    trip => { trip.type = "__proto__"; },
    trip => { trip.days = 31; },
    trip => { trip.items[0].quantity = -5; },
    trip => { trip.items[0].category = "__proto__"; },
    trip => { trip.items[0].packed = "true"; },
    trip => { trip.items[0].name = "x".repeat(81); },
    trip => { trip.items[0].id = '<script>'; },
    trip => { trip.items.push(trip.items[0]); }
  ]) {
    const value = createTrip();
    mutate(value);
    assert.equal(restoreTrip(JSON.stringify(value)), null);
  }
});
