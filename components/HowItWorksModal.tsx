"use client";

import React, { useState } from "react";
import { HelpCircle, QrCode, ShieldCheck, Smartphone, Tv, X } from "lucide-react";
import { evaluateArabicAnswer } from "@/lib/arabicReferee";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  const [sampleAnswer, setSampleAnswer] = useState("قسطنطينة");
  const accepted = ["القسطنطينية", "قسطنطينة", "بيزنطة", "إسلامبول"];
  const traps = ["إسطنبول", "أنقرة"];
  const verdict = evaluateArabicAnswer(sampleAnswer, accepted, traps, 0.82);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-cream border-4 border-black rounded-3xl shadow-brutal-lg max-w-3xl w-full overflow-hidden my-6">
        <div className="bg-royal text-white border-b-4 border-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-6 h-6 text-sunny" />
            <h2 className="text-xl md:text-2xl font-black">
              كيف تشتغل اللعبة؟
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-coral text-black border-2 border-black flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* 3 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-brutal-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sunny border-2 border-black flex items-center justify-center">
                <Tv className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base">١. شاشة المضيف</h3>
              <p className="text-xs font-bold text-gray-600 leading-relaxed">
                افتح جلسة اللعب على شاشة التلفزيون أو الآيباد أو اللابتوب أمام الجميع.
              </p>
            </div>

            <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-brutal-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-coral border-2 border-black flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base">٢. انضمام بالجوال</h3>
              <p className="text-xs font-bold text-gray-600 leading-relaxed">
                يمسح كل لاعب رمز الـ QR بجواله، يختار شخصيته الكرتونية وصوته الخاص ومجاناً بدون حساب.
              </p>
            </div>

            <div className="bg-white border-3 border-black rounded-2xl p-4 shadow-brutal-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-mint border-2 border-black flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-black text-base">٣. تصحيح ذكي فوري</h3>
              <p className="text-xs font-bold text-gray-600 leading-relaxed">
                اكتب الجواب، ارسم، أو ثبت الدبوس من جوالك، والحكم العربي الذكي يحسب النقاط تلقائياً!
              </p>
            </div>
          </div>

          {/* Interactive Smart Arabic Referee Tester */}
          <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-brutal space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-royal" />
              <h3 className="text-lg font-black">
                مختبر الحكم العربي الذكي (لا خلاف على الإملاء!)
              </h3>
            </div>
            <p className="text-xs font-bold text-gray-600">
              يقبل النظام الفروقات الإملائية (مثل الهمزات، التاء المربوطة، وال التعريف) بنسبة تشابه ٨٢٪ فأكثر، مع كشف الإجابات الفخية:
            </p>

            <div className="flex flex-wrap gap-2">
              {["قسطنطينة", "القسطنطينية", "بيزنطه", "إسطنبول"].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setSampleAnswer(ex)}
                  className={`px-3 py-1 rounded-xl border-2 border-black text-xs font-black ${
                    sampleAnswer === ex ? "bg-sunny" : "bg-cream"
                  }`}
                >
                  «{ex}»
                </button>
              ))}
            </div>

            <input
              type="text"
              value={sampleAnswer}
              onChange={(e) => setSampleAnswer(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-black text-sm"
            />

            <div
              className={`p-3.5 rounded-xl border-2 border-black flex items-center justify-between ${
                verdict.isCorrect
                  ? "bg-mint/30"
                  : verdict.isTrap
                  ? "bg-coral/40"
                  : "bg-sunny/40"
              }`}
            >
              <div>
                <div className="font-black text-sm">{verdict.verdictTitle}</div>
                <div className="text-xs font-bold text-gray-700">
                  {verdict.verdictDetail}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-black text-sunny font-mono font-black text-xs">
                {Math.round(verdict.similarity * 100)}٪
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
