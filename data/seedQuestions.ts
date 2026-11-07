import { SceneTag } from "@/lib/arabicReferee";

export type DescriptionDetailTag = SceneTag;

export interface SeenJeemQuestion {
  id: string;
  categoryId: string;
  points: 200 | 400 | 600;
  slotIndex: number; // 0..5 (0,1 = 200pt; 2,3 = 400pt; 4,5 = 600pt)
  question: string;
  hint?: string;
  imageUrl?: string;
  displayAnswer: string;
  acceptedAnswers: string[];
  acceptedSynonyms?: string[];
  rejectedTraps?: string[];
  trapNote?: string;
  funFact: string;
}

export interface SeenJeemCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  thumbnailUrl?: string;
  edition?: "MA" | "MENA" | "EN";
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

export type ProductIllustrationType =
  | "vision_pro"
  | "ps5_pro"
  | "dyson"
  | "espresso"
  | "watch"
  | "smart_glasses"
  | "ps5_slim"
  | "atay_set"
  | "iphone_16_pro"
  | "iphone_17_pro"
  | "nintendo_switch_2"
  | "airpods_pro_2"
  | "dacia_logan";

export interface PriceGuessRound {
  id: string;
  productName: string;
  brand: string;
  categoryBadge?: string;
  specs: string;
  actualPriceSar: number;
  actualPriceDh?: number;
  currencyLabel: string;
  imageUrl?: string;
  illustrationType: ProductIllustrationType;
  funFact: string;
}

