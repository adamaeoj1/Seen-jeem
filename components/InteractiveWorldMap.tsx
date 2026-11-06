"use client";

import React from "react";
import { MapPin, Target } from "lucide-react";

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
 * Converts latitude (-60..75) and longitude (-130..160) to SVG viewBox (0..800, 0..450)
 * using an Equirectangular regional/world projection focused on the Eastern Hemisphere & Americas.
 */
const MIN_LNG = -100;
const MAX_LNG = 160;
const MIN_LAT = -45;
const MAX_LAT = 70;

export function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const clampedLng = Math.max(MIN_LNG, Math.min(MAX_LNG, lng));
  const clampedLat = Math.max(MIN_LAT, Math.min(MAX_LAT, lat));
  const x = ((clampedLng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 800;
  const y = ((MAX_LAT - clampedLat) / (MAX_LAT - MIN_LAT)) * 450;
  return { x, y };
}

export function svgToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lng = MIN_LNG + (x / 800) * (MAX_LNG - MIN_LNG);
  const lat = MAX_LAT - (y / 450) * (MAX_LAT - MIN_LAT);
  return {
    lat: Number(lat.toFixed(2)),
    lng: Number(lng.toFixed(2)),
  };
}

const LANDMARK_LABELS: { name: string; lat: number; lng: number }[] = [
  { name: "أوروبا", lat: 50, lng: 12 },
  { name: "الجزيرة العربية", lat: 24, lng: 45 },
  { name: "شمال أفريقيا", lat: 28, lng: 10 },
  { name: "جنوب أفريقيا", lat: -22, lng: 24 },
  { name: "الهند", lat: 22, lng: 78 },
  { name: "شرق آسيا", lat: 36, lng: 115 },
  { name: "اليابان", lat: 36, lng: 140 },
  { name: "أستراليا", lat: -25, lng: 135 },
  { name: "أمريكا الجنوبية", lat: -15, lng: -58 },
];

