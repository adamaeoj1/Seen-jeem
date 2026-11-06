"use client";

import React from "react";

interface ProductArtworkProps {
  type: "vision_pro" | "ps5_pro" | "dyson" | "espresso" | "watch" | "smart_glasses";
}

export function ProductArtwork({ type }: ProductArtworkProps) {
  return (
    <div className="w-full h-52 bg-cream border-4 border-black rounded-2xl shadow-brutal flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-sunny/50 border-2 border-black" />
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-coral/40 border-2 border-black" />

      {type === "vision_pro" && (
        <svg viewBox="0 0 320 180" className="w-full h-full max-h-44">
          {/* Strap */}
          <path
            d="M40 90 C10 60, 10 120, 40 90 M280 90 C310 60, 310 120, 280 90"
            stroke="#000"
            strokeWidth="8"
            fill="none"
          />
          <rect
            x="45"
            y="45"
            width="230"
            height="92"
            rx="46"
            fill="#E5E7EB"
            stroke="#000"
            strokeWidth="6"
          />
          <rect
            x="58"
            y="54"
            width="204"
            height="74"
            rx="36"
            fill="#1F2937"
            stroke="#000"
            strokeWidth="5"
          />
          {/* Nose indent */}
          <path
            d="M140 128 Q160 102 180 128"
            fill="#FFF9E6"
            stroke="#000"
            strokeWidth="5"
          />
          {/* Glass reflection */}
          <path
            d="M80 70 Q160 58 240 70"
            stroke="#60A5FA"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="95" cy="92" r="14" fill="#3B66B4" opacity="0.7" />
          <circle cx="225" cy="92" r="14" fill="#DE7A7A" opacity="0.7" />
        </svg>
      )}

      {type === "ps5_pro" && (
        <svg viewBox="0 0 320 180" className="w-full h-full max-h-44">
          {/* Console tower */}
          <path
            d="M115 15 L195 22 L190 165 L110 165 Z"
            fill="#FFFFFF"
            stroke="#000"
            strokeWidth="6"
          />
          <rect x="132" y="18" width="42" height="147" fill="#111827" stroke="#000" strokeWidth="4" />
          {/* 3 Pro black stripes */}
          <line x1="110" y1="82" x2="195" y2="82" stroke="#000" strokeWidth="5" />
          <line x1="110" y1="92" x2="195" y2="92" stroke="#000" strokeWidth="5" />
          <line x1="110" y1="102" x2="195" y2="102" stroke="#000" strokeWidth="5" />
          {/* Blue LED glow */}
          <line x1="133" y1="25" x2="133" y2="155" stroke="#3B82F6" strokeWidth="4" />
          {/* DualSense controller next to it */}
          <rect
            x="205"
            y="105"
            width="75"
            height="48"
            rx="20"
            fill="#FFF"
            stroke="#000"
            strokeWidth="5"
          />
          <circle cx="225" cy="130" r="7" fill="#111827" />
          <circle cx="260" cy="130" r="7" fill="#111827" />
        </svg>
      )}

      {type === "dyson" && (
        <svg viewBox="0 0 320 180" className="w-full h-full max-h-44">
          {/* Main wand */}
          <rect x="135" y="20" width="46" height="145" rx="20" fill="#DE7A7A" stroke="#000" strokeWidth="6" />
          <rect x="142" y="20" width="32" height="55" rx="8" fill="#F4D03F" stroke="#000" strokeWidth="5" />
          {/* Air swirl lines */}
          <path d="M85 45 Q115 25 130 55" stroke="#3B66B4" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M235 45 Q205 25 190 55" stroke="#3B66B4" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="158" cy="100" r="8" fill="#111827" stroke="#000" strokeWidth="3" />
          {/* Extra attachments */}
          <rect x="60" y="75" width="36" height="85" rx="12" fill="#3B66B4" stroke="#000" strokeWidth="5" />
          <rect x="220" y="75" width="36" height="85" rx="12" fill="#E65C2E" stroke="#000" strokeWidth="5" />
        </svg>
      )}

      {type === "espresso" && (
        <svg viewBox="0 0 320 180" className="w-full h-full max-h-44">
          <rect x="85" y="30" width="150" height="130" rx="14" fill="#D1D5DB" stroke="#000" strokeWidth="6" />
          <rect x="100" y="42" width="120" height="35" rx="8" fill="#374151" stroke="#000" strokeWidth="5" />
          {/* Pressure gauge */}
          <circle cx="160" cy="60" r="12" fill="#FFF9E6" stroke="#000" strokeWidth="4" />
          <line x1="160" y1="60" x2="167" y2="53" stroke="#E65C2E" strokeWidth="3" />
          {/* Coffee cup */}
          <rect x="135" y="112" width="50" height="36" rx="8" fill="#F4D03F" stroke="#000" strokeWidth="5" />
          <rect x="92" y="148" width="136" height="14" rx="4" fill="#111827" stroke="#000" strokeWidth="4" />
        </svg>
      )}

      {(type === "smart_glasses" || type === "watch") && (
        <svg viewBox="0 0 320 180" className="w-full h-full max-h-44">
          {/* Wayfarer frame */}
          <rect x="42" y="55" width="102" height="72" rx="18" fill="#111827" stroke="#000" strokeWidth="6" />
          <rect x="176" y="55" width="102" height="72" rx="18" fill="#111827" stroke="#000" strokeWidth="6" />
          <path d="M144 72 Q160 62 176 72" stroke="#000" strokeWidth="10" fill="none" />
          {/* Lenses */}
          <rect x="54" y="65" width="78" height="52" rx="12" fill="#3B66B4" stroke="#000" strokeWidth="4" />
          <rect x="188" y="65" width="78" height="52" rx="12" fill="#3B66B4" stroke="#000" strokeWidth="4" />
          {/* Smart Camera LED */}
          <circle cx="49" cy="65" r="5" fill="#F4D03F" stroke="#000" strokeWidth="2" />
          <circle cx="271" cy="65" r="5" fill="#2ECC71" stroke="#000" strokeWidth="2" />
        </svg>
      )}
    </div>
  );
}

