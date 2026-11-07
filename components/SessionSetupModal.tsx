"use client";

import React, { useEffect, useState } from "react";
import {
  Atom,
  Bell,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Clapperboard,
  Clock,
  Cpu,
  FileEdit,
  Gamepad2,
  Globe2,
  Keyboard,
  KeyRound,
  Landmark,
  LayoutGrid,
  Music,
  Play,
  Puzzle,
  ScrollText,
  Sparkles,
  Trophy,
  Tv,
  Volume2,
  X,
} from "lucide-react";
import {
  MiniGameId,
  SeenJeemCategory,
} from "@/data/seedQuestions";
import {
  getRegionalSeedCategories,
  RoomSettings,
  SessionModeConfig,
} from "@/lib/gameEngine";
import {
  isDefaultTeamName,
  SeenJeemAnswerMode,
  SeenJeemBoardSize,
  useEdition,
} from "@/lib/editionManager";
import { useVoucherLicense } from "@/lib/voucherEngine";

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
    startMiniGameId?: MiniGameId,
    adapterConfig?: {
      boardSize: SeenJeemBoardSize;
      answerMode: SeenJeemAnswerMode;
    }
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
  const { region, edition } = useEdition();
  const {
    activeLicense,
    isB2BCafeUnlocked,
    cafeConfig,
    saveCafeConfig,
    redeemVoucher,
  } = useVoucherLicense();
  const [studioRevision, setStudioRevision] = useState(0);
  useEffect(() => {
    const onBankUpdated = () => setStudioRevision((r) => r + 1);
    window.addEventListener("qadha_question_bank_updated", onBankUpdated);
    return () =>
      window.removeEventListener("qadha_question_bank_updated", onBankUpdated);
  }, []);

  const regionalSeedCategories = React.useMemo(
    () => getRegionalSeedCategories(region),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [region, studioRevision]
  );
  const allCategories = [
    ...regionalSeedCategories,
    ...customCategories.filter(
      (cc) => !regionalSeedCategories.some((rc) => rc.id === cc.id)
    ),
  ];

  const [sessionMode, setSessionMode] =
    useState<SessionModeConfig>(initialMode);
  const [team1Name, setTeam1Name] = useState("");
  const [team1Color, setTeam1Color] = useState("#3B66B4");
  const [team2Name, setTeam2Name] = useState("");
  const [team2Color, setTeam2Color] = useState("#E65C2E");
  const [timerSec, setTimerSec] = useState<30 | 45 | 60>(45);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  // Voucher & B2B Cafe state inside Host Setup
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherMsg, setVoucherMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [cafeNameInput, setCafeNameInput] = useState(cafeConfig.cafeName);
  const [cafeLogoInput, setCafeLogoInput] = useState(cafeConfig.cafeLogoUrl);

  // Frontend Adapter Toggles (18 vs 36 Board Size + Auto-Referee vs Buzzer Mode)
  const [boardSize, setBoardSize] = useState<SeenJeemBoardSize>(18);
  const [answerMode, setAnswerMode] = useState<SeenJeemAnswerMode>("TYPING");

  const [selectedCats, setSelectedCats] = useState<string[]>(() =>
    getRegionalSeedCategories(region)
      .slice(0, 6)
      .map((c) => c.id)
  );

  useEffect(() => {
    setCafeNameInput(cafeConfig.cafeName);
    setCafeLogoInput(cafeConfig.cafeLogoUrl);
  }, [cafeConfig.cafeName, cafeConfig.cafeLogoUrl]);

  // Sync regional categories when region switches
  useEffect(() => {
    setTeam1Name((prev) => (isDefaultTeamName(prev) ? "" : prev));
    setTeam2Name((prev) => (isDefaultTeamName(prev) ? "" : prev));
    setSelectedCats(
      getRegionalSeedCategories(region)
        .slice(0, 6)
        .map((c) => c.id)
    );
  }, [region, edition.defaultTeam1Name, edition.defaultTeam2Name]);

  useEffect(() => {
    setSessionMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleApplyVoucher = () => {
    const res = redeemVoucher(voucherInput);
    setVoucherMsg({ ok: res.success, text: res.messageAr });
    if (res.success) {
      setVoucherInput("");
    }
  };

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
      case "Trophy":
        return <Trophy className="w-6 h-6" />;
      case "Landmark":
        return <Landmark className="w-6 h-6" />;
      case "Puzzle":
        return <Puzzle className="w-6 h-6" />;
      case "Clapperboard":
      case "Film":
        return <Clapperboard className="w-6 h-6" />;
      case "Atom":
        return <Atom className="w-6 h-6" />;
      case "ScrollText":
      case "Compass":
        return <ScrollText className="w-6 h-6" />;
      case "Globe2":
      case "Globe":
        return <Globe2 className="w-6 h-6" />;
      case "Cpu":
      case "Gamepad2":
        return <Cpu className="w-6 h-6" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isB2BCafeUnlocked) {
      saveCafeConfig({
        enabled: true,
        cafeName: cafeNameInput.trim() || "مقهى الأبطال",
        cafeLogoUrl: cafeLogoInput.trim(),
      });
    }
    const settings: RoomSettings = {
      sessionMode,
      team1Name: team1Name.trim() || edition.defaultTeam1Name,
      team1Color,
      team2Name: team2Name.trim() || edition.defaultTeam2Name,
      team2Color,
      timerSec,
      soundEnabled,
      musicEnabled,
    };
    onConfirmStartSession(settings, selectedCats, initialMiniGame, {
      boardSize,
      answerMode,
    });
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
              الخطوة ١ من ٣ • إعداد {edition.partyTerm}
            </span>
            <h2 className="text-2xl font-black text-black mt-0.5">
              إعداد جلسة اللعب ({edition.gatheringPhrase})
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
          {/* Prominent Voucher Input Bar at Top of Host Setup Screen */}
          <div className="bg-sunny/40 border-3 border-black rounded-2xl p-4 shadow-brutal-sm space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs md:text-sm font-black text-black">
                🎟️ عندك كود تفعيل؟ أدخل كود القصارة
              </span>
              {activeLicense && (
                <span className="px-2.5 py-0.5 rounded-full bg-mint text-black border border-black text-[11px] font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{activeLicense.labelAr}</span>
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                dir="ltr"
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                placeholder="KASSARA24-XXXXXX-XXXXXX"
                className="flex-1 px-3.5 py-2 rounded-xl border-2 border-black bg-white font-mono font-black text-xs md:text-sm uppercase tracking-wider text-center sm:text-left"
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                className="px-5 py-2 rounded-xl bg-black text-sunny font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تفعيل الكود</span>
              </button>
            </div>
            {voucherMsg && (
              <div
                className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black ${
                  voucherMsg.ok ? "bg-mint text-black" : "bg-coral text-black"
                }`}
              >
                {voucherMsg.text}
              </div>
            )}
          </div>

          {/* B2B Cafe Branding Panel (Unlocked when B2B_CAFE license is active) */}
          {isB2BCafeUnlocked && (
            <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-brutal-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-black flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-royal" />
                  <span>إعدادات المقهى / النادي (B2B):</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-sunny border border-black text-[10px] font-black">
                  سهرة برعاية: {cafeNameInput || "مقهى الأبطال"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black mb-1">
                    اسم المقهى / النادي الجامعي
                  </label>
                  <input
                    type="text"
                    value={cafeNameInput}
                    onChange={(e) => setCafeNameInput(e.target.value)}
                    placeholder="مثال: مقهى أطلس گيمنگ"
                    className="w-full px-3 py-2 rounded-xl border-2 border-black bg-cream font-black text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black mb-1">
                    رابط الشعار (Logo URL - اختياري)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={cafeLogoInput}
                    onChange={(e) => setCafeLogoInput(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 rounded-xl border-2 border-black bg-cream font-mono font-bold text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 1. Choose Game Mode */}
          <div>
            <label className="block text-sm font-black mb-2.5">
              ١. اختر نظام {edition.partyTerm} في قَدْهَا؟:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: "SEEN_JEEM" as SessionModeConfig,
                  title: "لوحة قَدْهَا؟ التفاعلية",
                  desc: `لوحة أسئلة تفاعلية مع اللعب ${edition.deviceTerm}`,
                  icon: <Tv className="w-5 h-5" />,
                },
                {
                  id: "MINI_GAMES" as SessionModeConfig,
                  title: "تحديات قَدْهَا؟ الثمانية",
                  desc: `٨ تحديات سريعة وحركية ${edition.deviceTerm}`,
                  icon: <Gamepad2 className="w-5 h-5" />,
                },
                {
                  id: "MIXED_PARTY" as SessionModeConfig,
                  title:
                    region === "MA"
                      ? "الگلسة المدمجة (اللوحة + التحديات)"
                      : "السهرة المدمجة (اللوحة + التحديات)",
                  desc: "اجمع بين لوحة قَدْهَا؟ التفاعلية والتحديات الفاصلة",
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

          {/* 2. Team Customization (Empty initial value + Placeholder + Quick Clear ✕ Button) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-3 shadow-brutal-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black">
                  اسم ولون الفريق الأول
                </label>
                <span
                  className="w-5 h-5 rounded-full border-2 border-black"
                  style={{ backgroundColor: team1Color }}
                />
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  maxLength={20}
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value)}
                  placeholder={`مثال: ${edition.defaultTeam1Name}`}
                  className="w-full px-3 py-2 pl-9 rounded-xl border-2 border-black bg-cream font-black text-sm placeholder:text-gray-400"
                />
                {team1Name && (
                  <button
                    type="button"
                    onClick={() => setTeam1Name("")}
                    title="مسح الاسم"
                    className="absolute left-2 w-6 h-6 rounded-lg bg-black/10 hover:bg-coral text-black font-black text-xs flex items-center justify-center transition"
                  >
                    ✕
                  </button>
                )}
              </div>
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
                <label className="text-xs font-black">
                  اسم ولون الفريق الثاني
                </label>
                <span
                  className="w-5 h-5 rounded-full border-2 border-black"
                  style={{ backgroundColor: team2Color }}
                />
              </div>
              <div className="relative flex items-center">
                <input
                  type="text"
                  maxLength={20}
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value)}
                  placeholder={`مثال: ${edition.defaultTeam2Name}`}
                  className="w-full px-3 py-2 pl-9 rounded-xl border-2 border-black bg-cream font-black text-sm placeholder:text-gray-400"
                />
                {team2Name && (
                  <button
                    type="button"
                    onClick={() => setTeam2Name("")}
                    title="مسح الاسم"
                    className="absolute left-2 w-6 h-6 rounded-lg bg-black/10 hover:bg-coral text-black font-black text-xs flex items-center justify-center transition"
                  >
                    ✕
                  </button>
                )}
              </div>
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

          {/* 3. Qadha Board Size (18 vs 36) & Answer Mode (Auto-Referee vs Buzzer) */}
          {(sessionMode === "SEEN_JEEM" || sessionMode === "MIXED_PARTY") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-2.5 shadow-brutal-sm">
                <label className="text-xs font-black flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-royal" />
                  <span>حجم لوحة قَدْهَا؟:</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setBoardSize(18)}
                    className={`p-2.5 rounded-xl border-2 border-black font-black text-xs text-right transition ${
                      boardSize === 18
                        ? "bg-sunny text-black shadow-brutal-sm"
                        : "bg-cream text-gray-700"
                    }`}
                  >
                    جلسة سريعة (18 سؤال: 200، 400، 600)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoardSize(36)}
                    className={`p-2.5 rounded-xl border-2 border-black font-black text-xs text-right transition ${
                      boardSize === 36
                        ? "bg-sunny text-black shadow-brutal-sm"
                        : "bg-cream text-gray-700"
                    }`}
                  >
                    جلسة مطولة (36 سؤال)
                  </button>
                </div>
              </div>

              <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-2.5 shadow-brutal-sm">
                <label className="text-xs font-black flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-burnt" />
                  <span>طريقة الإجابة في قَدْهَا؟:</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnswerMode("TYPING")}
                    className={`p-2.5 rounded-xl border-2 border-black font-black text-xs text-right flex items-center justify-between transition ${
                      answerMode === "TYPING"
                        ? "bg-royal text-white shadow-brutal-sm"
                        : "bg-cream text-gray-700"
                    }`}
                  >
                    <span>كتابة بالتليفون (Auto-Referee)</span>
                    <Keyboard className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnswerMode("BUZZER")}
                    className={`p-2.5 rounded-xl border-2 border-black font-black text-xs text-right flex items-center justify-between transition ${
                      answerMode === "BUZZER"
                        ? "bg-burnt text-white shadow-brutal-sm"
                        : "bg-cream text-gray-700"
                    }`}
                  >
                    <span>جرس الأسبقية (Buzzer Mode)</span>
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Visual Category Picker (for SEEN_JEEM or MIXED_PARTY) */}
          {(sessionMode === "SEEN_JEEM" || sessionMode === "MIXED_PARTY") && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-black">
                    ٢. اختر ٦ فئات للوحة قَدْهَا؟ ({selectedCats.length}/6):
                  </label>
                </div>
                <button
                  type="button"
                  onClick={onOpenCustomBuilder}
                  className="px-3 py-1.5 rounded-xl bg-sunny border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-brutal-sm"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>✏️ استوديو وتعديل الأسئلة</span>
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
                          {boardSize === 18 ? 3 : cat.questions.length} أسئلة
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Timer Duration & Audio Toggles */}
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
                    soundEnabled
                      ? "bg-mint text-black"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>الأصوات: {soundEnabled ? "مفعّلة" : "صامت"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className={`py-2 px-3 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition ${
                    musicEnabled
                      ? "bg-sunny text-black"
                      : "bg-gray-200 text-gray-600"
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
