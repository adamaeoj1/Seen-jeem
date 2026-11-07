// ============================================================================
// AVATAR DATA & NORMALIZERS (PURE TYPESCRIPT — ZERO CLIENT HOOKS / REACT)
// Safe for Route Handlers, Server Components, and Client Components alike.
// ============================================================================

import { EditionRegion } from "@/lib/editionConstants";

export type MoroccanAvatarCharacterId =
  | "ma_tarbouche"
  | "ma_jellaba"
  | "ma_atlas_lion"
  | "ma_curly_youth"
  | "ma_caftan_zellige"
  | "ma_street_gamer"
  | "ma_amazigh_style"
  | "ma_atay_master";

export interface MoroccanAvatarCharacterMeta {
  id: MoroccanAvatarCharacterId;
  nameAr: string;
  taglineAr: string;
  bgColor: string;
  accentColor: string;
}

export const MOROCCAN_AVATAR_CHARACTERS: MoroccanAvatarCharacterMeta[] = [
  {
    id: "ma_tarbouche",
    nameAr: "مولاي الطربوش",
    taglineAr: "طربوش مغربي أحمر أصيل بالشرابة السوداء",
    bgColor: "#FFD166",
    accentColor: "#C1272D",
  },
  {
    id: "ma_jellaba",
    nameAr: "أصالة الجلابة",
    taglineAr: "جلابة مغربية تقليدية بالقب والسفيفة",
    bgColor: "#2ECC71",
    accentColor: "#006233",
  },
  {
    id: "ma_atlas_lion",
    nameAr: "مشجع الأسود",
    taglineAr: "قميص المنتخب المغربي وحماس دونور",
    bgColor: "#C1272D",
    accentColor: "#006233",
  },
  {
    id: "ma_curly_youth",
    nameAr: "شباب كازا",
    taglineAr: "شعر كيرلي عصري ونظارات أنيقة",
    bgColor: "#3B66B4",
    accentColor: "#FFD166",
  },
  {
    id: "ma_caftan_zellige",
    nameAr: "قفطان وزليج",
    taglineAr: "قفطان مغربي فاخر بلمسة الزليج البلدي",
    bgColor: "#DE7A7A",
    accentColor: "#9333EA",
  },
  {
    id: "ma_street_gamer",
    nameAr: "گيمر الحومة",
    taglineAr: "ستريت وير مغربي مع سماعات احترافية",
    bgColor: "#9333EA",
    accentColor: "#2ECC71",
  },
  {
    id: "ma_amazigh_style",
    nameAr: "أمازيغية أصيلة",
    taglineAr: "حلي الفضة الأمازيغية والمرجان وتيفيناغ",
    bgColor: "#F59E0B",
    accentColor: "#2563EB",
  },
  {
    id: "ma_atay_master",
    nameAr: "مول أتاي",
    taglineAr: "خبير البراد المغربي المشحر بالنعناع",
    bgColor: "#10B981",
    accentColor: "#E65C2E",
  },
];

const MENA_TO_MOROCCAN_MAP: Record<string, MoroccanAvatarCharacterId> = {
  abu_sultan: "ma_tarbouche",
  nourah_pop: "ma_caftan_zellige",
  faisal_gamer: "ma_street_gamer",
  reem_artist: "ma_amazigh_style",
  ammo_hamad: "ma_atay_master",
  sara_spark: "ma_jellaba",
  aziz_shabab: "ma_atlas_lion",
  lama_queen: "ma_curly_youth",
};

const LEGACY_EMOJI_TO_MOROCCAN: Record<string, MoroccanAvatarCharacterId> = {
  "🦅": "ma_tarbouche",
  "🐯": "ma_atlas_lion",
  "🦊": "ma_street_gamer",
  "🦁": "ma_atlas_lion",
  "🐼": "ma_caftan_zellige",
  "🐙": "ma_amazigh_style",
  "🦉": "ma_atay_master",
  "🦄": "ma_jellaba",
  "🐝": "ma_curly_youth",
  "🦖": "ma_street_gamer",
  "🚀": "ma_atlas_lion",
  "⚡": "ma_curly_youth",
};

const MOROCCAN_ALIAS_MAP: Record<string, MoroccanAvatarCharacterId> = {
  "ma-tarbouche": "ma_tarbouche",
  "ma-jellaba": "ma_jellaba",
  "ma-atlas": "ma_atlas_lion",
  "ma-atlas-lion": "ma_atlas_lion",
  "ma_atlas_fan": "ma_atlas_lion",
  "ma-curly": "ma_curly_youth",
  "ma-curly-youth": "ma_curly_youth",
  "ma_curly_glasses": "ma_curly_youth",
  "ma-caftan": "ma_caftan_zellige",
  "ma-caftan-zellige": "ma_caftan_zellige",
  "ma-gamer": "ma_street_gamer",
  "ma_gamer": "ma_street_gamer",
  "ma-street-gamer": "ma_street_gamer",
  "ma-amazigh": "ma_amazigh_style",
  "ma-amazigh-style": "ma_amazigh_style",
  "ma_amazigh_crown": "ma_amazigh_style",
  "ma-atay": "ma_atay_master",
  "ma-atay-master": "ma_atay_master",
};

export function isMoroccanAvatarString(raw?: string | null): boolean {
  if (!raw) return false;
  const clean = raw.trim();
  return (
    clean.startsWith("ma_") ||
    clean.startsWith("ma-") ||
    Boolean(MOROCCAN_ALIAS_MAP[clean]) ||
    MOROCCAN_AVATAR_CHARACTERS.some((c) => c.id === clean)
  );
}

