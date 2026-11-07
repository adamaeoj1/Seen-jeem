"use client";

import React, { useState } from "react";
import {
  Car,
  CheckCircle2,
  Coffee,
  Gamepad2,
  Glasses,
  Headphones,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { PriceGuessRound, ProductIllustrationType } from "@/data/seedQuestions";

interface ProductArtworkProps {
  type: ProductIllustrationType;
  imageUrl?: string;
  productName?: string;
  brand?: string;
  categoryBadge?: string;
  currencyLabel?: string;
}

export function ProductFallbackIcon({
  type,
}: {
  type: ProductIllustrationType;
}) {
  switch (type) {
    case "ps5_slim":
    case "ps5_pro":
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-royal">
          <div className="w-20 h-20 rounded-3xl bg-royal/10 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Gamepad2 className="w-11 h-11 text-royal" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            PlayStation Console 1TB
          </span>
        </div>
      );
    case "atay_set":
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-emerald-800">
          <div className="w-20 h-20 rounded-3xl bg-mint/30 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Coffee className="w-11 h-11 text-emerald-800" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            طقم أتاي مغربي فضي أصيل
          </span>
        </div>
      );
    case "iphone_16_pro":
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-gray-900">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Smartphone className="w-11 h-11 text-gray-900" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            iPhone 16 Pro • Titanium
          </span>
        </div>
      );
    case "airpods_pro_2":
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-royal">
          <div className="w-20 h-20 rounded-3xl bg-sky-100 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Headphones className="w-11 h-11 text-royal" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            AirPods Pro 2 • MagSafe
          </span>
        </div>
      );
    case "dacia_logan":
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-burnt">
          <div className="w-20 h-20 rounded-3xl bg-orange-100 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Car className="w-11 h-11 text-burnt" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            Dacia Logan • Maroc Edition
          </span>
        </div>
      );
    case "espresso":
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-burnt">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Coffee className="w-11 h-11 text-burnt" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            Barista Espresso Pro
          </span>
        </div>
      );
    case "dyson":
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-pink-700">
          <div className="w-20 h-20 rounded-3xl bg-pink-100 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Sparkles className="w-11 h-11 text-pink-700" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            Dyson Airwrap Complete
          </span>
        </div>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-royal">
          <div className="w-20 h-20 rounded-3xl bg-indigo-100 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Glasses className="w-11 h-11 text-royal" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            Smart XR Device
          </span>
        </div>
      );
  }
}

export function ProductArtwork({
  type,
  imageUrl,
  productName,
  brand,
  categoryBadge,
}: ProductArtworkProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-full h-56 bg-gradient-to-br from-white via-cream to-sunny/25 border-4 border-black rounded-2xl shadow-brutal flex flex-col justify-between p-3.5 relative overflow-hidden">
      {/* Top E-Commerce Badges */}
      <div className="flex items-center justify-between gap-2 z-10">
        <span className="px-2.5 py-0.5 rounded-full bg-black text-sunny text-[10px] font-black flex items-center gap-1">
          <ShoppingBag className="w-3 h-3" />
          <span>{categoryBadge || brand || "متجر السوق الرسمي"}</span>
        </span>
        <span className="px-2 py-0.5 rounded-full bg-mint text-black border border-black text-[10px] font-black flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>منتج أصلي</span>
        </span>
      </div>

      {/* Main Product Photo with Clean Fallback Icon */}
      <div className="flex-1 flex items-center justify-center my-1 overflow-hidden rounded-xl bg-white/85 border-2 border-black/15 relative">
        {imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={productName || type}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover max-h-36 hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <ProductFallbackIcon type={type} />
        )}
      </div>

      {/* Bottom Rating & Mystery Price Bar */}
      <div className="flex items-center justify-between text-[11px] font-black z-10">
        <span className="flex items-center gap-1 text-amber-600">
          <Star className="w-3.5 h-3.5 fill-sunny text-black" />
          <span className="text-black">4.9 (تقييم المتجر)</span>
        </span>
        <span className="px-2.5 py-0.5 rounded-lg bg-sunny border-2 border-black text-black font-mono">
          كم السعر؟
        </span>
      </div>
    </div>
  );
}

export function EcommerceProductCard({
  round,
  currencyLabel,
  compact = false,
}: {
  round: PriceGuessRound;
  currencyLabel: string;
  compact?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const specItems = round.specs
    .split("•")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className="bg-white border-4 border-black rounded-3xl shadow-brutal-lg overflow-hidden"
      dir="rtl"
    >
      {/* Storefront Header Bar */}
      <div className="bg-black text-white px-5 py-3 border-b-4 border-black flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-sunny text-black text-xs font-black flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{round.categoryBadge || "بطاقة منتج • السوق الرسمي"}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-black">
            {round.brand}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-mint text-black text-[11px] font-black flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>متوفر في السوق</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-sunny/20 text-sunny border border-sunny/40 text-[11px] font-black flex items-center gap-1">
            <Star className="w-3 h-3 fill-sunny text-sunny" />
            <span>4.9</span>
          </span>
        </div>
      </div>

      {/* Product Body */}
      <div
        className={`p-5 md:p-6 grid grid-cols-1 ${
          compact ? "gap-4" : "md:grid-cols-12 gap-6"
        } items-center`}
      >
        {/* Product Photo Frame with Fallback Icon */}
        <div className={compact ? "w-full" : "md:col-span-5"}>
          <div className="relative h-56 md:h-64 rounded-2xl border-3 border-black bg-gradient-to-br from-cream via-white to-sunny/20 shadow-brutal flex items-center justify-center overflow-hidden p-3">
            {round.imageUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={round.imageUrl}
                alt={round.productName}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <ProductFallbackIcon type={round.illustrationType} />
            )}

            {/* Floating Mystery Price Tag */}
            <div className="absolute bottom-3 left-3 bg-sunny text-black border-2 border-black rounded-xl px-3 py-1.5 shadow-brutal-sm flex items-center gap-1.5 font-black text-xs">
              <Tag className="w-3.5 h-3.5" />
              <span>؟؟؟ {currencyLabel}</span>
            </div>
          </div>
        </div>

        {/* Product Info & Specs */}
        <div className={`${compact ? "w-full" : "md:col-span-7"} space-y-4 text-right`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-cream border-2 border-black text-xs font-black text-royal">
            <span>خمّن السعر الحقيقي بالـ {currencyLabel}</span>
          </div>

          <h2
            className={`${
              compact ? "text-lg" : "text-2xl md:text-3xl"
            } font-black text-black leading-snug`}
          >
            {round.productName}
          </h2>

          {/* Specs Grid */}
          <div className="space-y-2">
            <div className="text-xs font-black text-gray-500">
              المواصفات والتفاصيل:
            </div>
            <div className="flex flex-wrap gap-2">
              {specItems.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-cream border-2 border-black text-xs font-black text-gray-800 shadow-brutal-sm"
                >
                  • {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Mystery Price Prompt Banner */}
          <div className="p-3.5 rounded-2xl bg-sunny/35 border-3 border-black flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-black text-gray-700">
                العملة المعتمدة في هذه الجولة:
              </div>
              <div className="text-base md:text-lg font-black text-black">
                {currencyLabel}
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-black text-sunny font-mono font-black text-sm border-2 border-black">
              أقرب تخمين يفوز بـ +500 نقطة!
            </div>
          </div>
        </div>
      </div>
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
