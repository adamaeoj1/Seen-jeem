"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Crown,
  Eye,
  FileText,
  Gamepad2,
  Hash,
  HelpCircle,
  MapPin,
  Palette,
  Play,
  QrCode,
  Smartphone,
  Sparkles,
  Tag,
  Ticket,
  Tv,
  User,
  Volume2,
  Wand2,
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
  AVATAR_CHARACTERS,
  AvatarCharacterId,
  CartoonAvatar,
  normalizeAvatarId,
} from "@/components/CartoonAvatars";
import { playVoicePack, VOICE_PACKS, VoicePackId } from "@/lib/soundEffects";
import {
  fetchCurrentProfile,
  getCachedProfile,
  UserProfileRecord,
} from "@/lib/db";
import { PricingModal } from "@/components/PricingModal";
import { CustomBuilderModal } from "@/components/CustomBuilderModal";
import { SessionSetupModal } from "@/components/SessionSetupModal";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { AuthModal } from "@/components/AuthModal";
import { DevDrawer } from "@/components/DevDrawer";

export default function LandingPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfileRecord>(() =>
    getCachedProfile()
  );
  const [subscription, setSubscription] = useState<UserSubscriptionState>(() =>
    loadUserSubscription()
  );

  // Setup Wizard state
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupInitialMode, setSetupInitialMode] =
    useState<SessionModeConfig>("SEEN_JEEM");
  const [setupInitialMiniGame, setSetupInitialMiniGame] =
    useState<MiniGameId>("SPEED_TRIVIA");

  // Player Join state
  const [joinCode, setJoinCode] = useState("K7Q2");
  const [playerName, setPlayerName] = useState("");
  const [playerAvatar, setPlayerAvatar] =
    useState<AvatarCharacterId>("abu_sultan");
  const [playerVoice, setPlayerVoice] = useState<VoicePackId>("hype_horn");
  const [playerTeam, setPlayerTeam] = useState<TeamId>("team1");

  // Modals
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

    const savedPlayer = loadSavedPlayerIdentity();
    if (savedPlayer) {
      setPlayerName(savedPlayer.name);
      setPlayerAvatar(normalizeAvatarId(savedPlayer.avatar));
      setPlayerVoice((savedPlayer.voiceId as VoicePackId) || "hype_horn");
      setPlayerTeam(savedPlayer.team);
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
    startMiniGameId?: MiniGameId
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
    const initialRoom = createInitialRoomState(
      code,
      subscription.tier,
      subscription.customCategories || [],
      settings,
      selectedCategoryIds
    );
    if (startMiniGameId) {
      initialRoom.activeMiniGameId = startMiniGameId;
    }

    saveRoomToLocalAndBroadcast(initialRoom);
    setSetupModalOpen(false);
    router.push(`/host/${code}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = (joinCode || "K7Q2").toUpperCase().trim().slice(0, 6);
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
      case "Sparkles":
        return <Sparkles className="w-6 h-6" />;
      case "Tag":
        return <Tag className="w-6 h-6" />;
      case "Eye":
        return <Eye className="w-6 h-6" />;
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
    AVATAR_CHARACTERS.find((c) => c.id === playerAvatar) ||
    AVATAR_CHARACTERS[0];

  return (
    <div className="min-h-screen bg-cream text-black flex flex-col">
      {/* Main Header */}
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b-4 border-black px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sunny border-3 border-black shadow-brutal-sm flex items-center justify-center text-2xl font-black">
              س
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black tracking-tight">
                  سين جيم × قمنم
                </span>
                <span className="px-2 py-0.5 rounded-full bg-coral text-black border-2 border-black text-[11px] font-black">
                  سهرة جماعية
                </span>
              </div>
            </div>
          </div>

          {/* Navigation & Account Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setHowItWorksOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-sunny border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5 transition"
            >
              <HelpCircle className="w-4 h-4 text-royal" />
              <span>كيف تشتغل اللعبة؟</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (subscription.proSubscriptionActive) {
                  setBuilderOpen(true);
                } else {
                  setPaywallTriggered(false);
                  setPricingOpen(true);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-sunny border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5 transition"
            >
              <Wand2 className="w-4 h-4 text-royal" />
              <span>صانع الأسئلة</span>
              <span className="px-1.5 py-0.5 rounded bg-royal text-white text-[10px]">
                PRO
              </span>
            </button>

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
                {subscription.proSubscriptionActive
                  ? "المضيف المحترف 👑"
                  : subscription.tier === "PARTY_PASS"
                  ? "تذكرة السهرة نشطة"
                  : `الرصيد: ${subscription.freeSessionsRemaining} جلسة`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-black text-white border-2 border-black shadow-brutal-sm text-xs font-black flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-sunny" />
              <span>{profile.email ? profile.name : "حسابي"}</span>
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
                <span>شاشة التلفزيون والآيباد • تصحيح عربي ذكي تلقائي</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black leading-tight">
                سهرة تجمع{" "}
                <span className="text-sunny underline decoration-wavy">
                  سين جيم
                </span>{" "}
                و{" "}
                <span className="text-coral bg-black px-3 py-0.5 rounded-xl border-2 border-white inline-block mt-1">
                  ٨ ألعاب قمنم
                </span>
              </h1>

              <p className="text-cream/95 text-sm md:text-base font-bold leading-relaxed max-w-xl">
                اعرض لوحة اللعب على الشاشة الرئيسية، وخلّ كل لاعب يدخل بجواله ليجيب، يرسم، يثبت الدبوس على الخريطة، أو يتسابق بأجزاء الثانية!
              </p>

              {/* 3 Mode Quick Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("SEEN_JEEM")}
                  className="p-3.5 rounded-2xl border-3 border-black bg-white/10 hover:bg-sunny hover:text-black text-right transition group"
                >
                  <Tv className="w-5 h-5 text-sunny group-hover:text-black mb-1.5" />
                  <div className="font-black text-sm">سين جيم التفاعلي</div>
                  <div className="text-[11px] font-bold opacity-80">
                    ٦ فئات × ٣٦ سؤالاً
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("MINI_GAMES")}
                  className="p-3.5 rounded-2xl border-3 border-black bg-white/10 hover:bg-sunny hover:text-black text-right transition group"
                >
                  <Gamepad2 className="w-5 h-5 text-sunny group-hover:text-black mb-1.5" />
                  <div className="font-black text-sm">ألعاب قمنم الثمانية</div>
                  <div className="text-[11px] font-bold opacity-80">
                    ٨ تحديات سريعة بالجوال
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => openSessionSetupWizard("MIXED_PARTY")}
                  className="p-3.5 rounded-2xl border-3 border-black bg-white/10 hover:bg-sunny hover:text-black text-right transition group"
                >
                  <Sparkles className="w-5 h-5 text-sunny group-hover:text-black mb-1.5" />
                  <div className="font-black text-sm">سهرة مدمجة</div>
                  <div className="text-[11px] font-bold opacity-80">
                    سين جيم + جولات قمنم
                  </div>
                </button>
              </div>
            </div>

            {/* Primary Host CTAs */}
            <div className="mt-8 pt-5 border-t-2 border-white/20 flex flex-col sm:flex-row items-center gap-3.5">
              <button
                type="button"
                onClick={() => openSessionSetupWizard("SEEN_JEEM")}
                className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-sunny hover:bg-yellow-300 text-black font-black text-lg border-4 border-black shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2.5 transition"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>افتح جلسة لعب</span>
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
                <span>تذاكر السهرة</span>
              </button>
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
                  <span>انضم برمز الغرفة</span>
                </span>
                <QrCode className="w-6 h-6 text-black" />
              </div>

              {/* Code & Name */}
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
                    placeholder="K7Q2"
                    className="w-full px-2.5 py-2 rounded-xl border-3 border-black bg-white text-center font-mono text-lg font-black tracking-widest uppercase shadow-brutal-sm"
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
                    placeholder="مثال: عزوز"
                    className="w-full px-3 py-2 rounded-xl border-3 border-black bg-white font-black text-sm shadow-brutal-sm"
                  />
                </div>
              </div>

              {/* Team Picker */}
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
                  فريق الصقور
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
                  فريق النمور
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
                  {AVATAR_CHARACTERS.map((char) => {
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
                        <span className="text-[10px] font-black leading-none">
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
                <span>انضم للغرفة</span>
              </button>
            </form>
          </motion.div>
        </section>

        {/* Showcase of the 8 Party Mini-Games */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="px-3 py-1 rounded-full bg-sunny border-2 border-black text-xs font-black">
                طور قمنم التفاعلي
              </span>
              <h2 className="text-2xl md:text-3xl font-black mt-1.5">
                الألعاب الثمانية التفاعلية بالجوال
              </h2>
            </div>
            <button
              type="button"
              onClick={() => openSessionSetupWizard("SEEN_JEEM")}
              className="px-4 py-2.5 rounded-xl bg-royal text-white font-black text-xs border-2 border-black shadow-brutal-sm"
            >
              لوحة سين جيم الكلاسيكية
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

        {/* Clean Pricing Banner */}
        <section className="bg-coral/35 border-4 border-black rounded-3xl p-6 md:p-8 shadow-brutal-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="px-3 py-0.5 rounded-full bg-white border-2 border-black text-xs font-black">
              اللاعبون ينضمون مجاناً دائماً
            </span>
            <h2 className="text-2xl md:text-3xl font-black">
              تذكرة السهرة ($2.99) أو اشتراك المضيف المحترف ($7.99)
            </h2>
            <p className="text-xs md:text-sm font-bold text-gray-800">
              ابدأ بجلستك المجانية الأولى، وافتح جلسات لا محدودة وصانع الأسئلة المخصصة متى ما حبيت.
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
            استعرض الباقات
          </button>
        </section>
      </main>

      {/* Footer with discrete DevDrawer gear icon */}
      <footer className="bg-black text-cream border-t-4 border-black px-6 py-5 mt-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sunny text-black font-black">
              سين جيم × قمنم
            </span>
            <span>منصة الألعاب الجماعية التفاعلية</span>
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
          if (subscription.proSubscriptionActive) {
            setBuilderOpen(true);
          } else {
            setPaywallTriggered(false);
            setPricingOpen(true);
          }
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
