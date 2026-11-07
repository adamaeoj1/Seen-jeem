"use client";

import React, { useState } from "react";
import {
  Camera,
  Car,
  CheckCircle2,
  Coffee,
  Eye,
  Gamepad2,
  Glasses,
  Headphones,
  Maximize2,
  RotateCcw,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  X,
} from "lucide-react";
import {
  DescriptionDetailTag,
  PriceGuessRound,
  ProductIllustrationType,
} from "@/data/seedQuestions";

export function PhotoQuestionViewer({
  imageUrl,
  caption,
  compact = false,
}: {
  imageUrl: string;
  caption?: string;
  compact?: boolean;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Reliable fallback URL if original question image fails to load
  const fallbackUrl =
    "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=85";
  const activeSrc = imgError ? fallbackUrl : imageUrl;

  if (!imageUrl && !imgError) return null;

  return (
    <>
      <div className="w-full my-3">
        <div
          onClick={() => setLightboxOpen(true)}
          className={`group relative mx-auto overflow-hidden rounded-2xl border-4 border-black bg-black shadow-brutal cursor-zoom-in transition-transform hover:scale-[1.01] ${
            compact ? "max-h-48 max-w-md" : "max-h-72 max-w-2xl"
          }`}
        >
          {/* Loading Skeleton Shimmer */}
          {!imgLoaded && (
            <div
              className={`w-full bg-neutral-900 animate-pulse flex flex-col items-center justify-center text-sunny/70 gap-2 ${
                compact ? "h-44" : "h-60 md:h-68"
              }`}
            >
              <Camera className="w-7 h-7 animate-bounce" />
              <span className="text-[11px] font-black">جاري تحميل صورة السؤال...</span>
            </div>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${activeSrc}-${reloadKey}`}
            src={activeSrc}
            alt={caption || "سؤال مصور"}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading="eager"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              if (!imgError) {
                setImgError(true);
              }
            }}
            className={`w-full object-cover ${
              compact ? "h-44" : "h-60 md:h-68"
            } ${
              imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
            } group-hover:scale-105 transition-all duration-300`}
          />

          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/85 text-sunny border border-sunny/50 text-[11px] font-black flex items-center gap-1.5 shadow-brutal-sm">
            <Camera className="w-3.5 h-3.5 text-sunny" />
            <span>سؤال مصوّر</span>
          </div>

          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-sunny text-black border-2 border-black text-[11px] font-black flex items-center gap-1 shadow-brutal-sm">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>اضغط لتكبير الصورة</span>
          </div>

          {imgError && (
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 text-white text-[10px] font-bold border border-white/20">
              صورة بديلة عالية الدقة
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-cream border-4 border-black rounded-3xl shadow-brutal-lg overflow-hidden p-3"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-black text-white rounded-2xl mb-2">
              <span className="text-xs font-black text-sunny flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>{caption || "معاينة الصورة بالحجم الكامل"}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="px-2.5 py-1 rounded-xl bg-white/20 text-white text-xs font-black flex items-center gap-1 hover:bg-white/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة تحميل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="px-3 py-1 rounded-xl bg-coral text-white border-2 border-black text-xs font-black flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>إغلاق</span>
                </button>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeSrc}
              alt={caption || "Full size"}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full max-h-[75vh] object-contain rounded-2xl border-2 border-black bg-black"
            />
          </div>
        </div>
      )}
    </>
  );
}

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
    case "nintendo_switch_2":
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-royal">
          <div className="w-20 h-20 rounded-3xl bg-royal/10 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Gamepad2 className="w-11 h-11 text-royal" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            {type === "nintendo_switch_2"
              ? "Nintendo Switch 2 • 4K Dock"
              : "PlayStation Console 1TB"}
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
    case "iphone_17_pro":
      return (
        <div className="flex flex-col items-center justify-center gap-2 text-gray-900">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 border-3 border-black shadow-brutal-sm flex items-center justify-center">
            <Smartphone className="w-11 h-11 text-gray-900" />
          </div>
          <span className="text-xs font-black text-black bg-sunny px-3 py-0.5 rounded-full border-2 border-black">
            {type === "iphone_17_pro"
              ? "iPhone 17 Pro Max • Titanium"
              : "iPhone 16 Pro • Titanium"}
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
    | "pyramids"
    | "chefchaouen"
    | "hassan_ii"
    | "eiffel_tower"
    | "colosseum"
    | "burj_khalifa"
    | string;
  imageUrl?: string;
  title?: string;
}

const FRAME_SCENE_PHOTOS: Record<string, string> = {
  taj_mahal:
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
  chefchaouen:
    "https://images.unsplash.com/photo-1553899017-90c40dd32533?auto=format&fit=crop&w=1200&q=85",
  hassan_ii:
    "https://images.unsplash.com/photo-1577147443647-81856d5151af?auto=format&fit=crop&w=1200&q=85",
  pyramids:
    "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=85",
  eiffel_tower:
    "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=85",
  colosseum:
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=85",
  burj_khalifa:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
  petra:
    "https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=1200&q=85",
  constantinople:
    "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=1200&q=85",
  mount_fuji:
    "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85",
  titanic:
    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=85",
};

export function FrameSceneArtwork({
  artworkId,
  imageUrl,
  title,
}: FrameArtworkProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fallbackFromId =
    FRAME_SCENE_PHOTOS[artworkId] || FRAME_SCENE_PHOTOS.taj_mahal;
  const activeUrl = imageUrl && !imgError ? imageUrl : fallbackFromId;

  return (
    <>
      <div
        onClick={() => setLightboxOpen(true)}
        className="w-full h-64 md:h-72 bg-neutral-900 border-4 border-black rounded-2xl shadow-brutal overflow-hidden relative cursor-zoom-in group"
      >
        {!imgLoaded && (
          <div className="w-full h-full bg-neutral-900 animate-pulse flex flex-col items-center justify-center text-sunny/70 gap-2">
            <Camera className="w-8 h-8 animate-bounce" />
            <span className="text-xs font-black">جاري تحميل صورة المشهد...</span>
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeUrl}
          alt={title || artworkId}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          loading="eager"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            if (!imgError && imageUrl) {
              setImgError(true);
            }
          }}
          className={`w-full h-full object-cover ${
            imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
          } group-hover:scale-105 transition-all duration-500`}
        />

        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 text-sunny border border-sunny/50 text-xs font-black flex items-center gap-1.5 shadow-brutal-sm">
          <Eye className="w-3.5 h-3.5" />
          <span>وش في اللقطة؟ • صورة حقيقية</span>
        </div>

        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-sunny text-black border-2 border-black text-xs font-black flex items-center gap-1 shadow-brutal-sm">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>تكبير الصورة</span>
        </div>
      </div>

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-cream border-4 border-black rounded-3xl shadow-brutal-lg overflow-hidden p-3"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-black text-white rounded-2xl mb-2">
              <span className="text-xs font-black text-sunny flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                <span>{title || "معاينة المشهد بالحجم الكامل"}</span>
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="px-3 py-1 rounded-xl bg-coral text-white border-2 border-black text-xs font-black flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>إغلاق</span>
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeUrl}
              alt={title || artworkId}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full max-h-[75vh] object-contain rounded-2xl border-2 border-black bg-black"
            />
          </div>
        </div>
      )}
    </>
  );
}

interface SceneDescriptionArtworkProps {
  sceneId:
    | "moon_coffee"
    | "desert_camp"
    | "pizza_chef"
    | "deep_sea_treasure"
    | "cyber_camel"
    | "moroccan_living_room"
    | "street_cafe"
    | string;
  imageUrl?: string;
  title?: string;
  tags?: DescriptionDetailTag[];
  showRefereeChecklist?: boolean;
}

const SCENE_DESCRIPTION_PHOTOS: Record<string, string> = {
  desert_camp:
    "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1200&q=85",
  pizza_chef:
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85",
  cyber_camel:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85",
  moroccan_living_room:
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
  street_cafe:
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85",
  moon_coffee:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
  deep_sea_treasure:
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85",
};

export function SceneDescriptionArtwork({
  sceneId,
  imageUrl,
  title,
  tags = [],
  showRefereeChecklist = false,
}: SceneDescriptionArtworkProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [checkedTagIds, setCheckedTagIds] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fallbackFromId =
    SCENE_DESCRIPTION_PHOTOS[sceneId] || SCENE_DESCRIPTION_PHOTOS.desert_camp;
  const activeUrl = imageUrl && !imgError ? imageUrl : fallbackFromId;

  const toggleTag = (tagId: string) => {
    setCheckedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="space-y-3">
      <div className="w-full h-64 md:h-80 bg-neutral-900 border-4 border-black rounded-2xl shadow-brutal overflow-hidden relative group">
        {!imgLoaded && (
          <div className="w-full h-full bg-neutral-900 animate-pulse flex flex-col items-center justify-center text-sunny/70 gap-2">
            <Camera className="w-8 h-8 animate-bounce" />
            <span className="text-xs font-black">جاري تحميل مشهد أدق وصف...</span>
          </div>
        )}

        <div
          onClick={() => setLightboxOpen(true)}
          className="w-full h-full relative cursor-zoom-in"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeUrl}
            alt={title || sceneId}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            loading="eager"
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              if (!imgError && imageUrl) {
                setImgError(true);
              }
            }}
            className={`w-full h-full object-cover ${
              imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0"
            } group-hover:scale-105 transition-transform duration-500`}
          />
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/80 text-sunny border border-sunny/50 text-xs font-black flex items-center gap-1.5 shadow-brutal-sm">
            <Eye className="w-3.5 h-3.5" />
            <span>مشهد واقعي مليء بالتفاصيل ({tags.length || 10} عناصر)</span>
          </div>
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-sunny text-black border-2 border-black text-xs font-black flex items-center gap-1 shadow-brutal-sm">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>تكبير الصورة</span>
          </div>
        </div>
      </div>

      {/* Clickable Visual Detail Checklist for Host / Auto-Referee */}
      {showRefereeChecklist && tags.length > 0 && (
        <div className="bg-white border-3 border-black rounded-2xl p-3 shadow-brutal-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-black text-black flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>عناصر المشهد الدقيقة للحكم والمضيف ({tags.length} تفاصيل):</span>
            </span>
            <span className="text-[11px] font-bold text-gray-500">
              اضغط على أي تفصيل لتحديده يدوياً أو اترك الحكم الذكي يطابقها تلقائياً
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const isChecked = checkedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-2.5 py-1 rounded-xl border-2 border-black text-xs font-black transition-all flex items-center gap-1.5 ${
                    isChecked
                      ? "bg-mint text-black shadow-brutal-sm"
                      : "bg-cream text-gray-800 hover:bg-sunny/30"
                  }`}
                >
                  <span>{isChecked ? "✓" : "•"}</span>
                  <span>{tag.label}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-black text-sunny font-mono text-[10px]">
                    +{tag.points}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-cream border-4 border-black rounded-3xl shadow-brutal-lg overflow-hidden p-3"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-black text-white rounded-2xl mb-2">
              <span className="text-xs font-black text-sunny">
                {title || "معاينة مشهد أدق وصف"}
              </span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="px-3 py-1 rounded-xl bg-coral text-white border-2 border-black text-xs font-black flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>إغلاق</span>
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeUrl}
              alt={title || sceneId}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full max-h-[75vh] object-contain rounded-2xl border-2 border-black bg-black"
            />
          </div>
        </div>
      )}
    </div>
  );
}
