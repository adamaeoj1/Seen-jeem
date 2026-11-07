import {
  CLOSEST_NUMBER_ROUNDS,
  ClosestNumberRound,
  DRAWING_CHALLENGE_ROUNDS,
  DrawingChallengeRound,
  MAP_PIN_ROUNDS,
  MapPinRound,
  MiniGameId,
  PRICE_GUESS_ROUNDS,
  PriceGuessRound,
  QUICK_REFLEX_ROUNDS,
  QuickReflexRound,
  SCENE_DESCRIPTION_ROUNDS,
  SceneDescriptionRound,
  SEEN_JEEM_CATEGORIES,
  SeenJeemCategory,
  SeenJeemQuestion,
  SPEED_TRIVIA_ROUNDS,
  SpeedTriviaRound,
  WHATS_IN_FRAME_ROUNDS,
  WhatsInFrameRound,
} from "@/data/seedQuestions";
import {
  MOROCCAN_CLOSEST_NUMBER_ROUNDS,
  MOROCCAN_DRAWING_CHALLENGE_ROUNDS,
  MOROCCAN_PRICE_GUESS_ROUNDS,
  MOROCCAN_SEEN_JEEM_CATEGORIES,
  MOROCCAN_SPEED_TRIVIA_ROUNDS,
} from "@/data/moroccanSeedQuestions";
import {
  ENGLISH_CLOSEST_NUMBER_ROUNDS,
  ENGLISH_DRAWING_CHALLENGE_ROUNDS,
  ENGLISH_MAP_PIN_ROUNDS,
  ENGLISH_PRICE_GUESS_ROUNDS,
  ENGLISH_SCENE_DESCRIPTION_ROUNDS,
  ENGLISH_SEEN_JEEM_CATEGORIES,
  ENGLISH_SPEED_TRIVIA_ROUNDS,
  ENGLISH_WHATS_IN_FRAME_ROUNDS,
} from "@/data/englishSeedQuestions";
import { EditionRegion } from "@/lib/editionManager";

export const PLAYED_QUESTION_IDS_KEY = "qadha_played_question_ids_v1";
export const CUSTOM_QUESTION_BANK_KEY = "qadha_custom_question_bank_v1";
export const QUESTION_BANK_UPDATED_EVENT = "qadha_question_bank_updated";

export interface QuestionOverridePatch {
  question?: string;
  displayAnswer?: string;
  acceptedAnswers?: string[];
  acceptedSynonyms?: string[];
  rejectedTraps?: string[];
  hint?: string;
  funFact?: string;
  points?: 200 | 400 | 600;
  imageUrl?: string;
}

export interface CustomCategoryRecord extends SeenJeemCategory {
  edition?: EditionRegion;
}

export interface CustomQuestionBankState {
  version: string;
  updatedAt: number;
  questionEdits: Record<string, QuestionOverridePatch>;
  deletedQuestionIds: string[];
  addedQuestionsByCategory: Record<string, SeenJeemQuestion[]>;
  customCategories: CustomCategoryRecord[];
  customSpeedTrivia: SpeedTriviaRound[];
  customPriceGuess: PriceGuessRound[];
  customClosestNumber: ClosestNumberRound[];
  customDrawingPrompts: DrawingChallengeRound[];
}

const DEFAULT_CUSTOM_BANK_STATE: CustomQuestionBankState = {
  version: "2026.11",
  updatedAt: 0,
  questionEdits: {},
  deletedQuestionIds: [],
  addedQuestionsByCategory: {},
  customCategories: [],
  customSpeedTrivia: [],
  customPriceGuess: [],
  customClosestNumber: [],
  customDrawingPrompts: [],
};

// ============================================================================
// 1. CRYPTOGRAPHIC & SEEDED FISHER-YATES SHUFFLE ENGINE
// ============================================================================

function getRandomInt(maxExclusive: number, seededRng?: () => number): number {
  if (maxExclusive <= 1) return 0;
  if (seededRng) {
    return Math.floor(seededRng() * maxExclusive);
  }
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const arr = new Uint32Array(1);
    globalThis.crypto.getRandomValues(arr);
    return arr[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function createSeededRng(seed: number): () => number {
  let a = (seed >>> 0) || 0x6d2b79f5;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function fisherYatesShuffle<T>(
  items: readonly T[],
  seed?: number
): T[] {
  const copy = [...items];
  const rng = typeof seed === "number" ? createSeededRng(seed) : undefined;
  for (let i = copy.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1, rng);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

// ============================================================================
// 2. ANTI-REPETITION SEEN-HISTORY TRACKING (`qadha_played_question_ids_v1`)
// ============================================================================

export function getPlayedQuestionIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = window.localStorage.getItem(PLAYED_QUESTION_IDS_KEY);
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((x) => typeof x === "string"));
    }
    return new Set();
  } catch {
    return new Set();
  }
}

