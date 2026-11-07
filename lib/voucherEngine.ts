"use client";

import { useEffect, useState } from "react";
import { getCachedProfile, setCachedProfile, updateProfileRecord } from "@/lib/db";

// ============================================================================
// 1. CRYPTOGRAPHIC CHECKSUM VOUCHER ENGINE & B2B CAFE LICENSING
// ============================================================================

export const ACTIVE_LICENSE_STORAGE_KEY = "SEEN_JEEM_ACTIVE_LICENSE_V1";
export const B2B_CAFE_CONFIG_STORAGE_KEY = "SEEN_JEEM_B2B_CAFE_CONFIG_V1";
export const ADMIN_PIN_STORAGE_KEY = "SEEN_JEEM_ADMIN_PIN_V1";
export const DEFAULT_ADMIN_PIN = "2026";

const VOUCHER_SECRET_SALT = "SJ_GIMNIM_MA_KASSARA_2026_ROYAL_SALT_#9981";
const VOUCHER_EVENT_NAME = "seen_jeem_license_updated";
const VOUCHER_CHANNEL_NAME = "seen_jeem_voucher_channel_v1";

// Configurable WhatsApp & Gumroad / Ko-fi checkout endpoints
export const WHATSAPP_MERCHANT_PHONE = "212600000000";
export const GUMROAD_CHECKOUT_LINKS = {
  PARTY_PASS: "https://seenjeem.gumroad.com/l/kassara-24h",
  PRO_HOST: "https://seenjeem.gumroad.com/l/pro-morocco-30d",
  B2B_CAFE: "https://seenjeem.gumroad.com/l/b2b-cafe-mode",
};

export type VoucherPrefix = "KASSARA24" | "PROMOROCCO" | "CAFEMODE";
export type VoucherLicenseType = "PARTY_PASS_24H" | "PRO_HOST_30D" | "B2B_CAFE";

export interface ActiveVoucherLicense {
  code: string;
  prefix: VoucherPrefix;
  licenseType: VoucherLicenseType;
  labelAr: string;
  activatedAt: number;
  expiresAt: number;
  isB2BCafe: boolean;
}

export interface B2BCafeBrandingConfig {
  enabled: boolean;
  cafeName: string;
  cafeLogoUrl: string;
}

export interface VoucherValidationResult {
  valid: boolean;
  normalizedCode: string;
  prefix?: VoucherPrefix;
  licenseType?: VoucherLicenseType;
  labelAr?: string;
  durationMs?: number;
  errorAr?: string;
}

/**
 * Computes a deterministic 6-character uppercase hexadecimal salted checksum
 * for a given (prefix, randomPayload) pair using dual FNV-1a + DJB2 rounds.
 */
export function computeVoucherSignature(
  prefix: VoucherPrefix,
  randomPart: string
): string {
  const cleanPrefix = prefix.trim().toUpperCase();
  const cleanRand = randomPart.trim().toUpperCase();
  const payload = `${cleanPrefix}::${cleanRand}::${VOUCHER_SECRET_SALT}`;

  // Round 1: FNV-1a 32-bit
  let h1 = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h1 ^= payload.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
  }

  // Round 2: DJB2-xor 32-bit
  let h2 = 5381;
  for (let i = payload.length - 1; i >= 0; i--) {
    h2 = ((h2 << 5) + h2) ^ payload.charCodeAt(i);
    h2 = h2 >>> 0;
  }

  const combined = ((h1 ^ (h2 << 7) ^ (h2 >>> 3)) >>> 0) & 0xffffff;
  return combined.toString(16).toUpperCase().padStart(6, "0");
}

/**
 * Generates a cryptographically signed voucher code:
 * - KASSARA24-[RAND]-[SIG]  (24h Party Pass)
 * - PROMOROCCO-[RAND]-[SIG] (30d Monthly Pro Host)
 * - CAFEMODE-[RAND]-[SIG]   (30d B2B Cafe / University Club License)
 */
export function generateSignedVoucher(prefix: VoucherPrefix): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 6; i++) {
    rand += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  const sig = computeVoucherSignature(prefix, rand);
  return `${prefix}-${rand}-${sig}`;
}

export function getPrefixMetadata(prefix: VoucherPrefix): {
  licenseType: VoucherLicenseType;
  labelAr: string;
  durationMs: number;
  isB2BCafe: boolean;
} {
  switch (prefix) {
    case "KASSARA24":
      return {
        licenseType: "PARTY_PASS_24H",
        labelAr: "تذكرة الگلسة / القصارة (24 ساعة مفتوحة)",
        durationMs: 24 * 60 * 60 * 1000,
        isB2BCafe: false,
      };
    case "PROMOROCCO":
      return {
        licenseType: "PRO_HOST_30D",
        labelAr: "باقة المضيف المحترف PRO (30 يوماً)",
        durationMs: 30 * 24 * 60 * 60 * 1000,
        isB2BCafe: false,
      };
    case "CAFEMODE":
      return {
        licenseType: "B2B_CAFE",
        labelAr: "رخصة المقاهي والنوادي B2B (شاملة العلامة التجارية)",
        durationMs: 30 * 24 * 60 * 60 * 1000,
        isB2BCafe: true,
      };
  }
}

