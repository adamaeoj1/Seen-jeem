"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  ArrowLeftRight,
  Clock,
  Flame,
  Gamepad2,
  Home,
  Play,
  QrCode,
  ShieldCheck,
  Sparkles,
  Trophy,
  Tv,
  Volume2,
  VolumeX,
  Wand2,
  X,
} from "lucide-react";
import {
  applyHostSeenJeemOverride,
  AVATAR_OPTIONS,
  createInitialRoomState,
  getActiveSeenJeemQuestion,
  getAllCategories,
  gradeCurrentRound,
  loadRoomFromLocal,
  loadUserSubscription,
  MINI_GAMES_META,
  Player,
  PlayerSubmission,
  RoomState,
  saveRoomToLocalAndBroadcast,
  saveUserSubscription,
  subscribeToRoomUpdates,
  TeamId,
} from "@/lib/gameEngine";
import {
  CLOSEST_NUMBER_ROUNDS,
  DRAWING_CHALLENGE_ROUNDS,
  MAP_PIN_ROUNDS,
  MiniGameId,
  PRICE_GUESS_ROUNDS,
  QUICK_REFLEX_ROUNDS,
  SCENE_DESCRIPTION_ROUNDS,
  SeenJeemCategory,
  SeenJeemQuestion,
  SPEED_TRIVIA_ROUNDS,
  WHATS_IN_FRAME_ROUNDS,
} from "@/data/seedQuestions";
import {
  FrameSceneArtwork,
  ProductArtwork,
  SceneDescriptionArtwork,
} from "@/components/GameArtwork";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import { CustomBuilderModal } from "@/components/CustomBuilderModal";
import { CartoonAvatar } from "@/components/CartoonAvatars";
import {
  playCorrectChime,
  playTickSound,
  playVoicePack,
  VOICE_PACKS,
} from "@/lib/soundEffects";
import { DevDrawer } from "@/components/DevDrawer";

