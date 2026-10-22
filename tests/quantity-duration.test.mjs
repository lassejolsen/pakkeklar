import test from "node:test";
import assert from "node:assert/strict";
import {
  createTrip, createWorkspace, addItem, updateTripDays, setItemQuantity,
  restoreTrip, restoreWorkspace, copyTrip, validQuantity
} from "../packing.js";

const item = (trip, id) => trip.items.find(entry => entry.id === id);

test("ny varighet beholder egne tillegg, fjerninger, forberedelser og turdetaljer", () => {
  let source = createWorkspace().trips[0];
  source = addItem(source, "Kamerabatterier", "camera").trip;
  source = setItemQuantity(source, "camera", 2).trip;
  item(source, "camera").packed = true;
  source.items = source.items.filter(entry => entry.id !== "deodorant");
  source.preparation[0].done = true;
  const before = structuredClone(source);
  const updated = updateTripDays(source, 7);
  assert.equal(updated.days, 7);
  assert.deepEqual(updated.items.map(entry => entry.id), source.items.map(entry => entry.id));
  assert.deepEqual(item(updated, "camera"), item(source, "camera"));
  assert.equal(item(updated, "deodorant"), undefined);
  assert.deepEqual(updated.preparation, source.preparation);
  for (const key of ["id", "name", "departureDate", "isExample"]) assert.equal(updated[key], source[key]);
  assert.deepEqual(source, before);
  updated.preparation[0].done = false;
  assert.equal(source.preparation[0].done, true);
});

test("bare økt antall gjør et pakket punkt gjenstående igjen", () => {
  const source = createTrip("city", 3);
  source.items.forEach(entry => { entry.packed = true; });
  const longer = updateTripDays(source, 7);
  assert.equal(item(longer, "tops").quantity, 4);
  assert.equal(item(longer, "tops").packed, false);
  assert.equal(item(longer, "phone").packed, true);
  assert.equal(item(source, "tops").packed, true);
  const shorter = updateTripDays(source, 1);
  assert.equal(item(shorter, "tops").quantity, 1);
  assert.ok(shorter.items.every(entry => entry.packed));
  assert.equal(setItemQuantity(source, "tops", 3).needsRepacking, true);
  assert.equal(setItemQuantity(source, "tops", 1).needsRepacking, false);
  assert.equal(item(setItemQuantity(source, "tops", 1).trip, "tops").packed, true);
});

test("bevisst valgt antall beholdes også når det var likt det gamle forslaget", () => {
  let trip = setItemQuantity(createTrip("city", 3), "tops", 2).trip;
  item(trip, "tops").packed = true;
  for (let days = 1; days <= 30; days++) {
    trip = updateTripDays(trip, days);
    assert.equal(item(trip, "tops").quantity, 2);
    assert.equal(item(trip, "tops").quantityEdited, true);
    assert.equal(item(trip, "tops").packed, true);
  }
});

test("bruk forslag gjenopptar automatisk beregning og egne ting har ingen mal", () => {
  let trip = setItemQuantity(createTrip("city", 7), "tops", 2).trip;
  item(trip, "tops").packed = true;
  const result = setItemQuantity(trip, "tops", "", { useSuggestion: true });
  assert.equal(result.needsRepacking, true);
  assert.equal(item(result.trip, "tops").quantity, 4);
  assert.equal(item(result.trip, "tops").quantityEdited, false);
  assert.equal(item(updateTripDays(result.trip, 10), "tops").quantity, 5);
  trip = addItem(trip, "Kamera", "camera").trip;
  assert.ok(setItemQuantity(trip, "camera", 1, { useSuggestion: true }).error);
});

test("antall tillater hele tall fra 1 til 99 og avviser ugyldige endringer", () => {
  const trip = createTrip();
  const before = structuredClone(trip);
  for (const value of [1, "3", 99]) {
    assert.equal(validQuantity(value), true);
    assert.equal(item(setItemQuantity(trip, "tops", value).trip, "tops").quantity, Number(value));
  }
  for (const value of [0, -1, 100, 1.5, "", "abc", Infinity, NaN]) {
    assert.equal(validQuantity(value), false);
    assert.ok(setItemQuantity(trip, "tops", value).error);
  }
  assert.ok(setItemQuantity(trip, "unknown", 2).error);
  for (const days of [0, 31, 1.5, "abc"]) assert.throws(() => updateTripDays(trip, days), RangeError);
  assert.deepEqual(trip, before);
});

test("antall og manuelle valg følger lagring og uavhengige kopier", () => {
  const workspace = createWorkspace();
  workspace.trips[0] = setItemQuantity(workspace.trips[0], "underwear", 99).trip;
  item(workspace.trips[0], "underwear").packed = true;
  const restored = restoreWorkspace(JSON.stringify(workspace));
  assert.deepEqual(restored, workspace);
  const copy = copyTrip(restored.trips[0], { id: "quantity-copy" });
  assert.equal(item(copy, "underwear").quantity, 99);
  assert.equal(item(copy, "underwear").quantityEdited, true);
  assert.equal(item(copy, "underwear").packed, false);
  const changedCopy = updateTripDays(setItemQuantity(copy, "underwear", 4).trip, 10);
  assert.equal(item(changedCopy, "underwear").quantity, 4);
  assert.equal(item(workspace.trips[0], "underwear").quantity, 99);
  assert.equal(item(workspace.trips[0], "underwear").packed, true);
});

test("gamle lagrede antall bevares, mens ugyldige felt avvises", () => {
  const legacy = createTrip("mountain", 3);
  legacy.items.forEach(entry => { delete entry.quantityEdited; });
  legacy.items[0].packed = true;
  const restored = restoreTrip(JSON.stringify(legacy));
  assert.equal(restored.items[0].packed, true);
  assert.equal(restored.items[0].quantity, 3);
  assert.ok(restored.items.every(entry => entry.quantityEdited === false));
  for (const patch of [{ quantityEdited: "true" }, { quantity: 100 }, { quantity: 1.5 }]) {
    const invalid = structuredClone(legacy);
    Object.assign(invalid.items[0], patch);
    assert.equal(restoreTrip(JSON.stringify(invalid)), null);
  }
});
