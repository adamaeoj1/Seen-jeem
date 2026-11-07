export const MAX_FREE_HOST_GAMES = 2;

const LOCAL_TRIAL_STORAGE_KEY = "qadha_device_trial_state_v1";
const IDB_DB_NAME = "QadhaDeviceSecurityDB";
const IDB_STORE_NAME = "device_trials";
const IDB_RECORD_KEY = "primary_device_trial";
const HALL_OF_FAME_STORAGE_KEY = "qadha_hall_of_fame_v1";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export interface DeviceTrialState {
  deviceFingerprint: string;
  freeGamesUsed: number;
  usedRoomCodes: string[];
  updatedAt: number;
}

export interface HallOfFameMatchRecord {
  id: string;
  roomCode: string;
  winnerTeamName: string;
  winnerScore: number;
  runnerUpTeamName: string;
  runnerUpScore: number;
  mvpPlayerName?: string;
  edition?: string;
  playedAt: number;
}

let cachedFingerprint: string | null = null;
let memoryTrialCache: DeviceTrialState | null = null;

/**
 * Computes a deterministic FNV-1a + DJB2 64-bit hex hash of a fingerprint string.
 */
function hashString64(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 5381;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = ((h2 << 5) + h2) ^ ch;
    h2 = h2 >>> 0;
  }
  return (
    "QFP-" +
    h1.toString(16).toUpperCase().padStart(8, "0") +
    "-" +
    h2.toString(16).toUpperCase().padStart(8, "0")
  );
}

/**
 * Generates a deterministic hardware/browser fingerprint combining:
 * 1. Canvas 2D rendering signature
 * 2. WebGL unmasked vendor & renderer string
 * 3. Screen resolution, color depth & pixel ratio
 * 4. Timezone & hardwareConcurrency
 */
export function getDeviceFingerprint(): string {
  if (cachedFingerprint) return cachedFingerprint;
  if (typeof window === "undefined") return "QFP-SERVER-DEFAULT";

  const components: string[] = [];

  try {
    const nav = window.navigator;
    components.push(
      `hc:${nav.hardwareConcurrency || 4}`,
      `dm:${(nav as unknown as { deviceMemory?: number }).deviceMemory || 0}`,
      `pl:${nav.platform || "unknown"}`,
      `mtp:${nav.maxTouchPoints || 0}`
    );
  } catch {
    components.push("nav:err");
  }

  try {
    const scr = window.screen;
    components.push(
      `res:${scr.width}x${scr.height}x${scr.colorDepth}`,
      `avail:${scr.availWidth}x${scr.availHeight}`,
      `dpr:${window.devicePixelRatio || 1}`
    );
  } catch {
    components.push("scr:err");
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    components.push(`tz:${tz}`);
  } catch {
    components.push("tz:utc");
  }

  // Canvas 2D rendering fingerprint
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 220;
    canvas.height = 48;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#F4D03F";
      ctx.fillRect(10, 4, 80, 28);
      ctx.fillStyle = "#3B66B4";
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.fillText("QADHA-FP-2026-قَدْهَا؟", 8, 24);
      ctx.strokeStyle = "#E65C2E";
      ctx.arc(160, 24, 14, 0, Math.PI * 1.65);
      ctx.stroke();
      components.push(`cvs:${canvas.toDataURL().slice(-64)}`);
    }
  } catch {
    components.push("cvs:err");
  }

  // WebGL GPU renderer fingerprint
  try {
    const glCanvas = document.createElement("canvas");
    const gl =
      glCanvas.getContext("webgl") ||
      (glCanvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      const vendor = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR);
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);
      components.push(`gl:${vendor}::${renderer}`);
    }
  } catch {
    components.push("gl:err");
  }

  cachedFingerprint = hashString64(components.join("|"));
  return cachedFingerprint;
}

// ============================================================================
// LAYER 1: LOCALSTORAGE + INDEXEDDB PERSISTENCE
// ============================================================================

function readTrialFromLocalStorage(): DeviceTrialState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(LOCAL_TRIAL_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DeviceTrialState>;
    if (typeof parsed.freeGamesUsed !== "number") return null;
    return {
      deviceFingerprint: parsed.deviceFingerprint || getDeviceFingerprint(),
      freeGamesUsed: Math.max(0, parsed.freeGamesUsed),
      usedRoomCodes: Array.isArray(parsed.usedRoomCodes)
        ? parsed.usedRoomCodes
        : [],
      updatedAt: parsed.updatedAt || Date.now(),
    };
  } catch {
    return null;
  }
}

