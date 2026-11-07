import {
  ClosestNumberRound,
  DrawingChallengeRound,
  MapPinRound,
  MiniGameMeta,
  PriceGuessRound,
  SeenJeemCategory,
  SpeedTriviaRound,
  WhatsInFrameRound,
  SceneDescriptionRound,
} from "@/data/seedQuestions";

export const ENGLISH_MINI_GAMES_META: MiniGameMeta[] = [
  {
    id: "SPEED_TRIVIA",
    number: 1,
    title: "Speed Trivia",
    subtitle: "4 options on your phone — fastest correct finger takes the crown!",
    badge: "Speed & Reflex",
    color: "#3B66B4",
    icon: "Zap",
    defaultDurationSec: 30,
    howToPlay:
      "Pick the right option out of 4 on your phone! Fastest correct answer wins 500 pts, 2nd gets 350 pts, 3rd gets 250 pts.",
  },
  {
    id: "QUICK_REFLEX",
    number: 2,
    title: "Quick Wit",
    subtitle: "Read the visual trap carefully and tap the right shape before anyone else!",
    badge: "Brain & Focus",
    color: "#F4D03F",
    icon: "Brain",
    defaultDurationSec: 25,
    howToPlay:
      "A 6-shape grid appears on your phone. Follow the rule at the top and don't fall for the color/text trap!",
  },
  {
    id: "PRICE_GUESS",
    number: 3,
    title: "Price Check",
    subtitle: "Guess the real retail price in USD ($) without going way off!",
    badge: "Market Sense",
    color: "#2ECC71",
    icon: "BadgeDollarSign",
    defaultDurationSec: 40,
    howToPlay:
      "Type your best guess for the retail price in USD ($). Closest guess to the real tag wins 500 pts!",
  },
  {
    id: "WHATS_IN_FRAME",
    number: 4,
    title: "Zoomed In",
    subtitle: "Identify the famous landmark, movie scene, or historical icon in the frame!",
    badge: "Visual Trivia",
    color: "#E65C2E",
    icon: "ScanSearch",
    defaultDurationSec: 40,
    howToPlay:
      "Inspect the framed scene on the TV and type the name of the landmark or event on your phone.",
  },
  {
    id: "CLOSEST_NUMBER",
    number: 5,
    title: "Closest Wins",
    subtitle: "No one knows the exact number — whoever gets closest takes the pot!",
    badge: "Wild Estimation",
    color: "#DE7A7A",
    icon: "Hash",
    defaultDurationSec: 35,
    howToPlay:
      "Enter a number on your phone. The system calculates `|guess - actual|` and ranks everyone automatically.",
  },
  {
    id: "DRAWING_CHALLENGE",
    number: 6,
    title: "Sketch It",
    subtitle: "One player sketches live on their phone while everyone else races to guess!",
    badge: "Live Canvas",
    color: "#F4D03F",
    icon: "Palette",
    defaultDurationSec: 60,
    howToPlay:
      "The artist draws the secret prompt on their phone, streaming live to the TV while players type their guesses.",
  },
  {
    id: "MAP_PIN",
    number: 7,
    title: "Drop the Pin",
    subtitle: "Drop your pin on the real world map — closest distance in km wins!",
    badge: "World Map",
    color: "#3B66B4",
    icon: "MapPin",
    defaultDurationSec: 40,
    howToPlay:
      "Tap the interactive world map on your phone to drop your pin. Haversine distance in km decides the winner!",
  },
  {
    id: "SCENE_DESCRIPTION",
    number: 8,
    title: "Eagle Eye",
    subtitle: "Spot as many hidden details, colors, and objects in the photo as you can!",
    badge: "Photo Details",
    color: "#2ECC71",
    icon: "FileText",
    defaultDurationSec: 50,
    howToPlay:
      "Study the busy photograph and type a description listing every object, color, and detail you spot!",
  },
];