export const loadPlayedQuestionIds = getPlayedQuestionIds;

export function resetSeenQuestionsHistory(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PLAYED_QUESTION_IDS_KEY);
  } catch {
    // Ignore errors
  }
}

export function savePlayedQuestionIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PLAYED_QUESTION_IDS_KEY,
      JSON.stringify(Array.from(ids))
    );
  } catch {
    // Ignore quota errors
  }
}

export function markQuestionAsPlayed(questionId: string): void {
  if (!questionId || typeof window === "undefined") return;
  const set = getPlayedQuestionIds();
  set.add(questionId);
  savePlayedQuestionIds(set);
}

export function markQuestionsAsPlayed(questionIds: string[]): void {
  if (!questionIds.length || typeof window === "undefined") return;
  const set = getPlayedQuestionIds();
  for (const id of questionIds) {
    if (id) set.add(id);
  }
  savePlayedQuestionIds(set);
}

export function clearPlayedQuestionIdsForPool(poolIds: string[]): void {
  if (typeof window === "undefined") return;
  const set = getPlayedQuestionIds();
  for (const id of poolIds) {
    set.delete(id);
  }
  savePlayedQuestionIds(set);
}

/**
 * Unseen-First Fisher-Yates Selector (`selectRandomizedQuestions`):
 * Prioritizes unseen questions (`!playedIds.has(q.id)`).
 * If unseen questions are fewer than `count`, resets the seen history for this pool
 * and fills the remainder from the reshuffled seen questions so a round NEVER starves.
 */
export function selectRandomizedQuestions<T extends { id: string }>(
  pool: readonly T[],
  count: number,
  markAsPlayed = false
): T[] {
  if (pool.length === 0 || count <= 0) return [];
  const playedIds = getPlayedQuestionIds();

  const unseen = pool.filter((item) => !playedIds.has(item.id));
  const seen = pool.filter((item) => playedIds.has(item.id));

  let selected: T[] = [];

  if (unseen.length >= count) {
    selected = fisherYatesShuffle(unseen).slice(0, count);
  } else {
    // All or most questions in this category/tier have been seen -> auto-reset seen history for this pool
    clearPlayedQuestionIdsForPool(pool.map((item) => item.id));
    const shuffledUnseen = fisherYatesShuffle(unseen);
    const neededFromSeen = count - shuffledUnseen.length;
    const shuffledSeen = fisherYatesShuffle(seen).slice(0, neededFromSeen);
    selected = fisherYatesShuffle([...shuffledUnseen, ...shuffledSeen]);
  }

  if (markAsPlayed && selected.length > 0) {
    markQuestionsAsPlayed(selected.map((q) => q.id));
  }

  return selected;
}

/**
 * Selects a randomized 6-question board set (two 200, two 400, two 600) for a category,
 * prioritizing unseen questions in each point tier (`200 | 400 | 600`) and assigning
 * clean `slotIndex` 0..5.
 */
export function selectRandomizedCategoryQuestions(
  questions: readonly SeenJeemQuestion[],
  markAsPlayed = false,
  excludeIds: string[] = []
): SeenJeemQuestion[] {
  const excludedSet = new Set(excludeIds);
  const available = questions.filter((q) => !excludedSet.has(q.id));
  const sourcePool = available.length >= 6 ? available : questions;

  const tiers: Array<200 | 400 | 600> = [200, 400, 600];
  const result: SeenJeemQuestion[] = [];

  tiers.forEach((pts, tierIdx) => {
    const tierPool = sourcePool.filter((q) => q.points === pts);
    const chosen = selectRandomizedQuestions(tierPool, 2, markAsPlayed);
    chosen.forEach((q, idxWithinTier) => {
      result.push({
        ...q,
        points: pts,
        slotIndex: tierIdx * 2 + idxWithinTier,
      });
    });
  });

  return result;
}

/**
 * Randomizes the order of the 4 multiple-choice options in `أسئلة السرعة` (Speed Trivia)
 * while keeping `correctIndex` accurately mapped to the correct answer!
 * Uses a deterministic seed derived from `(roomSeed + round.id)` so Host TV and Mobile
 * Player Controller always render the exact same shuffled option order.
 */
