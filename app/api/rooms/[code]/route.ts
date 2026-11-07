import { NextRequest, NextResponse } from "next/server";
import {
  createInitialRoomState,
  Player,
  PlayerSubmission,
  RoomState,
  sanitizeRoomPlayers,
} from "@/lib/gameEngine";
import { isDefaultTeamName } from "@/lib/editionManager";

// ذاكرة سيرفر مشتركة كطبقة حماية فورية لضمان عدم حدوث خطأ 500 أبداً
const globalForRooms = globalThis as unknown as {
  __SEEN_JEEM_ROOMS__?: Map<string, RoomState>;
};

if (!globalForRooms.__SEEN_JEEM_ROOMS__) {
  globalForRooms.__SEEN_JEEM_ROOMS__ = new Map<string, RoomState>();
}

const roomsStore = globalForRooms.__SEEN_JEEM_ROOMS__;

function createCleanDefaultRoom(
  code: string,
  edition: "MA" | "MENA" = "MA"
): RoomState {
  const isMA = edition === "MA";
  const team1Default = isMA ? "أسود الأطلس" : "فريق الصقور";
  const team2Default = isMA ? "القراصنة" : "فريق النمور";

  const base = createInitialRoomState(code.toUpperCase(), "FREE_TRIAL", [], {
    team1Name: team1Default,
    team2Name: team2Default,
  });

  base.edition = edition;
  base.boardSize = 18;
  base.answeringMode = "TYPING";
  base.players = []; // صفر بوتات نهائياً عند إنشاء أي غرفة جديدة
  base.teamA = { name: team1Default, score: 0 };
  base.teamB = { name: team2Default, score: 0 };
  base.updatedAt = Date.now();
  return base;
}

