// ============================================================================
// TRI-EDITION ARCHITECTURE CONSTANTS & SERVER-SAFE HELPERS
// (Pure TypeScript — no React components, safe for server routes & client)
// ============================================================================

import { PlayerSubmission } from "@/lib/gameEngine";

export type RegionCode = "MA" | "MENA" | "EN";
export type EditionRegion = RegionCode;
export type SeenJeemBoardSize = 18 | 36;
export type SeenJeemAnswerMode = "TYPING" | "BUZZER";

export interface EditionConfig {
  region: RegionCode;
  dir: "rtl" | "ltr";
  isEnglish: boolean;
  switcherLabel: string;
  flag: string;
  mainTitle: string;
  brandTitle: string;
  boardModeTitle: string;
  miniGamesModeTitle: string;
  miniGamesTitle: string;
  combinedModeTitle: string;
  hostActionLabel: string;
  hostCta: string;
  joinActionLabel: string;
  joinCta: string;
  doublePointsLabel: string;
  buzzInLabel: string;
  squadsLabel: string;
  hallOfFameLabel: string;
  partyTerm: string;
  gatheringPhrase: string;
  deviceTerm: string;
  currencyLabel: string;
  currencySymbol: string;
  partyPassPrice: string;
  proHostPrice: string;
  defaultTeam1Name: string;
  defaultTeam2Name: string;
  defaultTeam3Name: string;
  defaultTeam4Name: string;
  defaultPlayerPlaceholder: string;
  defaultHostPlaceholder: string;
  ticketName: string;
}

export const EDITIONS: Record<RegionCode, EditionConfig> = {
  MA: {
    region: "MA",
    dir: "rtl",
    isEnglish: false,
    switcherLabel: "النسخة المغربية",
    flag: "MA",
    mainTitle: "قَدْهَا؟ — منصة تحديات الگلسة والقصارة",
    brandTitle: "قَدْهَا؟ — منصة تحديات الگلسة والقصارة",
    boardModeTitle: "لوحة قَدْهَا؟ التفاعلية",
    miniGamesModeTitle: "تحديات قَدْهَا؟ الثمانية",
    miniGamesTitle: "تحديات قَدْهَا؟ الثمانية",
    combinedModeTitle: "الگلسة المدمجة (اللوحة + التحديات)",
    hostActionLabel: "افتح جلسة لعب (الگلسة / القصارة)",
    hostCta: "افتح جلسة لعب (الگلسة / القصارة)",
    joinActionLabel: "انضم بالتيليفون",
    joinCta: "انضم بالتيليفون",
    doublePointsLabel: "دبل x2 🔥",
    buzzInLabel: "🔔 اضغط للإجابة!",
    squadsLabel: "الفرق",
    hallOfFameLabel: "لوحة صدارة الشلة",
    partyTerm: "الگلسة / القصارة",
    gatheringPhrase: "للمّات مع العشران والعائلة",
    deviceTerm: "بالتيليفون",
    currencyLabel: "درهم مغربي (DH)",
    currencySymbol: "DH",
    partyPassPrice: "25 DH",
    proHostPrice: "70 DH",
    defaultTeam1Name: "أسود الأطلس",
    defaultTeam2Name: "القراصنة",
    defaultTeam3Name: "فرسان البوغاز",
    defaultTeam4Name: "صقور الصحراء",
    defaultPlayerPlaceholder: "مثال: أمين",
    defaultHostPlaceholder: "ياسين",
    ticketName: "تذكرة الگلسة",
  },
  MENA: {
    region: "MENA",
    dir: "rtl",
    isEnglish: false,
    switcherLabel: "النسخة العربية",
    flag: "MENA",
    mainTitle: "قَدْهَا؟ — منصة تحديات السهرة الجماعية",
    brandTitle: "قَدْهَا؟ — منصة تحديات السهرة الجماعية",
    boardModeTitle: "لوحة قَدْهَا؟ التفاعلية",
    miniGamesModeTitle: "تحديات قَدْهَا؟ الثمانية",
    miniGamesTitle: "تحديات قَدْهَا؟ الثمانية",
    combinedModeTitle: "السهرة المدمجة (اللوحة + التحديات)",
    hostActionLabel: "افتح جلسة لعب (السهرة)",
    hostCta: "افتح جلسة لعب (السهرة)",
    joinActionLabel: "انضم بالجوال",
    joinCta: "انضم بالجوال",
    doublePointsLabel: "دبل x2 🔥",
    buzzInLabel: "🔔 اضغط للإجابة!",
    squadsLabel: "الفرق",
    hallOfFameLabel: "لوحة صدارة الشلة",
    partyTerm: "السهرة",
    gatheringPhrase: "للجمعات مع الأصدقاء",
    deviceTerm: "بالجوال",
    currencyLabel: "دولار ($)",
    currencySymbol: "$",
    partyPassPrice: "$2.99",
    proHostPrice: "$7.99",
    defaultTeam1Name: "فريق الصقور",
    defaultTeam2Name: "فريق النمور",
    defaultTeam3Name: "فريق الذئاب",
    defaultTeam4Name: "فريق الفرسان",
    defaultPlayerPlaceholder: "مثال: عزوز",
    defaultHostPlaceholder: "سلطان",
    ticketName: "تذكرة السهرة",
  },
  EN: {
    region: "EN",
    dir: "ltr",
    isEnglish: true,
    switcherLabel: "English Edition",
    flag: "EN",
    mainTitle: "QADHA? — The Ultimate Party Game Show",
    brandTitle: "QADHA? — The Ultimate Party Game Show",
    boardModeTitle: "The Qadha Board (Jeopardy Style)",
    miniGamesModeTitle: "8 Party Showdowns",
    miniGamesTitle: "8 Party Showdowns",
    combinedModeTitle: "Mega Mix (Board + Showdowns)",
    hostActionLabel: "Host a Game Night",
    hostCta: "Host a Game Night",
    joinActionLabel: "Join with Phone",
    joinCta: "Join with Phone",
    doublePointsLabel: "Double Trouble x2 🔥",
    buzzInLabel: "🔔 Buzz In!",
    squadsLabel: "Squads",
    hallOfFameLabel: "Hall of Fame",
    partyTerm: "Game Night",
    gatheringPhrase: "for Friends & Squads",
    deviceTerm: "with Phone",
    currencyLabel: "USD ($)",
    currencySymbol: "$",
    partyPassPrice: "$2.99",
    proHostPrice: "$7.99",
    defaultTeam1Name: "Apex Legends",
    defaultTeam2Name: "Night Owls",
    defaultTeam3Name: "Desert Falcons",
    defaultTeam4Name: "Storm Knights",
    defaultPlayerPlaceholder: "e.g. Alex",
    defaultHostPlaceholder: "Jordan",
    ticketName: "24h Party Pass",
  },
};

