"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Brain,
  Crown,
  Eye,
  FileEdit,
  FileText,
  Gamepad2,
  Hash,
  HelpCircle,
  MapPin,
  Palette,
  Play,
  QrCode,
  ScanSearch,
  Smartphone,
  Sparkles,
  Tag,
  Ticket,
  Tv,
  User,
  Volume2,
  Zap,
} from "lucide-react";
import {
  canHostCreateSession,
  createInitialRoomState,
  generateRoomCode,
  loadSavedPlayerIdentity,
  loadUserSubscription,
  MINI_GAMES_META,
  profileToSubscriptionState,
  RoomSettings,
  savePlayerIdentity,
  saveRoomToLocalAndBroadcast,
  saveUserSubscription,
  SessionModeConfig,
  TeamId,
  UserSubscriptionState,
} from "@/lib/gameEngine";
import { MiniGameId, SeenJeemCategory } from "@/data/seedQuestions";
import {
  AvatarCharacterId,
  CartoonAvatar,
  getRegionalAvatarCharacters,
  normalizeAvatarId,
} from "@/components/CartoonAvatars";
import { playVoicePack, VOICE_PACKS, VoicePackId } from "@/lib/soundEffects";
import {
  fetchCurrentProfile,
  getCachedProfile,
  UserProfileRecord,
} from "@/lib/db";
import {
  BUZZER_MODE_MARKER,
  EditionOnboardingGate,
  SeenJeemAnswerMode,
  SeenJeemBoardSize,
  setRoomAdapterState,
  useEdition,
} from "@/lib/editionManager";
import { useGoogleAuthDomainFix } from "@/lib/authFixHelper";
import { PricingModal } from "@/components/PricingModal";
import { CustomBuilderModal } from "@/components/CustomBuilderModal";
import { SessionSetupModal } from "@/components/SessionSetupModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { AuthModal } from "@/components/AuthModal";
import { DevDrawer } from "@/components/DevDrawer";

