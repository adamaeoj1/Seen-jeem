import {
  CLOSEST_NUMBER_ROUNDS,
  ClosestNumberRound,
  DRAWING_CHALLENGE_ROUNDS,
  DrawingChallengeRound,
  MAP_PIN_ROUNDS,
  MINI_GAMES_META,
  MiniGameId,
  PRICE_GUESS_ROUNDS,
  PriceGuessRound,
  QUICK_REFLEX_ROUNDS,
  SCENE_DESCRIPTION_ROUNDS,
  SEEN_JEEM_CATEGORIES,
  SeenJeemCategory,
  SeenJeemQuestion,
  SPEED_TRIVIA_ROUNDS,
  SpeedTriviaRound,
  WHATS_IN_FRAME_ROUNDS,
} from "@/data/seedQuestions";
import {
  MOROCCAN_PRICE_GUESS_ROUNDS,
  MOROCCAN_SEEN_JEEM_CATEGORIES,
} from "@/data/moroccanSeedQuestions";
import { EditionRegion, getEditionRegion } from "@/lib/editionManager";
import {
  applyQuestionBankOverrides,
  getMergedClosestNumberRounds,
  getMergedDrawingRounds,
  getMergedPriceGuessRounds,
  getMergedSpeedTriviaRounds,
  getShuffledSpeedTriviaRound,
  markQuestionAsPlayed,
} from "@/lib/questionRandomizer";
import { getActiveLicense } from "@/lib/voucherEngine";
import {
  calculateHaversineDistanceKm,
  DescriptionVerdict,
  evaluateArabicAnswer,
  evaluateDescriptionTags,
  RefereeVerdict,
  scoreMapDistance,
} from "@/lib/arabicReferee";
import { AvatarCharacterId, AVATAR_CHARACTERS } from "@/components/CartoonAvatars";
import { VoicePackId } from "@/lib/soundEffects";
import {
  broadcastRoomState,
  loadCachedRoom,
  subscribeToRoomRealtime,
} from "@/lib/realtime";
import {
  getCachedProfile,
  loadLocalCustomPacks,
  setCachedProfile,
  updateProfileRecord,
  UserProfileRecord,
} from "@/lib/db";

export type GameStatePhase =
  | "LOBBY"
  | "MODE_SELECT"
  | "ROUND_INTRO"
  | "PLAYING"
  | "LOCKED"
  | "REVEAL_AND_SCORE"
  | "LEADERBOARD";

export type MajorGameMode = "SEEN_JEEM" | "MINI_GAMES";
export type SessionModeConfig = "SEEN_JEEM" | "MINI_GAMES" | "MIXED_PARTY";
export type TeamId = "team1" | "team2";

export interface RoomSettings {
  sessionMode: SessionModeConfig;
  team1Name: string;
  team1Color: string;
  team2Name: string;
  team2Color: string;
  timerSec: 30 | 45 | 60;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: AvatarCharacterId | string;
  voiceId: VoicePackId | string;
  team: TeamId;
  isCaptain: boolean;
  isOnline?: boolean;
  score: number;
  connectedAt: number;
  isBot?: boolean;
}

export interface PlayerSubmission {
  playerId: string;
  playerName: string;
  team: TeamId;
  submittedAt: number;
  elapsedMs: number;
  textAnswer?: string;
  optionIndex?: number;
  reflexCellId?: string;
  numericValue?: number;
  pinLat?: number;
  pinLng?: number;
  graded?: boolean;
  isCorrect?: boolean;
  pointsAwarded?: number;
  manualCredited?: boolean;
  refereeVerdict?: RefereeVerdict;
  descriptionVerdict?: DescriptionVerdict;
  distanceKm?: number;
  numericDiff?: number;
  rank?: number;
}

export interface TeamInfo {
  id: TeamId;
  name: string;
  color: string;
  score: number;
  doublePointsRemaining: number;
}

export interface RoomState {
  code: string;
  createdAt: number;
  updatedAt: number;
  hostTier: SubscriptionTierId;
  phase: GameStatePhase;
  majorMode: MajorGameMode;
  settings: RoomSettings;

