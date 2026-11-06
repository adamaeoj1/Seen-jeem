"use client";

import React, { useEffect, useState } from "react";
import { Bot, RotateCcw, Settings2, Smartphone, Wrench, X } from "lucide-react";
import { Player } from "@/lib/gameEngine";
import { CartoonAvatar } from "@/components/CartoonAvatars";

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

  // Listen for Shift + D keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === "D" || e.key === "d" || e.key === "ي")) {
        // Ignore if user is typing in an input or textarea
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Discrete tiny gear button for footer */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="أدوات المطور (Shift + D)"
        className="opacity-35 hover:opacity-100 p-1.5 rounded-lg transition text-current inline-flex items-center gap-1"
      >
        <Settings2 className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
          dir="rtl"
        >
          <div className="bg-cream border-r-4 border-black w-full max-w-sm h-full p-5 shadow-brutal-lg flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-royal" />
                  <h3 className="font-black text-base">
                    درج أدوات المطور والاختبار
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-coral border-2 border-black flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs font-bold text-gray-600">
                هذه الأدوات مخفية عن اللاعبين وتظهر فقط بالضغط على{" "}
                <kbd className="px-1.5 py-0.5 bg-white border border-black rounded font-mono">
                  Shift + D
                </kbd>
              </p>

              <div className="space-y-2.5">
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
                        <span>{p.team === "team1" ? "الصقور" : "النمور"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-[11px] font-mono text-gray-500 text-center">
              Seen Jeem × Gimnim Dev Console
            </div>
          </div>
        </div>
      )}
    </>
  );
}