export const ENGLISH_SEEN_JEEM_CATEGORIES: SeenJeemCategory[] = [
  // ==========================================================================
  // 1. Pop Culture & Cinema
  // ==========================================================================
  {
    id: "en-pop-cinema",
    title: "Pop Culture & Cinema",
    subtitle: "Blockbusters, Oscars, streaming hits, and iconic characters",
    icon: "Clapperboard",
    color: "#9333EA",
    questions: [
      {
        id: "en-pop-200-1",
        categoryId: "en-pop-cinema",
        points: 200,
        slotIndex: 0,
        question:
          "Which 2023 Christopher Nolan biographical thriller swept 7 Oscars in 2024, including Best Picture and Best Actor for Cillian Murphy?",
        hint: "Named after the father of the atomic bomb",
        displayAnswer: "Oppenheimer",
        acceptedAnswers: ["Oppenheimer", "J. Robert Oppenheimer"],
        acceptedSynonyms: ["Oppenheimer"],
        rejectedTraps: ["Barbie", "Interstellar", "Tenet", "Dunkirk"],
        funFact:
          "Oppenheimer grossed nearly $1 billion worldwide and won 7 Academy Awards at the 96th Oscars.",
      },
      {
        id: "en-pop-200-2",
        categoryId: "en-pop-cinema",
        points: 200,
        slotIndex: 1,
        question:
          "In Netflix's hit series «Stranger Things», what is the name of the terrifying parallel dimension inhabited by the Demogorgon and Vecna?",
        hint: "It's literally flipped...",
        displayAnswer: "The Upside Down",
        acceptedAnswers: ["The Upside Down", "Upside Down"],
        acceptedSynonyms: ["The Upside Down", "Upside Down"],
        rejectedTraps: ["The Nether", "The Shadow Realm", "Hawkins Lab"],
        funFact:
          "Stranger Things wrapped up its fifth and final season as one of Netflix's most-watched English series of all time.",
      },
      {
        id: "en-pop-400-1",
        categoryId: "en-pop-cinema",
        points: 400,
        slotIndex: 2,
        question:
          "📸 Which desert planet serves as the centerpiece of Denis Villeneuve's «Dune» movies and is the only source of the spice Melange?",
        hint: "Paul Atreides leads the Fremen here",
        imageUrl:
          "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=85",
        displayAnswer: "Arrakis (Dune)",
        acceptedAnswers: ["Arrakis", "Dune", "Planet Arrakis"],
        acceptedSynonyms: ["Arrakis", "Dune"],
        rejectedTraps: ["Tatooine", "Caladan", "Jakku", "Krypton"],
        funFact:
          "Many of the sweeping desert scenes in Dune: Part One and Part Two were filmed in Wadi Rum, Jordan and Abu Dhabi.",
      },
      {
        id: "en-pop-400-2",
        categoryId: "en-pop-cinema",
        points: 400,
        slotIndex: 3,
        question:
          "Which animated sequel became the highest-grossing animated film of 2024 by introducing new emotions like Anxiety, Envy, and Embarrassment?",
        hint: "Pixar's sequel set inside Riley's teenage mind",
        displayAnswer: "Inside Out 2",
        acceptedAnswers: ["Inside Out 2", "Inside Out", "Inside Out Two"],
        acceptedSynonyms: ["Inside Out 2", "Inside Out"],
        rejectedTraps: ["Moana 2", "Toy Story 4", "Frozen 2", "Zootopia"],
        funFact:
          "Inside Out 2 crossed $1.69 billion at the global box office, becoming Pixar's biggest hit ever.",
      },
      {
        id: "en-pop-600-1",
        categoryId: "en-pop-cinema",
        points: 600,
        slotIndex: 4,
        question:
          "Which South Korean dark comedy thriller directed by Bong Joon-ho made history in 2020 as the first non-English language film to win the Oscar for Best Picture?",
        hint: "Involves the Kim family infiltrating the wealthy Park household",
        displayAnswer: "Parasite",
        acceptedAnswers: ["Parasite", "Gisaengchung"],
        acceptedSynonyms: ["Parasite"],
        rejectedTraps: ["Squid Game", "Oldboy", "Train to Busan", "Minari"],
        funFact:
          "Parasite won 4 Oscars in a single night: Best Picture, Best Director, Best Original Screenplay, and Best International Feature.",
      },
      {
        id: "en-pop-600-2",
        categoryId: "en-pop-cinema",
        points: 600,
        slotIndex: 5,
        question:
          "What is the fictional corporate conglomerate at the center of HBO's acclaimed drama series «Succession», founded by Logan Roy?",
        hint: "Two-word media and entertainment empire starting with W",
        displayAnswer: "Waystar Royco",
        acceptedAnswers: ["Waystar Royco", "Waystar", "Waystar RoyCo"],
        acceptedSynonyms: ["Waystar Royco", "Waystar"],
        rejectedTraps: ["GoJo", "Pierce Global", "Sterling Cooper", "Massive Dynamic"],
        funFact:
          "Succession won three Emmy Awards for Outstanding Drama Series across its four-season run.",
      },
    ],
  },

  // ==========================================================================
  // 2. World Football & Sports
  // ==========================================================================
  {
    id: "en-football-sports",
    title: "World Football & Sports",
    subtitle: "World Cup 2026, Champions League, NBA, and Olympic legends",
    icon: "Trophy",
    color: "#2ECC71",
    questions: [
      {
        id: "en-sport-200-1",
        categoryId: "en-football-sports",
        points: 200,
        slotIndex: 0,
        question:
          "Which three North American nations jointly hosted the historic 48-team 2026 FIFA World Cup?",
        hint: "North American trio",
        displayAnswer: "USA, Canada, and Mexico",
        acceptedAnswers: [
          "USA, Canada, and Mexico",
          "USA Canada Mexico",
          "United States Canada Mexico",
          "US Mexico Canada",
        ],
        acceptedSynonyms: [
          "USA, Canada, and Mexico",
          "USA Canada Mexico",
          "US Mexico Canada",
        ],
        rejectedTraps: ["Spain Portugal Morocco", "Brazil", "Qatar"],
        funFact:
          "The 2026 FIFA World Cup was the first tournament to feature 48 national teams across 16 host cities.",
      },
      {
        id: "en-sport-200-2",
        categoryId: "en-football-sports",
        points: 200,
        slotIndex: 1,
        question:
          "Which Spanish football giant holds the all-time record with 15+ UEFA Champions League titles?",
        hint: "Los Blancos — plays at the Santiago Bernabéu",
        displayAnswer: "Real Madrid",
        acceptedAnswers: ["Real Madrid", "Madrid", "Real Madrid CF"],
        acceptedSynonyms: ["Real Madrid", "Madrid"],
        rejectedTraps: ["Barcelona", "AC Milan", "Bayern Munich", "Liverpool"],
        funFact:
          "Real Madrid won their 15th Champions League crown at Wembley in 2024 before signing Kylian Mbappé.",
      },
      {
        id: "en-sport-400-1",
        categoryId: "en-football-sports",
        points: 400,
        slotIndex: 2,
        question:
          "Which national team made history at the 2022 World Cup in Qatar by becoming the first African and Arab nation ever to reach the FIFA World Cup Semi-Finals?",
        hint: "Nicknamed the Atlas Lions",
        displayAnswer: "Morocco",
        acceptedAnswers: ["Morocco", "Atlas Lions", "Team Morocco"],
        acceptedSynonyms: ["Morocco", "Atlas Lions"],
        rejectedTraps: ["Senegal", "Egypt", "Ghana", "Nigeria"],
        funFact:
          "Morocco topped a group with Croatia and Belgium, then knocked out Spain and Portugal on their historic run.",
      },
      {
        id: "en-sport-400-2",
        categoryId: "en-football-sports",
        points: 400,
        slotIndex: 3,
        question:
          "Which Manchester City and Spain midfielder won the 2024 Men's Ballon d'Or after winning Euro 2024 and the Premier League?",
        hint: "Defensive midfield maestro",
        displayAnswer: "Rodri (Rodrigo Hernández)",
        acceptedAnswers: ["Rodri", "Rodrigo", "Rodrigo Hernandez"],
        acceptedSynonyms: ["Rodri", "Rodrigo"],
        rejectedTraps: ["Vinicius Jr", "Jude Bellingham", "Erling Haaland"],
        funFact:
          "Rodri became the first defensive midfielder since Lothar Matthäus in 1990 to win the Ballon d'Or.",
      },
      {
        id: "en-sport-600-1",
        categoryId: "en-football-sports",
        points: 600,
        slotIndex: 4,
        question:
          "In Formula 1, which iconic Italian team did seven-time World Champion Lewis Hamilton join for the 2025 & 2026 seasons after leaving Mercedes?",
        hint: "The Prancing Horse from Maranello",
        displayAnswer: "Ferrari (Scuderia Ferrari)",
        acceptedAnswers: ["Ferrari", "Scuderia Ferrari"],
        acceptedSynonyms: ["Ferrari", "Scuderia Ferrari"],
        rejectedTraps: ["Red Bull", "McLaren", "Aston Martin"],
        funFact:
          "Lewis Hamilton partnered with Charles Leclerc at Scuderia Ferrari starting in the 2025 Formula 1 season.",
      },
      {
        id: "en-sport-600-2",
        categoryId: "en-football-sports",
        points: 600,
        slotIndex: 5,
        question:
          "Who broke Kareem Abdul-Jabbar's long-standing record to become the NBA's all-time leading regular-season scorer, surpassing 40,000 career points?",
        hint: "King James",
        displayAnswer: "LeBron James",
        acceptedAnswers: ["LeBron James", "LeBron", "Lebron James"],
        acceptedSynonyms: ["LeBron James", "LeBron"],
        rejectedTraps: ["Stephen Curry", "Michael Jordan", "Kobe Bryant", "Kevin Durant"],
        funFact:
          "LeBron James became the first player in NBA history to cross 40,000 regular-season points in March 2024.",
      },
    ],
  },

  // ==========================================================================
  // 3. Tech & Gaming
  // ==========================================================================
  {
    id: "en-tech-gaming",
    title: "Tech & Gaming",
    subtitle: "GTA VI, Nintendo Switch 2, AI breakthroughs, and gaming lore",
    icon: "Cpu",
    color: "#3B66B4",
    questions: [
      {
        id: "en-tech-200-1",
        categoryId: "en-tech-gaming",
        points: 200,
        slotIndex: 0,
        question:
          "Rockstar Games' «Grand Theft Auto VI» is set in the fictional state of Leonida, which is primarily inspired by which US state and features which iconic neon-lit city?",
        hint: "Home to Tommy Vercetti in 2002",
        displayAnswer: "Vice City (Florida / Miami)",
        acceptedAnswers: ["Vice City", "Florida", "Miami", "Leonida"],
        acceptedSynonyms: ["Vice City", "Florida", "Miami"],
        rejectedTraps: ["Los Santos", "Liberty City", "San Fierro"],
        funFact:
          "The first GTA VI trailer shattered YouTube records with over 90 million views in its first 24 hours.",
      },
      {
        id: "en-tech-200-2",
        categoryId: "en-tech-gaming",
        points: 200,
        slotIndex: 1,
        question:
          "Which company developed ChatGPT and the GPT-4o / o1 reasoning models that sparked the global generative AI boom?",
        hint: "Co-founded by Sam Altman",
        displayAnswer: "OpenAI",
        acceptedAnswers: ["OpenAI", "Open AI"],
        acceptedSynonyms: ["OpenAI", "Open AI"],
        rejectedTraps: ["Anthropic", "DeepMind", "Meta", "Nvidia"],
        funFact:
          "ChatGPT reached 100 million users in just two months after its late-2022 launch, becoming the fastest-growing consumer app in history.",
      },
      {
        id: "en-tech-400-1",
        categoryId: "en-tech-gaming",
        points: 400,
        slotIndex: 2,
        question:
          "Which semiconductor giant led by CEO Jensen Huang became a $3+ trillion company thanks to its H100 and Blackwell GPUs powering AI data centers?",
        hint: "Famous for GeForce RTX graphics cards",
        displayAnswer: "NVIDIA",
        acceptedAnswers: ["NVIDIA", "Nvidia"],
        acceptedSynonyms: ["NVIDIA", "Nvidia"],
        rejectedTraps: ["AMD", "Intel", "TSMC", "Qualcomm"],
        funFact:
          "Founded in 1993 at a Denny's diner in San Jose, NVIDIA briefly became the world's most valuable public company in 2024–2026.",
      },
      {
        id: "en-tech-400-2",
        categoryId: "en-tech-gaming",
        points: 400,
        slotIndex: 3,
        question:
          "Which RPG developed by Larian Studios and set in the Dungeons & Dragons universe swept every major Game of the Year award in 2023?",
        hint: "Features Astarion, Shadowheart, and Mind Flayers",
        displayAnswer: "Baldur's Gate 3",
        acceptedAnswers: ["Baldur's Gate 3", "Baldurs Gate 3", "BG3", "Baldur's Gate III"],
        acceptedSynonyms: ["Baldur's Gate 3", "Baldurs Gate 3", "BG3"],
        rejectedTraps: ["Elden Ring", "Starfield", "Diablo IV", "Zelda Tears of the Kingdom"],
        funFact:
          "Baldur's Gate 3 became the first game in history to win Game of the Year at all five major video game award ceremonies.",
      },
      {
        id: "en-tech-600-1",
        categoryId: "en-tech-gaming",
        points: 600,
        slotIndex: 4,
        question:
          "In «Elden Ring», what is the name of the undefeated, scarlet-rot-wielding demigod boss who famously declares: «I am ____, Blade of Miquella»?",
        hint: "Widely considered FromSoftware's hardest optional boss",
        displayAnswer: "Malenia",
        acceptedAnswers: ["Malenia", "Malenia Blade of Miquella"],
        acceptedSynonyms: ["Malenia"],
        rejectedTraps: ["Radahn", "Marika", "Ranni", "Messmer"],
        funFact:
          "Players attempted Malenia over 300 million times in Elden Ring's first year alone, inspiring community legend 'Let Me Solo Her'.",
      },
      {
        id: "en-tech-600-2",
        categoryId: "en-tech-gaming",
        points: 600,
        slotIndex: 5,
        question:
          "What does the acronym «HTTP» stand for at the start of web URLs?",
        hint: "Invented by Tim Berners-Lee at CERN",
        displayAnswer: "HyperText Transfer Protocol",
        acceptedAnswers: [
          "HyperText Transfer Protocol",
          "Hypertext Transfer Protocol",
        ],
        acceptedSynonyms: ["HyperText Transfer Protocol", "Hypertext Transfer Protocol"],
        rejectedTraps: ["HyperText Transmission Program", "High Tech Transfer Protocol"],
        funFact:
          "Tim Berners-Lee published the first HTTP specification in 1991 to link hypertext documents across the World Wide Web.",
      },
    ],
  },

  // ==========================================================================
  // 4. Geography & Landmarks (Includes Photo Questions)
  // ==========================================================================
  {
    id: "en-geo-landmarks",
    title: "Geography & Landmarks",
    subtitle: "World capitals, wonders, and iconic skylines",
    icon: "Globe2",
    color: "#E65C2E",
    questions: [
      {
        id: "en-geo-200-1",
        categoryId: "en-geo-landmarks",
        points: 200,
        slotIndex: 0,
        question:
          "📸 Which enchanting mountain town in northern Morocco is pictured here, famous worldwide as the «Blue Pearl»?",
        hint: "Located in the Rif Mountains",
        imageUrl:
          "https://images.unsplash.com/photo-1553899017-90c40dd32533?auto=format&fit=crop&w=1000&q=85",
        displayAnswer: "Chefchaouen",
        acceptedAnswers: ["Chefchaouen", "Chaouen", "The Blue Pearl"],
        acceptedSynonyms: ["Chefchaouen", "Chaouen"],
        rejectedTraps: ["Santorini", "Marrakech", "Fes", "Jodhpur"],
        funFact:
          "Founded in 1471, Chefchaouen's cobalt-blue alleyways make it one of the most photographed destinations on Earth.",
      },
      {
        id: "en-geo-200-2",
        categoryId: "en-geo-landmarks",
        points: 200,
        slotIndex: 1,
        question:
          "What is the official capital city of Australia (not Sydney or Melbourne)?",
        hint: "A planned city in the Australian Capital Territory",
        displayAnswer: "Canberra",
        acceptedAnswers: ["Canberra"],
        acceptedSynonyms: ["Canberra"],
        rejectedTraps: ["Sydney", "Melbourne", "Perth", "Brisbane"],
        funFact:
          "Canberra was chosen in 1908 as a compromise between rivals Sydney and Melbourne.",
      },
      {
        id: "en-geo-400-1",
        categoryId: "en-geo-landmarks",
        points: 400,
        slotIndex: 2,
        question:
          "📸 What is the name of this ancient rose-red city carved directly into sandstone cliffs in southern Jordan?",
        hint: "Features 'Al-Khazneh' (The Treasury)",
        imageUrl:
          "https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=1000&q=85",
        displayAnswer: "Petra",
        acceptedAnswers: ["Petra", "Al-Khazneh", "The Treasury"],
        acceptedSynonyms: ["Petra", "Al-Khazneh"],
        rejectedTraps: ["Luxor", "Giza", "Palmyra", "Machu Picchu"],
        funFact:
          "Petra was the thriving capital of the Nabataean Kingdom around the 4th century BC and is one of the New7Wonders of the World.",
      },
      {
        id: "en-geo-400-2",
        categoryId: "en-geo-landmarks",
        points: 400,
        slotIndex: 3,
        question:
          "Which country has the most natural lakes in the world, containing more than half of all the planet's natural lakes?",
        hint: "Second-largest country by total area",
        displayAnswer: "Canada",
        acceptedAnswers: ["Canada"],
        acceptedSynonyms: ["Canada"],
        rejectedTraps: ["Finland", "Russia", "United States", "Brazil"],
        funFact:
          "Canada is home to over 879,000 lakes larger than 10 hectares — around 62% of the world's lakes!",
      },
      {
        id: "en-geo-600-1",
        categoryId: "en-geo-landmarks",
        points: 600,
        slotIndex: 4,
        question:
          "What was the historic name of Istanbul before the Ottoman conquest by Sultan Mehmed II in 1453?",
        hint: "Named after Roman Emperor Constantine the Great",
        displayAnswer: "Constantinople (Byzantium)",
        acceptedAnswers: ["Constantinople", "Byzantium"],
        acceptedSynonyms: ["Constantinople", "Byzantium"],
        rejectedTraps: ["Constantine", "Ankara", "Antioch", "Troy"],
        funFact:
          "Constantinople served as the capital of the Byzantine Empire for more than a thousand years.",
      },
      {
        id: "en-geo-600-2",
        categoryId: "en-geo-landmarks",
        points: 600,
        slotIndex: 5,
        question:
          "Which South American country is home to the world's highest administrative capital city, sitting at 3,650 meters above sea level?",
        hint: "The city is La Paz (with Sucre as constitutional capital)",
        displayAnswer: "Bolivia (La Paz)",
        acceptedAnswers: ["Bolivia", "La Paz"],
        acceptedSynonyms: ["Bolivia", "La Paz"],
        rejectedTraps: ["Peru", "Ecuador", "Colombia", "Chile"],
        funFact:
          "La Paz uses a massive urban aerial cable car network (Mi Teleférico) as its primary public transit system.",
      },
    ],
  },

  // ==========================================================================
  // 5. Music & Hits
  // ==========================================================================
  {
    id: "en-music-hits",
    title: "Music & Global Hits",
    subtitle: "Record-breaking tours, Grammys, and chart-topping anthems",
    icon: "Puzzle",
    color: "#DE7A7A",
    questions: [
      {
        id: "en-mus-200-1",
        categoryId: "en-music-hits",
        points: 200,
        slotIndex: 0,
        question:
          "Which global pop superstar broke all concert history records with «The Eras Tour», becoming the first tour ever to surpass $2 billion in ticket sales?",
        hint: "Released 'The Tortured Poets Department' in 2024",
        displayAnswer: "Taylor Swift",
        acceptedAnswers: ["Taylor Swift", "Swift"],
        acceptedSynonyms: ["Taylor Swift", "Swift"],
        rejectedTraps: ["Beyoncé", "Adele", "Billie Eilish", "Dua Lipa"],
        funFact:
          "The Eras Tour spanned 149 shows across 5 continents and sold over 10 million tickets.",
      },
      {
        id: "en-mus-200-2",
        categoryId: "en-music-hits",
        points: 200,
        slotIndex: 1,
        question:
          "Which Canadian artist holds the all-time Spotify streaming record for a single song with his 80s synth-wave hit «Blinding Lights»?",
        hint: "Real name Abel Tesfaye",
        displayAnswer: "The Weeknd",
        acceptedAnswers: ["The Weeknd", "Weeknd", "Abel Tesfaye"],
        acceptedSynonyms: ["The Weeknd", "Weeknd"],
        rejectedTraps: ["Drake", "Justin Bieber", "Post Malone", "Bruno Mars"],
        funFact:
          "Blinding Lights became the first song in Spotify history to surpass 4 billion streams.",
      },
      {
        id: "en-mus-400-1",
        categoryId: "en-music-hits",
        points: 400,
        slotIndex: 2,
        question:
          "Which Compton rapper swept 5 Grammy Awards in 2025 including Record of the Year and Song of the Year with the viral track «Not Like Us», before headlining the Super Bowl LIX Halftime Show?",
        hint: "Pulitzer Prize-winning hip-hop icon",
        displayAnswer: "Kendrick Lamar",
        acceptedAnswers: ["Kendrick Lamar", "Kendrick", "K-Dot"],
        acceptedSynonyms: ["Kendrick Lamar", "Kendrick"],
        rejectedTraps: ["Travis Scott", "J. Cole", "Future", "Tyler the Creator"],
        funFact:
          "Kendrick Lamar is the only non-classical, non-jazz musician ever to win the Pulitzer Prize for Music (for his album DAMN.).",
      },
      {
        id: "en-mus-400-2",
        categoryId: "en-music-hits",
        points: 400,
        slotIndex: 3,
        question:
          "Which British rock band teamed up with Queen to write and record the iconic 1981 bassline anthem «Under Pressure»?",
        hint: "Actually a solo legend — Ziggy Stardust!",
        displayAnswer: "David Bowie",
        acceptedAnswers: ["David Bowie", "Bowie"],
        acceptedSynonyms: ["David Bowie", "Bowie"],
        rejectedTraps: ["Elton John", "Paul McCartney", "Mick Jagger", "Phil Collins"],
        funFact:
          "Under Pressure was born from an impromptu 24-hour jam session between Queen and David Bowie in Montreux, Switzerland.",
      },
      {
        id: "en-mus-600-1",
        categoryId: "en-music-hits",
        points: 600,
        slotIndex: 4,
        question:
          "Which French electronic duo wore iconic robot helmets and released the Grammy-winning 2013 album «Random Access Memories» featuring 'Get Lucky'?",
        hint: "Thomas Bangalter and Guy-Manuel de Homem-Christo",
        displayAnswer: "Daft Punk",
        acceptedAnswers: ["Daft Punk"],
        acceptedSynonyms: ["Daft Punk"],
        rejectedTraps: ["Justice", "Disclosure", "Swedish House Mafia", "Kraftwerk"],
        funFact:
          "Daft Punk officially retired in February 2021 after 28 years together with an 8-minute video titled 'Epilogue'.",
      },
      {
        id: "en-mus-600-2",
        categoryId: "en-music-hits",
        points: 600,
        slotIndex: 5,
        question:
          "What remains the best-selling studio album of all time globally, released in 1982 and produced by Quincy Jones?",
        hint: "Includes 'Billie Jean' and 'Beat It'",
        displayAnswer: "Thriller (Michael Jackson)",
        acceptedAnswers: ["Thriller", "Michael Jackson Thriller"],
        acceptedSynonyms: ["Thriller"],
        rejectedTraps: ["Back in Black", "The Dark Side of the Moon", "Bad"],
        funFact:
          "Michael Jackson's Thriller has sold an estimated 70 million copies worldwide and won a record 8 Grammy Awards in 1984.",
      },
    ],
  },

  // ==========================================================================
  // 6. Science & Weird Facts
  // ==========================================================================
  {
    id: "en-science-weird",
    title: "Science & Weird Facts",
    subtitle: "Space, human body, nature, and mind-blowing trivia",
    icon: "Atom",
    color: "#F4D03F",
    questions: [
      {
        id: "en-sci-200-1",
        categoryId: "en-science-weird",
        points: 200,
        slotIndex: 0,
        question:
          "How many hearts does an octopus have to pump its blue, copper-rich blood?",
        hint: "More than one, fewer than five",
        displayAnswer: "3 hearts (Three)",
        acceptedAnswers: ["3", "Three", "3 hearts", "Three hearts"],
        acceptedSynonyms: ["3", "Three", "3 hearts"],
        rejectedTraps: ["1", "2", "4", "8"],
        funFact:
          "Two branchial hearts pump blood through the gills, while the third systemic heart pumps it through the rest of the body.",
      },
      {
        id: "en-sci-200-2",
        categoryId: "en-science-weird",
        points: 200,
        slotIndex: 1,
        question:
          "Which chemical element has the symbol «Au» on the periodic table?",
        hint: "From the Latin word 'Aurum'",
        displayAnswer: "Gold",
        acceptedAnswers: ["Gold", "Aurum"],
        acceptedSynonyms: ["Gold"],
        rejectedTraps: ["Silver", "Aluminum", "Argon", "Copper"],
        funFact:
          "Gold is so malleable that a single ounce of it can be beaten into a translucent sheet covering 100 square feet.",
      },
      {
        id: "en-sci-400-1",
        categoryId: "en-science-weird",
        points: 400,
        slotIndex: 2,
        question:
          "Which planet in our Solar System spins backwards (retrograde rotation), meaning a day on this planet is longer than its entire year around the Sun?",
        hint: "Second planet from the Sun and the hottest in our Solar System",
        displayAnswer: "Venus",
        acceptedAnswers: ["Venus"],
        acceptedSynonyms: ["Venus"],
        rejectedTraps: ["Mercury", "Mars", "Jupiter", "Neptune"],
        funFact:
          "Venus takes 243 Earth days to rotate once on its axis, but only 225 Earth days to complete a full orbit around the Sun!",
      },
      {
        id: "en-sci-400-2",
        categoryId: "en-science-weird",
        points: 400,
        slotIndex: 3,
        question:
          "What is the powerhouse organelle inside eukaryotic cells responsible for generating most of the cell's ATP energy?",
        hint: "Everyone's favorite biology meme!",
        displayAnswer: "Mitochondria (Mitochondrion)",
        acceptedAnswers: ["Mitochondria", "Mitochondrion"],
        acceptedSynonyms: ["Mitochondria", "Mitochondrion"],
        rejectedTraps: ["Nucleus", "Ribosome", "Chloroplast", "Golgi apparatus"],
        funFact:
          "Mitochondria actually carry their own distinct DNA inherited exclusively from the mother.",
      },
      {
        id: "en-sci-600-1",
        categoryId: "en-science-weird",
        points: 600,
        slotIndex: 4,
        question:
          "Which deep-space observatory launched on Christmas Day 2021 orbits the Sun-Earth L2 point and captures infrared images of the earliest galaxies?",
        hint: "Successor to the Hubble Space Telescope",
        displayAnswer: "James Webb Space Telescope (JWST)",
        acceptedAnswers: [
          "James Webb Space Telescope",
          "James Webb",
          "JWST",
          "Webb Telescope",
        ],
        acceptedSynonyms: ["James Webb Space Telescope", "James Webb", "JWST"],
        rejectedTraps: ["Hubble", "Kepler", "Chandra", "Voyager"],
        funFact:
          "JWST's primary mirror consists of 18 hexagonal gold-coated beryllium segments spanning 6.5 meters across.",
      },
      {
        id: "en-sci-600-2",
        categoryId: "en-science-weird",
        points: 600,
        slotIndex: 5,
        question:
          "What is the only mammal capable of true, sustained powered flight (not just gliding)?",
        hint: "Uses echolocation in the dark",
        displayAnswer: "Bat (Bats)",
        acceptedAnswers: ["Bat", "Bats"],
        acceptedSynonyms: ["Bat", "Bats"],
        rejectedTraps: ["Flying Squirrel", "Sugar Glider", "Ostrich"],
        funFact:
          "Bats make up roughly 20% of all classified mammal species on Earth, with over 1,400 known species.",
      },
    ],
  },
];