  teams: {
    team1: TeamInfo;
    team2: TeamInfo;
  };
  teamA?: { name: string; score: number };
  teamB?: { name: string; score: number };
  edition?: "MA" | "MENA";
  boardSize?: 18 | 36;
  answeringMode?: "TYPING" | "BUZZER";
  players: Player[];

  // Timer state
  roundStartedAt: number;
  roundDurationSec: number;

  // Seen Jeem state
  selectedCategoryIds: string[];
  customCategories: SeenJeemCategory[];
  answeredQuestionIds: string[];
  activeCategoryId: string | null;
  activeQuestionId: string | null;
  activeTeamTurn: TeamId;
  doublePointsActive: boolean;
  lastSeenJeemWinner: TeamId | "both" | "none" | null;
  seenJeemBaseAwarded: { team1: number; team2: number };

  // Mini-Games (Gimnim) state
  activeMiniGameId: MiniGameId;
  miniGameRoundIndex: number;
  drawerPlayerId: string | null;
  liveDrawingDataUrl: string | null;

  // Submissions for the active question / round
  submissions: Record<string, PlayerSubmission>;
  roundSummaryText: string;
}

export type SubscriptionTierId = "FREE_TRIAL" | "PARTY_PASS" | "PRO_HOST";

export interface UserSubscriptionState {
  tier: SubscriptionTierId;
  freeSessionsRemaining: number;
  partyPassExpiresAt: number | null;
  proSubscriptionActive: boolean;
  customCategories: SeenJeemCategory[];
  profileName?: string;
  profileEmail?: string;
}

const PLAYER_IDENTITY_KEY = "seen_jeem_player_identity_v2";

export const AVATAR_OPTIONS: AvatarCharacterId[] = AVATAR_CHARACTERS.map(
  (c) => c.id
);

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getRegionalSeedCategories(
  region: EditionRegion = getEditionRegion()
): SeenJeemCategory[] {
  const base =
    region === "MA" ? MOROCCAN_SEEN_JEEM_CATEGORIES : SEEN_JEEM_CATEGORIES;
  return applyQuestionBankOverrides(base);
}

export function getRegionalPriceGuessRounds(
  region: EditionRegion = getEditionRegion()
): PriceGuessRound[] {
  const merged = getMergedPriceGuessRounds(region);
  if (merged.length > 0) return merged;
  return region === "MA" ? MOROCCAN_PRICE_GUESS_ROUNDS : PRICE_GUESS_ROUNDS;
}

export function getRegionalSpeedTriviaRounds(
  region: EditionRegion = getEditionRegion()
): SpeedTriviaRound[] {
  const merged = getMergedSpeedTriviaRounds(region);
  return merged.length > 0 ? merged : SPEED_TRIVIA_ROUNDS;
}

export function getRegionalClosestNumberRounds(
  region: EditionRegion = getEditionRegion()
): ClosestNumberRound[] {
  const merged = getMergedClosestNumberRounds(region);
  return merged.length > 0 ? merged : CLOSEST_NUMBER_ROUNDS;
}

export function getRegionalDrawingChallengeRounds(
  region: EditionRegion = getEditionRegion()
): DrawingChallengeRound[] {
  const merged = getMergedDrawingRounds(region);
  return merged.length > 0 ? merged : DRAWING_CHALLENGE_ROUNDS;
}

export function sanitizeRoomPlayers(players?: Player[]): Player[] {
  if (!Array.isArray(players)) return [];
  const legacySeedBotIds = new Set(["p-falcon-cap", "p-tiger-cap"]);
  return players.filter(
    (p) =>
      p &&
      !legacySeedBotIds.has(p.id) &&
      !(p.isBot && (p.name === "ياسين" || p.name === "طه" || p.name === "سلطان" || p.name === "نورة" || p.name === "كنزة"))
  );
}