export default function LandingPage() {
  const router = useRouter();
  const { region, edition } = useEdition();
  const regionalAvatars = getRegionalAvatarCharacters(region);

  const [profile, setProfile] = useState<UserProfileRecord>(() =>
    getCachedProfile()
  );
  const [subscription, setSubscription] = useState<UserSubscriptionState>(() =>
    loadUserSubscription()
  );

  useGoogleAuthDomainFix({
    onSuccess: (nextProf) => {
      setProfile(nextProf);
      setSubscription(profileToSubscriptionState(nextProf));
    },
  });

  // Setup Wizard state
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupInitialMode, setSetupInitialMode] =
    useState<SessionModeConfig>("SEEN_JEEM");
  const [setupInitialMiniGame, setSetupInitialMiniGame] =
    useState<MiniGameId>("SPEED_TRIVIA");

  // Player Join state (Never pre-fill input value with hardcoded defaults)
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerAvatar, setPlayerAvatar] =
    useState<AvatarCharacterId>("abu_sultan");
  const [playerVoice, setPlayerVoice] = useState<VoicePackId>("hype_horn");
  const [playerTeam, setPlayerTeam] = useState<TeamId>("team1");
  const [previewRoomTeams, setPreviewRoomTeams] = useState<{
    team1: string;
    team2: string;
  } | null>(null);

  // Modals
  const [editionModalOpen, setEditionModalOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [paywallTriggered, setPaywallTriggered] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    fetchCurrentProfile().then((prof) => {
      setProfile(prof);
      setSubscription(profileToSubscriptionState(prof));
    });

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get("room")?.toUpperCase().trim();
      if (roomParam) {
        setJoinCode(roomParam.slice(0, 6));
      }
    }

    const savedPlayer = loadSavedPlayerIdentity();
    if (savedPlayer) {
      setPlayerAvatar(normalizeAvatarId(savedPlayer.avatar));
      setPlayerVoice((savedPlayer.voiceId as VoicePackId) || "hype_horn");
      setPlayerTeam(savedPlayer.team);
    }
  }, []);

  // Dynamically fetch custom team names when a 4-character room code is typed
  useEffect(() => {
    const clean = joinCode.trim().toUpperCase();
    if (clean.length < 4) {
      setPreviewRoomTeams(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/rooms/${encodeURIComponent(clean)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const r = data.room || data;
        const t1 = r?.teams?.team1?.name || r?.teamA?.name;
        const t2 = r?.teams?.team2?.name || r?.teamB?.name;
        if (t1 && t2) {
          setPreviewRoomTeams({ team1: t1, team2: t2 });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [joinCode]);

  const handleUpdateSubscription = (nextSub: UserSubscriptionState) => {
    setSubscription(nextSub);
    saveUserSubscription(nextSub);
    setProfile(getCachedProfile());
  };

  const handleProfileChange = (nextProf: UserProfileRecord) => {
    setProfile(nextProf);
    setSubscription(profileToSubscriptionState(nextProf));
  };

  const handleSaveCustomCategory = (newCat: SeenJeemCategory) => {
    const nextSub: UserSubscriptionState = {
      ...subscription,
      customCategories: [...(subscription.customCategories || []), newCat],
    };
    handleUpdateSubscription(nextSub);
  };

  const openSessionSetupWizard = (
    mode: SessionModeConfig = "SEEN_JEEM",
    miniGame: MiniGameId = "SPEED_TRIVIA"
  ) => {
    const check = canHostCreateSession(subscription);
    if (!check.allowed) {
      setPaywallTriggered(true);
      setPricingOpen(true);
      return;
    }
    setSetupInitialMode(mode);
    setSetupInitialMiniGame(miniGame);
    setSetupModalOpen(true);
  };

  const handleConfirmCreateRoom = (
    settings: RoomSettings,
    selectedCategoryIds: string[],
    startMiniGameId?: MiniGameId,
    adapterConfig?: {
      boardSize: SeenJeemBoardSize;
      answerMode: SeenJeemAnswerMode;
    }
  ) => {
    const check = canHostCreateSession(subscription);
    if (!check.allowed) {
      setSetupModalOpen(false);
      setPaywallTriggered(true);
      setPricingOpen(true);
      return;
    }

    // Consume 1 free session if on FREE_TRIAL
    if (
      subscription.tier === "FREE_TRIAL" &&
      !subscription.proSubscriptionActive &&
      subscription.freeSessionsRemaining > 0
    ) {
      const updated: UserSubscriptionState = {
        ...subscription,
        freeSessionsRemaining: Math.max(
          0,
          subscription.freeSessionsRemaining - 1
        ),
      };
      handleUpdateSubscription(updated);
    }

    const code = generateRoomCode();
    const resolvedSettings: RoomSettings = {
      ...settings,
      team1Name: settings.team1Name?.trim() || edition.defaultTeam1Name,
      team2Name: settings.team2Name?.trim() || edition.defaultTeam2Name,
    };

    const initialRoom = createInitialRoomState(
      code,
      subscription.tier,
      subscription.customCategories || [],
      resolvedSettings,
      selectedCategoryIds
    );
    if (startMiniGameId) {
      initialRoom.activeMiniGameId = startMiniGameId;
    }

    const chosenBoardSize = adapterConfig?.boardSize || 18;
    const chosenAnswerMode = adapterConfig?.answerMode || "TYPING";

    initialRoom.edition = region;
    initialRoom.boardSize = chosenBoardSize;
    initialRoom.answeringMode = chosenAnswerMode;
    initialRoom.teamA = { name: resolvedSettings.team1Name, score: 0 };
    initialRoom.teamB = { name: resolvedSettings.team2Name, score: 0 };

    setRoomAdapterState(code, {
      boardSize: chosenBoardSize,
      answerMode: chosenAnswerMode,
      manualAwardedInRound: false,
    });

    if (chosenAnswerMode === "BUZZER") {
      initialRoom.roundSummaryText = BUZZER_MODE_MARKER;
    }

    saveRoomToLocalAndBroadcast(initialRoom);
    setSetupModalOpen(false);
    router.push(`/host/${code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.toUpperCase().trim().slice(0, 6);
    if (!cleanCode) return;
    const cleanName = playerName.trim() || "لاعب";
    const saved = loadSavedPlayerIdentity();
    const pid = saved?.id || "p-" + Math.random().toString(36).slice(2, 9);

    savePlayerIdentity({
      id: pid,
      name: cleanName,
      avatar: playerAvatar,
      voiceId: playerVoice,
      team: playerTeam,
    });

    playVoicePack(playerVoice, true);
    router.push(`/play/${cleanCode}`);
  };

  const getMiniGameIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="w-6 h-6" />;
      case "Brain":
      case "Sparkles":
        return <Brain className="w-6 h-6" />;
      case "BadgeDollarSign":
      case "Tag":
        return <BadgeDollarSign className="w-6 h-6" />;
      case "ScanSearch":
      case "Eye":
        return <ScanSearch className="w-6 h-6" />;
      case "Hash":
        return <Hash className="w-6 h-6" />;
      case "Palette":
        return <Palette className="w-6 h-6" />;
      case "MapPin":
        return <MapPin className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const selectedAvatarMeta =
    regionalAvatars.find((c) => c.id === playerAvatar) || regionalAvatars[0];

  return (
    <div className="min-h-screen bg-cream text-black flex flex-col">
      {/* First-Time Edition Onboarding Gate (or triggered from Home Screen badge) */}
      <EditionOnboardingGate
        forceOpen={editionModalOpen}
        onClose={() => setEditionModalOpen(false)}
      />

      {/* Streamlined Top Header */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b-4 border-black px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Right: App Logo + Subtle Current Edition Badge (Clickable ONLY on Home Screen) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sunny border-3 border-black shadow-brutal-sm flex items-center justify-center text-xl font-black">
              ق؟
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-tight">
                  قَدْهَا؟
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black text-sunny font-mono text-[10px] font-black tracking-wider">
                  QADHA
                </span>
                <button
                  type="button"
                  onClick={() => setEditionModalOpen(true)}
                  title="تغيير النسخة الإقليمية"
                  className="px-2.5 py-0.5 rounded-full bg-white hover:bg-sunny text-black border-2 border-black text-[11px] font-black shadow-brutal-sm flex items-center gap-1 transition"
                >
                  <span>{edition.switcherLabel}</span>
                  <span className="text-[9px] opacity-70">▾</span>
                </button>
              </div>
              <div className="text-[11px] font-bold text-gray-700">
                {edition.gatheringPhrase} • اللعب {edition.deviceTerm}
              </div>
            </div>
          </div>

          {/* Left: Only [🎟️ تفعيل كود / الباقات] and [👤 حسابي] */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setPaywallTriggered(false);
                setPricingOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-sunny hover:bg-yellow-300 border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5 transition"
            >
              <Ticket className="w-4 h-4 text-black" />
              <span>🎟️ تفعيل كود / الباقات</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-black text-white border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-sunny" />
              <span>👤 {profile.email ? profile.name : "حسابي"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-10 space-y-14">
        {/* Hero Dual Grid: Create Room (Host) vs Join Room (Player Controller) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Right Column: Host Card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-royal text-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg flex flex-col justify-between"
          >
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sunny text-black border-2 border-black shadow-brutal-sm text-xs font-black">
                <Sparkles className="w-4 h-4" />
                <span>
                  {edition.partyTerm} • {edition.gatheringPhrase} •{" "}
                  {edition.deviceTerm}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black leading-tight">
                أقوى تحديات{" "}
                <span className="text-sunny underline decoration-wavy">
                  لوحة قَدْهَا؟ التفاعلية
                </span>{" "}
                و{" "}
                <span className="text-coral bg-black px-3 py-0.5 rounded-xl border-2 border-white inline-block mt-1">
                  تحديات قَدْهَا؟ الثمانية
                </span>
              </h1>

              <p className="text-cream/95 text-sm md:text-base font-bold leading-relaxed max-w-xl">
                مثالية {edition.gatheringPhrase} في {edition.partyTerm}! اعرض
                لوحة اللعب على الشاشة الرئيسية، وخلّ كل لاعب يدخل{" "}
                {edition.deviceTerm} ليجيب أو يضغط جرس الأسبقية بين{" "}
                {edition.defaultTeam1Name} و{edition.defaultTeam2Name}!
              </p>

              {/* 3 Mode Quick Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("SEEN_JEEM")}
                  className="p-3.5 rounded-2xl border-3 border-black bg-white/10 hover:bg-sunny hover:text-black text-right transition group"
                >
                  <Tv className="w-5 h-5 text-sunny group-hover:text-black mb-1.5" />
                  <div className="font-black text-sm">لوحة قَدْهَا؟ التفاعلية</div>
                  <div className="text-[11px] font-bold opacity-80">
                    ١٨ أو ٣٦ سؤالاً + جرس الأسبقية
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("MINI_GAMES")}
                  className="p-3.5 rounded-2xl border-3 border-black bg-white/10 hover:bg-sunny hover:text-black text-right transition group"
                >
                  <Gamepad2 className="w-5 h-5 text-sunny group-hover:text-black mb-1.5" />
                  <div className="font-black text-sm">تحديات قَدْهَا؟ الثمانية</div>
                  <div className="text-[11px] font-bold opacity-80">
                    ٨ تحديات سريعة {edition.deviceTerm}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("MIXED_PARTY")}
                  className="p-3.5 rounded-2xl border-3 border-black bg-white/10 hover:bg-sunny hover:text-black text-right transition group"
                >
                  <Sparkles className="w-5 h-5 text-sunny group-hover:text-black mb-1.5" />
                  <div className="font-black text-sm">
                    {region === "MA"
                      ? "الگلسة المدمجة (اللوحة + التحديات)"
                      : "السهرة المدمجة (اللوحة + التحديات)"}
                  </div>
                  <div className="text-[11px] font-bold opacity-80">
                    لوحة قَدْهَا؟ + التحديات الثمانية
                  </div>
                </button>
              </div>
            </div>

            {/* Primary Host CTAs + Secondary Body Actions ("كيف تشتغل اللعبة؟" & "استوديو الأسئلة") */}
            <div className="mt-8 pt-5 border-t-2 border-white/20 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("SEEN_JEEM")}
                  className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-sunny hover:bg-yellow-300 text-black font-black text-lg border-4 border-black shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2.5 transition"
                >
                  <Play className="w-5 h-5 fill-black" />
                  <span>افتح جلسة لعب ({edition.partyTerm})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaywallTriggered(false);
                    setPricingOpen(true);
                  }}
                  className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-burnt hover:bg-orange-600 text-white font-black text-sm border-4 border-black shadow-brutal flex items-center justify-center gap-2 transition"
                >
                  <Crown className="w-5 h-5 text-sunny" />
                  <span>
                    {edition.ticketName} ({edition.currencySymbol})
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setHowItWorksOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-sunny hover:text-black text-white border-2 border-black text-xs font-black flex items-center gap-1.5 transition"
                >
                  <HelpCircle className="w-4 h-4 text-sunny" />
                  <span>كيف تشتغل اللعبة؟</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-sunny hover:text-black text-white border-2 border-black text-xs font-black flex items-center gap-1.5 transition"
                >
                  <FileEdit className="w-4 h-4 text-sunny" />
                  <span>✏️ استوديو وتعديل الأسئلة</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Left Column: Join Room Card with Custom SVG Avatars + Voice Picker */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="lg:col-span-5 bg-sunny border-4 border-black rounded-3xl p-6 shadow-brutal-lg flex flex-col justify-between"
          >
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-black text-sunny text-xs font-black flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>انضم {edition.deviceTerm} برمز الغرفة</span>
                </span>
                <QrCode className="w-6 h-6 text-black" />
              </div>

              {/* Code & Name (Empty initial values, clear placeholders) */}
              <div className="grid grid-cols-5 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[11px] font-black mb-1">
                    رمز الغرفة
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={6}
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="مثال: PFAZ"
                    className="w-full px-2.5 py-2 rounded-xl border-3 border-black bg-white text-center font-mono text-base md:text-lg font-black tracking-widest uppercase shadow-brutal-sm placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-normal"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-black mb-1">
                    اسمك في اللعبة
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="اكتب اسمك هنا..."
                    className="w-full px-3 py-2 rounded-xl border-3 border-black bg-white font-black text-sm shadow-brutal-sm placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Team Picker (Dynamic from Room if code entered, otherwise Regional Default) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerTeam("team1")}
                  className={`py-2 px-3 rounded-xl border-2 border-black font-black text-xs transition ${
                    playerTeam === "team1"
                      ? "bg-royal text-white shadow-brutal-sm"
                      : "bg-white text-black"
                  }`}
                >
                  {previewRoomTeams?.team1 || edition.defaultTeam1Name}
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerTeam("team2")}
                  className={`py-2 px-3 rounded-xl border-2 border-black font-black text-xs transition ${
                    playerTeam === "team2"
                      ? "bg-burnt text-white shadow-brutal-sm"
                      : "bg-white text-black"
                  }`}
                >
                  {previewRoomTeams?.team2 || edition.defaultTeam2Name}
                </button>
              </div>

              {/* Custom SVG Cartoon Avatar Picker (8 Illustrated Characters) */}
              <div className="bg-white border-3 border-black rounded-2xl p-3 space-y-2 shadow-brutal-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">
                    اختر شخصيتك الكرتونية:
                  </span>
                  <span className="text-[11px] font-black text-royal">
                    {selectedAvatarMeta.nameAr} • {selectedAvatarMeta.vibeAr}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {regionalAvatars.map((char) => {
                    const active = playerAvatar === char.id;
                    return (
                      <button
                        key={char.id}
                        type="button"
                        onClick={() => setPlayerAvatar(char.id)}
                        className={`p-1.5 rounded-xl border-2 border-black flex flex-col items-center gap-1 transition ${
                          active
                            ? "bg-sunny shadow-brutal-sm -translate-y-0.5"
                            : "bg-cream/60 hover:bg-cream"
                        }`}
                      >
                        <CartoonAvatar avatarId={char.id} size="sm" />
                        <span className="text-[10px] font-black leading-none text-center">
                          {char.nameAr}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voice / Sound Effect Pack Picker with Live Preview Button */}
              <div className="bg-white border-3 border-black rounded-2xl p-3 space-y-2 shadow-brutal-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">
                    اختر صوتك في اللعبة:
                  </span>
                  <button
                    type="button"
                    onClick={() => playVoicePack(playerVoice, true)}
                    className="px-2.5 py-1 rounded-lg bg-mint text-black border-2 border-black text-[11px] font-black flex items-center gap-1 shadow-brutal-sm active:translate-y-0.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>🔊 جرب الصوت</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {VOICE_PACKS.map((vp) => {
                    const active = playerVoice === vp.id;
                    return (
                      <button
                        key={vp.id}
                        type="button"
                        onClick={() => {
                          setPlayerVoice(vp.id);
                          playVoicePack(vp.id, true);
                        }}
                        className={`py-1.5 px-2 rounded-xl border-2 border-black text-[11px] font-black transition ${
                          active
                            ? "bg-royal text-white shadow-brutal-sm"
                            : "bg-cream text-black hover:bg-sunny/40"
                        }`}
                      >
                        {vp.nameAr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 rounded-2xl bg-black text-sunny hover:bg-gray-900 font-black text-base border-3 border-black shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 transition"
              >
                <Smartphone className="w-5 h-5" />
                <span>انضم للغرفة {edition.deviceTerm}</span>
              </button>
            </form>
          </motion.div>
        </section>

        {/* Showcase of the 8 Party Mini-Games */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="px-3 py-1 rounded-full bg-sunny border-2 border-black text-xs font-black">
                تحديات قَدْهَا؟ الثمانية • {edition.gatheringPhrase}
              </span>
              <h2 className="text-2xl md:text-3xl font-black mt-1.5">
                تحديات قَدْهَا؟ الثمانية التفاعلية {edition.deviceTerm}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openSessionSetupWizard("SEEN_JEEM")}
              className="px-4 py-2.5 rounded-xl bg-royal text-white font-black text-xs border-2 border-black shadow-brutal-sm"
            >
              لوحة قَدْهَا؟ التفاعلية
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MINI_GAMES_META.map((game) => (
              <div
                key={game.id}
                className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal flex flex-col justify-between hover:-translate-y-0.5 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-11 h-11 rounded-2xl border-2 border-black shadow-brutal-sm flex items-center justify-center text-black"
                      style={{ backgroundColor: game.color }}
                    >
                      {getMiniGameIcon(game.icon)}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cream border-2 border-black text-[11px] font-black">
                      {game.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-black">{game.title}</h3>
                  <p className="text-xs font-bold text-gray-600 mt-1 line-clamp-2">
                    {game.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("MINI_GAMES", game.id)}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-cream hover:bg-sunny text-black font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-center gap-1.5 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>ابدأ اللعبة</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Clean Pricing Banner with Dynamic Regional Currency */}
        <section className="bg-coral/35 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="px-3 py-0.5 rounded-full bg-white border-2 border-black text-xs font-black">
              اللاعبون ينضمون {edition.deviceTerm} مجاناً دائماً • العملة:{" "}
              {edition.currencyLabel}
            </span>
            <h2 className="text-2xl md:text-3xl font-black">
              {edition.ticketName} ({edition.partyPassPrice}) أو اشتراك المضيف
              المحترف ({edition.proHostPrice})
            </h2>
            <p className="text-xs md:text-sm font-bold text-gray-800">
              ابدأ بجلستك المجانية الأولى ({edition.gatheringPhrase})، وافتح
              جلسات لا محدودة وصانع الأسئلة المخصصة متى ما حبيت.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setPaywallTriggered(false);
              setPricingOpen(true);
            }}
            className="px-6 py-3.5 rounded-2xl bg-black text-sunny font-black text-sm border-3 border-black shadow-brutal shrink-0"
          >
            استعرض الباقات ({edition.currencySymbol})
          </button>
        </section>
      </main>

      {/* Footer with discrete DevDrawer gear icon */}
      <footer className="bg-black text-cream border-t-4 border-black px-6 py-5 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sunny text-black font-black">
              قَدْهَا؟ (QADHA)
            </span>
            <span>
              {edition.partyTerm} • {edition.gatheringPhrase}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHowItWorksOpen(true)}
              className="hover:text-sunny transition"
            >
              كيف تشتغل اللعبة؟
            </button>
            <DevDrawer />
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SessionSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
        customCategories={subscription.customCategories || []}
        initialMode={setupInitialMode}
        initialMiniGame={setupInitialMiniGame}
        onOpenCustomBuilder={() => {
          setSetupModalOpen(false);
          setBuilderOpen(true);
        }}
        onConfirmStartSession={handleConfirmCreateRoom}
      />

      <PricingModal
        isOpen={pricingOpen}
        onClose={() => setPricingOpen(false)}
        subscription={subscription}
        onUpdateSubscription={handleUpdateSubscription}
        onProceedToCreateRoom={() => openSessionSetupWizard("SEEN_JEEM")}
        paywallTriggered={paywallTriggered}
      />

      <CustomBuilderModal
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        onSaveCategory={handleSaveCustomCategory}
      />

      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        profile={profile}
        onProfileChange={handleProfileChange}
      />
    </div>
  );
}