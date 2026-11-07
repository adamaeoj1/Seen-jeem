"use client";

import React, { useEffect, useState } from "react";
import { SeenJeemQuestion } from "@/data/seedQuestions";
import { PlayerSubmission, RoomState } from "@/lib/gameEngine";
import {
  fisherYatesShuffle,
  loadPlayedQuestionIds,
} from "@/lib/questionRandomizer";

// ============================================================================
// 1. DUAL-REGION ARCHITECTURE (MOROCCO 'MA' + MENA 'MENA')
// ============================================================================

export type RegionCode = "MA" | "MENA";
export type EditionRegion = RegionCode;
export type SeenJeemBoardSize = 18 | 36;
export type SeenJeemAnswerMode = "TYPING" | "BUZZER";

export interface EditionConfig {
  region: RegionCode;
  switcherLabel: string;
  flag: string;
  partyTerm: string;
  gatheringPhrase: string;
  deviceTerm: string;
  currencyLabel: string;
  currencySymbol: string;
  partyPassPrice: string;
  proHostPrice: string;
  defaultTeam1Name: string;
  defaultTeam2Name: string;
  defaultPlayerPlaceholder: string;
  defaultHostPlaceholder: string;
  ticketName: string;
}

export const EDITIONS: Record<RegionCode, EditionConfig> = {
  MA: {
    region: "MA",
    switcherLabel: "🇲🇦 النسخة المغربية",
    flag: "🇲🇦",
    partyTerm: "الگلسة / القصارة",
    gatheringPhrase: "للمّات مع العشران والعائلة",
    deviceTerm: "بالتيليفون",
    currencyLabel: "درهم مغربي (DH)",
    currencySymbol: "DH",
    partyPassPrice: "25 DH",
    proHostPrice: "70 DH",
    defaultTeam1Name: "أسود الأطلس",
    defaultTeam2Name: "القراصنة",
    defaultPlayerPlaceholder: "مثال: أمين",
    defaultHostPlaceholder: "ياسين",
    ticketName: "تذكرة الگلسة",
  },
  MENA: {
    region: "MENA",
    switcherLabel: "🌍 النسخة العربية",
    flag: "🌍",
    partyTerm: "السهرة",
    gatheringPhrase: "للجمعات مع الأصدقاء",
    deviceTerm: "بالجوال",
    currencyLabel: "دولار ($)",
    currencySymbol: "$",
    partyPassPrice: "$2.99",
    proHostPrice: "$7.99",
    defaultTeam1Name: "فريق الصقور",
    defaultTeam2Name: "فريق النمور",
    defaultPlayerPlaceholder: "مثال: عزوز",
    defaultHostPlaceholder: "سلطان",
    ticketName: "تذكرة السهرة",
  },
};

const REGION_STORAGE_KEY = "seen_jeem_region_edition_v1";
const REGION_EVENT_NAME = "seen_jeem_region_changed";
const ADAPTER_STORAGE_PREFIX = "seen_jeem_frontend_adapter_v1_";
const ADAPTER_CHANNEL_NAME = "seen_jeem_adapter_channel_v1";

export const BUZZ_PREFIX = "__BUZZ__:";
export const BUZZER_MODE_MARKER = "__MODE_BUZZER__";

let currentRegionMemory: RegionCode = "MA";

export function hasSavedRegion(): boolean {
  if (typeof window === "undefined") return true;
  const saved = window.localStorage.getItem(REGION_STORAGE_KEY);
  return saved === "MA" || saved === "MENA";
}

export function getRegion(): RegionCode {
  if (typeof window === "undefined") return currentRegionMemory;
  const saved = window.localStorage.getItem(REGION_STORAGE_KEY);
  if (saved === "MA" || saved === "MENA") {
    currentRegionMemory = saved;
    return saved;
  }
  return "MA";
}

export const getEditionRegion = getRegion;

export function setRegion(nextRegion: RegionCode): void {
  currentRegionMemory = nextRegion;
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REGION_STORAGE_KEY, nextRegion);
  window.dispatchEvent(
    new CustomEvent<RegionCode>(REGION_EVENT_NAME, { detail: nextRegion })
  );
  try {
    const bc = new BroadcastChannel(ADAPTER_CHANNEL_NAME);
    bc.postMessage({ type: "REGION_CHANGE", region: nextRegion });
    bc.close();
  } catch {
    // Ignore BroadcastChannel errors
  }
}

export function getEditionConfig(region?: RegionCode): EditionConfig {
  const target = region || getRegion();
  return EDITIONS[target] || EDITIONS.MA;
}