export function createInitialRoomState(
  code: string,
  hostTier: SubscriptionTierId = "FREE_TRIAL",
  customCategories: SeenJeemCategory[] = [],
  customSettings?: Partial<RoomSettings>,
  chosenCategories?: string[]
): RoomState {
  const cleanCode = code.toUpperCase().trim();
  const activeRegion = getEditionRegion();
  const regionalCats = getRegionalSeedCategories(activeRegion);
  const defaultCategories =
    chosenCategories && chosenCategories.length > 0
      ? chosenCategories.slice(0, 6)
      : regionalCats.slice(0, 6).map((c) => c.id);

  const settings: RoomSettings = {
    sessionMode: customSettings?.sessionMode || "SEEN_JEEM",
    team1Name:
      customSettings?.team1Name?.trim() ||
      (activeRegion === "MA" ? "أسود الأطلس" : "فريق الصقور"),
    team1Color: customSettings?.team1Color || "#3B66B4",
    team2Name:
      customSettings?.team2Name?.trim() ||
      (activeRegion === "MA" ? "القراصنة" : "فريق النمور"),
    team2Color: customSettings?.team2Color || "#E65C2E",
    timerSec: customSettings?.timerSec || 45,
    soundEnabled: customSettings?.soundEnabled ?? true,
    musicEnabled: customSettings?.musicEnabled ?? true,
  };

  const initialMajorMode: MajorGameMode =
    settings.sessionMode === "MINI_GAMES" ? "MINI_GAMES" : "SEEN_JEEM";

  return {
    code: cleanCode,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hostTier,
    phase: "LOBBY",
    majorMode: initialMajorMode,
    edition: activeRegion,
    boardSize: 18,
    answeringMode: "TYPING",
    settings,
    teams: {
      team1: {
        id: "team1",
        name: settings.team1Name,
        color: settings.team1Color,
        score: 0,
        doublePointsRemaining: 1,
      },
      team2: {
        id: "team2",
        name: settings.team2Name,
        color: settings.team2Color,
        score: 0,
        doublePointsRemaining: 1,
      },
    },
    teamA: {
      name: settings.team1Name,
      score: 0,
    },
    teamB: {
      name: settings.team2Name,
      score: 0,
    },
    players: [], // Zero default bots when creating any new room
    roundStartedAt: Date.now(),
    roundDurationSec: settings.timerSec,
    selectedCategoryIds: defaultCategories,
    customCategories,
    answeredQuestionIds: [],
    activeCategoryId: null,
    activeQuestionId: null,
    activeTeamTurn: "team1",
    doublePointsActive: false,
    lastSeenJeemWinner: null,
    seenJeemBaseAwarded: { team1: 0, team2: 0 },
    activeMiniGameId: "SPEED_TRIVIA",
    miniGameRoundIndex: 0,
    drawerPlayerId: null,
    liveDrawingDataUrl: null,
    submissions: {},
    roundSummaryText: "",
  };
}

export function getAllCategories(
  room: RoomState,
  region: EditionRegion = getEditionRegion()
): SeenJeemCategory[] {
  const orderedSeed =
    region === "MA"
      ? [...MOROCCAN_SEEN_JEEM_CATEGORIES, ...SEEN_JEEM_CATEGORIES]
      : [...SEEN_JEEM_CATEGORIES, ...MOROCCAN_SEEN_JEEM_CATEGORIES];
  const overridden = applyQuestionBankOverrides(orderedSeed);
  const existingIds = new Set(overridden.map((c) => c.id));
  const extraRoomCats = (room.customCategories || []).filter(
    (c) => !existingIds.has(c.id)
  );
  return [...overridden, ...extraRoomCats];
}

export function getActiveSeenJeemQuestion(room: RoomState): {
  category: SeenJeemCategory | null;
  question: SeenJeemQuestion | null;
} {
  const allCats = getAllCategories(room);
  for (const cat of allCats) {
    const q = cat.questions.find((item) => item.id === room.activeQuestionId);
    if (q) {
      return { category: cat, question: q };
    }
  }
  return { category: null, question: null };
}