export const ENGLISH_SPEED_TRIVIA_ROUNDS: SpeedTriviaRound[] = [
  {
    id: "en-st-1",
    question: "Which planet in our Solar System has the most confirmed moons (over 140)?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctIndex: 1,
    explanation: "Saturn overtook Jupiter with over 146 officially recognized moons!",
  },
  {
    id: "en-st-2",
    question: "What is the rarest naturally occurring blood type in humans?",
    options: ["O Negative", "AB Negative", "B Negative", "A Positive"],
    correctIndex: 1,
    explanation: "AB Negative is found in less than 1% of the global population.",
  },
  {
    id: "en-st-3",
    question: "Which video game franchise holds the record as the best-selling single video game of all time (300M+ copies)?",
    options: ["Grand Theft Auto V", "Minecraft", "Tetris (EA)", "Mario Kart 8"],
    correctIndex: 1,
    explanation: "Minecraft has sold over 300 million copies across all platforms.",
  },
  {
    id: "en-st-4",
    question: "In which city would you find the iconic Colosseum and the Pantheon?",
    options: ["Athens", "Rome", "Milan", "Florence"],
    correctIndex: 1,
    explanation: "Both ancient architectural wonders stand in the heart of Rome, Italy.",
  },
  {
    id: "en-st-5",
    question: "Which country won the 2022 FIFA World Cup final in Lusail after a thrilling 3-3 draw and penalties?",
    options: ["France", "Brazil", "Argentina", "Morocco"],
    correctIndex: 2,
    explanation: "Lionel Messi led Argentina past France 4-2 on penalties after a 3-3 classic.",
  },
  {
    id: "en-st-6",
    question: "What is the hardest naturally occurring substance found on Earth?",
    options: ["Titanium", "Diamond", "Graphene", "Tungsten"],
    correctIndex: 1,
    explanation: "Diamond ranks 10 on the Mohs hardness scale.",
  },
];