export function normalizeMoroccanAvatarId(
  raw?: string | null
): MoroccanAvatarCharacterId {
  if (!raw) return "ma_tarbouche";
  const clean = raw.trim();
  const underscored = clean.replace(/-/g, "_");
  const found = MOROCCAN_AVATAR_CHARACTERS.find(
    (c) => c.id === clean || c.id === underscored
  );
  if (found) return found.id;
  if (MOROCCAN_ALIAS_MAP[clean]) return MOROCCAN_ALIAS_MAP[clean];
  if (MOROCCAN_ALIAS_MAP[underscored]) return MOROCCAN_ALIAS_MAP[underscored];
  if (MENA_TO_MOROCCAN_MAP[clean]) return MENA_TO_MOROCCAN_MAP[clean];
  if (LEGACY_EMOJI_TO_MOROCCAN[clean]) return LEGACY_EMOJI_TO_MOROCCAN[clean];

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  }
  return MOROCCAN_AVATAR_CHARACTERS[hash % MOROCCAN_AVATAR_CHARACTERS.length].id;
}

export type MenaAvatarCharacterId =
  | "abu_sultan"
  | "nourah_pop"
  | "faisal_gamer"
  | "reem_artist"
  | "ammo_hamad"
  | "sara_spark"
  | "aziz_shabab"
  | "lama_queen";

export type AvatarCharacterId =
  | MenaAvatarCharacterId
  | MoroccanAvatarCharacterId;

export interface AvatarCharacterMeta {
  id: AvatarCharacterId;
  nameAr: string;
  vibeAr: string;
  bgColor: string;
}

export const AVATAR_CHARACTERS: AvatarCharacterMeta[] = [
  {
    id: "abu_sultan",
    nameAr: "أبو سلطان",
    vibeAr: "غترة ونظارة شمسية",
    bgColor: "#F4D03F",
  },
  {
    id: "nourah_pop",
    nameAr: "نورة",
    vibeAr: "نظارة دائرية وذكاء حاد",
    bgColor: "#DE7A7A",
  },
  {
    id: "faisal_gamer",
    nameAr: "فيصل",
    vibeAr: "سماعة محترفين وسرعة",
    bgColor: "#3B66B4",
  },
  {
    id: "reem_artist",
    nameAr: "ريم",
    vibeAr: "قبعة فنانة وإبداع",
    bgColor: "#2ECC71",
  },
  {
    id: "ammo_hamad",
    nameAr: "عمو حمد",
    vibeAr: "شنب هيبة وخبرة تاريخية",
    bgColor: "#E65C2E",
  },
  {
    id: "sara_spark",
    nameAr: "سارة",
    vibeAr: "بديهة خاطفة وتركيز",
    bgColor: "#F4D03F",
  },
  {
    id: "aziz_shabab",
    nameAr: "عزوز",
    vibeAr: "كاب مقلوب وروح مرحة",
    bgColor: "#60A5FA",
  },
  {
    id: "lama_queen",
    nameAr: "لمى",
    vibeAr: "تاج الصدارة وثقة",
    bgColor: "#F472B6",
  },
];

export const MOROCCAN_AVATAR_CHARACTER_LIST: AvatarCharacterMeta[] =
  MOROCCAN_AVATAR_CHARACTERS.map((m) => ({
    id: m.id,
    nameAr: m.nameAr,
    vibeAr: m.taglineAr,
    bgColor: m.bgColor,
  }));

export function getRegionalAvatarCharacters(
  region: EditionRegion
): AvatarCharacterMeta[] {
  return region === "MA" ? MOROCCAN_AVATAR_CHARACTER_LIST : AVATAR_CHARACTERS;
}

const MOROCCAN_TO_MENA_MAP: Record<
  MoroccanAvatarCharacterId,
  MenaAvatarCharacterId
> = {
  ma_tarbouche: "abu_sultan",
  ma_jellaba: "sara_spark",
  ma_atlas_lion: "aziz_shabab",
  ma_curly_youth: "lama_queen",
  ma_caftan_zellige: "nourah_pop",
  ma_street_gamer: "faisal_gamer",
  ma_amazigh_style: "reem_artist",
  ma_atay_master: "ammo_hamad",
};

export function normalizeMenaAvatarId(raw?: string): MenaAvatarCharacterId {
  if (!raw) return "abu_sultan";
  const valid = AVATAR_CHARACTERS.find((c) => c.id === raw);
  if (valid) return valid.id as MenaAvatarCharacterId;
  if (raw in MOROCCAN_TO_MENA_MAP) {
    return MOROCCAN_TO_MENA_MAP[raw as MoroccanAvatarCharacterId];
  }
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash + raw.charCodeAt(i)) % AVATAR_CHARACTERS.length;
  }
  return AVATAR_CHARACTERS[hash].id as MenaAvatarCharacterId;
}

export function normalizeAvatarId(
  raw?: string,
  preferredRegion?: EditionRegion
): AvatarCharacterId {
  if (!raw) {
    return preferredRegion === "MA" ? "ma_tarbouche" : "abu_sultan";
  }
  if (isMoroccanAvatarString(raw)) {
    return normalizeMoroccanAvatarId(raw);
  }
  const validMena = AVATAR_CHARACTERS.find((c) => c.id === raw);
  if (validMena) return validMena.id as MenaAvatarCharacterId;
  if (preferredRegion === "MA") {
    return normalizeMoroccanAvatarId(raw);
  }
  return normalizeMenaAvatarId(raw);
}
