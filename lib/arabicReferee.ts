/**
 * Smart Arabic Referee Engine (محرك الحكم العربي الذكي)
 * Handles Arabic orthographic normalization, definite article stripping,
 * phonetic/stem tolerance, Levenshtein similarity >= 82%, trap detection,
 * semantic/keyword scene description grading, and Haversine map distance scoring.
 */

export interface RefereeVerdict {
  isCorrect: boolean;
  isTrap: boolean;
  similarity: number; // 0 to 1 (e.g. 0.89 = 89%)
  matchedAlias?: string;
  trapMatched?: string;
  normalizedInput: string;
  verdictTitle: string;
  verdictDetail: string;
}

export interface SceneTag {
  id: string;
  label: string;
  aliases: string[];
  points: number;
}

export interface DescriptionVerdict {
  matchedTags: SceneTag[];
  missedTags: SceneTag[];
  totalPoints: number;
  maxPoints: number;
  accuracyPercent: number;
  verdictSummary: string;
}

const EASTERN_TO_WESTERN_DIGITS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

/**
 * Converts Eastern Arabic/Persian numerals to standard Western digits.
 */
export function normalizeDigits(input: string): string {
  if (!input) return "";
  return input
    .split("")
    .map((ch) => EASTERN_TO_WESTERN_DIGITS[ch] ?? ch)
    .join("");
}

/**
 * Parses a numeric input (even if user typed Arabic numerals or commas/currency words).
 */
