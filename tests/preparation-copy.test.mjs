import test from "node:test";
import assert from "node:assert/strict";
import {
  createTrip, createWorkspace, restoreWorkspace, restoreTrip, addItem,
  copyTrip, copyName, preparationProgress, progress
} from "../packing.js";

test("forberedelser passer turtypen og påvirker ikke pakkefremdrift", () => {
  const mountain = createTrip("mountain");
  const beach = createTrip("beach");
  assert.ok(mountain.preparation.some(task => task.id === "offline-map"));
  assert.ok(beach.preparation.some(task => task.id === "tickets"));
  assert.equal(mountain.preparation.some(task => task.id === "tickets"), false);
  const packed = progress(mountain);
  assert.deepEqual(preparationProgress(mountain), { done: 0, total: 5 });
  mountain.preparation[0].done = true;
  assert.deepEqual(preparationProgress(mountain), { done: 1, total: 5 });
  assert.deepEqual(progress(mountain), packed);
  assert.equal(preparationProgress(beach).done, 0);
  mountain.preparation.forEach(task => { task.done = true; });
  assert.deepEqual(preparationProgress(mountain), { done: 5, total: 5 });
});

test("gamle turer oppgraderes uten å miste egne ting eller avkryssinger", () => {
  const workspace = createWorkspace();
  workspace.trips.forEach(trip => { delete trip.preparation; });
  workspace.trips[0] = addItem(workspace.trips[0], "Kamera", "camera").trip;
  const restored = restoreWorkspace(JSON.stringify(workspace));
  assert.equal(restored.activeTripId, workspace.activeTripId);
  for (let i = 0; i < workspace.trips.length; i++) {
    assert.deepEqual(restored.trips[i].items, workspace.trips[i].items);
    assert.deepEqual(preparationProgress(restored.trips[i]), { done: 0, total: 5 });
  }
});

test("forberedelser lagres per tur og gjenopprettes", () => {
  const workspace = createWorkspace();
  workspace.trips[0].preparation[0].done = true;
  workspace.trips[1].preparation[1].done = true;
  const restored = restoreWorkspace(JSON.stringify(workspace));
  assert.deepEqual(restored, workspace);
  restored.trips[0].preparation[0].done = false;
  assert.equal(workspace.trips[0].preparation[0].done, true);
  assert.equal(restored.trips[1].preparation[1].done, true);
});

test("kopien beholder egne tillegg, fjerninger og mengder, med nullstilt fremdrift", () => {
  let source = createWorkspace().trips[0];
  source = addItem(source, "Kamera", "camera").trip;
  source.items = source.items.filter(item => item.id !== "deodorant");
  source.items.at(-1).packed = true;
  source.preparation[0].done = true;
  const before = structuredClone(source);
  const copy = copyTrip(source, { id: "copy-trip", name: "  Påske   på hytta  ", departureDate: "2027-03-25" });
  assert.equal(copy.name, "Påske på hytta");
  assert.equal(copy.departureDate, "2027-03-25");
  assert.equal(copy.isExample, false);
  assert.equal(copy.type, source.type);
  assert.equal(copy.days, source.days);
  assert.deepEqual(copy.items, source.items.map(item => ({ ...item, packed: false })));
  assert.deepEqual(copy.preparation, source.preparation.map(task => ({ ...task, done: false })));
  assert.deepEqual(source, before);
  copy.items[0].packed = true;
  copy.items.at(-1).name = "Et annet kamera";
  copy.preparation[1].done = true;
  assert.deepEqual(source, before);
  const workspace = { version: 2, exampleSetVersion: 2, activeTripId: copy.id, trips: [source, copy] };
  assert.deepEqual(restoreWorkspace(JSON.stringify(workspace)), workspace);
});

test("kopien får nytt standardnavn og venter på ny avreisedato", () => {
  const source = createWorkspace().trips[0];
  const copy = copyTrip(source, { id: "copy-trip" });
  assert.equal(copy.name, "Hyttehelg på fjellet (kopi)");
  assert.equal(copy.departureDate, "");
  assert.equal(copyName("x".repeat(80)).length, 80);
  source.name = "x".repeat(80);
  assert.ok(copyTrip(source, { id: "long-name-copy" }));
});

test("kopiering avviser ugyldig dato, navn og gjenbruk av tur-ID", () => {
  const source = createWorkspace().trips[0];
  for (const details of [
    { id: source.id }, { id: "<invalid>" }, {},
    { id: "copy", name: " " }, { id: "copy", name: "x".repeat(81) },
    { id: "copy", departureDate: "2027-02-29" }
  ]) assert.throws(() => copyTrip(source, details), TypeError);
});

test("ugyldige forberedelser avvises uten krasj", () => {
  for (const mutate of [
    trip => { trip.preparation = null; },
    trip => { trip.preparation.pop(); },
    trip => { trip.preparation[0].done = "true"; },
    trip => { trip.preparation[0].id = "unknown"; },
    trip => { trip.preparation[1] = trip.preparation[0]; }
  ]) {
    const trip = createTrip();
    mutate(trip);
    assert.equal(restoreTrip(JSON.stringify(trip)), null);
  }
});