interface FrameArtworkProps {
  artworkId:
    | "constantinople"
    | "mount_fuji"
    | "petra"
    | "titanic"
    | "taj_mahal"
    | "pyramids";
}

export function FrameSceneArtwork({ artworkId }: FrameArtworkProps) {
  return (
    <div className="w-full h-64 md:h-72 bg-cream border-4 border-black rounded-2xl shadow-brutal overflow-hidden relative">
      {artworkId === "constantinople" && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          {/* Sky & Golden Horn */}
          <rect width="500" height="280" fill="#F4D03F" />
          <circle cx="410" cy="65" r="42" fill="#E65C2E" stroke="#000" strokeWidth="5" />
          {/* Sea at bottom */}
          <rect y="215" width="500" height="65" fill="#3B66B4" stroke="#000" strokeWidth="5" />
          {/* Great Dome in background */}
          <path d="M180 140 A75 65 0 0 1 330 140 Z" fill="#DE7A7A" stroke="#000" strokeWidth="5" />
          <rect x="170" y="140" width="170" height="75" fill="#FFF9E6" stroke="#000" strokeWidth="5" />
          {/* Historic Triple Fortification Walls & Towers */}
          <rect x="40" y="110" width="55" height="105" fill="#D97706" stroke="#000" strokeWidth="5" />
          <rect x="95" y="145" width="110" height="70" fill="#F59E0B" stroke="#000" strokeWidth="5" />
          <rect x="205" y="105" width="60" height="110" fill="#D97706" stroke="#000" strokeWidth="5" />
          <rect x="265" y="145" width="115" height="70" fill="#F59E0B" stroke="#000" strokeWidth="5" />
          <rect x="380" y="110" width="55" height="105" fill="#D97706" stroke="#000" strokeWidth="5" />
          {/* Battlements */}
          {[45, 65, 210, 235, 385, 408].map((x, i) => (
            <rect key={i} x={x} y="95" width="16" height="18" fill="#D97706" stroke="#000" strokeWidth="4" />
          ))}
          {/* Arched Gate */}
          <path d="M220 215 L220 165 A15 15 0 0 1 250 165 L250 215 Z" fill="#111827" stroke="#000" strokeWidth="4" />
        </svg>
      )}

      {artworkId === "mount_fuji" && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          <rect width="500" height="280" fill="#FFF9E6" />
          {/* Big Red Sun */}
          <circle cx="250" cy="115" r="78" fill="#E65C2E" stroke="#000" strokeWidth="5" />
          {/* Mount Fuji */}
          <path
            d="M40 245 Q175 180 215 85 L285 85 Q325 180 460 245 Z"
            fill="#3B66B4"
            stroke="#000"
            strokeWidth="6"
          />
          {/* Snow Cap */}
          <path
            d="M215 85 L285 85 L312 145 L285 132 L265 152 L250 130 L232 150 L212 132 L188 145 Z"
            fill="#FFFFFF"
            stroke="#000"
            strokeWidth="5"
          />
          {/* Lake reflection */}
          <rect y="240" width="500" height="40" fill="#60A5FA" stroke="#000" strokeWidth="5" />
          {/* Sakura Blossoms */}
          <circle cx="85" cy="60" r="22" fill="#DE7A7A" stroke="#000" strokeWidth="4" />
          <circle cx="120" cy="45" r="18" fill="#F472B6" stroke="#000" strokeWidth="4" />
          <circle cx="420" cy="65" r="22" fill="#DE7A7A" stroke="#000" strokeWidth="4" />
        </svg>
      )}

      {artworkId === "petra" && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          <rect width="500" height="280" fill="#FDBA74" />
          {/* Canyon Cliffs */}
          <path d="M0 0 L135 0 L110 280 L0 280 Z" fill="#9A3412" stroke="#000" strokeWidth="6" />
          <path d="M365 0 L500 0 L500 280 L390 280 Z" fill="#9A3412" stroke="#000" strokeWidth="6" />
          {/* Al-Khazneh Treasury Facade */}
          <rect x="145" y="45" width="210" height="220" fill="#DE7A7A" stroke="#000" strokeWidth="6" />
          {/* Pediment & Urn */}
          <polygon points="140,130 250,90 360,130" fill="#F4D03F" stroke="#000" strokeWidth="5" />
          <circle cx="250" cy="62" r="18" fill="#F4D03F" stroke="#000" strokeWidth="5" />
          {/* Columns */}
          {[165, 200, 235, 265, 300, 330].map((x, idx) => (
            <rect key={idx} x={x} y="130" width="14" height="125" fill="#FDBA74" stroke="#000" strokeWidth="4" />
          ))}
          <rect x="222" y="175" width="56" height="80" fill="#1F2937" stroke="#000" strokeWidth="5" />
        </svg>
      )}

      {artworkId === "taj_mahal" && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          <rect width="500" height="280" fill="#93C5FD" />
          {/* Main Onion Dome */}
          <path d="M200 115 C195 55, 250 35, 250 22 C250 35, 305 55, 300 115 Z" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
          <rect x="145" y="115" width="210" height="105" fill="#FFFFFF" stroke="#000" strokeWidth="6" />
          {/* Central Arch */}
          <path d="M215 220 L215 150 A35 35 0 0 1 285 150 L285 220 Z" fill="#374151" stroke="#000" strokeWidth="5" />
          {/* Two Minarets */}
          <rect x="75" y="65" width="26" height="155" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
          <rect x="400" y="65" width="26" height="155" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
          {/* Reflecting Pool */}
          <rect y="220" width="500" height="60" fill="#3B66B4" stroke="#000" strokeWidth="5" />
          <polygon points="210,220 290,220 330,280 170,280" fill="#60A5FA" stroke="#000" strokeWidth="4" />
        </svg>
      )}

      {(artworkId === "titanic" || artworkId === "pyramids") && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          {/* Night Sky */}
          <rect width="500" height="280" fill="#1E293B" />
          {/* Stars */}
          {[60, 130, 220, 310, 430].map((x, i) => (
            <circle key={i} cx={x} cy={35 + (i % 3) * 18} r="4" fill="#F4D03F" />
          ))}
          {/* Iceberg */}
          <polygon points="365,210 415,85 455,130 480,95 495,210" fill="#E0F2FE" stroke="#000" strokeWidth="5" />
          {/* 4 Funnels */}
          {[115, 165, 215, 265].map((x, idx) => (
            <g key={idx}>
              <rect x={x} y="90" width="26" height="60" fill="#F59E0B" stroke="#000" strokeWidth="4" />
              <rect x={x} y="90" width="26" height="16" fill="#111827" stroke="#000" strokeWidth="4" />
            </g>
          ))}
          {/* Ship Hull */}
          <polygon points="50,150 335,150 315,215 70,215" fill="#111827" stroke="#000" strokeWidth="5" />
          <rect x="75" y="132" width="235" height="22" fill="#FFFFFF" stroke="#000" strokeWidth="4" />
          {/* Ocean */}
          <rect y="210" width="500" height="70" fill="#3B66B4" stroke="#000" strokeWidth="5" />
        </svg>
      )}
    </div>
  );
}

