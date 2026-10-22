import test from "node:test";
import assert from "node:assert/strict";
import { WORKSPACE_KEY, STORAGE_KEY, createWorkspace, createEmptyWorkspace, restoreWorkspace, addItem } from "../packing.js";
import { ADVENTURE_KEY, starterAdventure, emptyAdventure, restoreAdventure } from "../adventure-data.js";
import { RESET_BACKUP_KEY, resetLocalData, undoLocalReset, readResetBackup } from "../settings-data.js";

class Storage {
  constructor(entries) { this.values = new Map(entries); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.fail(key); this.values.set(key, value); }
  removeItem(key) { this.fail(key); this.values.delete(key); }
  fail(key) { if (this.failOnce === key) { this.failOnce = null; throw new Error("Storage unavailable"); } }
}
function personalData() {
  const workspace = createWorkspace();
  workspace.trips[0] = addItem(workspace.trips[0], "Mitt kamera", "camera").trip;
  workspace.trips[0].items[0].quantity = 9;
  workspace.trips[0].items[0].quantityEdited = true;
  workspace.activeTripId = "example-beach";
  const adventure = starterAdventure();
  adventure.trips.push({ tripId: "example-beach", bingo: ["taste"], activity: "picnic", playlist: null, memories: [{ id: "memory-1", text: "Kakao på hytta", date: "2026-10-10" }] });
  adventure.stamps.push({ id: "stamp-1", tripId: null, name: "En tidligere tur", type: "city", date: "2026-08-01" });
  return new Storage([
    [WORKSPACE_KEY, JSON.stringify(workspace)], [ADVENTURE_KEY, JSON.stringify(adventure)],
    [STORAGE_KEY, "old local list"], ["unrelated", "do not touch"]
  ]);
}

test("et bevisst tomt turarkiv overlever omlasting uten eksempler", () => {
  const empty = createEmptyWorkspace();
  assert.deepEqual(restoreWorkspace(JSON.stringify(empty)), empty);
  assert.deepEqual(restoreAdventure(JSON.stringify(emptyAdventure())), emptyAdventure());
  assert.equal(restoreWorkspace(JSON.stringify({ ...empty, activeTripId: "missing" })), null);
  assert.equal(restoreWorkspace(JSON.stringify({ ...empty, exampleSetVersion: 0 })), null);
});

test("tom start rydder bare appens aktive innhold og beholder en angremulighet", () => {
  const storage = personalData();
  const before = storage.getItem(WORKSPACE_KEY);
  resetLocalData(storage, "empty");
  assert.deepEqual(restoreWorkspace(storage.getItem(WORKSPACE_KEY)), createEmptyWorkspace());
  assert.deepEqual(restoreAdventure(storage.getItem(ADVENTURE_KEY)), emptyAdventure());
  assert.equal(storage.getItem(STORAGE_KEY), null);
  assert.equal(storage.getItem("unrelated"), "do not touch");
  assert.equal(readResetBackup(storage).data[WORKSPACE_KEY], before);
});

test("eksempelvalget gjenoppretter de opprinnelige pakkestatusene og drømmene", () => {
  const storage = personalData();
  resetLocalData(storage, "examples");
  assert.deepEqual(restoreWorkspace(storage.getItem(WORKSPACE_KEY)), createWorkspace());
  assert.deepEqual(restoreAdventure(storage.getItem(ADVENTURE_KEY)), starterAdventure());
});

test("angre etter en ny økt gjenoppretter turer, egne antall, aktiv tur og minner samlet", () => {
  const storage = personalData();
  const before = new Map(storage.values);
  resetLocalData(storage, "empty");
  const reloaded = new Storage(storage.values);
  undoLocalReset(reloaded);
  assert.deepEqual(reloaded.values, before);
  assert.equal(readResetBackup(reloaded), null);
});

test("lagringsfeil midt i byttet ruller tilbake alle endringer og forrige sikkerhetskopi", () => {
  for (const key of [RESET_BACKUP_KEY, WORKSPACE_KEY, ADVENTURE_KEY, STORAGE_KEY]) {
    const storage = personalData();
    resetLocalData(storage, "examples");
    const before = new Map(storage.values);
    storage.failOnce = key;
    assert.throws(() => resetLocalData(storage, "empty"), /Innholdet ditt er beholdt/);
    assert.deepEqual(storage.values, before);
  }
});

test("en mislykket angreoperasjon beholder dagens data og muligheten til å prøve igjen", () => {
  const storage = personalData();
  resetLocalData(storage, "empty");
  const before = new Map(storage.values);
  storage.failOnce = ADVENTURE_KEY;
  assert.throws(() => undoLocalReset(storage));
  assert.deepEqual(storage.values, before);
  undoLocalReset(storage);
  assert.equal(restoreWorkspace(storage.getItem(WORKSPACE_KEY)).activeTripId, "example-beach");
});

test("ugyldige valg og sikkerhetskopier endrer ikke lagret innhold", () => {
  const storage = personalData();
  const before = new Map(storage.values);
  assert.throws(() => resetLocalData(storage, "unknown"));
  assert.deepEqual(storage.values, before);
  storage.setItem(RESET_BACKUP_KEY, JSON.stringify({ version: 1, data: { [WORKSPACE_KEY]: "broken" } }));
  const corrupt = new Map(storage.values);
  assert.equal(readResetBackup(storage), null);
  assert.throws(() => undoLocalReset(storage));
  assert.deepEqual(storage.values, corrupt);
});