export function isDefaultTeamName(name: string): boolean {
  const trimmed = name.trim();
  return (
    trimmed === EDITIONS.MA.defaultTeam1Name ||
    trimmed === EDITIONS.MA.defaultTeam2Name ||
    trimmed === EDITIONS.MENA.defaultTeam1Name ||
    trimmed === EDITIONS.MENA.defaultTeam2Name
  );
}

export function useEdition() {
  const [region, setRegionState] = useState<RegionCode>("MA");

  useEffect(() => {
    setRegionState(getRegion());

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<RegionCode>;
      if (customEvent.detail === "MA" || customEvent.detail === "MENA") {
        setRegionState(customEvent.detail);
      } else {
        setRegionState(getRegion());
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === REGION_STORAGE_KEY) {
        setRegionState(getRegion());
      }
    };

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(ADAPTER_CHANNEL_NAME);
      bc.onmessage = (evt) => {
        if (
          evt.data?.type === "REGION_CHANGE" &&
          (evt.data.region === "MA" || evt.data.region === "MENA")
        ) {
          setRegionState(evt.data.region);
        }
      };
    } catch {
      // Ignore
    }

    window.addEventListener(REGION_EVENT_NAME, handleCustom);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(REGION_EVENT_NAME, handleCustom);
      window.removeEventListener("storage", handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const updateRegion = (next: RegionCode) => {
    setRegionState(next);
    setRegion(next);
  };

  return {
    region,
    setRegion: updateRegion,
    edition: EDITIONS[region] || EDITIONS.MA,
  };
}

export function RegionSwitcher({
  compact = false,
  dark = false,
}: {
  compact?: boolean;
  dark?: boolean;
}) {
  const { region, setRegion } = useEdition();

  return React.createElement(
    "div",
    {
      className: `inline-flex items-center p-1 rounded-2xl border-2 ${
        dark
          ? "bg-white/10 border-white/30 text-white"
          : "bg-white border-black text-black shadow-brutal-sm"
      }`,
      role: "group",
      "aria-label": "اختيار النسخة الإقليمية",
    },
    (["MA", "MENA"] as const).map((code) => {
      const active = region === code;
      const cfg = EDITIONS[code];
      return React.createElement(
        "button",
        {
          key: code,
          type: "button",
          onClick: () => setRegion(code),
          className: `${
            compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
          } rounded-xl font-black transition whitespace-nowrap ${
            active
              ? "bg-sunny text-black border-2 border-black shadow-sm"
              : dark
              ? "text-white/80 hover:text-white"
              : "text-gray-600 hover:text-black"
          }`,
        },
        cfg.switcherLabel
      );
    })
  );
}

export function EditionOnboardingGate({
  forceOpen = false,
  onClose,
}: {
  forceOpen?: boolean;
  onClose?: () => void;
}) {
  const { region, setRegion } = useEdition();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!hasSavedRegion()) {
      setNeedsOnboarding(true);
    }
  }, []);

  const isOpen = forceOpen || needsOnboarding;
  if (!isOpen) return null;

  const handleSelectEdition = (chosen: RegionCode) => {
    setRegion(chosen);
    setNeedsOnboarding(false);
    onClose?.();
  };

  return React.createElement(
    "div",
    {
      className:
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4",
      dir: "rtl",
    },
    React.createElement(
      "div",
      {
        className:
          "bg-cream border-4 border-black rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-brutal-lg space-y-6 text-right",
      },
      React.createElement(
        "div",
        { className: "space-y-2 text-center" },
        React.createElement(
          "div",
          {
            className:
              "w-16 h-16 rounded-2xl bg-sunny border-3 border-black shadow-brutal-sm flex items-center justify-center text-3xl font-black mx-auto",
          },
          "ق؟"
        ),
        React.createElement(
          "span",
          {
            className:
              "inline-block px-3 py-0.5 rounded-full bg-coral text-black border-2 border-black text-xs font-black",
          },
          "مرحباً بك في قَدْهَا؟ (QADHA)"
        ),
        React.createElement(
          "h2",
          { className: "text-2xl md:text-3xl font-black text-black" },
          "اختر نسختك المفضلة للبدء"
        ),
        React.createElement(
          "p",
          { className: "text-xs md:text-sm font-bold text-gray-700" },
          "يتم ضبط الأسئلة، الشخصيات الكرتونية، المصطلحات، والعملة تلقائياً حسب اختيارك (ويمكنك تغييرها لاحقاً من الشاشة الرئيسية قبل بدء الغرفة)."
        )
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-1 gap-4" },
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => handleSelectEdition("MA"),
            className: `w-full p-5 rounded-2xl border-4 border-black text-right transition flex items-center justify-between gap-4 ${
              region === "MA"
                ? "bg-sunny text-black shadow-brutal -translate-y-0.5"
                : "bg-white hover:bg-sunny/40 text-black shadow-brutal-sm"
            }`,
          },
          React.createElement(
            "div",
            { className: "space-y-1" },
            React.createElement(
              "div",
              { className: "text-lg md:text-xl font-black flex items-center gap-2" },
              "🇲🇦 النسخة المغربية (الگلسة والقصارة - بالدرهم المغربي)"
            ),
            React.createElement(
              "p",
              { className: "text-xs font-bold text-gray-800" },
              "ثقافة ومصطلحات مغربية • المنتخب والبطولة • أمثال شعبية • الأسعار بالدرهم (DH) • أسود الأطلس ضد القراصنة"
            )
          ),
          React.createElement(
            "span",
            {
              className:
                "px-3 py-1.5 rounded-xl bg-black text-sunny font-black text-xs shrink-0",
            },
            "اختر 🇲🇦"
          )
        ),
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => handleSelectEdition("MENA"),
            className: `w-full p-5 rounded-2xl border-4 border-black text-right transition flex items-center justify-between gap-4 ${
              region === "MENA"
                ? "bg-royal text-white shadow-brutal -translate-y-0.5"
                : "bg-white hover:bg-royal/10 text-black shadow-brutal-sm"
            }`,
          },
          React.createElement(
            "div",
            { className: "space-y-1" },
            React.createElement(
              "div",
              { className: "text-lg md:text-xl font-black flex items-center gap-2" },
              "🌍 النسخة العربية العالمية (السهرة والجمعات - بالدولار)"
            ),
            React.createElement(
              "p",
              {
                className: `text-xs font-bold ${
                  region === "MENA" ? "text-cream" : "text-gray-700"
                }`,
              },
              "ثقافة عربية وعالمية شاملة • السهرة والجمعات • الأسعار بالدولار ($) • فريق الصقور ضد فريق النمور"
            )
          ),
          React.createElement(
            "span",
            {
              className:
                "px-3 py-1.5 rounded-xl bg-sunny text-black border border-black font-black text-xs shrink-0",
            },
            "اختر 🌍"
          )
        )
      )
    )
  );
}

