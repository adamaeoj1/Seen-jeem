import { NextRequest, NextResponse } from "next/server";
import { createInitialRoomState, RoomState } from "@/lib/gameEngine";

// Global in-memory store across hot reloads for instant real-time room state sharing
const globalForRooms = globalThis as unknown as {
  __seenJeemRooms?: Map<string, RoomState>;
};

if (!globalForRooms.__seenJeemRooms) {
  globalForRooms.__seenJeemRooms = new Map<string, RoomState>();
}

const roomsMap = globalForRooms.__seenJeemRooms;

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const cleanCode = (params.code || "").toUpperCase().trim();
  if (!cleanCode) {
    return NextResponse.json({ room: null }, { status: 400 });
  }

  let room = roomsMap.get(cleanCode) || null;
  if (!room) {
    // Auto-initialize room if requested directly so any 4-letter room code works immediately
    room = createInitialRoomState(cleanCode);
    roomsMap.set(cleanCode, room);
  }

  return NextResponse.json({ room });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const cleanCode = (params.code || "").toUpperCase().trim();
  try {
    const incoming = (await req.json()) as RoomState;
    if (!incoming || !cleanCode) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    incoming.code = cleanCode;
    incoming.updatedAt = incoming.updatedAt || Date.now();
    roomsMap.set(cleanCode, incoming);
    return NextResponse.json({ room: incoming });
  } catch {
    return NextResponse.json({ error: "Failed to parse room state" }, { status: 400 });
  }
}
