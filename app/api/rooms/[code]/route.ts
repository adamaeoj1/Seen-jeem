import { NextRequest, NextResponse } from "next/server";
import {
  createInitialPowerCards,
  createInitialRoomState,
  Player,
  PlayerSubmission,
  RoomState,
  sanitizeRoomPlayers,
  TeamId,
} from "@/lib/gameEngine";
import { isDefaultTeamName } from "@/lib/editionConstants";

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
  base.powerCards = createInitialPowerCards(2);
  base.frozenPlayerIds = [];
  base.activeWager = null;
  base.stealState = null;
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

  if (!room.powerCards) {
    room.powerCards = createInitialPowerCards(room.teamCount || 2);
  }
  if (!room.frozenPlayerIds) {
    room.frozenPlayerIds = [];
  }

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
    // 3. إنهاء الجلسة وإخراج الجميع
    const isCloseRoom = body?.action === "CLOSE_ROOM" || body?.status === "ROOM_CLOSED";
    // 4. إجراءات بطاقات الغدر والحماس
    const isFreezePlayer = body?.action === "FREEZE_PLAYER";
    const isClaimSteal = body?.action === "CLAIM_STEAL";
    const isActivateWager = body?.action === "ACTIVATE_WAGER";

    let updatedRoom: RoomState;

    if (isCloseRoom) {
      updatedRoom = syncTeamAliases({
        ...existing,
        status: "ROOM_CLOSED",
        phase: "LEADERBOARD",
        updatedAt: Date.now(),
      });
    } else if (isFreezePlayer) {
      const targetId = String(body.targetPlayerId || "");
      const usingTeam = (body.teamId as TeamId) || "team1";
      const cards = {
        ...(existing.powerCards ||
          createInitialPowerCards(existing.teamCount || 2)),
      };
      if (cards[usingTeam]) cards[usingTeam].freeze = false;
      updatedRoom = syncTeamAliases({
        ...existing,
        frozenPlayerIds: targetId ? [targetId] : [],
        powerCards: cards,
        updatedAt: Date.now(),
      });
    } else if (isClaimSteal) {
      const usingTeam = (body.teamId as TeamId) || "team2";
      const playerId = String(body.playerId || "");
      const playerName = String(body.playerName || "الخصم");
      const cards = {
        ...(existing.powerCards ||
          createInitialPowerCards(existing.teamCount || 2)),
      };
      if (cards[usingTeam]) cards[usingTeam].steal = false;
      const teamName = existing.teams[usingTeam]?.name || "فريق الخصم";
      updatedRoom = syncTeamAliases({
        ...existing,
        powerCards: cards,
        phase: "PLAYING",
        activeTeamTurn: usingTeam,
        stealState: {
          questionId: existing.activeQuestionId || "",
          endsAt: Date.now() + 10000,
          stolenByTeam: usingTeam,
          stolenByPlayerId: playerId,
          stolenByPlayerName: playerName,
          originalPoints: body.points || 200,
        },
        roundStartedAt: Date.now(),
        roundDurationSec: 10,
        roundSummaryText: `⚡ خطف السؤال! ${teamName} خطف السؤال ولديه 10 ثوانٍ للإجابة!`,
        updatedAt: Date.now(),
      });
    } else if (isActivateWager) {
      const usingTeam = (body.teamId as TeamId) || existing.activeTeamTurn || "team1";
      const amount = Number(body.amount) || 600;
      const cards = {
        ...(existing.powerCards ||
          createInitialPowerCards(existing.teamCount || 2)),
      };
      if (cards[usingTeam]) cards[usingTeam].qammar = false;
      updatedRoom = syncTeamAliases({
        ...existing,
        powerCards: cards,
        activeWager: {
          teamId: usingTeam,
          amount,
          isAllIn: Boolean(body.isAllIn),
        },
        updatedAt: Date.now(),
      });
    } else if (isPlayerJoinOnly) {
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mergedTeams: any = {
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

      if (
        body?.teams?.team3 ||
        existing.teams?.team3 ||
        (body?.teamCount && body.teamCount >= 3)
      ) {
        mergedTeams.team3 = {
          ...(existing.teams?.team3 || {
            id: "team3" as const,
            name: body?.settings?.team3Name || "فرسان البوغاز",
            color: body?.settings?.team3Color || "#10B981",
            score: 0,
            doublePointsRemaining: 1,
          }),
          ...(body?.teams?.team3 || {}),
          id: "team3" as const,
        };
      }

      if (
        body?.teams?.team4 ||
        existing.teams?.team4 ||
        (body?.teamCount && body.teamCount >= 4)
      ) {
        mergedTeams.team4 = {
          ...(existing.teams?.team4 || {
            id: "team4" as const,
            name: body?.settings?.team4Name || "صقور الصحراء",
            color: body?.settings?.team4Color || "#8B5CF6",
            score: 0,
            doublePointsRemaining: 1,
          }),
          ...(body?.teams?.team4 || {}),
          id: "team4" as const,
        };
      }

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
        status: body?.status || existing.status || "ACTIVE",
        edition: body?.edition || existing.edition || "MA",
        boardSize: body?.boardSize || existing.boardSize || 18,
        answeringMode: body?.answeringMode || existing.answeringMode || "TYPING",
        teamCount: body?.teamCount || existing.teamCount || 2,
        teams: mergedTeams,
        settings: mergedSettings,
        powerCards:
          body?.powerCards ||
          existing.powerCards ||
          createInitialPowerCards(body?.teamCount || existing.teamCount || 2),
        frozenPlayerIds:
          body?.frozenPlayerIds !== undefined
            ? body.frozenPlayerIds
            : existing.frozenPlayerIds || [],
        activeWager:
          body?.activeWager !== undefined
            ? body.activeWager
            : existing.activeWager || null,
        stealState:
          body?.stealState !== undefined
            ? body.stealState
            : existing.stealState || null,
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
