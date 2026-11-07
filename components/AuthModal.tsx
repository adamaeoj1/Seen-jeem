"use client";

import React, { useState } from "react";
import { LogIn, LogOut, Mail, ShieldCheck, User, X } from "lucide-react";
import {
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  UserProfileRecord,
} from "@/lib/db";
import {
  handleResilientGoogleSignIn,
  useGoogleAuthDomainFix,
} from "@/lib/authFixHelper";
import { useEdition } from "@/lib/editionManager";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileRecord;
  onProfileChange: (nextProfile: UserProfileRecord) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  profile,
  onProfileChange,
}: AuthModalProps) {
  const { edition } = useEdition();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useGoogleAuthDomainFix({
    onSuccess: (nextProfile) => {
      onProfileChange(nextProfile);
      onClose();
    },
    onError: (msg) => setErrorMsg(msg),
  });

  if (!isOpen) return null;

  const isLoggedIn = Boolean(profile.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (mode === "signup") {
      const res = await signUpWithEmail(email, password, name);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      onProfileChange(res.profile);
      onClose();
    } else {
      const res = await signInWithEmail(email, password);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
        return;
      }
      onProfileChange(res.profile);
      onClose();
    }
  };

  const handleGoogleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    setErrorMsg(null);
    handleResilientGoogleSignIn(e, {
      onSuccess: (updatedProfile) => {
        onProfileChange(updatedProfile);
        onClose();
      },
      onError: (msg) => setErrorMsg(msg),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-cream border-4 border-black rounded-3xl shadow-brutal-lg max-w-md w-full overflow-hidden">
        <div className="bg-royal text-white border-b-4 border-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-6 h-6 text-sunny" />
            <h3 className="text-xl font-black">
              {isLoggedIn ? "حساب المضيف" : "تسجيل الدخول / إنشاء حساب"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-coral text-black border-2 border-black flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {isLoggedIn ? (
            <div className="space-y-4">
              <div className="bg-white border-3 border-black rounded-2xl p-4 space-y-2 shadow-brutal-sm">
                <div className="flex items-center justify-between">
                  <span className="font-black text-lg">{profile.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sunny border-2 border-black text-xs font-black">
                    {profile.tier === "pro"
                      ? "المضيف المحترف PRO"
                      : profile.tier === "party_pass"
                      ? `${edition.ticketName} ٢٤ ساعة`
                      : "الباقة الأساسية"}
                  </span>
                </div>
                <div
                  dir="ltr"
                  className="text-xs font-mono font-bold text-gray-600 text-right"
                >
                  {profile.email}
                </div>
                <div className="pt-2 border-t border-black/10 flex items-center justify-between text-xs font-black">
                  <span>رصيد الجلسات المجانية:</span>
                  <span className="text-royal">
                    {profile.tier === "free"
                      ? `${profile.free_sessions_remaining} جلسة`
                      : "غير محدود ∞"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const next = signOutUser();
                  onProfileChange(next);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-coral text-black font-black text-sm border-2 border-black shadow-brutal-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 bg-white p-1.5 rounded-2xl border-2 border-black">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`py-2 rounded-xl font-black text-xs transition ${
                    mode === "login"
                      ? "bg-sunny text-black border-2 border-black"
                      : "text-gray-600"
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`py-2 rounded-xl font-black text-xs transition ${
                    mode === "signup"
                      ? "bg-sunny text-black border-2 border-black"
                      : "text-gray-600"
                  }`}
                >
                  حساب جديد (+جلسة مجانية)
                </button>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 rounded-2xl bg-white hover:bg-gray-50 text-black font-black text-sm border-3 border-black shadow-brutal-sm flex items-center justify-center gap-2 transition"
              >
                <span className="text-base font-black text-royal">G</span>
                <span>المتابعة باستخدام حساب Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t-2 border-black/15" />
                <span className="shrink mx-3 text-xs font-black text-gray-500">
                  أو بالبريد الإلكتروني
                </span>
                <div className="flex-grow border-t-2 border-black/15" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-black mb-1">
                      اسم المضيف
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={edition.defaultHostPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-white font-bold text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black mb-1">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-white font-mono font-bold text-sm text-right"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black mb-1">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-white font-bold text-sm"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-coral/40 border-2 border-black text-xs font-black">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-black text-sunny font-black text-sm border-3 border-black shadow-brutal flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {loading
                      ? "جاري التحقق..."
                      : mode === "signup"
                      ? "إنشاء الحساب وتفعيل الجلسة المجانية"
                      : "دخول لحسابي"}
                  </span>
                </button>
              </form>

              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-gray-600">
                <ShieldCheck className="w-4 h-4 text-mint" />
                <span>
                  اللاعبون ينضمون للغرفة {edition.deviceTerm} مجاناً بدون الحاجة
                  لحساب
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