export default function HostRoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const roomCode = (params?.code || "K7Q2").toUpperCase().trim();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [recentJoinToast, setRecentJoinToast] = useState<Player | null>(null);

  // Initialize or load room + subscribe to real-time updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/play/${roomCode}`);
    }
    const sub = loadUserSubscription();
    let existing = loadRoomFromLocal(roomCode);
    if (!existing) {
      existing = createInitialRoomState(
        roomCode,
        sub.tier,
        sub.customCategories || []
      );
      saveRoomToLocalAndBroadcast(existing);
    }
    setRoom(existing);

    const unsubscribe = subscribeToRoomUpdates(
      roomCode,
      (updated) => {
        setRoom(updated);
      },
      (joinedPlayer) => {
        // Play the player's chosen Voice/Sound effect upon entry!
        playVoicePack(joinedPlayer.voiceId || "hype_horn", true);
        setRecentJoinToast(joinedPlayer);
        setTimeout(() => setRecentJoinToast(null), 3500);
      }
    );

    return () => unsubscribe();
  }, [roomCode]);

  // Countdown timer during PLAYING phase
  useEffect(() => {
    if (!room || room.phase !== "PLAYING") return;

    const updateTimer = () => {
      const elapsedSec = Math.floor((Date.now() - room.roundStartedAt) / 1000);
      const remaining = Math.max(0, room.roundDurationSec - elapsedSec);
      setTimeLeft(remaining);

      if (remaining > 0 && remaining <= 5) {
        playTickSound(room.settings?.soundEnabled ?? true);
      }

      if (remaining <= 0) {
        handleLockAndReveal(room);
      }
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.phase, room?.roundStartedAt, room?.roundDurationSec]);

  const updateRoom = (mutator: (draft: RoomState) => RoomState) => {
    setRoom((prev) => {
      if (!prev) return prev;
      const cloned: RoomState = JSON.parse(JSON.stringify(prev));
      const next = mutator(cloned);
      saveRoomToLocalAndBroadcast(next);
      return next;
    });
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore
    }
  };

  const handleLockAndReveal = (currentRoom: RoomState) => {
    const lockedState: RoomState = {
      ...currentRoom,
      phase: "LOCKED",
      updatedAt: Date.now(),
    };
    saveRoomToLocalAndBroadcast(lockedState);
    setRoom(lockedState);

    setTimeout(() => {
      const graded = gradeCurrentRound(lockedState);
      saveRoomToLocalAndBroadcast(graded);
      setRoom(graded);
      playCorrectChime(graded.settings?.soundEnabled ?? true);
      triggerConfetti();
    }, 600);
  };

  // Team & Player management
  const handleSwitchPlayerTeam = (playerId: string) => {
    updateRoom((draft) => {
      const p = draft.players.find((pl) => pl.id === playerId);
      if (p) {
        p.team = p.team === "team1" ? "team2" : "team1";
      }
      return draft;
    });
  };

  const handleMakeCaptain = (playerId: string) => {
    updateRoom((draft) => {
      const target = draft.players.find((pl) => pl.id === playerId);
      if (!target) return draft;
      draft.players.forEach((pl) => {
        if (pl.team === target.team) {
          pl.isCaptain = pl.id === playerId;
        }
      });
      return draft;
    });
  };

  const handleRemovePlayer = (playerId: string) => {
    updateRoom((draft) => {
      draft.players = draft.players.filter((p) => p.id !== playerId);
      return draft;
    });
  };

  // Hidden DevDrawer simulation helpers
  const handleAddSimulatedPlayer = () => {
    const sampleNames = ["فهد", "سارة", "فيصل", "ريم", "حمد", "لمى", "عزوز"];
    updateRoom((draft) => {
      const t1Count = draft.players.filter((p) => p.team === "team1").length;
      const t2Count = draft.players.filter((p) => p.team === "team2").length;
      const targetTeam: TeamId = t1Count <= t2Count ? "team1" : "team2";
      const idx = draft.players.length;
      const randomName = sampleNames[idx % sampleNames.length];
      const randomAvatar = AVATAR_OPTIONS[idx % AVATAR_OPTIONS.length];
      const randomVoice = VOICE_PACKS[idx % VOICE_PACKS.length].id;

      const newBot: Player = {
        id: "bot-" + Math.random().toString(36).slice(2, 8),
        name: randomName,
        avatar: randomAvatar,
        voiceId: randomVoice,
        team: targetTeam,
        isCaptain: false,
        isOnline: true,
        score: 0,
        connectedAt: Date.now(),
        isBot: true,
      };
      draft.players.push(newBot);
      playVoicePack(randomVoice, draft.settings?.soundEnabled ?? true);
      return draft;
    });
  };

  const handleSimulatePlayerSubmissions = () => {
    if (!room) return;
    updateRoom((draft) => {
      draft.players.forEach((p, idx) => {
        if (draft.submissions[p.id]) return;

        const sub: PlayerSubmission = {
          playerId: p.id,
          playerName: p.name,
          team: p.team,
          submittedAt: Date.now(),
          elapsedMs: 2800 + idx * 1700,
        };

        if (draft.majorMode === "SEEN_JEEM") {
          const { question } = getActiveSeenJeemQuestion(draft);
          if (question) {
            if (idx === 0) {
              const baseAns = question.acceptedAnswers[0] || "";
              sub.textAnswer = baseAns.startsWith("ال")
                ? baseAns.slice(2)
                : baseAns;
            } else {
              sub.textAnswer =
                question.rejectedTraps?.[0] || "إجابة غير مؤكدة";
            }
          }
        } else {
          const gId = draft.activeMiniGameId;
          const rIdx = draft.miniGameRoundIndex;
          if (gId === "SPEED_TRIVIA") {
            const r = SPEED_TRIVIA_ROUNDS[rIdx % SPEED_TRIVIA_ROUNDS.length];
            sub.optionIndex =
              idx === 0 ? r.correctIndex : (r.correctIndex + 1) % 4;
          } else if (gId === "QUICK_REFLEX") {
            const r = QUICK_REFLEX_ROUNDS[rIdx % QUICK_REFLEX_ROUNDS.length];
            sub.reflexCellId = idx === 0 ? r.targetCellId : r.grid[0].id;
          } else if (gId === "PRICE_GUESS") {
            const r = PRICE_GUESS_ROUNDS[rIdx % PRICE_GUESS_ROUNDS.length];
            sub.numericValue =
              idx === 0
                ? Math.round(r.actualPriceSar * 0.97)
                : Math.round(r.actualPriceSar * 1.3);
          } else if (gId === "WHATS_IN_FRAME") {
            const r =
              WHATS_IN_FRAME_ROUNDS[rIdx % WHATS_IN_FRAME_ROUNDS.length];
            sub.textAnswer =
              idx === 0
                ? r.acceptedAnswers[1] || r.acceptedAnswers[0]
                : r.rejectedTraps[0] || "غير معروف";
          } else if (gId === "CLOSEST_NUMBER") {
            const r =
              CLOSEST_NUMBER_ROUNDS[rIdx % CLOSEST_NUMBER_ROUNDS.length];
            sub.numericValue =
              idx === 0 ? r.correctNumber - 2 : r.correctNumber + 22;
          } else if (gId === "DRAWING_CHALLENGE") {
            const r =
              DRAWING_CHALLENGE_ROUNDS[rIdx % DRAWING_CHALLENGE_ROUNDS.length];
            if (p.id !== draft.drawerPlayerId) {
              sub.textAnswer = idx % 2 === 1 ? r.acceptedAnswers[0] : "سفينة";
            }
          } else if (gId === "MAP_PIN") {
            const r = MAP_PIN_ROUNDS[rIdx % MAP_PIN_ROUNDS.length];
            sub.pinLat = r.targetLat + (idx === 0 ? 1.2 : -7.5);
            sub.pinLng = r.targetLng + (idx === 0 ? -1.4 : 9.8);
          } else if (gId === "SCENE_DESCRIPTION") {
            const r =
              SCENE_DESCRIPTION_ROUNDS[rIdx % SCENE_DESCRIPTION_ROUNDS.length];
            sub.textAnswer =
              idx === 0
                ? r.tags
                    .slice(0, 4)
                    .map((t) => t.label)
                    .join(" و ")
                : r.tags[0]?.label || "مشهد";
          }
        }

        draft.submissions[p.id] = sub;
      });
      return draft;
    });
  };

  // Toggle Seen Jeem Category Selection (up to 6)
  const handleToggleCategory = (catId: string) => {
    updateRoom((draft) => {
      const exists = draft.selectedCategoryIds.includes(catId);
      if (exists) {
        if (draft.selectedCategoryIds.length > 1) {
          draft.selectedCategoryIds = draft.selectedCategoryIds.filter(
            (id) => id !== catId
          );
        }
      } else {
        if (draft.selectedCategoryIds.length < 6) {
          draft.selectedCategoryIds.push(catId);
        } else {
          draft.selectedCategoryIds = [
            ...draft.selectedCategoryIds.slice(1),
            catId,
          ];
        }
      }
      return draft;
    });
  };

  // Select a Seen Jeem Question from the 36-grid board
  const handleSelectSeenJeemQuestion = (
    catId: string,
    question: SeenJeemQuestion
  ) => {
    updateRoom((draft) => {
      draft.majorMode = "SEEN_JEEM";
      draft.activeCategoryId = catId;
      draft.activeQuestionId = question.id;
      draft.submissions = {};
      draft.roundSummaryText = "";
      draft.roundDurationSec = draft.settings?.timerSec || 45;
      draft.roundStartedAt = Date.now();
      draft.phase = "PLAYING";
      return draft;
    });
  };

  // Start a Mini-Game Round
  const handleStartMiniGameRound = (
    gameId: MiniGameId,
    roundIndex = 0,
    showIntroFirst = true
  ) => {
    const meta =
      MINI_GAMES_META.find((m) => m.id === gameId) || MINI_GAMES_META[0];
    updateRoom((draft) => {
      draft.majorMode = "MINI_GAMES";
      draft.activeMiniGameId = gameId;
      draft.miniGameRoundIndex = roundIndex;
      draft.submissions = {};
      draft.liveDrawingDataUrl = null;
      draft.roundSummaryText = "";
      draft.roundDurationSec = meta.defaultDurationSec;
      draft.roundStartedAt = Date.now();
      if (draft.players.length > 0) {
        draft.drawerPlayerId =
          draft.players[roundIndex % draft.players.length].id;
      }
      draft.phase = showIntroFirst ? "ROUND_INTRO" : "PLAYING";
      return draft;
    });
  };

  const handleAddCustomCategory = (newCat: SeenJeemCategory) => {
    const sub = loadUserSubscription();
    sub.customCategories = [...(sub.customCategories || []), newCat];
    saveUserSubscription(sub);

    updateRoom((draft) => {
      draft.customCategories = [...(draft.customCategories || []), newCat];
      if (draft.selectedCategoryIds.length < 6) {
        draft.selectedCategoryIds.push(newCat.id);
      } else {
        draft.selectedCategoryIds[draft.selectedCategoryIds.length - 1] =
          newCat.id;
      }
      return draft;
    });
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-royal text-white flex items-center justify-center p-8 font-black text-2xl">
        جاري فتح شاشة المضيف...
      </div>
    );
  }

  const allCategories = getAllCategories(room);
  const selectedCategories = allCategories.filter((c) =>
    room.selectedCategoryIds.includes(c.id)
  );
  const { category: activeCat, question: activeSeenJeemQ } =
    getActiveSeenJeemQuestion(room);
  const activeMiniGameMeta =
    MINI_GAMES_META.find((m) => m.id === room.activeMiniGameId) ||
    MINI_GAMES_META[0];

  const team1Players = room.players.filter((p) => p.team === "team1");
  const team2Players = room.players.filter((p) => p.team === "team2");
  const submissionsList = Object.values(room.submissions);
  const soundEnabled = room.settings?.soundEnabled ?? true;

  return (
    <div className="min-h-screen bg-cream text-black flex flex-col">
      {/* Live Player Join Pop-In Notification */}
      {recentJoinToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-sunny border-4 border-black rounded-full px-5 py-2.5 shadow-brutal flex items-center gap-3"
        >
          <CartoonAvatar avatarId={recentJoinToast.avatar} size="sm" />
          <span className="font-black text-sm">
            انضم «{recentJoinToast.name}» إلى{" "}
            {recentJoinToast.team === "team1"
              ? room.teams.team1.name
              : room.teams.team2.name}
            !
          </span>
        </motion.div>
      )}

      {/* Top Host Navigation Bar */}
      <header className="bg-black text-white border-b-4 border-black px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Home, Room Code, QR Button, Sound Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 transition"
              title="الرئيسية"
            >
              <Home className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 bg-sunny text-black px-4 py-1.5 rounded-2xl border-2 border-white shadow-brutal-sm">
              <span className="text-xs font-black">رمز الغرفة:</span>
              <span
                dir="ltr"
                className="font-mono text-xl font-black tracking-widest"
              >
                {room.code}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-royal hover:bg-blue-600 text-white font-black text-xs border-2 border-white flex items-center gap-1.5 transition"
            >
              <QrCode className="w-4 h-4 text-sunny" />
              <span>باركود الانضمام</span>
            </button>

            <button
              type="button"
              onClick={() =>
                updateRoom((d) => {
                  d.settings = {
                    ...d.settings,
                    soundEnabled: !(d.settings?.soundEnabled ?? true),
                  };
                  return d;
                })
              }
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border-2 border-white/25 transition"
              title={soundEnabled ? "كتم الصوت" : "تفعيل الصوت"}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-sunny" />
              ) : (
                <VolumeX className="w-4 h-4 text-coral" />
              )}
            </button>
          </div>

          {/* Right: Clean Stage Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                updateRoom((d) => {
                  d.phase = "LOBBY";
                  return d;
                })
              }
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 transition ${
                room.phase === "LOBBY"
                  ? "bg-sunny text-black border-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              اللوبي ({room.players.length})
            </button>

            <button
              type="button"
              onClick={() =>
                updateRoom((d) => {
                  d.majorMode = "SEEN_JEEM";
                  d.phase = "MODE_SELECT";
                  return d;
                })
              }
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 transition ${
                room.majorMode === "SEEN_JEEM" && room.phase !== "LOBBY"
                  ? "bg-sunny text-black border-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              سين جيم
            </button>

            <button
              type="button"
              onClick={() =>
                updateRoom((d) => {
                  d.majorMode = "MINI_GAMES";
                  d.phase = "MODE_SELECT";
                  return d;
                })
              }
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 transition ${
                room.majorMode === "MINI_GAMES" && room.phase !== "LOBBY"
                  ? "bg-sunny text-black border-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              ألعاب قمنم
            </button>

            <button
              type="button"
              onClick={() =>
                updateRoom((d) => {
                  d.phase = "LEADERBOARD";
                  return d;
                })
              }
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 transition ${
                room.phase === "LEADERBOARD"
                  ? "bg-coral text-black border-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              الصدارة
            </button>
          </div>
        </div>
      </header>

      {/* Scoreboard Strip */}
      <div className="bg-white border-b-4 border-black px-4 md:px-8 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Team 1 */}
          <div
            className="md:col-span-5 p-3 rounded-2xl border-3 border-black flex items-center justify-between transition"
            style={{
              backgroundColor:
                room.activeTeamTurn === "team1" && room.majorMode === "SEEN_JEEM"
                  ? room.teams.team1.color
                  : `${room.teams.team1.color}22`,
              color:
                room.activeTeamTurn === "team1" && room.majorMode === "SEEN_JEEM"
                  ? "#FFFFFF"
                  : "#000000",
            }}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-black text-base md:text-lg">
                  {room.teams.team1.name}
                </span>
                {room.activeTeamTurn === "team1" &&
                  room.majorMode === "SEEN_JEEM" && (
                    <span className="px-2 py-0.5 rounded-full bg-sunny text-black text-[10px] font-black border border-black">
                      دور الاختيار
                    </span>
                  )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {team1Players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSwitchPlayerTeam(p.id)}
                    title="اضغط لنقل اللاعب للفريق الآخر"
                    className="px-2 py-0.5 rounded-full bg-white text-black border border-black text-[11px] font-black flex items-center gap-1 shadow-sm"
                  >
                    <CartoonAvatar avatarId={p.avatar} size="xs" />
                    <span>{p.name}</span>
                    {p.isCaptain && <span>👑</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl md:text-3xl font-black font-mono">
                {room.teams.team1.score}
              </div>
              <div className="text-[10px] font-bold opacity-80">نقطة</div>
            </div>
          </div>

          {/* Center Double Points / Active Round Indicator */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center">
            {room.majorMode === "SEEN_JEEM" ? (
              <button
                type="button"
                onClick={() =>
                  updateRoom((d) => {
                    d.doublePointsActive = !d.doublePointsActive;
                    return d;
                  })
                }
                className={`px-4 py-2 rounded-2xl border-3 border-black font-black text-xs flex items-center gap-1.5 transition ${
                  room.doublePointsActive
                    ? "bg-sunny text-black shadow-brutal scale-105"
                    : "bg-cream text-black hover:bg-sunny/50"
                }`}
              >
                <Flame className="w-4 h-4 text-burnt" />
                <span>
                  {room.doublePointsActive ? "دبل النقاط x2 🔥" : "دبل النقاط x2"}
                </span>
              </button>
            ) : (
              <div className="px-3 py-1.5 rounded-2xl bg-sunny border-2 border-black text-xs font-black">
                {activeMiniGameMeta.title} • جولة #{room.miniGameRoundIndex + 1}
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div
            className="md:col-span-5 p-3 rounded-2xl border-3 border-black flex items-center justify-between transition"
            style={{
              backgroundColor:
                room.activeTeamTurn === "team2" && room.majorMode === "SEEN_JEEM"
                  ? room.teams.team2.color
                  : `${room.teams.team2.color}22`,
              color:
                room.activeTeamTurn === "team2" && room.majorMode === "SEEN_JEEM"
                  ? "#FFFFFF"
                  : "#000000",
            }}
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-black text-base md:text-lg">
                  {room.teams.team2.name}
                </span>
                {room.activeTeamTurn === "team2" &&
                  room.majorMode === "SEEN_JEEM" && (
                    <span className="px-2 py-0.5 rounded-full bg-sunny text-black text-[10px] font-black border border-black">
                      دور الاختيار
                    </span>
                  )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {team2Players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSwitchPlayerTeam(p.id)}
                    title="اضغط لنقل اللاعب للفريق الآخر"
                    className="px-2 py-0.5 rounded-full bg-white text-black border border-black text-[11px] font-black flex items-center gap-1 shadow-sm"
                  >
                    <CartoonAvatar avatarId={p.avatar} size="xs" />
                    <span>{p.name}</span>
                    {p.isCaptain && <span>👑</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-left">
              <div className="text-2xl md:text-3xl font-black font-mono">
                {room.teams.team2.score}
              </div>
              <div className="text-[10px] font-bold opacity-80">نقطة</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {/* ================================================================
            STEP 2: REAL-TIME WAITING LOBBY
        ================================================================ */}
        {room.phase === "LOBBY" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Scannable QR Code Card */}
            <div className="lg:col-span-4 bg-sunny border-4 border-black rounded-3xl p-6 shadow-brutal-lg flex flex-col justify-between text-center">
              <div className="space-y-4">
                <span className="px-3.5 py-1 rounded-full bg-black text-sunny text-xs font-black inline-block">
                  امسح الباركود بجوالك للانضمام
                </span>
                <div className="bg-white border-4 border-black rounded-2xl p-4 inline-block mx-auto shadow-brutal">
                  <QRCodeSVG
                    value={joinUrl || `https://seenjeem.app/play/${room.code}`}
                    size={195}
                    level="M"
                  />
                </div>
                <div className="bg-white border-3 border-black rounded-2xl p-3">
                  <div className="text-xs font-bold text-gray-600">
                    رمز الغرفة المباشر:
                  </div>
                  <div
                    dir="ltr"
                    className="text-3xl font-mono font-black tracking-widest mt-0.5"
                  >
                    {room.code}
                  </div>
                </div>
              </div>

              <p className="text-xs font-bold text-black/80 mt-4">
                اختر شخصيتك الكرتونية وصوتك من جوالك ليظهر اسمك فوراً على الشاشة!
              </p>
            </div>

            {/* Interactive Team Rosters */}
            <div className="lg:col-span-8 bg-white border-4 border-black rounded-3xl p-6 shadow-brutal-lg flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-black">قائمة اللاعبين والفرق</h2>
                    <p className="text-xs font-bold text-gray-600">
                      اضغط على اللاعب لتبديل فريقه أو تعيين الكابتن (👑) أو سماع صوته
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-cream border-2 border-black text-xs font-black">
                    المتصلون: {room.players.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Team 1 Roster */}
                  <div
                    className="border-3 border-black rounded-2xl p-4 space-y-3"
                    style={{ backgroundColor: `${room.teams.team1.color}15` }}
                  >
                    <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
                      <span className="font-black text-lg">
                        {room.teams.team1.name}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-white text-xs font-black border border-black"
                        style={{ backgroundColor: room.teams.team1.color }}
                      >
                        {team1Players.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {team1Players.map((p) => (
                        <PlayerLobbyPill
                          key={p.id}
                          player={p}
                          onPlayVoice={() =>
                            playVoicePack(p.voiceId || "hype_horn", true)
                          }
                          onSwitchTeam={() => handleSwitchPlayerTeam(p.id)}
                          onMakeCaptain={() => handleMakeCaptain(p.id)}
                          onRemove={() => handleRemovePlayer(p.id)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Team 2 Roster */}
                  <div
                    className="border-3 border-black rounded-2xl p-4 space-y-3"
                    style={{ backgroundColor: `${room.teams.team2.color}15` }}
                  >
                    <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
                      <span className="font-black text-lg">
                        {room.teams.team2.name}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-white text-xs font-black border border-black"
                        style={{ backgroundColor: room.teams.team2.color }}
                      >
                        {team2Players.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {team2Players.map((p) => (
                        <PlayerLobbyPill
                          key={p.id}
                          player={p}
                          onPlayVoice={() =>
                            playVoicePack(p.voiceId || "hype_horn", true)
                          }
                          onSwitchTeam={() => handleSwitchPlayerTeam(p.id)}
                          onMakeCaptain={() => handleMakeCaptain(p.id)}
                          onRemove={() => handleRemovePlayer(p.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Session CTAs */}
              <div className="pt-4 border-t-2 border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    updateRoom((d) => {
                      d.majorMode = "SEEN_JEEM";
                      d.phase = "MODE_SELECT";
                      return d;
                    })
                  }
                  className="py-4 px-5 rounded-2xl bg-royal hover:bg-blue-700 text-white font-black text-base border-3 border-black shadow-brutal flex items-center justify-center gap-2 transition"
                >
                  <Tv className="w-5 h-5 text-sunny" />
                  <span>ابدأ لوحة سين جيم</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    updateRoom((d) => {
                      d.majorMode = "MINI_GAMES";
                      d.phase = "MODE_SELECT";
                      return d;
                    })
                  }
                  className="py-4 px-5 rounded-2xl bg-sunny hover:bg-yellow-300 text-black font-black text-base border-3 border-black shadow-brutal flex items-center justify-center gap-2 transition"
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>ابدأ ألعاب قمنم</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            SEEN JEEM BOARD (MODE_SELECT)
        ================================================================ */}
        {room.phase === "MODE_SELECT" && room.majorMode === "SEEN_JEEM" && (
          <div className="space-y-5">
            <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black">
                  لوحة سين جيم التفاعلية
                </h2>
                <p className="text-xs font-bold text-gray-600">
                  اختر قيمة السؤال لفتحه على جوالات اللاعبين
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {room.settings?.sessionMode === "MIXED_PARTY" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateRoom((d) => {
                        d.majorMode = "MINI_GAMES";
                        d.phase = "MODE_SELECT";
                        return d;
                      })
                    }
                    className="px-3.5 py-2 rounded-xl bg-coral border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>جولة قمنم فاصلة</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setBuilderOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-sunny border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5"
                >
                  <Wand2 className="w-4 h-4" />
                  <span>+ فئة مخصصة</span>
                </button>
              </div>
            </div>

            {allCategories.length > 6 && (
              <div className="flex flex-wrap items-center gap-2 bg-cream border-2 border-black rounded-2xl p-3">
                <span className="text-xs font-black ml-2">
                  الفئات النشطة ({room.selectedCategoryIds.length}/6):
                </span>
                {allCategories.map((cat) => {
                  const active = room.selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleToggleCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl border-2 border-black text-xs font-black transition ${
                        active
                          ? "bg-sunny shadow-brutal-sm"
                          : "bg-white opacity-65"
                      }`}
                    >
                      {cat.title}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {selectedCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border-4 border-black rounded-3xl p-3 shadow-brutal flex flex-col gap-2.5"
                >
                  <div
                    className="p-3 rounded-2xl border-3 border-black text-center shadow-brutal-sm min-h-[82px] flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ backgroundColor: category.color }}
                  >
                    <h3 className="font-black text-base text-black leading-snug relative z-10">
                      {category.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {category.questions.map((q) => {
                      const isAnswered = room.answeredQuestionIds.includes(q.id);
                      const bgByPoints =
                        q.points === 200
                          ? "bg-cream hover:bg-sunny"
                          : q.points === 400
                          ? "bg-sunny hover:bg-yellow-300"
                          : "bg-coral hover:bg-burnt hover:text-white";

                      return (
                        <button
                          key={q.id}
                          type="button"
                          disabled={isAnswered}
                          onClick={() =>
                            handleSelectSeenJeemQuestion(category.id, q)
                          }
                          className={`py-4 rounded-2xl border-3 border-black font-mono font-black text-xl transition ${
                            isAnswered
                              ? "bg-gray-200 text-gray-400 line-through cursor-not-allowed shadow-none"
                              : `${bgByPoints} text-black shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]`
                          }`}
                        >
                          {isAnswered ? "✓" : q.points}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            MINI-GAMES SELECTOR (MODE_SELECT for MINI_GAMES)
        ================================================================ */}
        {room.phase === "MODE_SELECT" && room.majorMode === "MINI_GAMES" && (
          <div className="space-y-6">
            <div className="bg-sunny border-4 border-black rounded-3xl p-6 shadow-brutal flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black">
                  الألعاب الثمانية التفاعلية (قمنم)
                </h2>
                <p className="text-xs font-bold text-black/80 mt-1">
                  اختر أي لعبة لبدء الجولة على الشاشة وجوالات اللاعبين
                </p>
              </div>
              {room.settings?.sessionMode === "MIXED_PARTY" && (
                <button
                  type="button"
                  onClick={() =>
                    updateRoom((d) => {
                      d.majorMode = "SEEN_JEEM";
                      d.phase = "MODE_SELECT";
                      return d;
                    })
                  }
                  className="px-5 py-2.5 rounded-2xl bg-royal text-white font-black text-xs border-2 border-black shadow-brutal-sm"
                >
                  العودة للوحة سين جيم
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {MINI_GAMES_META.map((game) => (
                <div
                  key={game.id}
                  className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="px-3 py-1 rounded-full border-2 border-black text-xs font-black"
                        style={{ backgroundColor: game.color }}
                      >
                        لعبة #{game.number}
                      </span>
                      <span className="text-xs font-black text-gray-600">
                        {game.defaultDurationSec} ثانية
                      </span>
                    </div>
                    <h3 className="text-xl font-black">{game.title}</h3>
                    <p className="text-xs font-bold text-gray-600 mt-1">
                      {game.howToPlay}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartMiniGameRound(game.id, 0, true)}
                    className="mt-5 w-full py-2.5 rounded-xl bg-sunny hover:bg-yellow-300 text-black font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>ابدأ اللعبة</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            ROUND_INTRO
        ================================================================ */}
        {room.phase === "ROUND_INTRO" && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl mx-auto bg-sunny border-4 border-black rounded-3xl p-8 shadow-brutal-lg text-center space-y-6 my-8"
          >
            <span className="px-4 py-1 rounded-full bg-black text-sunny text-xs font-black inline-block">
              لعبة #{activeMiniGameMeta.number} • {activeMiniGameMeta.badge}
            </span>
            <h2 className="text-4xl font-black">{activeMiniGameMeta.title}</h2>
            <p className="text-base font-bold text-black/90 leading-relaxed">
              {activeMiniGameMeta.howToPlay}
            </p>
            <button
              type="button"
              onClick={() =>
                updateRoom((d) => {
                  d.phase = "PLAYING";
                  d.roundStartedAt = Date.now();
                  return d;
                })
              }
              className="px-10 py-4 rounded-2xl bg-royal hover:bg-blue-700 text-white font-black text-lg border-4 border-black shadow-brutal flex items-center justify-center gap-2.5 mx-auto transition"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>انطلاق الجولة</span>
            </button>
          </motion.div>
        )}

        {/* ================================================================
            PLAYING & LOCKED
        ================================================================ */}
        {(room.phase === "PLAYING" || room.phase === "LOCKED") && (
          <div className="space-y-6">
            {/* Timer & Reveal Trigger Bar */}
            <div className="bg-white border-4 border-black rounded-3xl p-4 shadow-brutal flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`px-4 py-2 rounded-2xl border-3 border-black font-mono font-black text-2xl flex items-center gap-2 ${
                    timeLeft <= 10
                      ? "bg-coral text-black animate-pulse"
                      : "bg-sunny text-black"
                  }`}
                >
                  <Clock className="w-6 h-6" />
                  <span>{timeLeft}s</span>
                </div>

                <div>
                  <div className="font-black text-sm md:text-base">
                    {room.majorMode === "SEEN_JEEM"
                      ? `${activeCat?.title || "سين جيم"} • ${
                          activeSeenJeemQ?.points || 200
                        } نقطة`
                      : `${activeMiniGameMeta.title} • الجولة #${
                          room.miniGameRoundIndex + 1
                        }`}
                  </div>
                  <div className="text-xs font-bold text-gray-600">
                    تم استلام {submissionsList.length} من أصل{" "}
                    {room.players.length} إجابات
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLockAndReveal(room)}
                className="px-5 py-2.5 rounded-xl bg-mint hover:brightness-105 text-black font-black text-xs md:text-sm border-3 border-black shadow-brutal flex items-center gap-2 transition"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>إظهار الإجابة والنتيجة</span>
              </button>
            </div>

            {room.phase === "LOCKED" && (
              <div className="bg-black text-sunny border-4 border-black rounded-2xl p-4 text-center font-black text-lg animate-bounce">
                جاري فرز الإجابات بالحكم الذكي...
              </div>
            )}

            {/* Active Question Card */}
            {room.majorMode === "SEEN_JEEM" && activeSeenJeemQ && (
              <div className="bg-royal text-white border-4 border-black rounded-3xl p-8 md:p-12 shadow-brutal-lg text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sunny text-black border-2 border-black text-xs font-black">
                  <span>{activeCat?.title}</span>
                  <span>•</span>
                  <span>
                    {activeSeenJeemQ.points * (room.doublePointsActive ? 2 : 1)}{" "}
                    نقطة
                  </span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black leading-snug max-w-4xl mx-auto">
                  {activeSeenJeemQ.question}
                </h2>

                {activeSeenJeemQ.hint && (
                  <div className="inline-block bg-white/15 border-2 border-white/40 rounded-2xl px-5 py-2 text-sm font-bold text-sunny">
                    تلميح: {activeSeenJeemQ.hint}
                  </div>
                )}
              </div>
            )}

            {room.majorMode === "MINI_GAMES" && (
              <MiniGameHostPlayingStage room={room} />
            )}

            {/* Player Submission Status Pills */}
            <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal">
              <div className="flex flex-wrap gap-3">
                {room.players.map((p) => {
                  const hasSubmitted = Boolean(room.submissions[p.id]);
                  const isDrawer =
                    room.majorMode === "MINI_GAMES" &&
                    room.activeMiniGameId === "DRAWING_CHALLENGE" &&
                    room.drawerPlayerId === p.id;

                  return (
                    <div
                      key={p.id}
                      className={`px-3.5 py-2 rounded-2xl border-3 border-black font-black text-xs flex items-center gap-2 transition ${
                        isDrawer
                          ? "bg-sunny text-black shadow-brutal-sm"
                          : hasSubmitted
                          ? "bg-mint text-black shadow-brutal-sm"
                          : "bg-cream text-gray-600"
                      }`}
                    >
                      <CartoonAvatar avatarId={p.avatar} size="xs" />
                      <span>{p.name}</span>
                      {isDrawer ? (
                        <span className="bg-black text-sunny px-2 py-0.5 rounded-full text-[10px]">
                          يرسم الآن
                        </span>
                      ) : hasSubmitted ? (
                        <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px]">
                          وصل جوابه ✔
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-75">يجيب...</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            REVEAL_AND_SCORE
        ================================================================ */}
        {room.phase === "REVEAL_AND_SCORE" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-sunny border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="px-4 py-1.5 rounded-full bg-black text-sunny text-xs font-black flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>نتيجة الجولة</span>
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {room.majorMode === "SEEN_JEEM" ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          updateRoom((d) => {
                            d.phase = "MODE_SELECT";
                            d.doublePointsActive = false;
                            return d;
                          })
                        }
                        className="px-6 py-3 rounded-2xl bg-royal text-white font-black text-sm border-3 border-black shadow-brutal"
                      >
                        العودة للوحة سين جيم
                      </button>
                      {room.settings?.sessionMode === "MIXED_PARTY" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateRoom((d) => {
                              d.majorMode = "MINI_GAMES";
                              d.phase = "MODE_SELECT";
                              d.doublePointsActive = false;
                              return d;
                            })
                          }
                          className="px-5 py-3 rounded-2xl bg-coral text-black font-black text-sm border-3 border-black shadow-brutal"
                        >
                          جولة قمنم فاصلة ⚡
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleStartMiniGameRound(
                            room.activeMiniGameId,
                            room.miniGameRoundIndex + 1,
                            false
                          )
                        }
                        className="px-6 py-3 rounded-2xl bg-royal text-white font-black text-sm border-3 border-black shadow-brutal"
                      >
                        الجولة التالية (#{room.miniGameRoundIndex + 2})
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateRoom((d) => {
                            d.phase = "MODE_SELECT";
                            return d;
                          })
                        }
                        className="px-4 py-3 rounded-2xl bg-white text-black font-black text-xs border-3 border-black shadow-brutal-sm"
                      >
                        تغيير اللعبة
                      </button>
                    </>
                  )}
                </div>
              </div>

              {room.majorMode === "SEEN_JEEM" && activeSeenJeemQ && (
                <div className="bg-white border-3 border-black rounded-2xl p-5 space-y-2">
                  <div className="text-xs font-black text-royal">
                    الجواب الصحيح:
                  </div>
                  <div className="text-2xl md:text-4xl font-black text-black">
                    {activeSeenJeemQ.displayAnswer}
                  </div>
                  <p className="text-xs md:text-sm font-bold text-gray-700">
                    {activeSeenJeemQ.funFact}
                  </p>
                </div>
              )}

              <div className="text-base md:text-lg font-black text-black">
                {room.roundSummaryText}
              </div>

              {room.majorMode === "MINI_GAMES" &&
                room.activeMiniGameId === "MAP_PIN" && (
                  <div className="pt-2">
                    {(() => {
                      const mapRound =
                        MAP_PIN_ROUNDS[
                          room.miniGameRoundIndex % MAP_PIN_ROUNDS.length
                        ];
                      const markers = submissionsList
                        .filter(
                          (s) =>
                            typeof s.pinLat === "number" &&
                            typeof s.pinLng === "number"
                        )
                        .map((s) => ({
                          id: s.playerId,
                          label: s.playerName,
                          lat: s.pinLat!,
                          lng: s.pinLng!,
                          color:
                            s.team === "team1"
                              ? room.teams.team1.color
                              : room.teams.team2.color,
                          distanceKm: s.distanceKm,
                        }));
                      return (
                        <InteractiveWorldMap
                          disabled
                          targetPin={{
                            lat: mapRound.targetLat,
                            lng: mapRound.targetLng,
                            label: mapRound.placeName,
                          }}
                          playerPins={markers}
                        />
                      );
                    })()}
                  </div>
                )}
            </div>

            {/* Player Submissions Breakdown */}
            <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-brutal space-y-4">
              <h3 className="text-lg font-black">إجابات اللاعبين:</h3>

              {submissionsList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-cream border-2 border-black text-center font-bold text-gray-600 text-sm">
                  لم يرسل أي لاعب إجابة في هذه الجولة.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submissionsList.map((sub) => {
                    const pl = room.players.find((p) => p.id === sub.playerId);
                    return (
                      <div
                        key={sub.playerId}
                        className={`p-4 rounded-2xl border-3 border-black shadow-brutal-sm flex flex-col justify-between gap-2 ${
                          sub.isCorrect ? "bg-mint/25" : "bg-coral/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CartoonAvatar avatarId={pl?.avatar} size="sm" />
                            <div>
                              <div className="font-black text-sm">
                                {sub.playerName}
                              </div>
                              <div className="text-[10px] font-bold text-gray-600">
                                {sub.team === "team1"
                                  ? room.teams.team1.name
                                  : room.teams.team2.name}
                              </div>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-xl bg-black text-sunny font-mono font-black text-xs">
                            +{sub.pointsAwarded || 0}
                          </span>
                        </div>

                        <div className="bg-white border-2 border-black rounded-xl p-2.5 text-xs font-black">
                          {sub.textAnswer && (
                            <div>«{sub.textAnswer}»</div>
                          )}
                          {typeof sub.numericValue === "number" && (
                            <div>
                              التخمين:{" "}
                              <span className="font-mono">
                                {sub.numericValue.toLocaleString("en-US")}
                              </span>{" "}
                              (الفرق:{" "}
                              <span className="font-mono text-burnt">
                                {sub.numericDiff?.toLocaleString("en-US")}
                              </span>
                              )
                            </div>
                          )}
                          {typeof sub.distanceKm === "number" && (
                            <div>
                              المسافة:{" "}
                              <span className="font-mono text-royal">
                                {sub.distanceKm.toLocaleString("en-US")} كم
                              </span>
                            </div>
                          )}
                          {typeof sub.optionIndex === "number" && (
                            <div>
                              الخيار #{sub.optionIndex + 1} (
                              {(sub.elapsedMs / 1000).toFixed(1)} ثانية)
                            </div>
                          )}
                          {sub.reflexCellId && (
                            <div>
                              الاستجابة: {(sub.elapsedMs / 1000).toFixed(2)}{" "}
                              ثانية
                            </div>
                          )}
                        </div>

                        {sub.refereeVerdict && (
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span>{sub.refereeVerdict.verdictTitle}</span>
                            <span className="font-mono">
                              {Math.round(sub.refereeVerdict.similarity * 100)}٪
                            </span>
                          </div>
                        )}

                        {sub.descriptionVerdict && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {sub.descriptionVerdict.matchedTags.map((t) => (
                              <span
                                key={t.id}
                                className="px-2 py-0.5 rounded bg-mint border border-black text-[10px] font-black"
                              >
                                ✔ {t.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Host Override Bar for Seen Jeem */}
              {room.majorMode === "SEEN_JEEM" && (
                <div className="mt-3 pt-3 border-t-2 border-black/15 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-gray-600">
                    تعديل النتيجة يدوياً:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRoom((prev) => {
                          if (!prev) return prev;
                          const next = applyHostSeenJeemOverride(prev, "team1");
                          saveRoomToLocalAndBroadcast(next);
                          return next;
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-royal text-white border-2 border-black text-xs font-black"
                    >
                      {room.teams.team1.name}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRoom((prev) => {
                          if (!prev) return prev;
                          const next = applyHostSeenJeemOverride(prev, "team2");
                          saveRoomToLocalAndBroadcast(next);
                          return next;
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-burnt text-white border-2 border-black text-xs font-black"
                    >
                      {room.teams.team2.name}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRoom((prev) => {
                          if (!prev) return prev;
                          const next = applyHostSeenJeemOverride(prev, "both");
                          saveRoomToLocalAndBroadcast(next);
                          return next;
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-mint text-black border-2 border-black text-xs font-black"
                    >
                      الفريقين معاً
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRoom((prev) => {
                          if (!prev) return prev;
                          const next = applyHostSeenJeemOverride(prev, "none");
                          saveRoomToLocalAndBroadcast(next);
                          return next;
                        })
                      }
                      className="px-3 py-1.5 rounded-xl bg-cream text-black border-2 border-black text-xs font-black"
                    >
                      ولا أحد
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================================================================
            LEADERBOARD
        ================================================================ */}
        {room.phase === "LEADERBOARD" && (
          <div className="max-w-4xl mx-auto bg-white border-4 border-black rounded-3xl p-8 shadow-brutal-lg space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-sunny border-3 border-black shadow-brutal flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-3xl font-black">لوحة الصدارة</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div
                className="text-white border-4 border-black rounded-3xl p-6 shadow-brutal text-center"
                style={{ backgroundColor: room.teams.team1.color }}
              >
                <div className="text-xl font-black">{room.teams.team1.name}</div>
                <div className="text-5xl font-mono font-black text-sunny my-2">
                  {room.teams.team1.score}
                </div>
                <div className="text-xs font-bold">نقطة</div>
              </div>

              <div
                className="text-white border-4 border-black rounded-3xl p-6 shadow-brutal text-center"
                style={{ backgroundColor: room.teams.team2.color }}
              >
                <div className="text-xl font-black">{room.teams.team2.name}</div>
                <div className="text-5xl font-mono font-black text-sunny my-2">
                  {room.teams.team2.score}
                </div>
                <div className="text-xs font-bold">نقطة</div>
              </div>
            </div>

            <div className="space-y-2.5">
              <h3 className="text-base font-black">ترتيب اللاعبين:</h3>
              {[...room.players]
                .sort((a, b) => b.score - a.score)
                .map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-cream border-3 border-black flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-sunny border-2 border-black font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <CartoonAvatar avatarId={p.avatar} size="sm" />
                      <span className="font-black text-sm">{p.name}</span>
                      {p.isCaptain && <span>👑</span>}
                    </div>
                    <span className="font-mono font-black text-base">
                      {p.score} نقطة
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Discrete Footer with Hidden DevDrawer */}
      <footer className="bg-black text-cream border-t-4 border-black px-6 py-3 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-bold">
          <span>غرفة: {room.code}</span>
          <DevDrawer
            roomCode={room.code}
            onAddSimulatedPlayer={handleAddSimulatedPlayer}
            onSimulateAnswers={handleSimulatePlayerSubmissions}
            onResetBoard={() =>
              updateRoom((d) => {
                d.answeredQuestionIds = [];
                return d;
              })
            }
          />
        </div>
      </footer>

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-sunny border-4 border-black rounded-3xl p-6 max-w-md w-full shadow-brutal-lg text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-lg">انضم للغرفة بالجوال</span>
              <button
                onClick={() => setQrModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-coral border-2 border-black flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white border-4 border-black rounded-2xl p-5 inline-block mx-auto shadow-brutal">
              <QRCodeSVG
                value={joinUrl || `https://seenjeem.app/play/${room.code}`}
                size={220}
              />
            </div>
            <div className="bg-white border-3 border-black rounded-2xl p-3">
              <div className="text-xs font-bold text-gray-600">رمز الغرفة:</div>
              <div
                dir="ltr"
                className="text-3xl font-mono font-black tracking-widest"
              >
                {room.code}
              </div>
            </div>
          </div>
        </div>
      )}

      <CustomBuilderModal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSaveCategory={handleAddCustomCategory}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS FOR HOST VIEW
// ============================================================================

function PlayerLobbyPill({
  player,
  onPlayVoice,
  onSwitchTeam,
  onMakeCaptain,
  onRemove,
}: {
  player: Player;
  onPlayVoice: () => void;
  onSwitchTeam: () => void;
  onMakeCaptain: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white border-2 border-black rounded-full px-3 py-1.5 shadow-brutal-sm flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <CartoonAvatar avatarId={player.avatar} size="sm" />
        <span className="font-black text-sm">{player.name}</span>
        {player.isCaptain && (
          <span
            title="كابتن الفريق"
            className="px-2 py-0.5 rounded-full bg-sunny border border-black text-[10px] font-black"
          >
            👑 كابتن
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPlayVoice}
          title="سماع صوت اللاعب"
          className="p-1.5 rounded-full bg-mint/40 hover:bg-mint border border-black"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>
        {!player.isCaptain && (
          <button
            type="button"
            onClick={onMakeCaptain}
            title="تعيين ككابتن"
            className="p-1.5 rounded-full bg-cream hover:bg-sunny border border-black text-xs"
          >
            👑
          </button>
        )}
        <button
          type="button"
          onClick={onSwitchTeam}
          title="نقل للفريق الآخر"
          className="p-1.5 rounded-full bg-cream hover:bg-sunny border border-black"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          title="إخراج اللاعب"
          className="p-1.5 rounded-full bg-coral/40 hover:bg-coral border border-black"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function MiniGameHostPlayingStage({ room }: { room: RoomState }) {
  const gId = room.activeMiniGameId;
  const rIdx = room.miniGameRoundIndex;

  if (gId === "SPEED_TRIVIA") {
    const round = SPEED_TRIVIA_ROUNDS[rIdx % SPEED_TRIVIA_ROUNDS.length];
    return (
      <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-brutal-lg space-y-6 text-center">
        <span className="px-4 py-1 rounded-full bg-sunny border-2 border-black text-xs font-black">
          أسئلة السرعة
        </span>
        <h2 className="text-3xl md:text-4xl font-black max-w-3xl mx-auto">
          {round.question}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {round.options.map((opt, idx) => {
            const colors = [
              "bg-royal text-white",
              "bg-sunny text-black",
              "bg-coral text-black",
              "bg-mint text-black",
            ];
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border-3 border-black shadow-brutal font-black text-lg ${colors[idx]}`}
              >
                {idx + 1}. {opt}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (gId === "QUICK_REFLEX") {
    const round = QUICK_REFLEX_ROUNDS[rIdx % QUICK_REFLEX_ROUNDS.length];
    return (
      <div className="bg-coral border-4 border-black rounded-3xl p-8 shadow-brutal-lg text-center space-y-4">
        <span className="px-4 py-1 rounded-full bg-white border-2 border-black text-xs font-black">
          سرعة بديهة
        </span>
        <h2 className="text-4xl md:text-5xl font-black text-black">
          {round.promptAr}
        </h2>
        <p className="text-sm font-black text-white bg-black inline-block px-5 py-2 rounded-2xl">
          {round.subWarningAr}
        </p>
      </div>
    );
  }

  if (gId === "PRICE_GUESS") {
    const round = PRICE_GUESS_ROUNDS[rIdx % PRICE_GUESS_ROUNDS.length];
    return (
      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-5">
          <ProductArtwork type={round.illustrationType} />
        </div>
        <div className="md:col-span-7 space-y-3">
          <span className="px-3 py-1 rounded-full bg-mint border-2 border-black text-xs font-black">
            كم السعر؟ • {round.brand}
          </span>
          <h2 className="text-2xl md:text-4xl font-black">{round.productName}</h2>
          <p className="text-sm font-bold text-gray-700 bg-cream border-2 border-black rounded-xl p-3">
            {round.specs}
          </p>
        </div>
      </div>
    );
  }

  if (gId === "WHATS_IN_FRAME") {
    const round = WHATS_IN_FRAME_ROUNDS[rIdx % WHATS_IN_FRAME_ROUNDS.length];
    return (
      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6">
          <FrameSceneArtwork artworkId={round.sceneArtworkId} />
        </div>
        <div className="md:col-span-6 space-y-4">
          <span className="px-3 py-1 rounded-full bg-sunny border-2 border-black text-xs font-black">
            وش في اللقطة؟
          </span>
          <h2 className="text-2xl md:text-3xl font-black">{round.prompt}</h2>
          <div className="p-3 rounded-xl bg-coral/30 border-2 border-black text-xs font-black">
            تلميح: {round.clue}
          </div>
        </div>
      </div>
    );
  }

  if (gId === "CLOSEST_NUMBER") {
    const round = CLOSEST_NUMBER_ROUNDS[rIdx % CLOSEST_NUMBER_ROUNDS.length];
    return (
      <div className="bg-burnt text-white border-4 border-black rounded-3xl p-8 md:p-10 shadow-brutal-lg text-center space-y-5">
        <span className="px-4 py-1 rounded-full bg-sunny text-black border-2 border-black text-xs font-black">
          قرّب من الرقم • {round.unitLabel}
        </span>
        <h2 className="text-3xl md:text-5xl font-black max-w-3xl mx-auto leading-snug">
          {round.question}
        </h2>
        <div className="inline-block bg-black text-sunny px-5 py-2 rounded-2xl border-2 border-white text-sm font-black">
          النطاق التقريبي: {round.hintRange}
        </div>
      </div>
    );
  }

  if (gId === "DRAWING_CHALLENGE") {
    const round =
      DRAWING_CHALLENGE_ROUNDS[rIdx % DRAWING_CHALLENGE_ROUNDS.length];
    const drawer = room.players.find((p) => p.id === room.drawerPlayerId);
    return (
      <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-brutal-lg grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-7 bg-cream border-4 border-black rounded-2xl h-72 flex items-center justify-center overflow-hidden relative">
          {room.liveDrawingDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={room.liveDrawingDataUrl}
              alt="رسم اللاعب المباشر"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-6 space-y-2">
              <div className="font-black text-lg">
                بانتظار رسم «{drawer?.name || "الرسام"}»...
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-5 space-y-4">
          <span className="px-3 py-1 rounded-full bg-sunny border-2 border-black text-xs font-black">
            تحدّي الرسم المباشر
          </span>
          <div className="flex items-center gap-3">
            <CartoonAvatar avatarId={drawer?.avatar} size="md" />
            <div>
              <div className="text-xs font-bold text-gray-600">الرسام الآن:</div>
              <div className="text-xl font-black">{drawer?.name}</div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-royal text-white border-3 border-black space-y-1">
            <div className="text-xs font-bold text-sunny">التصنيف:</div>
            <div className="text-xl font-black">{round.categoryHint}</div>
          </div>
        </div>
      </div>
    );
  }

  if (gId === "MAP_PIN") {
    const round = MAP_PIN_ROUNDS[rIdx % MAP_PIN_ROUNDS.length];
    return (
      <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg space-y-4 text-center">
        <span className="px-4 py-1 rounded-full bg-royal text-white border-2 border-black text-xs font-black">
          ثبت الدبوس
        </span>
        <h2 className="text-2xl md:text-4xl font-black">{round.prompt}</h2>
        <div className="inline-block bg-sunny border-2 border-black px-4 py-1.5 rounded-xl text-xs font-black">
          {round.regionHint}
        </div>
      </div>
    );
  }

  const round =
    SCENE_DESCRIPTION_ROUNDS[rIdx % SCENE_DESCRIPTION_ROUNDS.length];
  return (
    <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      <div className="md:col-span-6">
        <SceneDescriptionArtwork sceneId={round.sceneArtworkId} />
      </div>
      <div className="md:col-span-6 space-y-4">
        <span className="px-3 py-1 rounded-full bg-coral border-2 border-black text-xs font-black">
          أدق وصف
        </span>
        <h2 className="text-2xl md:text-3xl font-black">{round.prompt}</h2>
      </div>
    </div>
  );
}