export const ENGLISH_PRICE_GUESS_ROUNDS: PriceGuessRound[] = [
  {
    id: "en-pg-1",
    productName: "Sony PlayStation 5 Pro Console (2TB SSD All-Digital Edition)",
    brand: "Sony PlayStation",
    categoryBadge: "Gaming Console • US Retail MSRP",
    specs: "2TB Ultra-Fast SSD • PSSR AI Upscaling • Advanced Ray Tracing • Wi-Fi 7 Ready",
    actualPriceSar: 699,
    actualPriceDh: 699,
    currencyLabel: "USD ($)",
    imageUrl:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=85",
    illustrationType: "ps5_pro",
    funFact:
      "Sony launched the PlayStation 5 Pro at an official US retail price of $699.99.",
  },
  {
    id: "en-pg-2",
    productName: "Apple iPhone 17 Pro (256GB Unlocked Titanium Edition)",
    brand: "Apple",
    categoryBadge: "Flagship Smartphone • US Apple Store",
    specs: "256GB Base Storage • ProMotion 120Hz Display • 48MP Triple Camera System",
    actualPriceSar: 1099,
    actualPriceDh: 1099,
    currencyLabel: "USD ($)",
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85",
    illustrationType: "iphone_17_pro",
    funFact:
      "The 256GB Pro model retails at $1,099 USD unlocked at Apple Stores.",
  },
  {
    id: "en-pg-3",
    productName: "Nintendo Switch 2 Console (Standard Retail Bundle)",
    brand: "Nintendo",
    categoryBadge: "Next-Gen Handheld • Official MSRP",
    specs: "8-inch 1080p Display • Magnetic Joy-Con 2 Controllers • 4K Docked Output • 256GB Storage",
    actualPriceSar: 449,
    actualPriceDh: 449,
    currencyLabel: "USD ($)",
    imageUrl:
      "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=900&q=85",
    illustrationType: "nintendo_switch_2",
    funFact:
      "Nintendo priced the Switch 2 console at $449 USD ($499 with the Mario Kart World bundle).",
  },
  {
    id: "en-pg-4",
    productName: "Apple AirPods Pro 2 with MagSafe Charging Case (USB-C)",
    brand: "Apple Audio",
    categoryBadge: "Wireless Audio • Noise Cancelling",
    specs: "2x Active Noise Cancellation • H2 Chip • Adaptive Audio & Conversation Awareness",
    actualPriceSar: 249,
    actualPriceDh: 249,
    currencyLabel: "USD ($)",
    imageUrl:
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=900&q=85",
    illustrationType: "airpods_pro_2",
    funFact:
      "Apple's official US retail price for AirPods Pro 2 with USB-C MagSafe case is $249.",
  },
  {
    id: "en-pg-5",
    productName: "Dyson Airwrap Multi-Styler Complete Long",
    brand: "Dyson",
    categoryBadge: "Premium Hair Care • Complete Set",
    specs: "6 Coanda Airflow Attachments • Digital V9 Motor • Intelligent Heat Control",
    actualPriceSar: 599,
    actualPriceDh: 599,
    currencyLabel: "USD ($)",
    imageUrl:
      "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=900&q=85",
    illustrationType: "dyson",
    funFact:
      "The Dyson Airwrap Complete Long retails officially at $599.99 USD.",
  },
];

