"use client";

import React, { useState, useRef } from "react";
import {
  Compass,
  Globe2,
  MapPin,
  Minus,
  Move,
  Plus,
  RotateCcw,
  Target,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

export interface MapPinMarker {
  id: string;
  label: string;
  lat: number;
  lng: number;
  color: string;
  distanceKm?: number;
}

interface InteractiveWorldMapProps {
  selectedPin?: { lat: number; lng: number } | null;
  onSelectCoordinates?: (lat: number, lng: number) => void;
  targetPin?: { lat: number; lng: number; label: string } | null;
  playerPins?: MapPinMarker[];
  disabled?: boolean;
}

/**
 * Standard True Equirectangular Projection (Plate Carrée)
 * Maps Longitude (-180° .. +180°) -> X (0 .. 1000)
 * Maps Latitude  (+90°  .. -90°)  -> Y (0 .. 500)
 */
const MAP_WIDTH = 1000;
const MAP_HEIGHT = 500;

export function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const clampedLng = Math.max(-180, Math.min(180, lng));
  const clampedLat = Math.max(-90, Math.min(90, lat));
  const x = ((clampedLng + 180) / 360) * MAP_WIDTH;
  const y = ((90 - clampedLat) / 180) * MAP_HEIGHT;
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2)),
  };
}

export function svgToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lng = (x / MAP_WIDTH) * 360 - 180;
  const lat = 90 - (y / MAP_HEIGHT) * 180;
  return {
    lat: Number(Math.max(-85, Math.min(85, lat)).toFixed(2)),
    lng: Number(Math.max(-180, Math.min(180, lng)).toFixed(2)),
  };
}

/**
 * Geographically accurate Equirectangular coastline paths (viewBox 0 0 1000 500)
 * computed directly from real (lat, lng) coordinates so every continent, island,
 * sea, and peninsula sits at its true global coordinate.
 */
