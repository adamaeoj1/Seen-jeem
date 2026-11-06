import { SceneTag } from "@/lib/arabicReferee";

export interface SeenJeemQuestion {
  id: string;
  categoryId: string;
  points: 200 | 400 | 600;
  slotIndex: number; // 0..5 (0,1 = 200pt; 2,3 = 400pt; 4,5 = 600pt)
  question: string;
  hint?: string;
  displayAnswer: string;
  acceptedAnswers: string[];
  rejectedTraps?: string[];
  funFact: string;
}

export interface SeenJeemCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  thumbnailUrl?: string;
  questions: SeenJeemQuestion[];
}

export type MiniGameId =
  | "SPEED_TRIVIA"
  | "QUICK_REFLEX"
  | "PRICE_GUESS"
  | "WHATS_IN_FRAME"
  | "CLOSEST_NUMBER"
  | "DRAWING_CHALLENGE"
  | "MAP_PIN"
  | "SCENE_DESCRIPTION";

export interface MiniGameMeta {
  id: MiniGameId;
  number: number;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  icon: string;
  defaultDurationSec: number;
  howToPlay: string;
}

export interface SpeedTriviaRound {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export type ReflexShape = "square" | "circle" | "triangle" | "star" | "hexagon" | "diamond";
export type ReflexColor = "blue" | "red" | "yellow" | "green" | "orange" | "purple";

export interface ReflexCell {
  id: string;
  shape: ReflexShape;
  color: ReflexColor;
  labelAr: string;
}

export interface QuickReflexRound {
  id: string;
  promptAr: string;
  subWarningAr: string;
  targetCellId: string;
  grid: ReflexCell[]; // 6 cells
}

export interface PriceGuessRound {
  id: string;
  productName: string;
  brand: string;
  specs: string;
  actualPriceSar: number;
  currencyLabel: string;
  illustrationType: "vision_pro" | "ps5_pro" | "dyson" | "espresso" | "watch" | "smart_glasses";
  funFact: string;
}

export interface WhatsInFrameRound {
  id: string;
  prompt: string;
  clue: string;
  sceneArtworkId:
    | "constantinople"
    | "mount_fuji"
    | "petra"
    | "titanic"
    | "taj_mahal"
    | "pyramids";
  displayAnswer: string;
  acceptedAnswers: string[];
  rejectedTraps: string[];
  funFact: string;
}

export interface ClosestNumberRound {
  id: string;
  question: string;
  unitLabel: string;
  correctNumber: number;
  hintRange: string;
  funFact: string;
}

export interface DrawingChallengeRound {
  id: string;
  secretWord: string;
  categoryHint: string;
  acceptedAnswers: string[];
  difficultyPoints: number;
}

export interface MapPinRound {
  id: string;
  prompt: string;
  placeName: string;
  regionHint: string;
  targetLat: number;
  targetLng: number;
  funFact: string;
}

export interface SceneDescriptionRound {
  id: string;
  title: string;
  prompt: string;
  sceneArtworkId:
    | "moon_coffee"
    | "desert_camp"
    | "pizza_chef"
    | "deep_sea_treasure"
    | "cyber_camel";
  tags: SceneTag[];
  modelDescription: string;
}

export const MINI_GAMES_META: MiniGameMeta[] = [
  {
    id: "SPEED_TRIVIA",
    number: 1,
    title: "أسئلة السرعة",
    subtitle: "٤ خيارات على الجوال.. الأسرع يحصد نقاطاً مضاعفة!",
    badge: "سرعة البرق ⚡",
    color: "#F4D03F",
    icon: "Zap",
    defaultDurationSec: 20,
    howToPlay: "تظهر ٤ خيارات على شاشة جوالك. كلما ضغطت الإجابة الصحيحة بجزء من الثانية أسرع، زادت نقاطك من ٢٠٠ حتى ٥٠٠ نقطة!",
  },
  {
    id: "QUICK_REFLEX",
    number: 2,
    title: "سرعة بديهة",
    subtitle: "طابق اللون والشكل المطلوب في أجزاء من الثانية دون الوقوع في الفخ!",
    badge: "تركيز بصري 🎯",
    color: "#DE7A7A",
    icon: "Sparkles",
    defaultDurationSec: 15,
    howToPlay: "اقرأ المطلوب بدقة (مثلاً: أزرق + مربع) واضغط على الشكل الصحيح من بين ٦ أشكال ملونة على جوالك بأقصى سرعة!",
  },
  {
    id: "PRICE_GUESS",
    number: 3,
    title: "كم السعر؟",
    subtitle: "خمّن السعر الحقيقي للمنتج المعروض.. الأقرب للسعر الفعلي يفوز!",
    badge: "خبير تسعير 💰",
    color: "#2ECC71",
    icon: "Tag",
    defaultDurationSec: 30,
    howToPlay: "شاهد تفاصيل المنتج المعروض على الشاشة الرئيسية، ثم اكتب تخمينك للسعر بالريال السعودي على جوالك.",
  },
  {
    id: "WHATS_IN_FRAME",
    number: 4,
    title: "وش في اللقطة؟",
    subtitle: "مَعلم تاريخي أو مشهد شهير على الشاشة.. اكتب اسمه والحكم الذكي يصحح!",
    badge: "قوة ملاحظة 🖼️",
    color: "#3B66B4",
    icon: "Eye",
    defaultDurationSec: 35,
    howToPlay: "ركّز في اللقطة المرسومة على شاشة المضيف واكتب اسم المعلم أو الفيلم أو المدينة في جوالك.",
  },
  {
    id: "CLOSEST_NUMBER",
    number: 5,
    title: "قرّب من الرقم",
    subtitle: "أسئلة رقمية تحبس الأنفاس.. صاحب الفرق الأقل عن الرقم الصحيح يكسب!",
    badge: "دقة رقمية 🔢",
    color: "#E65C2E",
    icon: "Hash",
    defaultDurationSec: 30,
    howToPlay: "لا يشترط أن تعرف الرقم بالضبط! اكتب أقرب رقم تتوقعه، وسيقوم النظام بحساب الفرق الدقيق لكل لاعب.",
  },
  {
    id: "DRAWING_CHALLENGE",
    number: 6,
    title: "تحدّي الرسم",
    subtitle: "رسّام يرسم على جواله مباشرة والبقية يخمنون الكلمة السرية!",
    badge: "إبداع مباشر 🎨",
    color: "#F4D03F",
    icon: "Palette",
    defaultDurationSec: 60,
    howToPlay: "يظهر للرسام وصف سري ليرسمه على لوحة جواله، وتنتقل الرسمة حياً للشاشة الرئيسية بينما يكتب البقية تخمينهم!",
  },
  {
    id: "MAP_PIN",
    number: 7,
    title: "ثبت الدبوس",
    subtitle: "خريطة تفاعلية على جوالك.. ضع الدبوس في الموقع الجغرافي الأقرب!",
    badge: "جغرافيا وحساب مسافات 📍",
    color: "#3B66B4",
    icon: "MapPin",
    defaultDurationSec: 35,
    howToPlay: "المس الخريطة على جوالك لتحديد موقع الدولة أو المعلم المطلوب ثم اضغط «ثبت الدبوس». نحسب المسافة بالكيلومتر بمعادلة Haversine!",
  },
  {
    id: "SCENE_DESCRIPTION",
    number: 8,
    title: "أدق وصف",
    subtitle: "صف تفاصيل المشهد الذي تراه.. كل عنصر تلتقطه يمنحك نقاطاً إضافية!",
    badge: "تحليل المشهد 🔍",
    color: "#DE7A7A",
    icon: "FileText",
    defaultDurationSec: 45,
    howToPlay: "انظر للصورة المليئة بالتفاصيل واكتب جملة تصف كل ما بداخلها (صف اللي داخل الصورة، مو من وين هي!).",
  },
];

export const SEEN_JEEM_CATEGORIES: SeenJeemCategory[] = [
  {
    id: "history",
    title: "تاريخ وحضارات",
    subtitle: "إمبراطوريات، معارك، وعواصم تاريخية",
    icon: "Landmark",
    color: "#F4D03F",
    questions: [
      {
        id: "hist-200-1",
        categoryId: "history",
        points: 200,
        slotIndex: 0,
        question: "ما هو الاسم التاريخي القديم لمدينة إسطنبول قبل الفتح العثماني عام ١٤٥٣م؟",
        hint: "أسسها الإمبراطور الروماني قسطنطين الأول",
        displayAnswer: "القسطنطينية (بيزنطة / قسطنطينة)",
        acceptedAnswers: ["القسطنطينية", "قسطنطينة", "قسطنطينيه", "بيزنطة", "بيزنطه", "اسلامبول", "روما الجديدة"],
        rejectedTraps: ["إسطنبول", "أنقرة", "أثينا"],
        funFact: "سميت القسطنطينية نسبةً للإمبراطور قسطنطين العظيم سنة ٣٣٠م وظلت عاصمة الإمبراطورية البيزنطية لأكثر من ألف عام.",
      },
      {
        id: "hist-200-2",
        categoryId: "history",
        points: 200,
        slotIndex: 1,
        question: "من هو الصحابي الجليل الملقب بـ «سيف الله المسلول»؟",
        hint: "قاد معركة اليرموك الشهيرة",
        displayAnswer: "خالد بن الوليد",
        acceptedAnswers: ["خالد بن الوليد", "خالد ابن الوليد", "خالد الوليد", "ابو سليمان"],
        rejectedTraps: ["عمرو بن العاص", "سعد بن أبي وقاص"],
        funFact: "لم يُهزم خالد بن الوليد رضي الله عنه في أكثر من مئة معركة خاضها في الجاهلية والإسلام.",
      },
      {
        id: "hist-400-1",
        categoryId: "history",
        points: 400,
        slotIndex: 2,
        question: "ما اسم المدينة الأثرية الوردية المنحوتة في الصخر جنوب الأردن والتي كانت عاصمة للأنباط؟",
        hint: "إحدى عجائب الدنيا السبع الجديدة",
        displayAnswer: "البتراء (سلع)",
        acceptedAnswers: ["البتراء", "بتراء", "البترا", "سلع", "الرقيم"],
        rejectedTraps: ["جرش", "مدائن صالح", "تدمر"],
        funFact: "أسس الأنباط العرب مدينة البتراء في القرن الرابع قبل الميلاد واشتهرت بنظام هندسة المياه الفريد في الصحراء.",
      },
      {
        id: "hist-400-2",
        categoryId: "history",
        points: 400,
        slotIndex: 3,
        question: "في أي دولة عربية تقع مدينة «قرطاج» الأثرية الفينيقية؟",
        hint: "موطن القائد العسكري الشهير حنبعل",
        displayAnswer: "تونس",
        acceptedAnswers: ["تونس", "الجمهورية التونسية"],
        rejectedTraps: ["لبنان", "الجزائر", "المغرب", "ليبيا"],
        funFact: "أسست الملكة عليّسة (ديدون) مدينة قرطاج عام ٨١٤ ق.م على ساحل تونس وأصبحت قوة بحرية عظمى في البحر المتوسط.",
      },
      {
        id: "hist-600-1",
        categoryId: "history",
        points: 600,
        slotIndex: 4,
        question: "ما اسم المعركة الفاصلة التي وقعت عام ١٢٦٠م بقيادة المظفر قطز وأوقفت زحف المغول في بلاد الشام؟",
        hint: "وقعت بالقرب من مدينة بيسان في فلسطين",
        displayAnswer: "عين جالوت",
        acceptedAnswers: ["عين جالوت", "معركة عين جالوت", "موقعة عين جالوت"],
        rejectedTraps: ["حطين", "القادسية", "ملاذكرد", "اليرموك"],
        funFact: "كانت معركة عين جالوت أول مرة يُهزم فيها جيش المغول هزيمة حاسمة في معركة مفتوحة منذ عهد جنكيز خان.",
      },
      {
        id: "hist-600-2",
        categoryId: "history",
        points: 600,
        slotIndex: 5,
        question: "من هو العالم المسلم مؤسس علم الجبر وصاحب كتاب «المختصر في حساب الجبر والمقابلة»؟",
        hint: "تُنسب إليه كلمة Algorithm (الخوارزميات)",
        displayAnswer: "الخوارزمي (محمد بن موسى الخوارزمي)",
        acceptedAnswers: ["الخوارزمي", "محمد بن موسى الخوارزمي", "محمد الخوارزمي"],
        rejectedTraps: ["ابن سينا", "ابن الهيثم", "البيروني", "جابر بن حيان"],
        funFact: "عاش الخوارزمي في بغداد في عصر بيت الحكمة، وأدخل الصفر والأرقام الهندية العربية إلى الرياضيات العالمية.",
      },
    ],
  },
  {
    id: "cities",
    title: "عواصم ومدن",
    subtitle: "جولة حول أشهر مدن وعواصم العالم",
    icon: "Globe",
    color: "#3B66B4",
    questions: [
      {
        id: "city-200-1",
        categoryId: "cities",
        points: 200,
        slotIndex: 0,
        question: "ما هي العاصمة الرسمية لدولة اليابان؟",
        hint: "أكبر تجمع حضري في العالم",
        displayAnswer: "طوكيو",
        acceptedAnswers: ["طوكيو", "توكيو", "طوكيوا"],
        rejectedTraps: ["كيوتو", "أوساكا", "سيول", "بكين"],
        funFact: "كانت طوكيو تُعرف قديماً باسم «إيدو» قبل أن تصبح العاصمة الإمبراطورية عام ١٨٦٨م.",
      },
      {
        id: "city-200-2",
        categoryId: "cities",
        points: 200,
        slotIndex: 1,
        question: "ما هي المدينة المغربية التي تُلقب بـ «المدينة الحمراء» بسبب لون أسوارها ومبانيها؟",
        hint: "تشتهر بساحة جامع الفنا",
        displayAnswer: "مراكش",
        acceptedAnswers: ["مراكش", "مدينة مراكش"],
        rejectedTraps: ["الدار البيضاء", "كازابلانكا", "فاس", "الرباط", "طنجة"],
        funFact: "بُنيت أسوار مراكش من الطين الأحمر والحجر الرملي في عهد المرابطين في القرن الحادي عشر الميلادي.",
      },
      {
        id: "city-400-1",
        categoryId: "cities",
        points: 400,
        slotIndex: 2,
        question: "ما هي العاصمة السياسية لدولة أستراليا (وليست سيدني أو ملبورن)؟",
        hint: "مدينة مُخططة تقع بين سيدني وملبورن",
        displayAnswer: "كانبرا",
        acceptedAnswers: ["كانبرا", "كانبيرا", "كنبرا"],
        rejectedTraps: ["سيدني", "ملبورن", "بيرث"],
        funFact: "تم اختيار كانبرا عام ١٩٠٨م كحل وسط لإنهاء التنافس الشديد بين سيدني وملبورن على لقب العاصمة.",
      },
      {
        id: "city-400-2",
        categoryId: "cities",
        points: 400,
        slotIndex: 3,
        question: "أي مدينة سعودية تُلقب بـ «عروس البحر الأحمر»؟",
        hint: "البوابة التاريخية للحرمين الشريفين",
        displayAnswer: "جدة",
        acceptedAnswers: ["جدة", "جده", "محافظة جدة"],
        rejectedTraps: ["ينبع", "الدمام", "الخبر", "جازان"],
        funFact: "تضم منطقة جدة التاريخية (البلد) مباني مرجانية فريدة مسجلة في قائمة التراث العالمي لليونسكو.",
      },
      {
        id: "city-600-1",
        categoryId: "cities",
        points: 600,
        slotIndex: 4,
        question: "ما هي أعلى عاصمة في العالم من حيث الارتفاع عن سطح البحر (المقر الحكومي في بوليفيا)؟",
        hint: "ترتفع أكثر من ٣٦٠٠ متر في جبال الأنديز",
        displayAnswer: "لاباز",
        acceptedAnswers: ["لاباز", "لا باز", "سوكري", "سوكره"],
        rejectedTraps: ["بوغوتا", "كيتو", "ليما"],
        funFact: "تقع مدينة لاباز على ارتفاع ٣٦٥٠ متراً فوق سطح البحر وتعتمد على شبكة تلفريك معلقة كوسيلة نقل رئيسية!",
      },
      {
        id: "city-600-2",
        categoryId: "cities",
        points: 600,
        slotIndex: 5,
        question: "ما هي عاصمة كندا الرسمية؟",
        hint: "تقع في مقاطعة أونتاريو على الحدود مع كيبك",
        displayAnswer: "أوتاوا",
        acceptedAnswers: ["أوتاوا", "اوتاوا", "وتوا"],
        rejectedTraps: ["تورنتو", "تورونتو", "مونتريال", "فانكوفر"],
        funFact: "اختارت الملكة فيكتوريا مدينة أوتاوا عاصمة لكندا عام ١٨٥٧م لأنها كانت أبعد عن الحدود الأمريكية وأسهل دفاعاً.",
      },
    ],
  },
  {
    id: "football",
    title: "كرة قدم عالمية",
    subtitle: "كأس العالم، دوري الأبطال، وأساطير الكرة",
    icon: "Trophy",
    color: "#2ECC71",
    questions: [
      {
        id: "fb-200-1",
        categoryId: "football",
        points: 200,
        slotIndex: 0,
        question: "أي منتخب عربي حقق إنجازاً تاريخياً بالوصول إلى نصف نهائي كأس العالم ٢٠٢٢ في قطر؟",
        hint: "يُلقب بـ «أسود الأطلس»",
        displayAnswer: "المغرب",
        acceptedAnswers: ["المغرب", "المنتخب المغربي", "اسود الاطلس"],
        rejectedTraps: ["السعودية", "تونس", "الجزائر", "مصر"],
        funFact: "أصبح المنتخب المغربي أول منتخب عربي وأفريقي في التاريخ يصل إلى المربع الذهبي لكأس العالم.",
      },
      {
        id: "fb-200-2",
        categoryId: "football",
        points: 200,
        slotIndex: 1,
        question: "ما هو النادي الأكثر تتويجاً بلقب دوري أبطال أوروبا عبر التاريخ؟",
        hint: "النادي الملكي الإسباني",
        displayAnswer: "ريال مدريد",
        acceptedAnswers: ["ريال مدريد", "الريال", "مدريد", "الملكي"],
        rejectedTraps: ["برشلونة", "ميلان", "بايرن ميونخ", "ليفربول"],
        funFact: "ينفرد ريال مدريد بالرقم القياسي التاريخي في عدد ألقاب دوري أبطال أوروبا بفارق كبير عن أقرب منافسيه.",
      },
      {
        id: "fb-400-1",
        categoryId: "football",
        points: 400,
        slotIndex: 2,
        question: "من هو اللاعب السعودي الذي سجل هدف الفوز التاريخي الثاني في شباك الأرجنتين في مونديال ٢٠٢٢؟",
        hint: "يُلقب بـ «التورنيدو»",
        displayAnswer: "سالم الدوسري",
        acceptedAnswers: ["سالم الدوسري", "الدوسري", "سالم"],
        rejectedTraps: ["صالح الشهري", "فهد المولد", "سلمان الفرج", "ياسر الشهراني"],
        funFact: "صالح الشهري سجل هدف التعادل الأول، ثم أطلق سالم الدوسري تسديدته الشهيرة التي منحت الأخضر الفوز ٢-١.",
      },
      {
        id: "fb-400-2",
        categoryId: "football",
        points: 400,
        slotIndex: 3,
        question: "أي دولة فازت بأول بطولة كأس عالم لكرة القدم في التاريخ عام ١٩٣٠م؟",
        hint: "استضافت البطولة على أرضها في أمريكا الجنوبية",
        displayAnswer: "الأوروغواي",
        acceptedAnswers: ["الأوروغواي", "اوروغواي", "اوروجواي", "الاوروجواي"],
        rejectedTraps: ["البرازيل", "الأرجنتين", "إيطاليا", "إنجلترا"],
        funFact: "فازت الأوروغواي على الأرجنتين بنتيجة ٤-٢ في النهائي الذي أقيم في ملعب سنتيناريو بمونتفيديو.",
      },
      {
        id: "fb-600-1",
        categoryId: "football",
        points: 600,
        slotIndex: 4,
        question: "من هو الهداف التاريخي لكأس العالم برصيد ١٦ هدفاً؟",
        hint: "مهاجم ألماني اشتهر بالاحتفال بالقفزة الهوائية",
        displayAnswer: "ميروسلاف كلوزه",
        acceptedAnswers: ["ميروسلاف كلوزه", "كلوزه", "كلوزة", "كلوسه"],
        rejectedTraps: ["رونالدو", "ميسي", "مبابي", "بيليه", "مولر"],
        funFact: "حطم الألماني ميروسلاف كلوزه رقم البرازيلي رونالدو (١٥ هدفاً) خلال مونديال البرازيل ٢٠١٤.",
      },
      {
        id: "fb-600-2",
        categoryId: "football",
        points: 600,
        slotIndex: 5,
        question: "من هو حارس المرمى الوحيد في تاريخ كرة القدم الذي فاز بجائزة الكرة الذهبية (Ballon d'Or)؟",
        hint: "الحارس السوفيتي الملقب بـ «العنكبوت الأسود»",
        displayAnswer: "ليف ياشين",
        acceptedAnswers: ["ليف ياشين", "ياشين"],
        rejectedTraps: ["بوفون", "نوير", "كاسياس", "أوليفر كان"],
        funFact: "فاز ليف ياشين بالكرة الذهبية عام ١٩٦٣م، وتحمل جائزة أفضل حارس في العالم اليوم اسمه تكريماً له.",
      },
    ],
  },
  {
    id: "movies",
    title: "أفلام ومسلسلات",
    subtitle: "سينما عالمية، أنمي، وأعمال عربية خالدة",
    icon: "Film",
    color: "#DE7A7A",
    questions: [
      {
        id: "mov-200-1",
        categoryId: "movies",
        points: 200,
        slotIndex: 0,
        question: "ما اسم السفينة العملاقة التي غرقت عام ١٩١٢م في أول رحلة لها ودار حولها فيلم المخرج جيمس كاميرون الشهير؟",
        hint: "اصطدمت بجبل جليدي في المحيط الأطلسي",
        displayAnswer: "تايتانيك",
        acceptedAnswers: ["تايتانيك", "تيتانيك", "التايتانيك", "سفينة تايتانيك", "titanic"],
        rejectedTraps: ["بريتانيك", "أولمبيك", "لوسيتانيا"],
        funFact: "حصد فيلم تايتانيك (١٩٩٧) ١١ جائزة أوسكار وظل الفيلم الأعلى إيراداً في التاريخ لاثني عشر عاماً.",
      },
      {
        id: "mov-200-2",
        categoryId: "movies",
        points: 200,
        slotIndex: 1,
        question: "ما اسم الشخصية الكرتونية الشهيرة التي تعمل طباخاً في مطعم «مقرمشات سلطع» تحت البحر؟",
        hint: "يعيش في ثمرة أناناس في قاع الهامور",
        displayAnswer: "سبونج بوب",
        acceptedAnswers: ["سبونج بوب", "سبونجبوب", "بسيط", "سبونج بوب سكوير بانتس"],
        rejectedTraps: ["شفيق", "سلطع", "شمشون"],
        funFact: "ابتكر عالم الأحياء البحرية والرسام ستيفن هيلنبرغ شخصية سبونج بوب عام ١٩٩٩م.",
      },
      {
        id: "mov-400-1",
        categoryId: "movies",
        points: 400,
        slotIndex: 2,
        question: "ما اسم المخرج العالمي الذي أخرج أفلام «Inception» و«Interstellar» و«Oppenheimer»؟",
        hint: "مخرج بريطاني أمريكي يشتهر بالتلاعب بالزمن",
        displayAnswer: "كريستوفر نولان",
        acceptedAnswers: ["كريستوفر نولان", "نولان"],
        rejectedTraps: ["ستيفن سبيلبرغ", "مارتن سكورسيزي", "جيمس كاميرون", "كوينتن تارانتينو"],
        funFact: "يفضل كريستوفر نولان التصوير بكاميرات IMAX الحقيقية وتقليل المؤثرات الرقمية قدر الإمكان.",
      },
      {
        id: "mov-400-2",
        categoryId: "movies",
        points: 400,
        slotIndex: 3,
        question: "من هو الممثل الذي جسّد شخصية «والتر وايت / هايزنبرغ» في المسلسل الشهير Breaking Bad؟",
        hint: "فاز بأربع جوائز إيمي عن هذا الدور",
        displayAnswer: "براين كرانستون",
        acceptedAnswers: ["براين كرانستون", "برايان كرانستون", "كرانستون"],
        rejectedTraps: ["آرون بول", "بوب أودينكيرك", "جون كارلو إسبوزيتو"],
        funFact: "تم تصوير مسلسل Breaking Bad في مدينة ألباكركي بولاية نيومكسيكو التي نصبت تمثالاً برونزياً للشخصية.",
      },
      {
        id: "mov-600-1",
        categoryId: "movies",
        points: 600,
        slotIndex: 4,
        question: "من هو المخرج العربي السوري الراحل الذي أخرج الفيلمين التاريخيين العالميين «الرسالة» و«عمر المختار»؟",
        hint: "صوّر النسختين العربية والإنجليزية من فيلم الرسالة في وقت واحد",
        displayAnswer: "مصطفى العقاد",
        acceptedAnswers: ["مصطفى العقاد", "العقاد"],
        rejectedTraps: ["حاتم علي", "يوسف شاهين", "صلاح أبو سيف"],
        funFact: "أخرج مصطفى العقاد فيلم الرسالة عام ١٩٧٦م بنسختين عربية (بطولة عبدالله غيث) وإنجليزية (بطولة أنتوني كوين).",
      },
      {
        id: "mov-600-2",
        categoryId: "movies",
        points: 600,
        slotIndex: 5,
        question: "ما هو أول فيلم غير ناطق بالإنجليزية يفوز بجائزة الأوسكار لأفضل فيلم في التاريخ (عام ٢٠٢٠)؟",
        hint: "فيلم كوري جنوبي للمخرج بونغ جون هو",
        displayAnswer: "طفيلي (Parasite)",
        acceptedAnswers: ["طفيلي", "باراسايت", "الطفيل", "parasite"],
        rejectedTraps: ["لعبة الحبار", "أولد بوي", "قطار إلى بوسان", "روما"],
        funFact: "فاز الفيلم الكوري Parasite بأربع جوائز أوسكار دفعة واحدة من بينها أفضل فيلم وأفضل مخرج.",
      },
    ],
  },
  {
    id: "science",
    title: "علوم وفضاء",
    subtitle: "أسرار الكون، الفيزياء، جسم الإنسان، والاختراعات",
    icon: "Atom",
    color: "#E65C2E",
    questions: [
      {
        id: "sci-200-1",
        categoryId: "science",
        points: 200,
        slotIndex: 0,
        question: "ما هو الكوكب الذي يُعرف بـ «الكوكب الأحمر» بسبب كثرة أكسيد الحديد على سطحه؟",
        hint: "الكوكب الرابع بعداً عن الشمس",
        displayAnswer: "المريخ",
        acceptedAnswers: ["المريخ", "كوكب المريخ"],
        rejectedTraps: ["المشتري", "عطارد", "الزهرة", "زحل"],
        funFact: "يضم كوكب المريخ جبل «أوليمبوس مونس» وهو أكبر بركان وجبل معروف في المجموعة الشمسية بأكملها.",
      },
      {
        id: "sci-200-2",
        categoryId: "science",
        points: 200,
        slotIndex: 1,
        question: "ما هو الغاز الذي يشكل النسبة الأكبر (حوالي ٧٨٪) من الغلاف الجوي للأرض؟",
        hint: "ليس الأكسجين!",
        displayAnswer: "النيتروجين (الآزوت)",
        acceptedAnswers: ["النيتروجين", "نيتروجين", "النتروجين", "الآزوت", "ازوت"],
        rejectedTraps: ["الأكسجين", "ثاني أكسيد الكربون", "الهيدروجين"],
        funFact: "يشكل النيتروجين ٧٨٪ من الهواء الذي نتنفسه، بينما يشكل الأكسجين حوالي ٢١٪ فقط.",
      },
      {
        id: "sci-400-1",
        categoryId: "science",
        points: 400,
        slotIndex: 2,
        question: "ما هو المعدن الوحيد الذي يكون في حالة سائلة عند درجة حرارة الغرفة الطبيعية؟",
        hint: "كان يُستخدم في موازين الحرارة القديمة",
        displayAnswer: "الزئبق",
        acceptedAnswers: ["الزئبق", "زئبق"],
        rejectedTraps: ["البروم", "الرصاص", "الفضة", "الغاليوم"],
        funFact: "يرمز للزئبق كيميائياً بالرمز Hg، وينصهر عند درجة حرارة -٣٨.٨ درجة مئوية.",
      },
      {
        id: "sci-400-2",
        categoryId: "science",
        points: 400,
        slotIndex: 3,
        question: "ما هو أكبر عضو داخلي صلب في جسم الإنسان؟",
        hint: "يقع في الجزء الأيمن العلوي من البطن وله قدرة مذهلة على التجدد",
        displayAnswer: "الكبد",
        acceptedAnswers: ["الكبد", "كبد"],
        rejectedTraps: ["القلب", "الرئة", "المعدة", "الجلد"],
        funFact: "الجلد هو أكبر عضو خارجي، أما الكبد فهو أكبر عضو داخلي ويمكنه إعادة بناء نفسه حتى لو أُزيل ثلثاه!",
      },
      {
        id: "sci-600-1",
        categoryId: "science",
        points: 600,
        slotIndex: 4,
        question: "ما هو العنصر الكيميائي الذي يحمل الرمز «Au» في الجدول الدوري؟",
        hint: "معدن نفيس أصفر اللون",
        displayAnswer: "الذهب",
        acceptedAnswers: ["الذهب", "ذهب"],
        rejectedTraps: ["الفضة", "النحاس", "الألمنيوم", "البلاتين"],
        funFact: "اشتق الرمز Au من الكلمة اللاتينية Aurum وتعني الفجر المتوهج، بينما الفضة رمزها Ag.",
      },
      {
        id: "sci-600-2",
        categoryId: "science",
        points: 600,
        slotIndex: 5,
        question: "ما اسم التلسكوب الفضائي العملاق الذي أطلقته ناسا نهاية ٢٠٢١ بمرآة مطلية بالذهب ليرصد بدايات الكون؟",
        hint: "خليفة تلسكوب هابل الفضائي",
        displayAnswer: "جيمس ويب",
        acceptedAnswers: ["جيمس ويب", "تلسكوب جيمس ويب", "ويب"],
        rejectedTraps: ["هابل", "تلسكوب هابل", "كيبلر", "سبيتزر"],
        funFact: "يعمل تلسكوب جيمس ويب على بعد ١.٥ مليون كيلومتر من الأرض في نقطة لاغرانج الثانية.",
      },
    ],
  },
  {
    id: "culture",
    title: "ثقافة عامة ولغة",
    subtitle: "أدب عربي، أمثال، غرائب، ومعلومات ذكية",
    icon: "BookOpen",
    color: "#3B66B4",
    questions: [
      {
        id: "cul-200-1",
        categoryId: "culture",
        points: 200,
        slotIndex: 0,
        question: "ماذا يُسمى صوت الأسد في اللغة العربية؟",
        hint: "صوت قوي يدوّي في الغابة",
        displayAnswer: "زئير",
        acceptedAnswers: ["زئير", "الزئير"],
        rejectedTraps: ["صهيل", "عواء", "هدير", "نهيق"],
        funFact: "يمكن سماع زئير الأسد البالغ من مسافة تصل إلى ٨ كيلومترات في السهول المفتوحة!",
      },
      {
        id: "cul-200-2",
        categoryId: "culture",
        points: 200,
        slotIndex: 1,
        question: "ما هو الحيوان البري الأسرع على وجه الأرض في المسافات القصيرة؟",
        hint: "تصل سرعته إلى ١١٠ كم/ساعة خلال ثوانٍ",
        displayAnswer: "الفهد (الشيتا)",
        acceptedAnswers: ["الفهد", "فهد", "الشيتا", "شيتا", "الفهد الصياد"],
        rejectedTraps: ["النمر", "الأسد", "الغزال", "الحصان"],
        funFact: "يستطيع الفهد الصياد التسارع من ٠ إلى ١٠٠ كم/ساعة في ثلاث ثوانٍ فقط، أي أسرع من معظم السيارات الرياضية.",
      },
      {
        id: "cul-400-1",
        categoryId: "culture",
        points: 400,
        slotIndex: 2,
        question: "من هو الشاعر العربي العباسي الشهير القائل: «الخيلُ والليلُ والبيداءُ تعرفني .. والسيفُ والرمحُ والقرطاسُ والقلمُ»؟",
        hint: "أحمد بن الحسين الكندي",
        displayAnswer: "المتنبي (أبو الطيب المتنبي)",
        acceptedAnswers: ["المتنبي", "ابو الطيب المتنبي", "احمد بن الحسين المتنبي"],
        rejectedTraps: ["أبو تمام", "البحتري", "أبو العلاء المعري", "امرؤ القيس"],
        funFact: "يُعد أبو الطيب المتنبي مالئ الدنيا وشاغل الناس ومن أعظم شعراء العربية في الفخر والحكمة.",
      },
      {
        id: "cul-400-2",
        categoryId: "culture",
        points: 400,
        slotIndex: 3,
        question: "ما هي الدولة الوحيدة في العالم التي لا يأخذ علمها الوطني شكل المستطيل أو المربع (يتكون من مثلثين)؟",
        hint: "تقع في جبال الهيمالايا وتضم قمة إيفرست",
        displayAnswer: "نيبال",
        acceptedAnswers: ["نيبال", "دولة نيبال"],
        rejectedTraps: ["سويسرا", "الفاتيكان", "بوتان", "التبت"],
        funFact: "يمثل المثلثان في علم نيبال قمم جبال الهيمالايا الشاهقة، بينما علم سويسرا والفاتيكان مربع الشكل.",
      },
      {
        id: "cul-600-1",
        categoryId: "culture",
        points: 600,
        slotIndex: 4,
        question: "من هو الأديب العربي الوحيد الحائز على جائزة نوبل في الأدب عام ١٩٨٨م؟",
        hint: "مؤلف الثلاثية وأولاد حارتنا",
        displayAnswer: "نجيب محفوظ",
        acceptedAnswers: ["نجيب محفوظ", "محفوظ"],
        rejectedTraps: ["طه حسين", "توفيق الحكيم", "أحمد زويل", "محمود درويش"],
        funFact: "كتب الروائي المصري نجيب محفوظ أكثر من ٣٥ رواية صوّرت الحارة المصرية وتحولت لعشرات الأفلام الكلاسيكية.",
      },
      {
        id: "cul-600-2",
        categoryId: "culture",
        points: 600,
        slotIndex: 5,
        question: "ما اسم المضيق البحري الاستراتيجي الذي يربط الخليج العربي ببحر عُمان والمحيط الهندي؟",
        hint: "يمر عبره خُمس تجارة النفط العالمية",
        displayAnswer: "مضيق هرمز",
        acceptedAnswers: ["هرمز", "مضيق هرمز"],
        rejectedTraps: ["باب المندب", "مضيق جبل طارق", "قناة السويس", "مضيق ملقا"],
        funFact: "يبلغ عرض أضيق نقطة في مضيق هرمز حوالي ٣٣ كيلومتراً فقط بين سلطنة عُمان وإيران.",
      },
    ],
  },
  {
    id: "geography",
    title: "جغرافيا وعجائب",
    subtitle: "قارات، أنهار، جبال، وجزر العالم",
    icon: "Compass",
    color: "#2ECC71",
    questions: [
      {
        id: "geo-200-1",
        categoryId: "geography",
        points: 200,
        slotIndex: 0,
        question: "ما هو أطول نهر في العالم يمر عبر إحدى عشرة دولة أفريقية؟",
        hint: "يصب في البحر الأبيض المتوسط",
        displayAnswer: "نهر النيل",
        acceptedAnswers: ["نهر النيل", "النيل"],
        rejectedTraps: ["الأمازون", "الفرات", "الدانوب"],
        funFact: "يمتد نهر النيل لمسافة تزيد عن ٦٦٥٠ كيلومتراً من منابعه حتى مصبه في مصر.",
      },
      {
        id: "geo-200-2",
        categoryId: "geography",
        points: 200,
        slotIndex: 1,
        question: "ما هي أكبر جزيرة في العالم من حيث المساحة (قبل أستراليا التي تُصنف قارة)؟",
        hint: "تابعة لمملكة الدنمارك ويغطيها الجليد",
        displayAnswer: "غرينلاند",
        acceptedAnswers: ["غرينلاند", "جرينلاند", "جزيرة غرينلاند"],
        rejectedTraps: ["آيسلندا", "مدغشقر", "بورنيو"],
        funFact: "تزيد مساحة غرينلاند عن مليوني كيلومتر مربع ويغطي الجليد أكثر من ٨٠٪ من سطحها.",
      },
      {
        id: "geo-400-1",
        categoryId: "geography",
        points: 400,
        slotIndex: 2,
        question: "ما هي أخفض نقطة يابسة على سطح الكرة الأرضية؟",
        hint: "تقع بين الأردن وفلسطين",
        displayAnswer: "البحر الميت",
        acceptedAnswers: ["البحر الميت", "غور الاردن"],
        rejectedTraps: ["وادي الموت", "خندق ماريانا", "منخفض القطارة"],
        funFact: "ينخفض شاطئ البحر الميت بأكثر من ٤٣٠ متراً تحت مستوى سطح البحر.",
      },
      {
        id: "geo-400-2",
        categoryId: "geography",
        points: 400,
        slotIndex: 3,
        question: "في أي دولة تقع صحراء «أتاكاما» التي تُعد أشد الصحاري غير القطبية جفافاً في العالم؟",
        hint: "دولة ساحلية طويلة في أمريكا الجنوبية",
        displayAnswer: "تشيلي",
        acceptedAnswers: ["تشيلي", "شيلي"],
        rejectedTraps: ["بيرو", "الأرجنتين", "المكسيك"],
        funFact: "بعض محطات الرصد في صحراء أتاكاما بتشيلي لم تسجل هطول قطرة مطر واحدة لمئات السنين.",
      },
      {
        id: "geo-600-1",
        categoryId: "geography",
        points: 600,
        slotIndex: 4,
        question: "ما هي الدولة التي تمتلك أطول شريط ساحلي في العالم؟",
        hint: "تطل على ثلاثة محيطات في أمريكا الشمالية",
        displayAnswer: "كندا",
        acceptedAnswers: ["كندا", "دولة كندا"],
        rejectedTraps: ["روسيا", "أستراليا", "إندونيسيا"],
        funFact: "يبلغ طول سواحل كندا أكثر من ٢٠٢ ألف كيلومتر بفضل آلاف الجزر والخلجان.",
      },
      {
        id: "geo-600-2",
        categoryId: "geography",
        points: 600,
        slotIndex: 5,
        question: "ما اسم الشلالات الأعلى ارتفاعاً في العالم بدون انقطاع وتقع في فنزويلا؟",
        hint: "يبلغ ارتفاعها ٩٧٩ متراً",
        displayAnswer: "شلالات أنجل",
        acceptedAnswers: ["شلالات أنجل", "انجل", "شلال انجل", "انخل"],
        rejectedTraps: ["شلالات نياجرا", "شلالات فيكتوريا", "شلالات إغوازو"],
        funFact: "تتساقط مياه شلالات أنجل من قمة جبل أيويانتيبوي لدرجة أن جزءاً كبيراً منها يتحول إلى ضباب قبل وصوله للقاع.",
      },
    ],
  },
  {
    id: "gaming_tech",
    title: "تقنية وألعاب",
    subtitle: "عالم الألعاب، الذكاء الاصطناعي، وعمالقة التقنية",
    icon: "Gamepad2",
    color: "#F4D03F",
    questions: [
      {
        id: "tech-200-1",
        categoryId: "gaming_tech",
        points: 200,
        slotIndex: 0,
        question: "ما هي اللعبة الأكثر مبيعاً في تاريخ ألعاب الفيديو عبر جميع المنصات؟",
        hint: "لعبة بناء مكعبات وعوالم مفتوحة",
        displayAnswer: "ماينكرافت (Minecraft)",
        acceptedAnswers: ["ماينكرافت", "ماين كرافت", "minecraft"],
        rejectedTraps: ["قراند", "فورتنايت", "فيفا", "روبلوكس"],
        funFact: "تجاوزت مبيعات لعبة ماينكرافت حاجز ٣٠٠ مليون نسخة مباعة حول العالم.",
      },
      {
        id: "tech-200-2",
        categoryId: "gaming_tech",
        points: 200,
        slotIndex: 1,
        question: "ما اسم الشركة اليابانية العريقة المطورة لسلسلة ألعاب «سوبر ماريو» و«زيلدا»؟",
        hint: "تأسست في مدينة كيوتو عام ١٨٨٩م كشركة أوراق لعب",
        displayAnswer: "نينتندو (Nintendo)",
        acceptedAnswers: ["نينتندو", "ننتندو", "nintendo"],
        rejectedTraps: ["سوني", "سيجا", "كابكوم", "كونامي"],
        funFact: "بدأت شركة نينتندو بصناعة أوراق اللعب اليابانية التقليدية (هانافودا) قبل قرن كامل من دخول عالم الفيديو جيمز.",
      },
      {
        id: "tech-400-1",
        categoryId: "gaming_tech",
        points: 400,
        slotIndex: 2,
        question: "ماذا تعني حروف الاختصار الشهير «CPU» في عالم الحواسيب؟",
        hint: "العقل المدبر للحاسوب",
        displayAnswer: "وحدة المعالجة المركزية",
        acceptedAnswers: ["وحدة المعالجة المركزية", "المعالج", "المعالج المركزي", "central processing unit"],
        rejectedTraps: ["كرت الشاشة", "الذاكرة العشوائية", "اللوحة الأم"],
        funFact: "أول معالج دقيق تجاري على شريحة واحدة كان Intel 4004 عام ١٩٧١م.",
      },
      {
        id: "tech-400-2",
        categoryId: "gaming_tech",
        points: 400,
        slotIndex: 3,
        question: "ما اسم البطل الرئيسي في سلسلة ألعاب «The Legend of Zelda» (وليس الأميرة زيلدا)؟",
        hint: "يرتدي قبعة وسترة خضراء ويحمل سيف الماستر",
        displayAnswer: "لينك (Link)",
        acceptedAnswers: ["لينك", "link"],
        rejectedTraps: ["زيلدا", "ماريو", "كلاود", "سورا"],
        funFact: "سمّاه المبتكر شيغيرو مياموتو «لينك» لأنه يمثل حلقة الوصل (Link) بين اللاعب وعالم اللعبة.",
      },
      {
        id: "tech-600-1",
        categoryId: "gaming_tech",
        points: 600,
        slotIndex: 4,
        question: "من هو العالم البريطاني الذي يُعد الأب الروحي لعلم الحاسوب والذكاء الاصطناعي وابتكر اختبار الذكاء الآلي؟",
        hint: "تحمل أرفع جائزة عالمية في علوم الحاسوب اسمه",
        displayAnswer: "آلان تورينغ",
        acceptedAnswers: ["آلان تورينغ", "الان تورنج", "تورينغ", "تورنج"],
        rejectedTraps: ["تيم بيرنرز لي", "بيل غيتس", "فون نيومان"],
        funFact: "وضع آلان تورينغ عام ١٩٣٦م مفهوم «آلة تورينغ» التي بُنيت عليها جميع الحواسيب الحديثة.",
      },
      {
        id: "tech-600-2",
        categoryId: "gaming_tech",
        points: 600,
        slotIndex: 5,
        question: "في أي عام أطلق العالم «تيم بيرنرز لي» أول موقع إلكتروني على شبكة الويب العالمية (WWW)؟",
        hint: "في مطلع التسعينيات داخل مختبر سيرن CERN",
        displayAnswer: "١٩٩١",
        acceptedAnswers: ["1991", "١٩٩١", "عام 1991"],
        rejectedTraps: ["1985", "1995", "2000"],
        funFact: "أُطلق أول موقع ويب في التاريخ في أغسطس ١٩٩١م لشرح مشروع الشبكة العنكبوتية للباحثين.",
      },
    ],
  },
];

// ============================================================================
// THE 8 MINI-GAMES SEED ROUNDS (5+ Playable Rounds Each)
// ============================================================================

export const SPEED_TRIVIA_ROUNDS: SpeedTriviaRound[] = [
  {
    id: "st-1",
    question: "كم عدد القلوب التي يمتلكها الأخطبوط في جسمه؟",
    options: ["قلب واحد", "قلبان", "٣ قلوب", "٤ قلوب"],
    correctIndex: 2,
    explanation: "يمتلك الأخطبوط ٣ قلوب: اثنان يضخان الدم للخياشيم وواحد يضخه لباقي الجسم!",
  },
  {
    id: "st-2",
    question: "ما هي العملة الرسمية لدولة سويسرا؟",
    options: ["اليورو", "الفرنك السويسري", "الكرونة", "الجنيه"],
    correctIndex: 1,
    explanation: "سويسرا ليست عضواً في الاتحاد الأوروبي وتستخدم الفرنك السويسري (CHF).",
  },
  {
    id: "st-3",
    question: "أي من هذه الدول لا تطل على البحر الأبيض المتوسط نهائياً؟",
    options: ["البرتغال", "المغرب", "لبنان", "إيطاليا"],
    correctIndex: 0,
    explanation: "البرتغال تطل بالكامل على المحيط الأطلسي ولا تملك أي ساحل على البحر المتوسط!",
  },
  {
    id: "st-4",
    question: "ما هو أصلب معدن طبيعي معروف على وجه الأرض؟",
    options: ["التيتانيوم", "الكوارتز", "الألماس", "البلاتين"],
    correctIndex: 2,
    explanation: "الألماس يحصد الدرجة ١٠/١٠ على مقياس موس لصلابة المعادن.",
  },
  {
    id: "st-5",
    question: "في أي عام أُطلق أول جهاز آيفون (iPhone) من شركة أبل؟",
    options: ["٢٠٠٥", "٢٠٠٧", "٢٠٠٩", "٢٠١٠"],
    correctIndex: 1,
    explanation: "كشف ستيف جوبز عن أول آيفون في التاريخ في يناير ٢٠٠٧.",
  },
  {
    id: "st-6",
    question: "ما هي أطول سلسلة جبال على سطح اليابسة في العالم؟",
    options: ["جبال الهيمالايا", "جبال الألب", "جبال الأنديز", "جبال روكي"],
    correctIndex: 2,
    explanation: "تمتد جبال الأنديز في أمريكا الجنوبية لمسافة ٧٠٠٠ كم، بينما الهيمالايا هي الأعلى ارتفاعاً.",
  },
];

export const QUICK_REFLEX_ROUNDS: QuickReflexRound[] = [
  {
    id: "qr-1",
    promptAr: "اضغط على: أزرق + مربع 🟦",
    subWarningAr: "انتبه! لا تضغط على الدائرة الزرقاء أو المربع الأحمر!",
    targetCellId: "c2",
    grid: [
      { id: "c1", shape: "circle", color: "blue", labelAr: "دائرة زرقاء" },
      { id: "c2", shape: "square", color: "blue", labelAr: "مربع أزرق" },
      { id: "c3", shape: "square", color: "red", labelAr: "مربع أحمر" },
      { id: "c4", shape: "triangle", color: "yellow", labelAr: "مثلث أصفر" },
      { id: "c5", shape: "star", color: "green", labelAr: "نجمة خضراء" },
      { id: "c6", shape: "hexagon", color: "orange", labelAr: "سداسي برتقالي" },
    ],
  },
  {
    id: "qr-2",
    promptAr: "اضغط على: أحمر + مثلث 🔺",
    subWarningAr: "السرعة مطلوبة.. ركّز بين المثلثات!",
    targetCellId: "c5",
    grid: [
      { id: "c1", shape: "triangle", color: "yellow", labelAr: "مثلث أصفر" },
      { id: "c2", shape: "circle", color: "red", labelAr: "دائرة حمراء" },
      { id: "c3", shape: "diamond", color: "purple", labelAr: "معين بنفسجي" },
      { id: "c4", shape: "square", color: "red", labelAr: "مربع أحمر" },
      { id: "c5", shape: "triangle", color: "red", labelAr: "مثلث أحمر" },
      { id: "c6", shape: "triangle", color: "blue", labelAr: "مثلث أزرق" },
    ],
  },
  {
    id: "qr-3",
    promptAr: "اضغط على: أصفر + نجمة ⭐",
    subWarningAr: "لا تخدعك النجمة البرتقالية أو الدائرة الصفراء!",
    targetCellId: "c4",
    grid: [
      { id: "c1", shape: "star", color: "orange", labelAr: "نجمة برتقالية" },
      { id: "c2", shape: "circle", color: "yellow", labelAr: "دائرة صفراء" },
      { id: "c3", shape: "hexagon", color: "yellow", labelAr: "سداسي أصفر" },
      { id: "c4", shape: "star", color: "yellow", labelAr: "نجمة صفراء" },
      { id: "c5", shape: "star", color: "blue", labelAr: "نجمة زرقاء" },
      { id: "c6", shape: "diamond", color: "green", labelAr: "معين أخضر" },
    ],
  },
  {
    id: "qr-4",
    promptAr: "اضغط على: أخضر + سداسي ⬢",
    subWarningAr: "عيناك على الشكل السداسي الأخضر فقط!",
    targetCellId: "c6",
    grid: [
      { id: "c1", shape: "square", color: "green", labelAr: "مربع أخضر" },
      { id: "c2", shape: "hexagon", color: "blue", labelAr: "سداسي أزرق" },
      { id: "c3", shape: "circle", color: "green", labelAr: "دائرة خضراء" },
      { id: "c4", shape: "diamond", color: "green", labelAr: "معين أخضر" },
      { id: "c5", shape: "hexagon", color: "purple", labelAr: "سداسي بنفسجي" },
      { id: "c6", shape: "hexagon", color: "green", labelAr: "سداسي أخضر" },
    ],
  },
  {
    id: "qr-5",
    promptAr: "اضغط على: برتقالي + معين 🔶",
    subWarningAr: "فرّق بين المعين والمربع!",
    targetCellId: "c1",
    grid: [
      { id: "c1", shape: "diamond", color: "orange", labelAr: "معين برتقالي" },
      { id: "c2", shape: "square", color: "orange", labelAr: "مربع برتقالي" },
      { id: "c3", shape: "diamond", color: "yellow", labelAr: "معين أصفر" },
      { id: "c4", shape: "triangle", color: "orange", labelAr: "مثلث برتقالي" },
      { id: "c5", shape: "diamond", color: "red", labelAr: "معين أحمر" },
      { id: "c6", shape: "star", color: "purple", labelAr: "نجمة بنفسجية" },
    ],
  },
];

export const PRICE_GUESS_ROUNDS: PriceGuessRound[] = [
  {
    id: "pg-1",
    productName: "نظارة الواقع المختلط Apple Vision Pro (سعة 256GB)",
    brand: "Apple",
    specs: "شاشات Micro-OLED بدقة 4K لكل عين • معالج M2 + R1 • تتبع حركة العين واليد",
    actualPriceSar: 14999,
    currencyLabel: "ريال سعودي",
    illustrationType: "vision_pro",
    funFact: "أطلقت أبل نظارة Vision Pro بسعر رسمي ٣٤٩٩ دولاراً أمريكياً (حوالي ١٤,٩٩٩ ريالاً مع الضريبة).",
  },
  {
    id: "pg-2",
    productName: "جهاز PlayStation 5 Pro الجديد (نسخة 2TB)",
    brand: "Sony Interactive",
    specs: "قرص صلب ٢ تيرابايت • تتبع أشعة متقدم • تقنية PSSR بالذكاء الاصطناعي",
    actualPriceSar: 3399,
    currencyLabel: "ريال سعودي",
    illustrationType: "ps5_pro",
    funFact: "يأتي جهاز PS5 Pro بسعر رسمي قدره ٣٣٩٩ ريالاً سعودياً في المتاجر المعتمدة بدون محرك الأقراص.",
  },
  {
    id: "pg-3",
    productName: "مصفف الشعر Dyson Airwrap Complete Long",
    brand: "Dyson",
    specs: "٦ ملحقات تصفيف مغناطيسية • محرك رقمي V9 • تحكم ذكي بالحرارة",
    actualPriceSar: 2499,
    currencyLabel: "ريال سعودي",
    illustrationType: "dyson",
    funFact: "يعتمد جهاز دايسون إير راب على ظاهرة «كواندا» الفيزيائية لجذب الشعر بالهواء دون حرارة مفرطة.",
  },
  {
    id: "pg-4",
    productName: "ماكينة القهوة الاحترافية Breville Barista Express",
    brand: "Breville / Sage",
    specs: "مطحنة مخروطية مدمجة • عصا تبخير حليب احترافية • هيكل ستانلس ستيل",
    actualPriceSar: 3150,
    currencyLabel: "ريال سعودي",
    illustrationType: "espresso",
    funFact: "تُعد هذه الماكينة من أشهر مكائن الإسبريسو المنزلية في العالم ويتراوح سعرها الرسمي حول ٣١٥٠ ريالاً.",
  },
  {
    id: "pg-5",
    productName: "نظارة Ray-Ban Meta الذكية بالكاميرا والذكاء الاصطناعي",
    brand: "Meta × Ray-Ban",
    specs: "كاميرا ١٢ ميجابكسل • سماعات مفتوحة مدمجة • بث مباشر ومساعد ذكي",
    actualPriceSar: 1390,
    currencyLabel: "ريال سعودي",
    illustrationType: "smart_glasses",
    funFact: "تبدأ أسعار نظارة Ray-Ban Meta من ٢٩٩ دولاراً (حوالي ١٣٩٠ ريالاً سعودياً مع الشحن والضريبة).",
  },
];

export const WHATS_IN_FRAME_ROUNDS: WhatsInFrameRound[] = [
  {
    id: "wif-1",
    prompt: "ما هو الاسم التاريخي القديم لهذه المدينة المحصنة بالأسوار قبل فتحها عام ١٤٥٣م؟",
    clue: "الاسم القديم وليس إسطنبول!",
    sceneArtworkId: "constantinople",
    displayAnswer: "القسطنطينية (قسطنطينة / بيزنطة)",
    acceptedAnswers: ["القسطنطينية", "قسطنطينة", "قسطنطينيه", "بيزنطة", "بيزنطه"],
    rejectedTraps: ["إسطنبول", "أنقرة", "روما"],
    funFact: "أسوار القسطنطينية الثلاثية صمدت لأكثر من ألف عام حتى استخدام المدافع العملاقة عام ١٤٥٣م.",
  },
  {
    id: "wif-2",
    prompt: "ما اسم هذا الجبل البركاني الشهير المغطى بالثلوج والذي يُعد رمزاً لليابان؟",
    clue: "تتحلق حوله أشجار الساكورا الوردية",
    sceneArtworkId: "mount_fuji",
    displayAnswer: "جبل فوجي",
    acceptedAnswers: ["جبل فوجي", "فوجي", "فوجي ياما", "بركان فوجي"],
    rejectedTraps: ["إيفرست", "كيليمنجارو", "الألب"],
    funFact: "يبلغ ارتفاع جبل فوجي ٣٧٧٦ متراً وهو أعلى قمة في اليابان وأيقونة ثقافية عالمية.",
  },
  {
    id: "wif-3",
    prompt: "ما اسم هذه المدينة الوردية المنحوتة في الصخر (الخزنة)؟",
    clue: "إحدى عجائب الدنيا السبع الجديدة في الأردن",
    sceneArtworkId: "petra",
    displayAnswer: "البتراء",
    acceptedAnswers: ["البتراء", "بتراء", "البترا", "الخزنة", "خزنة البتراء"],
    rejectedTraps: ["مدائن صالح", "الأقصر", "تدمر"],
    funFact: "واجهة الخزنة الشهيرة في البتراء يبلغ ارتفاعها ٤٠ متراً ونُحتت بالكامل في جبل صخري وردي.",
  },
  {
    id: "wif-4",
    prompt: "ما اسم هذا المعلم الرخامي الأبيض الشهير في مدينة أغرا بالهند؟",
    clue: "بناه الإمبراطور شاه جهان تخليداً لزوجته ممتاز محل",
    sceneArtworkId: "taj_mahal",
    displayAnswer: "تاج محل",
    acceptedAnswers: ["تاج محل", "التاج محل", "قصر تاج محل"],
    rejectedTraps: ["قصر الحمراء", "المسجد الأزرق"],
    funFact: "استغرق بناء تاج محل أكثر من ٢٠ عاماً بمشاركة ٢٠ ألف حرفي ومعماري.",
  },
  {
    id: "wif-5",
    prompt: "ما اسم السفينة العملاقة التي يصورها هذا المشهد التاريخي ليلة غرقها؟",
    clue: "٤ مداخن عملاقة وجبل جليدي في ليل الأطلسي",
    sceneArtworkId: "titanic",
    displayAnswer: "تايتانيك",
    acceptedAnswers: ["تايتانيك", "تيتانيك", "التايتانيك", "سفينة تايتانيك"],
    rejectedTraps: ["لوسيتانيا", "كوين ماري"],
    funFact: "المدخنة الرابعة في سفينة تايتانيك كانت للتهوية وإعطاء السفينة مظهراً أكثر هيبة وفخامة!",
  },
];

export const CLOSEST_NUMBER_ROUNDS: ClosestNumberRound[] = [
  {
    id: "cn-1",
    question: "كم عدد الدول المستقلة المعترف بها في قارة أفريقيا؟",
    unitLabel: "دولة",
    correctNumber: 54,
    hintRange: "بين ٣٠ و ٨٠ دولة",
    funFact: "تضم قارة أفريقيا ٥٤ دولة عضو في الأمم المتحدة والاتحاد الأفريقي، وهي القارة الأكثر عدداً في الدول!",
  },
  {
    id: "cn-2",
    question: "كم يبلغ الارتفاع الإجمالي لبرج خليفة في دبي بالمتر؟",
    unitLabel: "متر",
    correctNumber: 828,
    hintRange: "بين ٥٠٠ و ١٢٠٠ متر",
    funFact: "يبلغ ارتفاع برج خليفة ٨٢٨ متراً ويتكون من أكثر من ١٦٠ طابقاً مأهولاً.",
  },
  {
    id: "cn-3",
    question: "كم عدد العظام في جسم الإنسان البالغ؟",
    unitLabel: "عظمة",
    correctNumber: 206,
    hintRange: "بين ١٠٠ و ٣٥٠ عظمة",
    funFact: "يولد الطفل بحوالي ٢٧٠ عظمة، ومع النمو تلتحم بعضها ليصبح عددها ٢٠٦ عظمات عند البلوغ.",
  },
  {
    id: "cn-4",
    question: "كم عدد مفاتيح البيانو الكلاسيكي الكامل (البيضاء والسوداء معاً)؟",
    unitLabel: "مفتاح",
    correctNumber: 88,
    hintRange: "بين ٥٠ و ١٢٠ مفتاحاً",
    funFact: "يتكون البيانو القياسي من ٨٨ مفتاحاً: ٥٢ مفتاحاً أبيض و ٣٦ مفتاحاً أسود.",
  },
  {
    id: "cn-5",
    question: "كم دقيقة يستغرق ضوء الشمس تقريباً للوصول إلى كوكب الأرض (بالثواني: حوالي كم ثانية)؟",
    unitLabel: "ثانية",
    correctNumber: 499,
    hintRange: "حوالي ٨ دقائق وثلث (بين ٢٠٠ و ٩٠٠ ثانية)",
    funFact: "يقطع الضوء مسافة ١٤٩.٦ مليون كم من الشمس للأرض في ٤٩٩ ثانية (٨ دقائق و ١٩ ثانية).",
  },
];

export const DRAWING_CHALLENGE_ROUNDS: DrawingChallengeRound[] = [
  {
    id: "dc-1",
    secretWord: "نخلة تحت المطر",
    categoryHint: "طبيعة وطقس (كلمتان)",
    acceptedAnswers: ["نخلة تحت المطر", "نخله تحت المطر", "نخلة ومطر", "نخلة", "مطر ونخلة"],
    difficultyPoints: 400,
  },
  {
    id: "dc-2",
    secretWord: "جمل يلبس نظارة شمسية",
    categoryHint: "حيوان كشخة!",
    acceptedAnswers: ["جمل يلبس نظارة", "جمل بنظارة", "جمل", "بعير بنظارة", "جمل يلبس نظارة شمسية"],
    difficultyPoints: 450,
  },
  {
    id: "dc-3",
    secretWord: "أخطبوط يلعب كرة قدم",
    categoryHint: "كائن بحري رياضي",
    acceptedAnswers: ["أخطبوط يلعب كرة", "اخطبوط", "أخطبوط وكرة", "اخطبوط يلعب كوره"],
    difficultyPoints: 450,
  },
  {
    id: "dc-4",
    secretWord: "سيارة تطير بالبالونات",
    categoryHint: "مركبة في السماء",
    acceptedAnswers: ["سيارة تطير", "سيارة وبالونات", "سيارة بالونات", "سياره تطير بالبالونات"],
    difficultyPoints: 500,
  },
  {
    id: "dc-5",
    secretWord: "فنجان قهوة ساخن",
    categoryHint: "مشروب يومي",
    acceptedAnswers: ["فنجان قهوة", "كوب قهوة", "قهوة", "فنجال قهوة", "شاهي", "كوب ساخن"],
    difficultyPoints: 350,
  },
];

export const MAP_PIN_ROUNDS: MapPinRound[] = [
  {
    id: "mp-1",
    prompt: "وين تقع «سويسرا» على الخريطة؟ ثبت الدبوس في قلب جبال الألب!",
    placeName: "سويسرا (برن / زيورخ)",
    regionHint: "وسط قارة أوروبا - شمال إيطاليا",
    targetLat: 46.8182,
    targetLng: 8.2275,
    funFact: "تقع سويسرا في قلب أوروبا وتحدها ألمانيا وفرنسا وإيطاليا والنمسا وليشتنشتاين.",
  },
  {
    id: "mp-2",
    prompt: "وين تقع مدينة «البتراء» الأثرية؟ ثبت الدبوس بأدق ما يمكن!",
    placeName: "البتراء - المملكة الأردنية الهاشمية",
    regionHint: "جنوب بلاد الشام - شرق البحر الأحمر",
    targetLat: 30.3285,
    targetLng: 35.4444,
    funFact: "تقع البتراء في محافظة معان جنوب الأردن بين البحر الميت وخليج العقبة.",
  },
  {
    id: "mp-3",
    prompt: "وين تقع العاصمة اليابانية «طوكيو»؟",
    placeName: "طوكيو - اليابان",
    regionHint: "أقصى شرق آسيا - المحيط الهادئ",
    targetLat: 35.6762,
    targetLng: 139.6503,
    funFact: "تقع طوكيو على الساحل الشرقي لجزيرة هونشو أكبر جزر الأرخبيل الياباني.",
  },
  {
    id: "mp-4",
    prompt: "وين يقع «مضيق جبل طارق» الذي يفصل بين أفريقيا وأوروبا؟",
    placeName: "مضيق جبل طارق (المغرب / إسبانيا)",
    regionHint: "المدخل الغربي للبحر الأبيض المتوسط",
    targetLat: 35.9667,
    targetLng: -5.5,
    funFact: "لا يتجاوز عرض مضيق جبل طارق ١٤.٣ كيلومتراً في أضيق نقطة بين المغرب وإسبانيا.",
  },
  {
    id: "mp-5",
    prompt: "وين تقع «جزيرة مدغشقر» الشهيرة؟",
    placeName: "جزيرة مدغشقر",
    regionHint: "المحيط الهندي - قبالة الساحل الجنوبي الشرقي لأفريقيا",
    targetLat: -18.7669,
    targetLng: 46.8691,
    funFact: "مدغشقر هي رابع أكبر جزيرة في العالم وموطن حيوان الليمور الفريد.",
  },
];

export const SCENE_DESCRIPTION_ROUNDS: SceneDescriptionRound[] = [
  {
    id: "sd-1",
    title: "استراحة القمر",
    prompt: "صف اللي داخل الصورة بدقة، مو من وين هي! (اذكر أكبر عدد من العناصر الموجودة)",
    sceneArtworkId: "moon_coffee",
    modelDescription: "رائد فضاء يجلس على كرسي فوق سطح القمر ويشرب فنجان قهوة ساخن، وبجانبه علم وكوكب الأرض وسفينة فضائية في السماء.",
    tags: [
      { id: "t1", label: "رائد فضاء", aliases: ["رائد", "فضائي", "بدلة فضاء", "رجل فضاء"], points: 100 },
      { id: "t2", label: "كوب قهوة / شاي", aliases: ["قهوة", "كوب", "فنجان", "شاي", "مشروب"], points: 100 },
      { id: "t3", label: "سطح القمر", aliases: ["القمر", "قمر", "فوهات"], points: 80 },
      { id: "t4", label: "كوكب الأرض", aliases: ["الأرض", "كوكب", "الكرة الأرضية"], points: 90 },
      { id: "t5", label: "صاروخ / مركبة", aliases: ["صاروخ", "سفينة فضاء", "مركبة"], points: 90 },
      { id: "t6", label: "علم مغروس", aliases: ["علم", "راية"], points: 80 },
    ],
  },
  {
    id: "sd-2",
    title: "كشتة الشتاء في النفود",
    prompt: "صف اللي داخل الصورة بدقة! ما العناصر الظاهرة في هذه الجلسة البرية؟",
    sceneArtworkId: "desert_camp",
    modelDescription: "خيمة بيضاء في الصحراء ليلاً تحت الهلال والنجوم، وأمامها نار مشتعلة ودلة قهوة عربية مع جمل ونخلة وسيارة دفع رباعي.",
    tags: [
      { id: "t1", label: "خيمة", aliases: ["خيمة", "بيت شعر", "مخيم"], points: 90 },
      { id: "t2", label: "نار / حطب", aliases: ["نار", "شبة ضو", "حطب", "تدفئة"], points: 100 },
      { id: "t3", label: "دلة قهوة", aliases: ["دلة", "قهوة", "ابريق"], points: 100 },
      { id: "t4", label: "جمل / ناقة", aliases: ["جمل", "ناقة", "بعير", "إبل"], points: 90 },
      { id: "t5", label: "هلال ونجوم", aliases: ["هلال", "قمر", "نجوم", "ليل"], points: 80 },
      { id: "t6", label: "كثبان رملية / صحراء", aliases: ["صحراء", "رمال", "نفود", "بر"], points: 80 },
    ],
  },
  {
    id: "sd-3",
    title: "شيف البيتزا الإيطالي",
    prompt: "صف اللي داخل الصورة بدقة! ماذا يفعل الطباخ وما الأشياء من حوله؟",
    sceneArtworkId: "pizza_chef",
    modelDescription: "طباخ يرتدي قبعة شيف بيضاء وشارب، يرمي عجينة البيتزا في الهواء أمام فرن حجري مشتعل، وعلى الطاولة طماطم وجبن وزيت زيتون.",
    tags: [
      { id: "t1", label: "شيف / طباخ", aliases: ["شيف", "طباخ", "طاهي", "قبعة طبخ"], points: 90 },
      { id: "t2", label: "عجينة بيتزا", aliases: ["بيتزا", "عجينة", "فطيرة"], points: 100 },
      { id: "t3", label: "فرن حجري", aliases: ["فرن", "نار", "خبز"], points: 100 },
      { id: "t4", label: "طماطم", aliases: ["طماطم", "بندورة", "صلصة"], points: 80 },
      { id: "t5", label: "جبن", aliases: ["جبن", "جبنة", "موزاريلا"], points: 90 },
      { id: "t6", label: "قبعة الشيف", aliases: ["قبعة", "طاقية"], points: 80 },
    ],
  },
  {
    id: "sd-4",
    title: "كنز الأعماق",
    prompt: "صف كل ما تراه تحت الماء في هذا المشهد البحري!",
    sceneArtworkId: "deep_sea_treasure",
    modelDescription: "غواص يحمل كاميرا تحت البحر يلتقط صورة لسلحفاة بحرية وصندوق كنز ذهبي مفتوح بجانب أخطبوط وشعاب مرجانية.",
    tags: [
      { id: "t1", label: "غواص", aliases: ["غواص", "سباح", "بدلة غوص"], points: 100 },
      { id: "t2", label: "صندوق كنز وذهب", aliases: ["كنز", "صندوق", "ذهب", "عملات"], points: 100 },
      { id: "t3", label: "سلحفاة بحرية", aliases: ["سلحفاة", "ترسة"], points: 90 },
      { id: "t4", label: "أخطبوط", aliases: ["أخطبوط", "اخطبوط"], points: 90 },
      { id: "t5", label: "كاميرا تصوير", aliases: ["كاميرا", "تصوير"], points: 80 },
      { id: "t6", label: "شعاب مرجانية / أسماك", aliases: ["مرجان", "شعاب", "سمك", "أسماك"], points: 80 },
    ],
  },
  {
    id: "sd-5",
    title: "سباق الهجن المستقبلي ٢٠٩٠",
    prompt: "صف العناصر الموجودة في هذا المشهد الخيالي بدقة!",
    sceneArtworkId: "cyber_camel",
    modelDescription: "جمل آلي يركض في مضمار سباق مستقبلي مضيء بالنيون، يركبه روبوت صغير، وفي الخلفية ناطحات سحاب وسيارات طائرة.",
    tags: [
      { id: "t1", label: "جمل / هجن", aliases: ["جمل", "هجن", "ناقة", "بعير"], points: 100 },
      { id: "t2", label: "روبوت / آلي", aliases: ["روبوت", "آلي", "جوكي"], points: 100 },
      { id: "t3", label: "ناطحات سحاب / أبراج", aliases: ["أبراج", "ناطحات", "مباني", "مدينة"], points: 90 },
      { id: "t4", label: "سيارة طائرة / درون", aliases: ["سيارة طائرة", "طائرة", "درون", "مركبة"], points: 90 },
      { id: "t5", label: "مضمار سباق", aliases: ["مضمار", "سباق", "طريق"], points: 80 },
      { id: "t6", label: "أضواء نيون", aliases: ["نيون", "أضواء", "ليزر"], points: 80 },
    ],
  },
];
