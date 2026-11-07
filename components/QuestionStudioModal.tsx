"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Bot,
  Camera,
  Check,
  Download,
  Edit3,
  FileEdit,
  FolderPlus,
  Layers,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  MiniGameId,
  SEEN_JEEM_CATEGORIES,
  SeenJeemCategory,
  SeenJeemQuestion,
} from "@/data/seedQuestions";
import { MINI_GAMES_META } from "@/lib/gameEngine";
import { MOROCCAN_SEEN_JEEM_CATEGORIES } from "@/data/moroccanSeedQuestions";
import { ENGLISH_SEEN_JEEM_CATEGORIES } from "@/data/englishSeedQuestions";
import { EditionFlagIcon } from "@/components/QadhaLogo";
import { compressImageFile } from "@/lib/imageCompressor";
import {
  addCustomStudioCategory,
  addCustomStudioMiniGameQuestion,
  addQuestionToCategory,
  applyQuestionBankOverrides,
  deleteOrHideQuestion,
  exportQuestionBankJson,
  getMergedClosestNumberRounds,
  getMergedDrawingRounds,
  getMergedPriceGuessRounds,
  getMergedSpeedTriviaRounds,
  importQuestionBankJson,
  loadCustomQuestionBank,
  resetQuestionBankOverrides,
  resetSeenQuestionsHistory,
  saveQuestionInlineEdit,
} from "@/lib/questionRandomizer";
import { saveCustomPackToDb } from "@/lib/db";
import { EditionRegion, useEdition } from "@/lib/editionManager";

export interface QuestionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory?: (cat: SeenJeemCategory) => void;
  onBankUpdated?: () => void;
  initialTab?: "BROWSE_EDIT" | "ADD_QUESTION" | "NEW_CATEGORY" | "AI_GENERATOR";
}

type StudioModeFilter = "BOARD" | MiniGameId;