export function gradeCurrentRound(room: RoomState): RoomState {
  const next: RoomState = JSON.parse(JSON.stringify(room));
  next.phase = "REVEAL_AND_SCORE";
  next.updatedAt = Date.now();

  const subs = Object.values(next.submissions);

  // CRITICAL BUG FIX #1: Always resolve each player's CURRENT team from room.players
  // instead of trusting a potentially stale sub.team from the mobile controller.
  for (const sub of subs) {
    const currentRosterPlayer = next.players.find(
      (pl) => pl.id === sub.playerId
    );
    if (currentRosterPlayer) {
      sub.team = currentRosterPlayer.team;
    }
  }

  if (next.majorMode === "SEEN_JEEM") {
    const { question } = getActiveSeenJeemQuestion(next);
    if (!question) return next;

    markQuestionAsPlayed(question.id);

    const multiplier = next.doublePointsActive ? 2 : 1;
    const questionPoints = question.points * multiplier;
    const acceptedList =
      question.acceptedSynonyms && question.acceptedSynonyms.length > 0
        ? Array.from(
            new Set([...question.acceptedSynonyms, ...question.acceptedAnswers])
          )
        : question.acceptedAnswers;

    let team1Correct = false;
    let team2Correct = false;
    let trapTriggered = false;

    for (const sub of subs) {
      const playerObj = next.players.find((pl) => pl.id === sub.playerId);
      const actualTeam: TeamId = playerObj?.team || sub.team;
      sub.team = actualTeam;

      const verdict = evaluateArabicAnswer(
        sub.textAnswer || "",
        acceptedList,
        question.rejectedTraps || [],
        0.82,
        question.trapNote
      );
      sub.graded = true;
      sub.isCorrect = verdict.isCorrect;
      sub.refereeVerdict = verdict;
      sub.pointsAwarded = verdict.isCorrect ? questionPoints : 0;

      if (verdict.isTrap) {
        trapTriggered = true;
      }

      if (verdict.isCorrect) {
        if (actualTeam === "team1") team1Correct = true;
        if (actualTeam === "team2") team2Correct = true;
        if (playerObj) playerObj.score += questionPoints;
      }
    }

    const t1Gain = team1Correct ? questionPoints : 0;
    const t2Gain = team2Correct ? questionPoints : 0;

    next.teams.team1.score += t1Gain;
    next.teams.team2.score += t2Gain;
    next.teamA = {
      name: next.teams.team1.name,
      score: next.teams.team1.score,
    };
    next.teamB = {
      name: next.teams.team2.name,
      score: next.teams.team2.score,
    };
    next.seenJeemBaseAwarded = { team1: t1Gain, team2: t2Gain };

    if (team1Correct && team2Correct) {
      next.lastSeenJeemWinner = "both";
      next.roundSummaryText = `كلا الفريقين أصابا الإجابة الصحيحة (+${questionPoints} نقطة)!`;
      next.activeTeamTurn = next.activeTeamTurn === "team1" ? "team2" : "team1";
    } else if (team1Correct) {
      next.lastSeenJeemWinner = "team1";
      next.roundSummaryText = `${next.teams.team1.name} حصد +${questionPoints} نقطة!`;
      next.activeTeamTurn = "team1";
    } else if (team2Correct) {
      next.lastSeenJeemWinner = "team2";
      next.roundSummaryText = `${next.teams.team2.name} حصد +${questionPoints} نقطة!`;
      next.activeTeamTurn = "team2";
    } else {
      next.lastSeenJeemWinner = "none";
      next.roundSummaryText =
        trapTriggered && question.trapNote
          ? question.trapNote
          : "لم يصل أي فريق للإجابة الصحيحة في هذه الجولة.";
      next.activeTeamTurn = next.activeTeamTurn === "team1" ? "team2" : "team1";
    }

    if (!next.answeredQuestionIds.includes(question.id)) {
      next.answeredQuestionIds.push(question.id);
    }

    return next;
  }

  // MODE B: THE 8 PARTY MINI-GAMES GRADING
  const gameId = next.activeMiniGameId;
  const durationMs = next.roundDurationSec * 1000;
  const activeRegion = next.edition || getEditionRegion();

  if (gameId === "SPEED_TRIVIA") {
    const speedRounds = getRegionalSpeedTriviaRounds(activeRegion);
    const rawRound = speedRounds[next.miniGameRoundIndex % speedRounds.length];
    const round = getShuffledSpeedTriviaRound(
      rawRound,
      next.code,
      next.miniGameRoundIndex
    );
    markQuestionAsPlayed(round.id);

    for (const sub of subs) {
      const isRight = sub.optionIndex === round.correctIndex;
      const speedRatio = Math.max(0, Math.min(1, 1 - sub.elapsedMs / durationMs));
      const pts = isRight ? Math.round(200 + speedRatio * 300) : 0;
      sub.graded = true;
      sub.isCorrect = isRight;
      sub.pointsAwarded = pts;
      awardPointsToPlayerAndTeam(next, sub.playerId, pts, sub.team);
    }
    next.roundSummaryText = `الجواب الصحيح: ${round.options[round.correctIndex]} — ${round.explanation}`;
  } else if (gameId === "QUICK_REFLEX") {
    const round =
      QUICK_REFLEX_ROUNDS[next.miniGameRoundIndex % QUICK_REFLEX_ROUNDS.length];
    markQuestionAsPlayed(round.id);
    for (const sub of subs) {
      const isRight = sub.reflexCellId === round.targetCellId;
      const speedRatio = Math.max(0, Math.min(1, 1 - sub.elapsedMs / durationMs));
      const pts = isRight ? Math.round(250 + speedRatio * 250) : 0;
      sub.graded = true;
      sub.isCorrect = isRight;
      sub.pointsAwarded = pts;
      awardPointsToPlayerAndTeam(next, sub.playerId, pts, sub.team);
    }
    const targetCell = round.grid.find((c) => c.id === round.targetCellId);
    next.roundSummaryText = `الشكل المطلوب كان: ${targetCell?.labelAr || ""}`;
  } else if (gameId === "PRICE_GUESS") {
    const priceRounds = getRegionalPriceGuessRounds(activeRegion);
    const round = priceRounds[next.miniGameRoundIndex % priceRounds.length];
    markQuestionAsPlayed(round.id);
    const targetPrice =
      activeRegion === "MA"
        ? round.actualPriceDh ?? round.actualPriceSar
        : round.actualPriceSar;
    const currencySuffix =
      activeRegion === "MA" ? "درهم مغربي (DH)" : round.currencyLabel;

    const validSubs = subs.filter((s) => typeof s.numericValue === "number");
    validSubs.forEach((s) => {
      s.numericDiff = Math.abs((s.numericValue ?? 0) - targetPrice);
    });
    validSubs.sort((a, b) => (a.numericDiff ?? 999999) - (b.numericDiff ?? 999999));

    validSubs.forEach((sub, idx) => {
      sub.graded = true;
      sub.rank = idx + 1;
      let pts = 100;
      if (idx === 0) pts = 500;
      else if (idx === 1) pts = 350;
      else if (idx === 2) pts = 220;
      if (sub.numericDiff === 0) pts = 600;
      sub.isCorrect = idx === 0 || (sub.numericDiff ?? 99999) <= targetPrice * 0.15;
      sub.pointsAwarded = pts;
      awardPointsToPlayerAndTeam(next, sub.playerId, pts, sub.team);
    });
    next.roundSummaryText = `السعر الحقيقي: ${targetPrice.toLocaleString("en-US")} ${currencySuffix}`;
  } else if (gameId === "WHATS_IN_FRAME") {
    const round =
      WHATS_IN_FRAME_ROUNDS[next.miniGameRoundIndex % WHATS_IN_FRAME_ROUNDS.length];
    markQuestionAsPlayed(round.id);
    for (const sub of subs) {
      const verdict = evaluateArabicAnswer(
        sub.textAnswer || "",
        round.acceptedAnswers,
        round.rejectedTraps,
        0.82,
        round.trapNote
      );
      const speedRatio = Math.max(0, Math.min(1, 1 - sub.elapsedMs / durationMs));
      const pts = verdict.isCorrect ? Math.round(300 + speedRatio * 200) : 0;
      sub.graded = true;
      sub.isCorrect = verdict.isCorrect;
      sub.refereeVerdict = verdict;
      sub.pointsAwarded = pts;
      awardPointsToPlayerAndTeam(next, sub.playerId, pts, sub.team);
    }
    next.roundSummaryText = `في اللقطة: ${round.displayAnswer} — ${round.funFact}`;
  } else if (gameId === "CLOSEST_NUMBER") {
    const closestRounds = getRegionalClosestNumberRounds(activeRegion);
    const round =
      closestRounds[next.miniGameRoundIndex % closestRounds.length];
    markQuestionAsPlayed(round.id);
    const validSubs = subs.filter((s) => typeof s.numericValue === "number");
    validSubs.forEach((s) => {
      s.numericDiff = Math.abs((s.numericValue ?? 0) - round.correctNumber);
    });
    validSubs.sort((a, b) => (a.numericDiff ?? 999999) - (b.numericDiff ?? 999999));

    validSubs.forEach((sub, idx) => {
      sub.graded = true;
      sub.rank = idx + 1;
      let pts = 100;
      if (idx === 0) pts = 500;
      else if (idx === 1) pts = 350;
      else if (idx === 2) pts = 200;
      if (sub.numericDiff === 0) pts = 600;
      sub.isCorrect = idx === 0;
      sub.pointsAwarded = pts;
      awardPointsToPlayerAndTeam(next, sub.playerId, pts, sub.team);
    });
    next.roundSummaryText = `الرقم الصحيح: ${round.correctNumber} ${round.unitLabel} — ${round.funFact}`;
  } else if (gameId === "DRAWING_CHALLENGE") {
    const drawRounds = getRegionalDrawingChallengeRounds(activeRegion);
    const round = drawRounds[next.miniGameRoundIndex % drawRounds.length];
    markQuestionAsPlayed(round.id);
    let someoneGuessedRight = false;
    for (const sub of subs) {
      if (sub.playerId === next.drawerPlayerId) continue;
      const verdict = evaluateArabicAnswer(
        sub.textAnswer || "",
        round.acceptedAnswers,
        [],
        0.8
      );
      const pts = verdict.isCorrect ? round.difficultyPoints : 0;
      sub.graded = true;
      sub.isCorrect = verdict.isCorrect;
      sub.refereeVerdict = verdict;
      sub.pointsAwarded = pts;
      if (verdict.isCorrect) {
        someoneGuessedRight = true;
        awardPointsToPlayerAndTeam(next, sub.playerId, pts, sub.team);
      }
    }
    if (someoneGuessedRight && next.drawerPlayerId) {
      awardPointsToPlayerAndTeam(next, next.drawerPlayerId, 300);
    }
    next.roundSummaryText = `الرسمة السرية كانت: «${round.secretWord}»`;
  } else if (gameId === "MAP_PIN") {
    const round = MAP_PIN_ROUNDS[next.miniGameRoundIndex % MAP_PIN_ROUNDS.length];
    markQuestionAsPlayed(round.id);
    const validSubs = subs.filter(
      (s) => typeof s.pinLat === "number" && typeof s.pinLng === "number"
    );
    validSubs.forEach((sub) => {
      sub.distanceKm = calculateHaversineDistanceKm(
        sub.pinLat!,
        sub.pinLng!,
        round.targetLat,
        round.targetLng
      );
    });
    validSubs.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    validSubs.forEach((sub, idx) => {
      sub.graded = true;
      sub.rank = idx + 1;
      const basePts = scoreMapDistance(sub.distanceKm ?? 9999);
      const closestBonus = idx === 0 ? 150 : 0;
      const totalPts = basePts + closestBonus;
      sub.isCorrect = (sub.distanceKm ?? 9999) <= 1200 || idx === 0;
      sub.pointsAwarded = totalPts;
      awardPointsToPlayerAndTeam(next, sub.playerId, totalPts, sub.team);
    });
    next.roundSummaryText = `الموقع الصحيح: ${round.placeName} — ${round.funFact}`;
  } else if (gameId === "SCENE_DESCRIPTION") {
    const round =
      SCENE_DESCRIPTION_ROUNDS[
        next.miniGameRoundIndex % SCENE_DESCRIPTION_ROUNDS.length
      ];
    markQuestionAsPlayed(round.id);
    for (const sub of subs) {
      const descVerdict = evaluateDescriptionTags(
        sub.textAnswer || "",
        round.tags
      );
      sub.graded = true;
      sub.descriptionVerdict = descVerdict;
      sub.isCorrect = descVerdict.matchedTags.length >= 2;
      sub.pointsAwarded = descVerdict.totalPoints;
      awardPointsToPlayerAndTeam(next, sub.playerId, descVerdict.totalPoints, sub.team);
    }
    next.roundSummaryText = `الوصف النموذجي: ${round.modelDescription}`;
  }

  next.teamA = {
    name: next.teams.team1.name,
    score: next.teams.team1.score,
  };
  next.teamB = {
    name: next.teams.team2.name,
    score: next.teams.team2.score,
  };

  return next;
}

