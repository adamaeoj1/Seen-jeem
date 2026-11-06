"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Edit3,
  Eraser,
  Home,
  MapPin,
  Send,
  ShieldCheck,
  Trash2,
  Trophy,
  Undo2,
  Volume2,
} from "lucide-react";
import {
  createInitialRoomState,
  getActiveSeenJeemQuestion,
  loadRoomFromLocal,
  loadSavedPlayerIdentity,
  MINI_GAMES_META,
  Player,
  PlayerSubmission,
  RoomState,
  savePlayerIdentity,
  saveRoomToLocalAndBroadcast,
  subscribeToRoomUpdates,
  TeamId,
} from "@/lib/gameEngine";
import {
  CLOSEST_NUMBER_ROUNDS,
  DRAWING_CHALLENGE_ROUNDS,
  MAP_PIN_ROUNDS,
  PRICE_GUESS_ROUNDS,
  QUICK_REFLEX_ROUNDS,
  ReflexColor,
  ReflexShape,
  SCENE_DESCRIPTION_ROUNDS,
  SPEED_TRIVIA_ROUNDS,
  WHATS_IN_FRAME_ROUNDS,
} from "@/data/seedQuestions";
import { parseArabicNumber } from "@/lib/arabicReferee";
import {
  FrameSceneArtwork,
  ProductArtwork,
  SceneDescriptionArtwork,
} from "@/components/GameArtwork";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import {
  AVATAR_CHARACTERS,
  AvatarCharacterId,
  CartoonAvatar,
  normalizeAvatarId,
} from "@/components/CartoonAvatars";
import { playVoicePack, VOICE_PACKS, VoicePackId } from "@/lib/soundEffects";
import { dbRegisterRoomPlayer } from "@/lib/db";
import { DevDrawer } from "@/components/DevDrawer";