function writeTrialToLocalStorage(state: DeviceTrialState): void {
  memoryTrialCache = state;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_TRIAL_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

function openDeviceSecurityIdb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function readTrialFromIndexedDb(): Promise<DeviceTrialState | null> {
  const db = await openDeviceSecurityIdb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_NAME, "readonly");
      const store = tx.objectStore(IDB_STORE_NAME);
      const getReq = store.get(IDB_RECORD_KEY);
      getReq.onsuccess = () => {
        const res = getReq.result as DeviceTrialState | undefined;
        resolve(res && typeof res.freeGamesUsed === "number" ? res : null);
      };
      getReq.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeTrialToIndexedDb(state: DeviceTrialState): Promise<void> {
  const db = await openDeviceSecurityIdb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_NAME, "readwrite");
      const store = tx.objectStore(IDB_STORE_NAME);
      store.put(state, IDB_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

// ============================================================================
// LAYER 2 & 3: SUPABASE `device_trials` & `profiles` SYNC
// ============================================================================

async function fetchRemoteDeviceTrial(
  fingerprint: string
): Promise<DeviceTrialState | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/device_trials?device_fingerprint=eq.${encodeURIComponent(
        fingerprint
      )}&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    const row = rows?.[0];
    if (!row) return null;
    return {
      deviceFingerprint: fingerprint,
      freeGamesUsed: Number(row.free_games_used ?? 0),
      usedRoomCodes: Array.isArray(row.used_room_codes)
        ? row.used_room_codes
        : [],
      updatedAt: Date.now(),
    };
  } catch {
    return null;
  }
}

