import test from "node:test";
import assert from "node:assert/strict";
import {
  createTrip, addItem, progress, createExamples, createWorkspace,
  restoreWorkspace, isCalendarDate, osloToday, countdown, MAX_TRIPS
} from "../packing.js";

test("eksempelturene har datoer og uavhengig pakkefremdrift", () => {
  const [cabin, city, beach] = createExamples();
  assert.equal(cabin.departureDate, "2026-11-13");
  assert.equal(beach.departureDate, "2027-06-19");
  assert.equal(city.departureDate, "2027-04-16");
  assert.equal(city.isExample, true);
  assert.equal(progress(city).packed, 4);
  assert.equal(progress(city).total, 18);
  assert.equal(progress(cabin).total, 24);
  assert.equal(progress(cabin).packed, 8);
  assert.equal(progress(beach).packed, 3);
  cabin.items.forEach(item => { item.packed = true; });
  assert.equal(progress(beach).packed, 3);
  assert.equal(progress(createExamples()[0]).packed, 8);
});

test("kalenderdatoer valideres, inkludert skuddår", () => {
  for (const date of ["2000-02-29", "2026-11-13", "2028-02-29", "2100-12-31"]) {
    assert.ok(isCalendarDate(date), date);
  }
  for (const date of ["", null, "2027-02-29", "2100-02-29", "2026-13-01", "2026-04-31", "2026-1-01", "1999-12-31", "2101-01-01"]) {
    assert.equal(isCalendarDate(date), false, String(date));
  }
});

test("nedtellingen dekker før avreise, avreisedagen, på tur og passert dato", () => {
  assert.equal(countdown("2026-11-13", 3, "2026-10-20").number, 24);
  assert.equal(countdown("2027-06-19", 10, "2026-10-20").number, 242);
  assert.equal(countdown("2026-11-13", 3, "2026-11-12").label, "dag igjen");
  assert.equal(countdown("2026-11-13", 3, "2026-11-13").label, "I dag!");
  assert.equal(countdown("2026-11-13", 3, "2026-11-14").detail, "Dag 2 av 3");
  assert.equal(countdown("2026-11-13", 3, "2026-11-15").label, "På tur");
  assert.equal(countdown("2026-11-13", 3, "2026-11-16").label, "Dato passert");
  assert.equal(countdown("", 3, "2026-10-20").label, "Dato kommer");
});

test("nedtellingen bruker Oslo-dato og tåler overgang til sommer- og vintertid", () => {
  assert.equal(osloToday(new Date("2026-10-20T22:30:00Z")), "2026-10-21");
  assert.equal(osloToday(new Date("2026-12-20T23:30:00Z")), "2026-12-21");
  assert.equal(countdown("2026-03-30", 3, "2026-03-28").number, 2);
  assert.equal(countdown("2026-10-26", 3, "2026-10-24").number, 2);
});

test("oppgradering bevarer tidligere avkryssing og egne tillegg", () => {
  const oldTrip = addItem(createTrip("city", 5), "Kamera", "camera").trip;
  oldTrip.items[0].packed = true;
  const oldRaw = JSON.stringify(oldTrip);
  const workspace = createWorkspace(oldRaw);
  assert.equal(workspace.trips.length, 4);
  const migrated = workspace.trips.find(trip => trip.id === workspace.activeTripId);
  assert.deepEqual(migrated.items, oldTrip.items);
  assert.equal(migrated.days, 5);
  assert.equal(migrated.name, "Min tidligere pakkeliste");
  assert.equal(JSON.stringify(oldTrip), oldRaw);
  assert.equal(createWorkspace(JSON.stringify(createTrip())).trips.length, 3);
});

test("flere turer og valgt tur overlever lagring og gjenoppretting", () => {
  const workspace = createWorkspace();
  const beach = workspace.trips.find(t => t.id === "example-beach");
  workspace.activeTripId = beach.id;
  beach.items[0].packed = true;
  beach.name = "Min sommerferie";
  beach.departureDate = "2027-07-02";
  beach.isExample = false;
  const restored = restoreWorkspace(JSON.stringify(workspace));
  assert.deepEqual(restored, workspace);
  assert.equal(progress(restored.trips[0]).packed, 8);
  assert.equal(progress(restored.trips.find(t => t.id === beach.id)).packed, 4);
});

test("tredje eksempeltur legges til en gang uten å miste eksisterende innhold", () => {
  const old = createWorkspace();
  delete old.exampleSetVersion;
  old.trips = old.trips.filter(t => t.id !== "example-city");
  old.activeTripId = "example-beach";
  old.trips[0] = addItem(old.trips[0], "Eget kamera", "my-camera").trip;
  old.trips[0].items[0].quantity = 7;
  old.trips[0].items[0].quantityEdited = true;
  old.trips[1].preparation[0].done = true;
  const original = JSON.stringify(old);
  const restored = restoreWorkspace(original);
  assert.deepEqual(restored.trips.map(t => t.id), ["example-cabin", "example-city", "example-beach"]);
  assert.deepEqual(restored.trips.filter(t => t.id !== "example-city"), old.trips);
  assert.equal(restored.activeTripId, old.activeTripId);
  assert.equal(JSON.stringify(old), original);
  assert.deepEqual(restoreWorkspace(JSON.stringify(restored)), restored);
  restored.trips = restored.trips.filter(t => t.id !== "example-city");
  assert.equal(restoreWorkspace(JSON.stringify(restored)).trips.length, 2);
});

test("nye eksempler respekterer fjernede eksempler og fulle turarkiv", () => {
  const old = createWorkspace();
  delete old.exampleSetVersion;
  old.trips = old.trips.filter(t => t.id !== "example-city");
  const own = { ...old, trips: old.trips.map(t => ({ ...t, isExample: false })) };
  assert.equal(restoreWorkspace(JSON.stringify(own)).trips.length, 2);
  const removed = { ...old, trips: [old.trips[0]] };
  assert.equal(restoreWorkspace(JSON.stringify(removed)).trips.length, 1);
  while (old.trips.length < MAX_TRIPS) old.trips.push({ ...old.trips[0], id: `own-${old.trips.length}`, isExample: false });
  assert.equal(restoreWorkspace(JSON.stringify(old)).trips.length, MAX_TRIPS);
  const alreadyHasCity = { ...old, trips: createExamples() };
  assert.equal(restoreWorkspace(JSON.stringify(alreadyHasCity)).trips.length, 3);
});

test("ugyldige turarkiv avvises uten krasj", () => {
  for (const raw of [null, "", "{broken", "null", "[]"]) {
    assert.equal(restoreWorkspace(raw), null);
  }
  for (const mutate of [
    workspace => { workspace.version = 99; },
    workspace => { workspace.trips = []; },
    workspace => { workspace.trips.push(workspace.trips[0]); },
    workspace => { workspace.activeTripId = "missing"; },
    workspace => { delete workspace.trips[0].id; },
    workspace => { workspace.trips[0].name = " "; },
    workspace => { workspace.trips[0].departureDate = "2027-02-29"; },
    workspace => { workspace.trips[0].isExample = "true"; }
  ]) {
    const workspace = createWorkspace();
    mutate(workspace);
    assert.equal(restoreWorkspace(JSON.stringify(workspace)), null);
  }
});
