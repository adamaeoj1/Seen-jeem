import {
  CLOSEST_NUMBER_ROUNDS,
  DRAWING_CHALLENGE_ROUNDS,
  MAP_PIN_ROUNDS,
  MINI_GAMES_META,
  MiniGameId,
  PRICE_GUESS_ROUNDS,
  QUICK_REFLEX_ROUNDS,
  SCENE_DESCRIPTION_ROUNDS,
  SEEN_JEEM_CATEGORIES,
  SeenJeemCategory,
  SeenJeemQuestion,
  SPEED_TRIVIA_ROUNDS,
  WHATS_IN_FRAME_ROUNDS,
} from "@/data/seedQuestions";
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

export function createInitialRoomState(
  code: string,
  hostTier: SubscriptionTierId = "FREE_TRIAL",
  customCategories: SeenJeemCategory[] = [],
  customSettings?: Partial<RoomSettings>,
  chosenCategories?: string[]
): RoomState {
  const cleanCode = code.toUpperCase().trim();
  const defaultCategories =
    chosenCategories && chosenCategories.length > 0
      ? chosenCategories.slice(0, 6)
      : SEEN_JEEM_CATEGORIES.slice(0, 6).map((c) => c.id);

  const settings: RoomSettings = {
    sessionMode: customSettings?.sessionMode || "SEEN_JEEM",
    team1Name: customSettings?.team1Name?.trim() || "فريق الصقور",
    team1Color: customSettings?.team1Color || "#3B66B4",
    team2Name: customSettings?.team2Name?.trim() || "فريق النمور",
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
    players: [
      {
        id: "p-falcon-cap",
        name: "سلطان",
        avatar: "abu_sultan",
        voiceId: "hype_horn",
        team: "team1",
        isCaptain: true,
        isOnline: true,
        score: 0,
        connectedAt: Date.now() - 30000,
      },
      {
        id: "p-tiger-cap",
        name: "نورة",
        avatar: "nourah_pop",
        voiceId: "royal_fanfare",
        team: "team2",
        isCaptain: true,
        isOnline: true,
        score: 0,
        connectedAt: Date.now() - 25000,
      },
    ],
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
    drawerPlayerId: "p-falcon-cap",
    liveDrawingDataUrl: null,
    submissions: {},
    roundSummaryText: "",
  };
}

