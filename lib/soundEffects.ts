/**
 * Web Audio API Sound Effects & Player Voice/Buzzer Pack Synthesizer
 * Zero external MP3 dependencies — works 100% reliably across mobile & desktop browsers.
 */

export type VoicePackId =
  | "hype_horn"
  | "classic_honk"
  | "cheeky_laugh"
  | "challenge_drum"
  | "laser_zap"
  | "royal_fanfare";

export interface VoicePackMeta {
  id: VoicePackId;
  nameAr: string;
  subtitleAr: string;
  badgeColor: string;
}

export const VOICE_PACKS: VoicePackMeta[] = [
  {
    id: "hype_horn",
    nameAr: "صوت حماسي",
    subtitleAr: "نغمة انطلاق هجومية",
    badgeColor: "#F4D03F",
  },
  {
    id: "classic_honk",
    nameAr: "بوق كلاسيكي",
    subtitleAr: "هرن كرتوني مرح",
    badgeColor: "#DE7A7A",
  },
  {
    id: "cheeky_laugh",
    nameAr: "ضحكة ساخرة",
    subtitleAr: "نغمة مشاغبة ومستفزة",
    badgeColor: "#2ECC71",
  },
  {
    id: "challenge_drum",
    nameAr: "طبل التحدي",
    subtitleAr: "إيقاع طبول حماسي",
    badgeColor: "#E65C2E",
  },
  {
    id: "laser_zap",
    nameAr: "ليزر خاطف",
    subtitleAr: "نبضة سرعة إلكترونية",
    badgeColor: "#3B66B4",
  },
  {
    id: "royal_fanfare",
    nameAr: "بوق الملوك",
    subtitleAr: "دخول فخم للزعماء",
    badgeColor: "#F4D03F",
  },
];

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Plays a player's chosen Voice / Buzzer pack using Web Audio synthesis.
 */
export function playVoicePack(voiceId: VoicePackId | string, enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (voiceId === "hype_horn") {
    // Rising brassy dual-oscillator stadium horn
    const notes = [330, 440, 587.33];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      const start = now + idx * 0.09;
      const dur = idx === 2 ? 0.32 : 0.08;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    });
    return;
  }

  if (voiceId === "classic_honk") {
    // Two-tap cartoon squeeze horn ("Honk-Honk!")
    [0, 0.16].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(240, now + offset);
      osc.frequency.linearRampToValueAtTime(310, now + offset + 0.06);
      osc.frequency.linearRampToValueAtTime(215, now + offset + 0.13);
      gain.gain.setValueAtTime(0.16, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.14);
    });
    return;
  }

  if (voiceId === "cheeky_laugh") {
    // 4 bouncy staccato descending/ascending notes ("Ha-ha-ha-ha!")
    const freqs = [620, 540, 480, 680];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      const start = now + idx * 0.085;
      osc.frequency.setValueAtTime(f, start);
      osc.frequency.exponentialRampToValueAtTime(f * 0.78, start + 0.07);
      gain.gain.setValueAtTime(0.24, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.075);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.08);
    });
    return;
  }

  if (voiceId === "challenge_drum") {
    // Punchy tribal/stadium tom-tom rhythm ("Dum-dum-DUM!")
    const hits = [
      { t: 0, f: 140, d: 0.11 },
      { t: 0.12, f: 140, d: 0.11 },
      { t: 0.25, f: 195, d: 0.26 },
    ];
    hits.forEach((h) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(h.f, now + h.t);
      osc.frequency.exponentialRampToValueAtTime(48, now + h.t + h.d);
      gain.gain.setValueAtTime(0.32, now + h.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + h.t + h.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + h.t);
      osc.stop(now + h.t + h.d);
    });
    return;
  }

  if (voiceId === "laser_zap") {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(1100, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
    return;
  }

  // royal_fanfare default
  const royalNotes = [392, 493.88, 587.33, 783.99];
  royalNotes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const start = now + idx * 0.08;
    const dur = idx === 3 ? 0.35 : 0.09;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.22, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur);
  });
}

export function playCorrectChime(enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const start = now + idx * 0.07;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.18, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.26);
  });
}

export function playTickSound(enabled = true): void {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  gain.gain.setValueAtTime(0.06, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.045);
}
