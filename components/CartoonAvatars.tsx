import React from "react";

export type AvatarCharacterId =
  | "abu_sultan"
  | "nourah_pop"
  | "faisal_gamer"
  | "reem_artist"
  | "ammo_hamad"
  | "sara_spark"
  | "aziz_shabab"
  | "lama_queen";

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

export function normalizeAvatarId(raw?: string): AvatarCharacterId {
  if (!raw) return "abu_sultan";
  const valid = AVATAR_CHARACTERS.find((c) => c.id === raw);
  if (valid) return valid.id;
  // Map any legacy string deterministically to one of the 8 characters
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash + raw.charCodeAt(i)) % AVATAR_CHARACTERS.length;
  }
  return AVATAR_CHARACTERS[hash].id;
}

interface CartoonAvatarProps {
  avatarId?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<CartoonAvatarProps["size"]>, string> = {
  xs: "w-7 h-7",
  sm: "w-9 h-9",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-20 h-20",
};

export function CartoonAvatar({
  avatarId,
  size = "md",
  className = "",
}: CartoonAvatarProps) {
  const id = normalizeAvatarId(avatarId);
  const meta =
    AVATAR_CHARACTERS.find((c) => c.id === id) || AVATAR_CHARACTERS[0];

  return (
    <div
      className={`relative rounded-full border-2 border-black overflow-hidden shrink-0 select-none shadow-brutal-sm ${SIZE_CLASSES[size]} ${className}`}
      style={{ backgroundColor: meta.bgColor }}
      title={meta.nameAr}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full block">
        {/* 1. ABU SULTAN: White Ghutra + Black Egal + Cool Wayfarer Sunglasses + Goatee */}
        {id === "abu_sultan" && (
          <g>
            {/* Ghutra drape */}
            <path
              d="M14 98 C14 55, 22 20, 50 20 C78 20, 86 55, 86 98 Z"
              fill="#FFFFFF"
              stroke="#000"
              strokeWidth="4.5"
            />
            {/* Face */}
            <circle
              cx="50"
              cy="56"
              r="23"
              fill="#F3C69F"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Black Egal (Double cord) */}
            <rect
              x="24"
              y="22"
              width="52"
              height="8"
              rx="4"
              fill="#111827"
              stroke="#000"
              strokeWidth="3.5"
            />
            <rect
              x="26"
              y="30"
              width="48"
              height="7"
              rx="3.5"
              fill="#1F2937"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Sunglasses */}
            <rect
              x="31"
              y="46"
              width="16"
              height="11"
              rx="3"
              fill="#111827"
              stroke="#000"
              strokeWidth="3.5"
            />
            <rect
              x="53"
              y="46"
              width="16"
              height="11"
              rx="3"
              fill="#111827"
              stroke="#000"
              strokeWidth="3.5"
            />
            <line
              x1="47"
              y1="50"
              x2="53"
              y2="50"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Lens shine */}
            <line
              x1="34"
              y1="49"
              x2="39"
              y2="54"
              stroke="#60A5FA"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="56"
              y1="49"
              x2="61"
              y2="54"
              stroke="#60A5FA"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Mustache & Confident Smile */}
            <path
              d="M39 66 Q50 61 61 66"
              stroke="#111827"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M43 70 Q50 76 57 70"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* 2. NOURAH POP: Stylish Headscarf + Oversized Round Glasses + Expressive Smile */}
        {id === "nourah_pop" && (
          <g>
            {/* Headscarf outer */}
            <path
              d="M15 98 C14 48, 24 18, 50 18 C76 18, 86 48, 85 98 Z"
              fill="#1E293B"
              stroke="#000"
              strokeWidth="4.5"
            />
            {/* Accent band */}
            <path
              d="M25 34 Q50 22 75 34"
              stroke="#F4D03F"
              strokeWidth="6"
              fill="none"
            />
            {/* Face */}
            <circle
              cx="50"
              cy="55"
              r="22"
              fill="#F5CBA7"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Oversized Round Pop-Art Glasses */}
            <circle
              cx="40"
              cy="52"
              r="9"
              fill="#FFF9E6"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle
              cx="60"
              cy="52"
              r="9"
              fill="#FFF9E6"
              stroke="#000"
              strokeWidth="3.5"
            />
            <line
              x1="49"
              y1="52"
              x2="51"
              y2="52"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Pupils */}
            <circle cx="41" cy="52" r="3.5" fill="#000" />
            <circle cx="61" cy="52" r="3.5" fill="#000" />
            <circle cx="42.5" cy="50.5" r="1.2" fill="#FFF" />
            <circle cx="62.5" cy="50.5" r="1.2" fill="#FFF" />
            {/* Rosy cheeks & Smile */}
            <circle cx="33" cy="62" r="3.5" fill="#F472B6" opacity="0.7" />
            <circle cx="67" cy="62" r="3.5" fill="#F472B6" opacity="0.7" />
            <path
              d="M43 66 Q50 73 57 66"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* 3. FAISAL GAMER: Curly Hair + Pro Gaming Headset + Mic + Excited Grin */}
        {id === "faisal_gamer" && (
          <g>
            {/* Shoulders */}
            <path
              d="M18 98 Q50 76 82 98 Z"
              fill="#E65C2E"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Headset Arch */}
            <path
              d="M20 55 A30 30 0 0 1 80 55"
              stroke="#F4D03F"
              strokeWidth="7"
              fill="none"
            />
            <path
              d="M20 55 A30 30 0 0 1 80 55"
              stroke="#000"
              strokeWidth="3"
              fill="none"
            />
            {/* Face */}
            <circle
              cx="50"
              cy="56"
              r="22"
              fill="#EAB68C"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Curly Top Hair */}
            <circle
              cx="38"
              cy="32"
              r="9"
              fill="#111827"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle
              cx="50"
              cy="29"
              r="10"
              fill="#111827"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle
              cx="62"
              cy="32"
              r="9"
              fill="#111827"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Ear Cups */}
            <rect
              x="16"
              y="45"
              width="11"
              height="20"
              rx="5"
              fill="#2ECC71"
              stroke="#000"
              strokeWidth="3.5"
            />
            <rect
              x="73"
              y="45"
              width="11"
              height="20"
              rx="5"
              fill="#2ECC71"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Eyes */}
            <circle cx="41" cy="53" r="3.8" fill="#000" />
            <circle cx="59" cy="53" r="3.8" fill="#000" />
            {/* Eyebrows */}
            <path
              d="M35 46 L45 48"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M65 46 L55 48"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Big Grin */}
            <path
              d="M41 64 Q50 74 59 64 Z"
              fill="#FFFFFF"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Boom Mic */}
            <path
              d="M22 62 Q32 75 44 72"
              stroke="#000"
              strokeWidth="3.5"
              fill="none"
            />
            <circle cx="45" cy="72" r="3" fill="#EF4444" stroke="#000" strokeWidth="2" />
          </g>
        )}

        {/* 4. REEM ARTIST: Red Pop-Art Beret + Wavy Hair + Star Earrings */}
        {id === "reem_artist" && (
          <g>
            {/* Wavy hair background */}
            <path
              d="M20 96 C18 48, 28 30, 50 30 C72 30, 82 48, 80 96 Z"
              fill="#111827"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Face */}
            <circle
              cx="50"
              cy="57"
              r="21"
              fill="#F8D5B8"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Artist Beret */}
            <ellipse
              cx="53"
              cy="31"
              rx="26"
              ry="11"
              transform="rotate(-10 53 31)"
              fill="#E65C2E"
              stroke="#000"
              strokeWidth="4"
            />
            <line
              x1="52"
              y1="16"
              x2="54"
              y2="21"
              stroke="#000"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Expressive Eyes with Lashes */}
            <circle cx="41" cy="54" r="3.8" fill="#000" />
            <circle cx="59" cy="54" r="3.8" fill="#000" />
            <line x1="36" y1="50" x2="39" y2="52" stroke="#000" strokeWidth="2.5" />
            <line x1="64" y1="50" x2="61" y2="52" stroke="#000" strokeWidth="2.5" />
            {/* Star Earrings */}
            <circle cx="27" cy="63" r="4" fill="#F4D03F" stroke="#000" strokeWidth="2.5" />
            <circle cx="73" cy="63" r="4" fill="#F4D03F" stroke="#000" strokeWidth="2.5" />
            {/* Smile */}
            <path
              d="M43 66 Q50 72 57 66"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* 5. AMMO HAMAD: Embroidered Taqiyah + Thick Handlebar Mustache + Half-Moon Glasses */}
        {id === "ammo_hamad" && (
          <g>
            {/* Thobe Shoulders */}
            <path
              d="M16 98 Q50 75 84 98 Z"
              fill="#FFF9E6"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Face */}
            <circle
              cx="50"
              cy="56"
              r="22"
              fill="#E5B287"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Patterned Taqiyah Cap */}
            <path
              d="M28 42 C28 22, 72 22, 72 42 Z"
              fill="#FFFFFF"
              stroke="#000"
              strokeWidth="4"
            />
            <line
              x1="31"
              y1="36"
              x2="69"
              y2="36"
              stroke="#3B66B4"
              strokeWidth="3.5"
              strokeDasharray="4 3"
            />
            {/* Bushy White/Salt-and-Pepper Eyebrows */}
            <rect
              x="34"
              y="44"
              width="12"
              height="4.5"
              rx="2"
              fill="#374151"
              stroke="#000"
              strokeWidth="2"
            />
            <rect
              x="54"
              y="44"
              width="12"
              height="4.5"
              rx="2"
              fill="#374151"
              stroke="#000"
              strokeWidth="2"
            />
            {/* Eyes */}
            <circle cx="40" cy="53" r="3.5" fill="#000" />
            <circle cx="60" cy="53" r="3.5" fill="#000" />
            {/* Iconic Big Handlebar Mustache */}
            <path
              d="M31 66 Q40 58 50 64 Q60 58 69 66 Q62 72 50 67 Q38 72 31 66 Z"
              fill="#1F2937"
              stroke="#000"
              strokeWidth="3.5"
            />
          </g>
        )}

        {/* 6. SARA SPARK: High Bun + Lightning Hair Clips + Wide Winking Look */}
        {id === "sara_spark" && (
          <g>
            {/* High Hair Bun */}
            <circle
              cx="50"
              cy="20"
              r="13"
              fill="#111827"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Ribbon */}
            <rect
              x="38"
              y="26"
              width="24"
              height="7"
              rx="3"
              fill="#DE7A7A"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Face */}
            <circle
              cx="50"
              cy="57"
              r="22"
              fill="#F7D1B2"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Bangs */}
            <path
              d="M28 52 C30 34, 70 34, 72 52 C62 42, 38 42, 28 52 Z"
              fill="#111827"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Left Eye Open, Right Eye Wink */}
            <circle cx="40" cy="55" r="4" fill="#000" />
            <circle cx="41.5" cy="53.5" r="1.4" fill="#FFF" />
            <path
              d="M55 55 Q60 50 65 55"
              stroke="#000"
              strokeWidth="3.8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Big Joyful Smile */}
            <path
              d="M42 65 Q50 74 58 65 Z"
              fill="#EF4444"
              stroke="#000"
              strokeWidth="3.2"
            />
          </g>
        )}

        {/* 7. AZIZ SHABAB: Backwards Streetwear Cap + Smirk */}
        {id === "aziz_shabab" && (
          <g>
            {/* Hoodie */}
            <path
              d="M16 98 Q50 74 84 98 Z"
              fill="#F4D03F"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Backwards Cap Visor sticking out to the right */}
            <rect
              x="62"
              y="33"
              width="24"
              height="9"
              rx="4"
              fill="#111827"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Face */}
            <circle
              cx="48"
              cy="56"
              r="22"
              fill="#ECC09B"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Cap Dome */}
            <path
              d="M26 45 C26 23, 70 23, 70 45 Z"
              fill="#E65C2E"
              stroke="#000"
              strokeWidth="4"
            />
            <rect
              x="42"
              y="36"
              width="14"
              height="6"
              rx="3"
              fill="#FFF9E6"
              stroke="#000"
              strokeWidth="2.5"
            />
            {/* Eyes */}
            <circle cx="39" cy="54" r="3.6" fill="#000" />
            <circle cx="57" cy="54" r="3.6" fill="#000" />
            {/* Cheeky Side Smirk */}
            <path
              d="M40 66 Q52 70 59 62"
              stroke="#000"
              strokeWidth="3.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* 8. LAMA QUEEN: Royal Hijab + Golden Mini Crown + Confident Look */}
        {id === "lama_queen" && (
          <g>
            {/* Hijab drape */}
            <path
              d="M16 98 C15 50, 25 24, 50 24 C75 24, 85 50, 84 98 Z"
              fill="#3B66B4"
              stroke="#000"
              strokeWidth="4.5"
            />
            {/* Golden Crown */}
            <polygon
              points="33,28 37,13 45,22 50,11 55,22 63,13 67,28"
              fill="#F4D03F"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Face */}
            <circle
              cx="50"
              cy="57"
              r="21"
              fill="#F6D0B1"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Eyes */}
            <circle cx="41" cy="54" r="3.8" fill="#000" />
            <circle cx="59" cy="54" r="3.8" fill="#000" />
            <circle cx="42.2" cy="52.8" r="1.3" fill="#FFF" />
            <circle cx="60.2" cy="52.8" r="1.3" fill="#FFF" />
            {/* Confident Smile */}
            <path
              d="M42 66 Q50 72 58 66"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