export function QuestionStudioModal({
  isOpen,
  onClose,
  onSaveCategory,
  onBankUpdated,
  initialTab = "BROWSE_EDIT",
}: QuestionStudioModalProps) {
  const { region } = useEdition();
  const [selectedEdition, setSelectedEdition] = useState<EditionRegion>(region);
  const [selectedMode, setSelectedMode] = useState<StudioModeFilter>("BOARD");
  const [activeTab, setActiveTab] = useState<
    "BROWSE_EDIT" | "ADD_QUESTION" | "NEW_CATEGORY" | "AI_GENERATOR"
  >(initialTab);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    "cat-ma-football"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AI Generator state
  const [aiTopicInput, setAiTopicInput] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  // Inline Editing State for Board Questions
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null
  );
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editDisplayAnswer, setEditDisplayAnswer] = useState("");
  const [editSynonymsText, setEditSynonymsText] = useState("");
  const [editHintText, setEditHintText] = useState("");
  const [editPoints, setEditPoints] = useState<200 | 400 | 600>(200);
  const [editFunFact, setEditFunFact] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // Add New Question to Existing Category State
  const [newQPoints, setNewQPoints] = useState<200 | 400 | 600>(200);
  const [newQText, setNewQText] = useState("");
  const [newQAnswer, setNewQAnswer] = useState("");
  const [newQSynonyms, setNewQSynonyms] = useState("");
  const [newQHint, setNewQHint] = useState("");
  const [newQFunFact, setNewQFunFact] = useState("");
  const [newQImageUrl, setNewQImageUrl] = useState("");

  // Add Mini-Game Question State
  const [mgQuestionText, setMgQuestionText] = useState("");
  const [mgAnswerText, setMgAnswerText] = useState("");
  const [mgOption1, setMgOption1] = useState("");
  const [mgOption2, setMgOption2] = useState("");
  const [mgOption3, setMgOption3] = useState("");
  const [mgOption4, setMgOption4] = useState("");
  const [mgCorrectIdx, setMgCorrectIdx] = useState(0);
  const [mgPriceValue, setMgPriceValue] = useState("1500");
  const [mgUnitLabel, setMgUnitLabel] = useState("متر");

  // New Custom Category State
  const [catTitle, setCatTitle] = useState("أسئلة الگلسة الخاصة");
  const [catSubtitle, setCatSubtitle] = useState(
    "مواقف، ذكريات، وتحديات العشران والعائلة"
  );
  const [catColor, setCatColor] = useState("#F4D03F");
  const [catIcon, setCatIcon] = useState("Sparkles");
  const [catQ200A, setCatQ200A] = useState(
    "شكون هو أكثر واحد فـ الگلسة كيتعطل ديما على المواعيد؟"
  );
  const [catA200A, setCatA200A] = useState("أمين");
  const [catQ200B, setCatQ200B] = useState(
    "شنو هو المشروب الرسمي ديال الگلسة ديالنا ديما؟"
  );
  const [catA200B, setCatA200B] = useState("أتاي بالنعناع, قهوة");
  const [catQ400A, setCatQ400A] = useState(
    "فـ أي مدينة كانت آخر خرجة أو تسافيرة جماعية ديالنا؟"
  );
  const [catA400A, setCatA400A] = useState("مراكش, طنجة, إفران");
  const [catQ400B, setCatQ400B] = useState(
    "شنو سمية الكافي أو البلاصة المفضلة اللي كنجمعو فيها؟"
  );
  const [catA400B, setCatA400B] = useState("المدينة");
  const [catQ600A, setCatQ600A] = useState(
    "فـ أي عام تصاوب كروب الواتساب ديالنا؟"
  );
  const [catA600A, setCatA600A] = useState("2022, ٢٠٢٢");
  const [catQ600B, setCatQ600B] = useState(
    "شكون هو بطل آخر، طرح ديال فيفا أو قَدْهَا فـ الشلة؟"
  );
  const [catA600B, setCatA600B] = useState("ياسين");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setSelectedEdition(region);
  }, [region]);

  const rawRegionalCategories =
    selectedEdition === "EN"
      ? ENGLISH_SEEN_JEEM_CATEGORIES
      : selectedEdition === "MA"
      ? MOROCCAN_SEEN_JEEM_CATEGORIES
      : SEEN_JEEM_CATEGORIES;

  const mergedCategories = applyQuestionBankOverrides(
    rawRegionalCategories,
    selectedEdition
  );

  useEffect(() => {
    if (
      mergedCategories.length > 0 &&
      !mergedCategories.some((c) => c.id === selectedCategoryId)
    ) {
      setSelectedCategoryId(mergedCategories[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEdition, refreshTick]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const currentCategory =
    mergedCategories.find((c) => c.id === selectedCategoryId) ||
    mergedCategories[0];

  const filteredQuestions = (currentCategory?.questions || []).filter((q) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.trim().toLowerCase();
    return (
      q.question.toLowerCase().includes(term) ||
      q.displayAnswer.toLowerCase().includes(term) ||
      (q.acceptedAnswers || []).some((a) => a.toLowerCase().includes(term))
    );
  });

  const handleStartInlineEdit = (q: SeenJeemQuestion) => {
    setEditingQuestionId(q.id);
    setEditQuestionText(q.question);
    setEditDisplayAnswer(q.displayAnswer);
    const syns =
      q.acceptedSynonyms && q.acceptedSynonyms.length > 0
        ? q.acceptedSynonyms
        : q.acceptedAnswers;
    setEditSynonymsText(syns.join("، "));
    setEditHintText(q.hint || "");
    setEditPoints(q.points);
    setEditFunFact(q.funFact || "");
    setEditImageUrl(q.imageUrl || "");
  };

  const handleSaveInlineEdit = (q: SeenJeemQuestion) => {
    const parsedSynonyms = editSynonymsText
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const primaryAnswer =
      editDisplayAnswer.trim() || parsedSynonyms[0] || q.displayAnswer;
    const allAccepted = Array.from(
      new Set([primaryAnswer, ...parsedSynonyms])
    );

    saveQuestionInlineEdit(q.id, {
      question: editQuestionText.trim() || q.question,
      displayAnswer: primaryAnswer,
      acceptedAnswers: allAccepted,
      acceptedSynonyms: allAccepted,
      hint: editHintText.trim() || undefined,
      points: editPoints,
      funFact: editFunFact.trim() || q.funFact,
      imageUrl: editImageUrl.trim() || undefined,
    });

    setEditingQuestionId(null);
    setRefreshTick((t) => t + 1);
    onBankUpdated?.();
    showToast("✔ تم حفظ تعديل السؤال بنجاح في بنك أسئلة قَدْهَا؟");
  };

  const handleDeleteQuestion = (questionId: string) => {
    deleteOrHideQuestion(questionId);
    if (editingQuestionId === questionId) {
      setEditingQuestionId(null);
    }
    setRefreshTick((t) => t + 1);
    onBankUpdated?.();
    showToast("🗑️ تم حذف / إخفاء السؤال من هذه الفئة");
  };

  const handleAddBoardQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory || !newQText.trim() || !newQAnswer.trim()) return;

    const parsedSynonyms = newQSynonyms
      .split(/[,،]/)
      .map((s) => s.trim())
      .filter(Boolean);

    addQuestionToCategory(currentCategory.id, {
      points: newQPoints,
      question: newQText.trim(),
      displayAnswer: newQAnswer.trim(),
      acceptedAnswers:
        parsedSynonyms.length > 0 ? parsedSynonyms : [newQAnswer.trim()],
      acceptedSynonyms: parsedSynonyms,
      rejectedTraps: [],
      hint: newQHint.trim() || undefined,
      funFact: newQFunFact.trim() || "سؤال مخصص من استوديو قَدْهَا؟",
      imageUrl: newQImageUrl.trim() || undefined,
    });

    setNewQText("");
    setNewQAnswer("");
    setNewQSynonyms("");
    setNewQHint("");
    setNewQFunFact("");
    setNewQImageUrl("");
    setActiveTab("BROWSE_EDIT");
    setRefreshTick((t) => t + 1);
    onBankUpdated?.();
    showToast(`✔ تمت إضافة السؤال الجديد إلى «${currentCategory.title}»!`);
  };

  const handleAddMiniGameItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMode === "BOARD") return;

    if (selectedMode === "SPEED_TRIVIA") {
      const opts = [
        mgOption1.trim() || "الخيار 1",
        mgOption2.trim() || "الخيار 2",
        mgOption3.trim() || "الخيار 3",
        mgOption4.trim() || "الخيار 4",
      ];
      addCustomStudioMiniGameQuestion({
        miniGameId: "SPEED_TRIVIA",
        edition: selectedEdition,
        question: mgQuestionText.trim(),
        answer: opts[mgCorrectIdx] || opts[0],
        options: opts,
        correctIndex: mgCorrectIdx,
        hint: newQFunFact.trim() || "سؤال سرعة مخصص",
      });
    } else if (selectedMode === "PRICE_GUESS") {
      addCustomStudioMiniGameQuestion({
        miniGameId: "PRICE_GUESS",
        edition: selectedEdition,
        question: mgQuestionText.trim(),
        answer: mgAnswerText.trim() || "منتج مغربي/عالمي",
        numericValue: Number(mgPriceValue) || 1000,
        hint: newQHint.trim() || "تخمين السعر",
      });
    } else if (selectedMode === "CLOSEST_NUMBER") {
      addCustomStudioMiniGameQuestion({
        miniGameId: "CLOSEST_NUMBER",
        edition: selectedEdition,
        question: mgQuestionText.trim(),
        answer: String(Number(mgPriceValue) || 100),
        numericValue: Number(mgPriceValue) || 100,
        unitLabel: mgUnitLabel.trim() || "رقم",
        hint: newQHint.trim() || "النطاق التقريبي",
      });
    } else {
      const syns = mgAnswerText
        .split(/[,،]/)
        .map((s) => s.trim())
        .filter(Boolean);
      addCustomStudioMiniGameQuestion({
        miniGameId: selectedMode,
        edition: selectedEdition,
        question: mgQuestionText.trim(),
        answer: syns[0] || mgQuestionText.trim(),
        acceptedSynonyms: syns,
        hint: newQHint.trim() || "تحدي قَدْهَا؟",
      });
    }

    setMgQuestionText("");
    setMgAnswerText("");
    setMgOption1("");
    setMgOption2("");
    setMgOption3("");
    setMgOption4("");
    setRefreshTick((t) => t + 1);
    onBankUpdated?.();
    showToast("✔ تمت إضافة سؤال التحدي الجديد بنجاح!");
  };

  const handleCreateFullCategory = async (e: React.FormEvent) => {
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
        acceptedSynonyms: aliases.length > 0 ? aliases : [ansRaw],
        rejectedTraps: [],
        funFact: "من فئات استوديو قَدْهَا؟ المخصصة",
      };
    };

    const newCat: SeenJeemCategory = {
      id: catId,
      title: catTitle.trim() || "فئة قَدْهَا؟ مخصصة",
      subtitle: catSubtitle.trim() || "أسئلة خاصة",
      icon: catIcon,
      color: catColor,
      questions: [
        makeQ(0, 200, catQ200A, catA200A),
        makeQ(1, 200, catQ200B, catA200B),
        makeQ(2, 400, catQ400A, catA400A),
        makeQ(3, 400, catQ400B, catA400B),
        makeQ(4, 600, catQ600A, catA600A),
        makeQ(5, 600, catQ600B, catA600B),
      ],
    };

    addCustomStudioCategory(newCat);
    await saveCustomPackToDb(newCat);
    onSaveCategory?.(newCat);
    onBankUpdated?.();
    setSelectedCategoryId(newCat.id);
    setActiveTab("BROWSE_EDIT");
    setRefreshTick((t) => t + 1);
    showToast(`✔ تم إنشاء الفئة «${newCat.title}» وإضافتها للعبة!`);
  };

  const handleExportJson = () => {
    const jsonStr = exportQuestionBankJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qadha-question-bank-${selectedEdition.toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📥 تم تصدير ملف الأسئلة بصيغة JSON بنجاح");
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      const res = importQuestionBankJson(content);
      if (res.success) {
        setRefreshTick((t) => t + 1);
        onBankUpdated?.();
        showToast(res.messageAr);
      } else {
        showToast(`⚠️ ${res.messageAr}`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleStudioGenerateAiCategory = async (overrideTopic?: string) => {
    const targetTopic = (overrideTopic || aiTopicInput).trim();
    if (!targetTopic) return;
    setIsGeneratingAi(true);
    setAiStatusMsg(null);
    try {
      const res = await fetch("/api/generate-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: targetTopic, edition: selectedEdition }),
      });
      const data = await res.json();
      if (data.ok && data.category) {
        addCustomStudioCategory(data.category);
        await saveCustomPackToDb(data.category);
        onSaveCategory?.(data.category);
        onBankUpdated?.();
        setSelectedCategoryId(data.category.id);
        setRefreshTick((t) => t + 1);
        setAiStatusMsg({
          ok: true,
          text: `تم توليد الفئة «${data.category.title}» بنجاح! ⚡`,
        });
        setAiTopicInput("");
        showToast(`✔ تم توليد الفئة «${data.category.title}» بنجاح!`);
      } else {
        setAiStatusMsg({
          ok: false,
          text: data.error || "تعذر توليد الفئة، حاول مجدداً",
        });
      }
    } catch {
      setAiStatusMsg({
        ok: false,
        text: "حدث خطأ أثناء الاتصال بالمولّد الذكي",
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleUploadPhotoForQuestion = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "INLINE_EDIT" | "NEW_QUESTION"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 720, 0.72);
      if (target === "INLINE_EDIT") {
        setEditImageUrl(compressed);
      } else {
        setNewQImageUrl(compressed);
      }
      showToast("✔ تم ضغط ورفع الصورة بنجاح!");
    } catch (err) {
      console.error("Photo compression error:", err);
      showToast("⚠️ تعذر معالجة الصورة");
    }
  };

  const handleResetDefaults = () => {
    resetQuestionBankOverrides();
    resetSeenQuestionsHistory();
    setEditingQuestionId(null);
    setRefreshTick((t) => t + 1);
    onBankUpdated?.();
    showToast("🔄 تمت استعادة جميع الأسئلة الافتراضية وتصفير سجل التكرار");
  };

  const customBankStats = loadCustomQuestionBank();
  const totalEditsCount =
    Object.keys(customBankStats.questionEdits).length +
    Object.values(customBankStats.addedQuestionsByCategory).reduce(
      (acc, arr) => acc + arr.length,
      0
    ) +
    customBankStats.customCategories.length +
    customBankStats.customSpeedTrivia.length +
    customBankStats.customPriceGuess.length +
    customBankStats.customClosestNumber.length +
    customBankStats.customDrawingPrompts.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-cream border-4 border-black rounded-3xl shadow-brutal-lg max-w-5xl w-full overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Top Studio Header */}
        <div className="bg-sunny border-b-4 border-black px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-black text-sunny border-2 border-black flex items-center justify-center shadow-brutal-sm">
              <FileEdit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-2xl font-black text-black">
                  استوديو إدارة وتعديل الأسئلة — قَدْهَا؟
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-mint text-black border-2 border-black text-[11px] font-black">
                  مفتوح بالكامل
                </span>
              </div>
              <p className="text-xs font-bold text-black/80">
                عدّل أي سؤال حالي، أضف إجابات بديلة، أو أنشئ أسئلة وفئات جديدة
                تحفظ تلقائياً ({totalEditsCount} تعديل/إضافة نشطة)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-cream text-black border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-brutal-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 تصدير JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-cream text-black border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-brutal-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>📤 استيراد JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportJsonFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-xl bg-coral/40 hover:bg-coral text-black border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-brutal-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>🔄 استعادة الأسئلة الافتراضية</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-coral text-black border-2 border-black flex items-center justify-center shadow-brutal-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="bg-black text-sunny px-5 py-2.5 text-xs font-black flex items-center justify-between border-b-2 border-black">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Controls Bar: Edition + Mode + Action Tabs */}
        <div className="bg-white border-b-3 border-black px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Edition & Mode Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border-2 border-black bg-cream p-0.5">
              <button
                type="button"
                onClick={() => setSelectedEdition("MA")}
                className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                  selectedEdition === "MA"
                    ? "bg-sunny text-black border border-black"
                    : "text-gray-700"
                }`}
              >
                <EditionFlagIcon edition="MA" className="w-4 h-3" />
                <span>النسخة المغربية</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEdition("MENA")}
                className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                  selectedEdition === "MENA"
                    ? "bg-royal text-white border border-black"
                    : "text-gray-700"
                }`}
              >
                <EditionFlagIcon edition="MENA" className="w-4 h-3" />
                <span>النسخة العربية</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEdition("EN")}
                className={`px-3 py-1 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
                  selectedEdition === "EN"
                    ? "bg-mint text-black border border-black"
                    : "text-gray-700"
                }`}
              >
                <EditionFlagIcon edition="EN" className="w-4 h-3" />
                <span>English Edition</span>
              </button>
            </div>

            <select
              value={selectedMode}
              onChange={(e) =>
                setSelectedMode(e.target.value as StudioModeFilter)
              }
              className="px-3 py-1.5 rounded-xl border-2 border-black bg-cream font-black text-xs focus:outline-none"
            >
              <option value="BOARD">لوحة قَدْهَا؟ التفاعلية (الفئات)</option>
              {MINI_GAMES_META.map((m) => (
                <option key={m.id} value={m.id}>
                  تحدي #{m.number}: {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Studio Action Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("BROWSE_EDIT")}
              className={`px-3.5 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 transition ${
                activeTab === "BROWSE_EDIT"
                  ? "bg-royal text-white shadow-brutal-sm"
                  : "bg-cream text-black hover:bg-sunny/40"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>تصفح وتعديل الأسئلة</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ADD_QUESTION")}
              className={`px-3.5 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 transition ${
                activeTab === "ADD_QUESTION"
                  ? "bg-mint text-black shadow-brutal-sm"
                  : "bg-cream text-black hover:bg-mint/40"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ إضافة سؤال جديد</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedMode("BOARD");
                setActiveTab("NEW_CATEGORY");
              }}
              className={`px-3.5 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 transition ${
                activeTab === "NEW_CATEGORY"
                  ? "bg-sunny text-black shadow-brutal-sm"
                  : "bg-cream text-black hover:bg-sunny/40"
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ فئة مخصصة كاملة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedMode("BOARD");
                setActiveTab("AI_GENERATOR");
              }}
              className={`px-3.5 py-1.5 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 transition ${
                activeTab === "AI_GENERATOR"
                  ? "bg-burnt text-white shadow-brutal-sm"
                  : "bg-cream text-black hover:bg-burnt/20"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>🤖 مولّد الفئات بالذكاء الاصطناعي (PRO)</span>
            </button>
          </div>
        </div>

        {/* Studio Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* ================================================================
              TAB 1: BROWSE & INLINE EDIT QUESTIONS
          ================================================================ */}
          {activeTab === "BROWSE_EDIT" && selectedMode === "BOARD" && (
            <div className="space-y-4">
              {/* Category Pills + Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {mergedCategories.map((cat) => {
                    const active = cat.id === currentCategory?.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(cat.id);
                          setEditingQuestionId(null);
                        }}
                        className={`px-3.5 py-2 rounded-2xl border-2 border-black text-xs font-black transition flex items-center gap-2 ${
                          active
                            ? "bg-sunny text-black shadow-brutal-sm -translate-y-0.5"
                            : "bg-white text-gray-800 hover:bg-sunny/30"
                        }`}
                      >
                        <span>{cat.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-black text-sunny font-mono text-[10px]">
                          {cat.questions.length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative min-w-[230px]">
                  <Search className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث داخل أسئلة الفئة..."
                    className="w-full pr-9 pl-3 py-2 rounded-xl border-2 border-black bg-white font-bold text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Questions List for Selected Category */}
              <div className="space-y-3">
                {filteredQuestions.map((q) => {
                  const isEditing = editingQuestionId === q.id;
                  const badgeBg =
                    q.points === 200
                      ? "bg-cream text-black"
                      : q.points === 400
                      ? "bg-sunny text-black"
                      : "bg-coral text-black";

                  return (
                    <div
                      key={q.id}
                      className="bg-white border-3 border-black rounded-2xl p-4 shadow-brutal-sm space-y-3"
                    >
                      {!isEditing ? (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-lg border-2 border-black font-mono font-black text-xs ${badgeBg}`}
                              >
                                {q.points} نقطة
                              </span>
                              <span className="text-xs font-black text-royal">
                                الجواب: «{q.displayAnswer}»
                              </span>
                              {q.hint && (
                                <span className="text-[11px] font-bold text-gray-600 bg-cream px-2 py-0.5 rounded-lg border border-black/20">
                                  💡 تلميح: {q.hint}
                                </span>
                              )}
                            </div>

                            <div className="font-black text-sm md:text-base text-black">
                              {q.question}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[11px] font-bold text-gray-500">
                                الإجابات البديلة المقبولة:
                              </span>
                              {(q.acceptedSynonyms &&
                              q.acceptedSynonyms.length > 0
                                ? q.acceptedSynonyms
                                : q.acceptedAnswers
                              ).map((syn, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="px-2 py-0.5 rounded-md bg-mint/30 border border-black text-[11px] font-black"
                                >
                                  {syn}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartInlineEdit(q)}
                              className="px-3.5 py-2 rounded-xl bg-sunny hover:bg-yellow-300 text-black border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-brutal-sm"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>✏️ تعديل</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="px-3 py-2 rounded-xl bg-coral/40 hover:bg-coral text-black border-2 border-black font-black text-xs flex items-center gap-1 shadow-brutal-sm"
                              title="حذف السؤال"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Inline Editor Form */
                        <div className="space-y-3 bg-cream/60 p-3.5 rounded-2xl border-2 border-black">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-royal">
                              ✏️ تعديل السؤال مباشرة
                            </span>
                            <div className="flex items-center gap-1.5">
                              {([200, 400, 600] as const).map((pts) => (
                                <button
                                  key={pts}
                                  type="button"
                                  onClick={() => setEditPoints(pts)}
                                  className={`px-2.5 py-1 rounded-lg border-2 border-black font-mono text-xs font-black ${
                                    editPoints === pts
                                      ? "bg-sunny text-black"
                                      : "bg-white text-gray-600"
                                  }`}
                                >
                                  {pts}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-black mb-1">
                                نص السؤال
                              </label>
                              <input
                                type="text"
                                value={editQuestionText}
                                onChange={(e) =>
                                  setEditQuestionText(e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-bold text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-black mb-1">
                                الجواب الرئيسي المعروض
                              </label>
                              <input
                                type="text"
                                value={editDisplayAnswer}
                                onChange={(e) =>
                                  setEditDisplayAnswer(e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-bold text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-black mb-1">
                                قبول إجابات بديلة (افصل بفاصلة ،)
                              </label>
                              <input
                                type="text"
                                value={editSynonymsText}
                                onChange={(e) =>
                                  setEditSynonymsText(e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-bold text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-black mb-1">
                                تلميح اختياري (يظهر تحت السؤال)
                              </label>
                              <input
                                type="text"
                                value={editHintText}
                                onChange={(e) =>
                                  setEditHintText(e.target.value)
                                }
                                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-bold text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-black mb-1">
                                معلومة إضافية بعد كشف الجواب
                              </label>
                              <input
                                type="text"
                                value={editFunFact}
                                onChange={(e) => setEditFunFact(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border-2 border-black bg-white font-bold text-xs"
                              />
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                              <label className="block text-[11px] font-black">
                                🖼️ صورة السؤال (اختياري — لعرض سؤال مصوّر على الشاشة):
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  dir="ltr"
                                  value={editImageUrl}
                                  onChange={(e) => setEditImageUrl(e.target.value)}
                                  placeholder="https://... أو ارفع صورة مباشرة من جهازك"
                                  className="flex-1 px-3 py-2 rounded-xl border-2 border-black bg-white font-mono text-xs"
                                />
                                <label className="cursor-pointer px-3 py-2 rounded-xl bg-sunny hover:bg-yellow-400 border-2 border-black font-black text-xs shadow-brutal-sm flex items-center gap-1.5 shrink-0 transition">
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>رفع صورة 📸</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleUploadPhotoForQuestion(e, "INLINE_EDIT")}
                                  />
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingQuestionId(null)}
                              className="px-4 py-1.5 rounded-xl bg-white border-2 border-black font-black text-xs"
                            >
                              إلغاء
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveInlineEdit(q)}
                              className="px-5 py-1.5 rounded-xl bg-mint text-black border-2 border-black shadow-brutal-sm font-black text-xs flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>حفظ التعديل</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BROWSE MINI-GAMES QUESTIONS */}
          {activeTab === "BROWSE_EDIT" && selectedMode !== "BOARD" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white border-3 border-black rounded-2xl p-4">
                <div>
                  <h3 className="text-base font-black">
                    بنك أسئلة:{" "}
                    {
                      MINI_GAMES_META.find((m) => m.id === selectedMode)?.title
                    }{" "}
                    ({selectedEdition === "MA" ? "🇲🇦 المغرب" : "🌍 العالمية"})
                  </h3>
                  <p className="text-xs font-bold text-gray-600">
                    يتم خلط هذه الأسئلة تلقائياً في كل جولة مع منع التكرار
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("ADD_QUESTION")}
                  className="px-4 py-2 rounded-xl bg-mint text-black border-2 border-black font-black text-xs shadow-brutal-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ أضف سؤالاً لهذا التحدي</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedMode === "SPEED_TRIVIA" &&
                  getMergedSpeedTriviaRounds(selectedEdition).map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border-2 border-black rounded-2xl p-4 space-y-2"
                    >
                      <div className="font-black text-sm">{r.question}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {r.options.map((opt, idx) => (
                          <span
                            key={idx}
                            className={`px-2.5 py-0.5 rounded-lg border border-black text-xs font-black ${
                              idx === r.correctIndex
                                ? "bg-mint text-black"
                                : "bg-cream text-gray-700"
                            }`}
                          >
                            {idx === r.correctIndex ? "✔ " : ""}
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                {selectedMode === "PRICE_GUESS" &&
                  getMergedPriceGuessRounds(selectedEdition).map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border-2 border-black rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-black text-sm">{r.productName}</div>
                        <div className="text-xs font-bold text-gray-600">
                          {r.brand} • {r.specs}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-sunny border-2 border-black font-mono font-black text-xs shrink-0">
                        {(selectedEdition === "MA"
                          ? r.actualPriceDh ?? r.actualPriceSar
                          : r.actualPriceSar
                        ).toLocaleString("en-US")}{" "}
                        {selectedEdition === "MA" ? "DH" : "$"}
                      </span>
                    </div>
                  ))}

                {selectedMode === "CLOSEST_NUMBER" &&
                  getMergedClosestNumberRounds(selectedEdition).map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border-2 border-black rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="font-black text-sm">{r.question}</div>
                      <span className="px-3 py-1 rounded-xl bg-sunny border-2 border-black font-mono font-black text-xs shrink-0">
                        {r.correctNumber} {r.unitLabel}
                      </span>
                    </div>
                  ))}

                {selectedMode === "DRAWING_CHALLENGE" &&
                  getMergedDrawingRounds(selectedEdition).map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border-2 border-black rounded-2xl p-4 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-black text-sm">
                          الكلمة السرية: «{r.secretWord}»
                        </div>
                        <div className="text-xs font-bold text-gray-600">
                          التلميح: {r.categoryHint}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-mint border-2 border-black font-mono font-black text-xs">
                        {r.difficultyPoints} نقطة
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 2: ADD NEW QUESTION TO EXISTING CATEGORY OR MINI-GAME
          ================================================================ */}
          {activeTab === "ADD_QUESTION" && selectedMode === "BOARD" && (
            <form
              onSubmit={handleAddBoardQuestion}
              className="bg-white border-3 border-black rounded-3xl p-5 shadow-brutal space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/10 pb-3">
                <div>
                  <h3 className="text-lg font-black">
                    + إضافة سؤال جديد إلى فئة قائمة
                  </h3>
                  <p className="text-xs font-bold text-gray-600">
                    اختر الفئة وقيمة النقاط وسيتم دمج السؤال فوراً في لوحة
                    قَدْهَا؟
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black mb-1">
                    اختر الفئة المستهدفة
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-black text-xs"
                  >
                    {mergedCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.questions.length} سؤال)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black mb-1">
                    قيمة نقاط السؤال
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([200, 400, 600] as const).map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setNewQPoints(pts)}
                        className={`py-2 rounded-xl border-2 border-black font-mono font-black text-sm ${
                          newQPoints === pts
                            ? "bg-sunny text-black shadow-brutal-sm"
                            : "bg-cream text-gray-700"
                        }`}
                      >
                        {pts} نقطة
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-black mb-1">
                    نص السؤال *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    placeholder="مثال: من هو اللاعب المغربي الذي سجل هدف الفوز في..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black mb-1">
                    الجواب الصحيح الرئيسي *
                  </label>
                  <input
                    type="text"
                    required
                    value={newQAnswer}
                    onChange={(e) => setNewQAnswer(e.target.value)}
                    placeholder="مثال: أشرف حكيمي"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black mb-1">
                    إجابات بديلة مقبولة (افصل بفاصلة ،)
                  </label>
                  <input
                    type="text"
                    value={newQSynonyms}
                    onChange={(e) => setNewQSynonyms(e.target.value)}
                    placeholder="مثال: حكيمي، Hakimi، اشرف حكيمي"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black mb-1">
                    تلميح (اختياري)
                  </label>
                  <input
                    type="text"
                    value={newQHint}
                    onChange={(e) => setNewQHint(e.target.value)}
                    placeholder="تلميح يساعد اللاعبين عند الحاجة..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black mb-1">
                    معلومة إثرائية بعد الإجابة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={newQFunFact}
                    onChange={(e) => setNewQFunFact(e.target.value)}
                    placeholder="تظهر على الشاشة بعد كشف الجواب..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-black">
                    🖼️ صورة السؤال (اختياري — إضافة أسئلة بصورك الخاصة):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={newQImageUrl}
                      onChange={(e) => setNewQImageUrl(e.target.value)}
                      placeholder="https://... أو ارفع صورة مباشرة من جهازك"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-mono text-xs"
                    />
                    <label className="cursor-pointer px-3.5 py-2.5 rounded-xl bg-sunny hover:bg-yellow-400 border-2 border-black font-black text-xs shadow-brutal-sm flex items-center gap-1.5 shrink-0 transition">
                      <Camera className="w-3.5 h-3.5" />
                      <span>رفع صورة 📸</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadPhotoForQuestion(e, "NEW_QUESTION")}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("BROWSE_EDIT")}
                  className="px-5 py-2.5 rounded-xl bg-white border-2 border-black font-black text-xs"
                >
                  رجوع للقائمة
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-mint text-black border-2 border-black shadow-brutal font-black text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ السؤال في الفئة</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === "ADD_QUESTION" && selectedMode !== "BOARD" && (
            <form
              onSubmit={handleAddMiniGameItem}
              className="bg-white border-3 border-black rounded-3xl p-5 shadow-brutal space-y-4"
            >
              <h3 className="text-lg font-black">
                + إضافة سؤال جديد لتحدي:{" "}
                {MINI_GAMES_META.find((m) => m.id === selectedMode)?.title}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-black mb-1">
                    {selectedMode === "PRICE_GUESS"
                      ? "اسم المنتج *"
                      : selectedMode === "DRAWING_CHALLENGE"
                      ? "الكلمة السرية للرسم *"
                      : "نص السؤال *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={mgQuestionText}
                    onChange={(e) => setMgQuestionText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>

                {selectedMode === "SPEED_TRIVIA" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "الخيار الأول", val: mgOption1, set: setMgOption1, idx: 0 },
                      { label: "الخيار الثاني", val: mgOption2, set: setMgOption2, idx: 1 },
                      { label: "الخيار الثالث", val: mgOption3, set: setMgOption3, idx: 2 },
                      { label: "الخيار الرابع", val: mgOption4, set: setMgOption4, idx: 3 },
                    ].map((o) => (
                      <div key={o.idx} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black">{o.label}</label>
                          <label className="text-[11px] font-black flex items-center gap-1 cursor-pointer">
                            <input
                              type="radio"
                              name="correctOpt"
                              checked={mgCorrectIdx === o.idx}
                              onChange={() => setMgCorrectIdx(o.idx)}
                            />
                            <span>الجواب الصحيح</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          value={o.val}
                          onChange={(e) => o.set(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {(selectedMode === "PRICE_GUESS" ||
                  selectedMode === "CLOSEST_NUMBER") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black mb-1">
                        {selectedMode === "PRICE_GUESS"
                          ? `السعر الصحيح (${
                              selectedEdition === "MA" ? "DH" : "$"
                            })`
                          : "الرقم الصحيح"}
                      </label>
                      <input
                        type="number"
                        required
                        value={mgPriceValue}
                        onChange={(e) => setMgPriceValue(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-black bg-cream font-mono font-black text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black mb-1">
                        {selectedMode === "PRICE_GUESS"
                          ? "الماركة / المواصفات"
                          : "الوحدة (مثال: متر، سنة، كم)"}
                      </label>
                      <input
                        type="text"
                        value={
                          selectedMode === "PRICE_GUESS"
                            ? mgAnswerText
                            : mgUnitLabel
                        }
                        onChange={(e) =>
                          selectedMode === "PRICE_GUESS"
                            ? setMgAnswerText(e.target.value)
                            : setMgUnitLabel(e.target.value)
                        }
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                      />
                    </div>
                  </div>
                )}

                {selectedMode !== "SPEED_TRIVIA" &&
                  selectedMode !== "PRICE_GUESS" &&
                  selectedMode !== "CLOSEST_NUMBER" && (
                    <div>
                      <label className="block text-xs font-black mb-1">
                        الإجابات المقبولة (افصل بفاصلة ،)
                      </label>
                      <input
                        type="text"
                        required
                        value={mgAnswerText}
                        onChange={(e) => setMgAnswerText(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                      />
                    </div>
                  )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-mint text-black border-2 border-black shadow-brutal font-black text-xs"
                >
                  حفظ في التحدي
                </button>
              </div>
            </form>
          )}

          {/* ================================================================
              TAB 3: CREATE BRAND-NEW CUSTOM CATEGORY
          ================================================================ */}
          {activeTab === "NEW_CATEGORY" && (
            <form
              onSubmit={handleCreateFullCategory}
              className="bg-white border-3 border-black rounded-3xl p-5 shadow-brutal space-y-4"
            >
              <div className="flex items-center gap-2 border-b-2 border-black/10 pb-3">
                <Sparkles className="w-5 h-5 text-royal" />
                <div>
                  <h3 className="text-lg font-black">
                    إنشاء فئة مخصصة جديدة بالكامل (٦ أسئلة أساسية)
                  </h3>
                  <p className="text-xs font-bold text-gray-600">
                    يمكنك بعد إنشائها إضافة المزيد من الأسئلة إليها في أي وقت
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black mb-1">
                    اسم الفئة الجديدة
                  </label>
                  <input
                    type="text"
                    required
                    value={catTitle}
                    onChange={(e) => setCatTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1">
                    وصف الفئة
                  </label>
                  <input
                    type="text"
                    value={catSubtitle}
                    onChange={(e) => setCatSubtitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-black bg-cream font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black mb-1">
                    لون الفئة وأيقونتها
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      "#F4D03F",
                      "#3B66B4",
                      "#DE7A7A",
                      "#2ECC71",
                      "#E65C2E",
                    ].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCatColor(c)}
                        className={`w-6 h-6 rounded-full border-2 border-black ${
                          catColor === c ? "scale-110 ring-2 ring-black" : ""
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <select
                      value={catIcon}
                      onChange={(e) => setCatIcon(e.target.value)}
                      className="px-2 py-1 rounded-lg border-2 border-black bg-cream text-xs font-black"
                    >
                      <option value="Trophy">Trophy 🏆</option>
                      <option value="Landmark">Landmark 🏛️</option>
                      <option value="Puzzle">Puzzle 🧩</option>
                      <option value="Clapperboard">Clapperboard 🎬</option>
                      <option value="Atom">Atom ⚛️</option>
                      <option value="ScrollText">ScrollText 📜</option>
                      <option value="Globe2">Globe 🌍</option>
                      <option value="Cpu">Cpu 💻</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: "٢٠٠ نقطة (١)", q: catQ200A, setQ: setCatQ200A, a: catA200A, setA: setCatA200A },
                  { label: "٢٠٠ نقطة (٢)", q: catQ200B, setQ: setCatQ200B, a: catA200B, setA: setCatA200B },
                  { label: "٤٠٠ نقطة (١)", q: catQ400A, setQ: setCatQ400A, a: catA400A, setA: setCatA400A },
                  { label: "٤٠٠ نقطة (٢)", q: catQ400B, setQ: setCatQ400B, a: catA400B, setA: setCatA400B },
                  { label: "٦٠٠ نقطة (١)", q: catQ600A, setQ: setCatQ600A, a: catA600A, setA: setCatA600A },
                  { label: "٦٠٠ نقطة (٢)", q: catQ600B, setQ: setCatQ600B, a: catA600B, setA: setCatA600B },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-cream border-2 border-black rounded-2xl p-3 grid grid-cols-1 md:grid-cols-3 gap-2.5"
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
                        className="w-full px-3 py-1.5 rounded-lg border-2 border-black bg-white font-bold text-xs"
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
                        className="w-full px-3 py-1.5 rounded-lg border-2 border-black bg-white font-bold text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("BROWSE_EDIT")}
                  className="px-5 py-2.5 rounded-xl bg-white border-2 border-black font-black text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-mint text-black border-2 border-black shadow-brutal font-black text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>حفظ الفئة في استوديو قَدْهَا؟</span>
                </button>
              </div>
            </form>
          )}

          {/* ================================================================
              TAB 4: 5-SECOND AI CATEGORY GENERATOR (PRO EXCLUSIVE)
          ================================================================ */}
          {activeTab === "AI_GENERATOR" && (
            <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-brutal space-y-5">
              <div className="flex items-center gap-3 border-b-2 border-black/10 pb-3">
                <div className="w-10 h-10 rounded-2xl bg-black text-sunny flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">
                    مولّد الفئات الذكي في 5 ثوانٍ — بالذكاء الاصطناعي ⚡
                  </h3>
                  <p className="text-xs font-bold text-gray-600">
                    أدخل أي موضوع وسيقوم الذكاء الاصطناعي بتوليد 6 أسئلة فورية مع الإجابات والبدائل والتلميحات وحفظها تلقائياً!
                  </p>
                </div>
              </div>

              {/* Quick suggestion chips */}
              <div className="space-y-2">
                <label className="block text-xs font-black">اقتراحات مواضيع شائعة:</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    "كرة القدم والمنتخب المغربي 🇲🇦",
                    "أنمي ون بيس وناروتو ⚔️",
                    "أفلام هوليوود والسينما 🎬",
                    "أغاني الراب والبوب 🎵",
                    "أكلات وطبخات شعبية 🍲",
                    "تاريخ الأندلس والمغرب 🏰",
                    "ألعاب الفيديو والگيمنغ 🎮",
                    "مسلسلات رمضان الشهيرة 📺",
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      disabled={isGeneratingAi}
                      onClick={() => {
                        setAiTopicInput(sug);
                        handleStudioGenerateAiCategory(sug);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cream hover:bg-sunny border-2 border-black text-xs font-black transition"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black">
                  اكتب الموضوع المخصص الذي تريده:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={aiTopicInput}
                    onChange={(e) => setAiTopicInput(e.target.value)}
                    placeholder="مثال: غرائب التاريخ، مارفل، سيارات وسرعة..."
                    disabled={isGeneratingAi}
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-black bg-cream font-black text-sm placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    disabled={isGeneratingAi || !aiTopicInput.trim()}
                    onClick={() => handleStudioGenerateAiCategory()}
                    className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-sunny font-black text-xs border-2 border-black shadow-brutal-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
                  >
                    {isGeneratingAi ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التوليد (5 ثوانٍ)...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-sunny" />
                        <span>توليد الفئة الآن ⚡</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {aiStatusMsg && (
                <div
                  className={`p-4 rounded-2xl border-2 border-black text-xs font-black flex items-center justify-between gap-2 ${
                    aiStatusMsg.ok ? "bg-mint text-black" : "bg-coral text-black"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {aiStatusMsg.ok ? (
                      <Check className="w-4 h-4 shrink-0" />
                    ) : (
                      <span>⚠️</span>
                    )}
                    <span>{aiStatusMsg.text}</span>
                  </div>
                  {aiStatusMsg.ok && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("BROWSE_EDIT")}
                      className="px-3 py-1 rounded-xl bg-black text-white text-[11px] font-black"
                    >
                      معاينة وتعديل الأسئلة المولّدة ←
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