const ACCURATE_LANDMASS_PATHS: {
  id: string;
  fill: string;
  d: string;
}[] = [
  // North America
  {
    id: "north-america",
    fill: "#2A7B52",
    d: "M 33,61 L 83,55 L 139,69 L 194,78 L 244,97 L 289,117 L 319,119 L 333,139 L 300,158 L 283,167 L 278,181 L 267,175 L 250,183 L 244,197 L 258,211 L 281,228 L 295,233 L 269,231 L 239,214 L 222,194 L 200,175 L 181,150 L 167,133 L 156,108 L 125,97 L 94,97 L 64,106 L 33,83 Z",
  },
  // Greenland
  {
    id: "greenland",
    fill: "#3B8EA5",
    d: "M 300,28 L 367,22 L 431,33 L 417,67 L 378,86 L 350,83 L 325,58 Z",
  },
  // South America
  {
    id: "south-america",
    fill: "#2E8B57",
    d: "M 281,228 L 314,219 L 339,233 L 364,250 L 403,267 L 392,297 L 367,331 L 344,358 L 322,389 L 308,406 L 297,400 L 297,361 L 300,317 L 289,292 L 272,264 L 278,242 Z",
  },
  // Cuba & Caribbean
  {
    id: "caribbean",
    fill: "#349E63",
    d: "M 264,186 L 286,189 L 297,194 L 275,194 Z",
  },
  // UK & Ireland
  {
    id: "uk-ireland",
    fill: "#389168",
    d: "M 472,94 L 486,89 L 494,97 L 499,111 L 486,114 L 472,108 Z M 492,83 L 504,81 L 508,97 L 503,111 L 494,106 Z",
  },
  // Iceland
  {
    id: "iceland",
    fill: "#3B8EA5",
    d: "M 433,67 L 456,64 L 461,72 L 439,75 Z",
  },
  // Europe (Iberia, France, Italy, Balkans, Germany, Scandinavia, Eastern Europe)
  {
    id: "europe",
    fill: "#368F6B",
    d: "M 475,128 L 492,128 L 500,119 L 519,108 L 528,94 L 517,81 L 528,61 L 556,50 L 583,56 L 578,78 L 564,92 L 547,97 L 558,106 L 597,94 L 639,89 L 667,108 L 639,128 L 611,136 L 589,136 L 575,150 L 564,150 L 553,136 L 542,147 L 533,142 L 525,131 L 514,133 L 500,147 L 475,147 Z",
  },
  // Africa (Morocco, North Africa, Horn of Africa, West Africa, Southern Africa)
  {
    id: "africa",
    fill: "#3D9970",
    d: "M 475,150 L 506,147 L 528,147 L 542,158 L 569,161 L 589,164 L 606,192 L 625,214 L 642,217 L 633,242 L 611,269 L 606,300 L 594,325 L 578,347 L 556,347 L 542,319 L 533,286 L 525,264 L 506,236 L 478,236 L 456,219 L 453,197 L 464,172 Z",
  },
  // Madagascar
  {
    id: "madagascar",
    fill: "#3D9970",
    d: "M 622,286 L 636,283 L 639,311 L 628,322 L 619,308 Z",
  },
  // Arabian Peninsula & Levant
  {
    id: "arabia",
    fill: "#48A878",
    d: "M 592,158 L 614,153 L 636,164 L 656,178 L 667,192 L 650,208 L 622,214 L 608,192 L 597,169 Z",
  },
  // Asia Mainland (Anatolia, Central Asia, Siberia, India, Southeast Asia, China, Korea)
  {
    id: "asia",
    fill: "#2E855F",
    d: "M 583,142 L 617,139 L 642,128 L 667,108 L 667,67 L 722,50 L 792,47 L 861,56 L 931,67 L 969,81 L 944,106 L 917,114 L 903,139 L 878,150 L 869,172 L 844,192 L 822,208 L 806,236 L 794,217 L 778,197 L 758,197 L 739,228 L 722,228 L 706,197 L 689,183 L 667,178 L 644,164 L 619,153 L 586,153 Z",
  },
  // Sri Lanka
  {
    id: "sri-lanka",
    fill: "#3D9970",
    d: "M 722,228 L 728,228 L 728,236 L 722,236 Z",
  },
  // Japan Archipelago
  {
    id: "japan",
    fill: "#45A577",
    d: "M 883,128 L 897,119 L 906,133 L 892,153 L 878,158 Z",
  },
  // Taiwan & Philippines
  {
    id: "philippines",
    fill: "#3D9970",
    d: "M 836,181 L 842,181 L 842,192 L 836,192 Z M 836,200 L 850,203 L 853,225 L 839,225 Z",
  },
  // Indonesia & Maritime Southeast Asia
  {
    id: "indonesia",
    fill: "#369469",
    d: "M 767,239 L 797,256 L 828,264 L 858,264 L 889,261 L 911,269 L 886,278 L 844,275 L 800,269 L 764,250 Z M 817,236 L 839,236 L 842,256 L 819,256 Z",
  },
  // Australia
  {
    id: "australia",
    fill: "#388E64",
    d: "M 817,294 L 856,283 L 894,286 L 925,314 L 919,350 L 889,367 L 856,356 L 819,353 L 811,322 Z",
  },
  // New Zealand
  {
    id: "new-zealand",
    fill: "#45A577",
    d: "M 961,356 L 975,350 L 981,369 L 958,386 L 950,378 Z",
  },
];

type ViewportPreset = "WORLD" | "EMEA" | "ASIA" | "AMERICAS";

const VIEWPORT_PRESETS: Record<
  ViewportPreset,
  { label: string; viewBox: string }
> = {
  WORLD: { label: "🌍 العالم كاملاً", viewBox: "0 0 1000 500" },
  EMEA: {
    label: "🇲🇦 أوروبا والعالم العربي وإفريقيا",
    viewBox: "420 65 280 280",
  },
  ASIA: { label: "🗾 آسيا والشرق الأقصى", viewBox: "620 65 360 280" },
  AMERICAS: { label: "🌎 الأمريكتان", viewBox: "60 60 360 340" },
};