export const ENGLISH_CLOSEST_NUMBER_ROUNDS: ClosestNumberRound[] = [
  {
    id: "en-cn-1",
    question: "How many keys (white and black combined) are on a standard full-size acoustic piano?",
    unitLabel: "keys",
    correctNumber: 88,
    hintRange: "Between 50 and 120 keys",
    funFact: "A standard piano has 88 keys: 52 white keys and 36 black keys.",
  },
  {
    id: "en-cn-2",
    question: "How many total meters tall is the Burj Khalifa in Dubai (the tallest building on Earth)?",
    unitLabel: "meters",
    correctNumber: 828,
    hintRange: "Between 500 and 1,200 meters",
    funFact: "Burj Khalifa stands 828 meters (2,717 feet) tall with over 160 stories.",
  },
  {
    id: "en-cn-3",
    question: "How many bones are in the adult human body?",
    unitLabel: "bones",
    correctNumber: 206,
    hintRange: "Between 120 and 320 bones",
    funFact: "Babies are born with around 270 bones, several of which fuse together into 206 by adulthood.",
  },
  {
    id: "en-cn-4",
    question: "How many sovereign member states are in the United Nations from the continent of Africa?",
    unitLabel: "countries",
    correctNumber: 54,
    hintRange: "Between 30 and 80 countries",
    funFact: "Africa has 54 recognized sovereign nations — more than any other continent!",
  },
];