export function getShuffledSpeedTriviaRound(
  round: SpeedTriviaRound,
  roomSeedOrCode: number | string = 2026,
  roundIndex = 0
): SpeedTriviaRound {
  const correctText = round.options[round.correctIndex] ?? round.options[0];
  const seedKey = `${roomSeedOrCode}::${roundIndex}::${round.id}`;
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash ^= seedKey.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const indexed = round.options.map((opt, idx) => ({ opt, idx }));
  const shuffled = fisherYatesShuffle(indexed, hash);
  const newOptions = shuffled.map((item) => item.opt) as [
    string,
    string,
    string,
    string
  ];
  const newCorrectIndex = Math.max(
    0,
    newOptions.findIndex((opt) => opt === correctText)
  );

  return {
    ...round,
    options: newOptions,
    correctIndex: newCorrectIndex,
  };
}

/**
 * Picks a randomized unseen round index for any of the 8 mini-games.
 */
export function pickRandomizedMiniGameRoundIndex<T extends { id: string }>(
  rounds: readonly T[],
  excludeIndex?: number
): number {
  if (rounds.length <= 1) return 0;
  const playedIds = getPlayedQuestionIds();

  const candidates = rounds
    .map((r, idx) => ({ id: r.id, idx }))
    .filter((item) => item.idx !== excludeIndex);

  const unseen = candidates.filter((item) => !playedIds.has(item.id));
  if (unseen.length > 0) {
    const picked = fisherYatesShuffle(unseen)[0];
    markQuestionAsPlayed(picked.id);
    return picked.idx;
  }

  // Reset seen history for this mini-game pool when all rounds have been played
  clearPlayedQuestionIdsForPool(rounds.map((r) => r.id));
  const reshuffled = fisherYatesShuffle(
    candidates.length > 0 ? candidates : rounds.map((r, idx) => ({ id: r.id, idx }))
  );
  const chosen = reshuffled[0];
  markQuestionAsPlayed(chosen.id);
  return chosen.idx;
}

// ============================================================================
// 3. PERSISTENT QUESTION BANK STUDIO STORAGE LAYER (`qadha_custom_question_bank_v1`)
// ============================================================================

export function loadCustomQuestionBank(): CustomQuestionBankState {
  if (typeof window === "undefined") return DEFAULT_CUSTOM_BANK_STATE;
  const raw = window.localStorage.getItem(CUSTOM_QUESTION_BANK_KEY);
  if (!raw) return DEFAULT_CUSTOM_BANK_STATE;
  try {
    const parsed = JSON.parse(raw) as Partial<CustomQuestionBankState>;
    return {
      version: parsed.version || "2026.11",
      updatedAt: parsed.updatedAt || Date.now(),
      questionEdits: parsed.questionEdits || {},
      deletedQuestionIds: Array.isArray(parsed.deletedQuestionIds)
        ? parsed.deletedQuestionIds
        : [],
      addedQuestionsByCategory: parsed.addedQuestionsByCategory || {},
      customCategories: Array.isArray(parsed.customCategories)
        ? parsed.customCategories
        : [],
      customSpeedTrivia: Array.isArray(parsed.customSpeedTrivia)
        ? parsed.customSpeedTrivia
        : [],
      customPriceGuess: Array.isArray(parsed.customPriceGuess)
        ? parsed.customPriceGuess
        : [],
      customClosestNumber: Array.isArray(parsed.customClosestNumber)
        ? parsed.customClosestNumber
        : [],
      customDrawingPrompts: Array.isArray(parsed.customDrawingPrompts)
        ? parsed.customDrawingPrompts
        : [],
    };
  } catch {
    return DEFAULT_CUSTOM_BANK_STATE;
  }
}

export function saveCustomQuestionBank(state: CustomQuestionBankState): void {
  if (typeof window === "undefined") return;
  const next: CustomQuestionBankState = {
    ...state,
    updatedAt: Date.now(),
  };
  window.localStorage.setItem(CUSTOM_QUESTION_BANK_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(QUESTION_BANK_UPDATED_EVENT));
}

export function saveQuestionInlineEdit(
  questionId: string,
  patch: QuestionOverridePatch
): CustomQuestionBankState {
  const current = loadCustomQuestionBank();
  const existingPatch = current.questionEdits[questionId] || {};
  const nextState: CustomQuestionBankState = {
    ...current,
    questionEdits: {
      ...current.questionEdits,
      [questionId]: {
        ...existingPatch,
        ...patch,
      },
    },
  };
  saveCustomQuestionBank(nextState);
  return nextState;
}