// ============================================================================
// 2. FRONTEND ADAPTER LAYER (ZERO-BACKEND-MUTATION STATE & FILTERS)
// ============================================================================

export interface RoomFrontendAdapterState {
  boardSize: SeenJeemBoardSize; // 18 (default) or 36
  answerMode: SeenJeemAnswerMode; // 'TYPING' (default) or 'BUZZER'
  manualAwardedInRound: boolean;
  boardShuffleSeed: number;
}

const DEFAULT_ADAPTER_STATE: RoomFrontendAdapterState = {
  boardSize: 18,
  answerMode: "TYPING",
  manualAwardedInRound: false,
  boardShuffleSeed: 1,
};

export function getRoomAdapterState(code: string): RoomFrontendAdapterState {
  if (typeof window === "undefined" || !code) return DEFAULT_ADAPTER_STATE;
  const key = ADAPTER_STORAGE_PREFIX + code.toUpperCase().trim();
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    // Initialize a random shuffle seed per room code so every room gets a fresh board
    let codeHash = Date.now() & 0xffff;
    for (let i = 0; i < code.length; i++) {
      codeHash = (codeHash * 33 + code.charCodeAt(i)) >>> 0;
    }
    const initial: RoomFrontendAdapterState = {
      ...DEFAULT_ADAPTER_STATE,
      boardShuffleSeed: codeHash || 1,
    };
    try {
      window.localStorage.setItem(key, JSON.stringify(initial));
    } catch {
      // Ignore
    }
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<RoomFrontendAdapterState>;
    return {
      boardSize: parsed.boardSize === 36 ? 36 : 18,
      answerMode: parsed.answerMode === "BUZZER" ? "BUZZER" : "TYPING",
      manualAwardedInRound: Boolean(parsed.manualAwardedInRound),
      boardShuffleSeed:
        typeof parsed.boardShuffleSeed === "number" &&
        parsed.boardShuffleSeed > 0
          ? parsed.boardShuffleSeed
          : 1,
    };
  } catch {
    return DEFAULT_ADAPTER_STATE;
  }
}