export const ENGLISH_DRAWING_CHALLENGE_ROUNDS: DrawingChallengeRound[] = [
  {
    id: "en-dc-1",
    secretWord: "Astronaut Riding a Skateboard",
    categoryHint: "Space & Action",
    acceptedAnswers: [
      "Astronaut riding a skateboard",
      "Astronaut skateboard",
      "Astronaut",
      "Space skateboard",
    ],
    difficultyPoints: 400,
  },
  {
    id: "en-dc-2",
    secretWord: "Octopus Playing Drums",
    categoryHint: "Ocean Musician",
    acceptedAnswers: [
      "Octopus playing drums",
      "Octopus drums",
      "Octopus",
      "Drumming octopus",
    ],
    difficultyPoints: 450,
  },
  {
    id: "en-dc-3",
    secretWord: "Camel Wearing Sunglasses",
    categoryHint: "Cool Desert Animal",
    acceptedAnswers: [
      "Camel wearing sunglasses",
      "Camel with sunglasses",
      "Cool camel",
      "Camel",
    ],
    difficultyPoints: 400,
  },
  {
    id: "en-dc-4",
    secretWord: "Flying Car with Balloons",
    categoryHint: "Sky Vehicle",
    acceptedAnswers: [
      "Flying car with balloons",
      "Car with balloons",
      "Flying car",
      "Balloon car",
    ],
    difficultyPoints: 450,
  },
];

export const ENGLISH_MAP_PIN_ROUNDS: MapPinRound[] = [
  {
    id: "en-mp-1",
    prompt: "Where is «Switzerland» on the world map? Drop your pin right in the heart of the Alps!",
    placeName: "Switzerland (Bern / Zurich)",
    regionHint: "Central Europe — just north of Italy",
    targetLat: 46.8182,
    targetLng: 8.2275,
    funFact: "Landlocked in central Europe, Switzerland borders France, Germany, Italy, Austria, and Liechtenstein.",
  },
  {
    id: "en-mp-2",
    prompt: "Where is the ancient rose-red city of «Petra» located? Drop your pin as close as possible!",
    placeName: "Petra, Jordan",
    regionHint: "Levant / Middle East — east of the Red Sea",
    targetLat: 30.3285,
    targetLng: 35.4444,
    funFact: "Petra sits in southern Jordan between the Dead Sea and the Gulf of Aqaba.",
  },
  {
    id: "en-mp-3",
    prompt: "Where is Japan's capital city «Tokyo» located on the map?",
    placeName: "Tokyo, Japan",
    regionHint: "East Asia — Pacific coast of Honshu Island",
    targetLat: 35.6762,
    targetLng: 139.6503,
    funFact: "Tokyo sits on the eastern coast of Honshu, the largest island of the Japanese archipelago.",
  },
  {
    id: "en-mp-4",
    prompt: "Where is the «Strait of Gibraltar» separating Morocco (Africa) and Spain (Europe)?",
    placeName: "Strait of Gibraltar",
    regionHint: "Western entrance to the Mediterranean Sea",
    targetLat: 35.9667,
    targetLng: -5.5,
    funFact: "At its narrowest point, the Strait of Gibraltar is only 14.3 km (8.9 miles) wide!",
  },
  {
    id: "en-mp-5",
    prompt: "Where is the island nation of «Madagascar»?",
    placeName: "Madagascar",
    regionHint: "Indian Ocean — off the southeastern coast of Africa",
    targetLat: -18.7669,
    targetLng: 46.8691,
    funFact: "Madagascar is the fourth-largest island in the world and home to wild lemurs.",
  },
];