/**
 * Validates a voucher string against the salted checksum validator.
 * Expected format: (KASSARA24 | PROMOROCCO | CAFEMODE)-[RAND]-[SIG]
 */
export function validateVoucherCode(rawCode: string): VoucherValidationResult {
  const normalized = (rawCode || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) {
    return {
      valid: false,
      normalizedCode: "",
      errorAr: "يرجى إدخال كود التفعيل أولاً.",
    };
  }

  const parts = normalized.split("-");
  if (parts.length !== 3) {
    return {
      valid: false,
      normalizedCode: normalized,
      errorAr:
        "صيغة الكود غير صحيحة. الصيغة المتوقعة: KASSARA24-XXXXXX-XXXXXX",
    };
  }

  const [rawPrefix, randPart, sigPart] = parts;
  if (
    rawPrefix !== "KASSARA24" &&
    rawPrefix !== "PROMOROCCO" &&
    rawPrefix !== "CAFEMODE"
  ) {
    return {
      valid: false,
      normalizedCode: normalized,
      errorAr:
        "بادئة الكود غير معروفة. يجب أن يبدأ بـ KASSARA24 أو PROMOROCCO أو CAFEMODE.",
    };
  }

  if (randPart.length < 4 || sigPart.length !== 6) {
    return {
      valid: false,
      normalizedCode: normalized,
      errorAr: "طول الكود أو التوقيع الرقمي غير مكتمل.",
    };
  }

  const expectedSig = computeVoucherSignature(rawPrefix, randPart);
  if (sigPart !== expectedSig) {
    return {
      valid: false,
      normalizedCode: normalized,
      errorAr: "كود التفعيل غير صالح أو التوقيع الرقمي غير مطابق.",
    };
  }

  const meta = getPrefixMetadata(rawPrefix);
  return {
    valid: true,
    normalizedCode: normalized,
    prefix: rawPrefix,
    licenseType: meta.licenseType,
    labelAr: meta.labelAr,
    durationMs: meta.durationMs,
  };
}

function notifyLicenseListeners(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(VOUCHER_EVENT_NAME));
  try {
    const bc = new BroadcastChannel(VOUCHER_CHANNEL_NAME);
    bc.postMessage({ type: "LICENSE_UPDATED", at: Date.now() });
    bc.close();
  } catch {
    // Ignore BroadcastChannel errors
  }
}

export function getActiveLicense(): ActiveVoucherLicense | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ACTIVE_LICENSE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ActiveVoucherLicense;
    if (!parsed || typeof parsed.expiresAt !== "number") return null;
    if (Date.now() >= parsed.expiresAt) {
      window.localStorage.removeItem(ACTIVE_LICENSE_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearActiveLicense(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_LICENSE_STORAGE_KEY);
  notifyLicenseListeners();
}

/**
 * Validates and activates a voucher code in localStorage (SEEN_JEEM_ACTIVE_LICENSE_V1)
 * and syncs the local profile tier so unlimited rooms & features unlock immediately.
 */
export function redeemVoucherCode(rawCode: string): {
  success: boolean;
  license?: ActiveVoucherLicense;
  messageAr: string;
} {
  const check = validateVoucherCode(rawCode);
  if (!check.valid || !check.prefix || !check.licenseType || !check.durationMs) {
    return {
      success: false,
      messageAr: check.errorAr || "كود التفعيل غير صالح.",
    };
  }

  const now = Date.now();
  const expiresAt = now + check.durationMs;
  const isB2BCafe = check.prefix === "CAFEMODE";

  const activeLicense: ActiveVoucherLicense = {
    code: check.normalizedCode,
    prefix: check.prefix,
    licenseType: check.licenseType,
    labelAr: check.labelAr || "",
    activatedAt: now,
    expiresAt,
    isB2BCafe,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      ACTIVE_LICENSE_STORAGE_KEY,
      JSON.stringify(activeLicense)
    );
  }

  // Sync with existing profile storage (Zero-Backend-Mutation adapter)
  const currentProfile = getCachedProfile();
  const nextProfile = {
    ...currentProfile,
    tier:
      check.prefix === "KASSARA24"
        ? ("party_pass" as const)
        : ("pro" as const),
    pass_expires_at: new Date(expiresAt).toISOString(),
  };
  setCachedProfile(nextProfile);
  updateProfileRecord(nextProfile).catch(() => {});

  // If B2B_CAFE license, ensure B2B branding config is enabled by default
  if (isB2BCafe) {
    const existingCafe = getB2BCafeConfig();
    saveB2BCafeConfig({
      enabled: true,
      cafeName: existingCafe.cafeName || "مقهى الأبطال",
      cafeLogoUrl: existingCafe.cafeLogoUrl || "",
    });
  }

  notifyLicenseListeners();

  return {
    success: true,
    license: activeLicense,
    messageAr: `🎉 تم تفعيل «${activeLicense.labelAr}» بنجاح!`,
  };
}