export const REGION_STORAGE_KEY = "seen_jeem_region_edition_v1";
export const REGION_EVENT_NAME = "seen_jeem_region_changed";
export const ADAPTER_STORAGE_PREFIX = "seen_jeem_frontend_adapter_v1_";
export const ADAPTER_CHANNEL_NAME = "seen_jeem_adapter_channel_v1";

export const BUZZ_PREFIX = "__BUZZ__:";
export const BUZZER_MODE_MARKER = "__MODE_BUZZER__";

let currentRegionMemory: RegionCode = "MA";

export function isValidRegionCode(val: unknown): val is RegionCode {
  return val === "MA" || val === "MENA" || val === "EN";
}

export function hasSavedRegion(): boolean {
  if (typeof window === "undefined") return true;
  const saved = window.localStorage.getItem(REGION_STORAGE_KEY);
  return isValidRegionCode(saved);
}

export function getRegion(): RegionCode {
  if (typeof window === "undefined") return currentRegionMemory;
  try {
    const saved = window.localStorage.getItem(REGION_STORAGE_KEY);
    if (isValidRegionCode(saved)) {
      currentRegionMemory = saved;
      return saved;
    }
  } catch {
    // ignore
  }
  return "MA";
}

export const getEditionRegion = getRegion;

export function setRegion(nextRegion: RegionCode): void {
  currentRegionMemory = nextRegion;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REGION_STORAGE_KEY, nextRegion);
    window.dispatchEvent(
      new CustomEvent<RegionCode>(REGION_EVENT_NAME, { detail: nextRegion })
    );
    const bc = new BroadcastChannel(ADAPTER_CHANNEL_NAME);
    bc.postMessage({ type: "REGION_CHANGE", region: nextRegion });
    bc.close();
  } catch {
    // Ignore
  }
}

export function getEditionConfig(region?: RegionCode): EditionConfig {
  const target = region || getRegion();
  return EDITIONS[target] || EDITIONS.MA;
}

export const DEFAULT_TEAM_COLORS = {
  team1: "#3B66B4", // Royal Blue
  team2: "#E65C2E", // Burnt Orange
  team3: "#10B981", // Emerald Green
  team4: "#8B5CF6", // Purple
};

export function isDefaultTeamName(name: string): boolean {
  const trimmed = name.trim();
  return (
    trimmed === EDITIONS.MA.defaultTeam1Name ||
    trimmed === EDITIONS.MA.defaultTeam2Name ||
    trimmed === EDITIONS.MA.defaultTeam3Name ||
    trimmed === EDITIONS.MA.defaultTeam4Name ||
    trimmed === EDITIONS.MENA.defaultTeam1Name ||
    trimmed === EDITIONS.MENA.defaultTeam2Name ||
    trimmed === EDITIONS.MENA.defaultTeam3Name ||
    trimmed === EDITIONS.MENA.defaultTeam4Name ||
    trimmed === EDITIONS.EN.defaultTeam1Name ||
    trimmed === EDITIONS.EN.defaultTeam2Name ||
    trimmed === EDITIONS.EN.defaultTeam3Name ||
    trimmed === EDITIONS.EN.defaultTeam4Name
  );
}

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
