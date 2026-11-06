"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Clock,
  CreditCard,
  Crown,
  Gift,
  Lock,
  Sparkles,
  Ticket,
  X,
  Zap,
} from "lucide-react";
import {
  SubscriptionTierId,
  UserSubscriptionState,
} from "@/lib/gameEngine";
import { getCachedProfile, updateProfileRecord } from "@/lib/db";

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
  const [selectedPlan, setSelectedPlan] =
    useState<SubscriptionTierId>("PARTY_PASS");
  const [showCheckoutStep, setShowCheckoutStep] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"apple_pay" | "card">(
    "apple_pay"
  );
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [checkoutSuccessMsg, setCheckoutSuccessMsg] = useState<string | null>(
    null
  );
  const [countdownText, setCountdownText] = useState<string>("23:59:59");

  useEffect(() => {
    if (!isOpen) return;
    const updateClock = () => {
      const target =
        subscription.partyPassExpiresAt || Date.now() + 24 * 60 * 60 * 1000;
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
  }, [isOpen, subscription.partyPassExpiresAt]);

  if (!isOpen) return null;

  const handleSelectPlanForCheckout = (tier: SubscriptionTierId) => {
    setSelectedPlan(tier);
    setErrorText(null);
    setCheckoutSuccessMsg(null);
    if (tier === "FREE_TRIAL") {
      if (subscription.freeSessionsRemaining > 0 && onProceedToCreateRoom) {
        onClose();
        onProceedToCreateRoom();
      }
      return;
    }
    setShowCheckoutStep(true);
  };

  const handleCompletePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorText(null);

    if (paymentMethod === "card") {
      const digitsOnly = cardNumber.replace(/\D/g, "");
      if (!cardHolder.trim() || digitsOnly.length < 12) {
        setErrorText("يرجى إدخال بيانات البطاقة بشكل صحيح");
        return;
      }
    }

    setProcessingCheckout(true);

    try {
      const profile = getCachedProfile();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          email: profile.email,
          planId: selectedPlan === "PRO_HOST" ? "PRO_HOST" : "PARTY_PASS",
          paymentMethod,
          originUrl:
            typeof window !== "undefined" ? window.location.origin : "",
        }),
      });

      const data = await res.json();
      if (data.status === "redirect" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      const nextSub: UserSubscriptionState = { ...subscription };
      if (selectedPlan === "PARTY_PASS") {
        const exp = Date.now() + 24 * 60 * 60 * 1000;
        nextSub.tier = "PARTY_PASS";
        nextSub.partyPassExpiresAt = exp;
        await updateProfileRecord({
          tier: "party_pass",
          pass_expires_at: new Date(exp).toISOString(),
        });
        setCheckoutSuccessMsg(
          "تم تفعيل تذكرة السهرة لمدة ٢٤ ساعة! استمتعوا بجلسات لا محدودة"
        );
      } else {
        nextSub.tier = "PRO_HOST";
        nextSub.proSubscriptionActive = true;
        await updateProfileRecord({
          tier: "pro",
          pass_expires_at: null,
        });
        setCheckoutSuccessMsg(
          "تم تفعيل اشتراك المضيف المحترف PRO! جميع الباقات وصانع الأسئلة مفتوحة"
        );
      }

      onUpdateSubscription(nextSub);
      setProcessingCheckout(false);
    } catch {
      setProcessingCheckout(false);
      setErrorText("تعذر الاتصال ببوابة الدفع، حاول مرة أخرى.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-cream border-4 border-black rounded-3xl shadow-brutal-lg max-w-4xl w-full overflow-hidden my-6">
        {/* Top Banner */}
        <div className="bg-royal text-white border-b-4 border-black px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sunny text-black border-2 border-black shadow-brutal-sm flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black">
                {paywallTriggered
                  ? "انتهت جلستك المجانية — افتح السهرة الآن!"
                  : "باقات وتذاكر السهرة"}
              </h2>
              <p className="text-sunny text-xs font-bold mt-0.5">
                المضيف فقط يحتاج تذكرة لإنشاء الغرفة • جميع اللاعبين ينضمون مجاناً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-coral text-black border-2 border-black shadow-brutal-sm flex items-center justify-center"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Active Pass Countdown Banner */}
          {subscription.tier === "PARTY_PASS" &&
            subscription.partyPassExpiresAt && (
              <div className="bg-sunny border-3 border-black rounded-2xl p-3.5 flex items-center justify-between shadow-brutal-sm">
                <span className="font-black text-sm flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  تذكرة السهرة ٢٤ ساعة نشطة الآن
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

          {/* 3 Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Free Session */}
            <div className="bg-white rounded-3xl border-4 border-black p-5 shadow-brutal flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-cream border-2 border-black text-xs font-black">
                    الباقة الترحيبية
                  </span>
                  <Gift className="w-6 h-6 text-royal" />
                </div>
                <h3 className="text-xl font-black">الجلسة المجانية</h3>
                <div className="my-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black">مجاناً</span>
                  <span className="text-xs font-bold text-gray-600">
                    / جلسة واحدة كاملة
                  </span>
                </div>
                <ul className="space-y-2 text-xs font-bold text-gray-700 mb-5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint shrink-0" />
                    <span>جلسة لعب كاملة للتجربة مع أصدقائك</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-mint shrink-0" />
                    <span>دخول مجاني لجميع اللاعبين بالجوال</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled={subscription.freeSessionsRemaining <= 0}
                onClick={() => handleSelectPlanForCheckout("FREE_TRIAL")}
                className={`w-full py-2.5 rounded-xl font-black text-xs border-2 border-black ${
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

            {/* Party Pass ($2.99 / 24h) */}
            <div className="bg-sunny rounded-3xl border-4 border-black p-5 shadow-brutal-lg flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-burnt text-white px-3.5 py-0.5 rounded-full border-2 border-black text-[11px] font-black whitespace-nowrap">
                الأكثر اختياراً للجمعات 🔥
              </div>

              <div>
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="px-2.5 py-1 rounded-full bg-white border-2 border-black text-xs font-black">
                    ٢٤ ساعة مفتوحة
                  </span>
                  <Ticket className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-black">تذكرة السهرة</h3>
                <div className="my-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black">$2.99</span>
                  <span className="text-xs font-black">/ ٢٤ ساعة</span>
                </div>
                <ul className="space-y-2 text-xs font-bold text-black mb-5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>جلسات غير محدودة لمدة ٢٤ ساعة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>جميع تصنيفات سين جيم والألعاب الثمانية</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>دفعة واحدة بدون تجديد تلقائي</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPlanForCheckout("PARTY_PASS")}
                className="w-full py-3 rounded-xl bg-black text-sunny font-black text-xs border-2 border-black shadow-brutal-sm"
              >
                احصل على تذكرة السهرة
              </button>
            </div>

            {/* Pro Host Monthly ($7.99/mo) */}
            <div className="bg-royal text-white rounded-3xl border-4 border-black p-5 shadow-brutal flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-sunny text-black border-2 border-black text-xs font-black">
                    شامل صانع الأسئلة 👑
                  </span>
                  <Crown className="w-6 h-6 text-sunny" />
                </div>
                <h3 className="text-xl font-black">المضيف المحترف</h3>
                <div className="my-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-sunny">$7.99</span>
                  <span className="text-xs font-bold text-cream">/ شهرياً</span>
                </div>
                <ul className="space-y-2 text-xs font-bold text-cream mb-5">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sunny shrink-0" />
                    <span>جلسات لعب لا محدودة طوال الشهر</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sunny shrink-0" />
                    <span>صانع الأسئلة والفئات المخصصة</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sunny shrink-0" />
                    <span>جميع الحزم الحصرية وتجربة بدون إعلانات</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleSelectPlanForCheckout("PRO_HOST")}
                className="w-full py-3 rounded-xl bg-sunny text-black font-black text-xs border-2 border-black shadow-brutal-sm"
              >
                اشترك كمضيف محترف
              </button>
            </div>
          </div>

          {/* Interactive Checkout Step */}
          {showCheckoutStep && (
            <div className="bg-white border-4 border-black rounded-2xl p-5 shadow-brutal space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black/15">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-royal" />
                  <h4 className="font-black text-base">
                    إتمام الاشتراك:{" "}
                    {selectedPlan === "PRO_HOST"
                      ? "باقة المضيف المحترف ($7.99/شهرياً)"
                      : "تذكرة السهرة ٢٤ ساعة ($2.99)"}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("apple_pay")}
                    className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs ${
                      paymentMethod === "apple_pay"
                        ? "bg-black text-white"
                        : "bg-cream text-black"
                    }`}
                  >
                     Pay / مدى
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`px-3.5 py-1.5 rounded-xl border-2 border-black font-black text-xs flex items-center gap-1 ${
                      paymentMethod === "card"
                        ? "bg-black text-white"
                        : "bg-cream text-black"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>بطاقة ائتمانية</span>
                  </button>
                </div>
              </div>

              {paymentMethod === "card" ? (
                <form
                  onSubmit={handleCompletePayment}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3"
                >
                  <div>
                    <label className="block text-xs font-black mb-1">
                      الاسم على البطاقة
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="SULTAN ALOTAIBI"
                      className="w-full px-3 py-2 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black mb-1">
                      رقم البطاقة
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full px-3 py-2 rounded-xl border-2 border-black bg-cream font-mono font-bold text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-black mb-1">
                        الانتهاء
                      </label>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="08/28"
                        className="w-full px-2.5 py-2 rounded-xl border-2 border-black bg-cream font-mono font-bold text-xs text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black mb-1">
                        CVC
                      </label>
                      <input
                        type="password"
                        required
                        dir="ltr"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        className="w-full px-2.5 py-2 rounded-xl border-2 border-black bg-cream font-mono font-bold text-xs text-center"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={processingCheckout}
                      className="w-full py-2.5 rounded-xl bg-mint text-black font-black text-xs border-2 border-black shadow-brutal-sm"
                    >
                      {processingCheckout ? "جاري التأكيد..." : "تأكيد الدفع الآن"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs font-bold text-gray-700">
                    دفع سريع ومشفر عبر Apple Pay أو بطاقة مدى البنكية.
                  </span>
                  <button
                    type="button"
                    disabled={processingCheckout}
                    onClick={() => handleCompletePayment()}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-black text-white font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-sunny" />
                    <span>
                      {processingCheckout
                        ? "جاري التفعيل..."
                        : `الدفع عبر  Pay (${
                            selectedPlan === "PRO_HOST" ? "$7.99" : "$2.99"
                          })`}
                    </span>
                  </button>
                </div>
              )}

              {errorText && (
                <div className="p-3 rounded-xl bg-coral/40 border-2 border-black text-xs font-black">
                  {errorText}
                </div>
              )}
            </div>
          )}

          {checkoutSuccessMsg && (
            <div className="p-4 rounded-2xl bg-mint/35 border-3 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-black text-sm">{checkoutSuccessMsg}</span>
              {onProceedToCreateRoom && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onProceedToCreateRoom();
                  }}
                  className="px-5 py-2 rounded-xl bg-sunny text-black font-black text-xs border-2 border-black shadow-brutal-sm"
                >
                  متابعة لإنشاء الغرفة
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