function awardPointsToPlayerAndTeam(
  room: RoomState,
  playerId: string,
  points: number,
  fallbackTeam?: TeamId
) {
  if (points <= 0) return;
  const player = room.players.find((p) => p.id === playerId);
  const actualTeam: TeamId = player?.team || fallbackTeam || "team1";
  if (player) {
    player.score += points;
  }
  room.teams[actualTeam].score += points;
  room.teamA = {
    name: room.teams.team1.name,
    score: room.teams.team1.score,
  };
  room.teamB = {
    name: room.teams.team2.name,
    score: room.teams.team2.score,
  };
}

export function applyHostSeenJeemOverride(
  room: RoomState,
  winner: TeamId | "both" | "none"
): RoomState {
  const next: RoomState = JSON.parse(JSON.stringify(room));
  const { question } = getActiveSeenJeemQuestion(next);
  if (!question) return next;

  next.teams.team1.score -= next.seenJeemBaseAwarded.team1;
  next.teams.team2.score -= next.seenJeemBaseAwarded.team2;

  const multiplier = next.doublePointsActive ? 2 : 1;
  const pts = question.points * multiplier;

  let t1 = 0;
  let t2 = 0;
  if (winner === "team1") {
    t1 = pts;
    next.activeTeamTurn = "team1";
    next.roundSummaryText = `تم احتساب +${pts} نقطة لصالح ${next.teams.team1.name}`;
  } else if (winner === "team2") {
    t2 = pts;
    next.activeTeamTurn = "team2";
    next.roundSummaryText = `تم احتساب +${pts} نقطة لصالح ${next.teams.team2.name}`;
  } else if (winner === "both") {
    t1 = pts;
    t2 = pts;
    next.roundSummaryText = `تم احتساب +${pts} نقطة لكلا الفريقين`;
  } else {
    next.roundSummaryText = "لا نقاط لأي فريق في هذا السؤال";
  }

  next.teams.team1.score += t1;
  next.teams.team2.score += t2;
  next.teamA = {
    name: next.teams.team1.name,
    score: next.teams.team1.score,
  };
  next.teamB = {
    name: next.teams.team2.name,
    score: next.teams.team2.score,
  };
  next.seenJeemBaseAwarded = { team1: t1, team2: t2 };
  next.lastSeenJeemWinner = winner;
  next.updatedAt = Date.now();
  return next;
}

