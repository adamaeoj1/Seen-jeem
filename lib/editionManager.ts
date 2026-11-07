"use client";

import React, { useEffect, useState } from "react";
import { SeenJeemQuestion } from "@/data/seedQuestions";
import { PlayerSubmission, RoomState } from "@/lib/gameEngine";
import {
  fisherYatesShuffle,
  loadPlayedQuestionIds,
} from "@/lib/questionRandomizer";
import { EditionFlagIcon, QadhaLogo } from "@/components/QadhaLogo";

// Re-export pure constants & server-safe types
export * from "@/lib/editionConstants";
import {
  ADAPTER_CHANNEL_NAME,
  ADAPTER_STORAGE_PREFIX,
  BUZZ_PREFIX,
  BUZZER_MODE_MARKER,
  EDITIONS,
  EditionConfig,
  getRegion,
  hasSavedRegion,
  isValidRegionCode,
  RegionCode,
  REGION_EVENT_NAME,
  REGION_STORAGE_KEY,
  SeenJeemAnswerMode,
  SeenJeemBoardSize,
  setRegion,
} from "@/lib/editionConstants";

export function useEdition() {
  const [region, setRegionState] = useState<RegionCode>("MA");

  useEffect(() => {
    setRegionState(getRegion());

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<RegionCode>;
      if (isValidRegionCode(customEvent.detail)) {
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
          isValidRegionCode(evt.data.region)
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

  const edition = EDITIONS[region] || EDITIONS.MA;

  return {
    region,
    setRegion: updateRegion,
    edition,
    isEn: region === "EN",
    dir: edition.dir,
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
      "aria-label": "Edition Switcher",
    },
    (["MA", "MENA", "EN"] as const).map((code) => {
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
          } rounded-xl font-black transition whitespace-nowrap inline-flex items-center gap-1.5 ${
            active
              ? "bg-sunny text-black border-2 border-black shadow-sm"
              : dark
              ? "text-white/80 hover:text-white"
              : "text-gray-600 hover:text-black"
          }`,
        },
        React.createElement(EditionFlagIcon, {
          edition: code,
          className: "w-5 h-3.5",
        }),
        React.createElement("span", null, cfg.switcherLabel)
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
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto",
      dir: "rtl",
    },
    React.createElement(
      "div",
      {
        className:
          "bg-cream border-4 border-black rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-brutal-lg space-y-6 text-right my-4",
      },
      React.createElement(
        "div",
        { className: "space-y-2 text-center" },
        React.createElement(
          "div",
          { className: "flex justify-center" },
          React.createElement(QadhaLogo, { edition: region, size: "lg" })
        ),
        React.createElement(
          "span",
          {
            className:
              "inline-block px-3 py-0.5 rounded-full bg-coral text-black border-2 border-black text-xs font-black",
          },
          "مرحباً بك في قَدْهَا؟ • Welcome to QADHA?"
        ),
        React.createElement(
          "h2",
          { className: "text-2xl md:text-3xl font-black text-black" },
          "اختر نسختك المفضلة للبدء • Choose Your Edition"
        ),
        React.createElement(
          "p",
          { className: "text-xs md:text-sm font-bold text-gray-700" },
          "يتم ضبط الأسئلة، الشخصيات الكرتونية، المصطلحات، اتجاه الشاشة (RTL/LTR)، والعملة تلقائياً حسب اختيارك."
        )
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-1 gap-3.5" },
        // 1. Moroccan Edition (MA)
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => handleSelectEdition("MA"),
            className: `w-full p-4 md:p-5 rounded-2xl border-4 border-black text-right transition flex items-center justify-between gap-4 ${
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
              {
                className:
                  "text-base md:text-xl font-black flex items-center gap-2.5",
              },
              React.createElement(EditionFlagIcon, {
                edition: "MA",
                className: "w-7 h-5",
              }),
              React.createElement(
                "span",
                null,
                "النسخة المغربية (الگلسة والقصارة - بالدرهم المغربي)"
              )
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
                "px-3.5 py-2 rounded-xl bg-black text-sunny font-black text-xs shrink-0 inline-flex items-center gap-1.5",
            },
            React.createElement("span", null, "اختر"),
            React.createElement(EditionFlagIcon, {
              edition: "MA",
              className: "w-4 h-3",
            })
          )
        ),
        // 2. MENA Arabic Edition (MENA)
        React.createElement(
          "button",
          {
            type: "button",
            onClick: () => handleSelectEdition("MENA"),
            className: `w-full p-4 md:p-5 rounded-2xl border-4 border-black text-right transition flex items-center justify-between gap-4 ${
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
              {
                className:
                  "text-base md:text-xl font-black flex items-center gap-2.5",
              },
              React.createElement(EditionFlagIcon, {
                edition: "MENA",
                className: "w-7 h-5",
              }),
              React.createElement(
                "span",
                null,
                "النسخة العربية العالمية (السهرة والجمعات - بالدولار)"
              )
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
                "px-3.5 py-2 rounded-xl bg-sunny text-black border border-black font-black text-xs shrink-0 inline-flex items-center gap-1.5",
            },
            React.createElement("span", null, "اختر"),
            React.createElement(EditionFlagIcon, {
              edition: "MENA",
              className: "w-4 h-3",
            })
          )
        ),
        // 3. Native Cultural English Edition (EN)
        React.createElement(
          "button",
          {
            type: "button",
            dir: "ltr",
            onClick: () => handleSelectEdition("EN"),
            className: `w-full p-4 md:p-5 rounded-2xl border-4 border-black text-left transition flex items-center justify-between gap-4 ${
              region === "EN"
                ? "bg-mint text-black shadow-brutal -translate-y-0.5"
                : "bg-white hover:bg-mint/30 text-black shadow-brutal-sm"
            }`,
          },
          React.createElement(
            "div",
            { className: "space-y-1" },
            React.createElement(
              "div",
              {
                className:
                  "text-base md:text-xl font-black flex items-center gap-2.5",
              },
              React.createElement(EditionFlagIcon, {
                edition: "EN",
                className: "w-7 h-5",
              }),
              React.createElement(
                "span",
                null,
                "🎮 International English Edition (Game Night & Trivia — USD $)"
              )
            ),
            React.createElement(
              "p",
              { className: "text-xs font-bold text-gray-800" },
              "Pop Culture, Cinema, World Sports, Tech & Gaming • Full LTR UI • Jackbox & Jeopardy Vibe • Apex Legends vs Night Owls"
            )
          ),
          React.createElement(
            "span",
            {
              className:
                "px-3.5 py-2 rounded-xl bg-black text-sunny font-black text-xs shrink-0 inline-flex items-center gap-1.5",
            },
            React.createElement(EditionFlagIcon, {
              edition: "EN",
              className: "w-4 h-3",
            }),
            React.createElement("span", null, "Play EN")
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
 * boardSize === 18, or 6 questions (two 200s, two 400s, two 600s) when boardSize === 36,
 * prioritizing unseen questions and using Fisher-Yates shuffle.
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