export function InteractiveWorldMap({
  selectedPin,
  onSelectCoordinates,
  targetPin,
  playerPins = [],
  disabled = false,
}: InteractiveWorldMapProps) {
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled || !onSelectCoordinates) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 800;
    const clickY = ((e.clientY - rect.top) / rect.height) * 450;
    const { lat, lng } = svgToLatLng(clickX, clickY);
    onSelectCoordinates(lat, lng);
  };

  const userSvgPos = selectedPin
    ? latLngToSvg(selectedPin.lat, selectedPin.lng)
    : null;
  const targetSvgPos = targetPin
    ? latLngToSvg(targetPin.lat, targetPin.lng)
    : null;

  return (
    <div className="w-full bg-[#3B66B4] border-4 border-black rounded-2xl shadow-brutal overflow-hidden relative select-none">
      <div className="bg-black text-sunny px-3 py-1.5 text-xs font-bold flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-sunny" />
          خريطة العالم التفاعلية (اضغط لتحديد الموقع)
        </span>
        {selectedPin && (
          <span dir="ltr" className="font-mono text-[11px] bg-sunny text-black px-2 py-0.5 rounded-full">
            {selectedPin.lat.toFixed(1)}°, {selectedPin.lng.toFixed(1)}°
          </span>
        )}
      </div>

      <svg
        viewBox="0 0 800 450"
        onClick={handleSvgClick}
        className={`w-full h-auto block ${
          disabled ? "cursor-default" : "cursor-crosshair"
        }`}
      >
        {/* Ocean Grid Lines */}
        <rect width="800" height="450" fill="#2B549E" />
        {[100, 200, 300, 400, 500, 600, 700].map((gx) => (
          <line
            key={`gx-${gx}`}
            x1={gx}
            y1={0}
            x2={gx}
            y2={450}
            stroke="#3B66B4"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
        ))}
        {[90, 180, 270, 360].map((gy) => (
          <line
            key={`gy-${gy}`}
            x1={0}
            y1={gy}
            x2={800}
            y2={gy}
            stroke="#3B66B4"
            strokeWidth="1.5"
            strokeDasharray="6 6"
          />
        ))}

        {/* South America */}
        <polygon
          points="70,220 140,235 190,295 160,395 110,430 85,330"
          fill="#2ECC71"
          stroke="#000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* North America East */}
        <polygon
          points="20,60 165,55 145,155 85,185 35,145"
          fill="#2ECC71"
          stroke="#000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Europe */}
        <polygon
          points="280,135 295,85 350,45 435,55 445,125 395,145 355,135 335,145"
          fill="#F4D03F"
          stroke="#000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Africa */}
        <polygon
          points="275,155 375,160 415,220 435,255 405,345 365,390 325,335 310,255 265,215"
          fill="#F59E0B"
          stroke="#000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Madagascar Island */}
        <polygon
          points="440,320 460,315 458,365 438,368"
          fill="#DE7A7A"
          stroke="#000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Arabian Peninsula */}
        <polygon
          points="405,160 465,165 485,210 435,230 412,185"
          fill="#FFF9E6"
          stroke="#000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Asia Mainland */}
        <polygon
          points="445,55 695,45 715,135 665,215 610,235 555,235 520,185 465,165 445,125"
          fill="#DE7A7A"
          stroke="#000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Japanese Archipelago */}
        <polygon
          points="725,115 748,110 742,155 718,162"
          fill="#F4D03F"
          stroke="#000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Australia */}
        <polygon
          points="665,315 765,310 775,385 685,395"
          fill="#E65C2E"
          stroke="#000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Subtle Geographic Region Labels */}
        {LANDMARK_LABELS.map((lbl, idx) => {
          const pos = latLngToSvg(lbl.lat, lbl.lng);
          return (
            <text
              key={idx}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              className="text-[11px] font-black fill-black/75 pointer-events-none"
            >
              {lbl.name}
            </text>
          );
        })}

        {/* Dashed Lines from Player Pins to Target Pin during Reveal */}
        {targetSvgPos &&
          playerPins.map((pin) => {
            const pPos = latLngToSvg(pin.lat, pin.lng);
            return (
              <line
                key={`line-${pin.id}`}
                x1={pPos.x}
                y1={pPos.y}
                x2={targetSvgPos.x}
                y2={targetSvgPos.y}
                stroke="#FFF9E6"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            );
          })}

        {/* Other Players' Pins (Host Reveal Mode) */}
        {playerPins.map((pin) => {
          const pPos = latLngToSvg(pin.lat, pin.lng);
          return (
            <g key={pin.id} transform={`translate(${pPos.x}, ${pPos.y})`}>
              <circle
                r="10"
                fill={pin.color}
                stroke="#000"
                strokeWidth="3"
              />
              <rect
                x="-42"
                y="-34"
                width="84"
                height="20"
                rx="6"
                fill="#000"
              />
              <text
                x="0"
                y="-20"
                textAnchor="middle"
                fill="#FFF"
                className="text-[10px] font-bold"
              >
                {pin.label}{" "}
                {typeof pin.distanceKm === "number"
                  ? `(${pin.distanceKm} كم)`
                  : ""}
              </text>
            </g>
          );
        })}

        {/* Active Player's Selected Pin */}
        {userSvgPos && (
          <g transform={`translate(${userSvgPos.x}, ${userSvgPos.y})`}>
            <circle
              r="18"
              fill="#F4D03F"
              opacity="0.35"
              className="animate-ping"
            />
            <path
              d="M0 0 L-12 -26 A14 14 0 1 1 12 -26 Z"
              fill="#F4D03F"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle cx="0" cy="-28" r="5" fill="#000" />
          </g>
        )}

        {/* Target Pin (Shown on Reveal) */}
        {targetSvgPos && (
          <g transform={`translate(${targetSvgPos.x}, ${targetSvgPos.y})`}>
            <circle
              r="22"
              fill="#2ECC71"
              opacity="0.4"
              className="animate-pulse"
            />
            <circle
              r="11"
              fill="#2ECC71"
              stroke="#000"
              strokeWidth="3.5"
            />
            <circle r="4" fill="#000" />
            <rect
              x="-65"
              y="14"
              width="130"
              height="24"
              rx="8"
              fill="#2ECC71"
              stroke="#000"
              strokeWidth="2.5"
            />
            <text
              x="0"
              y="30"
              textAnchor="middle"
              fill="#000"
              className="text-[11px] font-black"
            >
              🎯 {targetPin?.label}
            </text>
          </g>
        )}
      </svg>

      {!disabled && (
        <div className="bg-cream border-t-4 border-black px-3 py-2 flex items-center justify-between text-xs font-bold text-black">
          <span>💡 المس أي مكان على الخريطة لوضع دبوسك بدقة</span>
          <span className="flex items-center gap-1 text-royal">
            <Target className="w-4 h-4" />
            حساب المسافة بمعادلة Haversine
          </span>
        </div>
      )}
    </div>
  );
}
