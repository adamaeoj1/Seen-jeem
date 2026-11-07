"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  Atom,
  BadgeDollarSign,
  Bell,
  Brain,
  CheckCircle2,
  Clapperboard,
  Clock,
  Coffee,
  Cpu,
  FileEdit,
  FileText,
  Flame,
  Gamepad2,
  Globe2,
  Hash,
  Home,
  Keyboard,
  Landmark,
  LayoutGrid,
  MapPin,
  Palette,
  Play,
  Puzzle,
  QrCode,
  RotateCcw,
  ScanSearch,
  ScrollText,
  Settings,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Trophy,
  Tv,
  Volume2,
  VolumeX,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import {
  applyHostSeenJeemOverride,
  AVATAR_OPTIONS,
  createInitialRoomState,
  getActiveSeenJeemQuestion,
  getAllCategories,
  getRegionalClosestNumberRounds,
  getRegionalDrawingChallengeRounds,
  getRegionalPriceGuessRounds,
  getRegionalSeedCategories,
  getRegionalSpeedTriviaRounds,
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
  getShuffledSpeedTriviaRound,
  markQuestionAsPlayed,
  pickRandomizedMiniGameRoundIndex,
} from "@/lib/questionRandomizer";
import {
  CLOSEST_NUMBER_ROUNDS,
  DRAWING_CHALLENGE_ROUNDS,
  MAP_PIN_ROUNDS,
  MiniGameId,
  QUICK_REFLEX_ROUNDS,
  SCENE_DESCRIPTION_ROUNDS,
  SeenJeemCategory,
  SeenJeemQuestion,
  SPEED_TRIVIA_ROUNDS,
  WHATS_IN_FRAME_ROUNDS,
} from "@/data/seedQuestions";
import {
  EcommerceProductCard,
  FrameSceneArtwork,
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
import {
  BUZZER_MODE_MARKER,
  createBuzzAnswerPayload,
  filterQuestionsByBoardSize,
  getRoomAdapterState,
  getSortedBuzzQueue,
  isBuzzAnswer,
  isDefaultTeamName,
  isRoomInBuzzerMode,
  SeenJeemAnswerMode,
  SeenJeemBoardSize,
  setRoomAdapterState,
  useEdition,
} from "@/lib/editionManager";
import { DevDrawer } from "@/components/DevDrawer";
import { useVoucherLicense } from "@/lib/voucherEngine";

type HostNavTabTarget = "LOBBY" | "SEEN_JEEM" | "MINI_GAMES" | "LEADERBOARD";

export default function HostRoomPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const roomCode = (params?.code || "K7Q2").toUpperCase().trim();
  const { region, edition } = useEdition();
  const { cafeConfig, updateCafeConfig, isB2BCafeUnlocked } = useVoucherLicense();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [hostSettingsOpen, setHostSettingsOpen] = useState(false);
  const [joinUrl, setJoinUrl] = useState("");
  const [recentJoinToast, setRecentJoinToast] = useState<Player | null>(null);

  // Frontend Adapter Layer State (Zero-Backend-Mutation)
  const [boardSize, setBoardSize] = useState<SeenJeemBoardSize>(18);
  const [answerMode, setAnswerMode] = useState<SeenJeemAnswerMode>("TYPING");
  const [manualAwardedInRound, setManualAwardedInRound] = useState(false);
  const [boardShuffleSeed, setBoardShuffleSeed] = useState<number>(1);
  const [, setBankRefreshTick] = useState(0);

  // Navigation Confirmation Modal State when a question is active
  const [pendingNavTarget, setPendingNavTarget] =
    useState<HostNavTabTarget | null>(null);

  // Track last played buzzer sound so we only chime once per buzz winner
  const lastBuzzedSubmissionKeyRef = useRef<string>("");

  // Initialize or load room + subscribe to real-time updates
  useEffect(() => {
    if (typeof window !== "undefined") {
      setJoinUrl(`${window.location.origin}/play/${roomCode}`);
    }
    const adapter = getRoomAdapterState(roomCode);
    setBoardSize(adapter.boardSize);
    setAnswerMode(adapter.answerMode);
    setManualAwardedInRound(adapter.manualAwardedInRound);
    setBoardShuffleSeed(adapter.boardShuffleSeed || 1);

    const sub = loadUserSubscription();
    let existing = loadRoomFromLocal(roomCode);
    if (!existing) {
      existing = createInitialRoomState(
        roomCode,
        sub.tier,
        sub.customCategories || [],
        {
          team1Name: edition.defaultTeam1Name,
          team2Name: edition.defaultTeam2Name,
        }
      );
      if (adapter.answerMode === "BUZZER") {
        existing.roundSummaryText = BUZZER_MODE_MARKER;
      }
    }
    existing.boardSize = adapter.boardSize;
    existing.answeringMode = adapter.answerMode;
    saveRoomToLocalAndBroadcast(existing);
    setRoom(existing);

    const unsubscribe = subscribeToRoomUpdates(
      roomCode,
      (updated) => {
        setRoom(updated);
      },
      (joinedPlayer) => {
        playVoicePack(joinedPlayer.voiceId || "hype_horn", true);
        setRecentJoinToast(joinedPlayer);
        setTimeout(() => setRecentJoinToast(null), 3500);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  // Dynamically sync default team names and regional categories when the host switches region in Lobby
  useEffect(() => {
    if (!room || room.phase !== "LOBBY") return;
    const t1Default = isDefaultTeamName(room.teams.team1.name);
    const t2Default = isDefaultTeamName(room.teams.team2.name);
    const regionalDefaultIds = getRegionalSeedCategories(region)
      .slice(0, 6)
      .map((c) => c.id);
    const needsCatSync =
      room.answeredQuestionIds.length === 0 &&
      room.selectedCategoryIds[0] !== regionalDefaultIds[0];

    if (
      (t1Default && room.teams.team1.name !== edition.defaultTeam1Name) ||
      (t2Default && room.teams.team2.name !== edition.defaultTeam2Name) ||
      needsCatSync
    ) {
      updateRoom((draft) => {
        if (isDefaultTeamName(draft.teams.team1.name)) {
          draft.teams.team1.name = edition.defaultTeam1Name;
          draft.settings.team1Name = edition.defaultTeam1Name;
        }
        if (isDefaultTeamName(draft.teams.team2.name)) {
          draft.teams.team2.name = edition.defaultTeam2Name;
          draft.settings.team2Name = edition.defaultTeam2Name;
        }
        if (draft.answeredQuestionIds.length === 0) {
          draft.selectedCategoryIds = regionalDefaultIds;
        }
        return draft;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, edition.defaultTeam1Name, edition.defaultTeam2Name]);

  // Detect fastest `__BUZZ__:` arrival on Host TV and trigger buzzer sound
  useEffect(() => {
    if (!room || room.phase !== "PLAYING") {
      lastBuzzedSubmissionKeyRef.current = "";
      return;
    }
    const buzzQueue = getSortedBuzzQueue(room.submissions);
    if (buzzQueue.length === 0) {
      lastBuzzedSubmissionKeyRef.current = "";
      return;
    }
    const fastest = buzzQueue[0];
    const key = `${fastest.submission.playerId}:${fastest.buzzTimestamp}`;
    if (key !== lastBuzzedSubmissionKeyRef.current) {
      lastBuzzedSubmissionKeyRef.current = key;
      const fastestPlayer = room.players.find(
        (p) => p.id === fastest.submission.playerId
      );
      playVoicePack(
        fastestPlayer?.voiceId || "hype_horn",
        room.settings?.soundEnabled ?? true
      );
    }
  }, [room]);

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

  const handleToggleBoardSize = (nextSize: SeenJeemBoardSize) => {
    setBoardSize(nextSize);
    setRoomAdapterState(roomCode, { boardSize: nextSize });
    updateRoom((draft) => {
      draft.boardSize = nextSize;
      return draft;
    });
  };

  const handleToggleAnswerMode = (nextMode: SeenJeemAnswerMode) => {
    setAnswerMode(nextMode);
    setRoomAdapterState(roomCode, { answerMode: nextMode });
    updateRoom((draft) => {
      draft.answeringMode = nextMode;
      if (draft.phase !== "REVEAL_AND_SCORE") {
        draft.roundSummaryText =
          nextMode === "BUZZER" ? BUZZER_MODE_MARKER : "";
      }
      return draft;
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

  // One-click Host Award for Buzzer Mode or Manual Override
  const handleManualAwardPoints = (winner: TeamId | "both" | "none") => {
    setManualAwardedInRound(true);
    setRoomAdapterState(roomCode, { manualAwardedInRound: true });

    setRoom((prev) => {
      if (!prev) return prev;
      const draft: RoomState = JSON.parse(JSON.stringify(prev));
      const { question } = getActiveSeenJeemQuestion(draft);

      if (draft.phase !== "REVEAL_AND_SCORE") {
        draft.phase = "REVEAL_AND_SCORE";
        draft.seenJeemBaseAwarded = { team1: 0, team2: 0 };
        if (question && !draft.answeredQuestionIds.includes(question.id)) {
          draft.answeredQuestionIds.push(question.id);
        }
      }

      const next = applyHostSeenJeemOverride(draft, winner);
      if (winner !== "none") {
        next.roundSummaryText = `${next.roundSummaryText} • تم احتساب النقاط يدوياً بواسطة المضيف`;
      } else {
        next.roundSummaryText =
          "لا نقاط لأي فريق في هذا السؤال • تم احتساب النقاط يدوياً بواسطة المضيف";
      }
      saveRoomToLocalAndBroadcast(next);
      return next;
    });

    if (winner !== "none") {
      playCorrectChime(room?.settings?.soundEnabled ?? true);
      triggerConfetti();
    }
  };

  // Reset buzzer queue during active round so remaining players can buzz again
  const handleResetBuzzerForRound = () => {
    lastBuzzedSubmissionKeyRef.current = "";
    updateRoom((draft) => {
      const nextSubs: Record<string, PlayerSubmission> = {};
      for (const [pid, sub] of Object.entries(draft.submissions)) {
        if (!isBuzzAnswer(sub.textAnswer)) {
          nextSubs[pid] = sub;
        }
      }
      draft.submissions = nextSubs;
      draft.roundSummaryText = BUZZER_MODE_MARKER;
      return draft;
    });
  };

  // Reshuffle unplayed board tiles anytime ("🔀 خلط أسئلة اللوحة")
  const handleShuffleBoardQuestions = () => {
    const nextSeed =
      (boardShuffleSeed + Math.floor(Math.random() * 997) + 31) >>> 0;
    setBoardShuffleSeed(nextSeed);
    setRoomAdapterState(roomCode, { boardShuffleSeed: nextSeed });
  };

  // Credit +300 points to a player's submission ("اعتمد النقاط" button in "أدق وصف" & text submissions)
  const handleCreditPlayerSubmission = (
    playerId: string,
    bonusPoints = 300
  ) => {
    setManualAwardedInRound(true);
    setRoomAdapterState(roomCode, { manualAwardedInRound: true });

    setRoom((prev) => {
      if (!prev) return prev;
      const draft: RoomState = JSON.parse(JSON.stringify(prev));
      const sub = draft.submissions[playerId];
      if (sub?.manualCredited) return prev; // Prevent double-crediting

      const playerObj = draft.players.find((p) => p.id === playerId);
      const playerCurrentTeam: TeamId =
        playerObj?.team || sub?.team || "team1";

      draft.teams[playerCurrentTeam].score += bonusPoints;
      draft.teamA = {
        name: draft.teams.team1.name,
        score: draft.teams.team1.score,
      };
      draft.teamB = {
        name: draft.teams.team2.name,
        score: draft.teams.team2.score,
      };

      if (playerObj) {
        playerObj.score += bonusPoints;
      }

      if (sub) {
        sub.team = playerCurrentTeam;
        sub.isCorrect = true;
        sub.manualCredited = true;
        sub.pointsAwarded = (sub.pointsAwarded || 0) + bonusPoints;
      }

      const teamName = draft.teams[playerCurrentTeam].name;
      const playerName = playerObj?.name || sub?.playerName || "اللاعب";
      draft.roundSummaryText = `تم اعتماد +${bonusPoints} نقطة لإجابة «${playerName}» لصالح ${teamName}!`;
      draft.updatedAt = Date.now();

      saveRoomToLocalAndBroadcast(draft);
      return draft;
    });

    playCorrectChime(room?.settings?.soundEnabled ?? true);
    triggerConfetti();
  };

  // Navigation Guard: Lock Navigation Tabs During Active Rounds
  const isQuestionCurrentlyOpen =
    room?.phase === "PLAYING" ||
    room?.phase === "LOCKED" ||
    room?.phase === "ROUND_INTRO";

  const executeTabNavigation = (target: HostNavTabTarget) => {
    updateRoom((d) => {
      if (target === "LOBBY") {
        d.phase = "LOBBY";
      } else if (target === "SEEN_JEEM") {
        d.majorMode = "SEEN_JEEM";
        d.phase = "MODE_SELECT";
        d.activeQuestionId = null;
        d.activeCategoryId = null;
      } else if (target === "MINI_GAMES") {
        d.majorMode = "MINI_GAMES";
        d.phase = "MODE_SELECT";
      } else if (target === "LEADERBOARD") {
        d.phase = "LEADERBOARD";
      }
      if (d.phase !== "REVEAL_AND_SCORE") {
        d.roundSummaryText =
          answerMode === "BUZZER" ? BUZZER_MODE_MARKER : "";
      }
      return d;
    });
  };

  const handleNavigationTabClick = (target: HostNavTabTarget) => {
    if (!room) return;
    if (isQuestionCurrentlyOpen) {
      setPendingNavTarget(target);
      return;
    }
    executeTabNavigation(target);
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
    const sampleNames =
      edition.region === "MA"
        ? ["أمين", "سلمى", "ياسين", "كنزة", "حمزة", "غيثة", "مهدي"]
        : ["فهد", "سارة", "فيصل", "ريم", "حمد", "لمى", "عزوز"];
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
          elapsedMs: 1200 + idx * 950,
        };

        if (draft.majorMode === "SEEN_JEEM") {
          if (answerMode === "BUZZER") {
            sub.textAnswer = createBuzzAnswerPayload(Date.now() + idx * 450);
          } else {
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
            const priceRounds = getRegionalPriceGuessRounds(region);
            const r = priceRounds[rIdx % priceRounds.length];
            const targetPrice =
              region === "MA"
                ? r.actualPriceDh ?? r.actualPriceSar
                : r.actualPriceSar;
            sub.numericValue =
              idx === 0
                ? Math.round(targetPrice * 0.97)
                : Math.round(targetPrice * 1.3);
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

  // Select a Seen Jeem Question from the 18 or 36-grid board
  const handleSelectSeenJeemQuestion = (
    catId: string,
    question: SeenJeemQuestion
  ) => {
    setManualAwardedInRound(false);
    setRoomAdapterState(roomCode, { manualAwardedInRound: false });
    lastBuzzedSubmissionKeyRef.current = "";
    markQuestionAsPlayed(question.id);

    updateRoom((draft) => {
      draft.majorMode = "SEEN_JEEM";
      draft.activeCategoryId = catId;
      draft.activeQuestionId = question.id;
      draft.submissions = {};
      draft.roundSummaryText =
        answerMode === "BUZZER" ? BUZZER_MODE_MARKER : "";
      draft.roundDurationSec = draft.settings?.timerSec || 45;
      draft.roundStartedAt = Date.now();
      draft.phase = "PLAYING";
      return draft;
    });
  };

  // Start a Mini-Game Round with Anti-Repetition Randomization
  const handleStartMiniGameRound = (
    gameId: MiniGameId,
    roundIndex?: number,
    showIntroFirst = true
  ) => {
    setManualAwardedInRound(false);
    setRoomAdapterState(roomCode, { manualAwardedInRound: false });
    const meta =
      MINI_GAMES_META.find((m) => m.id === gameId) || MINI_GAMES_META[0];

    let poolForGame: { id: string }[] = SPEED_TRIVIA_ROUNDS;
    if (gameId === "SPEED_TRIVIA") {
      poolForGame = getRegionalSpeedTriviaRounds(region);
    } else if (gameId === "QUICK_REFLEX") {
      poolForGame = QUICK_REFLEX_ROUNDS;
    } else if (gameId === "PRICE_GUESS") {
      poolForGame = getRegionalPriceGuessRounds(region);
    } else if (gameId === "WHATS_IN_FRAME") {
      poolForGame = WHATS_IN_FRAME_ROUNDS;
    } else if (gameId === "CLOSEST_NUMBER") {
      poolForGame = getRegionalClosestNumberRounds(region);
    } else if (gameId === "DRAWING_CHALLENGE") {
      poolForGame = getRegionalDrawingChallengeRounds(region);
    } else if (gameId === "MAP_PIN") {
      poolForGame = MAP_PIN_ROUNDS;
    } else if (gameId === "SCENE_DESCRIPTION") {
      poolForGame = SCENE_DESCRIPTION_ROUNDS;
    }

    const chosenRoundIndex = pickRandomizedMiniGameRoundIndex(
      poolForGame,
      room?.miniGameRoundIndex ?? roundIndex
    );

    updateRoom((draft) => {
      draft.majorMode = "MINI_GAMES";
      draft.activeMiniGameId = gameId;
      draft.miniGameRoundIndex = chosenRoundIndex;
      draft.submissions = {};
      draft.liveDrawingDataUrl = null;
      draft.roundSummaryText = "";
      draft.roundDurationSec = meta.defaultDurationSec;
      draft.roundStartedAt = Date.now();
      if (draft.players.length > 0) {
        draft.drawerPlayerId =
          draft.players[chosenRoundIndex % draft.players.length].id;
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

  const activeTab = room.phase;
  const allCategories = getAllCategories(room);
  const selectedCategories = allCategories.filter((c) =>
    room.selectedCategoryIds.includes(c.id)
  );
  const { category: activeCat, question: activeSeenJeemQ } =
    getActiveSeenJeemQuestion(room);

  // Normalized currentQuestion adapter with .text property for Round Result Screen
  const currentQuestion = activeSeenJeemQ
    ? { ...activeSeenJeemQ, text: activeSeenJeemQ.question }
    : null;

  const activeMiniGameMeta =
    MINI_GAMES_META.find((m) => m.id === room.activeMiniGameId) ||
    MINI_GAMES_META[0];

  const team1Players = room.players.filter((p) => p.team === "team1");
  const team2Players = room.players.filter((p) => p.team === "team2");
  const submissionsList = Object.values(room.submissions);
  const typedSubmissionsList = submissionsList.filter(
    (s) => !isBuzzAnswer(s.textAnswer)
  );
  const buzzQueue = getSortedBuzzQueue(room.submissions);
  const fastestBuzz = buzzQueue[0] || null;
  const isBuzzerActive =
    room.majorMode === "SEEN_JEEM" &&
    (answerMode === "BUZZER" || isRoomInBuzzerMode(room));

  const soundEnabled = room.settings?.soundEnabled ?? true;

  const werePointsAwardedManually =
    manualAwardedInRound ||
    room.roundSummaryText.includes("تم احتساب النقاط يدوياً") ||
    (room.majorMode === "SEEN_JEEM" &&
      typedSubmissionsList.length === 0 &&
      (room.seenJeemBaseAwarded.team1 > 0 ||
        room.seenJeemBaseAwarded.team2 > 0 ||
        isBuzzerActive));

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

      {/* Navigation Lock Confirmation Modal During Active Rounds */}
      {pendingNavTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          dir="rtl"
        >
          <div className="bg-cream border-4 border-black rounded-3xl p-6 max-w-md w-full shadow-brutal-lg space-y-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-sunny border-3 border-black shadow-brutal-sm flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-black" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-black">
                هل تريد بالتأكيد الخروج من السؤال الحالي؟
              </h3>
              <p className="text-xs font-bold text-gray-600">
                الخروج الآن سيوقف السؤال المفتوح حالياً على الشاشة وأجهزة اللاعبين.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingNavTarget(null)}
                className="py-3 rounded-2xl bg-white hover:bg-gray-100 text-black font-black text-xs border-3 border-black shadow-brutal-sm"
              >
                البقاء في السؤال
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = pendingNavTarget;
                  setPendingNavTarget(null);
                  executeTabNavigation(target);
                }}
                className="py-3 rounded-2xl bg-coral hover:bg-burnt hover:text-white text-black font-black text-xs border-3 border-black shadow-brutal-sm"
              >
                نعم، الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Host Settings Modal (Opened via ⚙️ إعدادات icon) */}
      {hostSettingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          dir="rtl"
        >
          <div className="bg-cream border-4 border-black rounded-3xl p-6 max-w-lg w-full shadow-brutal-lg space-y-5">
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-royal" />
                <h3 className="text-lg font-black">⚙️ إعدادات الغرفة واللوحة</h3>
              </div>
              <button
                type="button"
                onClick={() => setHostSettingsOpen(false)}
                className="w-8 h-8 rounded-xl bg-coral text-black border-2 border-black flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Team Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black mb-1">
                    اسم الفريق الأول
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={room.teams.team1.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateRoom((d) => {
                        d.teams.team1.name = val;
                        d.settings.team1Name = val;
                        d.teamA = { name: val, score: d.teams.team1.score };
                        return d;
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-black text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1">
                    اسم الفريق الثاني
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={room.teams.team2.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateRoom((d) => {
                        d.teams.team2.name = val;
                        d.settings.team2Name = val;
                        d.teamB = { name: val, score: d.teams.team2.score };
                        return d;
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-black text-xs"
                  />
                </div>
              </div>

              {/* Board Size (18 vs 36) */}
              <div className="space-y-2">
                <div className="text-xs font-black flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-royal" />
                  <span>حجم لوحة قَدْهَا؟:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleBoardSize(18)}
                    className={`px-3 py-2.5 rounded-xl border-2 border-black font-black text-xs transition ${
                      boardSize === 18
                        ? "bg-sunny text-black shadow-brutal-sm"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    جلسة سريعة (18 سؤال)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleBoardSize(36)}
                    className={`px-3 py-2.5 rounded-xl border-2 border-black font-black text-xs transition ${
                      boardSize === 36
                        ? "bg-sunny text-black shadow-brutal-sm"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    جلسة مطولة (36 سؤال)
                  </button>
                </div>
              </div>

              {/* Answer Mode (Auto-Referee vs Buzzer) */}
              <div className="space-y-2">
                <div className="text-xs font-black flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-burnt" />
                  <span>نظام الإجابة في قَدْهَا؟:</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAnswerMode("TYPING")}
                    className={`px-3 py-2.5 rounded-xl border-2 border-black font-black text-xs flex items-center justify-between transition ${
                      answerMode === "TYPING"
                        ? "bg-royal text-white shadow-brutal-sm"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <span>كتابة بالتليفون</span>
                    <Keyboard className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAnswerMode("BUZZER")}
                    className={`px-3 py-2.5 rounded-xl border-2 border-black font-black text-xs flex items-center justify-between transition ${
                      answerMode === "BUZZER"
                        ? "bg-burnt text-white shadow-brutal-sm"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <span>جرس الأسبقية</span>
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHostSettingsOpen(false)}
              className="w-full py-3 rounded-2xl bg-black text-sunny font-black text-xs border-2 border-black shadow-brutal-sm"
            >
              حفظ وإغلاق
            </button>
          </div>
        </div>
      )}

      {/* Top Host Navigation Bar */}
      <header className="bg-black text-white border-b-4 border-black px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Home, Room Code, QR Button, Sound Toggle, Region Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
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

            <button
              type="button"
              onClick={() => setHostSettingsOpen(true)}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xs border-2 border-white/25 flex items-center gap-1.5 transition"
              title="إعدادات الغرفة"
            >
              <Settings className="w-4 h-4 text-sunny" />
              <span>⚙️ إعدادات</span>
            </button>

            {/* B2B Cafe / University Club Sponsorship Banner in TV Top Header */}
            {(isB2BCafeUnlocked || (cafeConfig.enabled && cafeConfig.cafeName.trim())) && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-l from-amber-500 to-amber-400 text-black border-2 border-white shadow-brutal-sm">
                {cafeConfig.cafeLogoUrl?.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cafeConfig.cafeLogoUrl.trim()}
                    alt={cafeConfig.cafeName || "شعار المقهى"}
                    className="w-6 h-6 rounded-lg object-cover border border-black bg-white shrink-0"
                  />
                ) : (
                  <Coffee className="w-4 h-4 text-black shrink-0" />
                )}
                <span className="font-black text-xs md:text-sm whitespace-nowrap">
                  سهرة برعاية: {cafeConfig.cafeName.trim() || "مقهى الأبطال"}
                </span>
              </div>
            )}
          </div>

          {/* Right: Clean Stage Switcher (Locked During Active Question with Confirmation Modal) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleNavigationTabClick("LOBBY")}
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
              onClick={() => handleNavigationTabClick("SEEN_JEEM")}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 transition ${
                room.majorMode === "SEEN_JEEM" && room.phase !== "LOBBY"
                  ? "bg-sunny text-black border-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              لوحة قَدْهَا؟
            </button>

            <button
              type="button"
              onClick={() => handleNavigationTabClick("MINI_GAMES")}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs border-2 transition ${
                room.majorMode === "MINI_GAMES" && room.phase !== "LOBBY"
                  ? "bg-sunny text-black border-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              تحديات قَدْهَا؟
            </button>

            <button
              type="button"
              onClick={() => handleNavigationTabClick("LEADERBOARD")}
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

      {/* Scoreboard Strip — Hidden in LOBBY via {activeTab !== 'LOBBY' && (...)} */}
      {activeTab !== "LOBBY" && (
        <div className="bg-white border-b-4 border-black px-4 md:px-8 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Team 1 */}
            <div
              className="md:col-span-5 p-3 rounded-2xl border-3 border-black flex items-center justify-between transition"
              style={{
                backgroundColor:
                  room.activeTeamTurn === "team1" &&
                  room.majorMode === "SEEN_JEEM"
                    ? room.teams.team1.color
                    : `${room.teams.team1.color}22`,
                color:
                  room.activeTeamTurn === "team1" &&
                  room.majorMode === "SEEN_JEEM"
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
            <div className="md:col-span-2 flex flex-col items-center justify-center text-center gap-1.5">
              {room.majorMode === "SEEN_JEEM" ? (
                <>
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
                      {room.doublePointsActive
                        ? "🔥 دبل النقاط x2 (مفعل)"
                        : "🔥 دبل النقاط x2"}
                    </span>
                  </button>
                  <span className="px-2.5 py-0.5 rounded-full bg-black text-sunny text-[10px] font-black border border-black whitespace-nowrap">
                    دور الاختيار:{" "}
                    {room.activeTeamTurn === "team1"
                      ? room.teams.team1.name
                      : room.teams.team2.name}
                  </span>
                </>
              ) : (
                <div className="px-3 py-1.5 rounded-2xl bg-sunny border-2 border-black text-xs font-black">
                  {activeMiniGameMeta.title} • جولة #
                  {room.miniGameRoundIndex + 1}
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div
              className="md:col-span-5 p-3 rounded-2xl border-3 border-black flex items-center justify-between transition"
              style={{
                backgroundColor:
                  room.activeTeamTurn === "team2" &&
                  room.majorMode === "SEEN_JEEM"
                    ? room.teams.team2.color
                    : `${room.teams.team2.color}22`,
                color:
                  room.activeTeamTurn === "team2" &&
                  room.majorMode === "SEEN_JEEM"
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
      )}

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
                  امسح الباركود {edition.deviceTerm} للانضمام
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
                {edition.partyTerm} ({edition.gatheringPhrase}) • اختر شخصيتك
                الكرتونية وصوتك {edition.deviceTerm} ليظهر اسمك فوراً على الشاشة!
              </p>
            </div>

            {/* Interactive Team Rosters + Lobby Board Size & Buzzer Mode Toggles */}
            <div className="lg:col-span-8 bg-white border-4 border-black rounded-3xl p-6 shadow-brutal-lg flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-black">قائمة اللاعبين والفرق</h2>
                    <p className="text-xs font-bold text-gray-600">
                      اضغط على اللاعب لتبديل فريقه أو تعيين الكابتن (👑) أو سماع صوته
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-cream border-2 border-black text-xs font-black">
                      المتصلون: {room.players.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHostSettingsOpen(true)}
                      className="px-3 py-1 rounded-full bg-white hover:bg-sunny border-2 border-black text-xs font-black flex items-center gap-1 transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-royal" />
                      <span>⚙️ إعدادات</span>
                    </button>
                  </div>
                </div>

                {/* B2B Cafe / University Club Configuration Panel (Unlocked when B2B_CAFE license is active) */}
                {isB2BCafeUnlocked && (
                  <div className="bg-amber-50 border-3 border-black rounded-2xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-black text-xs text-black">
                        <Coffee className="w-4 h-4 text-amber-800" />
                        <span>إعدادات المقهى / النادي (B2B)</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-300 text-black font-black text-[10px] border border-black">
                        يظهر في الشريط العلوي لشاشة التلفزيون
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cafeConfig.cafeName}
                        onChange={(e) =>
                          updateCafeConfig({
                            cafeName: e.target.value,
                            enabled: true,
                          })
                        }
                        placeholder="اسم المقهى أو النادي الجامعي..."
                        className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white text-black font-black text-xs focus:outline-none"
                      />
                      <input
                        type="url"
                        dir="ltr"
                        value={cafeConfig.cafeLogoUrl}
                        onChange={(e) =>
                          updateCafeConfig({
                            cafeLogoUrl: e.target.value,
                            enabled: true,
                          })
                        }
                        placeholder="رابط شعار المقهى (اختياري https://...)"
                        className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white text-black font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                )}

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
                      d.roundSummaryText =
                        answerMode === "BUZZER" ? BUZZER_MODE_MARKER : "";
                      return d;
                    })
                  }
                  className="py-4 px-5 rounded-2xl bg-royal hover:bg-blue-700 text-white font-black text-base border-3 border-black shadow-brutal flex items-center justify-center gap-2 transition"
                >
                  <Tv className="w-5 h-5 text-sunny" />
                  <span>ابدأ لوحة قَدْهَا؟ التفاعلية ({boardSize} سؤال)</span>
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
                  <span>ابدأ تحديات قَدْهَا؟ الثمانية</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            QADHA BOARD (MODE_SELECT)
        ================================================================ */}
        {room.phase === "MODE_SELECT" && room.majorMode === "SEEN_JEEM" && (
          <div className="space-y-5">
            <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black">
                  لوحة قَدْهَا؟ التفاعلية ({boardSize} سؤال)
                </h2>
                <p className="text-xs font-bold text-gray-600">
                  اختر قيمة السؤال لفتحه {edition.deviceTerm} • الوضع الحالي:{" "}
                  {answerMode === "BUZZER"
                    ? "جرس الأسبقية (Buzzer Mode)"
                    : "كتابة بالتليفون (Auto-Referee)"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleShuffleBoardQuestions}
                  className="px-3.5 py-2 rounded-xl bg-mint hover:brightness-105 text-black border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5 transition"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>🔀 خلط أسئلة اللوحة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHostSettingsOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-cream hover:bg-sunny border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5 transition"
                >
                  <Settings className="w-4 h-4 text-royal" />
                  <span>⚙️ إعدادات</span>
                </button>

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
                    <span>تحدي قَدْهَا؟ فاصل ⚡</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setBuilderOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-sunny border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>✏️ تعديل وإضافة الأسئلة</span>
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
              {selectedCategories.map((category) => {
                const visibleQuestions = filterQuestionsByBoardSize(
                  category.questions,
                  boardSize,
                  boardShuffleSeed,
                  room.answeredQuestionIds
                );

                return (
                  <div
                    key={category.id}
                    className="bg-white border-4 border-black rounded-3xl p-3 shadow-brutal flex flex-col gap-2.5"
                  >
                    <div
                      className="p-3 rounded-2xl border-3 border-black text-center shadow-brutal-sm min-h-[88px] flex flex-col items-center justify-center gap-1.5 relative overflow-hidden"
                      style={{ backgroundColor: category.color }}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/85 border-2 border-black flex items-center justify-center shadow-sm">
                        {renderHostCategoryIcon(category.icon)}
                      </div>
                      <h3 className="font-black text-sm md:text-base text-black leading-snug relative z-10">
                        {category.title}
                      </h3>
                    </div>

                    <div
                      className={`grid ${
                        boardSize === 18 ? "grid-cols-1" : "grid-cols-2"
                      } gap-2`}
                    >
                      {visibleQuestions.map((q) => {
                        const isAnswered = room.answeredQuestionIds.includes(
                          q.id
                        );
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
                            className={`py-4 px-2 rounded-2xl border-3 font-black transition ${
                              isAnswered
                                ? "bg-neutral-900 text-neutral-500 border-neutral-700 opacity-45 pointer-events-none text-xs sm:text-sm shadow-none"
                                : `${bgByPoints} border-black font-mono text-xl text-black shadow-brutal-sm active:translate-x-[2px] active:translate-y-[2px]`
                            }`}
                          >
                            {isAnswered ? "✔ تم اللعب" : q.points}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
                  تحديات قَدْهَا؟ الثمانية التفاعلية
                </h2>
                <p className="text-xs font-bold text-black/80 mt-1">
                  اختر أي تحدٍ لبدء الجولة على الشاشة وأجهزة اللاعبين{" "}
                  {edition.deviceTerm}
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
                  العودة للوحة قَدْهَا؟
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
                        className="px-3 py-1 rounded-full border-2 border-black text-xs font-black flex items-center gap-1.5"
                        style={{ backgroundColor: game.color }}
                      >
                        {renderHostMiniGameIcon(game.icon)}
                        <span>تحدي #{game.number}</span>
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
                    onClick={() => handleStartMiniGameRound(game.id, undefined, true)}
                    className="mt-5 w-full py-2.5 rounded-xl bg-sunny hover:bg-yellow-300 text-black font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>ابدأ التحدي</span>
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
                      ? `${activeCat?.title || "لوحة قَدْهَا؟"} • ${
                          activeSeenJeemQ?.points || 200
                        } نقطة`
                      : `${activeMiniGameMeta.title} • الجولة #${
                          room.miniGameRoundIndex + 1
                        }`}
                  </div>
                  <div className="text-xs font-bold text-gray-600">
                    {isBuzzerActive
                      ? fastestBuzz
                        ? `🔔 الأسرع على الجرس: ${fastestBuzz.submission.playerName}`
                        : "🔔 وضع جرس الأسبقية نشط — بانتظار أسرع لاعب يضغط الجرس!"
                      : `تم استلام ${submissionsList.length} من أصل ${room.players.length} إجابات`}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {room.majorMode === "SEEN_JEEM" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleAnswerMode(
                        answerMode === "BUZZER" ? "TYPING" : "BUZZER"
                      )
                    }
                    className={`px-3.5 py-2.5 rounded-xl border-2 border-black font-black text-xs flex items-center gap-1.5 transition ${
                      isBuzzerActive
                        ? "bg-burnt text-white"
                        : "bg-cream text-black"
                    }`}
                  >
                    {isBuzzerActive ? (
                      <>
                        <Bell className="w-4 h-4" />
                        <span>جرس الأسبقية</span>
                      </>
                    ) : (
                      <>
                        <Keyboard className="w-4 h-4" />
                        <span>كتابة بالتليفون</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleLockAndReveal(room)}
                  className="px-5 py-2.5 rounded-xl bg-mint hover:brightness-105 text-black font-black text-xs md:text-sm border-3 border-black shadow-brutal flex items-center gap-2 transition"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>إظهار الإجابة والنتيجة</span>
                </button>
              </div>
            </div>

            {room.phase === "LOCKED" && (
              <div className="bg-black text-sunny border-4 border-black rounded-2xl p-4 text-center font-black text-lg animate-bounce">
                جاري فرز الإجابات بالحكم الذكي...
              </div>
            )}

            {/* Zero-Backend Buzzer Mode (`__BUZZ__`) TV Spotlight & One-Click Award */}
            {room.majorMode === "SEEN_JEEM" &&
              (isBuzzerActive || buzzQueue.length > 0) && (
                <div className="bg-sunny border-4 border-black rounded-3xl p-6 shadow-brutal-lg space-y-4">
                  {fastestBuzz ? (
                    (() => {
                      const fastestPlayerObj = room.players.find(
                        (p) => p.id === fastestBuzz.submission.playerId
                      );
                      const fastestCurrentTeam: TeamId =
                        fastestPlayerObj?.team || fastestBuzz.submission.team;
                      return (
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-burnt text-white border-3 border-black shadow-brutal-sm flex items-center justify-center text-2xl animate-bounce">
                              🔔
                            </div>
                            <CartoonAvatar
                              avatarId={fastestPlayerObj?.avatar}
                              size="md"
                            />
                            <div>
                              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-black text-sunny text-[11px] font-black">
                                <span>الأسرع على الجرس! (تم قفل باقي الأجهزة)</span>
                                <span dir="ltr">
                                  {(fastestBuzz.submission.elapsedMs / 1000).toFixed(
                                    2
                                  )}
                                  s
                                </span>
                              </div>
                              <div className="text-2xl md:text-3xl font-black text-black mt-1">
                                {fastestBuzz.submission.playerName}
                              </div>
                              <div className="text-xs font-black text-royal">
                                فريق:{" "}
                                {fastestCurrentTeam === "team1"
                                  ? room.teams.team1.name
                                  : room.teams.team2.name}
                              </div>
                            </div>
                          </div>

                          {/* One-Click Host Award Buttons */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleManualAwardPoints(fastestCurrentTeam)
                              }
                              className="px-5 py-3 rounded-2xl bg-mint hover:brightness-105 text-black font-black text-xs md:text-sm border-3 border-black shadow-brutal flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                إجابة صحيحة (+
                                {(activeSeenJeemQ?.points || 200) *
                                  (room.doublePointsActive ? 2 : 1)}{" "}
                                لـ{" "}
                                {fastestCurrentTeam === "team1"
                                  ? room.teams.team1.name
                                  : room.teams.team2.name}
                                )
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleManualAwardPoints(
                                  fastestCurrentTeam === "team1"
                                    ? "team2"
                                    : "team1"
                                )
                              }
                              className="px-4 py-3 rounded-2xl bg-royal text-white font-black text-xs border-3 border-black shadow-brutal-sm"
                            >
                              نقاط للفريق الآخر (
                              {fastestCurrentTeam === "team1"
                                ? room.teams.team2.name
                                : room.teams.team1.name}
                              )
                            </button>

                            <button
                              type="button"
                              onClick={handleResetBuzzerForRound}
                              className="px-3.5 py-3 rounded-2xl bg-white hover:bg-cream text-black font-black text-xs border-3 border-black shadow-brutal-sm flex items-center gap-1"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>فتح الجرس مجدداً</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🔔</span>
                        <div>
                          <div className="font-black text-base">
                            جرس الأسبقية مفعل الآن على أجهزة اللاعبين!
                          </div>
                          <div className="text-xs font-bold text-black/80">
                            أول لاعب يضغط «🔔 اضغط للإجابة!» على هاتفه سيظهر اسمه
                            هنا مع قفل باقي الأجهزة تلقائياً.
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleManualAwardPoints("team1")}
                          className="px-3.5 py-2 rounded-xl bg-royal text-white border-2 border-black text-xs font-black"
                        >
                          +{room.teams.team1.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleManualAwardPoints("team2")}
                          className="px-3.5 py-2 rounded-xl bg-burnt text-white border-2 border-black text-xs font-black"
                        >
                          +{room.teams.team2.name}
                        </button>
                      </div>
                    </div>
                  )}
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

            {/* Player Submission Status Pills (Gender-Neutral Status: "يكتب الإجابة الآن...") */}
            <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal">
              <div className="flex flex-wrap gap-3">
                {room.players.map((p) => {
                  const sub = room.submissions[p.id];
                  const hasSubmitted = Boolean(sub);
                  const isBuzzedPlayer = isBuzzAnswer(sub?.textAnswer);
                  const isFastestBuzzer =
                    fastestBuzz?.submission.playerId === p.id;
                  const isDrawer =
                    room.majorMode === "MINI_GAMES" &&
                    room.activeMiniGameId === "DRAWING_CHALLENGE" &&
                    room.drawerPlayerId === p.id;

                  return (
                    <div
                      key={p.id}
                      className={`px-3.5 py-2 rounded-2xl border-3 border-black font-black text-xs flex items-center gap-2 transition ${
                        isFastestBuzzer
                          ? "bg-sunny text-black shadow-brutal scale-105"
                          : isDrawer
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
                      ) : isBuzzedPlayer ? (
                        <span className="bg-burnt text-white px-2 py-0.5 rounded-full text-[10px]">
                          🔔 ضغط الجرس
                        </span>
                      ) : hasSubmitted ? (
                        <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px]">
                          وصل الجواب ✔
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-75">
                          يكتب الإجابة الآن...
                        </span>
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
                            d.roundSummaryText =
                              answerMode === "BUZZER"
                                ? BUZZER_MODE_MARKER
                                : "";
                            return d;
                          })
                        }
                        className="px-6 py-3 rounded-2xl bg-royal text-white font-black text-sm border-3 border-black shadow-brutal"
                      >
                        العودة للوحة قَدْهَا؟
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
                          تحدي قَدْهَا؟ فاصل ⚡
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
                        الجولة التالية ⚡
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
                        تغيير التحدي
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Fix 6: Show currentQuestion.text in a clear badge directly above "الجواب الصحيح" */}
              {room.majorMode === "SEEN_JEEM" && currentQuestion && (
                <div className="bg-white border-3 border-black rounded-2xl p-5 space-y-2.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cream border-2 border-black text-xs md:text-sm font-black text-black">
                    <span>السؤال:</span>
                    <span>{currentQuestion.text}</span>
                  </div>
                  <div className="text-xs font-black text-royal">
                    الجواب الصحيح:
                  </div>
                  <div className="text-2xl md:text-4xl font-black text-black">
                    {currentQuestion.displayAnswer}
                  </div>
                  {currentQuestion.trapNote && (
                    <div className="p-3 rounded-xl bg-sunny/45 border-2 border-black text-xs md:text-sm font-black text-black flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-burnt shrink-0" />
                      <span>{currentQuestion.trapNote}</span>
                    </div>
                  )}
                  <p className="text-xs md:text-sm font-bold text-gray-700">
                    {currentQuestion.funFact}
                  </p>
                </div>
              )}

              <div className="text-base md:text-lg font-black text-black">
                {room.roundSummaryText === BUZZER_MODE_MARKER
                  ? "تم احتساب النقاط يدوياً بواسطة المضيف"
                  : room.roundSummaryText}
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

              {typedSubmissionsList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-cream border-2 border-black text-center font-bold text-gray-700 text-sm space-y-3">
                  <div>
                    {werePointsAwardedManually
                      ? "تم احتساب النقاط يدوياً بواسطة المضيف"
                      : "لم يرسل أي لاعب إجابة في هذه الجولة."}
                  </div>

                  {buzzQueue.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      {buzzQueue.map((entry, idx) => (
                        <span
                          key={entry.submission.playerId}
                          className={`px-3 py-1 rounded-xl border-2 border-black text-xs font-black ${
                            idx === 0
                              ? "bg-sunny text-black"
                              : "bg-white text-gray-700"
                          }`}
                        >
                          {idx === 0 ? "🔔 الأسرع:" : `#${idx + 1}`}{" "}
                          {entry.submission.playerName} (
                          {(entry.submission.elapsedMs / 1000).toFixed(2)}s)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {typedSubmissionsList.map((sub) => {
                    const pl = room.players.find((p) => p.id === sub.playerId);
                    const actualPlayerTeam: TeamId = pl?.team || sub.team;
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
                                {actualPlayerTeam === "team1"
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
                          {sub.textAnswer && <div>«{sub.textAnswer}»</div>}
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

                        {/* Bug 2 Fix: "اعتمد النقاط" Button in "أدق وصف" & Text Submissions */}
                        {(room.activeMiniGameId === "SCENE_DESCRIPTION" ||
                          Boolean(sub.textAnswer)) && (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              disabled={Boolean(sub.manualCredited)}
                              onClick={() =>
                                handleCreditPlayerSubmission(sub.playerId, 300)
                              }
                              className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs flex items-center gap-1.5 transition ${
                                sub.manualCredited
                                  ? "bg-mint text-black opacity-85 cursor-default"
                                  : "bg-sunny hover:bg-yellow-300 text-black shadow-brutal-sm"
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {sub.manualCredited
                                  ? "✔ تم احتساب +300 نقطة"
                                  : "اعتمد النقاط (+300)"}
                              </span>
                            </button>
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
                      onClick={() => handleManualAwardPoints("team1")}
                      className="px-3 py-1.5 rounded-xl bg-royal text-white border-2 border-black text-xs font-black"
                    >
                      {room.teams.team1.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualAwardPoints("team2")}
                      className="px-3 py-1.5 rounded-xl bg-burnt text-white border-2 border-black text-xs font-black"
                    >
                      {room.teams.team2.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualAwardPoints("both")}
                      className="px-3 py-1.5 rounded-xl bg-mint text-black border-2 border-black text-xs font-black"
                    >
                      الفريقين معاً
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualAwardPoints("none")}
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
            LEADERBOARD (Fix 1: Hide individual 0 نقطة badges in Team Mode & display Team Badge instead)
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
              <h3 className="text-base font-black">قائمة اللاعبين والفرق:</h3>
              {[...room.players]
                .sort((a, b) => {
                  const teamScoreA = room.teams[a.team].score;
                  const teamScoreB = room.teams[b.team].score;
                  if (teamScoreB !== teamScoreA) return teamScoreB - teamScoreA;
                  return b.score - a.score;
                })
                .map((p, idx) => {
                  const playerTeamInfo =
                    p.team === "team1" ? room.teams.team1 : room.teams.team2;

                  return (
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

                      {/* Team Badge displayed instead of individual 0 نقطة badge */}
                      <span
                        className="px-3.5 py-1 rounded-full text-white font-black text-xs border-2 border-black shadow-brutal-sm"
                        style={{ backgroundColor: playerTeamInfo.color }}
                      >
                        {playerTeamInfo.name}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Discrete Footer with Hidden DevDrawer */}
      <footer className="bg-black text-cream border-t-4 border-black px-6 py-3 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-bold">
          <span>
            غرفة: {room.code} • {edition.partyTerm}
          </span>
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
              <span className="font-black text-lg">
                انضم للغرفة {edition.deviceTerm}
              </span>
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
        onBankUpdated={() => setBankRefreshTick((t) => t + 1)}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS & UNIQUE ICON RENDERERS FOR HOST VIEW
// ============================================================================

function renderHostCategoryIcon(iconName: string) {
  switch (iconName) {
    case "Trophy":
      return <Trophy className="w-4 h-4 text-black" />;
    case "Landmark":
      return <Landmark className="w-4 h-4 text-black" />;
    case "Puzzle":
      return <Puzzle className="w-4 h-4 text-black" />;
    case "Clapperboard":
      return <Clapperboard className="w-4 h-4 text-black" />;
    case "Atom":
      return <Atom className="w-4 h-4 text-black" />;
    case "ScrollText":
      return <ScrollText className="w-4 h-4 text-black" />;
    case "Globe2":
      return <Globe2 className="w-4 h-4 text-black" />;
    case "Cpu":
      return <Cpu className="w-4 h-4 text-black" />;
    default:
      return <Sparkles className="w-4 h-4 text-black" />;
  }
}

function renderHostMiniGameIcon(iconName: string) {
  switch (iconName) {
    case "Zap":
      return <Zap className="w-3.5 h-3.5 text-black" />;
    case "Brain":
      return <Brain className="w-3.5 h-3.5 text-black" />;
    case "BadgeDollarSign":
      return <BadgeDollarSign className="w-3.5 h-3.5 text-black" />;
    case "ScanSearch":
      return <ScanSearch className="w-3.5 h-3.5 text-black" />;
    case "Hash":
      return <Hash className="w-3.5 h-3.5 text-black" />;
    case "Palette":
      return <Palette className="w-3.5 h-3.5 text-black" />;
    case "MapPin":
      return <MapPin className="w-3.5 h-3.5 text-black" />;
    case "FileText":
      return <FileText className="w-3.5 h-3.5 text-black" />;
    default:
      return <Gamepad2 className="w-3.5 h-3.5 text-black" />;
  }
}

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
  const { region, edition } = useEdition();
  const gId = room.activeMiniGameId;
  const rIdx = room.miniGameRoundIndex;

  if (gId === "SPEED_TRIVIA") {
    const speedPool = getRegionalSpeedTriviaRounds(region);
    const rawRound = speedPool[rIdx % speedPool.length];
    const round = getShuffledSpeedTriviaRound(rawRound, room.code, rIdx);
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
    const priceRounds = getRegionalPriceGuessRounds(region);
    const round = priceRounds[rIdx % priceRounds.length];
    const currencyText =
      region === "MA" ? "درهم مغربي (DH)" : edition.currencyLabel;
    return (
      <EcommerceProductCard round={round} currencyLabel={currencyText} />
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
    const closestPool = getRegionalClosestNumberRounds(region);
    const round = closestPool[rIdx % closestPool.length];
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
    const drawPool = getRegionalDrawingChallengeRounds(region);
    const round = drawPool[rIdx % drawPool.length];
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