interface SceneDescriptionArtworkProps {
  sceneId:
    | "moon_coffee"
    | "desert_camp"
    | "pizza_chef"
    | "deep_sea_treasure"
    | "cyber_camel";
}

export function SceneDescriptionArtwork({ sceneId }: SceneDescriptionArtworkProps) {
  return (
    <div className="w-full h-64 md:h-72 bg-cream border-4 border-black rounded-2xl shadow-brutal overflow-hidden relative">
      {sceneId === "moon_coffee" && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          {/* Space background */}
          <rect width="500" height="280" fill="#0F172A" />
          {/* Stars */}
          <circle cx="60" cy="40" r="3" fill="#FFF" />
          <circle cx="150" cy="30" r="4" fill="#F4D03F" />
          <circle cx="310" cy="50" r="3" fill="#FFF" />
          {/* Planet Earth in Sky */}
          <circle cx="95" cy="85" r="40" fill="#3B66B4" stroke="#000" strokeWidth="5" />
          <path d="M75 65 Q95 75 88 100 Q110 95 118 75 Z" fill="#2ECC71" stroke="#000" strokeWidth="3" />
          {/* Moon surface */}
          <ellipse cx="250" cy="255" rx="280" ry="75" fill="#D1D5DB" stroke="#000" strokeWidth="6" />
          <ellipse cx="110" cy="240" rx="28" ry="10" fill="#9CA3AF" stroke="#000" strokeWidth="4" />
          {/* Space Rocket */}
          <path d="M405 90 Q425 40 445 90 L445 185 L405 185 Z" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
          <polygon points="405,155 385,190 405,185" fill="#E65C2E" stroke="#000" strokeWidth="4" />
          <polygon points="445,155 465,190 445,185" fill="#E65C2E" stroke="#000" strokeWidth="4" />
          <circle cx="425" cy="115" r="11" fill="#60A5FA" stroke="#000" strokeWidth="4" />
          {/* Planted Flag */}
          <line x1="165" y1="115" x2="165" y2="215" stroke="#000" strokeWidth="6" />
          <rect x="165" y="115" width="52" height="32" fill="#2ECC71" stroke="#000" strokeWidth="4" />
          {/* Astronaut sitting & holding steaming coffee cup */}
          <rect x="235" y="145" width="55" height="65" rx="16" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
          <circle cx="262" cy="118" r="28" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
          <rect x="246" y="106" width="34" height="22" rx="10" fill="#F4D03F" stroke="#000" strokeWidth="4" />
          {/* Coffee Cup */}
          <rect x="305" y="142" width="26" height="30" rx="5" fill="#E65C2E" stroke="#000" strokeWidth="4" />
          <path d="M312 135 Q318 122 312 112" stroke="#F4D03F" strokeWidth="4" fill="none" />
          <path d="M324 135 Q330 122 324 112" stroke="#F4D03F" strokeWidth="4" fill="none" />
        </svg>
      )}

      {sceneId === "desert_camp" && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          <rect width="500" height="280" fill="#1E1B4B" />
          {/* Crescent Moon & Stars */}
          <path d="M85 40 A30 30 0 1 0 115 85 A24 24 0 1 1 85 40 Z" fill="#F4D03F" stroke="#000" strokeWidth="4" />
          <circle cx="200" cy="45" r="3" fill="#FFF" />
          <circle cx="350" cy="35" r="4" fill="#F4D03F" />
          {/* Desert Sand Dunes */}
          <path d="M0 190 Q140 150 280 190 T500 180 L500 280 L0 280 Z" fill="#F59E0B" stroke="#000" strokeWidth="5" />
          {/* White Tent */}
          <polygon points="60,215 145,115 230,215" fill="#FFF9E6" stroke="#000" strokeWidth="6" />
          <polygon points="120,215 145,155 170,215" fill="#9A3412" stroke="#000" strokeWidth="5" />
          {/* Campfire */}
          <polygon points="260,235 280,175 300,235" fill="#E65C2E" stroke="#000" strokeWidth="5" />
          <polygon points="270,235 280,192 290,235" fill="#F4D03F" stroke="#000" strokeWidth="4" />
          {/* Golden Dallah (Arabic Coffee Pot) */}
          <path d="M320 235 L330 195 L350 195 L360 235 Z" fill="#F4D03F" stroke="#000" strokeWidth="5" />
          <circle cx="340" cy="188" r="8" fill="#F4D03F" stroke="#000" strokeWidth="4" />
          {/* Camel silhouette */}
          <circle cx="415" cy="160" r="22" fill="#B45309" stroke="#000" strokeWidth="5" />
          <rect x="395" y="165" width="45" height="30" rx="12" fill="#D97706" stroke="#000" strokeWidth="5" />
          <path d="M395 175 Q375 170 378 140" stroke="#000" strokeWidth="8" fill="none" />
          <circle cx="378" cy="138" r="9" fill="#D97706" stroke="#000" strokeWidth="4" />
        </svg>
      )}

      {sceneId === "pizza_chef" && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          <rect width="500" height="280" fill="#FFF9E6" />
          {/* Brick Oven on Right */}
          <rect x="320" y="70" width="150" height="160" rx="20" fill="#B91C1C" stroke="#000" strokeWidth="6" />
          <path d="M350 230 L350 150 A45 45 0 0 1 440 150 L440 230 Z" fill="#111827" stroke="#000" strokeWidth="5" />
          <polygon points="375,225 395,175 415,225" fill="#F4D03F" stroke="#000" strokeWidth="4" />
          {/* Chef with tall hat */}
          <rect x="115" y="42" width="66" height="45" rx="18" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
          <circle cx="148" cy="115" r="28" fill="#FDE68A" stroke="#000" strokeWidth="5" />
          {/* Mustache */}
          <path d="M132 122 Q148 112 164 122" stroke="#000" strokeWidth="6" fill="none" />
          <rect x="110" y="145" width="76" height="85" rx="14" fill="#FFFFFF" stroke="#000" strokeWidth="5" />
          {/* Flying Pizza Dough */}
          <ellipse cx="235" cy="65" rx="48" ry="22" fill="#F4D03F" stroke="#000" strokeWidth="5" />
          {/* Counter with Tomatoes & Cheese */}
          <rect x="20" y="220" width="460" height="60" fill="#D97706" stroke="#000" strokeWidth="6" />
          <circle cx="75" cy="205" r="16" fill="#EF4444" stroke="#000" strokeWidth="4" />
          <circle cx="105" cy="208" r="14" fill="#EF4444" stroke="#000" strokeWidth="4" />
          <polygon points="240,220 285,190 300,220" fill="#F4D03F" stroke="#000" strokeWidth="5" />
        </svg>
      )}

      {sceneId === "deep_sea_treasure" && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          <rect width="500" height="280" fill="#1D4ED8" />
          {/* Sandy sea floor */}
          <rect y="225" width="500" height="55" fill="#FDE047" stroke="#000" strokeWidth="5" />
          {/* Treasure Chest with Gold */}
          <rect x="330" y="170" width="95" height="65" fill="#92400E" stroke="#000" strokeWidth="5" />
          <ellipse cx="377" cy="170" rx="45" ry="16" fill="#F4D03F" stroke="#000" strokeWidth="5" />
          {/* Octopus */}
          <circle cx="445" cy="110" r="26" fill="#DE7A7A" stroke="#000" strokeWidth="5" />
          {/* Sea Turtle */}
          <ellipse cx="235" cy="115" rx="38" ry="25" fill="#2ECC71" stroke="#000" strokeWidth="5" />
          <circle cx="282" cy="112" r="12" fill="#86EFAC" stroke="#000" strokeWidth="4" />
          {/* Diver with Camera */}
          <circle cx="95" cy="95" r="24" fill="#F4D03F" stroke="#000" strokeWidth="5" />
          <rect x="82" y="85" width="28" height="18" rx="6" fill="#60A5FA" stroke="#000" strokeWidth="4" />
          <rect x="130" y="90" width="32" height="24" rx="4" fill="#111827" stroke="#000" strokeWidth="4" />
          <circle cx="146" cy="102" r="7" fill="#FFF" />
        </svg>
      )}

      {sceneId === "cyber_camel" && (
        <svg viewBox="0 0 500 280" className="w-full h-full">
          <rect width="500" height="280" fill="#0F172A" />
          {/* Futuristic Skyscrapers */}
          <rect x="40" y="50" width="55" height="170" fill="#1E293B" stroke="#38BDF8" strokeWidth="4" />
          <rect x="115" y="30" width="65" height="190" fill="#1E293B" stroke="#F472B6" strokeWidth="4" />
          <rect x="380" y="45" width="70" height="175" fill="#1E293B" stroke="#F4D03F" strokeWidth="4" />
          {/* Flying Drone Car */}
          <ellipse cx="280" cy="55" rx="36" ry="14" fill="#DE7A7A" stroke="#000" strokeWidth="4" />
          {/* Neon Race Track */}
          <rect y="215" width="500" height="65" fill="#312E81" stroke="#000" strokeWidth="5" />
          <line x1="0" y1="245" x2="500" y2="245" stroke="#22D3EE" strokeWidth="6" strokeDasharray="20 12" />
          {/* Cyber Camel & Robot Jockey */}
          <rect x="200" y="135" width="90" height="50" rx="16" fill="#F4D03F" stroke="#000" strokeWidth="5" />
          <rect x="225" y="95" width="36" height="40" rx="8" fill="#60A5FA" stroke="#000" strokeWidth="5" />
          <circle cx="315" cy="115" r="18" fill="#F4D03F" stroke="#000" strokeWidth="5" />
        </svg>
      )}
    </div>
  );
}
