"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgeDollarSign,
  Brain,
  Crown,
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
  getRegionalMiniGamesMeta,
  loadSavedPlayerIdentity,
  loadUserSubscription,
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
import { EditionFlagIcon, QadhaLogo } from "@/components/QadhaLogo";
import {
  HallOfFameMatchRecord,
  loadHallOfFameRecords,
  syncDeviceTrialStateWithCloud,
} from "@/lib/deviceFingerprint";
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

  // Modals
  const [editionModalOpen, setEditionModalOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [paywallTriggered, setPaywallTriggered] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [hallOfFameRecords, setHallOfFameRecords] = useState<
    HallOfFameMatchRecord[]
  >([]);

  useEffect(() => {
    fetchCurrentProfile().then(async (prof) => {
      await syncDeviceTrialStateWithCloud(prof.free_games_used);
      setProfile(prof);
      setSubscription(profileToSubscriptionState(prof));
    });
    setHallOfFameRecords(loadHallOfFameRecords());

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get("room")?.toUpperCase().trim();
      if (roomParam) {
        setJoinCode(roomParam.slice(0, 8));
      }
    }

    const savedPlayer = loadSavedPlayerIdentity();
    if (savedPlayer) {
      setPlayerAvatar(normalizeAvatarId(savedPlayer.avatar));
      setPlayerVoice((savedPlayer.voiceId as VoicePackId) || "hype_horn");
    }
  }, []);

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
      customRoomCode?: string;
    }
  ) => {
    const check = canHostCreateSession(subscription);
    if (!check.allowed) {
      setSetupModalOpen(false);
      setPaywallTriggered(true);
      setPricingOpen(true);
      return;
    }

    // NOTE: Do NOT deduct a free host credit here on lobby creation!
    // Credit is deducted ONLY when the Host actually starts the first question/round in `/host/[code]`.

    const code =
      adapterConfig?.customRoomCode?.trim().toUpperCase() || generateRoomCode();
    const resolvedSettings: RoomSettings = {
      ...settings,
      team1Name: settings.team1Name?.trim() || edition.defaultTeam1Name,
      team2Name: settings.team2Name?.trim() || edition.defaultTeam2Name,
      team3Name: settings.team3Name?.trim() || edition.defaultTeam3Name,
      team4Name: settings.team4Name?.trim() || edition.defaultTeam4Name,
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
    const cleanCode = joinCode.toUpperCase().trim().slice(0, 8);
    if (!cleanCode) return;
    const cleanName = playerName.trim() || (region === "EN" ? "Player" : "لاعب");
    const saved = loadSavedPlayerIdentity();
    const pid = saved?.id || "p-" + Math.random().toString(36).slice(2, 9);

    savePlayerIdentity({
      id: pid,
      name: cleanName,
      avatar: playerAvatar,
      voiceId: playerVoice,
      team: "team1", // Will be auto-balanced based on roster when entering room
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
  const regionalMiniGames = getRegionalMiniGamesMeta(region);
  const isEN = region === "EN";

  return (
    <div
      dir={edition.dir}
      className="min-h-screen bg-cream text-black flex flex-col"
    >
      {/* First-Time Edition Onboarding Gate (or triggered from Home Screen badge) */}
      <EditionOnboardingGate
        forceOpen={editionModalOpen}
        onClose={() => setEditionModalOpen(false)}
      />

      {/* Streamlined Top Header */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b-4 border-black px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Logo + Subtle Current Edition Badge (Clickable ONLY on Home Screen) */}
          <div className="flex flex-wrap items-center gap-3">
            <QadhaLogo edition={region} size="md" showWordmark />
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditionModalOpen(true)}
                  title={
                    isEN ? "Switch Regional Edition" : "تغيير النسخة الإقليمية"
                  }
                  className="px-2.5 py-0.5 rounded-full bg-white hover:bg-sunny text-black border-2 border-black text-[11px] font-black shadow-brutal-sm flex items-center gap-1.5 transition"
                >
                  <EditionFlagIcon edition={region} className="w-4 h-3" />
                  <span>{edition.switcherLabel}</span>
                  <span className="text-[9px] opacity-70">▾</span>
                </button>
              </div>
              <div className="text-[11px] font-bold text-gray-700 mt-0.5">
                {isEN
                  ? `${edition.gatheringPhrase} • Play ${edition.deviceTerm}`
                  : `${edition.gatheringPhrase} • اللعب ${edition.deviceTerm}`}
              </div>
            </div>
          </div>

          {/* Right/Left Actions: [🎟️ تفعيل كود / الباقات] and [👤 حسابي] */}
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
              <span>
                {isEN ? "🎟️ Redeem Voucher / Passes" : "🎟️ تفعيل كود / الباقات"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-black text-white border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-sunny" />
              <span>
                👤{" "}
                {profile.email
                  ? profile.name
                  : isEN
                  ? "My Account"
                  : "حسابي"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-10 space-y-14">
        {/* Hero Dual Grid: Create Room (Host) vs Join Room (Player Controller) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Primary Column: Host Card */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 bg-royal text-white border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg flex flex-col justify-between"
          >
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sunny text-black border-2 border-black shadow-brutal-sm text-xs font-black">
                <EditionFlagIcon edition={region} className="w-4 h-3" />
                <span>
                  {edition.partyTerm} • {edition.gatheringPhrase} •{" "}
                  {edition.deviceTerm}
                </span>
              </div>

              {isEN ? (
                <h1 className="text-3xl md:text-5xl font-black leading-tight">
                  QADHA? — The Ultimate{" "}
                  <span className="text-sunny">
                    {edition.boardModeTitle}
                  </span>{" "}
                  &{" "}
                  <span className="text-coral bg-black px-3 py-0.5 rounded-xl border-2 border-white inline-block mt-1">
                    {edition.miniGamesTitle}
                  </span>
                </h1>
              ) : (
                <h1 className="text-3xl md:text-5xl font-black leading-tight">
                  أقوى تحديات{" "}
                  <span className="text-sunny">
                    لوحة قَدْهَا؟ التفاعلية
                  </span>{" "}
                  و{" "}
                  <span className="text-coral bg-black px-3 py-0.5 rounded-xl border-2 border-white inline-block mt-1">
                    تحديات قَدْهَا؟ الثمانية
                  </span>
                </h1>
              )}

              <p className="text-cream/95 text-sm md:text-base font-bold leading-relaxed max-w-xl">
                {isEN
                  ? `Put the main board on the big screen and let everyone join ${edition.deviceTerm} — Buzz In, wager Double Trouble x2, and battle between ${edition.defaultTeam1Name} & ${edition.defaultTeam2Name}!`
                  : `مثالية ${edition.gatheringPhrase} في ${edition.partyTerm}! اعرض لوحة اللعب على الشاشة الرئيسية، وخلّ كل لاعب يدخل ${edition.deviceTerm} ليجيب أو يضغط جرس الأسبقية بين ${edition.defaultTeam1Name} و${edition.defaultTeam2Name}!`}
              </p>

              {/* 3 Mode Quick Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("SEEN_JEEM")}
                  className={`p-3.5 rounded-2xl border-3 border-black bg-white/10 hover:bg-sunny hover:text-black ${
                    isEN ? "text-left" : "text-right"
                  } transition group`}
                >
                  <Tv className="w-5 h-5 text-sunny group-hover:text-black mb-1.5" />
                  <div className="font-black text-sm">
                    {edition.boardModeTitle}
                  </div>
                  <div className="text-[11px] font-bold opacity-80">
                    {isEN
                      ? "18 or 36 Clues + Buzz In & Double Trouble x2"
                      : "١٨ أو ٣٦ سؤالاً + جرس الأسبقية"}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("MINI_GAMES")}
                  className={`p-3.5 rounded-2xl border-3 border-black bg-white/10 hover:bg-sunny hover:text-black ${
                    isEN ? "text-left" : "text-right"
                  } transition group`}
                >
                  <Gamepad2 className="w-5 h-5 text-sunny group-hover:text-black mb-1.5" />
                  <div className="font-black text-sm">
                    {edition.miniGamesTitle}
                  </div>
                  <div className="text-[11px] font-bold opacity-80">
                    {isEN
                      ? "Speed Trivia, Quick Wit, Price Check & More"
                      : `٨ تحديات سريعة ${edition.deviceTerm}`}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("MIXED_PARTY")}
                  className={`p-3.5 rounded-2xl border-3 border-black bg-white/10 hover:bg-sunny hover:text-black ${
                    isEN ? "text-left" : "text-right"
                  } transition group`}
                >
                  <Sparkles className="w-5 h-5 text-sunny group-hover:text-black mb-1.5" />
                  <div className="font-black text-sm">
                    {edition.combinedModeTitle}
                  </div>
                  <div className="text-[11px] font-bold opacity-80">
                    {isEN
                      ? "The Qadha Board + 8 Party Showdowns"
                      : "لوحة قَدْهَا؟ + التحديات الثمانية"}
                  </div>
                </button>
              </div>
            </div>

            {/* Primary Host CTAs + Secondary Body Actions */}
            <div className="mt-8 pt-5 border-t-2 border-white/20 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("SEEN_JEEM")}
                  className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-sunny hover:bg-yellow-300 text-black font-black text-lg border-4 border-black shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2.5 transition"
                >
                  <Play className="w-5 h-5 fill-black" />
                  <span>
                    {isEN
                      ? edition.hostCta
                      : `افتح جلسة لعب (${edition.partyTerm})`}
                  </span>
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
                  <span>{isEN ? "How to Play?" : "كيف تشتغل اللعبة؟"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBuilderOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-sunny hover:text-black text-white border-2 border-black text-xs font-black flex items-center gap-1.5 transition"
                >
                  <FileEdit className="w-4 h-4 text-sunny" />
                  <span>
                    {isEN
                      ? "✏️ Question Studio & Custom Packs"
                      : "✏️ استوديو وتعديل الأسئلة"}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Secondary Column: Join Room Card with Custom SVG Avatars + Voice Picker */}
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
                  <span>
                    {isEN
                      ? `${edition.joinCta} (100% Free)`
                      : `انضم ${edition.deviceTerm} برمز الغرفة (مجاناً دائماً)`}
                  </span>
                </span>
                <QrCode className="w-6 h-6 text-black" />
              </div>

              {/* Code & Name (Empty initial values, clear placeholders) */}
              <div className="grid grid-cols-5 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[11px] font-black mb-1">
                    {isEN ? "Room Code" : "رمز الغرفة"}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    maxLength={8}
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder={isEN ? "e.g. ADAM" : "مثال: PFAZ"}
                    className="w-full px-2.5 py-2 rounded-xl border-3 border-black bg-white text-center font-mono text-base md:text-lg font-black tracking-widest uppercase shadow-brutal-sm placeholder:text-gray-400 placeholder:text-xs placeholder:tracking-normal"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-[11px] font-black mb-1">
                    {isEN ? "Your Player Name" : "اسمك في اللعبة"}
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder={
                      isEN ? "Enter your nickname..." : "اكتب اسمك هنا..."
                    }
                    className="w-full px-3 py-2 rounded-xl border-3 border-black bg-white font-black text-sm shadow-brutal-sm placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Custom SVG Cartoon Avatar Picker (8 Illustrated Characters) */}
              <div className="bg-white border-3 border-black rounded-2xl p-3 space-y-2 shadow-brutal-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">
                    {isEN ? "Choose Your Avatar:" : "اختر شخصيتك الكرتونية:"}
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
                    {isEN ? "Buzzer Sound Pack:" : "اختر صوتك في اللعبة:"}
                  </span>
                  <button
                    type="button"
                    onClick={() => playVoicePack(playerVoice, true)}
                    className="px-2.5 py-1 rounded-lg bg-mint text-black border-2 border-black text-[11px] font-black flex items-center gap-1 shadow-brutal-sm active:translate-y-0.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isEN ? "🔊 Test Sound" : "🔊 جرب الصوت"}</span>
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
                <span>
                  {isEN ? edition.joinCta : `انضم للغرفة ${edition.deviceTerm}`}
                </span>
              </button>
            </form>
          </motion.div>
        </section>

        {/* Showcase of the 8 Party Mini-Games */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="px-3 py-1 rounded-full bg-sunny border-2 border-black text-xs font-black">
                {edition.miniGamesTitle} • {edition.gatheringPhrase}
              </span>
              <h2 className="text-2xl md:text-3xl font-black mt-1.5">
                {isEN
                  ? "8 Fast-Paced Party Showdowns on Your Phone"
                  : `تحديات قَدْهَا؟ الثمانية التفاعلية ${edition.deviceTerm}`}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openSessionSetupWizard("SEEN_JEEM")}
              className="px-4 py-2.5 rounded-xl bg-royal text-white font-black text-xs border-2 border-black shadow-brutal-sm"
            >
              {edition.boardModeTitle}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {regionalMiniGames.map((game) => (
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
                  <span>{isEN ? "Launch Showdown" : "ابدأ اللعبة"}</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Pro Monthly Exclusive: Hall of Fame (لوحة صدارة الشلة) */}
        {hallOfFameRecords.length > 0 && (
          <section className="bg-white border-4 border-black rounded-3xl p-6 shadow-brutal space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-burnt" />
                <h2 className="text-xl md:text-2xl font-black">
                  🏆 {edition.hallOfFameLabel}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-sunny border-2 border-black text-xs font-black">
                👑 ميزة PRO الشهرية • آخر الانتصارات المحفوظة
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {hallOfFameRecords.slice(0, 6).map((rec) => (
                <div
                  key={rec.id}
                  className="bg-cream border-2 border-black rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-brutal-sm"
                >
                  <div>
                    <div className="text-xs font-black text-royal">
                      🏆 {rec.winnerTeamName} ({rec.winnerScore} pts)
                    </div>
                    <div className="text-[11px] font-bold text-gray-600">
                      ضد {rec.runnerUpTeamName} ({rec.runnerUpScore} pts)
                      {rec.mvpPlayerName ? ` • النجم: ${rec.mvpPlayerName}` : ""}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg bg-black text-sunny font-mono text-[10px] font-black">
                    #{rec.roomCode}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Clean Pricing Banner with Dynamic Regional Currency */}
        <section className="bg-coral/35 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="px-3 py-0.5 rounded-full bg-white border-2 border-black text-xs font-black">
              {isEN
                ? `Joining with Phone is 100% FREE forever • Currency: ${edition.currencyLabel}`
                : `اللاعبون ينضمون ${edition.deviceTerm} مجاناً دائماً • العملة: ${edition.currencyLabel}`}
            </span>
            <h2 className="text-2xl md:text-3xl font-black">
              {isEN
                ? `2 Free Hosted Sessions • ${edition.ticketName} (${edition.partyPassPrice}) or Pro Host (${edition.proHostPrice})`
                : `جلستان مجانيتان كمضيف (2) • ${edition.ticketName} (${edition.partyPassPrice}) أو المضيف المحترف (${edition.proHostPrice})`}
            </h2>
            <p className="text-xs md:text-sm font-bold text-gray-800">
              {isEN
                ? "Every host gets 2 full free sessions. Upgrade anytime for 24h unlimited access or Pro Monthly custom room codes & Question Studio!"
                : "لكل مضيف جلستان مجانيتان كاملتان (2/2)، وافتح تذكرة 24 ساعة أو اشتراك المضيف المحترف PRO لرمز غرفة باسمك واستوديو الأسئلة المصورة."}
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
            {isEN
              ? `View Passes (${edition.currencySymbol})`
              : `استعرض الباقات (${edition.currencySymbol})`}
          </button>
        </section>
      </main>

      {/* Footer with discrete DevDrawer gear icon */}
      <footer className="bg-black text-cream border-t-4 border-black px-6 py-5 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2.5">
            <QadhaLogo edition={region} size="sm" showWordmark={false} />
            <span className="px-2 py-0.5 rounded bg-sunny text-black font-black">
              {edition.brandTitle} (QADHA)
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
              {isEN ? "How to Play?" : "كيف تشتغل اللعبة؟"}
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