export const ENGLISH_WHATS_IN_FRAME_ROUNDS: WhatsInFrameRound[] = [
  {
    id: "en-wif-1",
    prompt: "What is the name of this majestic white marble mausoleum in Agra, India?",
    clue: "Commissioned by Mughal Emperor Shah Jahan",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "taj_mahal",
    displayAnswer: "Taj Mahal",
    acceptedAnswers: ["Taj Mahal", "The Taj Mahal"],
    acceptedSynonyms: ["Taj Mahal", "The Taj Mahal"],
    rejectedTraps: ["Red Fort", "Alhambra", "Blue Mosque"],
    funFact: "Over 20,000 artisans worked for 20 years to complete the Taj Mahal in 1653.",
  },
  {
    id: "en-wif-2",
    prompt: "Which enchanting mountain city in northern Morocco is known globally as the 'Blue Pearl'?",
    clue: "Famous for its cobblestone alleys washed in shades of vivid blue",
    imageUrl: "https://images.unsplash.com/photo-1553899017-90c40dd32533?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "chefchaouen",
    displayAnswer: "Chefchaouen (The Blue Pearl)",
    acceptedAnswers: ["Chefchaouen", "Chaouen", "The Blue Pearl"],
    acceptedSynonyms: ["Chefchaouen", "Chaouen"],
    rejectedTraps: ["Tetouan", "Tangier", "Asilah"],
    funFact: "Founded in 1471, Chefchaouen was painted blue by Sephardic Jewish refugees to mirror the sky and heaven.",
  },
  {
    id: "en-wif-3",
    prompt: "Which monumental mosque on the Atlantic coastline features a 210-meter minaret and a retractable roof?",
    clue: "Located in Casablanca, Morocco",
    imageUrl: "https://images.unsplash.com/photo-1577147443647-81856d5151af?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "hassan_ii",
    displayAnswer: "Hassan II Mosque (Casablanca)",
    acceptedAnswers: ["Hassan II Mosque", "Hassan 2 Mosque", "Hassan II"],
    acceptedSynonyms: ["Hassan II Mosque", "Hassan 2 Mosque"],
    rejectedTraps: ["Koutoubia Mosque", "Hassan Tower", "Al-Qarawiyyin"],
    funFact: "Its minaret is topped by a nighttime laser pointing 30 km directly toward Mecca.",
  },
  {
    id: "en-wif-4",
    prompt: "What is the name of these ancient monumental tombs on the Giza Plateau in Egypt?",
    clue: "Khufu, Khafre, and Menkaure",
    imageUrl: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "pyramids",
    displayAnswer: "Pyramids of Giza (Egypt)",
    acceptedAnswers: ["Pyramids of Giza", "The Pyramids", "Giza Pyramids", "Great Pyramid"],
    acceptedSynonyms: ["Pyramids of Giza", "The Pyramids", "Giza Pyramids"],
    rejectedTraps: ["The Sphinx", "Valley of the Kings", "Saqqara"],
    funFact: "The Great Pyramid of Giza is the oldest and only surviving monument of the original Seven Wonders of the Ancient World.",
  },
  {
    id: "en-wif-5",
    prompt: "What is the name of this 330-meter wrought-iron lattice tower on the Champ de Mars in Paris?",
    clue: "Completed for the 1889 World's Fair by Gustave Eiffel",
    imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "eiffel_tower",
    displayAnswer: "Eiffel Tower (Paris)",
    acceptedAnswers: ["Eiffel Tower", "The Eiffel Tower"],
    acceptedSynonyms: ["Eiffel Tower", "The Eiffel Tower"],
    rejectedTraps: ["Arc de Triomphe", "Louvre", "Leaning Tower of Pisa"],
    funFact: "The tower expands up to 15 cm during the summer heat due to thermal expansion of the iron.",
  },
  {
    id: "en-wif-6",
    prompt: "What is the name of this iconic amphitheatre in Rome, the largest ever built in antiquity?",
    clue: "Staged gladiatorial contests and public spectacles",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "colosseum",
    displayAnswer: "The Colosseum (Rome)",
    acceptedAnswers: ["Colosseum", "The Colosseum", "Flavian Amphitheatre"],
    acceptedSynonyms: ["Colosseum", "The Colosseum"],
    rejectedTraps: ["Pantheon", "Roman Forum", "Circus Maximus"],
    funFact: "The Colosseum could hold an estimated 50,000 to 80,000 spectators and featured underground animal elevators.",
  },
  {
    id: "en-wif-7",
    prompt: "What is the name of the world's tallest building and skyscraper standing at 828 meters?",
    clue: "Located in Downtown Dubai, UAE",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "burj_khalifa",
    displayAnswer: "Burj Khalifa (Dubai)",
    acceptedAnswers: ["Burj Khalifa", "Burj Dubai"],
    acceptedSynonyms: ["Burj Khalifa", "Burj Dubai"],
    rejectedTraps: ["Burj Al Arab", "Shanghai Tower", "Kingdom Tower"],
    funFact: "You can watch the sunset from the ground, take the high-speed elevator up, and watch the sunset a second time!",
  },
  {
    id: "en-wif-8",
    prompt: "What is the name of this rose-red ancient city carved directly into sandstone cliffs in Jordan?",
    clue: "Nabataean capital featuring Al-Khazneh (The Treasury)",
    imageUrl: "https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "petra",
    displayAnswer: "Petra (The Treasury)",
    acceptedAnswers: ["Petra", "Al-Khazneh", "The Treasury"],
    acceptedSynonyms: ["Petra", "Al-Khazneh", "The Treasury"],
    rejectedTraps: ["Luxor", "Giza", "Machu Picchu"],
    funFact: "Al-Khazneh's facade in Petra is 40 meters high and carved out of solid pink sandstone.",
  },
];

