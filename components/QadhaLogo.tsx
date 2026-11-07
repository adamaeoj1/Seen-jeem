"use client";

import React from "react";

export type FlagEditionCode = "MA" | "MENA" | "EN";

interface EditionFlagIconProps {
  edition: FlagEditionCode;
  className?: string;
}

/**
 * Crisp SVG Flag / Emblem icon that never renders broken "MA" letters on Windows browsers.
 * - MA: Official Moroccan Flag (#C1272D red field + #006233 green interlaced pentagram star)
 * - MENA: Stylized Arab League / Crescent-Globe vector emblem
 * - EN: Split UK/US + International Gamepad-Globe SVG badge
 */
export function EditionFlagIcon({
  edition,
  className = "w-6 h-4",
}: EditionFlagIconProps) {
  if (edition === "MA") {
    return (
      <svg
        viewBox="0 0 36 24"
        className={`inline-block shrink-0 rounded-[4px] border border-black/80 shadow-xs ${className}`}
        aria-label="Morocco Flag"
      >
        <rect width="36" height="24" fill="#C1272D" />
        {/* Interlaced Green Pentagram Star of Morocco */}
        <path
          d="M18 5.2 L19.65 10.3 H25.0 L20.68 13.45 L22.33 18.55 L18 15.4 L13.67 18.55 L15.32 13.45 L11.0 10.3 H16.35 Z"
          fill="none"
          stroke="#006233"
          strokeWidth="1.65"
          strokeLinejoin="miter"
        />
        <polygon
          points="18,6.4 20.9,15.3 13.3,9.8 22.7,9.8 15.1,15.3"
          fill="none"
          stroke="#006233"
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (edition === "MENA") {
    return (
      <svg
        viewBox="0 0 36 24"
        className={`inline-block shrink-0 rounded-[4px] border border-black/80 shadow-xs ${className}`}
        aria-label="MENA Arabic Edition Emblem"
      >
        <rect width="36" height="24" fill="#065F46" />
        {/* Subtle Globe Meridians */}
        <circle
          cx="18"
          cy="12"
          r="8.5"
          fill="#047857"
          stroke="#F4D03F"
          strokeWidth="1.3"
        />
        <ellipse
          cx="18"
          cy="12"
          rx="4.5"
          ry="8.5"
          fill="none"
          stroke="#F4D03F"
          strokeWidth="0.9"
          opacity="0.7"
        />
        <line
          x1="9.5"
          y1="12"
          x2="26.5"
          y2="12"
          stroke="#F4D03F"
          strokeWidth="0.9"
          opacity="0.7"
        />
        {/* Golden Crescent Accent */}
        <path
          d="M19.5 7.5 A4.5 4.5 0 1 0 19.5 16.5 A3.5 3.5 0 1 1 19.5 7.5 Z"
          fill="#F4D03F"
        />
      </svg>
    );
  }

  // EN: Split US/UK + International Gamepad Star Badge
  return (
    <svg
      viewBox="0 0 36 24"
      className={`inline-block shrink-0 rounded-[4px] border border-black/80 shadow-xs ${className}`}
      aria-label="International English Edition Flag"
    >
      {/* Navy Background */}
      <rect width="36" height="24" fill="#1E3A8A" />
      {/* Left half: US Stripes + Canton */}
      <g>
        <rect x="0" y="0" width="18" height="3.4" fill="#DC2626" />
        <rect x="0" y="3.4" width="18" height="3.4" fill="#FFFFFF" />
        <rect x="0" y="6.8" width="18" height="3.4" fill="#DC2626" />
        <rect x="0" y="10.2" width="18" height="3.4" fill="#FFFFFF" />
        <rect x="0" y="13.6" width="18" height="3.4" fill="#DC2626" />
        <rect x="0" y="17.0" width="18" height="3.4" fill="#FFFFFF" />
        <rect x="0" y="20.4" width="18" height="3.6" fill="#DC2626" />
        <rect x="0" y="0" width="10" height="11" fill="#1E3A8A" />
        <circle cx="3" cy="3" r="1" fill="#FFF" />
        <circle cx="7" cy="3" r="1" fill="#FFF" />
        <circle cx="5" cy="5.5" r="1" fill="#FFF" />
        <circle cx="3" cy="8" r="1" fill="#FFF" />
        <circle cx="7" cy="8" r="1" fill="#FFF" />
      </g>
      {/* Right half: UK Union Jack stylized cross */}
      <g>
        <rect x="18" y="0" width="18" height="24" fill="#1E3A8A" />
        <path
          d="M18 0 L36 24 M36 0 L18 24"
          stroke="#FFFFFF"
          strokeWidth="3.2"
        />
        <path
          d="M18 0 L36 24 M36 0 L18 24"
          stroke="#DC2626"
          strokeWidth="1.4"
        />
        <rect x="25" y="0" width="4" height="24" fill="#FFFFFF" />
        <rect x="18" y="10" width="18" height="4" fill="#FFFFFF" />
        <rect x="25.8" y="0" width="2.4" height="24" fill="#DC2626" />
        <rect x="18" y="10.8" width="18" height="2.4" fill="#DC2626" />
      </g>
      {/* Center Divider Line */}
      <line x1="18" y1="0" x2="18" y2="24" stroke="#000" strokeWidth="1.2" />
    </svg>
  );
}

interface QadhaLogoProps {
  edition?: FlagEditionCode;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  darkText?: boolean;
  className?: string;
}

/**
 * Custom Neo-Brutalist Gaming Brand Logo for «قَدْهَا؟ / QADHA?»
 * Features a tilted dynamic lightning-shield badge, crown/spark accent, and glowing question mark.
 */
export function QadhaLogo({
  edition = "MA",
  size = "md",
  showWordmark = false,
  darkText = true,
  className = "",
}: QadhaLogoProps) {
  const isEn = edition === "EN";

  const badgeDimensions =
    size === "sm"
      ? "w-10 h-10"
      : size === "lg"
      ? "w-16 h-16"
      : "w-12 h-12";

  const wordmarkSize =
    size === "sm"
      ? "text-lg md:text-xl"
      : size === "lg"
      ? "text-2xl md:text-4xl"
      : "text-xl md:text-2xl";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Neo-Brutalist Tilted Shield & Lightning Emblem */}
      <div
        className={`relative ${badgeDimensions} shrink-0 -rotate-3 hover:rotate-0 transition-transform duration-200`}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-[3px_3px_0px_#000000]"
          aria-label={isEn ? "QADHA? Logo" : "شعار قدها؟"}
        >
          {/* Outer Brutalist Shield Base */}
          <path
            d="M10 8 H54 A6 6 0 0 1 60 14 V36 C60 49 32 59 32 59 C32 59 4 49 4 36 V14 A6 6 0 0 1 10 8 Z"
            fill="#F4D03F"
            stroke="#000000"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />

          {/* Inner Royal Accent Slash */}
          <path
            d="M12 12 H48 L34 52 C22 47 10 40 10 34 V14 A2 2 0 0 1 12 12 Z"
            fill="#FFE566"
          />

          {/* Top Crown / Sparkle Accent */}
          <polygon
            points="22,6 27,1 32,6 37,1 42,6 40,12 24,12"
            fill="#E65C2E"
            stroke="#000000"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Lightning Bolt Accent on Side */}
          <polygon
            points="49,13 41,26 47,26 40,39 54,23 47,23"
            fill="#3B66B4"
            stroke="#000000"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Bold Emblem Character: "ق؟" for Arabic or "Q?" for English */}
          {isEn ? (
            <g>
              <text
                x="28"
                y="43"
                textAnchor="middle"
                fill="#000000"
                className="font-mono font-black"
                 fontSize="26"
                fontWeight="900"
              >
                Q?
              </text>
            </g>
          ) : (
            <g>
              <text
                x="29"
                y="43"
                textAnchor="middle"
                fill="#000000"
                fontSize="25"
                fontWeight="900"
                style={{ fontFamily: "Cairo, sans-serif" }}
              >
                ق؟
              </text>
            </g>
          )}

          {/* Corner Star Spark */}
          <circle
            cx="15"
            cy="19"
            r="3"
            fill="#2ECC71"
            stroke="#000000"
            strokeWidth="2"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`${wordmarkSize} font-black tracking-tight leading-none ${
                darkText ? "text-black" : "text-white"
              }`}
            >
              {isEn ? "QADHA?" : "قَدْهَا؟"}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-black text-sunny font-mono text-[10px] font-black tracking-wider border border-sunny/40">
              {isEn ? "PARTY SHOW" : "QADHA"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
