"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  Clock,
  Dices,
  Edit3,
  Eraser,
  Home,
  Lock,
  MapPin,
  RotateCcw,
  Send,
  ShieldCheck,
  Snowflake,
  Trash2,
  Trophy,
  Undo2,
  Volume2,
  Zap,
} from "lucide-react";
import {
  createInitialPowerCards,
  createInitialRoomState,
  getActiveSeenJeemQuestion,
  getActiveTeamIds,
  getActiveTeams,
  getRegionalClosestNumberRounds,
  getRegionalDrawingChallengeRounds,
  getRegionalMapPinRounds,
  getRegionalMiniGamesMeta,
  getRegionalPriceGuessRounds,
  getRegionalSceneDescriptionRounds,
  getRegionalSpeedTriviaRounds,
  getRegionalWhatsInFrameRounds,
  loadRoomFromLocal,
  loadSavedPlayerIdentity,
  Player,
  PlayerSubmission,
  RoomState,
  savePlayerIdentity,
  saveRoomToLocalAndBroadcast,
  subscribeToRoomUpdates,
  TeamId,
} from "@/lib/gameEngine";
import { getShuffledSpeedTriviaRound } from "@/lib/questionRandomizer";
import {
  QUICK_REFLEX_ROUNDS,
  ReflexColor,
  ReflexShape,
} from "@/data/seedQuestions";
import { parseArabicNumber } from "@/lib/arabicReferee";
import {
  EcommerceProductCard,
  FrameSceneArtwork,
  PhotoQuestionViewer,
  SceneDescriptionArtwork,
} from "@/components/GameArtwork";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import { QadhaLogo } from "@/components/QadhaLogo";
import {
  AvatarCharacterId,
  CartoonAvatar,
  getRegionalAvatarCharacters,
  normalizeAvatarId,
} from "@/components/CartoonAvatars";
import { playVoicePack, VOICE_PACKS, VoicePackId } from "@/lib/soundEffects";
import { dbFetchRoom, dbRegisterRoomPlayer } from "@/lib/db";
import {
  BUZZER_MODE_MARKER,
  getRoomAdapterState,
  getSortedBuzzQueue,
  isBuzzAnswer,
  isRoomInBuzzerMode,
  RoomFrontendAdapterState,
  useEdition,
} from "@/lib/editionManager";
import { DevDrawer } from "@/components/DevDrawer";