export interface WhatsInFrameRound {
  id: string;
  prompt: string;
  clue: string;
  imageUrl?: string;
  sceneArtworkId:
    | "constantinople"
    | "mount_fuji"
    | "petra"
    | "titanic"
    | "taj_mahal"
    | "pyramids"
    | "chefchaouen"
    | "hassan_ii"
    | "eiffel_tower"
    | "colosseum"
    | "burj_khalifa";
  displayAnswer: string;
  acceptedAnswers: string[];
  acceptedSynonyms?: string[];
  rejectedTraps: string[];
  trapNote?: string;
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
  imageUrl?: string;
  sceneArtworkId:
    | "moon_coffee"
    | "desert_camp"
    | "pizza_chef"
    | "deep_sea_treasure"
    | "cyber_camel"
    | "moroccan_souk"
    | "moroccan_living_room"
    | "gaming_setup"
    | "street_cafe";
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
    icon: "Brain",
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
    icon: "BadgeDollarSign",
    defaultDurationSec: 30,
    howToPlay: "شاهد تفاصيل المنتج المعروض على الشاشة الرئيسية، ثم اكتب تخمينك للسعر في هاتفك.",
  },
  {
    id: "WHATS_IN_FRAME",
    number: 4,
    title: "وش في اللقطة؟",
    subtitle: "مَعلم تاريخي أو مشهد شهير على الشاشة.. اكتب اسمه والحكم الذكي يصحح!",
    badge: "قوة ملاحظة 🖼️",
    color: "#3B66B4",
    icon: "ScanSearch",
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
    icon: "ScrollText",
    color: "#F4D03F",
    questions: [
      {
        id: "hist-const-fix",
        categoryId: "history",
        points: 200,
        slotIndex: 0,
        question: "ما هو الاسم التاريخي القديم لمدينة إسطنبول قبل الفتح العثماني عام ١٤٥٣م؟",
        hint: "أسسها الإمبراطور الروماني قسطنطين الأول (انتبه للفرق بينها وبين المدينة الجزائرية!)",
        displayAnswer: "القسطنطينية (بيزنطة)",
        acceptedAnswers: ["القسطنطينية", "بيزنطة", "قسطنطينيه", "بيزنطه", "روما الجديدة"],
        acceptedSynonyms: ["القسطنطينية", "بيزنطة", "قسطنطينيه", "بيزنطه", "روما الجديدة"],
        rejectedTraps: ["قسطنطينة", "قسطنطينه", "إسطنبول", "أنقرة", "أثينا"],
        trapNote: "تنبيه: قسطنطينة هي المدينة الجزائرية العريقة، أما عاصمة البيزنطيين فهي القسطنطينية (إسطنبول حالياً)!",
        funFact: "تنبيه: قسطنطينة هي المدينة الجزائرية العريقة، أما عاصمة البيزنطيين فهي القسطنطينية (إسطنبول حالياً)! سميت القسطنطينية نسبةً للإمبراطور قسطنطين العظيم سنة ٣٣٠م.",
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
        question: "📸 ما اسم هذا المعلم التاريخي والمدينة الوردية المنحوتة في الصخر جنوب الأردن والتي كانت عاصمة للأنباط؟",
        hint: "إحدى عجائب الدنيا السبع الجديدة (انظر الصورة)",
        imageUrl: "https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=1000&q=85",
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
    icon: "Landmark",
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
        question: "📸 في أي مدينة مغربية التُقطت هذه الصورة لصومعة الكتبية الشهيرة وتُلقب بـ «المدينة الحمراء»؟",
        hint: "تشتهر بساحة جامع الفنا وأسوارها الحمراء",
        imageUrl: "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1000&q=85",
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
    icon: "Clapperboard",
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
    icon: "Puzzle",
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
    icon: "Globe2",
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
    icon: "Cpu",
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
  {
    id: "spd-2026-1",
    question: "كم عدد الميداليات الذهبية التي حققها العداء المغربي سفيان البقالي في سباق 3000 متر موانع في أولمبيادي طوكيو 2020 وباريس 2024؟",
    options: ["ذهبية واحدة", "ذهبيتان متتاليتان", "3 ذهبيات", "فضية وذهبية"],
    correctIndex: 1,
    explanation: "حقق سفيان البقالي إنجازاً تاريخياً بالحفاظ على لقبه الأولمبي في طوكيو 2020 وباريس 2024.",
  },
  {
    id: "spd-2026-2",
    question: "ما هي أعلى قمة جبلية في المغرب وشمال إفريقيا (بارتفاع 4,167 متر)؟",
    options: ["جبل العياشي", "قمة توبقال", "جبل تدغين", "جبل مكون"],
    correctIndex: 1,
    explanation: "تقع قمة جبل توبقال في سلسلة الأطلس الكبير ويبلغ ارتفاعها 4,167 متراً.",
  },
  {
    id: "spd-2026-3",
    question: "أي مدينة مغربية تُلقب بـ «عاصمة الفضة» وتشتهر بصناعة الحلي والخناجر الفضية الأمازيغية؟",
    options: ["تيزنيت", "تارودانت", "الصويرة", "ورزازات"],
    correctIndex: 0,
    explanation: "تشتهر مدينة تيزنيت في جنوب المغرب بمهرجان الفضة وصياغة الحلي الفضية الأصيلة.",
  },
  {
    id: "spd-2026-4",
    question: "ما هو الكوكب الوحيد في المجموعة الشمسية الذي يدور حول نفسه باتجاه عقارب الساعة (من الشرق للغرب)؟",
    options: ["المريخ", "الزهرة", "عطارد", "زحل"],
    correctIndex: 1,
    explanation: "يدور كوكب الزهرة عكس اتجاه دوران الأرض وبقية الكواكب فتشرق الشمس فيه من الغرب.",
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
    categoryBadge: "واقع مختلط • تقنية المستقبل",
    specs: "شاشات Micro-OLED بدقة 4K لكل عين • معالج M2 + R1 • تتبع حركة العين واليد",
    actualPriceSar: 14999,
    currencyLabel: "ريال سعودي",
    imageUrl: "https://images.unsplash.com/photo-1707227157310-0b86d0b4b65f?auto=format&fit=crop&w=900&q=85",
    illustrationType: "vision_pro",
    funFact: "أطلقت أبل نظارة Vision Pro بسعر رسمي ٣٤٩٩ دولاراً أمريكياً (حوالي ١٤,٩٩٩ ريالاً مع الضريبة).",
  },
  {
    id: "pg-2",
    productName: "جهاز PlayStation 5 Pro الجديد (نسخة 2TB)",
    brand: "Sony Interactive",
    categoryBadge: "ألعاب وكونسول • الجيل الاحترافي",
    specs: "قرص صلب ٢ تيرابايت • تتبع أشعة متقدم • تقنية PSSR بالذكاء الاصطناعي",
    actualPriceSar: 3399,
    currencyLabel: "ريال سعودي",
    imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85",
    illustrationType: "ps5_pro",
    funFact: "يأتي جهاز PS5 Pro بسعر رسمي قدره ٣٣٩٩ ريالاً سعودياً في المتاجر المعتمدة بدون محرك الأقراص.",
  },
  {
    id: "pg-3",
    productName: "مصفف الشعر Dyson Airwrap Complete Long",
    brand: "Dyson",
    categoryBadge: "عناية وجمال • إصدار كامل",
    specs: "٦ ملحقات تصفيف مغناطيسية • محرك رقمي V9 • تحكم ذكي بالحرارة",
    actualPriceSar: 2499,
    currencyLabel: "ريال سعودي",
    imageUrl: "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=900&q=85",
    illustrationType: "dyson",
    funFact: "يعتمد جهاز دايسون إير راب على ظاهرة «كواندا» الفيزيائية لجذب الشعر بالهواء دون حرارة مفرطة.",
  },
  {
    id: "pg-4",
    productName: "ماكينة القهوة الاحترافية Breville Barista Express",
    brand: "Breville / Sage",
    categoryBadge: "ركن القهوة المختصة • باريستا",
    specs: "مطحنة مخروطية مدمجة • عصا تبخير حليب احترافية • هيكل ستانلس ستيل",
    actualPriceSar: 3150,
    currencyLabel: "ريال سعودي",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=900&q=85",
    illustrationType: "espresso",
    funFact: "تُعد هذه الماكينة من أشهر مكائن الإسبريسو المنزلية في العالم ويتراوح سعرها الرسمي حول ٣١٥٠ ريالاً.",
  },
  {
    id: "pg-5",
    productName: "نظارة Ray-Ban Meta الذكية بالكاميرا والذكاء الاصطناعي",
    brand: "Meta × Ray-Ban",
    categoryBadge: "أجهزة قابلة للارتداء • ذكاء اصطناعي",
    specs: "كاميرا ١٢ ميجابكسل • سماعات مفتوحة مدمجة • بث مباشر ومساعد ذكي",
    actualPriceSar: 1390,
    currencyLabel: "ريال سعودي",
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85",
    illustrationType: "smart_glasses",
    funFact: "تبدأ أسعار نظارة Ray-Ban Meta من ٢٩٩ دولاراً (حوالي ١٣٩٠ ريالاً سعودياً مع الشحن والضريبة).",
  },
];

export const WHATS_IN_FRAME_ROUNDS: WhatsInFrameRound[] = [
  {
    id: "wif-1",
    prompt: "ما اسم هذا المعلم الرخامي الأبيض المهيب في مدينة أغرا بالهند وأحد عجائب الدنيا؟",
    clue: "بناه الإمبراطور شاه جهان تخليداً لزوجته ممتاز محل",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "taj_mahal",
    displayAnswer: "تاج محل (Taj Mahal)",
    acceptedAnswers: ["تاج محل", "التاج محل", "قصر تاج محل", "Taj Mahal"],
    acceptedSynonyms: ["تاج محل", "التاج محل", "قصر تاج محل", "Taj Mahal"],
    rejectedTraps: ["قصر الحمراء", "المسجد الأزرق", "قطب منار"],
    funFact: "استغرق بناء تاج محل أكثر من ٢٠ عاماً بمشاركة ٢٠ ألف حرفي ومعماري من مختلف أصقاع العالم الإسلامي.",
  },
  {
    id: "wif-2",
    prompt: "ما اسم هذه المدينة المغربية التاريخية الساحرة الملقبة عالمياً بـ «الجوهرة الزرقاء»؟",
    clue: "تقع في جبال الريف شمال المملكة وتتميز بجدرانها الزرقاء وأبوابها الأندلسية",
    imageUrl: "https://images.unsplash.com/photo-1553899017-90c40dd32533?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "chefchaouen",
    displayAnswer: "شفشاون (الشاون)",
    acceptedAnswers: ["شفشاون", "الشاون", "شاون", "مدينة شفشاون", "Chefchaouen"],
    acceptedSynonyms: ["شفشاون", "الشاون", "شاون", "مدينة شفشاون", "Chefchaouen"],
    rejectedTraps: ["تطوان", "الحسيمة", "طنجة", "أصيلة"],
    funFact: "تأسست شفشاون عام ١٤٧١م كحصن عسكري وأصبحت جدرانها الزرقاء ملاذاً سياحياً عالمياً.",
  },
  {
    id: "wif-3",
    prompt: "ما اسم هذا الصرح المعماري الديني المطل على المحيط الأطلسي بصومعته الشاهقة (٢١٠ أمتار)؟",
    clue: "يقع في العاصمة الاقتصادية الدار البيضاء ويتميز بسقفه المتحرك",
    imageUrl: "https://images.unsplash.com/photo-1577147443647-81856d5151af?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "hassan_ii",
    displayAnswer: "مسجد الحسن الثاني (الدار البيضاء)",
    acceptedAnswers: ["مسجد الحسن الثاني", "جامع الحسن الثاني", "الحسن الثاني", "مسجد كازا"],
    acceptedSynonyms: ["مسجد الحسن الثاني", "جامع الحسن الثاني", "الحسن الثاني"],
    rejectedTraps: ["صومعة حسان", "صومعة الكتبية", "جامع القرويين"],
    funFact: "ترتفع مئذنة مسجد الحسن الثاني ٢١٠ أمتار وتوجه شعاع ليزر ليلي نحو مكة المكرمة بمدى ٣٠ كيلومتراً.",
  },
  {
    id: "wif-4",
    prompt: "ما اسم هذه المعالم الفرعونية الأسطورية الثلاثة في مصر والتي صمدت لآلاف السنين؟",
    clue: "خوفو وخفرع ومنقرع على هضبة الجيزة",
    imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "pyramids",
    displayAnswer: "أهرامات الجيزة (مصر)",
    acceptedAnswers: ["الأهرامات", "اهرامات الجيزة", "أهرامات الجيزة", "أهرام الجيزة", "خوفو"],
    acceptedSynonyms: ["الأهرامات", "اهرامات الجيزة", "أهرامات الجيزة"],
    rejectedTraps: ["أبو الهول", "سقارة", "الأقصر"],
    funFact: "يعد الهرم الأكبر بالجيزة العجيبة الوحيدة المتبقية من عجائب الدنيا السبع القديمة.",
  },
  {
    id: "wif-5",
    prompt: "ما اسم هذا البرج الحديدي الأيقوني في العاصمة الفرنسية باريس المكتمل عام ١٨٨٩م؟",
    clue: "صممه المهندس غوستاف إيفل ويبلغ ارتفاعه ٣٣٠ متراً",
    imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "eiffel_tower",
    displayAnswer: "برج إيفل (Eiffel Tower)",
    acceptedAnswers: ["برج إيفل", "برج ايفل", "ايفل", "إيفل", "Eiffel Tower"],
    acceptedSynonyms: ["برج إيفل", "برج ايفل", "ايفل", "إيفل"],
    rejectedTraps: ["قوس النصر", "متحف اللوفر", "بيزا المائل"],
    funFact: "كان من المقرر تفكيك برج إيفل بعد ٢٠ عاماً من تشييده، لكن استخدام قمته لهوائيات اللاسلكي أنقذه من الهدم.",
  },
  {
    id: "wif-6",
    prompt: "ما اسم هذا المدرج الروماني الأثري العملاق في قلب العاصمة الإيطالية روما؟",
    clue: "كان مسرحاً لمعارك المجالدين والوحوش الرومانية",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "colosseum",
    displayAnswer: "الكولوسيوم (Colosseum)",
    acceptedAnswers: ["الكولوسيوم", "كولوسيوم", "مدرج كولوسيوم", "Colosseum"],
    acceptedSynonyms: ["الكولوسيوم", "كولوسيوم", "مدرج كولوسيوم"],
    rejectedTraps: ["البانثيون", "برج بيزا", "المنتدى الروماني"],
    funFact: "كان الكولوسيوم يتسع لأكثر من ٥٠ ألف متفرج وكان يحتوي على نظام رفع يدوي ميكانيكي لنقل الوحوش إلى الساحة.",
  },
  {
    id: "wif-7",
    prompt: "ما اسم أطول ناطحة سحاب وبرج شيده الإنسان في العالم بارتفاع ٨٢٨ متراً؟",
    clue: "يقع في إمارة دبي بدولة الإمارات العربية المتحدة",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "burj_khalifa",
    displayAnswer: "برج خليفة (دبي)",
    acceptedAnswers: ["برج خليفة", "برج دبي", "خليفة", "Burj Khalifa"],
    acceptedSynonyms: ["برج خليفة", "برج دبي", "خليفة"],
    rejectedTraps: ["برج العرب", "برج ساعة مكة", "برج شنجهاي"],
    funFact: "يمكن رؤية غروب الشمس مرتين في نفس اليوم من برج خليفة: مرة من الأرض ومرة ثانية من الطوابق العليا!",
  },
  {
    id: "wif-8",
    prompt: "ما اسم هذه المدينة الأثرية الوردية المنحوتة في الصخر (الخزنة) في الأردن؟",
    clue: "عاصمة الأنباط وإحدى عجائب الدنيا السبع الجديدة",
    imageUrl: "https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "petra",
    displayAnswer: "البتراء (الخزنة)",
    acceptedAnswers: ["البتراء", "بتراء", "البترا", "الخزنة", "خزنة البتراء", "Petra"],
    acceptedSynonyms: ["البتراء", "بتراء", "البترا", "الخزنة", "خزنة البتراء"],
    rejectedTraps: ["مدائن صالح", "الأقصر", "تدمر"],
    funFact: "واجهة الخزنة الشهيرة في البتراء يبلغ ارتفاعها ٤٠ متراً ونُحتت بالكامل في جبل صخري وردي.",
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
  {
    id: "num-2026-1",
    question: "كم يبلغ ارتفاع قمة جبل توبقال (أعلى قمة في المغرب وشمال إفريقيا) بالأمتار؟",
    unitLabel: "متر",
    correctNumber: 4167,
    hintRange: "النطاق التقريبي: بين 3,000 و 5,000 متر",
    funFact: "يبلغ الارتفاع الرسمي لقمة توبقال في الأطلس الكبير 4,167 متراً عن سطح البحر.",
  },
  {
    id: "num-2026-2",
    question: "في أي سنة ميلادية تأسس جامع وجامعة القرويين في مدينة فاس؟",
    unitLabel: "ميلادية",
    correctNumber: 859,
    hintRange: "النطاق التقريبي: بين 750 و 1000 ميلادية",
    funFact: "أسست فاطمة الفهرية جامع القرويين بفاس عام 859 ميلادية (245 هجرية).",
  },
  {
    id: "num-2026-3",
    question: "كم تبلغ المسافة الطرقية عبر الطريق السيار بين مدينتي الدار البيضاء ومراكش بالكيلومتر؟",
    unitLabel: "كم",
    correctNumber: 242,
    hintRange: "النطاق التقريبي: بين 150 و 350 كم",
    funFact: "تبلغ المسافة عبر الطريق السيار A3 بين الدار البيضاء ومراكش حوالي 242 كيلومتراً.",
  },
];

export const DRAWING_CHALLENGE_ROUNDS: DrawingChallengeRound[] = [
  {
    id: "draw-ma-1",
    secretWord: "براد أتاي مشحر",
    categoryHint: "تراث مغربي",
    acceptedAnswers: ["براد أتاي مشحر", "براد أتاي", "براد اتاي", "اتاي", "أتاي", "براد"],
    difficultyPoints: 400,
  },
  {
    id: "draw-ma-2",
    secretWord: "طاجين بالبرقوق",
    categoryHint: "طبخ مغربي",
    acceptedAnswers: ["طاجين بالبرقوق", "طاجين", "طاجين مغربي", "طاجين اللحم بالبرقوق"],
    difficultyPoints: 400,
  },
  {
    id: "draw-ma-3",
    secretWord: "طربوش مغربي",
    categoryHint: "لباس تقليدي",
    acceptedAnswers: ["طربوش مغربي", "طربوش", "الطربوش", "طربوش فاسي"],
    difficultyPoints: 350,
  },
  {
    id: "draw-ma-4",
    secretWord: "قطار البراق السريع",
    categoryHint: "معالم المغرب",
    acceptedAnswers: ["قطار البراق السريع", "قطار البراق", "البراق", "تي جي في", "قطار سريع"],
    difficultyPoints: 450,
  },
  {
    id: "draw-ma-5",
    secretWord: "أسد إفران الصخري",
    categoryHint: "معالم المغرب",
    acceptedAnswers: ["أسد إفران الصخري", "أسد إفران", "اسد افران", "أسد الأطلس", "سبع إفران"],
    difficultyPoints: 450,
  },
  {
    id: "draw-ma-6",
    secretWord: "الگراب (ساقي الماء التقليدي)",
    categoryHint: "ساحة جامع الفنا",
    acceptedAnswers: ["الگراب", "الكراب", "گراب", "كراب", "ساقي الماء", "القراب"],
    difficultyPoints: 500,
  },
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
    title: "سوق التوابل والفوانيس التقليدي",
    prompt: "صف كل ما تراه داخل هذه الصورة بدقة! (الألوان، الفوانيس، الأواني، الملابس، والتفاصيل الخلفية — ٩ عناصر)",
    imageUrl: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1100&q=85",
    sceneArtworkId: "desert_camp",
    modelDescription: "ممر سوق تقليدي مزدحم تتدلى من سقفه فوانيس نحاسية وزجاجية ملونة، وعلى الجانبين أطباق خزفية مزخرفة، أكوام من التوابل الملونة، سجاد منسوج، وبائع يرتدي جلابة تقليدية تحت أقواس حجرية.",
    tags: [
      { id: "t1", label: "فوانيس / مصابيح معلقة", aliases: ["فوانيس", "فانوس", "مصابيح", "ثريات", "إضاءة"], points: 80 },
      { id: "t2", label: "أطباق وطواجن خزفية", aliases: ["أطباق", "صحون", "خزف", "فخار", "طاجين", "طواجن"], points: 80 },
      { id: "t3", label: "توابل وبهارات ملونة", aliases: ["توابل", "بهارات", "عطارة", "أعشاب"], points: 80 },
      { id: "t4", label: "زرابي / سجاد منسوج", aliases: ["زربية", "زرابي", "سجاد", "سجادة", "مفروشات"], points: 70 },
      { id: "t5", label: "أقواس وزقاق حجري", aliases: ["قوس", "أقواس", "زقاق", "سوق", "ممر"], points: 70 },
      { id: "t6", label: "بائع / متسوقون", aliases: ["بائع", "رجل", "تاجر", "متسوق", "ناس"], points: 60 },
      { id: "t7", label: "جلابة / لباس تقليدي", aliases: ["جلابة", "لباس", "طربوش", "قفطان"], points: 70 },
      { id: "t8", label: "نحاسيات وأباريق", aliases: ["نحاس", "براد", "إبريق", "صينية"], points: 70 },
      { id: "t9", label: "ألوان دافئة (أحمر وأصفر وأزرق)", aliases: ["أحمر", "أصفر", "أزرق", "ملون", "ألوان"], points: 60 },
    ],
  },
  {
    id: "sd-2",
    title: "مطبخ الشيف الإيطالي المزدحم",
    prompt: "صف تفاصيل هذه الصورة بدقة! ماذا يرتدي الشيف وما المكونات والأدوات الظاهرة حوله؟",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=85",
    sceneArtworkId: "pizza_chef",
    modelDescription: "طباخ يرتدي قبعة ومئزر طبخ أمام فرن حجري مشتعل بالنار، يفرد عجينة البيتزا على طاولة خشبية عليها دقيق، طماطم حمراء، جبن موزاريلا، أوراق ريحان خضراء، وزجاجة زيت زيتون.",
    tags: [
      { id: "t1", label: "شيف / طباخ بمئزر", aliases: ["شيف", "طباخ", "طاهي", "مئزر"], points: 80 },
      { id: "t2", label: "عجينة بيتزا ودقيق", aliases: ["بيتزا", "عجينة", "دقيق", "طحين"], points: 80 },
      { id: "t3", label: "فرن حجري ونار مشتعلة", aliases: ["فرن", "نار", "حطب", "لهب"], points: 80 },
      { id: "t4", label: "طماطم وصلصة حمراء", aliases: ["طماطم", "بندورة", "صلصة", "صوص"], points: 70 },
      { id: "t5", label: "جبن موزاريلا", aliases: ["جبن", "جبنة", "موزاريلا"], points: 70 },
      { id: "t6", label: "أوراق ريحان / خضار", aliases: ["ريحان", "حبق", "أوراق خضراء", "خضار"], points: 70 },
      { id: "t7", label: "قبعة الشيف البيضاء", aliases: ["قبعة", "طاقية", "أبيض"], points: 60 },
      { id: "t8", label: "طاولة خشبية / رفوف", aliases: ["طاولة", "خشب", "رفوف", "مطبخ"], points: 60 },
      { id: "t9", label: "مغرفة خشبية / زيت زيتون", aliases: ["زيت", "مغرفة", "لوح خشبي"], points: 70 },
    ],
  },
  {
    id: "sd-3",
    title: "غرفة القيمر والستريمر المضيئة",
    prompt: "صف كل القطع والألوان والأجهزة الظاهرة في غرفة الألعاب هذه بأدق تفصيل!",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1100&q=85",
    sceneArtworkId: "cyber_camel",
    modelDescription: "سيت أب ألعاب احترافي يضم شاشتين عريضتين، كيبورد ميكانيكي مضيء بـ RGB، سماعات رأس معلقة، مايكروفون بث، كرسي قيمنق، وإضاءة نيون زرقاء وبنفسجية في الخلفية مع يد تحكم.",
    tags: [
      { id: "t1", label: "شاشات كمبيوتر متعددة", aliases: ["شاشة", "شاشتين", "شاشات", "مونيتر"], points: 80 },
      { id: "t2", label: "لوحة مفاتيح (كيبورد) مضيئة", aliases: ["كيبورد", "لوحة مفاتيح", "أزرار"], points: 80 },
      { id: "t3", label: "سماعات رأس (هيدسيت)", aliases: ["سماعة", "سماعات", "هيدسيت"], points: 70 },
      { id: "t4", label: "إضاءة نيون RGB (أزرق وبنفسجي)", aliases: ["نيون", "إضاءة", "أزرق", "بنفسجي", "وردي", "RGB"], points: 80 },
      { id: "t5", label: "كرسي قيمنق احترافي", aliases: ["كرسي", "مقعد"], points: 70 },
      { id: "t6", label: "ماوس وباد عريض", aliases: ["ماوس", "فأرة", "ماوس باد"], points: 60 },
      { id: "t7", label: "صندوق كمبيوتر (كيس) زجاجي", aliases: ["كمبيوتر", "بي سي", "كيس", "مراوح"], points: 70 },
      { id: "t8", label: "يد تحكم / مايكروفون", aliases: ["يد تحكم", "مايك", "مايكروفون", "كونترولر"], points: 70 },
    ],
  },
  {
    id: "sd-4",
    title: "صالون مغربي أصيل وجلسة أتاي دافئة",
    prompt: "صف كل ما تراه داخل هذا الصالون المغربي الفاخر بدقة! (الأواني، الزليج، الفوانيس، الوسائد، والديكور — ١٠ عناصر)",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "moroccan_living_room",
    modelDescription: "صالون مغربي تقليدي دافئ يضم جلسة سداري بوسائد مخملية مطرزة، طاولة خشبية منقوشة عليها براد أتاي فاسي فضي وصينية دائرية وكؤوس ملونة، فوانيس نحاسية معلقة من السقف، جدران مزينة بالزليج الأندلسي، وزربية بربرية أصيلة.",
    tags: [
      { id: "t1", label: "براد أتاي مغربي منقوش", aliases: ["براد", "إبريق", "شاي", "أتاي", "ابريق"], points: 80 },
      { id: "t2", label: "صينية فضية / نحاسية دائرية", aliases: ["صينية", "صحن فضي", "صينيه"], points: 80 },
      { id: "t3", label: "كؤوس أتاي ملونة", aliases: ["كؤوس", "كاس", "كيسان", "أكواب"], points: 80 },
      { id: "t4", label: "فوانيس نحاسية معلقة", aliases: ["فوانيس", "فانوس", "مصباح", "ثريا"], points: 80 },
      { id: "t5", label: "وسائد ومخاد مطرزة", aliases: ["وسائد", "مخاد", "مخدة", "وسادة"], points: 70 },
      { id: "t6", label: "زليج وزخارف جدارية", aliases: ["زليج", "فسيفساء", "نقوش", "جدار"], points: 70 },
      { id: "t7", label: "طاولة خشبية منقوشة", aliases: ["طاولة", "مائدة", "طاوله"], points: 70 },
      { id: "t8", label: "زربية وسجاد تقليدي", aliases: ["زربية", "سجاد", "سجادة", "موكيت"], points: 70 },
      { id: "t9", label: "أقواس وهندسة مغربية أندلسية", aliases: ["قوس", "أقواس", "باب", "نافذة"], points: 60 },
      { id: "t10", label: "ألوان دافئة (أصفر، أزرق، ذهبي)", aliases: ["ذهبي", "أصفر", "أزرق", "أحمر", "ألوان"], points: 60 },
    ],
  },
  {
    id: "sd-5",
    title: "مقهى الشارع الحيوي والتراس الخارجي",
    prompt: "صف جميع التفاصيل والأشياء الظاهرة في مشهد هذا المقهى الحيوي بدقة! (١٠ عناصر)",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "street_cafe",
    modelDescription: "تراس مقهى خارجي نابض بالحياة يضم طاولات مستديرة خشبية ومعدنية، كراسي خيزران قش، فناجين قهوة وأطباق حلويات، مظلات قماشية كبيرة تقي من الشمس، واجهة مقهى زجاجية مزينة بالزهور ونباتات الزينة، وقائمة أسعار معلقة.",
    tags: [
      { id: "t1", label: "طاولات مقهى دائرية", aliases: ["طاولات", "طاولة", "طاوله"], points: 80 },
      { id: "t2", label: "كراسي خيزران وقش", aliases: ["كراسي", "كرسي", "مقاعد"], points: 80 },
      { id: "t3", label: "فناجين قهوة وأكواب", aliases: ["قهوة", "فناجين", "فنجان", "كوب"], points: 80 },
      { id: "t4", label: "مظلات شمسية خارجية", aliases: ["مظلة", "مظلات", "شمسية"], points: 70 },
      { id: "t5", label: "معجنات وكرواسون", aliases: ["كرواسون", "معجنات", "حلوى", "خبز"], points: 70 },
      { id: "t6", label: "واجهة زجاجية للمقهى", aliases: ["واجهة", "زجاج", "نافذة"], points: 70 },
      { id: "t7", label: "نباتات وزهور زينة", aliases: ["نباتات", "زهور", "ورد", "شجر"], points: 60 },
      { id: "t8", label: "رصيف حجري للمشاة", aliases: ["رصيف", "شارع", "أرضية", "حجر"], points: 60 },
      { id: "t9", label: "قائمة طعام معلقة", aliases: ["منيو", "قائمة", "لوحة"], points: 70 },
      { id: "t10", label: "زبائن / رواد مقهى", aliases: ["زبائن", "ناس", "أشخاص", "رواد"], points: 60 },
    ],
  },
];