export function deleteOrHideQuestion(questionId: string): CustomQuestionBankState {
  const current = loadCustomQuestionBank();
  const nextDeleted = Array.from(
    new Set([...current.deletedQuestionIds, questionId])
  );
  const nextAdded: Record<string, SeenJeemQuestion[]> = {};
  for (const [catId, list] of Object.entries(current.addedQuestionsByCategory)) {
    nextAdded[catId] = list.filter((q) => q.id !== questionId);
  }
  const nextCustomCats = current.customCategories.map((cat) => ({
    ...cat,
    questions: cat.questions.filter((q) => q.id !== questionId),
  }));

  const nextState: CustomQuestionBankState = {
    ...current,
    deletedQuestionIds: nextDeleted,
    addedQuestionsByCategory: nextAdded,
    customCategories: nextCustomCats,
  };
  saveCustomQuestionBank(nextState);
  return nextState;
}

export function addQuestionToCategory(
  categoryId: string,
  newQuestion: Omit<SeenJeemQuestion, "id" | "categoryId" | "slotIndex"> & {
    id?: string;
  }
): SeenJeemQuestion {
  const current = loadCustomQuestionBank();
  const created: SeenJeemQuestion = {
    id:
      newQuestion.id ||
      `custom-q-${categoryId}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,
    categoryId,
    points: newQuestion.points,
    slotIndex:
      newQuestion.points === 200 ? 0 : newQuestion.points === 400 ? 2 : 4,
    question: newQuestion.question,
    hint: newQuestion.hint,
    displayAnswer: newQuestion.displayAnswer,
    acceptedAnswers:
      newQuestion.acceptedAnswers.length > 0
        ? newQuestion.acceptedAnswers
        : [newQuestion.displayAnswer],
    acceptedSynonyms:
      newQuestion.acceptedSynonyms && newQuestion.acceptedSynonyms.length > 0
        ? newQuestion.acceptedSynonyms
        : newQuestion.acceptedAnswers,
    rejectedTraps: newQuestion.rejectedTraps || [],
    trapNote: newQuestion.trapNote,
    funFact: newQuestion.funFact || "سؤال مخصص من استوديو قَدْهَا؟",
    imageUrl: newQuestion.imageUrl,
  };

  // Check if it belongs to a custom category
  const customCatIdx = current.customCategories.findIndex(
    (c) => c.id === categoryId
  );
  if (customCatIdx >= 0) {
    const updatedCats = [...current.customCategories];
    updatedCats[customCatIdx] = {
      ...updatedCats[customCatIdx],
      questions: [...updatedCats[customCatIdx].questions, created],
    };
    saveCustomQuestionBank({
      ...current,
      customCategories: updatedCats,
    });
    return created;
  }

  const prevList = current.addedQuestionsByCategory[categoryId] || [];
  saveCustomQuestionBank({
    ...current,
    addedQuestionsByCategory: {
      ...current.addedQuestionsByCategory,
      [categoryId]: [...prevList, created],
    },
  });
  return created;
}

export function addCustomStudioCategory(
  category: CustomCategoryRecord
): CustomQuestionBankState {
  const current = loadCustomQuestionBank();
  const filtered = current.customCategories.filter((c) => c.id !== category.id);
  const next: CustomQuestionBankState = {
    ...current,
    customCategories: [...filtered, category],
  };
  saveCustomQuestionBank(next);
  return next;
}

export function addCustomStudioMiniGameQuestion(input: {
  miniGameId: MiniGameId;
  edition?: EditionRegion;
  question: string;
  answer: string;
  acceptedSynonyms?: string[];
  options?: string[];
  correctIndex?: number;
  numericValue?: number;
  unitLabel?: string;
  hint?: string;
}): CustomQuestionBankState {
  const current = loadCustomQuestionBank();
  const id = `custom-mg-${input.miniGameId.toLowerCase()}-${Date.now()}`;

  if (input.miniGameId === "SPEED_TRIVIA") {
    const rawOpts = input.options && input.options.length >= 4
      ? input.options.slice(0, 4)
      : [input.answer, "خيار ٢", "خيار ٣", "خيار ٤"];
    const item: SpeedTriviaRound = {
      id,
      question: input.question,
      options: [rawOpts[0], rawOpts[1], rawOpts[2], rawOpts[3]],
      correctIndex: input.correctIndex ?? 0,
      explanation: input.hint || "سؤال مخصص من استوديو قَدْهَا؟",
    };
    const next: CustomQuestionBankState = {
      ...current,
      customSpeedTrivia: [item, ...current.customSpeedTrivia],
    };
    saveCustomQuestionBank(next);
    return next;
  }

  if (input.miniGameId === "PRICE_GUESS") {
    const price = input.numericValue || 1000;
    const item: PriceGuessRound = {
      id,
      productName: input.question,
      brand: input.answer || "السوق المغربي",
      categoryBadge: "كم السعر؟ • استوديو قَدْهَا؟",
      specs: input.hint || "منتج مخصص من استوديو قَدْهَا؟",
      actualPriceSar: price,
      actualPriceDh: price,
      currencyLabel:
        input.edition === "MA" ? "درهم مغربي (DH)" : "دولار ($)",
      illustrationType: "iphone_16_pro",
      funFact: input.hint || "سعر مخصص من استوديو قَدْهَا؟",
    };
    const next: CustomQuestionBankState = {
      ...current,
      customPriceGuess: [item, ...current.customPriceGuess],
    };
    saveCustomQuestionBank(next);
    return next;
  }

  if (input.miniGameId === "CLOSEST_NUMBER") {
    const item: ClosestNumberRound = {
      id,
      question: input.question,
      unitLabel: input.unitLabel || "رقم",
      correctNumber: input.numericValue || 100,
      hintRange: input.hint || "تخمين رقمي",
      funFact: "سؤال رقمي مخصص من استوديو قَدْهَا؟",
    };
    const next: CustomQuestionBankState = {
      ...current,
      customClosestNumber: [item, ...current.customClosestNumber],
    };
    saveCustomQuestionBank(next);
    return next;
  }

  const syns =
    input.acceptedSynonyms && input.acceptedSynonyms.length > 0
      ? input.acceptedSynonyms
      : [input.answer || input.question];
  const drawItem: DrawingChallengeRound = {
    id,
    secretWord: input.question,
    categoryHint: input.hint || "تحدي الرسم • قَدْهَا؟",
    acceptedAnswers: syns,
    difficultyPoints: 400,
  };
  const next: CustomQuestionBankState = {
    ...current,
    customDrawingPrompts: [drawItem, ...current.customDrawingPrompts],
  };
  saveCustomQuestionBank(next);
  return next;
}

export function resetQuestionBankOverrides(): CustomQuestionBankState {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CUSTOM_QUESTION_BANK_KEY);
    window.localStorage.removeItem(PLAYED_QUESTION_IDS_KEY);
    window.dispatchEvent(new CustomEvent(QUESTION_BANK_UPDATED_EVENT));
  }
  return DEFAULT_CUSTOM_BANK_STATE;
}

const CATEGORY_ID_ALIASES: Record<string, string> = {
  "cat-general-science": "cat-ma-science-culture",
  "cat-history-civ": "cat-ma-history-civ",
};

/**
 * Merges all inline edits, deletions, added questions, and custom categories
 * from `qadha_custom_question_bank_v1` onto a category list.
 */
export function applyQuestionBankOverrides(
  baseCategories: readonly SeenJeemCategory[],
  region?: EditionRegion
): SeenJeemCategory[] {
  const bank = loadCustomQuestionBank();
  const deletedSet = new Set(bank.deletedQuestionIds);

  const mergedBase = baseCategories.map((cat) => {
    const addedDirect = bank.addedQuestionsByCategory[cat.id] || [];
    const aliasIds = Object.entries(CATEGORY_ID_ALIASES)
      .filter(([, targetId]) => targetId === cat.id)
      .map(([aliasId]) => aliasId);
    const addedViaAlias = aliasIds.flatMap(
      (alias) => bank.addedQuestionsByCategory[alias] || []
    );

    const rawQuestions = [...cat.questions, ...addedDirect, ...addedViaAlias];
    const seenIds = new Set<string>();
    const processedQuestions: SeenJeemQuestion[] = [];

    for (const q of rawQuestions) {
      if (deletedSet.has(q.id) || seenIds.has(q.id)) continue;
      seenIds.add(q.id);
      const patch = bank.questionEdits[q.id];
      if (!patch) {
        processedQuestions.push(q);
      } else {
        const nextSynonyms =
          patch.acceptedSynonyms ??
          patch.acceptedAnswers ??
          q.acceptedSynonyms ??
          q.acceptedAnswers;
        const nextDisplay = patch.displayAnswer ?? q.displayAnswer;
        const mergedAccepted = Array.from(
          new Set([nextDisplay, ...(nextSynonyms || [])].filter(Boolean))
        );
        processedQuestions.push({
          ...q,
          question: patch.question ?? q.question,
          displayAnswer: nextDisplay,
          acceptedAnswers: mergedAccepted,
          acceptedSynonyms: mergedAccepted,
          rejectedTraps: patch.rejectedTraps ?? q.rejectedTraps,
          hint: patch.hint !== undefined ? patch.hint : q.hint,
          funFact: patch.funFact ?? q.funFact,
          points: patch.points ?? q.points,
          imageUrl: patch.imageUrl !== undefined ? patch.imageUrl : q.imageUrl,
        });
      }
    }

    return {
      ...cat,
      questions: processedQuestions.length > 0 ? processedQuestions : cat.questions,
    };
  });

  const matchingCustomCats = bank.customCategories
    .filter((c) => !region || !c.edition || c.edition === region)
    .map((cat) => ({
      ...cat,
      questions: cat.questions
        .filter((q) => !deletedSet.has(q.id))
        .map((q) => {
          const patch = bank.questionEdits[q.id];
          if (!patch) return q;
          const nextDisplay = patch.displayAnswer ?? q.displayAnswer;
          const nextSynonyms =
            patch.acceptedSynonyms ??
            patch.acceptedAnswers ??
            q.acceptedSynonyms ??
            q.acceptedAnswers;
          const mergedAccepted = Array.from(
            new Set([nextDisplay, ...(nextSynonyms || [])].filter(Boolean))
          );
          return {
            ...q,
            question: patch.question ?? q.question,
            displayAnswer: nextDisplay,
            acceptedAnswers: mergedAccepted,
            acceptedSynonyms: mergedAccepted,
            hint: patch.hint !== undefined ? patch.hint : q.hint,
            points: patch.points ?? q.points,
            imageUrl: patch.imageUrl !== undefined ? patch.imageUrl : q.imageUrl,
          };
        }),
    }));

  const existingIds = new Set(mergedBase.map((c) => c.id));
  const uniqueCustom = matchingCustomCats.filter((c) => !existingIds.has(c.id));

  return [...mergedBase, ...uniqueCustom];
}

// ============================================================================
// 4. MINI-GAME POOLS WITH CUSTOM BANK OVERRIDES
// ============================================================================

export function getMergedSpeedTriviaRounds(
  region: EditionRegion = "MA"
): SpeedTriviaRound[] {
  const bank = loadCustomQuestionBank();
  const base =
    region === "EN"
      ? ENGLISH_SPEED_TRIVIA_ROUNDS
      : region === "MA"
      ? [...MOROCCAN_SPEED_TRIVIA_ROUNDS, ...SPEED_TRIVIA_ROUNDS]
      : SPEED_TRIVIA_ROUNDS;
  const seen = new Set<string>();
  const combined: SpeedTriviaRound[] = [];
  for (const r of [...bank.customSpeedTrivia, ...base]) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      combined.push(r);
    }
  }
  return combined;
}

export function getMergedPriceGuessRounds(
  region: EditionRegion = "MA"
): PriceGuessRound[] {
  const bank = loadCustomQuestionBank();
  const base =
    region === "EN"
      ? ENGLISH_PRICE_GUESS_ROUNDS
      : region === "MA"
      ? MOROCCAN_PRICE_GUESS_ROUNDS
      : PRICE_GUESS_ROUNDS;
  const seen = new Set<string>();
  const combined: PriceGuessRound[] = [];
  for (const r of [...bank.customPriceGuess, ...base]) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      combined.push(r);
    }
  }
  return combined;
}

export function getMergedClosestNumberRounds(
  region: EditionRegion = "MA"
): ClosestNumberRound[] {
  const bank = loadCustomQuestionBank();
  const base =
    region === "EN"
      ? ENGLISH_CLOSEST_NUMBER_ROUNDS
      : region === "MA"
      ? [...MOROCCAN_CLOSEST_NUMBER_ROUNDS, ...CLOSEST_NUMBER_ROUNDS]
      : CLOSEST_NUMBER_ROUNDS;
  const seen = new Set<string>();
  const combined: ClosestNumberRound[] = [];
  for (const r of [...bank.customClosestNumber, ...base]) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      combined.push(r);
    }
  }
  return combined;
}

export function getMergedDrawingRounds(
  region: EditionRegion = "MA"
): DrawingChallengeRound[] {
  const bank = loadCustomQuestionBank();
  const base =
    region === "EN"
      ? ENGLISH_DRAWING_CHALLENGE_ROUNDS
      : region === "MA"
      ? [...MOROCCAN_DRAWING_CHALLENGE_ROUNDS, ...DRAWING_CHALLENGE_ROUNDS]
      : DRAWING_CHALLENGE_ROUNDS;
  const seen = new Set<string>();
  const combined: DrawingChallengeRound[] = [];
  for (const r of [...bank.customDrawingPrompts, ...base]) {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      combined.push(r);
    }
  }
  return combined;
}

export function getMergedQuickReflexRounds(): QuickReflexRound[] {
  return QUICK_REFLEX_ROUNDS;
}

export function getMergedWhatsInFrameRounds(
  region: EditionRegion = "MA"
): WhatsInFrameRound[] {
  return region === "EN" ? ENGLISH_WHATS_IN_FRAME_ROUNDS : WHATS_IN_FRAME_ROUNDS;
}

export function getMergedMapPinRounds(
  region: EditionRegion = "MA"
): MapPinRound[] {
  return region === "EN" ? ENGLISH_MAP_PIN_ROUNDS : MAP_PIN_ROUNDS;
}

export function getMergedSceneDescriptionRounds(
  region: EditionRegion = "MA"
): SceneDescriptionRound[] {
  return region === "EN"
    ? ENGLISH_SCENE_DESCRIPTION_ROUNDS
    : SCENE_DESCRIPTION_ROUNDS;
}

// ============================================================================
// 5. JSON EXPORT & IMPORT (Supports Full Studio Backup + 2026.11 Schema)
// ============================================================================

export function exportQuestionBankJson(): string {
  const bank = loadCustomQuestionBank();
  const maCategories = applyQuestionBankOverrides(
    MOROCCAN_SEEN_JEEM_CATEGORIES,
    "MA"
  );
  const menaCategories = applyQuestionBankOverrides(
    SEEN_JEEM_CATEGORIES,
    "MENA"
  );
  const enCategories = applyQuestionBankOverrides(
    ENGLISH_SEEN_JEEM_CATEGORIES,
    "EN"
  );

  const payload = {
    version: "2026.11",
    brand: "قَدْهَا؟ (QADHA)",
    exportedAt: new Date().toISOString(),
    customBankState: bank,
    boardCategoriesMA: maCategories,
    boardCategoriesMENA: menaCategories,
    boardCategoriesEN: enCategories,
    priceGuessItems: getMergedPriceGuessRounds("MA"),
    speedTrivia: getMergedSpeedTriviaRounds("MA"),
    closeToNumber: getMergedClosestNumberRounds("MA"),
    drawingPrompts: getMergedDrawingRounds("MA"),
  };

  return JSON.stringify(payload, null, 2);
}

export function importQuestionBankJson(rawJson: string): {
  success: boolean;
  messageAr: string;
  importedCount: number;
} {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== "object") {
      return {
        success: false,
        messageAr: "ملف JSON غير صالح.",
        importedCount: 0,
      };
    }

    // Case 1: Full CustomQuestionBankState backup
    if (parsed.customBankState && typeof parsed.customBankState === "object") {
      saveCustomQuestionBank(parsed.customBankState as CustomQuestionBankState);
      return {
        success: true,
        messageAr: "تم استيراد نسخة بنك الأسئلة الكاملة بنجاح! ✔",
        importedCount: Object.keys(parsed.customBankState.questionEdits || {})
          .length,
      };
    }

    // Case 2: Schema like gemini-code-1794047068263.json (`boardCategories`, `priceGuessItems`, `speedTrivia`, `closeToNumber`, `drawingPrompts`)
    const current = loadCustomQuestionBank();
    let importedCount = 0;

    if (Array.isArray(parsed.boardCategories)) {
      for (const rawCat of parsed.boardCategories) {
        if (!rawCat || !rawCat.id || !Array.isArray(rawCat.questions)) continue;
        const targetCatId = CATEGORY_ID_ALIASES[rawCat.id] || rawCat.id;
        const existingAdded = current.addedQuestionsByCategory[targetCatId] || [];
        const newQuestions: SeenJeemQuestion[] = [];

        for (const rq of rawCat.questions) {
          if (!rq || !rq.question) continue;
          const qId =
            rq.id ||
            `imp-${targetCatId}-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 6)}`;
          const pts: 200 | 400 | 600 =
            rq.points === 400 ? 400 : rq.points === 600 ? 600 : 200;
          const displayAnswer = rq.displayAnswer || rq.answer || "";
          const synonyms: string[] = Array.isArray(rq.acceptedSynonyms)
            ? rq.acceptedSynonyms
            : Array.isArray(rq.acceptedAnswers)
            ? rq.acceptedAnswers
            : [displayAnswer];
          const allAccepted = Array.from(
            new Set([displayAnswer, ...synonyms].filter(Boolean))
          );

          // Also store as an inline edit in case the question ID already exists in seed data
          current.questionEdits[qId] = {
            question: rq.question,
            displayAnswer,
            acceptedAnswers: allAccepted,
            acceptedSynonyms: allAccepted,
            rejectedTraps: rq.rejectedTraps,
            hint: rq.hint,
            funFact: rq.funFact || rq.explanation,
            points: pts,
          };

          newQuestions.push({
            id: qId,
            categoryId: targetCatId,
            points: pts,
            slotIndex: pts === 200 ? 0 : pts === 400 ? 2 : 4,
            question: rq.question,
            hint: rq.hint,
            displayAnswer,
            acceptedAnswers: allAccepted,
            acceptedSynonyms: allAccepted,
            rejectedTraps: rq.rejectedTraps || [],
            trapNote: rq.trapNote,
            funFact: rq.funFact || rq.explanation || "",
          });
          importedCount++;
        }

        current.addedQuestionsByCategory[targetCatId] = [
          ...existingAdded,
          ...newQuestions,
        ];
      }
    }

    if (Array.isArray(parsed.priceGuessItems)) {
      const importedPG: PriceGuessRound[] = parsed.priceGuessItems
        .filter((item: Record<string, unknown>) => item && (item.title || item.productName))
        .map((item: Record<string, unknown>, i: number) => ({
          id: String(item.id || `imp-pg-${Date.now()}-${i}`),
          productName: String(item.productName || item.title || ""),
          brand: String(item.brand || "السوق المغربي"),
          categoryBadge: String(item.categoryBadge || "كم السعر؟"),
          specs: String(item.specs || ""),
          actualPriceSar: Number(item.actualPrice || item.actualPriceDh || 0),
          actualPriceDh: Number(item.actualPrice || item.actualPriceDh || 0),
          currencyLabel:
            item.currency === "DH"
              ? "درهم مغربي (DH)"
              : String(item.currencyLabel || "درهم مغربي (DH)"),
          illustrationType: "iphone_16_pro" as const,
          funFact: String(item.explanation || item.funFact || ""),
        }));
      current.customPriceGuess = [...importedPG, ...current.customPriceGuess];
      importedCount += importedPG.length;
    }

    if (Array.isArray(parsed.speedTrivia)) {
      const importedST: SpeedTriviaRound[] = parsed.speedTrivia
        .filter((item: Record<string, unknown>) => item && item.question && Array.isArray(item.options))
        .map((item: Record<string, unknown>, i: number) => {
          const opts = (item.options as string[]).slice(0, 4) as [
            string,
            string,
            string,
            string
          ];
          const corrIdx =
            typeof item.correctIndex === "number"
              ? item.correctIndex
              : Math.max(0, opts.indexOf(String(item.correctAnswer || "")));
          return {
            id: String(item.id || `imp-st-${Date.now()}-${i}`),
            question: String(item.question),
            options: opts,
            correctIndex: corrIdx,
            explanation: String(item.explanation || ""),
          };
        });
      current.customSpeedTrivia = [...importedST, ...current.customSpeedTrivia];
      importedCount += importedST.length;
    }

    if (Array.isArray(parsed.closeToNumber)) {
      const importedCN: ClosestNumberRound[] = parsed.closeToNumber
        .filter((item: Record<string, unknown>) => item && item.question)
        .map((item: Record<string, unknown>, i: number) => ({
          id: String(item.id || `imp-cn-${Date.now()}-${i}`),
          question: String(item.question),
          unitLabel: String(item.unitLabel || ""),
          correctNumber: Number(item.targetNumber ?? item.correctNumber ?? 0),
          hintRange: String(item.hintRange || ""),
          funFact: String(item.explanation || item.funFact || ""),
        }));
      current.customClosestNumber = [
        ...importedCN,
        ...current.customClosestNumber,
      ];
      importedCount += importedCN.length;
    }

    if (Array.isArray(parsed.drawingPrompts)) {
      const importedDC: DrawingChallengeRound[] = parsed.drawingPrompts
        .filter((item: Record<string, unknown>) => item && (item.word || item.secretWord))
        .map((item: Record<string, unknown>, i: number) => {
          const word = String(item.secretWord || item.word || "");
          return {
            id: String(item.id || `imp-dc-${Date.now()}-${i}`),
            secretWord: word,
            categoryHint: String(item.categoryHint || item.category || "تحدي الرسم"),
            acceptedAnswers: Array.isArray(item.acceptedAnswers)
              ? (item.acceptedAnswers as string[])
              : [word],
            difficultyPoints: Number(item.difficultyPoints || 400),
          };
        });
      current.customDrawingPrompts = [
        ...importedDC,
        ...current.customDrawingPrompts,
      ];
      importedCount += importedDC.length;
    }

    saveCustomQuestionBank(current);
    return {
      success: true,
      messageAr: `🎉 تم استيراد وتحديث ${importedCount} سؤالاً وعنصراً بنجاح!`,
      importedCount,
    };
  } catch {
    return {
      success: false,
      messageAr: "تعذر قراءة ملف JSON. تأكد من صحة التنسيق.",
      importedCount: 0,
    };
  }
}
