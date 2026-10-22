import test from "node:test";
import assert from "node:assert/strict";
import {
  createTrip, createWorkspace, addItem, setItemQuantity, changeTripType,
  tripChangeSummary, sameTripDetails, restoreTrip, restoreWorkspace, copyTrip
} from "../packing.js";
import { TRIP_IMAGES, tripImage } from "../trip-images.js";

const item = (trip, id) => trip.items.find(entry => entry.id === id);

test("turtypebytte bevarer egne ting, felles ting, manuelle antall og felles fjerninger", () => {
  let source = createWorkspace().trips[0];
  source = addItem(source, "Kamera", "camera").trip;
  source = setItemQuantity(source, "underwear", 6).trip;
  source = setItemQuantity(source, "camera", 2).trip;
  item(source, "underwear").packed = true;
  item(source, "camera").packed = true;
  source.items = source.items.filter(entry => entry.id !== "deodorant");
  source.imageId = "winter";
  const before = structuredClone(source);
  const beach = changeTripType(source, "beach", 7);
  assert.deepEqual(item(beach, "camera"), item(source, "camera"));
  assert.equal(item(beach, "underwear").quantity, 6);
  assert.equal(item(beach, "underwear").packed, true);
  assert.equal(item(beach, "deodorant"), undefined);
  assert.equal(item(beach, "boots"), undefined);
  assert.equal(item(beach, "swimwear").packed, false);
  assert.equal(item(beach, "bottle").packed, true);
  assert.equal(item(beach, "bottle").category, "beach");
  for (const key of ["name", "id", "departureDate", "imageId"]) assert.equal(beach[key], source[key]);
  assert.deepEqual(source, before);
  assert.deepEqual(restoreTrip(JSON.stringify(beach)), beach);
});

test("felles automatiske mengder som øker blir gjenstående; nye plagg arver ikke avkryssing", () => {
  const source = createTrip("city", 3);
  source.items.forEach(entry => { entry.packed = true; });
  const mountain = changeTripType(source, "mountain", 7);
  assert.equal(item(mountain, "underwear").quantity, 7);
  assert.equal(item(mountain, "underwear").packed, false);
  assert.equal(item(mountain, "phone").packed, true);
  assert.equal(item(mountain, "socks").name, "Tursokker");
  assert.equal(item(mountain, "socks").packed, false);
  assert.equal(item(mountain, "trousers").packed, false);
});

test("felles forberedelser beholdes, nye forberedelser starter urørt", () => {
  const source = createTrip("mountain");
  source.preparation.forEach(task => { task.done = true; });
  const beach = changeTripType(source, "beach");
  for (const id of ["charge", "weather", "home"]) assert.equal(beach.preparation.find(task => task.id === id).done, true);
  for (const id of ["documents", "tickets"]) assert.equal(beach.preparation.find(task => task.id === id).done, false);
  beach.preparation[0].done = false;
  assert.equal(source.preparation[0].done, true);
});

test("forhåndsvisningen viser faktiske tillegg, fjerninger og gjenstående punkter", () => {
  const source = createTrip("city", 3);
  item(source, "underwear").packed = true;
  const mountain = changeTripType(source, "mountain", 7);
  const preview = tripChangeSummary(source, mountain);
  assert.ok(preview.added.some(entry => entry.name === "Tursokker"));
  assert.ok(preview.removed.some(entry => entry.name === "Sokker"));
  assert.ok(preview.kept.some(entry => entry.id === "phone"));
  assert.deepEqual(preview.reopened.map(entry => entry.id), ["underwear"]);
  assert.equal(preview.kept.length + preview.added.length, mountain.items.length);
  assert.equal(preview.kept.length + preview.removed.length, source.items.length);
});

test("turtypebytte nekter å overskride listegrensen uten å endre kilden", () => {
  let source = createTrip("city");
  while (source.items.length < 200) source = addItem(source, `Egen ting ${source.items.length}`, `custom-${source.items.length}`).trip;
  const before = structuredClone(source);
  assert.throws(() => changeTripType(source, "mountain"), /200/);
  assert.deepEqual(source, before);
});

test("alle bildevalg følger lagring og kopiering, mens eldre data får automatisk bilde", () => {
  for (const image of TRIP_IMAGES) {
    const workspace = createWorkspace();
    workspace.trips[0].imageId = image.id;
    const restored = restoreWorkspace(JSON.stringify(workspace));
    assert.equal(restored.trips[0].imageId, image.id);
    assert.equal(copyTrip(restored.trips[0], { id: "image-copy" }).imageId, image.id);
    assert.equal(tripImage("mountain", image.id).src, image.src);
  }
  const legacy = createWorkspace();
  delete legacy.trips[0].imageId;
  const restored = restoreWorkspace(JSON.stringify(legacy));
  assert.equal(restored.trips[0].imageId, null);
  assert.equal(tripImage(restored.trips[0].type).id, "fjord");
  assert.deepEqual(restored.trips[0].items, legacy.trips[0].items);
});

test("ukjente bildeverdier blir aldri brukt som nettadresser", () => {
  for (const value of ["https://example.com/a.jpg", "../../secret", {}, 3]) {
    const source = { ...createTrip("city"), imageId: value };
    assert.equal(restoreTrip(JSON.stringify(source)).imageId, null);
    assert.equal(tripImage("city", value).id, "city");
  }
});

test("ulagrede detaljer sammenlignes på navn, dato, dager, turtype og bilde", () => {
  const source = createWorkspace().trips[0];
  assert.equal(sameTripDetails(source, { ...source, days: String(source.days), name: ` ${source.name} ` }), true);
  for (const change of [{ name: "Ny tur" }, { days: 9 }, { departureDate: "2027-01-10" }, { type: "city" }, { imageId: "winter" }]) {
    assert.equal(sameTripDetails(source, { ...source, ...change }), false);
  }
  assert.equal(sameTripDetails(source, { ...source, items: [] }), true);
});
