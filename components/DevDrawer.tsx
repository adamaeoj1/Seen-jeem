"use client";

import React, { useEffect, useState } from "react";
import {
  Bot,
  Building2,
  Check,
  Copy,
  KeyRound,
  Lock,
  RotateCcw,
  Settings2,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { Player } from "@/lib/gameEngine";
import { CartoonAvatar } from "@/components/CartoonAvatars";
import {
  generateSignedVoucher,
  useVoucherLicense,
  verifyAdminPin,
  VoucherPrefix,
} from "@/lib/voucherEngine";

interface DevDrawerProps {
  roomCode?: string;
  onAddSimulatedPlayer?: () => void;
  onSimulateAnswers?: () => void;
  onResetBoard?: () => void;
  players?: Player[];
  activePlayerId?: string;
  onSwitchActivePlayer?: (player: Player) => void;
}

export function DevDrawer({
  roomCode,
  onAddSimulatedPlayer,
  onSimulateAnswers,
  onResetBoard,
  players = [],
  activePlayerId,
  onSwitchActivePlayer,
}: DevDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // Admin Voucher Generator state
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [generatedTypeLabel, setGeneratedTypeLabel] = useState<string>("");
  const [copiedToast, setCopiedToast] = useState(false);
  const [activatedToast, setActivatedToast] = useState<string | null>(null);

  const {
    activeLicense,
    isB2BCafeUnlocked,
    cafeConfig,
    saveCafeConfig,
    redeemVoucher,
    clearLicense,
  } = useVoucherLicense();

  const [cafeNameInput, setCafeNameInput] = useState(cafeConfig.cafeName);
  const [cafeLogoInput, setCafeLogoInput] = useState(cafeConfig.cafeLogoUrl);
  const [cafeSavedToast, setCafeSavedToast] = useState(false);

  useEffect(() => {
    setCafeNameInput(cafeConfig.cafeName);
    setCafeLogoInput(cafeConfig.cafeLogoUrl);
  }, [cafeConfig.cafeName, cafeConfig.cafeLogoUrl]);

  // Listen for Shift + D keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "D" || e.key === "d" || e.key === "ي")) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setPinError(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setPinVerified(true);
      setPinError(false);
      setPinInput("");
    } else {
      setPinError(true);
    }
  };

  const handleGenerateVoucher = (prefix: VoucherPrefix, label: string) => {
    const code = generateSignedVoucher(prefix);
    setGeneratedCode(code);
    setGeneratedTypeLabel(label);
    setCopiedToast(false);
    setActivatedToast(null);
  };

  const handleCopyForWhatsApp = async () => {
    if (!generatedCode) return;
    const whatsappMessage = `🎟️ كود التفعيل الخاص بك في قَدْهَا؟ (${generatedTypeLabel}):\n${generatedCode}\n\nأدخل الكود في خانة «أدخل كود القصارة» واستمتع باللعب!`;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      // Fallback copy
      const el = document.createElement("textarea");
      el.value = whatsappMessage;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleActivateGeneratedCodeLocally = () => {
    if (!generatedCode) return;
    const res = redeemVoucher(generatedCode);
    if (res.success) {
      setActivatedToast(res.messageAr);
      setTimeout(() => setActivatedToast(null), 3000);
    }
  };

  const handleSaveCafeBranding = (e: React.FormEvent) => {
    e.preventDefault();
    saveCafeConfig({
      enabled: true,
      cafeName: cafeNameInput.trim() || "مقهى الأبطال",
      cafeLogoUrl: cafeLogoInput.trim(),
    });
    setCafeSavedToast(true);
    setTimeout(() => setCafeSavedToast(false), 2500);
  };

  return (
    <>
      {/* Discrete tiny gear button for footer */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setPinError(false);
        }}
        title="لوحة المشرف والمطور (Shift + D)"
        className="opacity-35 hover:opacity-100 p-1.5 rounded-lg transition text-current inline-flex items-center gap-1"
      >
        <Settings2 className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          dir="rtl"
        >
          {!pinVerified ? (
            /* ================================================================
               SECRET ADMIN PIN GATE (BLOCKS UNAUTHORIZED ACCESS)
            ================================================================ */
            <div className="m-auto bg-cream border-4 border-black rounded-3xl p-6 max-w-sm w-full shadow-brutal-lg space-y-4 text-center">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-black text-sunny text-[11px] font-black flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>منطقة محمية (Admin PIN)</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-coral text-black border-2 border-black flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-sunny border-3 border-black shadow-brutal-sm flex items-center justify-center mx-auto">
                <ShieldAlert className="w-7 h-7 text-black" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-black">
                  أدخل الرمز السري للمشرف (PIN)
                </h3>
                <p className="text-xs font-bold text-gray-600">
                  لوحة توليد الأكواد وأدوات المطور محمية برمز سري خاص بالإدارة
                </p>
              </div>

              <form
                onSubmit={handleVerifyPin}
                autoComplete="off"
                className="space-y-3"
              >
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  name="admin_pin_code_no_autofill"
                  autoFocus
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="••••"
                  style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                  className="w-full px-4 py-3 rounded-2xl border-3 border-black bg-white text-center font-mono font-black text-2xl tracking-widest text-black"
                />

                {pinError && (
                  <div className="p-2 rounded-xl bg-coral text-black border-2 border-black text-xs font-black">
                    الرمز السري غير صحيح!
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-black text-sunny font-black text-sm border-3 border-black shadow-brutal"
                >
                  فتح لوحة المشرف
                </button>
              </form>
            </div>
          ) : (
            /* ================================================================
               UNLOCKED ADMIN DRAWER: VOUCHER GENERATOR + B2B CAFE + DEV TOOLS
            ================================================================ */
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-cream text-black border-l-4 border-black h-full p-5 shadow-brutal-lg flex flex-col justify-between overflow-y-auto">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-royal" />
                    <h3 className="font-black text-base">
                      لوحة المشرف وتوليد الأكواد (Admin)
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPinVerified(false)}
                      title="قفل اللوحة"
                      className="px-2.5 py-1 rounded-lg bg-sunny border-2 border-black text-[11px] font-black flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3" />
                      <span>قفل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-lg bg-coral border-2 border-black flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 1. Cryptographic Signed Voucher Generator */}
                <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-brutal-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-burnt" />
                      <span>مولّد أكواد التفعيل المشفرة:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sunny border border-black text-[10px] font-black">
                      Salted Checksum
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleGenerateVoucher("KASSARA24", "24h Pass (25 DH)")
                      }
                      className="py-2.5 px-2 rounded-xl bg-sunny hover:brightness-105 text-black border-2 border-black font-black text-[11px] shadow-brutal-sm text-center"
                    >
                      🎟️ 24h Pass
                      <div className="text-[9px] font-mono opacity-80">
                        KASSARA24
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleGenerateVoucher("PROMOROCCO", "30d Pro (70 DH)")
                      }
                      className="py-2.5 px-2 rounded-xl bg-royal hover:brightness-110 text-white border-2 border-black font-black text-[11px] shadow-brutal-sm text-center"
                    >
                      👑 30d Pro
                      <div className="text-[9px] font-mono text-sunny">
                        PROMOROCCO
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleGenerateVoucher("CAFEMODE", "B2B Cafe Mode")
                      }
                      className="py-2.5 px-2 rounded-xl bg-mint hover:brightness-105 text-black border-2 border-black font-black text-[11px] shadow-brutal-sm text-center"
                    >
                      ☕ B2B Cafe
                      <div className="text-[9px] font-mono opacity-80">
                        CAFEMODE
                      </div>
                    </button>
                  </div>

                  {generatedCode && (
                    <div className="p-3 rounded-xl bg-cream border-2 border-black space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-black text-gray-600">
                        <span>الكود المولّد ({generatedTypeLabel}):</span>
                        <Sparkles className="w-3.5 h-3.5 text-burnt" />
                      </div>
                      <div
                        dir="ltr"
                        className="p-2.5 rounded-lg bg-black text-sunny font-mono font-black text-sm text-center tracking-wider select-all border border-black"
                      >
                        {generatedCode}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={handleCopyForWhatsApp}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:brightness-105 text-black font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-center gap-1.5"
                        >
                          {copiedToast ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>تم نسخ الكود بنجاح! ✔</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>نسخ الكود لإرساله في واتساب</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleActivateGeneratedCodeLocally}
                          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-sunny text-black font-black text-[11px] border-2 border-black flex items-center justify-center gap-1.5"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>تفعيل هذا الكود مباشرة على الجهاز</span>
                        </button>
                      </div>

                      {activatedToast && (
                        <div className="p-2 rounded-lg bg-mint text-black border border-black text-[11px] font-black text-center">
                          {activatedToast}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Active Device License Status */}
                  {activeLicense && (
                    <div className="pt-2 border-t border-black/15 flex items-center justify-between text-[11px] font-black">
                      <div>
                        <span className="text-emerald-700">الرخصة النشطة: </span>
                        <span font-mono>{activeLicense.prefix}</span>
                      </div>
                      <button
                        type="button"
                        onClick={clearLicense}
                        className="px-2 py-1 rounded bg-coral/40 hover:bg-coral text-black border border-black flex items-center gap-1 text-[10px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>إلغاء الرخصة</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. B2B Cafe / University Club Branding Panel */}
                <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-brutal-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-royal" />
                      <span>إعدادات المقهى / النادي (B2B):</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full border border-black text-[10px] font-black ${
                        isB2BCafeUnlocked
                          ? "bg-mint text-black"
                          : "bg-cream text-gray-600"
                      }`}
                    >
                      {isB2BCafeUnlocked ? "مفعل ✔" : "يتطلب رخصة CAFEMODE"}
                    </span>
                  </div>

                  {isB2BCafeUnlocked ? (
                    <form onSubmit={handleSaveCafeBranding} className="space-y-2.5">
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
                          رابط شعار المقهى (Logo URL - اختياري)
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
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-royal text-white font-black text-xs border-2 border-black shadow-brutal-sm"
                      >
                        {cafeSavedToast
                          ? "تم حفظ شعار المقهى ✔"
                          : "حفظ وإظهار على شاشة التلفزيون"}
                      </button>
                    </form>
                  ) : (
                    <p className="text-[11px] font-bold text-gray-600 leading-relaxed">
                      اضغط على زر <strong>«☕ B2B Cafe»</strong> بالأعلى ثم{" "}
                      <strong>«تفعيل هذا الكود مباشرة»</strong> لفتح إعدادات
                      رعاية المقهى أو النادي الجامعي على شاشة التلفزيون.
                    </p>
                  )}
                </div>

                {/* 3. Simulation & Room Testing Tools */}
                <div className="space-y-2.5">
                  <div className="text-xs font-black text-gray-700">
                    أدوات محاكاة الغرفة واللاعبين:
                  </div>
                  {onAddSimulatedPlayer && (
                    <button
                      type="button"
                      onClick={onAddSimulatedPlayer}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-sunny text-black font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-between"
                    >
                      <span>إضافة لاعب تجريبي للغرفة</span>
                      <Bot className="w-4 h-4 text-royal" />
                    </button>
                  )}

                  {onSimulateAnswers && (
                    <button
                      type="button"
                      onClick={onSimulateAnswers}
                      className="w-full py-2.5 px-4 rounded-xl bg-mint hover:brightness-105 text-black font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-between"
                    >
                      <span>إرسال إجابات آلية لجميع اللاعبين</span>
                      <Bot className="w-4 h-4" />
                    </button>
                  )}

                  {onResetBoard && (
                    <button
                      type="button"
                      onClick={onResetBoard}
                      className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-coral/40 text-black font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-between"
                    >
                      <span>إعادة ضبط لوحة الأسئلة</span>
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}

                  {roomCode && (
                    <a
                      href={`/play/${roomCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-black text-sunny font-black text-xs border-2 border-black flex items-center justify-between"
                    >
                      <span>فتح شاشة جوال ثانية</span>
                      <Smartphone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {players.length > 0 && onSwitchActivePlayer && (
                  <div className="pt-3 border-t-2 border-black/15 space-y-2">
                    <div className="text-xs font-black">
                      التبديل بين حسابات اللاعبين في نفس الجلسة:
                    </div>
                    <div className="space-y-1.5">
                      {players.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onSwitchActivePlayer(p);
                            setIsOpen(false);
                          }}
                          className={`w-full p-2 rounded-xl border-2 border-black flex items-center justify-between text-xs font-black ${
                            p.id === activePlayerId ? "bg-sunny" : "bg-white"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <CartoonAvatar avatarId={p.avatar} size="xs" />
                            <span>{p.name}</span>
                          </span>
                          <span>{p.team === "team1" ? "الفريق ١" : "الفريق ٢"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] font-mono text-gray-500 text-center pt-4">
                QADHA (قَدْهَا؟) Admin & Voucher Console (PIN Protected)
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
