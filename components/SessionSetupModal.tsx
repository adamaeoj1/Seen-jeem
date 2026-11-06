"use client";

import React, { useState } from "react";
import {
  Atom,
  BookOpen,
  Check,
  Clock,
  Compass,
  Film,
  Gamepad2,
  Globe,
  Landmark,
  Music,
  Play,
  Sparkles,
  Trophy,
  Tv,
  Volume2,
  Wand2,
  X,
} from "lucide-react";
import {
  MiniGameId,
  SEEN_JEEM_CATEGORIES,
  SeenJeemCategory,
} from "@/data/seedQuestions";
import { RoomSettings, SessionModeConfig } from "@/lib/gameEngine";

interface SessionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  customCategories: SeenJeemCategory[];
  initialMode?: SessionModeConfig;
  initialMiniGame?: MiniGameId;
  onOpenCustomBuilder: () => void;
  onConfirmStartSession: (
    settings: RoomSettings,
    selectedCategoryIds: string[],
    startMiniGameId?: MiniGameId
  ) => void;
}

const TEAM_COLOR_SWATCHES = [
  "#3B66B4", // Royal Blue
  "#E65C2E", // Burnt Orange
  "#2ECC71", // Emerald Mint
  "#DE7A7A", // Coral Pink
  "#9333EA", // Purple
  "#111827", // Onyx Black
];