export function getAllCategories(room: RoomState): SeenJeemCategory[] {
  return [...SEEN_JEEM_CATEGORIES, ...(room.customCategories || [])];
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

  if (next.majorMode === "SEEN_JEEM") {
    const { question } = getActiveSeenJeemQuestion(next);
    if (!question) return next;

    const multiplier = next.doublePointsActive ? 2 : 1;
    const questionPoints = question.points * multiplier;

    let team1Correct = false;
    let team2Correct = false;

    for (const sub of subs) {
      const verdict = evaluateArabicAnswer(
        sub.textAnswer || "",
        question.acceptedAnswers,
        question.rejectedTraps || [],
        0.82
      );
      sub.graded = true;
      sub.isCorrect = verdict.isCorrect;
      sub.refereeVerdict = verdict;
      sub.pointsAwarded = verdict.isCorrect ? questionPoints : 0;

      if (verdict.isCorrect) {
        if (sub.team === "team1") team1Correct = true;
        if (sub.team === "team2") team2Correct = true;
        const p = next.players.find((pl) => pl.id === sub.playerId);
        if (p) p.score += questionPoints;
      }
    }

    const t1Gain = team1Correct ? questionPoints : 0;
    const t2Gain = team2Correct ? questionPoints : 0;

    next.teams.team1.score += t1Gain;
    next.teams.team2.score += t2Gain;
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
      next.roundSummaryText = "لم يصل أي فريق للإجابة الصحيحة في هذه الجولة.";
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

  if (gameId === "SPEED_TRIVIA") {
    const round =
      SPEED_TRIVIA_ROUNDS[next.miniGameRoundIndex % SPEED_TRIVIA_ROUNDS.length];
    for (const sub of subs) {
      const isRight = sub.optionIndex === round.correctIndex;
      const speedRatio = Math.max(0, Math.min(1, 1 - sub.elapsedMs / durationMs));
      const pts = isRight ? Math.round(200 + speedRatio * 300) : 0;
      sub.graded = true;
      sub.isCorrect = isRight;
      sub.pointsAwarded = pts;
      awardPointsToPlayerAndTeam(next, sub.playerId, pts);
    }
    next.roundSummaryText = `الجواب الصحيح: ${round.options[round.correctIndex]} — ${round.explanation}`;
  } else if (gameId === "QUICK_REFLEX") {
    const round =
      QUICK_REFLEX_ROUNDS[next.miniGameRoundIndex % QUICK_REFLEX_ROUNDS.length];
    for (const sub of subs) {
      const isRight = sub.reflexCellId === round.targetCellId;
      const speedRatio = Math.max(0, Math.min(1, 1 - sub.elapsedMs / durationMs));
      const pts = isRight ? Math.round(250 + speedRatio * 250) : 0;
      sub.graded = true;
      sub.isCorrect = isRight;
      sub.pointsAwarded = pts;
      awardPointsToPlayerAndTeam(next, sub.playerId, pts);
    }
    const targetCell = round.grid.find((c) => c.id === round.targetCellId);
    next.roundSummaryText = `الشكل المطلوب كان: ${targetCell?.labelAr || ""}`;
  } else if (gameId === "PRICE_GUESS") {
    const round =
      PRICE_GUESS_ROUNDS[next.miniGameRoundIndex % PRICE_GUESS_ROUNDS.length];
    const validSubs = subs.filter((s) => typeof s.numericValue === "number");
    validSubs.forEach((s) => {
      s.numericDiff = Math.abs((s.numericValue ?? 0) - round.actualPriceSar);
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
      sub.isCorrect = idx === 0 || (sub.numericDiff ?? 99999) <= round.actualPriceSar * 0.15;
      sub.pointsAwarded = pts;
      awardPointsToPlayerAndTeam(next, sub.playerId, pts);
    });
    next.roundSummaryText = `السعر الحقيقي: ${round.actualPriceSar.toLocaleString("en-US")} ${round.currencyLabel}`;
  } else if (gameId === "WHATS_IN_FRAME") {
    const round =
      WHATS_IN_FRAME_ROUNDS[next.miniGameRoundIndex % WHATS_IN_FRAME_ROUNDS.length];
    for (const sub of subs) {
      const verdict = evaluateArabicAnswer(
        sub.textAnswer || "",
        round.acceptedAnswers,
        round.rejectedTraps,
        0.82
      );
      const speedRatio = Math.max(0, Math.min(1, 1 - sub.elapsedMs / durationMs));
      const pts = verdict.isCorrect ? Math.round(300 + speedRatio * 200) : 0;
      sub.graded = true;
      sub.isCorrect = verdict.isCorrect;
      sub.refereeVerdict = verdict;
      sub.pointsAwarded = pts;
      awardPointsToPlayerAndTeam(next, sub.playerId, pts);
    }
    next.roundSummaryText = `في اللقطة: ${round.displayAnswer} — ${round.funFact}`;
  } else if (gameId === "CLOSEST_NUMBER") {
    const round =
      CLOSEST_NUMBER_ROUNDS[next.miniGameRoundIndex % CLOSEST_NUMBER_ROUNDS.length];
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
      awardPointsToPlayerAndTeam(next, sub.playerId, pts);
    });
    next.roundSummaryText = `الرقم الصحيح: ${round.correctNumber} ${round.unitLabel} — ${round.funFact}`;
  } else if (gameId === "DRAWING_CHALLENGE") {
    const round =
      DRAWING_CHALLENGE_ROUNDS[
        next.miniGameRoundIndex % DRAWING_CHALLENGE_ROUNDS.length
      ];
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
        awardPointsToPlayerAndTeam(next, sub.playerId, pts);
      }
    }
    if (someoneGuessedRight && next.drawerPlayerId) {
      awardPointsToPlayerAndTeam(next, next.drawerPlayerId, 300);
    }
    next.roundSummaryText = `الرسمة السرية كانت: «${round.secretWord}»`;
  } else if (gameId === "MAP_PIN") {
    const round = MAP_PIN_ROUNDS[next.miniGameRoundIndex % MAP_PIN_ROUNDS.length];
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
      awardPointsToPlayerAndTeam(next, sub.playerId, totalPts);
    });
    next.roundSummaryText = `الموقع الصحيح: ${round.placeName} — ${round.funFact}`;
  } else if (gameId === "SCENE_DESCRIPTION") {
    const round =
      SCENE_DESCRIPTION_ROUNDS[
        next.miniGameRoundIndex % SCENE_DESCRIPTION_ROUNDS.length
      ];
    for (const sub of subs) {
      const descVerdict = evaluateDescriptionTags(
        sub.textAnswer || "",
        round.tags
      );
      sub.graded = true;
      sub.descriptionVerdict = descVerdict;
      sub.isCorrect = descVerdict.matchedTags.length >= 2;
      sub.pointsAwarded = descVerdict.totalPoints;
      awardPointsToPlayerAndTeam(next, sub.playerId, descVerdict.totalPoints);
    }
    next.roundSummaryText = `الوصف النموذجي: ${round.modelDescription}`;
  }

  return next;
}

function awardPointsToPlayerAndTeam(
  room: RoomState,
  playerId: string,
  points: number
) {
  if (points <= 0) return;
  const player = room.players.find((p) => p.id === playerId);
  if (player) {
    player.score += points;
    room.teams[player.team].score += points;
  }
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
