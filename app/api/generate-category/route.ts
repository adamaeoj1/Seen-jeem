import { NextRequest, NextResponse } from "next/server";
import { SeenJeemCategory, SeenJeemQuestion } from "@/data/seedQuestions";

interface GenerateCategoryRequest {
  topic?: string;
  edition?: "MA" | "MENA" | "EN";
}

const CATEGORY_COLORS = [
  "#F4D03F", // Sunny Yellow
  "#3B66B4", // Royal Blue
  "#E65C2E", // Burnt Orange
  "#10B981", // Emerald Green
  "#8B5CF6", // Purple
  "#DE7A7A", // Coral
];

const CATEGORY_ICONS = [
  "Sparkles",
  "Brain",
  "Flame",
  "Trophy",
  "Zap",
  "Gamepad2",
  "Landmark",
  "Globe2",
];

function buildOfflineFallbackCategory(
  topic: string,
  edition: "MA" | "MENA" | "EN" = "MA"
): SeenJeemCategory {
  const catId = `cat-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const cleanTopic = topic.trim() || (edition === "EN" ? "General Trivia" : "تحديات وذكاء");
  const isEn = edition === "EN";

  const color =
    CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)];
  const icon =
    CATEGORY_ICONS[Math.floor(Math.random() * CATEGORY_ICONS.length)];

  const questions: SeenJeemQuestion[] = isEn
    ? [
        {
          id: `${catId}-q1`,
          categoryId: catId,
          points: 200,
          slotIndex: 0,
          question: `What is the most iconic element associated with "${cleanTopic}"?`,
          displayAnswer: cleanTopic,
          acceptedAnswers: [cleanTopic.toLowerCase()],
          acceptedSynonyms: ["classic", "first", "original"],
          hint: `Think about the origins of ${cleanTopic}`,
          funFact: `${cleanTopic} remains one of the most talked-about topics among fans worldwide!`,
        },
        {
          id: `${catId}-q2`,
          categoryId: catId,
          points: 200,
          slotIndex: 1,
          question: `In what context is "${cleanTopic}" most frequently celebrated or practiced?`,
          displayAnswer: "Entertainment",
          acceptedAnswers: ["entertainment", "culture", "art", "social"],
          acceptedSynonyms: ["fun", "game", "show"],
          hint: "Think about casual gatherings and fun",
          funFact: `Popular culture often highlights this as a hallmark of shared community moments.`,
        },
        {
          id: `${catId}-q3`,
          categoryId: catId,
          points: 400,
          slotIndex: 2,
          question: `Which major milestone or record is famously linked to "${cleanTopic}"?`,
          displayAnswer: "The Gold Standard",
          acceptedAnswers: ["gold standard", "championship", "record", "milestone"],
          acceptedSynonyms: ["first place", "legendary"],
          hint: "A symbol of supreme excellence in this domain",
          funFact: `Historians often cite this milestone as a pivotal turning point in modern trivia.`,
        },
        {
          id: `${catId}-q4`,
          categoryId: catId,
          points: 400,
          slotIndex: 3,
          question: `Which country or region played the biggest historical role in spreading "${cleanTopic}"?`,
          displayAnswer: "Global",
          acceptedAnswers: ["global", "world", "international", "mediterranean"],
          acceptedSynonyms: ["worldwide", "universal"],
          hint: "Adopted by audiences across borders",
          funFact: `The widespread adaptation happened largely through international cultural exchange.`,
        },
        {
          id: `${catId}-q5`,
          categoryId: catId,
          points: 600,
          slotIndex: 4,
          question: `What tricky nuance or hidden rule makes "${cleanTopic}" so challenging to master?`,
          displayAnswer: "Precision",
          acceptedAnswers: ["precision", "timing", "strategy", "details"],
          acceptedSynonyms: ["accuracy", "focus"],
          hint: "Requires razor-sharp attention to the smallest details",
          funFact: `Only true aficionados master the fine line between good and extraordinary here!`,
        },
        {
          id: `${catId}-q6`,
          categoryId: catId,
          points: 600,
          slotIndex: 5,
          question: `What legendary title or nickname is awarded to someone who conquers "${cleanTopic}"?`,
          displayAnswer: "The Master",
          acceptedAnswers: ["the master", "champion", "legend", "goat"],
          acceptedSynonyms: ["boss", "king"],
          hint: "Only the grand champions earn this moniker",
          funFact: `Crowns are earned, not given — and this title proves ultimate dominance!`,
        },
      ]
    : [
        {
          id: `${catId}-q1`,
          categoryId: catId,
          points: 200,
          slotIndex: 0,
          question: `ما هو الشيء الأكثر شهرة وارتباطاً بـ «${cleanTopic}» عند الجمهور؟`,
          displayAnswer: cleanTopic,
          acceptedAnswers: [cleanTopic, cleanTopic.replace(/^ال/, "")],
          acceptedSynonyms: ["الأصل", "البداية", "الأول"],
          hint: `فكر في أساس وبدايات ${cleanTopic}`,
          funFact: `تعتبر هذه النقطة هي أول ما يتبادر لذهن أي عاشق أو متابع لـ ${cleanTopic}!`,
        },
        {
          id: `${catId}-q2`,
          categoryId: catId,
          points: 200,
          slotIndex: 1,
          question: `في أي مناسبة أو وقت يتم استحضار «${cleanTopic}» بكثرة في السهرات والجمعات؟`,
          displayAnswer: "وقت الحماس والضحك",
          acceptedAnswers: ["الحماس", "الضحك", "السهرة", "الگلسة", "الجمعة"],
          acceptedSynonyms: ["التحدي", "القصارة", "الترفيه"],
          hint: "وقت التجمع مع الأصدقاء والعائلة",
          funFact: `تضفي هذه اللحظات طاقة استثنائية على كل جلسة أصدقاء.`,
        },
        {
          id: `${catId}-q3`,
          categoryId: catId,
          points: 400,
          slotIndex: 2,
          question: `ما هو الرقم القياسي أو الإنجاز الأكبر المسجل تاريخياً في «${cleanTopic}»؟`,
          displayAnswer: "الرقم الذهبي",
          acceptedAnswers: ["الرقم الذهبي", "البطولة", "اللقب", "الإنجاز"],
          acceptedSynonyms: ["الكأس", "الميدالية", "المركز الأول"],
          hint: "يرمز للقمة والتميز في هذا المجال",
          funFact: `سجل هذا الإنجاز كعلامة فارقة ألهمت كل من جاء بعده.`,
        },
        {
          id: `${catId}-q4`,
          categoryId: catId,
          points: 400,
          slotIndex: 3,
          question: `ما هو المكان أو المدينة الأكثر ارتباطاً وتأثيراً في مسار «${cleanTopic}»؟`,
          displayAnswer: edition === "MA" ? "الدار البيضاء" : "العاصمة",
          acceptedAnswers: [
            edition === "MA" ? "الدار البيضاء" : "الرياض",
            "مراكش",
            "القاهرة",
            "الرباط",
            "دبي",
          ],
          acceptedSynonyms: ["المدينة الكبرى", "المركز"],
          hint: "مركز الإشعاع والفعاليات الكبرى",
          funFact: `شهدت هذه المدينة انطلاقة أهم الأحداث التاريخية المرتبطة بالمجال.`,
        },
        {
          id: `${catId}-q5`,
          categoryId: catId,
          points: 600,
          slotIndex: 4,
          question: `ما هي أصعب حيلة أو تفصيلة خفية لا يتقنها في «${cleanTopic}» إلا المحترفون؟`,
          displayAnswer: "الدقة وسرعة البديهة",
          acceptedAnswers: ["الدقة", "السرعة", "التركيز", "الذكاء"],
          acceptedSynonyms: ["سرعة البديهة", "الاستراتيجية"],
          hint: "تعتمد على التركيز العالي في الأجزاء من الثانية",
          funFact: `هذه المهارة تفصل بين الهاوي المبتدئ والأسطورة المتمرس!`,
        },
        {
          id: `${catId}-q6`,
          categoryId: catId,
          points: 600,
          slotIndex: 5,
          question: `ما هو اللقب الفخري أو الشعبي الذي يُطلق على بطل «${cleanTopic}»؟`,
          displayAnswer: "الحريف الأسطورة",
          acceptedAnswers: ["الحريف", "الأسطورة", "المعلم", "القائد", "الزعيم"],
          acceptedSynonyms: ["بطل الأبطال", "المايسترو"],
          hint: "لقب يتردد في الجلسات لكل من يكتسح الجميع",
          funFact: `لا ينال هذا اللقب إلا من أثبت أنه قَدْهَا وجدير به في الساحة!`,
        },
      ];

  return {
    id: catId,
    title: cleanTopic,
    subtitle: isEn
      ? `AI Generated 6-Question Deck for ${cleanTopic}`
      : `فئة ذكية مولّدة بالذكاء الاصطناعي حول ${cleanTopic}`,
    icon,
    color,
    edition,
    questions,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as GenerateCategoryRequest;
    const topic = (body.topic || "").trim();
    const edition = body.edition || "MA";

    if (!topic) {
      return NextResponse.json(
        { ok: false, error: "Topic is required" },
        { status: 200 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful offline fallback
      const fallbackCat = buildOfflineFallbackCategory(topic, edition);
      return NextResponse.json(
        { ok: true, category: fallbackCat, source: "offline_fallback" },
        { status: 200 }
      );
    }

    const languagePrompt =
      edition === "EN"
        ? "Language: English. High-energy party game trivia style."
        : edition === "MA"
        ? "Language: Moroccan Arabic (Darija / Arabic). Moroccan gathering vibe (الگلسة والقصارة)."
        : "Language: Modern Arabic. Engaging Gulf/MENA party game show vibe.";

    const systemPrompt = `You are the lead trivia game designer for "قَدْهَا؟" (QADHA), an ultra-entertaining party game show.
Your job is to generate a complete custom category about "${topic}" consisting of exactly 6 questions with progressive point values:
- Question 1 (slot 0): 200 points (accessible, popular knowledge)
- Question 2 (slot 1): 200 points (accessible, popular knowledge)
- Question 3 (slot 2): 400 points (medium difficulty, requires specific recall)
- Question 4 (slot 3): 400 points (medium difficulty, requires specific recall)
- Question 5 (slot 4): 600 points (hard / expert question)
- Question 6 (slot 5): 600 points (hard / expert question, exciting punchline)

${languagePrompt}

CRITICAL RULES:
1. Return ONLY a single raw valid JSON object (no markdown fences, no triple backticks).
2. The JSON schema must strictly match:
{
  "title": "Short punchy category title (2-4 words)",
  "subtitle": "Exciting description subtitle (4-8 words)",
  "icon": "One of: Sparkles, Brain, Flame, Trophy, Zap, Gamepad2, Landmark, Globe2",
  "color": "Hex color string (e.g. #F4D03F, #3B66B4, #E65C2E, #10B981, #8B5CF6)",
  "questions": [
    {
      "points": 200,
      "question": "Question text...",
      "displayAnswer": "The clean canonical display answer",
      "acceptedAnswers": ["main answer", "variant"],
      "acceptedSynonyms": ["alternative 1", "synonym 2"],
      "hint": "Helpful hint without spoiling",
      "funFact": "Fascinating quick fun fact"
    }
  ]
}
Each question array must contain exactly 6 items (two 200, two 400, two 600).`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      console.warn("Gemini API call failed, using intelligent fallback");
      const fallbackCat = buildOfflineFallbackCategory(topic, edition);
      return NextResponse.json(
        { ok: true, category: fallbackCat, source: "offline_fallback" },
        { status: 200 }
      );
    }

    const geminiData = await response.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      console.warn("Failed to parse Gemini JSON output, using fallback");
      const fallbackCat = buildOfflineFallbackCategory(topic, edition);
      return NextResponse.json(
        { ok: true, category: fallbackCat, source: "offline_fallback" },
        { status: 200 }
      );
    }

    const catId = `cat-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const pointsList: (200 | 400 | 600)[] = [200, 200, 400, 400, 600, 600];

    const questions: SeenJeemQuestion[] = (parsed.questions || []).slice(0, 6).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (q: any, idx: number) => {
        const pts = pointsList[idx] || 200;
        const mainAnswer = String(q.displayAnswer || q.answer || topic);
        const accepted = Array.isArray(q.acceptedAnswers)
          ? q.acceptedAnswers.map((a: unknown) => String(a))
          : [mainAnswer];
        const synonyms = Array.isArray(q.acceptedSynonyms)
          ? q.acceptedSynonyms.map((s: unknown) => String(s))
          : [];

        return {
          id: `${catId}-q${idx + 1}`,
          categoryId: catId,
          points: pts,
          slotIndex: idx,
          question: String(q.question || `سؤال عن ${topic}`),
          displayAnswer: mainAnswer,
          acceptedAnswers: accepted.length > 0 ? accepted : [mainAnswer],
          acceptedSynonyms: synonyms,
          hint: q.hint ? String(q.hint) : `تلميح حول ${topic}`,
          funFact: q.funFact
            ? String(q.funFact)
            : `معلومة مشوقة عن ${topic}!`,
        };
      }
    );

    // Pad if fewer than 6 questions returned
    if (questions.length < 6) {
      const fallback = buildOfflineFallbackCategory(topic, edition);
      for (let i = questions.length; i < 6; i++) {
        questions.push({
          ...fallback.questions[i],
          id: `${catId}-q${i + 1}`,
          categoryId: catId,
        });
      }
    }

    const finalCategory: SeenJeemCategory = {
      id: catId,
      title: String(parsed.title || topic).slice(0, 30),
      subtitle: String(
        parsed.subtitle || `فئة ذكية مولّدة بالذكاء الاصطناعي حول ${topic}`
      ).slice(0, 60),
      icon: String(parsed.icon || "Sparkles"),
      color: String(parsed.color || "#F4D03F"),
      edition,
      questions,
    };

    return NextResponse.json(
      { ok: true, category: finalCategory, source: "gemini_live" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Error";
    console.error("AI Category Generation Error:", msg);
    const fallbackCat = buildOfflineFallbackCategory("تحديات ذكية", "MA");
    return NextResponse.json(
      { ok: true, category: fallbackCat, source: "offline_fallback" },
      { status: 200 }
    );
  }
}