// ============================================================================
// REALTIME WRAPPERS (DELEGATING TO lib/realtime.ts & lib/db.ts)
// ============================================================================

export function loadRoomFromLocal(code: string): RoomState | null {
  return loadCachedRoom(code);
}

export function saveRoomToLocalAndBroadcast(
  room: RoomState,
  joinedPlayer?: Player
): void {
  broadcastRoomState(room, joinedPlayer);
}

export function subscribeToRoomUpdates(
  code: string,
  onUpdate: (room: RoomState) => void,
  onPlayerJoined?: (player: Player) => void
): () => void {
  return subscribeToRoomRealtime(code, {
    onRoomUpdate: onUpdate,
    onPlayerJoined,
  });
}

// ============================================================================
// SUBSCRIPTION & PROFILE ADAPTERS
// ============================================================================

export function profileToSubscriptionState(
  profile: UserProfileRecord
): UserSubscriptionState {
  const customCategories = loadLocalCustomPacks();
  const activeVoucher = getActiveLicense();

  if (activeVoucher) {
    const isPro =
      activeVoucher.prefix === "PROMOROCCO" ||
      activeVoucher.prefix === "CAFEMODE";
    return {
      tier: isPro ? "PRO_HOST" : "PARTY_PASS",
      freeSessionsRemaining: profile.free_sessions_remaining,
      partyPassExpiresAt: activeVoucher.expiresAt,
      proSubscriptionActive: isPro,
      customCategories,
      profileName: profile.name,
      profileEmail: profile.email,
    };
  }

  const tierMap: Record<UserProfileRecord["tier"], SubscriptionTierId> = {
    free: "FREE_TRIAL",
    party_pass: "PARTY_PASS",
    pro: "PRO_HOST",
  };
  return {
    tier: tierMap[profile.tier] || "FREE_TRIAL",
    freeSessionsRemaining: profile.free_sessions_remaining,
    partyPassExpiresAt: profile.pass_expires_at
      ? new Date(profile.pass_expires_at).getTime()
      : null,
    proSubscriptionActive: profile.tier === "pro",
    customCategories,
    profileName: profile.name,
    profileEmail: profile.email,
  };
}