export function SessionSetupModal({
  isOpen,
  onClose,
  customCategories,
  initialMode = "SEEN_JEEM",
  initialMiniGame = "SPEED_TRIVIA",
  onOpenCustomBuilder,
  onConfirmStartSession,
}: SessionSetupModalProps) {
  const allCategories = [...SEEN_JEEM_CATEGORIES, ...customCategories];

  const [sessionMode, setSessionMode] =
    useState<SessionModeConfig>(initialMode);
  const [team1Name, setTeam1Name] = useState("فريق الصقور");
  const [team1Color, setTeam1Color] = useState("#3B66B4");
  const [team2Name, setTeam2Name] = useState("فريق النمور");
  const [team2Color, setTeam2Color] = useState("#E65C2E");
  const [timerSec, setTimerSec] = useState<30 | 45 | 60>(45);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  const [selectedCats, setSelectedCats] = useState<string[]>(() =>
    SEEN_JEEM_CATEGORIES.slice(0, 6).map((c) => c.id)
  );

  if (!isOpen) return null;

  const toggleCategory = (id: string) => {
    setSelectedCats((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 6) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Landmark":
        return <Landmark className="w-6 h-6" />;
      case "Globe":
        return <Globe className="w-6 h-6" />;
      case "Trophy":
        return <Trophy className="w-6 h-6" />;
      case "Film":
        return <Film className="w-6 h-6" />;
      case "Atom":
        return <Atom className="w-6 h-6" />;
      case "Compass":
        return <Compass className="w-6 h-6" />;
      case "Gamepad2":
        return <Gamepad2 className="w-6 h-6" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    const settings: RoomSettings = {
      sessionMode,
      team1Name: team1Name.trim() || "فريق الصقور",
      team1Color,
      team2Name: team2Name.trim() || "فريق النمور",
      team2Color,
      timerSec,
      soundEnabled,
      musicEnabled,
    };
    onConfirmStartSession(settings, selectedCats, initialMiniGame);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-cream border-4 border-black rounded-3xl shadow-brutal-lg max-w-4xl w-full overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-sunny border-b-4 border-black px-6 py-4 flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-black text-sunny text-[11px] font-black">
              الخطوة ١ من ٣ • إعداد الغرفة
            </span>
            <h2 className="text-2xl font-black text-black mt-0.5">
              إعداد جلسة اللعب قبل الفتح
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-coral text-black border-2 border-black shadow-brutal-sm flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleLaunch}
          className="p-6 space-y-6 max-h-[82vh] overflow-y-auto"
        >
          {/* 1. Choose Game Mode */}
          <div>
            <label className="block text-sm font-black mb-2.5">
              ١. اختر نظام السهرة:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: "SEEN_JEEM" as SessionModeConfig,
                  title: "طور سين جيم التفاعلي",
                  desc: "لوحة ٣٦ سؤالاً مع تصحيح ذكي بالجوال",
                  icon: <Tv className="w-5 h-5" />,
                },
                {
                  id: "MINI_GAMES" as SessionModeConfig,
                  title: "طور الألعاب الثمانية (قمنم)",
                  desc: "٨ ألعاب سريعة وتحديات حركية بالجوال",
                  icon: <Gamepad2 className="w-5 h-5" />,
                },
                {
                  id: "MIXED_PARTY" as SessionModeConfig,
                  title: "سهرة مدمجة (سين جيم + قمنم)",
                  desc: "اجمع بين لوحة سين جيم وجولات قمنم الفاصلة",
                  icon: <Sparkles className="w-5 h-5" />,
                },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSessionMode(m.id)}
                  className={`p-4 rounded-2xl border-3 border-black text-right transition flex flex-col justify-between gap-2 ${
                    sessionMode === m.id
                      ? "bg-royal text-white shadow-brutal -translate-y-0.5"
                      : "bg-white text-black hover:bg-sunny/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-black text-sm">{m.title}</span>
                    {m.icon}
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      sessionMode === m.id ? "text-cream" : "text-gray-600"
                    }`}
                  >
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Team Customization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-3 shadow-brutal-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black">اسم ولون الفريق الأول</label>
                <span
                  className="w-5 h-5 rounded-full border-2 border-black"
                  style={{ backgroundColor: team1Color }}
                />
              </div>
              <input
                type="text"
                maxLength={20}
                value={team1Name}
                onChange={(e) => setTeam1Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-cream font-black text-sm"
              />
              <div className="flex items-center gap-2">
                {TEAM_COLOR_SWATCHES.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setTeam1Color(col)}
                    className={`w-7 h-7 rounded-full border-2 border-black transition ${
                      team1Color === col ? "scale-110 ring-2 ring-black" : ""
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-3 shadow-brutal-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black">اسم ولون الفريق الثاني</label>
                <span
                  className="w-5 h-5 rounded-full border-2 border-black"
                  style={{ backgroundColor: team2Color }}
                />
              </div>
              <input
                type="text"
                maxLength={20}
                value={team2Name}
                onChange={(e) => setTeam2Name(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-cream font-black text-sm"
              />
              <div className="flex items-center gap-2">
                {TEAM_COLOR_SWATCHES.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setTeam2Color(col)}
                    className={`w-7 h-7 rounded-full border-2 border-black transition ${
                      team2Color === col ? "scale-110 ring-2 ring-black" : ""
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 3. Visual Category Picker (for SEEN_JEEM or MIXED_PARTY) */}
          {(sessionMode === "SEEN_JEEM" || sessionMode === "MIXED_PARTY") && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-black">
                    ٢. اختر ٦ فئات للوحة سين جيم ({selectedCats.length}/6):
                  </label>
                </div>
                <button
                  type="button"
                  onClick={onOpenCustomBuilder}
                  className="px-3 py-1.5 rounded-xl bg-sunny border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-brutal-sm"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>+ صانع فئة خاصة</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {allCategories.map((cat) => {
                  const isSelected = selectedCats.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-3 rounded-2xl border-3 border-black text-right transition relative flex flex-col justify-between h-28 overflow-hidden ${
                        isSelected
                          ? "bg-sunny shadow-brutal -translate-y-0.5"
                          : "bg-white opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className="w-10 h-10 rounded-xl border-2 border-black flex items-center justify-center text-black shrink-0 overflow-hidden"
                          style={{ backgroundColor: cat.color }}
                        >
                          {cat.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cat.thumbnailUrl}
                              alt={cat.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            renderCategoryIcon(cat.icon)
                          )}
                        </div>
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-black text-sunny flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-black text-sm leading-tight line-clamp-1">
                          {cat.title}
                        </div>
                        <div className="text-[11px] font-bold text-gray-600 line-clamp-1">
                          {cat.questions.length} أسئلة
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Timer Duration & Audio Toggles */}
          <div className="bg-white border-3 border-black rounded-2xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-black flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4 text-royal" />
                <span>مدة المؤقت لكل جولة:</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([30, 45, 60] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setTimerSec(sec)}
                    className={`py-2 rounded-xl border-2 border-black font-black text-xs transition ${
                      timerSec === sec
                        ? "bg-royal text-white shadow-brutal-sm"
                        : "bg-cream text-black"
                    }`}
                  >
                    {sec} ثانية
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-black block mb-2">
                المؤثرات الصوتية وأصوات اللاعبين:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`py-2 px-3 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition ${
                    soundEnabled ? "bg-mint text-black" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>الأصوات: {soundEnabled ? "مفعّلة" : "صامت"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className={`py-2 px-3 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition ${
                    musicEnabled ? "bg-sunny text-black" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>حماس اللوبي: {musicEnabled ? "مفعّل" : "إيقاف"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-white border-2 border-black font-black text-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-royal hover:bg-blue-700 text-white font-black text-base border-3 border-black shadow-brutal flex items-center gap-2 transition"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>إنشاء الغرفة وعرض باركود الانضمام</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