export default function PlayerControllerPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const roomCode = (params?.code || "K7Q2").toUpperCase().trim();
  const { region, edition } = useEdition();
  const regionalAvatars = getRegionalAvatarCharacters(region);

  const [room, setRoom] = useState<RoomState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [adapterState, setAdapterState] = useState<RoomFrontendAdapterState>(
    () => getRoomAdapterState(roomCode)
  );

  // Onboarding state
  const [joinName, setJoinName] = useState("");
  const [joinAvatar, setJoinAvatar] = useState<AvatarCharacterId>("abu_sultan");
  const [joinVoice, setJoinVoice] = useState<VoicePackId>("hype_horn");
  const [joinTeam, setJoinTeam] = useState<TeamId>("team1");

  // Active round input state
  const [textInput, setTextInput] = useState("");
  const [numericInput, setNumericInput] = useState("");
  const [selectedPin, setSelectedPin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);

  const lastRoundKeyRef = useRef<string>("");

  // Load room & register player + listen to adapter updates
  useEffect(() => {
    setAdapterState(getRoomAdapterState(roomCode));
    let mounted = true;

    const initPlayerRoom = async () => {
      // 1. Fetch authoritative room from server/DB first so player never overwrites host team names
      let authoritativeRoom = await dbFetchRoom(roomCode);
      if (!authoritativeRoom) {
        authoritativeRoom = loadRoomFromLocal(roomCode);
      }
      if (!authoritativeRoom) {
        authoritativeRoom = createInitialRoomState(
          roomCode,
          "FREE_TRIAL",
          [],
          {
            team1Name: edition.defaultTeam1Name,
            team2Name: edition.defaultTeam2Name,
          }
        );
      }
      if (!mounted) return;
      setRoom(authoritativeRoom);

      const savedId = loadSavedPlayerIdentity();
      if (savedId && savedId.name) {
        ensurePlayerInRoom(
          authoritativeRoom,
          savedId.id,
          savedId.name,
          normalizeAvatarId(savedId.avatar),
          (savedId.voiceId as VoicePackId) || "hype_horn",
          savedId.team
        );
      } else {
        setNeedsOnboarding(true);
      }
    };

    initPlayerRoom();

    const unsubscribe = subscribeToRoomUpdates(roomCode, (updated) => {
      if (updated?.status === "ROOM_CLOSED") {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("seen_jeem_player_identity_v2");
            sessionStorage.clear();
          } catch {}
        }
        alert("انتهت الجلسة! شكراً للعب في قَدْهَا؟");
        router.push("/");
        return;
      }
      setRoom(updated);
      setAdapterState(getRoomAdapterState(roomCode));
    });

    const onAdapterEvent = () => {
      setAdapterState(getRoomAdapterState(roomCode));
    };
    window.addEventListener("seen_jeem_adapter_update", onAdapterEvent);
    window.addEventListener("storage", onAdapterEvent);

    return () => {
      mounted = false;
      unsubscribe();
      window.removeEventListener("seen_jeem_adapter_update", onAdapterEvent);
      window.removeEventListener("storage", onAdapterEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // Reactive listener for room closure by host
  useEffect(() => {
    if (room?.status === "ROOM_CLOSED") {
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("seen_jeem_player_identity_v2");
          sessionStorage.clear();
        } catch {}
      }
      alert("انتهت الجلسة! شكراً للعب في قَدْهَا؟");
      router.push("/");
    }
  }, [room?.status, router]);

  // Reset inputs when active round changes
  useEffect(() => {
    if (!room) return;
    const roundKey = `${room.majorMode}-${room.activeQuestionId}-${room.activeMiniGameId}-${room.miniGameRoundIndex}-${room.roundStartedAt}`;
    if (roundKey !== lastRoundKeyRef.current) {
      lastRoundKeyRef.current = roundKey;
      setTextInput("");
      setNumericInput("");
      setSelectedPin(null);
      setIsEditingAnswer(false);
    }
  }, [room]);

  // Sync currentPlayer object whenever room.players updates (including host team switch)
  useEffect(() => {
    if (!room || !currentPlayer) return;
    const updatedMe = room.players.find((p) => p.id === currentPlayer.id);
    if (updatedMe) {
      if (updatedMe.team !== currentPlayer.team) {
        savePlayerIdentity({
          id: updatedMe.id,
          name: updatedMe.name,
          avatar: updatedMe.avatar,
          voiceId: updatedMe.voiceId,
          team: updatedMe.team,
        });
      }
      setCurrentPlayer(updatedMe);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.players]);

  // Countdown timer
  useEffect(() => {
    if (!room || room.phase !== "PLAYING") return;
    const tick = () => {
      const elapsed = Math.floor((Date.now() - room.roundStartedAt) / 1000);
      setTimeLeft(Math.max(0, room.roundDurationSec - elapsed));
    };
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [room?.phase, room?.roundStartedAt, room?.roundDurationSec]);

  const ensurePlayerInRoom = (
    targetRoom: RoomState,
    id: string,
    name: string,
    avatar: AvatarCharacterId,
    voiceId: VoicePackId,
    team?: TeamId
  ) => {
    const cloned: RoomState = JSON.parse(JSON.stringify(targetRoom));
    let found = cloned.players.find((p) => p.id === id);
    if (!found) {
      // Auto-balance team across all active teams (2, 3, or 4 teams)
      const activeIds = getActiveTeamIds(cloned);
      const counts: Record<TeamId, number> = {
        team1: 0,
        team2: 0,
        team3: 0,
        team4: 0,
      };
      cloned.players.forEach((p) => {
        if (counts[p.team] !== undefined) counts[p.team]++;
      });

      let assignedTeam: TeamId =
        team && activeIds.includes(team) ? team : activeIds[0];
      let minCount = Infinity;
      for (const tid of activeIds) {
        if (counts[tid] < minCount) {
          minCount = counts[tid];
          assignedTeam = tid;
        }
      }

      found = {
        id,
        name,
        avatar,
        voiceId,
        team: assignedTeam,
        isCaptain: false,
        isOnline: true,
        score: 0,
        connectedAt: Date.now(),
      };
      cloned.players.push(found);
      savePlayerIdentity({
        id: found.id,
        name: found.name,
        avatar: found.avatar,
        voiceId: found.voiceId,
        team: found.team,
      });
      saveRoomToLocalAndBroadcast(cloned, found);
      dbRegisterRoomPlayer(roomCode, found).catch(() => {});
      setRoom(cloned);
    }
    setCurrentPlayer(found);
    setNeedsOnboarding(false);
  };

  const handleSwitchTeam = (newTeam: TeamId) => {
    if (!room || !currentPlayer || currentPlayer.team === newTeam) return;
    const cloned: RoomState = JSON.parse(JSON.stringify(room));
    const me = cloned.players.find((p) => p.id === currentPlayer.id);
    if (me) {
      me.team = newTeam;
      savePlayerIdentity({
        id: me.id,
        name: me.name,
        avatar: me.avatar,
        voiceId: me.voiceId,
        team: newTeam,
      });
      saveRoomToLocalAndBroadcast(cloned, me);
      dbRegisterRoomPlayer(roomCode, me).catch(() => {});
      setRoom(cloned);
      setCurrentPlayer(me);
    }
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room) return;
    const pid = "p-" + Math.random().toString(36).slice(2, 9);
    const cleanName = joinName.trim() || "لاعب";
    savePlayerIdentity({
      id: pid,
      name: cleanName,
      avatar: joinAvatar,
      voiceId: joinVoice,
      team: joinTeam,
    });
    playVoicePack(joinVoice, true);
    ensurePlayerInRoom(room, pid, cleanName, joinAvatar, joinVoice, joinTeam);
  };

  // Claim Steal during STEAL_WINDOW (consumes team's steal power card)
  const handleClaimSteal = () => {
    if (!room || !currentPlayer) return;
    playVoicePack(currentPlayer.voiceId || "hype_horn", true);

    const { question } = getActiveSeenJeemQuestion(room);
    const targetPoints = question?.points || 200;
    const cloned: RoomState = JSON.parse(JSON.stringify(room));
    const cards = {
      ...(cloned.powerCards || createInitialPowerCards(cloned.teamCount || 2)),
    };
    if (cards[currentPlayer.team]) {
      cards[currentPlayer.team].steal = false;
    }
    const myTeamName =
      cloned.teams[currentPlayer.team]?.name || currentPlayer.team;
    cloned.powerCards = cards;
    cloned.phase = "PLAYING";
    cloned.activeTeamTurn = currentPlayer.team;
    cloned.roundDurationSec = 10;
    cloned.roundStartedAt = Date.now();
    cloned.stealState = {
      questionId: cloned.activeQuestionId || "",
      endsAt: Date.now() + 10000,
      stolenByTeam: currentPlayer.team,
      stolenByPlayerId: currentPlayer.id,
      stolenByPlayerName: currentPlayer.name,
      originalPoints: targetPoints,
    };
    cloned.roundSummaryText = `⚡ خطف السؤال! ${myTeamName} خطف السؤال ولديه 10 ثوانٍ للإجابة!`;
    cloned.updatedAt = Date.now();

    saveRoomToLocalAndBroadcast(cloned);
    fetch(`/api/rooms/${roomCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CLAIM_STEAL",
        teamId: currentPlayer.team,
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        points: targetPoints,
      }),
    }).catch(() => {});
    setRoom(cloned);
  };

  // Tactical Freeze: Freeze a rival player for the current round
  const handleFreezePlayer = (targetPlayerId: string) => {
    if (!room || !currentPlayer) return;
    playVoicePack("buzzer_wrong", true);
    const cloned: RoomState = JSON.parse(JSON.stringify(room));
    const cards = {
      ...(cloned.powerCards || createInitialPowerCards(cloned.teamCount || 2)),
    };
    if (cards[currentPlayer.team]) {
      cards[currentPlayer.team].freeze = false;
    }
    cloned.powerCards = cards;
    cloned.frozenPlayerIds = [targetPlayerId];
    cloned.updatedAt = Date.now();

    saveRoomToLocalAndBroadcast(cloned);
    fetch(`/api/rooms/${roomCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "FREEZE_PLAYER",
        teamId: currentPlayer.team,
        targetPlayerId,
      }),
    }).catch(() => {});
    setRoom(cloned);
    setShowFreezeModal(false);
  };

  const submitPlayerResponse = (payload: Partial<PlayerSubmission>) => {
    if (!room || !currentPlayer) return;
    if (room.frozenPlayerIds?.includes(currentPlayer.id)) {
      alert("🥶 أنت مجمد في هذه الجولة بواسطة الفريق المنافس ولا يمكنك إرسال إجابة!");
      return;
    }
    const latestMe =
      room.players.find((p) => p.id === currentPlayer.id) || currentPlayer;
    const elapsedMs = Math.max(100, Date.now() - room.roundStartedAt);
    const sub: PlayerSubmission = {
      playerId: latestMe.id,
      playerName: latestMe.name,
      team: latestMe.team,
      submittedAt: Date.now(),
      elapsedMs,
      ...payload,
    };

    const cloned: RoomState = JSON.parse(JSON.stringify(room));
    cloned.submissions[currentPlayer.id] = sub;
    cloned.updatedAt = Date.now();
    saveRoomToLocalAndBroadcast(cloned);
    fetch(`/api/rooms/${roomCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SUBMIT_ANSWER", submission: sub }),
    }).catch(() => {});
    setRoom(cloned);
    setIsEditingAnswer(false);
  };

  if (!room) {
    return (
      <div className="max-w-md mx-auto min-h-[100dvh] bg-sunny border-x-4 border-black p-6 flex items-center justify-center font-black text-xl">
        جاري الاتصال بالغرفة {roomCode}...
      </div>
    );
  }

  const activeTeams = getActiveTeams(room);
  const team1DynamicName =
    room.teams?.team1?.name || room.teamA?.name || edition.defaultTeam1Name;
  const team2DynamicName =
    room.teams?.team2?.name || room.teamB?.name || edition.defaultTeam2Name;

  // Onboarding Screen with 8 Custom SVG Illustrated Avatars + Voice Picker
  if (needsOnboarding || !currentPlayer) {
    return (
      <div
        dir={edition.dir}
        className="max-w-md mx-auto min-h-[100dvh] bg-sunny border-x-4 border-black p-4 flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="bg-black text-sunny rounded-2xl p-3.5 border-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QadhaLogo edition={region} size="sm" showWordmark={false} />
              <span className="font-black text-xs">
                {edition.isEnglish
                  ? `Player Controller (${edition.deviceTerm})`
                  : `جهاز تحكم اللاعب (${edition.deviceTerm})`}
              </span>
            </div>
            <span dir="ltr" className="font-mono font-black text-base">
              {room.code}
            </span>
          </div>

          <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
            <h1 className="text-xl font-black">
              انضم للغرفة ({edition.partyTerm})
            </h1>

            <form onSubmit={handleCompleteOnboarding} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black mb-1">اسمك</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="اكتب اسمك هنا..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-3 border-black bg-cream font-black text-sm placeholder:text-gray-400"
                />
              </div>

              <div
                className={`grid gap-2 ${
                  activeTeams.length > 2 ? "grid-cols-2" : "grid-cols-2"
                }`}
              >
                {activeTeams.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setJoinTeam(t.id)}
                    style={{
                      backgroundColor: joinTeam === t.id ? t.color : undefined,
                    }}
                    className={`py-2.5 px-2 rounded-xl border-2 border-black font-black text-xs transition ${
                      joinTeam === t.id
                        ? "text-white shadow-brutal-sm scale-102 ring-2 ring-black"
                        : "bg-cream text-black hover:bg-white"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {/* 8 Custom SVG Illustrated Avatars (Moroccan in MA, MENA in MENA) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black">
                  اختر شخصيتك الكرتونية:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {regionalAvatars.map((char) => (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => setJoinAvatar(char.id)}
                      className={`p-1.5 rounded-xl border-2 border-black flex flex-col items-center gap-1 transition ${
                        joinAvatar === char.id
                          ? "bg-sunny shadow-brutal-sm -translate-y-0.5"
                          : "bg-cream/60"
                      }`}
                    >
                      <CartoonAvatar avatarId={char.id} size="sm" />
                      <span className="text-[10px] font-black leading-none text-center">
                        {char.nameAr}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice / Sound Effect Pack Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black">
                    اختر صوتك في اللعبة:
                  </label>
                  <button
                    type="button"
                    onClick={() => playVoicePack(joinVoice, true)}
                    className="px-2.5 py-1 rounded-lg bg-mint text-black border-2 border-black text-[11px] font-black flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>🔊 جرب الصوت</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {VOICE_PACKS.map((vp) => (
                    <button
                      key={vp.id}
                      type="button"
                      onClick={() => {
                        setJoinVoice(vp.id);
                        playVoicePack(vp.id, true);
                      }}
                      className={`py-1.5 px-2 rounded-xl border-2 border-black text-[11px] font-black transition ${
                        joinVoice === vp.id
                          ? "bg-royal text-white shadow-brutal-sm"
                          : "bg-cream text-black"
                      }`}
                    >
                      {vp.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-black text-sunny font-black text-base border-3 border-black shadow-brutal"
              >
                انضم للغرفة
              </button>
            </form>
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-xs font-black underline text-center py-2"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const mySubmission = room.submissions[currentPlayer.id];
  const isMySubBuzz = isBuzzAnswer(mySubmission?.textAnswer);
  const buzzQueue = getSortedBuzzQueue(room.submissions);
  const fastestBuzz = buzzQueue[0] || null;
  const isBuzzerMode =
    room.majorMode === "SEEN_JEEM" && isRoomInBuzzerMode(room, adapterState);

  const hasSubmittedAndLocked =
    Boolean(mySubmission) && !isEditingAnswer && !isBuzzerMode;

  const { category: activeCat, question: activeSeenJeemQ } =
    getActiveSeenJeemQuestion(room);
  const currentQuestion = activeSeenJeemQ
    ? { ...activeSeenJeemQ, text: activeSeenJeemQ.question }
    : null;
  const regionalMiniGamesMeta = getRegionalMiniGamesMeta(region);
  const activeMiniGameMeta =
    regionalMiniGamesMeta.find((m) => m.id === room.activeMiniGameId) ||
    regionalMiniGamesMeta[0];

  const myTeamInfo =
    room.teams?.[currentPlayer.team] ||
    activeTeams.find((t) => t.id === currentPlayer.team) ||
    room.teams?.team1 || {
      id: currentPlayer.team,
      name: "فريقك",
      score: 0,
      color: "#3B66B4",
    };
  const myTeamDynamicName = myTeamInfo.name;
  const myTeamDynamicScore = myTeamInfo.score ?? 0;
  const headerColor = myTeamInfo.color || "#3B66B4";
  const isFrozen = Boolean(
    room.frozenPlayerIds?.includes(currentPlayer.id)
  );

  return (
    <div
      dir={edition.dir}
      className="max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between bg-cream border-x-4 border-black shadow-2xl overflow-x-hidden"
    >
      {/* Clean Mobile Controller Header (Dynamic Team Badge from Synced Room State) */}
      <header
        className="text-white border-b-4 border-black p-3 flex items-center justify-between"
        style={{ backgroundColor: headerColor }}
      >
        <div className="flex items-center gap-2.5">
          <CartoonAvatar avatarId={currentPlayer.avatar} size="sm" />
          <div>
            <div className="font-black text-sm flex items-center gap-1">
              <span>{currentPlayer.name}</span>
              {currentPlayer.isCaptain && <span>👑</span>}
            </div>
            <div className="text-[11px] font-bold text-sunny flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-black/35 border border-white/30 text-white font-black text-[10px]">
                {myTeamDynamicName}
              </span>
              <span>• {myTeamDynamicScore} نقطة للفريق</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {room.phase === "PLAYING" && (
            <span className="px-2.5 py-1 rounded-xl bg-sunny text-black border-2 border-black font-mono font-black text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeLeft}s
            </span>
          )}
          <span
            dir="ltr"
            className="px-2.5 py-1 rounded-xl bg-black text-sunny font-mono font-black text-xs border border-white/30"
          >
            {room.code}
          </span>
        </div>
      </header>

      {/* Team Tactical Power Cards HUD on Phone */}
      {room.powerCards && room.powerCards[currentPlayer.team] && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-black/5 border-b-2 border-black/10 text-[10px] font-black">
          <span className="text-gray-600 font-bold">بطاقات فريقك:</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`px-2 py-0.5 rounded-md border text-[10px] flex items-center gap-1 font-black ${
                room.powerCards[currentPlayer.team]?.steal
                  ? "bg-amber-100 border-amber-400 text-amber-900"
                  : "bg-gray-100 border-gray-300 text-gray-400 line-through"
              }`}
            >
              <Zap className="w-3 h-3" />
              خطف
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border text-[10px] flex items-center gap-1 font-black ${
                room.powerCards[currentPlayer.team]?.freeze
                  ? "bg-cyan-100 border-cyan-400 text-cyan-900"
                  : "bg-gray-100 border-gray-300 text-gray-400 line-through"
              }`}
            >
              <Snowflake className="w-3 h-3" />
              تجميد
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border text-[10px] flex items-center gap-1 font-black ${
                room.powerCards[currentPlayer.team]?.qammar
                  ? "bg-rose-100 border-rose-400 text-rose-900"
                  : "bg-gray-100 border-gray-300 text-gray-400 line-through"
              }`}
            >
              <Dices className="w-3 h-3" />
              قَمّر
            </span>

            {/* Quick Freeze Trigger from Phone if Freeze Card is Available */}
            {room.powerCards[currentPlayer.team]?.freeze &&
              (room.phase === "LOBBY" ||
                room.phase === "MODE_SELECT" ||
                room.phase === "ROUND_INTRO" ||
                room.phase === "PLAYING") && (
                <button
                  type="button"
                  onClick={() => setShowFreezeModal(true)}
                  className="ms-1 px-2 py-0.5 rounded-md bg-cyan-500 hover:bg-cyan-600 text-white font-black text-[10px] border border-black shadow-brutal-sm flex items-center gap-0.5"
                >
                  <Snowflake className="w-3 h-3" />
                  <span>جمّد خصم</span>
                </button>
              )}
          </div>
        </div>
      )}

      {/* Main Controller Body */}
      <main className="flex-1 p-3.5 flex flex-col justify-center space-y-3 overflow-y-auto">
        {/* WAITING STATES: LOBBY, MODE_SELECT, ROUND_INTRO */}
        {(room.phase === "LOBBY" ||
          room.phase === "MODE_SELECT" ||
          room.phase === "ROUND_INTRO") && (
          <div className="bg-sunny border-4 border-black rounded-3xl p-5 shadow-brutal text-center space-y-3.5">
            <CartoonAvatar
              avatarId={currentPlayer.avatar}
              size="lg"
              className="mx-auto"
            />
            <h2 className="text-2xl font-black">
              {room.phase === "LOBBY"
                ? "أنت جاهز في اللوبي!"
                : room.phase === "MODE_SELECT"
                ? "بانتظار اختيار السؤال..."
                : `استعد: ${activeMiniGameMeta.title}`}
            </h2>
            <p className="text-xs font-bold text-black/80 leading-relaxed">
              {room.phase === "ROUND_INTRO"
                ? activeMiniGameMeta.howToPlay
                : "ستظهر لوحة التحكم هنا فور بدء الجولة على الشاشة الرئيسية."}
            </p>

            <button
              type="button"
              onClick={() =>
                playVoicePack(currentPlayer.voiceId || "hype_horn", true)
              }
              className="w-full py-2.5 rounded-2xl bg-white hover:bg-cream text-black font-black text-xs border-3 border-black shadow-brutal-sm flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-royal" />
              <span>🔊 جرب صوتك في الغرفة</span>
            </button>

            <div className="bg-white border-3 border-black rounded-2xl p-2.5 text-xs font-black flex items-center justify-between">
              <span>فريقك: {myTeamDynamicName}</span>
              <span className="font-mono text-base text-royal">
                {myTeamDynamicScore} نقطة
              </span>
            </div>

            {/* In Lobby: Player can switch between the room's actual custom team names */}
            {room.phase === "LOBBY" && (
              <div className="bg-white/70 border-2 border-black rounded-2xl p-2.5 space-y-1.5">
                <div className="text-[11px] font-black text-gray-700">
                  هل ترغب في تغيير فريقك؟ اضغط للتبديل:
                </div>
                <div
                  className={`grid gap-2 ${
                    activeTeams.length > 2 ? "grid-cols-2" : "grid-cols-2"
                  }`}
                >
                  {activeTeams.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSwitchTeam(t.id)}
                      style={{
                        backgroundColor:
                          currentPlayer.team === t.id ? t.color : undefined,
                      }}
                      className={`py-2 px-2.5 rounded-xl border-2 border-black font-black text-xs transition-all ${
                        currentPlayer.team === t.id
                          ? "text-white shadow-brutal-sm ring-2 ring-black scale-102"
                          : "bg-white text-black hover:bg-cream"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANSWER RECEIVED STATE ("وصل جوابك ✔" + "تعديل") for non-buzzer rounds */}
        {room.phase === "PLAYING" && hasSubmittedAndLocked && mySubmission && (
          <div className="bg-mint border-4 border-black rounded-3xl p-6 shadow-brutal text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-white border-3 border-black shadow-brutal-sm flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-black" />
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-black text-black">وصل جوابك ✔</h2>
              <p className="text-xs font-bold text-black/80">
                بانتظار انتهاء الوقت والفرز الآلي
              </p>
            </div>

            <div className="bg-white border-3 border-black rounded-2xl p-4 text-sm font-black">
              {mySubmission.textAnswer && !isMySubBuzz && (
                <div>«{mySubmission.textAnswer}»</div>
              )}
              {typeof mySubmission.numericValue === "number" && (
                <div className="font-mono text-lg">
                  {mySubmission.numericValue.toLocaleString("en-US")}
                </div>
              )}
              {typeof mySubmission.pinLat === "number" && (
                <div>
                  تم تثبيت الدبوس ({mySubmission.pinLat.toFixed(1)}°,{" "}
                  {mySubmission.pinLng?.toFixed(1)}°)
                </div>
              )}
              {typeof mySubmission.optionIndex === "number" && (
                <div>الخيار رقم #{mySubmission.optionIndex + 1}</div>
              )}
              {mySubmission.reflexCellId && (
                <div>
                  في {(mySubmission.elapsedMs / 1000).toFixed(2)} ثانية
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (mySubmission.textAnswer && !isMySubBuzz) {
                  setTextInput(mySubmission.textAnswer);
                }
                if (typeof mySubmission.numericValue === "number") {
                  setNumericInput(String(mySubmission.numericValue));
                }
                setIsEditingAnswer(true);
              }}
              className="w-full py-3.5 px-5 rounded-2xl bg-sunny hover:bg-yellow-300 text-black font-black text-sm border-3 border-black shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>تعديل</span>
            </button>
          </div>
        )}

        {/* STEAL WINDOW STATE (10-Second Steal Countdown for Opposing Teams) */}
        {room.phase === "STEAL_WINDOW" && (
          <div className="bg-burnt text-white border-4 border-black rounded-3xl p-6 shadow-brutal text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sunny text-black border-3 border-black shadow-brutal-sm flex items-center justify-center mx-auto text-3xl">
              ⚡
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-sunny">
                نافذة خطف السؤال (10 ثوانٍ)!
              </h2>
              <p className="text-xs font-bold text-cream">
                أخطأ الفريق الحالي أو انتهى وقته! الفرصة متاحة الآن للفرق المنافسة.
              </p>
            </div>

            {currentPlayer.team !== room.activeTeamTurn ? (
              room.powerCards?.[currentPlayer.team]?.steal ? (
                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClaimSteal}
                    className="w-full py-5 rounded-2xl bg-sunny hover:bg-yellow-300 text-black font-black text-xl border-4 border-black shadow-brutal-lg active:scale-95 transition flex items-center justify-center gap-2 animate-bounce"
                  >
                    <Zap className="w-6 h-6 fill-black text-black" />
                    <span>⚡ اخطف السؤال الآن! (10 ثوانٍ)</span>
                  </button>
                  <p className="text-[11px] font-bold text-white/90">
                    سيتم استهلاك بطاقة الخطف لفريقك وفتح 10 ثوانٍ للإجابة بنسبة 100% من النقاط!
                  </p>
                </div>
              ) : (
                <div className="bg-black/40 border-2 border-white/20 rounded-2xl p-4 text-xs font-black text-white/80">
                  ❌ لقد استهلك فريقكم بطاقة «خطف السؤال» سابقاً في هذه الجلسة.
                </div>
              )
            ) : (
              <div className="bg-black/40 border-2 border-white/20 rounded-2xl p-4 text-xs font-black text-white/80">
                ⏳ انتهت فرصة فريقكم في هذا السؤال! بانتظار نافذة خطف المنافسين...
              </div>
            )}
          </div>
        )}

        {/* ACTIVE INPUT CONTROLLERS */}
        {room.phase === "PLAYING" && !hasSubmittedAndLocked && (
          <>
            {isFrozen ? (
              <div className="bg-cyan-100 border-4 border-cyan-500 rounded-3xl p-6 text-center space-y-4 shadow-brutal animate-pulse">
                <div className="text-6xl animate-bounce">🥶🧊</div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-cyan-950">
                    تم تجميدك في هذه الجولة!
                  </h2>
                  <p className="text-xs font-black text-cyan-800 leading-relaxed">
                    قام الفريق المنافس بتجميدك 🧊 لا يمكنك الكتابة أو إرسال جواب أو ضغط الجرس في هذا السؤال.
                  </p>
                </div>
                <div className="p-3 bg-white/90 border-2 border-cyan-400 rounded-2xl text-xs font-bold text-cyan-900">
                  ❄️ شجع فريقك شفهياً! سيعود جهازك للعمل تلقائياً فور الانتقال للسؤال التالي.
                </div>
              </div>
            ) : (
              <>
                {/* MODE A: SEEN JEEM CONTROLLER (Supports Both Auto-Referee Typing & Zero-Backend Buzzer Mode) */}
                {room.majorMode === "SEEN_JEEM" && activeSeenJeemQ && (
                  <div className="bg-sunny border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-black text-sunny text-xs font-black">
                        {activeCat?.title} • {activeSeenJeemQ.points}
                      </span>
                      {room.doublePointsActive && (
                        <span className="px-2.5 py-0.5 rounded-full bg-coral border border-black text-xs font-black">
                          دبل x2 🔥
                        </span>
                      )}
                    </div>

                    {room.stealState && (
                      <div className="px-3 py-2 rounded-xl bg-burnt text-white border-2 border-black text-xs font-black flex items-center justify-center gap-1.5 animate-pulse">
                        <Zap className="w-4 h-4 fill-sunny text-sunny" />
                        <span>⚡ جولة خطف نشطة! الإجابة تحسب بنسبة 100% من النقاط!</span>
                      </div>
                    )}

                <h2 className="text-base font-black leading-snug bg-white border-3 border-black rounded-2xl p-4">
                  {activeSeenJeemQ.question}
                </h2>

                {activeSeenJeemQ.imageUrl && (
                  <PhotoQuestionViewer
                    imageUrl={activeSeenJeemQ.imageUrl}
                    caption={activeSeenJeemQ.question}
                    compact
                  />
                )}

                {isBuzzerMode ? (
                  <div className="space-y-3 pt-1">
                    {/* Case 1: Current player is the fastest buzzer */}
                    {fastestBuzz &&
                    fastestBuzz.submission.playerId === currentPlayer.id ? (
                      <div className="bg-mint border-4 border-black rounded-3xl p-6 text-center space-y-2 shadow-brutal">
                        <div className="text-4xl">🔔</div>
                        <div className="text-xl font-black text-black">
                          أنت الأسرع على الجرس!
                        </div>
                        <p className="text-xs font-bold text-black/80">
                          أجب الآن شفهياً أمام المضيف ليحتسب النقاط لفريقك (
                          {myTeamInfo.name})!
                        </p>
                      </div>
                    ) : fastestBuzz ? (
                      /* Case 2: Another player buzzed in first -> Lock this controller */
                      <div className="space-y-3">
                        <button
                          type="button"
                          disabled
                          className="w-full py-10 rounded-3xl bg-neutral-800 text-neutral-400 border-4 border-neutral-700 font-black text-xl opacity-50 pointer-events-none flex flex-col items-center justify-center gap-2"
                        >
                          <Lock className="w-8 h-8" />
                          <span>🔔 اضغط للإجابة!</span>
                        </button>
                        <div className="p-3 rounded-2xl bg-white border-2 border-black text-center text-xs font-black text-burnt">
                          🔒 تم قفل الجرس — سبقك إلى الجرس: «
                          {fastestBuzz.submission.playerName}»
                        </div>
                      </div>
                    ) : (
                      /* Case 3: Buzzer is open -> Giant "🔔 اضغط للإجابة!" Button */
                      <button
                        type="button"
                        onClick={() => {
                          playVoicePack(
                            currentPlayer.voiceId || "hype_horn",
                            true
                          );
                          submitPlayerResponse({
                            textAnswer: "__BUZZ__:" + Date.now(),
                          });
                        }}
                        className="w-full py-12 rounded-3xl bg-burnt hover:bg-orange-600 active:scale-95 text-white font-black text-2xl md:text-3xl border-4 border-black shadow-brutal-lg flex flex-col items-center justify-center gap-3 transition"
                      >
                        <Bell className="w-12 h-12 text-sunny animate-bounce" />
                        <span>🔔 اضغط للإجابة!</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!textInput.trim()) return;
                      submitPlayerResponse({ textAnswer: textInput.trim() });
                    }}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      required
                      autoFocus
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="اكتب الجواب هنا..."
                      className="w-full px-4 py-3.5 rounded-2xl border-3 border-black bg-white font-black text-base shadow-brutal-sm"
                    />

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-royal hover:bg-blue-700 text-white font-black text-base border-3 border-black shadow-brutal flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال الجواب</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* MINI-GAME #1: SPEED_TRIVIA */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "SPEED_TRIVIA" && (
                <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
                  {(() => {
                    const speedPool = getRegionalSpeedTriviaRounds(region);
                    const rawRound =
                      speedPool[
                        room.miniGameRoundIndex % speedPool.length
                      ];
                    const round = getShuffledSpeedTriviaRound(
                      rawRound,
                      room.code,
                      room.miniGameRoundIndex
                    );
                    const btnColors = [
                      "bg-royal text-white",
                      "bg-sunny text-black",
                      "bg-coral text-black",
                      "bg-mint text-black",
                    ];
                    return (
                      <>
                        <h3 className="text-base font-black">
                          {round.question}
                        </h3>
                        <div className="grid grid-cols-1 gap-2.5">
                          {round.options.map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                submitPlayerResponse({ optionIndex: idx })
                              }
                              className={`py-4 px-4 rounded-2xl border-3 border-black shadow-brutal font-black text-sm text-right active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition ${btnColors[idx]}`}
                            >
                              {idx + 1}. {opt}
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

            {/* MINI-GAME #2: QUICK_REFLEX */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "QUICK_REFLEX" && (
                <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
                  {(() => {
                    const round =
                      QUICK_REFLEX_ROUNDS[
                        room.miniGameRoundIndex % QUICK_REFLEX_ROUNDS.length
                      ];
                    return (
                      <>
                        <div className="bg-sunny border-3 border-black rounded-2xl p-3 text-center">
                          <div className="text-lg font-black">
                            {round.promptAr}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {round.grid.map((cell) => (
                            <button
                              key={cell.id}
                              type="button"
                              onClick={() =>
                                submitPlayerResponse({ reflexCellId: cell.id })
                              }
                              className="h-28 rounded-2xl bg-cream hover:bg-sunny/30 border-3 border-black shadow-brutal flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                            >
                              <ReflexShapeSvg
                                shape={cell.shape}
                                color={cell.color}
                              />
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

            {/* MINI-GAME #3: PRICE_GUESS */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "PRICE_GUESS" && (
                <div className="bg-sunny border-4 border-black rounded-3xl p-4 shadow-brutal space-y-4">
                  {(() => {
                    const priceRounds = getRegionalPriceGuessRounds(region);
                    const round =
                      priceRounds[
                        room.miniGameRoundIndex % priceRounds.length
                      ];
                    const currencySuffix =
                      region === "MA"
                        ? "درهم مغربي (DH)"
                        : edition.currencyLabel;
                    return (
                      <>
                        <EcommerceProductCard
                          round={round}
                          currencyLabel={currencySuffix}
                          compact
                        />
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const val = parseArabicNumber(numericInput);
                            if (val === null) return;
                            submitPlayerResponse({ numericValue: val });
                          }}
                          className="space-y-3"
                        >
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              required
                              value={numericInput}
                              onChange={(e) => setNumericInput(e.target.value)}
                              placeholder={`أدخل السعر بـ ${currencySuffix}`}
                              className="w-full px-4 py-3.5 rounded-2xl border-3 border-black bg-white font-mono font-black text-xl text-center"
                            />
                            <span className="mt-1.5 block text-center text-xs font-black text-black">
                              العملة: {currencySuffix}
                            </span>
                          </div>
                          <button
                            type="submit"
                            className="w-full py-3.5 rounded-2xl bg-black text-sunny font-black text-sm border-3 border-black shadow-brutal"
                          >
                            اعتماد السعر ({currencySuffix})
                          </button>
                        </form>
                      </>
                    );
                  })()}
                </div>
              )}

            {/* MINI-GAME #4: WHATS_IN_FRAME */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "WHATS_IN_FRAME" && (
                <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
                  {(() => {
                    const framePool = getRegionalWhatsInFrameRounds(region);
                    const round =
                      framePool[
                        room.miniGameRoundIndex % framePool.length
                      ];
                    return (
                      <>
                        <FrameSceneArtwork
                          artworkId={round.sceneArtworkId}
                          imageUrl={round.imageUrl}
                          title={round.prompt}
                        />
                        <h3 className="text-sm font-black">{round.prompt}</h3>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!textInput.trim()) return;
                            submitPlayerResponse({
                              textAnswer: textInput.trim(),
                            });
                          }}
                          className="space-y-3"
                        >
                          <input
                            type="text"
                            required
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="اكتب الإجابة..."
                            className="w-full px-4 py-3 rounded-2xl border-3 border-black bg-cream font-black text-base"
                          />
                          <button
                            type="submit"
                            className="w-full py-3.5 rounded-2xl bg-royal text-white font-black text-sm border-3 border-black shadow-brutal"
                          >
                            إرسال الجواب
                          </button>
                        </form>
                      </>
                    );
                  })()}
                </div>
              )}

            {/* MINI-GAME #5: CLOSEST_NUMBER */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "CLOSEST_NUMBER" && (
                <div className="bg-sunny border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
                  {(() => {
                    const closestRounds = getRegionalClosestNumberRounds(region);
                    const round =
                      closestRounds[
                        room.miniGameRoundIndex % closestRounds.length
                      ];
                    return (
                      <>
                        <h3 className="text-base font-black bg-white border-3 border-black rounded-2xl p-4">
                          {round.question}
                        </h3>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const val = parseArabicNumber(numericInput);
                            if (val === null) return;
                            submitPlayerResponse({ numericValue: val });
                          }}
                          className="space-y-3"
                        >
                          <input
                            type="text"
                            inputMode="numeric"
                            required
                            value={numericInput}
                            onChange={(e) => setNumericInput(e.target.value)}
                            placeholder={`الرقم (${round.unitLabel})`}
                            className="w-full px-4 py-3.5 rounded-2xl border-3 border-black bg-white font-mono font-black text-2xl text-center"
                          />
                          <button
                            type="submit"
                            className="w-full py-3.5 rounded-2xl bg-burnt text-white font-black text-sm border-3 border-black shadow-brutal"
                          >
                            اعتماد الرقم
                          </button>
                        </form>
                      </>
                    );
                  })()}
                </div>
              )}

            {/* MINI-GAME #6: DRAWING_CHALLENGE */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "DRAWING_CHALLENGE" && (
                <DrawingChallengeController
                  room={room}
                  currentPlayer={currentPlayer}
                  textInput={textInput}
                  setTextInput={setTextInput}
                  onSubmitGuess={(txt) =>
                    submitPlayerResponse({ textAnswer: txt })
                  }
                  onUpdateLiveCanvas={(dataUrl) => {
                    const cloned: RoomState = JSON.parse(JSON.stringify(room));
                    cloned.drawerPlayerId = currentPlayer.id;
                    cloned.liveDrawingDataUrl = dataUrl;
                    saveRoomToLocalAndBroadcast(cloned);
                    setRoom(cloned);
                  }}
                  onSkipWord={() => {
                    const cloned: RoomState = JSON.parse(JSON.stringify(room));
                    cloned.miniGameRoundIndex =
                      (cloned.miniGameRoundIndex || 0) + 1;
                    cloned.liveDrawingDataUrl = "";
                    saveRoomToLocalAndBroadcast(cloned);
                    setRoom(cloned);
                  }}
                />
              )}

            {/* MINI-GAME #7: MAP_PIN */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "MAP_PIN" && (
                <div className="bg-white border-4 border-black rounded-3xl p-4 shadow-brutal space-y-3">
                  {(() => {
                    const mapPool = getRegionalMapPinRounds(region);
                    const round =
                      mapPool[
                        room.miniGameRoundIndex % mapPool.length
                      ];
                    return (
                      <>
                        <div className="bg-sunny border-2 border-black rounded-xl p-3">
                          <div className="text-sm font-black">
                            {round.prompt}
                          </div>
                        </div>

                        <InteractiveWorldMap
                          selectedPin={selectedPin}
                          onSelectCoordinates={(lat, lng) =>
                            setSelectedPin({ lat, lng })
                          }
                        />

                        <button
                          type="button"
                          disabled={!selectedPin}
                          onClick={() => {
                            if (!selectedPin) return;
                            submitPlayerResponse({
                              pinLat: selectedPin.lat,
                              pinLng: selectedPin.lng,
                            });
                          }}
                          className={`w-full py-3.5 rounded-2xl font-black text-sm border-3 border-black flex items-center justify-center gap-2 transition ${
                            selectedPin
                              ? "bg-mint text-black shadow-brutal"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <MapPin className="w-4 h-4" />
                          <span>ثبت الدبوس</span>
                        </button>
                      </>
                    );
                  })()}
                </div>
              )}

            {/* MINI-GAME #8: SCENE_DESCRIPTION */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "SCENE_DESCRIPTION" && (
                <div className="bg-white border-4 border-black rounded-3xl p-4 shadow-brutal space-y-3">
                  {(() => {
                    const scenePool = getRegionalSceneDescriptionRounds(region);
                    const round =
                      scenePool[
                        room.miniGameRoundIndex %
                          scenePool.length
                      ];
                    return (
                      <>
                        <div className="bg-coral/40 border-2 border-black rounded-xl p-2.5 text-xs font-black">
                          {round.prompt}
                        </div>
                        <SceneDescriptionArtwork
                          sceneId={round.sceneArtworkId}
                          imageUrl={round.imageUrl}
                          title={round.title}
                        />
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!textInput.trim()) return;
                            submitPlayerResponse({
                              textAnswer: textInput.trim(),
                            });
                          }}
                          className="space-y-2.5"
                        >
                          <textarea
                            rows={3}
                            required
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder="صف العناصر الموجودة داخل الصورة..."
                            className="w-full p-3 rounded-2xl border-3 border-black bg-cream font-bold text-sm"
                          />
                          <button
                            type="submit"
                            className="w-full py-3.5 rounded-2xl bg-royal text-white font-black text-sm border-3 border-black shadow-brutal"
                          >
                            إرسال الوصف
                          </button>
                        </form>
                      </>
                    );
                  })()}
                </div>
              )}
              </>
            )}
          </>
        )}

        {/* LOCKED & REVEAL_AND_SCORE & LEADERBOARD */}
        {room.phase === "LOCKED" && (
          <div className="bg-black text-sunny border-4 border-black rounded-3xl p-6 text-center font-black text-lg">
            انتهى الوقت! تابع النتيجة على الشاشة الرئيسية...
          </div>
        )}

        {room.phase === "REVEAL_AND_SCORE" && (
          <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-brutal text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sunny border-3 border-black flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7 text-black" />
            </div>
            <h2 className="text-xl font-black">نتيجة الجولة</h2>

            {room.majorMode === "SEEN_JEEM" && currentQuestion && (
              <div className="p-3 rounded-xl bg-sunny/40 border-2 border-black text-xs font-black text-right space-y-1">
                <div>السؤال: {currentQuestion.text}</div>
                <div className="text-royal">
                  الجواب الصحيح: {currentQuestion.displayAnswer}
                </div>
              </div>
            )}

            <p className="text-xs font-bold text-gray-700 bg-cream border-2 border-black rounded-xl p-3">
              {room.roundSummaryText === BUZZER_MODE_MARKER
                ? "تم احتساب النقاط يدوياً بواسطة المضيف"
                : room.roundSummaryText}
            </p>

            {mySubmission && !isMySubBuzz ? (
              <div
                className={`p-4 rounded-2xl border-3 border-black space-y-1 ${
                  mySubmission.isCorrect ? "bg-mint/35" : "bg-coral/30"
                }`}
              >
                <div className="font-black text-base">
                  +{mySubmission.pointsAwarded || 0} نقطة
                </div>
                {mySubmission.refereeVerdict && (
                  <div className="text-xs font-bold">
                    {mySubmission.refereeVerdict.verdictDetail}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-gray-100 border-2 border-black text-xs font-bold">
                {adapterState.manualAwardedInRound ||
                room.roundSummaryText.includes("تم احتساب النقاط يدوياً") ||
                isMySubBuzz
                  ? "تم احتساب النقاط يدوياً بواسطة المضيف"
                  : "لم ترسل إجابة في هذه الجولة."}
              </div>
            )}
          </div>
        )}

        {room.phase === "LEADERBOARD" && (
          <div className="bg-sunny border-4 border-black rounded-3xl p-6 shadow-brutal text-center space-y-4">
            <Trophy className="w-11 h-11 mx-auto text-black" />
            <div
              className="inline-block px-4 py-1 rounded-full text-white font-black text-sm border-2 border-black"
              style={{ backgroundColor: myTeamInfo.color }}
            >
              {myTeamInfo.name}
            </div>
            <h2 className="text-2xl font-black">
              نقاط فريقك: {myTeamInfo.score}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold pt-2">
              {activeTeams.map((t, idx) => (
                <span
                  key={t.id}
                  className="px-2.5 py-1 rounded-xl bg-white border-2 border-black"
                >
                  <strong style={{ color: t.color }}>{t.name}</strong>: {t.score} نقطة
                  {idx < activeTeams.length - 1 ? "" : ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Controller Footer with Discrete DevDrawer */}
      <footer className="bg-white border-t-4 border-black px-4 py-2.5 flex items-center justify-between text-xs font-black">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-gray-700 hover:text-black"
        >
          <Home className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>
        <DevDrawer
          roomCode={room.code}
          players={room.players}
          activePlayerId={currentPlayer.id}
          onSwitchActivePlayer={(p) => setCurrentPlayer(p)}
        />
      </footer>

      {/* Rival Player Freeze Modal */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-black/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-200 border-2 border-black flex items-center justify-center">
                  <Snowflake className="w-5 h-5 text-cyan-800" />
                </div>
                <h3 className="font-black text-sm text-black">
                  تجميد لاعب من الفريق المنافس
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFreezeModal(false)}
                className="text-gray-400 hover:text-black font-black text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-gray-700 leading-relaxed">
              اختر لاعباً من الفرق المنافسة لتعطيل هاتفه وجرسه في هذا السؤال بالكامل:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {room.players
                .filter((p) => p.team !== currentPlayer.team)
                .map((rival) => {
                  const rivalTeam = room.teams[rival.team];
                  return (
                    <button
                      key={rival.id}
                      type="button"
                      onClick={() => handleFreezePlayer(rival.id)}
                      className="w-full p-2.5 rounded-2xl border-2 border-black bg-cream hover:bg-cyan-50 flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-2">
                        <CartoonAvatar avatarId={rival.avatar} size="xs" />
                        <div className="text-right">
                          <div className="font-black text-xs text-black">
                            {rival.name}
                          </div>
                          <div
                            className="text-[10px] font-bold"
                            style={{ color: rivalTeam?.color || "#3B66B4" }}
                          >
                            {rivalTeam?.name || rival.team}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-cyan-400 text-black border-2 border-black font-black text-[10px]">
                        🧊 تجميد
                      </span>
                    </button>
                  );
                })}
              {room.players.filter((p) => p.team !== currentPlayer.team).length === 0 && (
                <div className="p-4 text-center text-xs font-bold text-gray-500">
                  لا يوجد لاعبون في الفرق المنافسة بعد.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFreezeModal(false)}
              className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-black font-black text-xs border-2 border-black"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS FOR MINI-GAMES #2 (SHAPES) AND #6 (CANVAS DRAWING PAD)
// ============================================================================

function ReflexShapeSvg({
  shape,
  color,
}: {
  shape: ReflexShape;
  color: ReflexColor;
}) {
  const colorHex: Record<ReflexColor, string> = {
    blue: "#3B66B4",
    red: "#EF4444",
    yellow: "#F4D03F",
    green: "#2ECC71",
    orange: "#E65C2E",
    purple: "#9333EA",
  };
  const fill = colorHex[color];

  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {shape === "square" && (
        <rect
          x="16"
          y="16"
          width="68"
          height="68"
          rx="8"
          fill={fill}
          stroke="#000"
          strokeWidth="6"
        />
      )}
      {shape === "circle" && (
        <circle
          cx="50"
          cy="50"
          r="36"
          fill={fill}
          stroke="#000"
          strokeWidth="6"
        />
      )}
      {shape === "triangle" && (
        <polygon
          points="50,14 88,84 12,84"
          fill={fill}
          stroke="#000"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      )}
      {shape === "diamond" && (
        <polygon
          points="50,10 88,50 50,90 12,50"
          fill={fill}
          stroke="#000"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      )}
      {shape === "hexagon" && (
        <polygon
          points="30,14 70,14 90,50 70,86 30,86 10,50"
          fill={fill}
          stroke="#000"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      )}
      {shape === "star" && (
        <polygon
          points="50,10 61,36 90,38 67,57 75,86 50,70 25,86 33,57 10,38 39,36"
          fill={fill}
          stroke="#000"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function DrawingChallengeController({
  room,
  currentPlayer,
  textInput,
  setTextInput,
  onSubmitGuess,
  onUpdateLiveCanvas,
  onSkipWord,
}: {
  room: RoomState;
  currentPlayer: Player;
  textInput: string;
  setTextInput: (val: string) => void;
  onSubmitGuess: (txt: string) => void;
  onUpdateLiveCanvas: (dataUrl: string) => void;
  onSkipWord: () => void;
}) {
  const { region } = useEdition();
  const drawRounds = getRegionalDrawingChallengeRounds(region);
  const round =
    drawRounds[
      room.miniGameRoundIndex % drawRounds.length
    ];
  const isDrawer = room.drawerPlayerId === currentPlayer.id;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [sentToast, setSentToast] = useState(false);

  const handleFinishDrawing = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    onUpdateLiveCanvas(dataUrl);
    setSentToast(true);
    setTimeout(() => setSentToast(false), 3000);
  };

  useEffect(() => {
    if (!isDrawer || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFF9E6";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [isDrawer]);

  const getPos = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0] || e.changedTouches[0];
      return {
        x: ((t.clientX - rect.left) / rect.width) * canvas.width,
        y: ((t.clientY - rect.top) / rect.height) * canvas.height,
      };
    }
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startStroke = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    setHistory((prev) => [...prev.slice(-8), canvasRef.current!.toDataURL()]);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const moveStroke = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endStroke = () => {
    if (!isDrawing || !canvasRef.current) return;
    setIsDrawing(false);
    onUpdateLiveCanvas(canvasRef.current.toDataURL());
  };

  const handleUndo = () => {
    if (!canvasRef.current || history.length === 0) return;
    const lastUrl = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx || !canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
      onUpdateLiveCanvas(canvasRef.current.toDataURL());
    };
    img.src = lastUrl;
  };

  const handleClear = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFF9E6";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onUpdateLiveCanvas(canvasRef.current.toDataURL());
  };

  if (isDrawer) {
    return (
      <div className="bg-sunny border-4 border-black rounded-3xl p-4 shadow-brutal space-y-3">
        <div className="bg-black text-sunny rounded-2xl p-3 text-center">
          <div className="text-[11px] font-bold">ارسم الكلمة السرية:</div>
          <div className="text-xl font-black mt-0.5">«{round.secretWord}»</div>
        </div>

        <canvas
          ref={canvasRef}
          width={360}
          height={260}
          onMouseDown={startStroke}
          onMouseMove={moveStroke}
          onMouseUp={endStroke}
          onMouseLeave={endStroke}
          onTouchStart={startStroke}
          onTouchMove={moveStroke}
          onTouchEnd={endStroke}
          className="w-full h-56 bg-cream border-3 border-black rounded-2xl touch-none cursor-crosshair"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 bg-white border-2 border-black rounded-2xl p-2.5">
          <div className="flex items-center gap-1.5">
            {[
              "#000000",
              "#E65C2E",
              "#3B66B4",
              "#2ECC71",
              "#F4D03F",
              "#DE7A7A",
            ].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBrushColor(c)}
                className={`w-7 h-7 rounded-full border-2 border-black ${
                  brushColor === c ? "scale-110 ring-2 ring-black" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBrushColor("#FFF9E6")}
              title="ممحاة"
              className="p-1.5 rounded-lg bg-cream border border-black"
            >
              <Eraser className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleUndo}
              title="تراجع"
              className="p-1.5 rounded-lg bg-cream border border-black"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              title="مسح"
              className="p-1.5 rounded-lg bg-coral border border-black"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions right below canvas */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleFinishDrawing}
            className="py-3 px-2 rounded-2xl bg-mint text-black font-black text-xs border-3 border-black shadow-brutal-sm flex items-center justify-center gap-1.5 hover:bg-mint/80 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>✔ خلصت الرسمة (إرسال للجميع)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSkipWord();
              handleClear();
            }}
            className="py-3 px-2 rounded-2xl bg-white text-black font-black text-xs border-3 border-black shadow-brutal-sm flex items-center justify-center gap-1.5 hover:bg-cream transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-burnt" />
            <span>🔄 كلمة ثانية / ما عرفت أرسمها</span>
          </button>
        </div>

        {sentToast && (
          <div className="text-center text-xs font-black text-emerald-900 bg-white border-2 border-black rounded-xl py-1.5 shadow-brutal-sm animate-pulse">
            ✔ تم إرسال الرسمة للجميع بنجاح! 🎨
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-4 shadow-brutal space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-royal">
          التصنيف: {round.categoryHint}
        </span>
        <button
          type="button"
          onClick={() => onUpdateLiveCanvas(room.liveDrawingDataUrl || "")}
          className="px-2.5 py-1 rounded-lg bg-sunny border border-black text-[11px] font-black"
        >
          ابدأ الرسم من هاتفك
        </button>
      </div>

      {room.liveDrawingDataUrl && (
        <div className="bg-cream border-3 border-black rounded-2xl h-44 overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={room.liveDrawingDataUrl}
            alt="رسم مباشر"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!textInput.trim()) return;
          onSubmitGuess(textInput.trim());
        }}
        className="space-y-2.5"
      >
        <input
          type="text"
          required
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="اكتب تخمينك للرسمة..."
          className="w-full px-4 py-3 rounded-2xl border-3 border-black bg-cream font-black text-base"
        />
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-royal text-white font-black text-sm border-3 border-black shadow-brutal"
        >
          إرسال التخمين
        </button>
      </form>
    </div>
  );
}