export function loadUserSubscription(): UserSubscriptionState {
  const profile = getCachedProfile();
  return profileToSubscriptionState(profile);
}

export function saveUserSubscription(sub: UserSubscriptionState): void {
  const current = getCachedProfile();
  const dbTier: UserProfileRecord["tier"] = sub.proSubscriptionActive
    ? "pro"
    : sub.tier === "PARTY_PASS"
    ? "party_pass"
    : "free";

  const nextProfile: UserProfileRecord = {
    ...current,
    tier: dbTier,
    free_sessions_remaining: sub.freeSessionsRemaining,
    pass_expires_at: sub.partyPassExpiresAt
      ? new Date(sub.partyPassExpiresAt).toISOString()
      : null,
  };
  setCachedProfile(nextProfile);
  updateProfileRecord(nextProfile).catch(() => {});
}

export function canHostCreateSession(sub: UserSubscriptionState): {
  allowed: boolean;
  reasonAr: string;
} {
  const activeVoucher = getActiveLicense();
  if (activeVoucher) {
    return { allowed: true, reasonAr: activeVoucher.labelAr };
  }
  if (sub.proSubscriptionActive || sub.tier === "PRO_HOST") {
    return { allowed: true, reasonAr: "باقة المضيف المحترف نشطة" };
  }
  if (
    sub.tier === "PARTY_PASS" &&
    sub.partyPassExpiresAt &&
    Date.now() < sub.partyPassExpiresAt
  ) {
    return { allowed: true, reasonAr: "تذكرة السهرة نشطة" };
  }
  if (sub.freeSessionsRemaining > 0) {
    return { allowed: true, reasonAr: "جلستك المجانية جاهزة" };
  }
  return {
    allowed: false,
    reasonAr: "انتهت جلستك المجانية — فعّل تذكرة السهرة أو باقة المحترفين للمتابعة.",
  };
}

export function loadSavedPlayerIdentity(): {
  id: string;
  name: string;
  avatar: AvatarCharacterId | string;
  voiceId: VoicePackId | string;
  team: TeamId;
} | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PLAYER_IDENTITY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePlayerIdentity(identity: {
  id: string;
  name: string;
  avatar: AvatarCharacterId | string;
  voiceId: VoicePackId | string;
  team: TeamId;
}): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAYER_IDENTITY_KEY, JSON.stringify(identity));
}

export { MINI_GAMES_META };