export default function PlayerControllerPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const roomCode = (params?.code || "K7Q2").toUpperCase().trim();

  const [room, setRoom] = useState<RoomState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

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
  const [timeLeft, setTimeLeft] = useState(45);

  const lastRoundKeyRef = useRef<string>("");

  // Load room & register player
  useEffect(() => {
    let existing = loadRoomFromLocal(roomCode);
    if (!existing) {
      existing = createInitialRoomState(roomCode);
      saveRoomToLocalAndBroadcast(existing);
    }
    setRoom(existing);

    const savedId = loadSavedPlayerIdentity();
    if (savedId && savedId.name) {
      ensurePlayerInRoom(
        existing,
        savedId.id,
        savedId.name,
        normalizeAvatarId(savedId.avatar),
        (savedId.voiceId as VoicePackId) || "hype_horn",
        savedId.team
      );
    } else {
      setNeedsOnboarding(true);
    }

    const unsubscribe = subscribeToRoomUpdates(roomCode, (updated) => {
      setRoom(updated);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

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

  // Sync currentPlayer object whenever room.players updates
  useEffect(() => {
    if (!room || !currentPlayer) return;
    const updatedMe = room.players.find((p) => p.id === currentPlayer.id);
    if (updatedMe) {
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
    team: TeamId
  ) => {
    const cloned: RoomState = JSON.parse(JSON.stringify(targetRoom));
    let found = cloned.players.find((p) => p.id === id);
    if (!found) {
      found = {
        id,
        name,
        avatar,
        voiceId,
        team,
        isCaptain: false,
        isOnline: true,
        score: 0,
        connectedAt: Date.now(),
      };
      cloned.players.push(found);
      saveRoomToLocalAndBroadcast(cloned, found);
      dbRegisterRoomPlayer(roomCode, found).catch(() => {});
      setRoom(cloned);
    }
    setCurrentPlayer(found);
    setNeedsOnboarding(false);
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

  const submitPlayerResponse = (payload: Partial<PlayerSubmission>) => {
    if (!room || !currentPlayer) return;
    const elapsedMs = Math.max(100, Date.now() - room.roundStartedAt);
    const sub: PlayerSubmission = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      team: currentPlayer.team,
      submittedAt: Date.now(),
      elapsedMs,
      ...payload,
    };

    const cloned: RoomState = JSON.parse(JSON.stringify(room));
    cloned.submissions[currentPlayer.id] = sub;
    saveRoomToLocalAndBroadcast(cloned);
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

  // Onboarding Screen with 8 Custom SVG Illustrated Avatars + Voice Picker
  if (needsOnboarding || !currentPlayer) {
    return (
      <div className="max-w-md mx-auto min-h-[100dvh] bg-sunny border-x-4 border-black p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="bg-black text-sunny rounded-2xl p-3.5 border-2 border-black flex items-center justify-between">
            <span className="font-black text-xs">جهاز تحكم اللاعب</span>
            <span dir="ltr" className="font-mono font-black text-base">
              {room.code}
            </span>
          </div>

          <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
            <h1 className="text-xl font-black">انضم للغرفة</h1>

            <form onSubmit={handleCompleteOnboarding} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black mb-1">اسمك</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="مثال: عزوز"
                  className="w-full px-3.5 py-2.5 rounded-xl border-3 border-black bg-cream font-black text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJoinTeam("team1")}
                  className={`py-2.5 rounded-xl border-2 border-black font-black text-xs transition ${
                    joinTeam === "team1"
                      ? "bg-royal text-white shadow-brutal-sm"
                      : "bg-cream text-black"
                  }`}
                >
                  {room.teams.team1.name}
                </button>
                <button
                  type="button"
                  onClick={() => setJoinTeam("team2")}
                  className={`py-2.5 rounded-xl border-2 border-black font-black text-xs transition ${
                    joinTeam === "team2"
                      ? "bg-burnt text-white shadow-brutal-sm"
                      : "bg-cream text-black"
                  }`}
                >
                  {room.teams.team2.name}
                </button>
              </div>

              {/* 8 Custom SVG Illustrated Avatars */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black">
                  اختر شخصيتك الكرتونية:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_CHARACTERS.map((char) => (
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
                      <span className="text-[10px] font-black leading-none">
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
  const hasSubmittedAndLocked = Boolean(mySubmission) && !isEditingAnswer;
  const { category: activeCat, question: activeSeenJeemQ } =
    getActiveSeenJeemQuestion(room);
  const activeMiniGameMeta =
    MINI_GAMES_META.find((m) => m.id === room.activeMiniGameId) ||
    MINI_GAMES_META[0];

  const headerColor =
    currentPlayer.team === "team1"
      ? room.teams.team1.color
      : room.teams.team2.color;

  return (
    <div className="max-w-md mx-auto min-h-[100dvh] bg-cream border-x-4 border-black flex flex-col justify-between shadow-2xl">
      {/* Clean Mobile Controller Header */}
      <header
        className="text-white border-b-4 border-black p-3.5 flex items-center justify-between"
        style={{ backgroundColor: headerColor }}
      >
        <div className="flex items-center gap-2.5">
          <CartoonAvatar avatarId={currentPlayer.avatar} size="sm" />
          <div>
            <div className="font-black text-sm flex items-center gap-1">
              <span>{currentPlayer.name}</span>
              {currentPlayer.isCaptain && <span>👑</span>}
            </div>
            <div className="text-[11px] font-bold text-sunny">
              {currentPlayer.team === "team1"
                ? room.teams.team1.name
                : room.teams.team2.name}{" "}
              • {currentPlayer.score} نقطة
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

      {/* Main Controller Body */}
      <main className="flex-1 p-4 flex flex-col justify-center space-y-4 overflow-y-auto">
        {/* WAITING STATES: LOBBY, MODE_SELECT, ROUND_INTRO */}
        {(room.phase === "LOBBY" ||
          room.phase === "MODE_SELECT" ||
          room.phase === "ROUND_INTRO") && (
          <div className="bg-sunny border-4 border-black rounded-3xl p-6 shadow-brutal text-center space-y-4">
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
              className="w-full py-3 rounded-2xl bg-white hover:bg-cream text-black font-black text-xs border-3 border-black shadow-brutal-sm flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-royal" />
              <span>🔊 جرب صوتك في الغرفة</span>
            </button>

            <div className="bg-white border-3 border-black rounded-2xl p-3 text-xs font-black flex items-center justify-between">
              <span>نقاط فريقك:</span>
              <span className="font-mono text-base text-royal">
                {room.teams[currentPlayer.team].score}
              </span>
            </div>
          </div>
        )}

        {/* ANSWER RECEIVED STATE ("وصل جوابك ✔" + "تعديل") */}
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
              {mySubmission.textAnswer && (
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
                if (mySubmission.textAnswer) {
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

        {/* ACTIVE INPUT CONTROLLERS */}
        {room.phase === "PLAYING" && !hasSubmittedAndLocked && (
          <>
            {/* MODE A: SEEN JEEM CONTROLLER */}
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

                <h2 className="text-base font-black leading-snug bg-white border-3 border-black rounded-2xl p-4">
                  {activeSeenJeemQ.question}
                </h2>

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
              </div>
            )}

            {/* MINI-GAME #1: SPEED_TRIVIA */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "SPEED_TRIVIA" && (
                <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
                  {(() => {
                    const round =
                      SPEED_TRIVIA_ROUNDS[
                        room.miniGameRoundIndex % SPEED_TRIVIA_ROUNDS.length
                      ];
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
                <div className="bg-sunny border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
                  {(() => {
                    const round =
                      PRICE_GUESS_ROUNDS[
                        room.miniGameRoundIndex % PRICE_GUESS_ROUNDS.length
                      ];
                    return (
                      <>
                        <ProductArtwork type={round.illustrationType} />
                        <h3 className="text-sm font-black bg-white border-2 border-black rounded-xl p-3">
                          {round.productName}
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
                            placeholder="السعر بالريال السعودي"
                            className="w-full px-4 py-3 rounded-2xl border-3 border-black bg-white font-mono font-black text-xl text-center"
                          />
                          <button
                            type="submit"
                            className="w-full py-3.5 rounded-2xl bg-black text-sunny font-black text-sm border-3 border-black shadow-brutal"
                          >
                            اعتماد السعر
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
                    const round =
                      WHATS_IN_FRAME_ROUNDS[
                        room.miniGameRoundIndex % WHATS_IN_FRAME_ROUNDS.length
                      ];
                    return (
                      <>
                        <FrameSceneArtwork artworkId={round.sceneArtworkId} />
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
                    const round =
                      CLOSEST_NUMBER_ROUNDS[
                        room.miniGameRoundIndex % CLOSEST_NUMBER_ROUNDS.length
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
                />
              )}

            {/* MINI-GAME #7: MAP_PIN */}
            {room.majorMode === "MINI_GAMES" &&
              room.activeMiniGameId === "MAP_PIN" && (
                <div className="bg-white border-4 border-black rounded-3xl p-4 shadow-brutal space-y-3">
                  {(() => {
                    const round =
                      MAP_PIN_ROUNDS[
                        room.miniGameRoundIndex % MAP_PIN_ROUNDS.length
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
                    const round =
                      SCENE_DESCRIPTION_ROUNDS[
                        room.miniGameRoundIndex %
                          SCENE_DESCRIPTION_ROUNDS.length
                      ];
                    return (
                      <>
                        <div className="bg-coral/40 border-2 border-black rounded-xl p-2.5 text-xs font-black">
                          {round.prompt}
                        </div>
                        <SceneDescriptionArtwork
                          sceneId={round.sceneArtworkId}
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
            <p className="text-xs font-bold text-gray-700 bg-cream border-2 border-black rounded-xl p-3">
              {room.roundSummaryText}
            </p>

            {mySubmission ? (
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
                لم ترسل إجابة في هذه الجولة.
              </div>
            )}
          </div>
        )}

        {room.phase === "LEADERBOARD" && (
          <div className="bg-sunny border-4 border-black rounded-3xl p-6 shadow-brutal text-center space-y-4">
            <Trophy className="w-11 h-11 mx-auto text-black" />
            <h2 className="text-2xl font-black">نقاطك: {currentPlayer.score}</h2>
            <p className="text-xs font-bold">
              {room.teams.team1.name}: {room.teams.team1.score} •{" "}
              {room.teams.team2.name}: {room.teams.team2.score}
            </p>
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
}: {
  room: RoomState;
  currentPlayer: Player;
  textInput: string;
  setTextInput: (val: string) => void;
  onSubmitGuess: (txt: string) => void;
  onUpdateLiveCanvas: (dataUrl: string) => void;
}) {
  const round =
    DRAWING_CHALLENGE_ROUNDS[
      room.miniGameRoundIndex % DRAWING_CHALLENGE_ROUNDS.length
    ];
  const isDrawer = room.drawerPlayerId === currentPlayer.id;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize] = useState(6);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

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
          ابدأ الرسم من جوالك
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
