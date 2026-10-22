import { WORKSPACE_KEY, STORAGE_KEY, createWorkspace, createEmptyWorkspace, restoreWorkspace } from "./packing.js";
import { ADVENTURE_KEY, emptyAdventure, starterAdventure, restoreAdventure } from "./adventure-data.js";

export const RESET_BACKUP_KEY = "pakkeklar.reset-backup.v1";
const DATA_KEYS = [WORKSPACE_KEY, ADVENTURE_KEY, STORAGE_KEY];
const snapshot = storage => Object.fromEntries(DATA_KEYS.map(key => [key, storage.getItem(key)]));

export function readResetBackup(storage) {
  try {
    const backup = JSON.parse(storage.getItem(RESET_BACKUP_KEY));
    if (backup?.version !== 1 || !backup.data || !DATA_KEYS.every(key =>
      Object.hasOwn(backup.data, key) && (backup.data[key] === null || typeof backup.data[key] === "string"))) return null;
    if (backup.data[WORKSPACE_KEY] !== null && !restoreWorkspace(backup.data[WORKSPACE_KEY])) return null;
    if (backup.data[ADVENTURE_KEY] !== null && !restoreAdventure(backup.data[ADVENTURE_KEY])) return null;
    return { version: 1, data: Object.fromEntries(DATA_KEYS.map(key => [key, backup.data[key]])) };
  } catch { return null; }
}

function write(storage, key, value) {
  if (value === null) storage.removeItem(key);
  else storage.setItem(key, value);
}

// A failed write must not leave packing data and memories from different resets.
function transaction(storage, entries) {
  const before = entries.map(([key]) => [key, storage.getItem(key)]);
  const changed = [];
  try {
    for (const [key, value] of entries) {
      write(storage, key, value);
      changed.push(key);
    }
  } catch (cause) {
    let restored = true;
    for (const [key, value] of before.reverse()) {
      if (!changed.includes(key)) continue;
      if (key === RESET_BACKUP_KEY && !restored) continue;
      try { write(storage, key, value); } catch { restored = false; }
    }
    throw new Error(restored
      ? "Nettleseren kunne ikke lagre byttet. Innholdet ditt er beholdt."
      : "Nettleseren kunne ikke fullføre byttet. Behold siden åpen; sikkerhetskopien kan brukes når lagring virker igjen.", { cause });
  }
}

export function resetLocalData(storage, mode) {
  if (!["examples", "empty"].includes(mode)) throw new RangeError("Ukjent startvalg.");
  const data = snapshot(storage);
  const workspace = mode === "examples" ? createWorkspace() : createEmptyWorkspace();
  const adventure = mode === "examples" ? starterAdventure() : emptyAdventure();
  transaction(storage, [
    [RESET_BACKUP_KEY, JSON.stringify({ version: 1, data })],
    [WORKSPACE_KEY, JSON.stringify(workspace)],
    [ADVENTURE_KEY, JSON.stringify(adventure)],
    [STORAGE_KEY, null]
  ]);
}

export function undoLocalReset(storage) {
  const backup = readResetBackup(storage);
  if (!backup) throw new Error("Det finnes ikke et tidligere bytte å angre.");
  transaction(storage, [...DATA_KEYS.map(key => [key, backup.data[key]]), [RESET_BACKUP_KEY, null]]);
}