async function upsertRemoteDeviceTrial(state: DeviceTrialState): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return;
  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/device_trials?on_conflict=device_fingerprint`,
      {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({
          device_fingerprint: state.deviceFingerprint,
          free_games_used: state.freeGamesUsed,
          used_room_codes: state.usedRoomCodes,
          updated_at: new Date().toISOString(),
        }),
      }
    );
  } catch {
    // Ignore if table not migrated yet
  }
}

/**
 * Merges multiple `DeviceTrialState` sources by taking the highest `freeGamesUsed`
 * and union of `usedRoomCodes` so clearing one layer or switching accounts never resets the quota.
 */
function mergeTrialStates(
  ...states: Array<DeviceTrialState | null | undefined>
): DeviceTrialState {
  const fp = getDeviceFingerprint();
  const codeSet = new Set<string>();
  let maxUsed = 0;

  for (const st of states) {
    if (!st) continue;
    for (const c of st.usedRoomCodes || []) {
      if (c) codeSet.add(c.toUpperCase().trim());
    }
    if (typeof st.freeGamesUsed === "number" && st.freeGamesUsed > maxUsed) {
      maxUsed = st.freeGamesUsed;
    }
  }

  const finalUsed = Math.max(maxUsed, codeSet.size);
  return {
    deviceFingerprint: fp,
    freeGamesUsed: finalUsed,
    usedRoomCodes: Array.from(codeSet),
    updatedAt: Date.now(),
  };
}

/**
 * Synchronously returns the current known device trial state from memory/localStorage.
 */
export function getDeviceTrialStateSync(): DeviceTrialState {
  const local = readTrialFromLocalStorage();
  const merged = mergeTrialStates(memoryTrialCache, local);
  memoryTrialCache = merged;
  return merged;
}

/**
 * Returns how many free hosted games remain on this device (0..2).
 */
export function getDeviceFreeGamesRemainingSync(
  profileFreeSessionsRemaining?: number
): number {
  const state = getDeviceTrialStateSync();
  const deviceRemaining = Math.max(0, MAX_FREE_HOST_GAMES - state.freeGamesUsed);
  if (typeof profileFreeSessionsRemaining === "number") {
    return Math.max(0, Math.min(deviceRemaining, profileFreeSessionsRemaining));
  }
  return deviceRemaining;
}

/**
 * Hydrates and reconciles the device trial state across LocalStorage, IndexedDB, and Supabase `device_trials`.
 * Even if the user cleared LocalStorage or created a new account, IndexedDB / Supabase restores the true `freeGamesUsed`.
 */
export async function syncDeviceTrialAcrossLayers(
  profileFreeGamesUsed?: number
): Promise<DeviceTrialState> {
  const fp = getDeviceFingerprint();
  const local = readTrialFromLocalStorage();
  const idb = await readTrialFromIndexedDb();
  const remote = await fetchRemoteDeviceTrial(fp);

  const profileSynthetic: DeviceTrialState | null =
    typeof profileFreeGamesUsed === "number" && profileFreeGamesUsed > 0
      ? {
          deviceFingerprint: fp,
          freeGamesUsed: profileFreeGamesUsed,
          usedRoomCodes: [],
          updatedAt: Date.now(),
        }
      : null;

  const merged = mergeTrialStates(
    memoryTrialCache,
    local,
    idb,
    remote,
    profileSynthetic
  );

  writeTrialToLocalStorage(merged);
  await writeTrialToIndexedDb(merged);
  if (
    !remote ||
    merged.freeGamesUsed > remote.freeGamesUsed ||
    merged.usedRoomCodes.length > remote.usedRoomCodes.length
  ) {
    upsertRemoteDeviceTrial(merged).catch(() => {});
  }

  return merged;
}

export const syncDeviceTrialStateWithCloud = syncDeviceTrialAcrossLayers;

/**
 * Deducts 1 free host credit ONLY when the Host actually starts the first question/round in a room.
 * - If `roomCode` was already recorded in `usedRoomCodes`, it does NOT deduct again (safe on refresh!).
 * - Persists across LocalStorage, IndexedDB, and Supabase `device_trials`.
 */
export async function recordHostGameStarted(roomCode: string): Promise<{
  deductedNow: boolean;
  freeGamesUsed: number;
  freeGamesRemaining: number;
  state: DeviceTrialState;
}> {
  const cleanCode = (roomCode || "").toUpperCase().trim();
  const current = await syncDeviceTrialAcrossLayers();

  if (!cleanCode || current.usedRoomCodes.includes(cleanCode)) {
    return {
      deductedNow: false,
      freeGamesUsed: current.freeGamesUsed,
      freeGamesRemaining: Math.max(
        0,
        MAX_FREE_HOST_GAMES - current.freeGamesUsed
      ),
      state: current,
    };
  }

  const nextCodes = [...current.usedRoomCodes, cleanCode];
  const nextUsed = Math.max(current.freeGamesUsed + 1, nextCodes.length);
  const nextState: DeviceTrialState = {
    deviceFingerprint: current.deviceFingerprint,
    freeGamesUsed: nextUsed,
    usedRoomCodes: nextCodes,
    updatedAt: Date.now(),
  };

  writeTrialToLocalStorage(nextState);
  await writeTrialToIndexedDb(nextState);
  upsertRemoteDeviceTrial(nextState).catch(() => {});

  return {
    deductedNow: true,
    freeGamesUsed: nextState.freeGamesUsed,
    freeGamesRemaining: Math.max(
      0,
      MAX_FREE_HOST_GAMES - nextState.freeGamesUsed
    ),
    state: nextState,
  };
}

// ============================================================================
// PRO EXCLUSIVE PERK: HALL OF FAME (سجل الانتصارات ولوحة صدارة الشلة)
// ============================================================================

export function loadHallOfFameRecords(): HallOfFameMatchRecord[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(HALL_OF_FAME_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHallOfFameMatch(
  record: Omit<HallOfFameMatchRecord, "id" | "playedAt">
): HallOfFameMatchRecord[] {
  if (typeof window === "undefined") return [];
  const existing = loadHallOfFameRecords();
  // Avoid duplicating the exact same roomCode entry if updated in the same session
  const filtered = existing.filter((r) => r.roomCode !== record.roomCode);
  const nextEntry: HallOfFameMatchRecord = {
    ...record,
    id: `hof-${record.roomCode}-${Date.now()}`,
    playedAt: Date.now(),
  };
  const updated = [nextEntry, ...filtered].slice(0, 30);
  try {
    window.localStorage.setItem(
      HALL_OF_FAME_STORAGE_KEY,
      JSON.stringify(updated)
    );
  } catch {
    // Ignore
  }
  return updated;
}
