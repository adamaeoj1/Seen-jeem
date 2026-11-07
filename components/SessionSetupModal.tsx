"use client";

import React, { useEffect, useState } from "react";
import {
  Atom,
  Bell,
  BookOpen,
  Bot,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  Clapperboard,
  Clock,
  Cpu,
  FileEdit,
  Gamepad2,
  Globe2,
  Image as ImageIcon,
  Keyboard,
  KeyRound,
  Landmark,
  LayoutGrid,
  Loader2,
  Music,
  Play,
  Plus,
  Puzzle,
  ScrollText,
  Sparkles,
  Trophy,
  Tv,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import {
  MiniGameId,
  SeenJeemCategory,
  SeenJeemQuestion,
} from "@/data/seedQuestions";
import {
  getRegionalSeedCategories,
  loadUserSubscription,
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
import { addCustomStudioCategory } from "@/lib/questionRandomizer";
import { compressImageFile } from "@/lib/imageCompressor";

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
      customRoomCode?: string;
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

  const allCategories = React.useMemo(() => {
    const regionalSeed = getRegionalSeedCategories(region);
    const customForRegion = customCategories.filter(
      (cc) => !cc.edition || cc.edition === region
    );
    const combined = [...regionalSeed, ...customForRegion];
    const seenTitles = new Set<string>();
    const seenIds = new Set<string>();
    const deduped: SeenJeemCategory[] = [];

    for (const cat of combined) {
      const normTitle = cat.title.trim().toLowerCase();
      if (!seenTitles.has(normTitle) && !seenIds.has(cat.id)) {
        seenTitles.add(normTitle);
        seenIds.add(cat.id);
        deduped.push(cat);
      }
    }
    return deduped;
  }, [region, studioRevision, customCategories]);

  const [sessionMode, setSessionMode] =
    useState<SessionModeConfig>(initialMode);
  const [teamCount, setTeamCount] = useState<2 | 3 | 4>(2);
  const [team1Name, setTeam1Name] = useState("");
  const [team1Color, setTeam1Color] = useState("#3B66B4");
  const [team2Name, setTeam2Name] = useState("");
  const [team2Color, setTeam2Color] = useState("#E65C2E");
  const [team3Name, setTeam3Name] = useState("");
  const [team3Color, setTeam3Color] = useState("#10B981");
  const [team4Name, setTeam4Name] = useState("");
  const [team4Color, setTeam4Color] = useState("#8B5CF6");
  const [timerSec, setTimerSec] = useState<30 | 45 | 60>(45);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  // AI Category Generator state
  const [aiTopicInput, setAiTopicInput] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  // Squad Secrets Photo Category state
  const [showSecretsModal, setShowSecretsModal] = useState(false);
  const [secretsTitle, setSecretsTitle] = useState("أسرار الشلة");
  const [secretPhotos, setSecretPhotos] = useState<
    Array<{
      photoUrl: string;
      question: string;
      answer: string;
      points: 200 | 400 | 600;
    }>
  >([
    {
      photoUrl: "",
      question: "شكون صاحب هاد الصورة الفضيحة فـ الصغر؟ 😂",
      answer: "أمين",
      points: 200,
    },
    {
      photoUrl: "",
      question: "فين تم التقاط هاد الصورة الجماعية السرية؟ 📸",
      answer: "مراكش",
      points: 200,
    },
    {
      photoUrl: "",
      question: "شنو كان الموقف المضحك ورا هاد اللقطة؟ 🎭",
      answer: "طاح فـ المسبح",
      points: 400,
    },
    {
      photoUrl: "",
      question: "شكون الشخص المتخفي ورا هاد المشهد؟ 🕵️‍♂️",
      answer: "ياسين",
      points: 400,
    },
    {
      photoUrl: "",
      question: "فـ أي عام ومناسبة وقع هاد الحدث التاريخي فـ الشلة؟ 🗓️",
      answer: "2023",
      points: 600,
    },
    {
      photoUrl: "",
      question: "من قال هاد الجملة الشهيرة الموثقة بهاد الصورة؟ 💬",
      answer: "طه",
      points: 600,
    },
  ]);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<number | null>(null);

  // Voucher & B2B Cafe state inside Host Setup
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherMsg, setVoucherMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [cafeNameInput, setCafeNameInput] = useState(cafeConfig.cafeName);
  const [cafeLogoInput, setCafeLogoInput] = useState(cafeConfig.cafeLogoUrl);

  // Frontend Adapter Toggles (18 vs 36 Board Size + Auto-Referee vs Buzzer Mode + Pro Custom Room Code)
  const [boardSize, setBoardSize] = useState<SeenJeemBoardSize>(18);
  const [answerMode, setAnswerMode] = useState<SeenJeemAnswerMode>("TYPING");
  const [customRoomCode, setCustomRoomCode] = useState("");
  const currentSub = loadUserSubscription();
  const isProUnlocked =
    currentSub.proSubscriptionActive ||
    currentSub.tier === "PRO_HOST" ||
    activeLicense?.prefix === "PROMOROCCO" ||
    activeLicense?.prefix === "CAFEMODE";

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
    setSelectedCats(allCategories.slice(0, 6).map((c) => c.id));
  }, [allCategories, edition.defaultTeam1Name, edition.defaultTeam2Name]);

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

  const handleGenerateAiCategory = async (overrideTopic?: string) => {
    const targetTopic = (overrideTopic || aiTopicInput).trim();
    if (!targetTopic) return;
    setIsGeneratingAi(true);
    setAiStatusMsg(null);
    try {
      const res = await fetch("/api/generate-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: targetTopic, edition: region }),
      });
      const data = await res.json();
      if (data.ok && data.category) {
        addCustomStudioCategory(data.category);
        setSelectedCats((prev) => [
          data.category.id,
          ...prev.filter((id) => id !== data.category.id).slice(0, 5),
        ]);
        setAiStatusMsg({
          ok: true,
          text: `تم توليد فئة «${data.category.title}» بنجاح وإضافتها للوحة اللعب! ⚡`,
        });
        setAiTopicInput("");
      } else {
        setAiStatusMsg({
          ok: false,
          text: data.error || "تعذر توليد الفئة، حاول مجدداً",
        });
      }
    } catch {
      setAiStatusMsg({
        ok: false,
        text: "حدث خطأ أثناء الاتصال بالمولّد الذكي",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handlePhotoUpload = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(index);
    try {
      const compressed = await compressImageFile(file, 720, 0.72);
      setSecretPhotos((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], photoUrl: compressed };
        return copy;
      });
    } catch (err) {
      console.error("Photo compression error:", err);
    } finally {
      setIsProcessingPhoto(null);
    }
  };

  const handleSaveSecretsCategory = () => {
    const catId = `cat-secrets-${Date.now()}`;
    const cleanTitle = secretsTitle.trim() || "أسرار الشلة";
    const questions: SeenJeemQuestion[] = secretPhotos.map((item, idx) => ({
      id: `${catId}-q${idx + 1}`,
      categoryId: catId,
      points: item.points,
      slotIndex: idx,
      question: item.question.trim() || "سؤال من أسرار الشلة",
      imageUrl: item.photoUrl || undefined,
      displayAnswer: item.answer.trim() || "الجواب",
      acceptedAnswers: [item.answer.trim() || "الجواب"],
      acceptedSynonyms: [],
      hint: "سؤال خاص وحصري لشلتنا!",
      funFact: "📸 سؤال من أسرار الشلة!",
    }));

    const cat: SeenJeemCategory = {
      id: catId,
      title: cleanTitle,
      subtitle: "مواقف، صور، وذكريات الشلة الخاصة",
      icon: "Camera",
      color: "#DE7A7A",
      edition: region,
      questions,
    };

    addCustomStudioCategory(cat);
    setSelectedCats((prev) => [
      cat.id,
      ...prev.filter((id) => id !== cat.id).slice(0, 5),
    ]);
    setShowSecretsModal(false);
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
      teamCount,
      team1Name: team1Name.trim() || edition.defaultTeam1Name,
      team1Color,
      team2Name: team2Name.trim() || edition.defaultTeam2Name,
      team2Color,
      team3Name: team3Name.trim() || edition.defaultTeam3Name,
      team3Color,
      team4Name: team4Name.trim() || edition.defaultTeam4Name,
      team4Color,
      timerSec,
      soundEnabled,
      musicEnabled,
    };
    const cleanCustomCode = isProUnlocked
      ? customRoomCode
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 8)
      : "";
    onConfirmStartSession(settings, selectedCats, initialMiniGame, {
      boardSize,
      answerMode,
      customRoomCode: cleanCustomCode.length >= 3 ? cleanCustomCode : undefined,
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
                  title: edition.boardModeTitle,
                  desc:
                    region === "EN"
                      ? "6 Categories • 200 to 600 pts • Play with Phone"
                      : `لوحة أسئلة تفاعلية مع اللعب ${edition.deviceTerm}`,
                  icon: <Tv className="w-5 h-5" />,
                },
                {
                  id: "MINI_GAMES" as SessionModeConfig,
                  title: edition.miniGamesTitle,
                  desc:
                    region === "EN"
                      ? "8 Fast-Paced Party Showdowns on Your Phone"
                      : `٨ تحديات سريعة وحركية ${edition.deviceTerm}`,
                  icon: <Gamepad2 className="w-5 h-5" />,
                },
                {
                  id: "MIXED_PARTY" as SessionModeConfig,
                  title: edition.combinedModeTitle,
                  desc:
                    region === "EN"
                      ? "Combine the Qadha Board + Party Showdowns"
                      : "اجمع بين لوحة قَدْهَا؟ التفاعلية والتحديات الفاصلة",
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

          {/* 2. Team Customization with 2, 3, or 4 Teams Support */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-black">
                ٢. تخصيص الفرق المتنافسة ({teamCount} فرق):
              </label>
              <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-xl border-2 border-black shadow-brutal-sm">
                <button
                  type="button"
                  onClick={() => setTeamCount(2)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                    teamCount === 2
                      ? "bg-black text-sunny shadow-brutal-sm"
                      : "text-black hover:bg-cream"
                  }`}
                >
                  فريقان (2)
                </button>
                <button
                  type="button"
                  onClick={() => setTeamCount(3)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                    teamCount === 3
                      ? "bg-royal text-white shadow-brutal-sm"
                      : "text-black hover:bg-cream"
                  }`}
                >
                  3 فرق 👑 PRO
                </button>
                <button
                  type="button"
                  onClick={() => setTeamCount(4)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                    teamCount === 4
                      ? "bg-burnt text-white shadow-brutal-sm"
                      : "text-black hover:bg-cream"
                  }`}
                >
                  4 فرق 👑 PRO/مقاهي
                </button>
              </div>
            </div>

            <div
              className={`grid gap-4 ${
                teamCount === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : teamCount === 3
                  ? "grid-cols-1 md:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {/* Team 1 */}
              <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-3 shadow-brutal-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black">اسم ولون الفريق الأول</label>
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TEAM_COLOR_SWATCHES.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setTeam1Color(col)}
                      className={`w-6 h-6 rounded-full border-2 border-black transition ${
                        team1Color === col ? "scale-110 ring-2 ring-black" : ""
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Team 2 */}
              <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-3 shadow-brutal-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black">اسم ولون الفريق الثاني</label>
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TEAM_COLOR_SWATCHES.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setTeam2Color(col)}
                      className={`w-6 h-6 rounded-full border-2 border-black transition ${
                        team2Color === col ? "scale-110 ring-2 ring-black" : ""
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Team 3 (Conditional) */}
              {teamCount >= 3 && (
                <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-3 shadow-brutal-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black">اسم ولون الفريق الثالث</label>
                    <span
                      className="w-5 h-5 rounded-full border-2 border-black"
                      style={{ backgroundColor: team3Color }}
                    />
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      maxLength={20}
                      value={team3Name}
                      onChange={(e) => setTeam3Name(e.target.value)}
                      placeholder={`مثال: ${edition.defaultTeam3Name}`}
                      className="w-full px-3 py-2 pl-9 rounded-xl border-2 border-black bg-cream font-black text-sm placeholder:text-gray-400"
                    />
                    {team3Name && (
                      <button
                        type="button"
                        onClick={() => setTeam3Name("")}
                        title="مسح الاسم"
                        className="absolute left-2 w-6 h-6 rounded-lg bg-black/10 hover:bg-coral text-black font-black text-xs flex items-center justify-center transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {TEAM_COLOR_SWATCHES.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setTeam3Color(col)}
                        className={`w-6 h-6 rounded-full border-2 border-black transition ${
                          team3Color === col ? "scale-110 ring-2 ring-black" : ""
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Team 4 (Conditional) */}
              {teamCount >= 4 && (
                <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-3 shadow-brutal-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black">اسم ولون الفريق الرابع</label>
                    <span
                      className="w-5 h-5 rounded-full border-2 border-black"
                      style={{ backgroundColor: team4Color }}
                    />
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      maxLength={20}
                      value={team4Name}
                      onChange={(e) => setTeam4Name(e.target.value)}
                      placeholder={`مثال: ${edition.defaultTeam4Name}`}
                      className="w-full px-3 py-2 pl-9 rounded-xl border-2 border-black bg-cream font-black text-sm placeholder:text-gray-400"
                    />
                    {team4Name && (
                      <button
                        type="button"
                        onClick={() => setTeam4Name("")}
                        title="مسح الاسم"
                        className="absolute left-2 w-6 h-6 rounded-lg bg-black/10 hover:bg-coral text-black font-black text-xs flex items-center justify-center transition"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {TEAM_COLOR_SWATCHES.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setTeam4Color(col)}
                        className={`w-6 h-6 rounded-full border-2 border-black transition ${
                          team4Color === col ? "scale-110 ring-2 ring-black" : ""
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2B. Pro Exclusive Custom Room Code (مثل: ADAM أو KASSARA) */}
          <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-brutal-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-black text-black">
                  🎯 اختيار رمز غرفة مخصص باسمك (مثل: ADAM أو KASSARA)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sunny text-black border border-black text-[10px] font-black">
                  👑 حصري لمشتركي PRO الشهري
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-600 mt-0.5">
                {isProUnlocked
                  ? "ميزة PRO مفعلة! اكتب رمز الغرفة المخصص (3 إلى 8 أحرف إنجليزية/أرقام) أو اتركه فارغاً لتوليد رمز تلقائي."
                  : "فعّل اشتراك المضيف المحترف PRO (70 DH / $7.99) لاختيار كود غرفة باسمك أو اسم شلتك."}
              </p>
            </div>
            <div className="w-full sm:w-56 shrink-0">
              <input
                type="text"
                dir="ltr"
                disabled={!isProUnlocked}
                maxLength={8}
                value={customRoomCode}
                onChange={(e) =>
                  setCustomRoomCode(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                  )
                }
                placeholder={isProUnlocked ? "ADAM / KASSARA" : "🔒 PRO ONLY"}
                className={`w-full px-3.5 py-2 rounded-xl border-2 border-black font-mono font-black text-sm uppercase tracking-widest text-center ${
                  isProUnlocked
                    ? "bg-cream text-black"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              />
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

          {/* 3B. AI Category Generator in 5 Seconds (Exclusive to PRO) */}
          {(sessionMode === "SEEN_JEEM" || sessionMode === "MIXED_PARTY") && (
            <div className="bg-sunny/30 border-3 border-black rounded-2xl p-4 shadow-brutal-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-black text-sunny flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs md:text-sm font-black text-black">
                      🤖 مولّد الفئات بالذكاء الاصطناعي في 5 ثوانٍ
                    </span>
                    <span className="mr-2 px-2 py-0.5 rounded-full bg-royal text-white text-[10px] font-black">
                      👑 حصري لباقة PRO
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSecretsModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-coral text-black border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-brutal-sm hover:bg-rose-400 transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>📸 صانع فئة «أسرار الشلة» بالصور</span>
                </button>
              </div>

              <p className="text-[11px] font-bold text-gray-700">
                اكتب أي موضوع تريده (مثلاً: كرة القدم، مسلسلات رمضان، أنمي، ذكريات الشلة) وسيقوم الذكاء الاصطناعي بتوليد 6 أسئلة متدرجة الصعوبة (200، 400، 600) فوراً!
              </p>

              {/* Quick suggestion chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-gray-600">اقتراحات سريعة:</span>
                {[
                  "كرة القدم المغربية 🇲🇦",
                  "أنمي ون بيس ودراغون بول ⚔️",
                  "أفلام ومسلسلات عالمية 🎬",
                  "أغاني وموسيقى الراب 🎵",
                  "تاريخ وحضارات الأندلس 🏰",
                  "سيتكومات ومسلسلات مغربية 📺",
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    disabled={isGeneratingAi}
                    onClick={() => {
                      setAiTopicInput(sug);
                      handleGenerateAiCategory(sug);
                    }}
                    className="px-2 py-1 rounded-lg bg-white border border-black text-[10px] font-black hover:bg-sunny transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={(e) => setAiTopicInput(e.target.value)}
                  placeholder="اكتب اسم أو موضوع الفئة المطلوبة..."
                  disabled={isGeneratingAi}
                  className="flex-1 px-3.5 py-2 rounded-xl border-2 border-black bg-white font-black text-xs md:text-sm placeholder:text-gray-400"
                />
                <button
                  type="button"
                  disabled={isGeneratingAi || !aiTopicInput.trim()}
                  onClick={() => handleGenerateAiCategory()}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-sunny font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التوليد بالذكاء الاصطناعي...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sunny" />
                      <span>توليد فئة فورية ⚡</span>
                    </>
                  )}
                </button>
              </div>

              {aiStatusMsg && (
                <div
                  className={`px-3 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 ${
                    aiStatusMsg.ok ? "bg-mint text-black" : "bg-coral text-black"
                  }`}
                >
                  {aiStatusMsg.ok ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span>⚠️</span>
                  )}
                  <span>{aiStatusMsg.text}</span>
                </div>
              )}
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

      {/* Squad Secrets Custom Photo Category Creator Modal */}
      {showSecretsModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          dir="rtl"
        >
          <div className="bg-cream border-4 border-black rounded-3xl shadow-brutal-lg max-w-3xl w-full overflow-hidden my-6">
            <div className="bg-coral border-b-4 border-black px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-6 h-6 text-black" />
                <h3 className="text-xl font-black text-black">
                  📸 صانع فئة «أسرار الشلة» بالصور الخاصة (حصري لـ PRO)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSecretsModal(false)}
                className="w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-brutal-sm"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
              <div className="bg-white border-2 border-black rounded-2xl p-4 shadow-brutal-sm space-y-2">
                <label className="block text-xs font-black">
                  اسم الفئة (مثلاً: أسرار الشلة، فضائح أصدقاء الطفولة):
                </label>
                <input
                  type="text"
                  value={secretsTitle}
                  onChange={(e) => setSecretsTitle(e.target.value)}
                  placeholder="أسرار الشلة"
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-black bg-cream font-black text-sm"
                />
                <p className="text-[11px] font-bold text-gray-600">
                  سيتم ضغط الصور تلقائياً بدقة ممتازة وسريعة، وستظهر شارة «📸 سؤال من أسرار الشلة!» عند فتح السؤال على التلفزيون!
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-black">
                  الأسئلة الستة والصور (2x 200، 2x 400، 2x 600):
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {secretPhotos.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white border-2 border-black rounded-2xl p-3.5 space-y-2.5 shadow-brutal-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-lg bg-black text-sunny font-black text-[10px]">
                          سؤال {idx + 1} ({item.points} نقطة)
                        </span>
                        {item.photoUrl ? (
                          <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تم رفع الصورة</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-500">
                            بدون صورة
                          </span>
                        )}
                      </div>

                      {/* Photo preview / upload input */}
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl border-2 border-black bg-cream overflow-hidden shrink-0 flex items-center justify-center relative">
                          {item.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.photoUrl}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                          {isProcessingPhoto === idx && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-sunny animate-spin" />
                            </div>
                          )}
                        </div>
                        <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-sunny hover:bg-yellow-400 border-2 border-black text-black font-black text-xs shadow-brutal-sm flex items-center gap-1.5 transition">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{item.photoUrl ? "تغيير الصورة" : "اختر صورة 📸"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(idx, e)}
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black mb-1">
                          نص السؤال:
                        </label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSecretPhotos((prev) => {
                              const copy = [...prev];
                              copy[idx] = { ...copy[idx], question: val };
                              return copy;
                            });
                          }}
                          placeholder="اكتب السؤال..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-black bg-cream font-black text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black mb-1">
                          الجواب الصحيح:
                        </label>
                        <input
                          type="text"
                          value={item.answer}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSecretPhotos((prev) => {
                              const copy = [...prev];
                              copy[idx] = { ...copy[idx], answer: val };
                              return copy;
                            });
                          }}
                          placeholder="الجواب الصحيح..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-black bg-cream font-black text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSecretsModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-white border-2 border-black font-black text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveSecretsCategory}
                  className="px-6 py-2.5 rounded-xl bg-coral hover:bg-rose-500 text-black font-black text-xs border-2 border-black shadow-brutal-sm flex items-center gap-2 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ فئة أسرار الشلة وإضافتها للوحة اللعب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