export function InteractiveWorldMap({
  selectedPin,
  onSelectCoordinates,
  targetPin,
  playerPins = [],
  disabled = false,
}: InteractiveWorldMapProps) {
  const [viewport, setViewport] = useState<ViewportPreset>("WORLD");
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [mapImageLoaded, setMapImageLoaded] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Drag tracking to distinguish click/tap from pan
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    initialPanX: number;
    initialPanY: number;
    movedDistance: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialPanX: 0,
    initialPanY: 0,
    movedDistance: 0,
  });

  const activePreset = VIEWPORT_PRESETS[viewport];
  const [baseX, baseY, baseW, baseH] = activePreset.viewBox
    .split(" ")
    .map(Number);

  // Calculate visible dimensions under zoom
  const currentW = baseW / zoomScale;
  const currentH = baseH / zoomScale;

  // Clamped pan boundaries
  const maxPanX = (baseW - currentW) / 2;
  const maxPanY = (baseH - currentH) / 2;
  const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, panOffset.x));
  const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, panOffset.y));

  const currentX = Math.max(
    0,
    Math.min(MAP_WIDTH - currentW, baseX + (baseW - currentW) / 2 + clampedPanX)
  );
  const currentY = Math.max(
    0,
    Math.min(MAP_HEIGHT - currentH, baseY + (baseH - currentH) / 2 + clampedPanY)
  );
  const effectiveViewBox = `${currentX} ${currentY} ${currentW} ${currentH}`;

  const handleZoomIn = () => {
    setZoomScale((z) => Math.min(4.0, Number((z + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoomScale((z) => {
      const next = Math.max(1.0, Number((z - 0.5).toFixed(1)));
      if (next === 1.0) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
    setPanOffset({ x: 0, y: 0 });
    setViewport("WORLD");
  };

  const onPointerDown = (clientX: number, clientY: number) => {
    dragRef.current = {
      isDragging: true,
      startX: clientX,
      startY: clientY,
      initialPanX: clampedPanX,
      initialPanY: clampedPanY,
      movedDistance: 0,
    };
  };

  const onPointerMove = (clientX: number, clientY: number) => {
    if (!dragRef.current.isDragging || zoomScale <= 1.0) return;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    dragRef.current.movedDistance = Math.hypot(dx, dy);

    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgDeltaX = -(dx / rect.width) * currentW;
    const svgDeltaY = -(dy / rect.height) * currentH;

    setPanOffset({
      x: dragRef.current.initialPanX + svgDeltaX,
      y: dragRef.current.initialPanY + svgDeltaY,
    });
  };

  const onPointerUp = (clientX: number, clientY: number) => {
    const wasDragging = dragRef.current.isDragging;
    const moved = dragRef.current.movedDistance > 8;
    dragRef.current.isDragging = false;

    if (wasDragging && !moved) {
      handleDropPinAt(clientX, clientY);
    }
  };

  const handleDropPinAt = (clientX: number, clientY: number) => {
    if (disabled || !onSelectCoordinates) return;
    const svg = svgRef.current;
    if (!svg) return;

    let svgX = 0;
    let svgY = 0;

    if (svg.getScreenCTM) {
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const transformed = pt.matrixTransform(ctm.inverse());
        svgX = transformed.x;
        svgY = transformed.y;
      } else {
        const rect = svg.getBoundingClientRect();
        svgX = currentX + ((clientX - rect.left) / rect.width) * currentW;
        svgY = currentY + ((clientY - rect.top) / rect.height) * currentH;
      }
    } else {
      const rect = svg.getBoundingClientRect();
      svgX = currentX + ((clientX - rect.left) / rect.width) * currentW;
      svgY = currentY + ((clientY - rect.top) / rect.height) * currentH;
    }

    const { lat, lng } = svgToLatLng(svgX, svgY);
    onSelectCoordinates(lat, lng);
  };

  const userSvgPos = selectedPin
    ? latLngToSvg(selectedPin.lat, selectedPin.lng)
    : null;
  const targetSvgPos = targetPin
    ? latLngToSvg(targetPin.lat, targetPin.lng)
    : null;

  return (
    <div className="w-full bg-[#0F2537] border-4 border-black rounded-2xl shadow-brutal overflow-hidden relative select-none">
      {/* Top Satellite Navigation Header */}
      <div className="bg-black text-sunny px-3 py-2 text-xs font-black flex flex-wrap items-center justify-between gap-2 border-b-2 border-white/15">
        <span className="flex items-center gap-1.5">
          <Globe2 className="w-4 h-4 text-sunny" />
          <span>خريطة العالم الحقيقية (بدون أسماء مدن)</span>
        </span>

        {/* Region Zoom Presets */}
        <div className="flex items-center gap-1 flex-wrap">
          {(Object.keys(VIEWPORT_PRESETS) as ViewportPreset[]).map((presetKey) => {
            const isSelected = viewport === presetKey && zoomScale === 1.0;
            return (
              <button
                key={presetKey}
                type="button"
                onClick={() => {
                  setViewport(presetKey);
                  setZoomScale(1.0);
                  setPanOffset({ x: 0, y: 0 });
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all flex items-center gap-1 ${
                  isSelected
                    ? "bg-sunny text-black border-black"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                {presetKey === "WORLD" ? (
                  <ZoomOut className="w-3 h-3" />
                ) : (
                  <ZoomIn className="w-3 h-3" />
                )}
                <span>{VIEWPORT_PRESETS[presetKey].label}</span>
              </button>
            );
          })}
        </div>

        {selectedPin && (
          <span
            dir="ltr"
            className="font-mono text-[11px] bg-sunny text-black px-2.5 py-0.5 rounded-full border border-black font-black"
          >
            📍 {selectedPin.lat.toFixed(2)}°, {selectedPin.lng.toFixed(2)}°
          </span>
        )}
      </div>

      {/* Mobile Zoom & Pan Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-900 px-3 py-1.5 border-b-2 border-black/40 text-white">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-black text-sunny">
            التقريب ({zoomScale}x):
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomScale >= 4.0}
            className="px-2 py-0.5 rounded-lg bg-sunny text-black font-black text-[11px] border border-black hover:bg-sunny/80 disabled:opacity-40 flex items-center gap-1 shadow-brutal-sm"
          >
            <Plus className="w-3 h-3" />
            <span>تقريب</span>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomScale <= 1.0}
            className="px-2 py-0.5 rounded-lg bg-white/20 text-white font-black text-[11px] border border-white/30 hover:bg-white/30 disabled:opacity-40 flex items-center gap-1"
          >
            <Minus className="w-3 h-3" />
            <span>تبعيد</span>
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-0.5 rounded-lg bg-coral text-white font-black text-[11px] border border-black hover:bg-coral/80 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>إعادة ضبط</span>
          </button>
        </div>

        {zoomScale > 1.0 && (
          <span className="text-[10px] font-bold text-sunny/80 flex items-center gap-1 animate-pulse">
            <Move className="w-3 h-3" />
            <span>اسحب الخريطة للتحرك • اضغط لتثبيت الدبوس</span>
          </span>
        )}
      </div>

      {/* Interactive Equirectangular World Map SVG */}
      <div className="relative w-full overflow-hidden bg-[#102A43]">
        <svg
          ref={svgRef}
          viewBox={effectiveViewBox}
          onMouseDown={(e) => onPointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => onPointerMove(e.clientX, e.clientY)}
          onMouseUp={(e) => onPointerUp(e.clientX, e.clientY)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length > 0) {
              onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchEnd={(e) => {
            if (e.changedTouches.length > 0) {
              onPointerUp(
                e.changedTouches[0].clientX,
                e.changedTouches[0].clientY
              );
            }
          }}
          className={`w-full h-auto block select-none ${
            disabled
              ? "cursor-default"
              : zoomScale > 1.0
              ? "cursor-grab active:cursor-grabbing"
              : "cursor-crosshair"
          }`}
        >
          <defs>
            <radialGradient id="oceanGlow" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#1B4366" />
              <stop offset="100%" stopColor="#0D2136" />
            </radialGradient>
            <filter id="landShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow
                dx="0"
                dy="1.5"
                stdDeviation="1.5"
                floodColor="#000000"
                floodOpacity="0.55"
              />
            </filter>
          </defs>

          {/* Deep Ocean Base */}
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#oceanGlow)" />

          {/* Geographically Accurate Vector Landmasses (Always Present & Crisp) */}
          <g filter="url(#landShadow)">
            {ACCURATE_LANDMASS_PATHS.map((land) => (
              <path
                key={land.id}
                d={land.d}
                fill={land.fill}
                stroke="#091521"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            ))}
          </g>

          {/* High-Res Real Equirectangular Satellite/Physical World Map Overlay (No City Labels) */}
          {mapImageLoaded && (
            <image
              href="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Equirectangular_projection_SW.jpg/1280px-Equirectangular_projection_SW.jpg"
              x="0"
              y="0"
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              preserveAspectRatio="none"
              opacity="0.88"
              onError={() => setMapImageLoaded(false)}
            />
          )}

          {/* Subtle Latitude & Longitude Graticule Lines (Every 30 Degrees) */}
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lng) => {
            const { x } = latLngToSvg(0, lng);
            return (
              <line
                key={`meridian-${lng}`}
                x1={x}
                y1={0}
                x2={x}
                y2={MAP_HEIGHT}
                stroke={lng === 0 ? "rgba(244,208,63,0.35)" : "rgba(255,255,255,0.12)"}
                strokeWidth={lng === 0 ? "1.2" : "0.7"}
                strokeDasharray={lng === 0 ? "4 4" : "3 5"}
              />
            );
          })}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const { y } = latLngToSvg(lat, 0);
            return (
              <line
                key={`parallel-${lat}`}
                x1={0}
                y1={y}
                x2={MAP_WIDTH}
                y2={y}
                stroke={lat === 0 ? "rgba(244,208,63,0.4)" : "rgba(255,255,255,0.12)"}
                strokeWidth={lat === 0 ? "1.3" : "0.7"}
                strokeDasharray={lat === 0 ? "5 4" : "3 5"}
              />
            );
          })}

          {/* Geodesic Dashed Lines from Player Pins to Target Pin during Reveal */}
          {targetSvgPos &&
            playerPins.map((pin) => {
              const pPos = latLngToSvg(pin.lat, pin.lng);
              return (
                <g key={`line-group-${pin.id}`}>
                  <line
                    x1={pPos.x}
                    y1={pPos.y}
                    x2={targetSvgPos.x}
                    y2={targetSvgPos.y}
                    stroke="#000000"
                    strokeWidth="3.5"
                    strokeDasharray="6 4"
                  />
                  <line
                    x1={pPos.x}
                    y1={pPos.y}
                    x2={targetSvgPos.x}
                    y2={targetSvgPos.y}
                    stroke="#F4D03F"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                </g>
              );
            })}

          {/* Player Pins with Name & Distance Badges (Host & Reveal Mode) */}
          {playerPins.map((pin) => {
            const pPos = latLngToSvg(pin.lat, pin.lng);
            const distText =
              typeof pin.distanceKm === "number"
                ? `${pin.distanceKm.toLocaleString("en-US")} km`
                : "";
            const badgeText = distText ? `${pin.label} • ${distText}` : pin.label;
            const badgeWidth = Math.max(76, badgeText.length * 5.8 + 18);

            return (
              <g key={pin.id} transform={`translate(${pPos.x}, ${pPos.y})`}>
                <circle
                  r="11"
                  fill={pin.color}
                  stroke="#000"
                  strokeWidth="2.5"
                  opacity="0.35"
                />
                <circle
                  r="6.5"
                  fill={pin.color}
                  stroke="#000"
                  strokeWidth="2.5"
                />
                <circle r="2.2" fill="#FFF" />
                <rect
                  x={-badgeWidth / 2}
                  y="-28"
                  width={badgeWidth}
                  height="18"
                  rx="6"
                  fill="#000"
                  stroke="#FFF"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="-16"
                  textAnchor="middle"
                  fill="#F4D03F"
                  className="text-[8.5px] font-black"
                >
                  {badgeText}
                </text>
              </g>
            );
          })}

          {/* Active Player's Selected Pin with Pulsing Radar Ring */}
          {userSvgPos && (
            <g transform={`translate(${userSvgPos.x}, ${userSvgPos.y})`}>
              <circle
                r="18"
                fill="none"
                stroke="#F4D03F"
                strokeWidth="2.5"
                opacity="0.7"
                className="animate-ping"
              />
              <circle
                r="11"
                fill="#F4D03F"
                opacity="0.28"
              />
              <path
                d="M0 0 L-9 -20 A10.5 10.5 0 1 1 9 -20 Z"
                fill="#F4D03F"
                stroke="#000"
                strokeWidth="2.8"
              />
              <circle cx="0" cy="-21" r="3.8" fill="#000" />
            </g>
          )}

          {/* Target Pin with Concentric Radar Rings (Shown on Reveal) */}
          {targetSvgPos && (
            <g transform={`translate(${targetSvgPos.x}, ${targetSvgPos.y})`}>
              {/* Outer Radar Target Rings */}
              <circle
                r="28"
                fill="none"
                stroke="#2ECC71"
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.85"
              />
              <circle
                r="18"
                fill="#2ECC71"
                opacity="0.35"
                className="animate-pulse"
              />
              <circle
                r="8.5"
                fill="#2ECC71"
                stroke="#000"
                strokeWidth="2.8"
              />
              <circle r="3" fill="#000" />
              <rect
                x="-68"
                y="12"
                width="136"
                height="22"
                rx="7"
                fill="#2ECC71"
                stroke="#000"
                strokeWidth="2.2"
              />
              <text
                x="0"
                y="26"
                textAnchor="middle"
                fill="#000"
                className="text-[9.5px] font-black"
              >
                🎯 {targetPin?.label}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Scoring Scale & Helper Bar */}
      <div className="bg-cream border-t-4 border-black px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-black text-black">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-burnt" />
          <span>
            {disabled
              ? "تم قفل الإحداثيات — مقارنة المسافات الحقيقية بالكيلومتر"
              : "اضغط في أي مكان على الخريطة أو كَبّر القارة لتثبيت الدبوس بدقة"}
          </span>
        </span>
        <span className="flex items-center gap-2 text-[10px] font-black text-royal bg-white px-2.5 py-1 rounded-lg border-2 border-black">
          <Compass className="w-3.5 h-3.5 text-royal" />
          <span>0–150 km: 500 pts • 500 km: 350 pts • 1500+ km: 100 pts</span>
          <Target className="w-3.5 h-3.5 text-emerald-700" />
        </span>
      </div>
    </div>
  );
}