export function setRoomAdapterState(
  code: string,
  patch: Partial<RoomFrontendAdapterState>
): RoomFrontendAdapterState {
  const cleanCode = code.toUpperCase().trim();
  const current = getRoomAdapterState(cleanCode);
  const next: RoomFrontendAdapterState = {
    ...current,
    ...patch,
  };
  if (typeof window !== "undefined") {
    const key = ADAPTER_STORAGE_PREFIX + cleanCode;
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("seen_jeem_adapter_update", {
        detail: { code: cleanCode, state: next },
      })
    );
    try {
      const bc = new BroadcastChannel(ADAPTER_CHANNEL_NAME);
      bc.postMessage({
        type: "ADAPTER_UPDATE",
        code: cleanCode,
        state: next,
      });
      bc.close();
    } catch {
      // Ignore
    }
  }
  return next;
}

/**
 * Selects and shuffles a category's questions down to 3 questions (200, 400, 600) when
 * boardSize === 18 ("جلسة سريعة"), or 6 questions (two 200s, two 400s, two 600s) when
 * boardSize === 36 ("جلسة مطولة"), prioritizing unseen questions and using Fisher-Yates shuffle.
 */
export function filterQuestionsByBoardSize(
  questions: SeenJeemQuestion[],
  boardSize: SeenJeemBoardSize,
  shuffleSeed = 1,
  answeredIds: string[] = []
): SeenJeemQuestion[] {
  if (!questions || questions.length === 0) return [];

  const playedSet = loadPlayedQuestionIds();
  const answeredSet = new Set(answeredIds);
  const countPerPoint = boardSize === 18 ? 1 : 2;
  const tiers: Array<200 | 400 | 600> = [200, 400, 600];
  const result: SeenJeemQuestion[] = [];

  for (const pts of tiers) {
    const tierQuestions = questions.filter((q) => q.points === pts);
    // Keep already-answered questions in this room visible so their "✔ تم اللعب" tile stays intact
    const alreadyAnsweredInRoom = tierQuestions.filter((q) =>
      answeredSet.has(q.id)
    );
    const remainingCandidates = tierQuestions.filter(
      (q) => !answeredSet.has(q.id)
    );

    const catHash = (questions[0]?.categoryId || "")
      .split("")
      .reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7);
    const tierSeed = (shuffleSeed * 997 + pts * 13 + catHash) >>> 0;

    // Prioritize unseen questions first, then seen questions as fallback
    const unseen = remainingCandidates.filter((q) => !playedSet.has(q.id));
    const seen = remainingCandidates.filter((q) => playedSet.has(q.id));

    const shuffledUnseen = fisherYatesShuffle(unseen, tierSeed);
    const shuffledSeen = fisherYatesShuffle(seen, tierSeed + 37);

    const combined = [
      ...alreadyAnsweredInRoom,
      ...shuffledUnseen,
      ...shuffledSeen,
    ];
    result.push(...combined.slice(0, countPerPoint));
  }

  return result;
}

// ============================================================================
// 3. ZERO-BACKEND BUZZER MODE (`__BUZZ__` PROTOCOL)
// ============================================================================

export function createBuzzAnswerPayload(timestampMs = Date.now()): string {
  return `${BUZZ_PREFIX}${timestampMs}`;
}

export function isBuzzAnswer(textAnswer?: string): boolean {
  return Boolean(textAnswer && textAnswer.startsWith(BUZZ_PREFIX));
}

export function parseBuzzTimestamp(textAnswer?: string): number | null {
  if (!textAnswer || !textAnswer.startsWith(BUZZ_PREFIX)) return null;
  const raw = textAnswer.slice(BUZZ_PREFIX.length).trim();
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export interface ParsedBuzzEntry {
  submission: PlayerSubmission;
  buzzTimestamp: number;
}

export function getSortedBuzzQueue(
  submissions: Record<string, PlayerSubmission>
): ParsedBuzzEntry[] {
  const list: ParsedBuzzEntry[] = [];
  for (const sub of Object.values(submissions || {})) {
    const ts = parseBuzzTimestamp(sub.textAnswer);
    if (ts !== null) {
      list.push({
        submission: sub,
        buzzTimestamp: ts,
      });
    }
  }
  list.sort((a, b) => a.buzzTimestamp - b.buzzTimestamp);
  return list;
}

export function isRoomInBuzzerMode(
  room: RoomState | null,
  adapterState?: RoomFrontendAdapterState
): boolean {
  if (!room) return false;
  if (room.roundSummaryText === BUZZER_MODE_MARKER) return true;
  if (adapterState?.answerMode === "BUZZER") return true;
  const stored = getRoomAdapterState(room.code);
  return stored.answerMode === "BUZZER";
}
