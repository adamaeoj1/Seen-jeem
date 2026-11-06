"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Plus, Sparkles, X } from "lucide-react";
import { SeenJeemCategory, SeenJeemQuestion } from "@/data/seedQuestions";
import { saveCustomPackToDb } from "@/lib/db";

interface CustomBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (cat: SeenJeemCategory) => void;
}

export function CustomBuilderModal({
  isOpen,
  onClose,
  onSaveCategory,
}: CustomBuilderModalProps) {
  const [title, setTitle] = useState("أسئلة الشلة الخاصة");
  const [subtitle, setSubtitle] = useState("مواقف، ذكريات، وتحديات أصحابنا");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [color, setColor] = useState("#F4D03F");

  const [q200A, setQ200A] = useState("من هو أكثر شخص في الجلسة يتأخر عن المواعيد؟");
  const [a200A, setA200A] = useState("سلطان");
  const [q200B, setQ200B] = useState("ما هو المشروب الرسمي لجمعتنا دائماً؟");
  const [a200B, setA200B] = useState("قهوة مختصة, شاهي");

  const [q400A, setQ400A] = useState("في أي مدينة كانت آخر سفرة جماعية للشلة؟");
  const [a400A, setA400A] = useState("أبها, جدة");
  const [q400B, setQ400B] = useState("ما اسم الاستراحة أو الكافيه المفضل لدينا؟");
  const [a400B, setA400B] = useState("الدرعية");

  const [q600A, setQ600A] = useState("في أي عام تأسس قروب الواتساب الخاص بنا؟");
  const [a600A, setA600A] = useState("2021, ٢٠٢١");
  const [q600B, setQ600B] = useState("من هو بطل آخر بطولة بلوت أو فيفا في الشلة؟");
  const [a600B, setA600B] = useState("فهد");

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const catId = "custom-" + Date.now();

    const makeQ = (
      idx: number,
      pts: 200 | 400 | 600,
      qText: string,
      ansRaw: string
    ): SeenJeemQuestion => {
      const aliases = ansRaw
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        id: `${catId}-q-${idx}`,
        categoryId: catId,
        points: pts,
        slotIndex: idx,
        question: qText,
        displayAnswer: aliases[0] || ansRaw,
        acceptedAnswers: aliases.length > 0 ? aliases : [ansRaw],
        rejectedTraps: [],
        funFact: "من حزمة الأسئلة المخصصة",
      };
    };

    const newCat: SeenJeemCategory = {
      id: catId,
      title: title.trim() || "تصنيف مخصص",
      subtitle: subtitle.trim() || "أسئلة خاصة",
      icon: "Sparkles",
      color,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      questions: [
        makeQ(0, 200, q200A, a200A),
        makeQ(1, 200, q200B, a200B),
        makeQ(2, 400, q400A, a400A),
        makeQ(3, 400, q400B, a400B),
        makeQ(4, 600, q600A, a600A),
        makeQ(5, 600, q600B, a600B),
      ],
    };

    await saveCustomPackToDb(newCat);
    onSaveCategory(newCat);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-cream border-4 border-black rounded-3xl shadow-brutal-lg max-w-3xl w-full overflow-hidden my-6">
        <div className="bg-sunny border-b-4 border-black px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-black" />
            <div>
              <h3 className="text-xl font-black text-black">
                صانع الأسئلة المخصصة (PRO)
              </h3>
              <p className="text-xs font-bold text-black/80">
                صمم فئتك الخاصة مع صورة الغلاف والأسئلة الستة والمترادفات المقبولة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-coral border-2 border-black flex items-center justify-center shadow-brutal-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSave}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black mb-1">
                اسم التصنيف
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black mb-1">
                وصف قصير
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-black mb-1 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>رابط صورة الغلاف (اختياري)</span>
              </label>
              <input
                type="url"
                dir="ltr"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black">لون البطاقة:</span>
            {["#F4D03F", "#3B66B4", "#DE7A7A", "#2ECC71", "#E65C2E"].map(
              (c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 border-black ${
                    color === c ? "scale-110 ring-2 ring-black" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              )
            )}
          </div>

          <div className="space-y-2.5">
            {[
              { label: "٢٠٠ نقطة (١)", q: q200A, setQ: setQ200A, a: a200A, setA: setA200A },
              { label: "٢٠٠ نقطة (٢)", q: q200B, setQ: setQ200B, a: a200B, setA: setA200B },
              { label: "٤٠٠ نقطة (١)", q: q400A, setQ: setQ400A, a: a400A, setA: setA400A },
              { label: "٤٠٠ نقطة (٢)", q: q400B, setQ: setQ400B, a: a400B, setA: setA400B },
              { label: "٦٠٠ نقطة (١)", q: q600A, setQ: setQ600A, a: a600A, setA: setA600A },
              { label: "٦٠٠ نقطة (٢)", q: q600B, setQ: setQ600B, a: a600B, setA: setA600B },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-black rounded-2xl p-3 grid grid-cols-1 md:grid-cols-3 gap-2.5"
              >
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-royal mb-1">
                    سؤال {item.label}
                  </label>
                  <input
                    type="text"
                    required
                    value={item.q}
                    onChange={(e) => item.setQ(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-burnt mb-1">
                    الإجابات المقبولة (افصل بفاصلة)
                  </label>
                  <input
                    type="text"
                    required
                    value={item.a}
                    onChange={(e) => item.setA(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white border-2 border-black font-black text-xs"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-mint text-black border-2 border-black shadow-brutal font-black text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>حفظ الفئة في حسابي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