function syncTeamAliases(room: RoomState): RoomState {
  const t1Name =
    room.teams?.team1?.name?.trim() ||
    room.teamA?.name?.trim() ||
    room.settings?.team1Name?.trim() ||
    (room.edition === "MENA" ? "فريق الصقور" : "أسود الأطلس");
  const t2Name =
    room.teams?.team2?.name?.trim() ||
    room.teamB?.name?.trim() ||
    room.settings?.team2Name?.trim() ||
    (room.edition === "MENA" ? "فريق النمور" : "القراصنة");

  const t1Score = room.teams?.team1?.score ?? room.teamA?.score ?? 0;
  const t2Score = room.teams?.team2?.score ?? room.teamB?.score ?? 0;

  if (room.teams?.team1) {
    room.teams.team1.name = t1Name;
    room.teams.team1.score = t1Score;
  }
  if (room.teams?.team2) {
    room.teams.team2.name = t2Name;
    room.teams.team2.score = t2Score;
  }
  if (room.settings) {
    room.settings.team1Name = t1Name;
    room.settings.team2Name = t2Name;
  }
  room.teamA = { name: t1Name, score: t1Score };
  room.teamB = { name: t2Name, score: t2Score };
  room.players = sanitizeRoomPlayers(room.players);
  return room;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const code = (resolvedParams?.code || "").toUpperCase().trim();

    if (!code) {
      return NextResponse.json(
        { error: "Room code required", room: null },
        { status: 400 }
      );
    }

    let room = roomsStore.get(code);
    if (!room) {
      room = createCleanDefaultRoom(code);
      roomsStore.set(code, room);
    } else {
      room = syncTeamAliases(room);
    }

    return NextResponse.json({ ...room, room }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Server error";
    console.error("GET /api/rooms/[code] error:", error);
    return NextResponse.json({ error: msg, room: null }, { status: 200 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    const code = (resolvedParams?.code || "").toUpperCase().trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await req.json().catch(() => ({}));

    if (!code) {
      return NextResponse.json({ ok: false, error: "Invalid room code" }, { status: 200 });
    }

    const existing =
      roomsStore.get(code) ||
      createCleanDefaultRoom(code, body?.edition || "MA");

    // 1. دمج ذكي يحمي أسماء الفرق وإعدادات المضيف عند دخول لاعب جديد من الجوال
    const isPlayerJoinOnly = body?.action === "JOIN_PLAYER" && body?.player;
    // 2. دمج ذكي عند إرسال إجابة من الجوال فقط دون المساس بأسماء الفرق أو الإعدادات
    const isPlayerSubmitOnly =
      body?.action === "SUBMIT_ANSWER" && body?.submission;

    let updatedRoom: RoomState;

    if (isPlayerJoinOnly) {
      const incomingPlayer = body.player as Player;
      const filteredPlayers = sanitizeRoomPlayers(existing.players).filter(
        (p) => p.id !== incomingPlayer.id && p.name !== incomingPlayer.name
      );
      updatedRoom = syncTeamAliases({
        ...existing,
        players: [...filteredPlayers, incomingPlayer],
        updatedAt: Date.now(),
      });
    } else if (isPlayerSubmitOnly) {
      const sub = body.submission as PlayerSubmission;
      updatedRoom = syncTeamAliases({
        ...existing,
        submissions: {
          ...(existing.submissions || {}),
          [sub.playerId]: sub,
        },
        updatedAt: Date.now(),
      });
    } else {
      // Determine incoming team names
      const incomingT1Name = (
        body?.teams?.team1?.name ||
        body?.teamA?.name ||
        body?.settings?.team1Name ||
        ""
      ).trim();
      const incomingT2Name = (
        body?.teams?.team2?.name ||
        body?.teamB?.name ||
        body?.settings?.team2Name ||
        ""
      ).trim();

      const existingT1Name =
        existing.teams?.team1?.name || existing.teamA?.name || "أسود الأطلس";
      const existingT2Name =
        existing.teams?.team2?.name || existing.teamB?.name || "القراصنة";

      // Protect custom team names (e.g., "الإنس" & "الجن") from being overwritten by a default fallback
      const preserveExistingT1 =
        !isDefaultTeamName(existingT1Name) &&
        isDefaultTeamName(incomingT1Name) &&
        !body?.isHostSetup;
      const preserveExistingT2 =
        !isDefaultTeamName(existingT2Name) &&
        isDefaultTeamName(incomingT2Name) &&
        !body?.isHostSetup;

      const resolvedT1Name = preserveExistingT1
        ? existingT1Name
        : incomingT1Name || existingT1Name;
      const resolvedT2Name = preserveExistingT2
        ? existingT2Name
        : incomingT2Name || existingT2Name;

      const resolvedT1Score =
        body?.teams?.team1?.score ??
        body?.teamA?.score ??
        existing.teams?.team1?.score ??
        0;
      const resolvedT2Score =
        body?.teams?.team2?.score ??
        body?.teamB?.score ??
        existing.teams?.team2?.score ??
        0;

      const mergedTeams = {
        team1: {
          ...existing.teams.team1,
          ...(body?.teams?.team1 || {}),
          id: "team1" as const,
          name: resolvedT1Name,
          score: resolvedT1Score,
        },
        team2: {
          ...existing.teams.team2,
          ...(body?.teams?.team2 || {}),
          id: "team2" as const,
          name: resolvedT2Name,
          score: resolvedT2Score,
        },
      };

      const mergedSettings = {
        ...existing.settings,
        ...(body?.settings || {}),
        team1Name: resolvedT1Name,
        team2Name: resolvedT2Name,
      };

      const cleanedPlayers = Array.isArray(body?.players)
        ? sanitizeRoomPlayers(body.players)
        : sanitizeRoomPlayers(existing.players);

      updatedRoom = syncTeamAliases({
        ...existing,
        ...body,
        code,
        edition: body?.edition || existing.edition || "MA",
        boardSize: body?.boardSize || existing.boardSize || 18,
        answeringMode: body?.answeringMode || existing.answeringMode || "TYPING",
        teams: mergedTeams,
        settings: mergedSettings,
        teamA: {
          name: resolvedT1Name,
          score: resolvedT1Score,
        },
        teamB: {
          name: resolvedT2Name,
          score: resolvedT2Score,
        },
        players: cleanedPlayers,
        updatedAt: Date.now(),
      });
    }

    roomsStore.set(code, updatedRoom);
    return NextResponse.json({ ...updatedRoom, room: updatedRoom }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/rooms/[code] error:", error);
    // إرجاع حالة آمنة بدلاً من 500 حتى لا تنقطع مزامنة الغرفة أبداً
    return NextResponse.json({ ok: false, error: msg }, { status: 200 });
  }
}
