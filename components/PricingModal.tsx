"use client";

import React, { useEffect, useState } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  ExternalLink,
  Gift,
  KeyRound,
  MessageCircle,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import {
  loadUserSubscription,
  SubscriptionTierId,
  UserSubscriptionState,
} from "@/lib/gameEngine";
import { useEdition } from "@/lib/editionManager";
import {
  buildWhatsAppCheckoutUrl,
  GUMROAD_CHECKOUT_LINKS,
  useVoucherLicense,
  WHATSAPP_MERCHANT_PHONE,
} from "@/lib/voucherEngine";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: UserSubscriptionState;
  onUpdateSubscription: (next: UserSubscriptionState) => void;
  onProceedToCreateRoom?: () => void;
  paywallTriggered?: boolean;
}

export function PricingModal({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription,
  onProceedToCreateRoom,
  paywallTriggered = false,
}: PricingModalProps) {
  const { region, edition } = useEdition();
  const {
    activeLicense,
    isB2BCafeUnlocked,
    cafeConfig,
    saveCafeConfig,
    redeemVoucher,
  } = useVoucherLicense();

  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionTierId>("PARTY_PASS");
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  // Voucher input state
  const [voucherInput, setVoucherInput] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // B2B Cafe Branding state
  const [cafeNameInput, setCafeNameInput] = useState(cafeConfig.cafeName);
  const [cafeLogoInput, setCafeLogoInput] = useState(cafeConfig.cafeLogoUrl);
  const [cafeSavedToast, setCafeSavedToast] = useState(false);

  const [countdownText, setCountdownText] = useState<string>("23:59:59");

  useEffect(() => {
    setCafeNameInput(cafeConfig.cafeName);
    setCafeLogoInput(cafeConfig.cafeLogoUrl);
  }, [cafeConfig.cafeName, cafeConfig.cafeLogoUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const updateClock = () => {
      const target =
        activeLicense?.expiresAt ||
        subscription.partyPassExpiresAt ||
        Date.now() + 24 * 60 * 60 * 1000;
      const diff = Math.max(0, target - Date.now());
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdownText(
        `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
          2,
          "0"
        )}:${String(secs).padStart(2, "0")}`
      );
    };
    updateClock();
    const id = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(id);
  }, [isOpen, activeLicense?.expiresAt, subscription.partyPassExpiresAt]);

  if (!isOpen) return null;

  // Localized prices when region === 'MA': Free Session (مجاناً), 24h Party Pass (25 DH), Monthly Pro (70 DH)
  const partyPassPriceDisplay =
    region === "MA" ? "25 DH" : edition.partyPassPrice;
  const proHostPriceDisplay = region === "MA" ? "70 DH" : edition.proHostPrice;

  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError(null);
    setVoucherSuccess(null);

    const res = redeemVoucher(voucherInput);
    if (!res.success) {
      setVoucherError(res.messageAr);
      return;
    }

    setVoucherSuccess(res.messageAr);
    setVoucherInput("");
    const updatedSub = loadUserSubscription();
    onUpdateSubscription(updatedSub);
  };

  const handleSaveCafeSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveCafeConfig({
      enabled: true,
      cafeName: cafeNameInput.trim() || "مقهى الأبطال",
      cafeLogoUrl: cafeLogoInput.trim(),
    });
    setCafeSavedToast(true);
    setTimeout(() => setCafeSavedToast(false), 2500);
  };

  const handleOpenPaymentSheet = (tier: SubscriptionTierId) => {
    setSelectedPlan(tier);
    setVoucherError(null);
    setVoucherSuccess(null);
    if (tier === "FREE_TRIAL") {
      if (subscription.freeSessionsRemaining > 0 && onProceedToCreateRoom) {
        onClose();
        onProceedToCreateRoom();
      }
      return;
    }
    setShowPaymentSheet(true);
  };

  const activePlanTitle =
    selectedPlan === "PRO_HOST"
      ? "باقة المضيف المحترف PRO (شهرياً)"
      : `${edition.ticketName} (24 ساعة مفتوحة)`;

  const activePlanPrice =
    selectedPlan === "PRO_HOST" ? proHostPriceDisplay : partyPassPriceDisplay;

  const whatsAppCheckoutUrl = buildWhatsAppCheckoutUrl({
    planTitle: activePlanTitle,
    priceLabel: activePlanPrice,
    planCode: selectedPlan === "PRO_HOST" ? "PRO_HOST" : "PARTY_PASS",
    phone: WHATSAPP_MERCHANT_PHONE,
  });

  const gumroadCheckoutUrl =
    selectedPlan === "PRO_HOST"
      ? GUMROAD_CHECKOUT_LINKS.PRO_HOST
      : GUMROAD_CHECKOUT_LINKS.PARTY_PASS;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-cream border-4 border-black rounded-3xl shadow-brutal-lg max-w-4xl w-full overflow-hidden my-6">
        {/* Top Banner */}
        <div className="bg-royal text-white border-b-4 border-black px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sunny text-black border-2 border-black shadow-brutal-sm flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black">
                {paywallTriggered
                  ? `انتهت جلستك المجانية — افتح ${edition.partyTerm} الآن!`
                  : `باقات وتذاكر ${edition.partyTerm} (${edition.currencyLabel})`}
              </h2>
              <p className="text-sunny text-xs font-bold mt-0.5">
                المضيف فقط يحتاج تذكرة لإنشاء الغرفة • جميع اللاعبين ينضمون مجاناً{" "}
                {edition.deviceTerm}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-coral text-black border-2 border-black shadow-brutal-sm flex items-center justify-center shrink-0"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[84vh] overflow-y-auto">
          {/* ================================================================
              PROMINENT VOUCHER REDEMPTION BAR AT TOP OF PRICING MODAL
          ================================================================ */}
          <div className="bg-sunny/45 border-4 border-black rounded-3xl p-4 md:p-5 shadow-brutal space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm md:text-base font-black text-black flex items-center gap-2">
                <span>🎟️ عندك كود تفعيل؟ أدخل كود القصارة</span>
              </label>
              {activeLicense && (
                <span className="px-3 py-1 rounded-full bg-mint text-black border-2 border-black text-xs font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>مفعل: {activeLicense.code}</span>
                </span>
              )}
            </div>

            <form
              onSubmit={handleRedeemCode}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  dir="ltr"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  placeholder="KASSARA24-XXXXXX-XXXXXX"
                  className="w-full px-4 py-3 rounded-2xl border-3 border-black bg-white font-mono font-black text-sm md:text-base uppercase tracking-wider text-center sm:text-left shadow-brutal-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-black hover:bg-neutral-800 text-sunny font-black text-sm border-3 border-black shadow-brutal flex items-center justify-center gap-2 shrink-0 transition"
              >
                <KeyRound className="w-4 h-4" />
                <span>تفعيل الكود الآن</span>
              </button>
            </form>

            {voucherError && (
              <div className="p-3 rounded-xl bg-coral text-black border-2 border-black text-xs font-black">
                ⚠️ {voucherError}
              </div>
            )}

            {voucherSuccess && (
              <div className="p-3 rounded-xl bg-mint text-black border-2 border-black text-xs font-black flex items-center justify-between gap-2">
                <span>{voucherSuccess}</span>
                {onProceedToCreateRoom && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onProceedToCreateRoom();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-black text-sunny text-xs font-black border border-black"
                  >
                    ابدأ الغرفة الآن ←
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Pass / License Countdown Banner */}
          {(activeLicense ||
            (subscription.tier === "PARTY_PASS" &&
              subscription.partyPassExpiresAt)) && (
            <div className="bg-sunny border-3 border-black rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 shadow-brutal-sm">
              <span className="font-black text-sm flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <span>
                  {activeLicense
                    ? activeLicense.labelAr
                    : `${edition.ticketName} ٢٤ ساعة نشطة الآن`}
                </span>
              </span>
              <span
                dir="ltr"
                className="px-3 py-1 rounded-xl bg-black text-sunny font-mono font-black text-sm flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                {countdownText}
              </span>
            </div>
          )}

          {/* B2B Cafe Branding Panel (Unlocked when a B2B_CAFE license is active) */}
          {isB2BCafeUnlocked && (
            <div className="bg-white border-4 border-black rounded-3xl p-5 shadow-brutal space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-sunny border-2 border-black flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">
                      إعدادات المقهى / النادي (B2B)
                    </h3>
                    <p className="text-xs font-bold text-gray-600">
                      سيظهر شعار واسم المقهى أو النادي الجامعي في أعلى شاشة التلفزيون طوال السهرة
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-mint border-2 border-black text-xs font-black">
                  رخصة B2B مفعلة ✔
                </span>
              </div>

              <form
                onSubmit={handleSaveCafeSettings}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
              >
                <div className="md:col-span-5">
                  <label className="block text-xs font-black mb-1">
                    اسم المقهى / النادي الجامعي
                  </label>
                  <input
                    type="text"
                    value={cafeNameInput}
                    onChange={(e) => setCafeNameInput(e.target.value)}
                    placeholder="مثال: مقهى أطلس گيمنگ - الدار البيضاء"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-black text-xs"
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-xs font-black mb-1">
                    رابط الشعار (Logo URL - اختياري)
                  </label>
                  <input
                    type="url"
                    dir="ltr"
                    value={cafeLogoInput}
                    onChange={(e) => setCafeLogoInput(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-mono font-bold text-xs"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 rounded-xl bg-royal text-white font-black text-xs border-2 border-black shadow-brutal-sm"
                  >
                    {cafeSavedToast ? "تم الحفظ ✔" : "حفظ الشعار"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================================================================
              3 PRICING TIERS (With Fixed Flex Alignment & Localized MA Prices)
          ================================================================ */}
          {!showPaymentSheet ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
              {/* 1. Free Session (مجاناً) */}
              <div className="bg-white rounded-3xl border-4 border-black p-5 shadow-brutal flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-cream border-2 border-black text-xs font-black">
                      الباقة الترحيبية
                    </span>
                    <Gift className="w-6 h-6 text-royal shrink-0" />
                  </div>
                  <h3 className="text-xl font-black">الجلسة المجانية</h3>
                  <div className="my-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black">مجاناً</span>
                    <span className="text-xs font-bold text-gray-600">
                      / جلسة واحدة كاملة
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-bold text-gray-700 mb-5">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-mint shrink-0" />
                      <span>جلسة لعب كاملة ({edition.gatheringPhrase})</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-mint shrink-0" />
                      <span>
                        دخول مجاني لجميع اللاعبين {edition.deviceTerm}
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={subscription.freeSessionsRemaining <= 0}
                  onClick={() => handleOpenPaymentSheet("FREE_TRIAL")}
                  className={`w-full py-3 rounded-xl font-black text-xs border-2 border-black ${
                    subscription.freeSessionsRemaining > 0
                      ? "bg-cream hover:bg-sunny text-black shadow-brutal-sm"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {subscription.freeSessionsRemaining > 0
                    ? `متبقي (${subscription.freeSessionsRemaining}) جلسة مجانية`
                    : "تم استنفاذ الجلسة المجانية"}
                </button>
              </div>

              {/* 2. 24h Party Pass (25 DH in MA) */}
              <div className="bg-sunny rounded-3xl border-4 border-black p-5 shadow-brutal-lg flex flex-col justify-between relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-burnt text-white px-3.5 py-0.5 rounded-full border-2 border-black text-[11px] font-black whitespace-nowrap">
                  الأكثر اختياراً • {edition.gatheringPhrase} 🔥
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3 mt-1">
                    <span className="px-2.5 py-1 rounded-full bg-white border-2 border-black text-xs font-black">
                      ٢٤ ساعة مفتوحة
                    </span>
                    <Ticket className="w-6 h-6 text-black shrink-0" />
                  </div>
                  <h3 className="text-xl font-black">{edition.ticketName}</h3>
                  <div className="my-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black" dir="ltr">
                      {partyPassPriceDisplay}
                    </span>
                    <span className="text-xs font-black">
                      / ٢٤ ساعة • {edition.currencyLabel}
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-bold text-black mb-5">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>جلسات غير محدودة لمدة ٢٤ ساعة</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>جميع تصنيفات لوحة قَدْهَا؟ والتحديات الثمانية</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>دفعة واحدة بدون تجديد تلقائي</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenPaymentSheet("PARTY_PASS")}
                  className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 text-sunny font-black text-xs border-2 border-black shadow-brutal-sm transition"
                >
                  {region === "MA"
                    ? "اشترِ تذكرة الگلسة"
                    : `اشترِ ${edition.ticketName}`}
                </button>
              </div>

              {/* 3. Monthly Pro Host (70 DH in MA — Fixed Flex Alignment & Single-Line Text) */}
              <div className="bg-royal text-white rounded-3xl border-4 border-black p-5 shadow-brutal flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-sunny text-black border-2 border-black text-xs font-black">
                      شامل صانع الأسئلة 👑
                    </span>
                    <Crown className="w-6 h-6 text-sunny shrink-0" />
                  </div>
                  <h3 className="text-xl font-black">المضيف المحترف</h3>
                  <div className="my-4 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-sunny" dir="ltr">
                      {proHostPriceDisplay}
                    </span>
                    <span className="text-xs font-bold text-cream">
                      / شهرياً • {edition.currencyLabel}
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-bold text-cream mb-5">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sunny shrink-0" />
                      <span className="whitespace-nowrap">
                        جلسات لعب لا محدودة طوال الشهر
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sunny shrink-0" />
                      <span className="whitespace-nowrap">
                        صانع الأسئلة والفئات المخصصة
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-sunny shrink-0" />
                      <span className="whitespace-nowrap">
                        جميع الحزم الحصرية بدون إعلانات
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenPaymentSheet("PRO_HOST")}
                  className="w-full py-3 rounded-xl bg-sunny hover:brightness-105 text-black font-black text-xs border-2 border-black shadow-brutal-sm transition"
                >
                  اشترك الآن
                </button>
              </div>
            </div>
          ) : (
            /* ================================================================
               LOCAL PAYMENT SHEET (WHATSAPP CIH/CASH PLUS + GUMROAD CARD)
            ================================================================ */
            <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-brutal-lg space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-black/15">
                <div>
                  <span className="px-3 py-0.5 rounded-full bg-sunny border-2 border-black text-xs font-black">
                    بوابة الدفع الفوري واستلام الكود
                  </span>
                  <h3 className="text-xl md:text-2xl font-black mt-1">
                    {activePlanTitle} —{" "}
                    <span dir="ltr" className="text-royal">
                      {activePlanPrice}
                    </span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPaymentSheet(false)}
                  className="px-4 py-2 rounded-xl bg-cream hover:bg-sunny text-black border-2 border-black text-xs font-black"
                >
                  ← العودة للباقات
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Instant Local Payment via WhatsApp (CIH Mobile / Cash Plus / Wafacash) */}
                <div className="bg-mint/20 border-3 border-black rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-brutal-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-mint text-black border-2 border-black text-[11px] font-black">
                        الأسرع في المغرب 🇲🇦
                      </span>
                      <MessageCircle className="w-6 h-6 text-emerald-700" />
                    </div>
                    <h4 className="text-base md:text-lg font-black text-black">
                      ١. الدفع المحلي الفوري عبر واتساب (CIH Mobile / Cash Plus / Wafacash)
                    </h4>
                    <p className="text-xs font-bold text-gray-700 leading-relaxed">
                      أرسل طلبك مباشرة عبر واتساب واستلم كود التفعيل الفوري (
                      <span dir="ltr" className="font-mono font-black">
                        {selectedPlan === "PRO_HOST" ? "PROMOROCCO" : "KASSARA24"}
                      </span>
                      ) في ثوانٍ عبر التحويل الفوري CIH Mobile أو التجاري أو Cash Plus أو Wafacash.
                    </p>
                  </div>

                  <a
                    href={whatsAppCheckoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:brightness-105 text-black font-black text-xs md:text-sm border-3 border-black shadow-brutal flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle className="w-5 h-5 fill-black" />
                    <span>اطلب الكود عبر واتساب الآن ({activePlanPrice})</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Option 2: Instant Card Purchase via Gumroad / Ko-fi */}
                <div className="bg-royal/10 border-3 border-black rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-brutal-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full bg-sunny text-black border-2 border-black text-[11px] font-black">
                        تسليم آلي فوري ⚡
                      </span>
                      <CreditCard className="w-6 h-6 text-royal" />
                    </div>
                    <h4 className="text-base md:text-lg font-black text-black">
                      ٢. الشراء الفوري بالبطاقة (Gumroad / Ko-fi)
                    </h4>
                    <p className="text-xs font-bold text-gray-700 leading-relaxed">
                      ادفع بأمان عبر بطاقتك البنكية الدولية أو Apple Pay / PayPal واستلم كود التفعيل تلقائياً على الشاشة وعبر بريدك الإلكتروني فوراً.
                    </p>
                  </div>

                  <a
                    href={gumroadCheckoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-royal hover:bg-blue-700 text-white font-black text-xs md:text-sm border-3 border-black shadow-brutal flex items-center justify-center gap-2 transition"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>الشراء الفوري بالبطاقة ({activePlanPrice})</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream border-2 border-black text-xs font-bold text-gray-800 flex flex-wrap items-center justify-between gap-2">
                <span>
                  💡 بمجرد استلام الكود من واتساب أو Gumroad، الصقه في خانة{" "}
                  <strong>«أدخل كود القصارة»</strong> بالأعلى لتفعيله فوراً!
                </span>
                <span dir="ltr" className="font-mono font-black text-royal">
                  wa.me/{WHATSAPP_MERCHANT_PHONE}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