export function parseArabicNumber(input: string): number | null {
  const normalized = normalizeDigits(input)
    .replace(/[,،\s]/g, "")
    .replace(/[^\d.-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Core Arabic Text Normalizer:
 * 1. Strips Tashkeel (diacritics) and Tatweel (kashida)
 * 2. Normalizes Alef variants (أ, إ, آ, ٱ) -> ا
 * 3. Normalizes Teh Marbuta (ة) -> ه
 * 4. Normalizes Alef Maqsura (ى) & Yeh Hamza (ئ) -> ي
 * 5. Normalizes Waw Hamza (ؤ) -> و
 * 6. Strips leading definite articles (ال, وال, بال, كال, فال, لل) per word
 */
export function normalizeArabic(
  raw: string,
  options: { stripDefiniteArticle?: boolean; collapseEndingYa?: boolean } = {
    stripDefiniteArticle: true,
    collapseEndingYa: false,
  }
): string {
  if (!raw) return "";

  let text = normalizeDigits(raw.trim().toLowerCase());

  // Remove Arabic diacritics (Tashkeel) and Tatweel
  text = text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "");

  // Remove punctuation & special characters while keeping Arabic, Latin, numbers, spaces
  text = text.replace(/[^\u0600-\u06FFa-z0-9\s]/g, " ");

  // Normalize Alef variants to bare Alef
  text = text.replace(/[أإآٱ]/g, "ا");

  // Normalize Teh Marbuta to Heh
  text = text.replace(/ة/g, "ه");

  // Normalize Alef Maqsura and Yeh with Hamza to Yeh
  text = text.replace(/[ىئ]/g, "ي");

  // Normalize Waw with Hamza to Waw
  text = text.replace(/ؤ/g, "و");

  // Collapse repeated duplicate letters (e.g. "مررررحبا" -> "مرحبا")
  text = text.replace(/(.)\1{2,}/g, "$1");

  // Remove common filler prefixes if the player wrote "مدينة القسطنطينية" or "دولة سويسرا"
  const fillerWords = new Set([
    "مدينه",
    "دوله",
    "عاصمه",
    "مملكه",
    "جمهوريه",
    "برج",
    "جبل",
    "قاره",
    "نهر",
    "بحر",
    "فيلم",
    "مسلسل",
    "الاجابه",
    "جواب",
    "هو",
    "هي",
  ]);

  const rawWords = text.split(/\s+/).filter(Boolean);

  const processedWords = rawWords.map((word) => {
    let w = word;
    if (options.stripDefiniteArticle !== false) {
      // Strip prefixes like وال, بال, كال, فال, لل, ال if remaining stem >= 3 chars
      if (
        (w.startsWith("وال") ||
          w.startsWith("بال") ||
          w.startsWith("كال") ||
          w.startsWith("فال")) &&
        w.length >= 6
      ) {
        w = w.slice(3);
      } else if (w.startsWith("لل") && w.length >= 5) {
        w = w.slice(2);
      } else if (w.startsWith("ال") && w.length >= 5) {
        w = w.slice(2);
      } else if (w.startsWith("ال") && w.length === 4) {
        // e.g. "الهند" (5) vs "الاب" (4) -> strip "ال" for 4-char nouns too unless it starts with الا
        if (!w.startsWith("الا")) {
          w = w.slice(2);
        }
      }
    }

    if (options.collapseEndingYa) {
      // Normalize nisba ending "يه" -> "ه" (e.g., "قسطنطينيه" -> "قسطنطينه", "اسكندريه" -> "اسكندره")
      if (w.endsWith("يه") && w.length > 4) {
        w = w.slice(0, -2) + "ه";
      }
    }
    return w;
  });

  // If multiple words and first word is a generic filler word ("مدينه قسطنطينه"), drop filler when comparing
  const filteredWords =
    processedWords.length > 1
      ? processedWords.filter((w, idx) => !(idx === 0 && fillerWords.has(w)))
      : processedWords;

  return filteredWords.join(" ").trim();
}

/**
 * Standard Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

/**
 * Calculates similarity score between 0 and 1 between two Arabic strings,
 * testing both standard normalized form and phonetic/nisba-collapsed form.
 */
export function calculateArabicSimilarity(input: string, target: string): number {
  const normInput = normalizeArabic(input, {
    stripDefiniteArticle: true,
    collapseEndingYa: false,
  });
  const normTarget = normalizeArabic(target, {
    stripDefiniteArticle: true,
    collapseEndingYa: false,
  });

  if (!normInput || !normTarget) return 0;
  if (normInput === normTarget) return 1;

  // Standard Levenshtein similarity
  const maxLen = Math.max(normInput.length, normTarget.length);
  const dist = levenshteinDistance(normInput, normTarget);
  const directSim = Math.max(0, 1 - dist / maxLen);

  // Also check if the target is cleanly contained as a whole word inside a slightly longer answer
  let containmentSim = 0;
  if (normTarget.length >= 4 && normInput.includes(normTarget)) {
    containmentSim = 0.9;
  }

  return Math.max(directSim, containmentSim);
}

/**
 * Evaluates a player's submitted Arabic answer against accepted answers and rejected traps.
 * Default threshold is 0.82 (82% similarity).
 */
export function evaluateArabicAnswer(
  playerAnswer: string,
  acceptedAnswers: string[],
  rejectedTraps: string[] = [],
  threshold = 0.82,
  trapNote?: string
): RefereeVerdict {
  const normalizedInput = normalizeArabic(playerAnswer, {
    stripDefiniteArticle: true,
    collapseEndingYa: false,
  });

  if (!normalizedInput) {
    return {
      isCorrect: false,
      isTrap: false,
      similarity: 0,
      normalizedInput: "",
      verdictTitle: "لم يتم إدخال إجابة",
      verdictDetail: "انتهى الوقت بدون كتابة إجابة.",
    };
  }

  // 0. Check if the player's answer is an exact normalized match to any accepted answer first
  for (const alias of acceptedAnswers) {
    const normAlias = normalizeArabic(alias, {
      stripDefiniteArticle: true,
      collapseEndingYa: false,
    });
    if (normAlias && normalizedInput === normAlias) {
      return {
        isCorrect: true,
        isTrap: false,
        similarity: 1,
        matchedAlias: alias,
        normalizedInput,
        verdictTitle: "إجابة مطابقة ١٠٠٪ ✔",
        verdictDetail: `تطابق تام مع "${alias}"`,
      };
    }
  }

  // 1. Check if the player fell into a known rejected trap (e.g., "قسطنطينة" or "إسطنبول" instead of "القسطنطينية")
  for (const trap of rejectedTraps) {
    const trapSim = calculateArabicSimilarity(playerAnswer, trap);
    if (trapSim >= 0.85) {
      return {
        isCorrect: false,
        isTrap: true,
        similarity: trapSim,
        trapMatched: trap,
        normalizedInput,
        verdictTitle: trapNote || `فخ شائع! (${trap})`,
        verdictDetail:
          trapNote ||
          `الإجابة "${playerAnswer}" تشير إلى "${trap}" وهي إجابة خاطئة لهذا السؤال بالتحديد!`,
      };
    }
  }

  // 2. Check against all accepted aliases
  let bestSimilarity = 0;
  let bestAlias = acceptedAnswers[0] || "";

  for (const alias of acceptedAnswers) {
    const sim = calculateArabicSimilarity(playerAnswer, alias);
    if (sim > bestSimilarity) {
      bestSimilarity = sim;
      bestAlias = alias;
    }
  }

  const isCorrect = bestSimilarity >= threshold;
  const simPercent = Math.round(bestSimilarity * 100);

  if (isCorrect) {
    return {
      isCorrect: true,
      isTrap: false,
      similarity: bestSimilarity,
      matchedAlias: bestAlias,
      normalizedInput,
      verdictTitle:
        simPercent === 100
          ? "إجابة مطابقة ١٠٠٪ ✔"
          : `إجابة صحيحة بالحكم الذكي (${simPercent}٪) ✔`,
      verdictDetail:
        simPercent === 100
          ? `تطابق تام مع "${bestAlias}"`
          : `تم قبول "${playerAnswer}" لمطابقتها الذكية مع "${bestAlias}" بنسبة ${simPercent}٪`,
    };
  }

  return {
    isCorrect: false,
    isTrap: false,
    similarity: bestSimilarity,
    matchedAlias: bestAlias,
    normalizedInput,
    verdictTitle:
      simPercent >= 60 ? `قريب جداً (${simPercent}٪) ✖` : "إجابة غير صحيحة ✖",
    verdictDetail: `نسبة التطابق ${simPercent}٪ (المطلوب ${Math.round(
      threshold * 100
    )}٪ على الأقل)`,
  };
}

/**
 * Evaluates a free-text scene description (Mini-Game #8: أدق وصف)
 * against a list of target scene tags and their Arabic synonyms/aliases.
 */
export function evaluateDescriptionTags(
  playerDescription: string,
  targetTags: SceneTag[]
): DescriptionVerdict {
  const normDesc = normalizeArabic(playerDescription);
  const words = normDesc.split(/\s+/).filter(Boolean);

  const matchedTags: SceneTag[] = [];
  const missedTags: SceneTag[] = [];
  let totalPoints = 0;
  const maxPoints = targetTags.reduce((sum, t) => sum + t.points, 0);

  for (const tag of targetTags) {
    const candidates = [tag.label, ...tag.aliases];
    let matched = false;

    for (const candidate of candidates) {
      const normCand = normalizeArabic(candidate);
      if (!normCand) continue;

      // Direct substring match
      if (normDesc.includes(normCand)) {
        matched = true;
        break;
      }

      // Single or two-word sliding window fuzzy match (>= 0.80)
      const candWordCount = normCand.split(/\s+/).length;
      for (let i = 0; i < words.length; i++) {
        const windowStr = words.slice(i, i + candWordCount).join(" ");
        if (calculateArabicSimilarity(windowStr, normCand) >= 0.8) {
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (matched) {
      matchedTags.push(tag);
      totalPoints += tag.points;
    } else {
      missedTags.push(tag);
    }
  }

  const accuracyPercent =
    targetTags.length > 0
      ? Math.round((matchedTags.length / targetTags.length) * 100)
      : 0;

  return {
    matchedTags,
    missedTags,
    totalPoints,
    maxPoints,
    accuracyPercent,
    verdictSummary:
      matchedTags.length > 0
        ? `التقط ${matchedTags.length} من أصل ${targetTags.length} عناصر في المشهد (${accuracyPercent}٪)`
        : "لم يتم ذكر العناصر الأساسية في الصورة",
  };
}

/**
 * Calculates the great-circle distance in kilometers between two coordinates on Earth
 * using the Haversine formula (Mini-Game #7: ثبت الدبوس).
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Converts a Haversine distance in km into points (0 to 500 pts).
 */
export function scoreMapDistance(distanceKm: number): number {
  if (distanceKm <= 80) return 500; // Bullseye!
  if (distanceKm <= 250) return 450;
  if (distanceKm <= 600) return 380;
  if (distanceKm <= 1200) return 280;
  if (distanceKm <= 2200) return 180;
  if (distanceKm <= 3500) return 90;
  return 25; // Participation points for dropping a pin
}
