/**
 * Production Real-Time Synchronization Layer (lib/realtime.ts)
 * Supports Supabase Realtime Broadcast/Presence, Appwrite Realtime WebSockets,
 * and silent Next.js API + BroadcastChannel synchronization.
 */

import { RoomState, Player } from "@/lib/gameEngine";
import { dbFetchRoom, dbUpsertRoom, getActiveBackendProvider } from "@/lib/db";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const ROOM_STORAGE_PREFIX = "seen_jeem_room_v2_";
const CHANNEL_NAME = "seen_jeem_realtime_v2";

export interface RealtimeEventPayload {
  type: "ROOM_UPDATE" | "PLAYER_JOINED";
  code: string;
  room: RoomState;
  joinedPlayer?: Player;
}

export function loadCachedRoom(code: string): RoomState | null {
  if (typeof window === "undefined") return null;
  const key = ROOM_STORAGE_PREFIX + code.toUpperCase().trim();
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RoomState;
  } catch {
    return null;
  }
}

export function broadcastRoomState(
  room: RoomState,
  joinedPlayer?: Player
): void {
  if (typeof window === "undefined") return;
  const cleanCode = room.code.toUpperCase().trim();
  room.updatedAt = Date.now();
  const key = ROOM_STORAGE_PREFIX + cleanCode;
  const serialized = JSON.stringify(room);

  window.localStorage.setItem(key, serialized);

  const payload: RealtimeEventPayload = {
    type: joinedPlayer ? "PLAYER_JOINED" : "ROOM_UPDATE",
    code: cleanCode,
    room,
    joinedPlayer,
  };

  // 1. Instant cross-tab BroadcastChannel
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(payload);
    channel.close();
  } catch {
    // Ignore
  }

  // 2. Sync to Next.js server endpoint for multi-device LAN/deployment sync
  fetch(`/api/rooms/${cleanCode}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: serialized,
  }).catch(() => {});

  // 3. Persist to Supabase / Appwrite DB if configured
  dbUpsertRoom(room).catch(() => {});
}

export function subscribeToRoomRealtime(
  code: string,
  callbacks: {
    onRoomUpdate: (room: RoomState) => void;
    onPlayerJoined?: (player: Player) => void;
  }
): () => void {
  if (typeof window === "undefined") return () => {};
  const cleanCode = code.toUpperCase().trim();
  const key = ROOM_STORAGE_PREFIX + cleanCode;

  let latestTimestamp = 0;
  let knownPlayerIds = new Set<string>();

  const existing = loadCachedRoom(cleanCode);
  if (existing) {
    latestTimestamp = existing.updatedAt || 0;
    existing.players.forEach((p) => knownPlayerIds.add(p.id));
  }

  const processIncomingRoom = (
    incoming: RoomState | null,
    explicitJoinedPlayer?: Player
  ) => {
    if (!incoming || incoming.code !== cleanCode) return;
    if (incoming.updatedAt < latestTimestamp) return;
    latestTimestamp = incoming.updatedAt;

    // Check if any new player joined so Host can trigger their voice/buzzer sound!
    if (explicitJoinedPlayer && !knownPlayerIds.has(explicitJoinedPlayer.id)) {
      knownPlayerIds.add(explicitJoinedPlayer.id);
      callbacks.onPlayerJoined?.(explicitJoinedPlayer);
    } else {
      for (const p of incoming.players) {
        if (!knownPlayerIds.has(p.id)) {
          knownPlayerIds.add(p.id);
          callbacks.onPlayerJoined?.(p);
        }
      }
    }

    // Keep knownPlayerIds aligned with current roster
    knownPlayerIds = new Set(incoming.players.map((p) => p.id));
    callbacks.onRoomUpdate(incoming);
  };

  // 1. BroadcastChannel subscription
  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (e: MessageEvent<RealtimeEventPayload>) => {
      if (e.data?.code === cleanCode && e.data?.room) {
        processIncomingRoom(e.data.room, e.data.joinedPlayer);
      }
    };
  } catch {
    // Ignore
  }

  // 2. Window storage listener
  const onStorage = (e: StorageEvent) => {
    if (e.key === key && e.newValue) {
      try {
        processIncomingRoom(JSON.parse(e.newValue) as RoomState);
      } catch {
        // Ignore
      }
    }
  };
  window.addEventListener("storage", onStorage);

  // 3. Supabase Realtime WebSocket (if configured)
  let supaSocket: WebSocket | null = null;
  const provider = getActiveBackendProvider();
  if (provider === "supabase" && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const wsUrl =
        SUPABASE_URL.replace(/^http/, "ws") +
        `/realtime/v1/websocket?apikey=${encodeURIComponent(
          SUPABASE_ANON_KEY
        )}&vsn=1.0.0`;
      supaSocket = new WebSocket(wsUrl);
      supaSocket.onopen = () => {
        supaSocket?.send(
          JSON.stringify({
            topic: `realtime:public:rooms:code=eq.${cleanCode}`,
            event: "phx_join",
            payload: {},
            ref: "1",
          })
        );
      };
      supaSocket.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          const snapshot = msg?.payload?.record?.state_snapshot as
            | RoomState
            | undefined;
          if (snapshot && snapshot.code === cleanCode) {
            window.localStorage.setItem(key, JSON.stringify(snapshot));
            processIncomingRoom(snapshot);
          }
        } catch {
          // Ignore
        }
      };
    } catch {
      // Ignore WebSocket errors
    }
  }

  // 4. Multi-device sync polling (every 1100ms)
  const pollId = window.setInterval(async () => {
    const remoteRoom = await dbFetchRoom(cleanCode);
    if (remoteRoom && remoteRoom.updatedAt > latestTimestamp) {
      window.localStorage.setItem(key, JSON.stringify(remoteRoom));
      processIncomingRoom(remoteRoom);
    }
  }, 1100);

  return () => {
    if (bc) bc.close();
    if (supaSocket) supaSocket.close();
    window.removeEventListener("storage", onStorage);
    window.clearInterval(pollId);
  };
}