export const ENGLISH_SCENE_DESCRIPTION_ROUNDS: SceneDescriptionRound[] = [
  {
    id: "en-sd-1",
    title: "The Bustling Moroccan Souk & Lantern Bazaar",
    prompt: "Spot as many details as you can! Describe the objects, colors, lighting, and clothing in this photo.",
    imageUrl:
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=1100&q=85",
    sceneArtworkId: "desert_camp",
    modelDescription:
      "A busy traditional souk alleyway with glowing brass and stained-glass hanging lanterns, painted ceramic plates and tagines, colorful spice cones, woven rugs, stone arches, and a shopkeeper in a traditional robe.",
    tags: [
      { id: "t1", label: "Hanging Brass Lanterns / Lamps", aliases: ["lantern", "lanterns", "lamps", "lights", "chandelier"], points: 80 },
      { id: "t2", label: "Ceramic Plates & Tagines", aliases: ["plates", "ceramics", "pottery", "tagine", "bowls", "dishes"], points: 80 },
      { id: "t3", label: "Colorful Spices", aliases: ["spices", "herbs", "powders", "cones"], points: 80 },
      { id: "t4", label: "Woven Rugs / Carpets", aliases: ["rug", "rugs", "carpet", "carpets", "textiles"], points: 70 },
      { id: "t5", label: "Stone Arches & Alleyway", aliases: ["arch", "arches", "alley", "market", "bazaar", "souk"], points: 70 },
      { id: "t6", label: "Shopkeeper / Shoppers", aliases: ["merchant", "shopkeeper", "man", "people", "vendor"], points: 60 },
      { id: "t7", label: "Traditional Robe / Jellaba", aliases: ["robe", "jellaba", "hood", "clothing"], points: 70 },
      { id: "t8", label: "Brass Teapots & Trays", aliases: ["brass", "teapot", "tray", "silver", "copper"], points: 70 },
      { id: "t9", label: "Warm Colors (Red, Gold, Blue)", aliases: ["red", "gold", "yellow", "blue", "colorful"], points: 60 },
    ],
  },
  {
    id: "en-sd-2",
    title: "The Wood-Fired Neapolitan Pizzeria",
    prompt: "Describe every detail you spot! What is the chef wearing and what ingredients are on the counter?",
    imageUrl:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1100&q=85",
    sceneArtworkId: "pizza_chef",
    modelDescription:
      "An Italian chef in a white hat and apron stretching pizza dough in front of a glowing brick wood-fired oven, surrounded by red tomatoes, mozzarella cheese, green basil leaves, flour, and olive oil on a wooden counter.",
    tags: [
      { id: "t1", label: "Chef in Apron", aliases: ["chef", "cook", "baker", "apron"], points: 80 },
      { id: "t2", label: "Pizza Dough & Flour", aliases: ["pizza", "dough", "flour", "crust"], points: 80 },
      { id: "t3", label: "Brick Oven & Flames", aliases: ["oven", "fire", "flames", "brick"], points: 80 },
      { id: "t4", label: "Red Tomatoes / Sauce", aliases: ["tomato", "tomatoes", "sauce", "red"], points: 70 },
      { id: "t5", label: "Mozzarella Cheese", aliases: ["cheese", "mozzarella", "dairy"], points: 70 },
      { id: "t6", label: "Green Basil Leaves", aliases: ["basil", "leaves", "herbs", "green"], points: 70 },
      { id: "t7", label: "White Chef Hat", aliases: ["hat", "cap", "white"], points: 60 },
      { id: "t8", label: "Wooden Table / Peel", aliases: ["wood", "wooden", "table", "counter", "peel"], points: 60 },
    ],
  },
  {
    id: "en-sd-3",
    title: "Ultimate RGB Streamer & Gaming Battlestation",
    prompt: "List every piece of hardware, color, and accessory visible in this gaming setup!",
    imageUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1100&q=85",
    sceneArtworkId: "cyber_camel",
    modelDescription:
      "A pro gaming desk featuring dual curved monitors, an RGB mechanical keyboard, wireless headset, boom-arm microphone, gaming chair, glass PC tower with glowing fans, and neon purple/blue LED lighting.",
    tags: [
      { id: "t1", label: "Dual / Ultrawide Monitors", aliases: ["monitor", "monitors", "screen", "screens", "display"], points: 80 },
      { id: "t2", label: "RGB Mechanical Keyboard", aliases: ["keyboard", "keys", "mechanical"], points: 80 },
      { id: "t3", label: "Gaming Headset / Headphones", aliases: ["headset", "headphones", "audio"], points: 70 },
      { id: "t4", label: "Neon Purple & Blue RGB Lights", aliases: ["neon", "rgb", "purple", "blue", "pink", "led"], points: 80 },
      { id: "t5", label: "Racing Gaming Chair", aliases: ["chair", "seat"], points: 70 },
      { id: "t6", label: "Gaming Mouse & Desk Mat", aliases: ["mouse", "mousepad", "mat"], points: 60 },
      { id: "t7", label: "Glass PC Case & Cooling Fans", aliases: ["pc", "computer", "tower", "case", "fans"], points: 70 },
      { id: "t8", label: "Controller / Streaming Mic", aliases: ["controller", "mic", "microphone", "gamepad"], points: 70 },
    ],
  },
  {
    id: "en-sd-4",
    title: "Authentic Moroccan Living Room & Tea Ceremony",
    prompt: "Spot every traditional element in this cozy Moroccan living room! (10 items)",
    imageUrl:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "moroccan_living_room",
    modelDescription:
      "A warm traditional Moroccan salon featuring plush embroidered cushions on banquettes, an engraved wooden coffee table with a silver Fez teapot, circular brass tray, colorful tea glasses, hanging pierced brass lanterns, handcrafted zellige tilework, and a Berber rug.",
    tags: [
      { id: "t1", label: "Silver Engraved Teapot", aliases: ["teapot", "tea pot", "kettle", "atay", "pot"], points: 80 },
      { id: "t2", label: "Circular Brass / Silver Tray", aliases: ["tray", "platter", "silver tray"], points: 80 },
      { id: "t3", label: "Colorful Tea Glasses", aliases: ["glass", "glasses", "cups", "tea cups"], points: 80 },
      { id: "t4", label: "Hanging Pierced Brass Lanterns", aliases: ["lantern", "lanterns", "lamp", "chandelier"], points: 80 },
      { id: "t5", label: "Embroidered Velvet Cushions", aliases: ["cushion", "cushions", "pillows", "pillow"], points: 70 },
      { id: "t6", label: "Zellige Geometric Mosaic Tiles", aliases: ["tiles", "mosaic", "zellige", "patterns"], points: 70 },
      { id: "t7", label: "Carved Wooden Coffee Table", aliases: ["table", "coffee table", "wood table"], points: 70 },
      { id: "t8", label: "Woven Berber Rug", aliases: ["rug", "carpet", "mat", "textile"], points: 70 },
      { id: "t9", label: "Moorish Horseshoe Arches", aliases: ["arch", "arches", "doorway", "alcove"], points: 60 },
      { id: "t10", label: "Warm Ambience & Candles", aliases: ["candle", "candles", "warm light", "gold"], points: 60 },
    ],
  },
  {
    id: "en-sd-5",
    title: "Vibrant Parisian Street Cafe & Outdoor Terrace",
    prompt: "Describe all the objects and details you spot in this bustling outdoor cafe! (10 items)",
    imageUrl:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85",
    sceneArtworkId: "street_cafe",
    modelDescription:
      "A lively street-side cafe terrace with round bistro tables, woven wicker chairs, espresso cups and pastries, large striped awnings and sun umbrellas, storefront glass windows surrounded by flowering planters, and cobblestone sidewalk.",
    tags: [
      { id: "t1", label: "Round Bistro Tables", aliases: ["table", "tables", "bistro table"], points: 80 },
      { id: "t2", label: "Woven Wicker Chairs", aliases: ["chair", "chairs", "wicker", "seats"], points: 80 },
      { id: "t3", label: "Coffee Cups & Saucers", aliases: ["coffee", "cup", "cups", "espresso", "mug"], points: 80 },
      { id: "t4", label: "Outdoor Sun Parasols / Awnings", aliases: ["umbrella", "parasol", "awning", "canopy"], points: 70 },
      { id: "t5", label: "Croissants & Pastries", aliases: ["croissant", "pastry", "pastries", "baked goods"], points: 70 },
      { id: "t6", label: "Glass Cafe Storefront", aliases: ["glass", "window", "facade", "storefront"], points: 70 },
      { id: "t7", label: "Flowering Window Planters", aliases: ["plants", "flowers", "planters", "pots"], points: 60 },
      { id: "t8", label: "Cobblestone Pavement", aliases: ["street", "sidewalk", "pavement", "cobblestones"], points: 60 },
      { id: "t9", label: "Chalkboard Menu", aliases: ["menu", "board", "sign", "chalkboard"], points: 70 },
      { id: "t10", label: "Patrons / Waiter", aliases: ["waiter", "people", "customers", "patrons"], points: 60 },
    ],
  },
];
