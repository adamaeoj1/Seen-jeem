"use client";

import React from "react";

export * from "@/lib/avatarData";
import {
  MOROCCAN_AVATAR_CHARACTERS,
  MoroccanAvatarCharacterId,
  normalizeMoroccanAvatarId,
} from "@/lib/avatarData";

interface MoroccanAvatarProps {
  avatarId?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showBorder?: boolean;
}

const SIZE_CLASSES: Record<
  NonNullable<MoroccanAvatarProps["size"]>,
  string
> = {
  xs: "w-7 h-7",
  sm: "w-9 h-9",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function MoroccanAvatar({
  avatarId,
  size = "md",
  className = "",
  showBorder = true,
}: MoroccanAvatarProps) {
  const id = normalizeMoroccanAvatarId(avatarId);
  const meta =
    MOROCCAN_AVATAR_CHARACTERS.find((c) => c.id === id) ||
    MOROCCAN_AVATAR_CHARACTERS[0];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${
        SIZE_CLASSES[size]
      } ${
        showBorder ? "border-2 border-black shadow-[2px_2px_0px_#000]" : ""
      } ${className}`}
      style={{ backgroundColor: meta.bgColor }}
      title={meta.nameAr}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle Moroccan Star / Geometric Backdrop */}
        <circle cx="50" cy="50" r="44" fill="white" fillOpacity="0.18" />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="#000"
          strokeOpacity="0.08"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* 1. Red Moroccan Tarbouche (طربوش مغربي) */}
        {id === "ma_tarbouche" && (
          <g>
            {/* Traditional White Jabador Collar & Shoulders */}
            <path
              d="M16 98C18 76 32 68 50 68C68 68 82 76 84 98"
              fill="#FFFDF7"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Gold Sfifa Embroidery on Jabador */}
            <path
              d="M46 68V98M54 68V98"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeDasharray="3 2"
            />
            <line
              x1="50"
              y1="68"
              x2="50"
              y2="98"
              stroke="#000"
              strokeWidth="2.5"
            />
            {/* Head */}
            <circle
              cx="50"
              cy="49"
              r="21"
              fill="#F3C39A"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Ears */}
            <circle
              cx="28"
              cy="50"
              r="4.5"
              fill="#F3C39A"
              stroke="#000"
              strokeWidth="3"
            />
            <circle
              cx="72"
              cy="50"
              r="4.5"
              fill="#F3C39A"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Expressive Eyebrows & Warm Eyes */}
            <path
              d="M37 42L45 44"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M63 42L55 44"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="41" cy="48" r="3.2" fill="#000" />
            <circle cx="59" cy="48" r="3.2" fill="#000" />
            <circle cx="42" cy="47" r="1" fill="#FFF" />
            <circle cx="60" cy="47" r="1" fill="#FFF" />
            {/* Classic Moroccan Mustache & Goatee */}
            <path
              d="M36 58C41 54 47 55 50 58C53 55 59 54 64 58"
              stroke="#1F2937"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M43 60C46 65 54 65 57 60"
              fill="#FFF"
              stroke="#000"
              strokeWidth="2.5"
            />
            <path
              d="M46 67C48 70 52 70 54 67"
              stroke="#1F2937"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Iconic Red Moroccan Tarbouche (Fez) */}
            <path
              d="M31 33L36 12H64L69 33H31Z"
              fill="#C1272D"
              stroke="#000"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            {/* Tarbouche Rim Highlight */}
            <path d="M30 33H70" stroke="#000" strokeWidth="4.5" strokeLinecap="round" />
            {/* Black Silk Tassel (الشرابة السوداء) */}
            <circle cx="50" cy="12" r="2.5" fill="#000" />
            <path
              d="M50 12C59 13 66 19 67 30"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M65 29L69 31L63 32Z"
              fill="#000"
            />
          </g>
        )}

        {/* 2. Traditional Hooded Jellaba (جلابة مغربية) */}
        {id === "ma_jellaba" && (
          <g>
            {/* Outer Hooded Jellaba Silhouette (القب المغربي) */}
            <path
              d="M14 98C15 68 24 55 24 44C24 22 35 11 50 11C65 11 76 22 76 44C76 55 85 68 86 98"
              fill="#006233"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Hood Point Tassel (شرابة القب) */}
            <circle
              cx="50"
              cy="9"
              r="3.5"
              fill="#FFD166"
              stroke="#000"
              strokeWidth="2.5"
            />
            {/* Inner Hood Shadow */}
            <path
              d="M28 46C28 28 37 19 50 19C63 19 72 28 72 46C72 60 64 68 50 68C36 68 28 60 28 46Z"
              fill="#064E3B"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Gold Sfifa & Aakad Down the Jellaba Chest */}
            <line
              x1="50"
              y1="68"
              x2="50"
              y2="98"
              stroke="#FFD166"
              strokeWidth="5"
            />
            <circle cx="50" cy="75" r="2" fill="#000" />
            <circle cx="50" cy="83" r="2" fill="#000" />
            <circle cx="50" cy="91" r="2" fill="#000" />
            {/* Face Inside Hood */}
            <circle
              cx="50"
              cy="47"
              r="18"
              fill="#F5CBA7"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Hair Fringe */}
            <path
              d="M34 40C38 32 62 32 66 40"
              stroke="#111827"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Bright Friendly Eyes */}
            <circle cx="43" cy="46" r="3" fill="#000" />
            <circle cx="57" cy="46" r="3" fill="#000" />
            <circle cx="44" cy="45" r="1" fill="#FFF" />
            <circle cx="58" cy="45" r="1" fill="#FFF" />
            {/* Rosy Cheeks & Warm Smile */}
            <circle cx="37" cy="52" r="3" fill="#F43F5E" fillOpacity="0.45" />
            <circle cx="63" cy="52" r="3" fill="#F43F5E" fillOpacity="0.45" />
            <path
              d="M43 54C46 59 54 59 57 54"
              stroke="#000"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 3. Atlas Lions Jersey Fan (قميص المنتخب) */}
        {id === "ma_atlas_lion" && (
          <g>
            {/* Morocco National Team Red Jersey with Green Collar & Trim */}
            <path
              d="M15 98C18 75 31 67 50 67C69 67 82 75 85 98"
              fill="#C1272D"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Green Chest Band & Collar */}
            <path
              d="M23 82H77"
              stroke="#006233"
              strokeWidth="6"
            />
            <path
              d="M38 67L50 77L62 67"
              stroke="#006233"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Gold Moroccan Pentagram Star on Jersey */}
            <polygon
              points="50,79 52,85 58,85 53,89 55,95 50,91 45,95 47,89 42,85 48,85"
              fill="#FFD166"
              stroke="#000"
              strokeWidth="1.5"
            />
            {/* Head */}
            <circle
              cx="50"
              cy="46"
              r="20"
              fill="#E5A97C"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Moroccan Flag Cheek Paint */}
            <rect
              x="33"
              y="49"
              width="7"
              height="4.5"
              rx="1"
              fill="#C1272D"
              stroke="#006233"
              strokeWidth="1.2"
            />
            <rect
              x="60"
              y="49"
              width="7"
              height="4.5"
              rx="1"
              fill="#C1272D"
              stroke="#006233"
              strokeWidth="1.2"
            />
            {/* Excited Supporter Headband (Red & Green) */}
            <rect
              x="29"
              y="29"
              width="42"
              height="8"
              rx="4"
              fill="#006233"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle cx="50" cy="33" r="2.5" fill="#FFD166" />
            {/* Spiky Hair */}
            <path
              d="M32 29C35 16 45 14 50 18C55 14 65 16 68 29"
              fill="#111827"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Eyes & Cheering Mouth */}
            <circle cx="42" cy="44" r="3.2" fill="#000" />
            <circle cx="58" cy="44" r="3.2" fill="#000" />
            <path
              d="M41 54H59C59 61 41 61 41 54Z"
              fill="#FFF"
              stroke="#000"
              strokeWidth="3"
            />
          </g>
        )}

        {/* 4. Modern Youth with Curly Hair & Glasses (شباب كازا) */}
        {id === "ma_curly_youth" && (
          <g>
            {/* Modern Street Hoodie */}
            <path
              d="M16 98C19 76 32 68 50 68C68 68 81 76 84 98"
              fill="#FFD166"
              stroke="#000"
              strokeWidth="4"
            />
            <path
              d="M42 68V88M58 68V88"
              stroke="#000"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Head */}
            <circle
              cx="50"
              cy="49"
              r="19"
              fill="#F1C27D"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Big Voluminous Moroccan Curly Hair Cloud */}
            <circle
              cx="34"
              cy="30"
              r="9"
              fill="#1F2937"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle
              cx="66"
              cy="30"
              r="9"
              fill="#1F2937"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle
              cx="42"
              cy="22"
              r="10"
              fill="#1F2937"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle
              cx="58"
              cy="22"
              r="10"
              fill="#1F2937"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle
              cx="50"
              cy="20"
              r="10"
              fill="#1F2937"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Curly Hair Spiral Highlights */}
            <path
              d="M45 20C47 18 50 20 48 22"
              stroke="#4B5563"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M56 22C58 20 61 22 59 24"
              stroke="#4B5563"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Trendy Round Glasses */}
            <circle
              cx="41"
              cy="47"
              r="7"
              fill="#FFF"
              fillOpacity="0.65"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle
              cx="59"
              cy="47"
              r="7"
              fill="#FFF"
              fillOpacity="0.65"
              stroke="#000"
              strokeWidth="3.5"
            />
            <line
              x1="48"
              y1="47"
              x2="52"
              y2="47"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle cx="41" cy="47" r="2.5" fill="#000" />
            <circle cx="59" cy="47" r="2.5" fill="#000" />
            {/* Confident Smirk */}
            <path
              d="M43 58C47 61 54 61 58 57"
              stroke="#000"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 5. Moroccan Caftan / Zellige Style (قفطان وزليج) */}
        {id === "ma_caftan_zellige" && (
          <g>
            {/* Flowing Hair */}
            <path
              d="M24 66C22 36 33 20 50 20C67 20 78 36 76 66"
              fill="#1E1B4B"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Royal Moroccan Caftan Shoulders */}
            <path
              d="M15 98C18 75 31 67 50 67C69 67 82 75 85 98"
              fill="#7E22CE"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Gold Mdamma Belt & Zellige Embroidery Pattern */}
            <path
              d="M36 67L50 82L64 67"
              stroke="#FFD166"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <polygon
              points="50,77 55,82 50,87 45,82"
              fill="#2ECC71"
              stroke="#000"
              strokeWidth="2"
            />
            <line
              x1="50"
              y1="87"
              x2="50"
              y2="98"
              stroke="#FFD166"
              strokeWidth="4"
            />
            {/* Head */}
            <circle
              cx="50"
              cy="47"
              r="19"
              fill="#F8CBA6"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Golden Moroccan Crown / Zellige Tiara */}
            <path
              d="M32 33L38 22L50 28L62 22L68 33H32Z"
              fill="#FFD166"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="28" r="2.8" fill="#10B981" stroke="#000" strokeWidth="1.5" />
            {/* Gold Drop Earrings */}
            <circle
              cx="29"
              cy="52"
              r="3.5"
              fill="#FFD166"
              stroke="#000"
              strokeWidth="2"
            />
            <circle
              cx="71"
              cy="52"
              r="3.5"
              fill="#FFD166"
              stroke="#000"
              strokeWidth="2"
            />
            {/* Eyes with Eyelashes & Warm Smile */}
            <circle cx="42" cy="46" r="3" fill="#000" />
            <circle cx="58" cy="46" r="3" fill="#000" />
            <path
              d="M43 56C46 60 54 60 57 56"
              stroke="#E11D48"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 6. Streetwear Gamer with Headphones (گيمر الحومة) */}
        {id === "ma_street_gamer" && (
          <g>
            {/* Streetwear Jacket */}
            <path
              d="M15 98C18 76 32 68 50 68C68 68 82 76 85 98"
              fill="#111827"
              stroke="#000"
              strokeWidth="4"
            />
            <path
              d="M36 68L50 86L64 68"
              fill="#2ECC71"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Headband Arc of Pro Gaming Headphones */}
            <path
              d="M22 48C22 25 34 15 50 15C66 15 78 25 78 48"
              stroke="#2ECC71"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M22 48C22 25 34 15 50 15C66 15 78 25 78 48"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Head */}
            <circle
              cx="50"
              cy="48"
              r="19"
              fill="#F1C27D"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Streetwear Cap Backwards */}
            <path
              d="M31 37C31 25 69 25 69 37H31Z"
              fill="#E65C2E"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Oversized Neon Ear Cups */}
            <rect
              x="17"
              y="38"
              width="11"
              height="20"
              rx="5"
              fill="#2ECC71"
              stroke="#000"
              strokeWidth="3.5"
            />
            <rect
              x="72"
              y="38"
              width="11"
              height="20"
              rx="5"
              fill="#2ECC71"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Boom Mic */}
            <path
              d="M24 55C28 63 36 64 43 61"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="44" cy="61" r="2.5" fill="#EF4444" stroke="#000" strokeWidth="1.5" />
            {/* Focused Gamer Eyes & Grin */}
            <circle cx="42" cy="46" r="3.2" fill="#000" />
            <circle cx="58" cy="46" r="3.2" fill="#000" />
            <path
              d="M43 55H57"
              stroke="#000"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 7. Amazigh Cultural Accessory Style (أمازيغية أصيلة) */}
        {id === "ma_amazigh_style" && (
          <g>
            {/* Traditional Draped Garment in Royal Blue & Saffron */}
            <path
              d="M15 98C18 75 31 67 50 67C69 67 82 75 85 98"
              fill="#2563EB"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Silver Fibula Brooches (تازرزيت أمازيغية) */}
            <polygon
              points="37,74 42,84 32,84"
              fill="#E5E7EB"
              stroke="#000"
              strokeWidth="2.5"
            />
            <polygon
              points="63,74 68,84 58,84"
              fill="#E5E7EB"
              stroke="#000"
              strokeWidth="2.5"
            />
            <path
              d="M37 84C44 90 56 90 63 84"
              stroke="#E5E7EB"
              strokeWidth="3"
              strokeDasharray="2 2"
            />
            {/* Head */}
            <circle
              cx="50"
              cy="48"
              r="19"
              fill="#F3C39A"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Amazigh Silver & Red Coral Headpiece (تاونزا / جبين فضي بالمرجان) */}
            <rect
              x="29"
              y="26"
              width="42"
              height="9"
              rx="4"
              fill="#E5E7EB"
              stroke="#000"
              strokeWidth="3.5"
            />
            {/* Coral & Turquoise Cabochons on Silver Crown */}
            <circle cx="37" cy="30.5" r="2.5" fill="#DC2626" stroke="#000" strokeWidth="1.2" />
            <circle cx="50" cy="30.5" r="3" fill="#10B981" stroke="#000" strokeWidth="1.2" />
            <circle cx="63" cy="30.5" r="2.5" fill="#DC2626" stroke="#000" strokeWidth="1.2" />
            {/* Hanging Silver Coins */}
            <circle cx="34" cy="38" r="2.2" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
            <circle cx="42" cy="38" r="2.2" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
            <circle cx="50" cy="39" r="2.5" fill="#FFD166" stroke="#000" strokeWidth="1.5" />
            <circle cx="58" cy="38" r="2.2" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
            <circle cx="66" cy="38" r="2.2" fill="#E5E7EB" stroke="#000" strokeWidth="1.5" />
            {/* Eyes & Warm Smile */}
            <circle cx="42" cy="48" r="3" fill="#000" />
            <circle cx="58" cy="48" r="3" fill="#000" />
            <path
              d="M43 57C46 61 54 61 57 57"
              stroke="#000"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Subtle Chin Heritage Motif */}
            <line
              x1="50"
              y1="61"
              x2="50"
              y2="65"
              stroke="#1D4ED8"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 8. Moroccan Atay Master Vibe (مول أتاي) */}
        {id === "ma_atay_master" && (
          <g>
            {/* Traditional Vest (بدعية مغربية) over White Shirt */}
            <path
              d="M15 98C18 75 31 67 50 67C69 67 82 75 85 98"
              fill="#B45309"
              stroke="#000"
              strokeWidth="4"
            />
            <path
              d="M38 67L50 92L62 67"
              fill="#FFFBEB"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Head */}
            <circle
              cx="50"
              cy="47"
              r="19"
              fill="#E5A97C"
              stroke="#000"
              strokeWidth="4"
            />
            {/* Embroidered Moroccan Tagelmust / Kufi Cap */}
            <path
              d="M30 35C31 20 69 20 70 35H30Z"
              fill="#FFFBEB"
              stroke="#000"
              strokeWidth="3.5"
            />
            <path
              d="M32 31H68"
              stroke="#10B981"
              strokeWidth="3"
              strokeDasharray="4 3"
            />
            {/* Happy Wink & Big Welcoming Mustache */}
            <path
              d="M38 45C40 42 44 42 46 45"
              stroke="#000"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <circle cx="58" cy="45" r="3.2" fill="#000" />
            <path
              d="M36 55C41 51 47 52 50 55C53 52 59 51 64 55"
              stroke="#1F2937"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M44 58C47 62 53 62 56 58"
              stroke="#000"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {/* Miniature Silver Berrad & Fresh Mint Leaf Badge on Corner */}
            <circle
              cx="77"
              cy="77"
              r="14"
              fill="#FFD166"
              stroke="#000"
              strokeWidth="3"
            />
            {/* Silver Teapot Icon */}
            <ellipse
              cx="77"
              cy="79"
              rx="6"
              ry="5"
              fill="#E5E7EB"
              stroke="#000"
              strokeWidth="2"
            />
            <path
              d="M77 71L74 74H80L77 71Z"
              fill="#E5E7EB"
              stroke="#000"
              strokeWidth="2"
            />
            <path
              d="M83 78L87 73"
              stroke="#000"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Mint Leaf */}
            <circle cx="71" cy="72" r="3" fill="#10B981" stroke="#000" strokeWidth="1.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