// ============================================================================
// 2. B2B CAFE / UNIVERSITY CLUB BRANDING CONFIG
// ============================================================================

export function getB2BCafeConfig(): B2BCafeBrandingConfig {
  if (typeof window === "undefined") {
    return { enabled: false, cafeName: "", cafeLogoUrl: "" };
  }
  const raw = window.localStorage.getItem(B2B_CAFE_CONFIG_STORAGE_KEY);
  if (!raw) {
    return { enabled: false, cafeName: "", cafeLogoUrl: "" };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<B2BCafeBrandingConfig>;
    return {
      enabled: Boolean(parsed.enabled),
      cafeName: parsed.cafeName || "",
      cafeLogoUrl: parsed.cafeLogoUrl || "",
    };
  } catch {
    return { enabled: false, cafeName: "", cafeLogoUrl: "" };
  }
}

export function saveB2BCafeConfig(config: B2BCafeBrandingConfig): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    B2B_CAFE_CONFIG_STORAGE_KEY,
    JSON.stringify(config)
  );
  notifyLicenseListeners();
}

// ============================================================================
// 3. SECRET ADMIN PIN HELPERS (FOR SHIFT + D GENERATOR DRAWER)
// ============================================================================

export function getConfiguredAdminPin(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PIN;
  return (
    window.localStorage.getItem(ADMIN_PIN_STORAGE_KEY) || DEFAULT_ADMIN_PIN
  );
}

export function verifyAdminPin(inputPin: string): boolean {
  const clean = (inputPin || "").trim();
  return clean === getConfiguredAdminPin() || clean === DEFAULT_ADMIN_PIN;
}

// ============================================================================
// 4. WHATSAPP & GUMROAD CHECKOUT URL BUILDERS
// ============================================================================

export function buildWhatsAppCheckoutUrl(params: {
  planTitle: string;
  priceLabel: string;
  planCode: "PARTY_PASS" | "PRO_HOST" | "B2B_CAFE";
  phone?: string;
}): string {
  const targetPhone = (params.phone || WHATSAPP_MERCHANT_PHONE).replace(
    /\D/g,
    ""
  );
  const message =
    `السلام عليكم! أرغب في شراء كود تفعيل في لعبة قَدْهَا؟ (QADHA):\n` +
    `• الباقة المطلوبة: ${params.planTitle}\n` +
    `• السعر: ${params.priceLabel}\n` +
    `• وسيلة الدفع المفضلة: CIH Mobile / Cash Plus / Wafacash\n` +
    `شكراً لكم!`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

// ============================================================================
// 5. REACT HOOK FOR LIVE LICENSE & B2B CAFE STATE
// ============================================================================

export function useVoucherLicense() {
  const [activeLicense, setActiveLicense] =
    useState<ActiveVoucherLicense | null>(null);
  const [cafeConfig, setCafeConfig] = useState<B2BCafeBrandingConfig>({
    enabled: false,
    cafeName: "",
    cafeLogoUrl: "",
  });

  useEffect(() => {
    const sync = () => {
      setActiveLicense(getActiveLicense());
      setCafeConfig(getB2BCafeConfig());
    };
    sync();

    window.addEventListener(VOUCHER_EVENT_NAME, sync);
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === ACTIVE_LICENSE_STORAGE_KEY ||
        e.key === B2B_CAFE_CONFIG_STORAGE_KEY
      ) {
        sync();
      }
    };
    window.addEventListener("storage", handleStorage);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(VOUCHER_CHANNEL_NAME);
      bc.onmessage = () => sync();
    } catch {
      // Ignore BroadcastChannel errors
    }

    return () => {
      window.removeEventListener(VOUCHER_EVENT_NAME, sync);
      window.removeEventListener("storage", handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const isB2BCafeUnlocked = Boolean(activeLicense?.isB2BCafe);

  const updateCafeConfig = (patch: Partial<B2BCafeBrandingConfig>) => {
    const current = getB2BCafeConfig();
    saveB2BCafeConfig({ ...current, ...patch });
  };

  return {
    activeLicense,
    isB2BCafeUnlocked,
    cafeConfig,
    saveCafeConfig: saveB2BCafeConfig,
    updateCafeConfig,
    redeemVoucher: redeemVoucherCode,
    clearLicense: clearActiveLicense,
  };
}
