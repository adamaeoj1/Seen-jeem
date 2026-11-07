"use client";

import React, { useEffect } from "react";
import {
  getActiveBackendProvider,
  getCachedProfile,
  setCachedProfile,
  UserProfileRecord,
} from "@/lib/db";

const PENDING_GOOGLE_OAUTH_KEY = "seen_jeem_pending_google_oauth_v1";

/**
 * Checks if the app is currently served from 127.0.0.1 (e.g. VS Code Go Live / local dev)
 * and redirects to localhost to prevent Google OAuth domain rejection.
 */
export function ensureLocalhostDomain(markPendingOAuth = false): boolean {
  if (typeof window === "undefined") return false;

  if (window.location.hostname === "127.0.0.1") {
    if (markPendingOAuth) {
      try {
        window.sessionStorage.setItem(PENDING_GOOGLE_OAUTH_KEY, "1");
      } catch {
        // Ignore storage errors
      }
    }
    const targetUrl = window.location.href.replace(
      "://127.0.0.1",
      "://localhost"
    );
    window.location.replace(targetUrl);
    return true;
  }

  return false;
}

/**
 * Returns the current origin normalized to `localhost` instead of `127.0.0.1`.
 */
export function getSafeOAuthOrigin(): string {
  if (typeof window === "undefined") return "http://localhost:3000";
  return window.location.origin.replace("://127.0.0.1", "://localhost");
}

/**
 * Detects mobile/in-app browsers that frequently block OAuth popups.
 */
export function isMobileOrInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|FBAN|FBAV|Instagram|Line/i.test(
    ua
  );
}

export interface ResilientGoogleAuthOptions {
  onSuccess?: (profile: UserProfileRecord) => void;
  onError?: (message: string) => void;
}

/**
 * Synchronous onClick wrapper for Google Sign-In:
 * 1. Redirects 127.0.0.1 -> localhost automatically to fix Go Live OAuth domain rejection.
 * 2. Triggers OAuth synchronously inside the user's onClick gesture.
 * 3. Attempts Popup sign-in first and automatically falls back to Redirect if blocked or on mobile browsers.
 */
export function handleResilientGoogleSignIn(
  event?: React.MouseEvent<HTMLElement>,
  options?: ResilientGoogleAuthOptions
): void {
  if (event) {
    event.preventDefault();
  }

  if (typeof window === "undefined") return;

  // Step 1: Fix 127.0.0.1 OAuth domain rejection immediately
  if (ensureLocalhostDomain(true)) {
    return;
  }

  const provider = getActiveBackendProvider();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const safeOrigin = getSafeOAuthOrigin();

  // Step 2: If Supabase OAuth is configured, run synchronous Popup -> Redirect fallback
  if (provider === "supabase" && supabaseUrl) {
    const redirectTo = encodeURIComponent(safeOrigin);
    const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;

    // Mobile browsers: prefer direct Redirect or attempt Popup with immediate fallback
    if (isMobileOrInAppBrowser()) {
      window.location.assign(oauthUrl);
      return;
    }

    // Desktop browsers: open Popup synchronously inside onClick handler
    const width = 520;
    const height = 640;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));

    let popup: Window | null = null;
    try {
      popup = window.open(
        oauthUrl,
        "seen_jeem_google_oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=yes,status=no,resizable=yes,scrollbars=yes`
      );
    } catch {
      popup = null;
    }

    // Step 3: Automatic fallback from Popup to Redirect if blocked
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      window.location.assign(oauthUrl);
      return;
    }

    try {
      popup.focus();
    } catch {
      // Ignore focus errors
    }

    return;
  }

  // Step 4: Local / Zero-Backend Fallback Profile Activation
  const current = getCachedProfile();
  const updated: UserProfileRecord = {
    ...current,
    email: current.email || "host@gmail.com",
    name:
      current.name && current.name !== "مضيف السهرة"
        ? current.name
        : "مضيف Google",
  };
  setCachedProfile(updated);
  options?.onSuccess?.(updated);
}

/**
 * React hook to automatically redirect 127.0.0.1 -> localhost on mount
 * and resume any pending Google OAuth flow after redirect.
 */
export function useGoogleAuthDomainFix(
  options?: ResilientGoogleAuthOptions
): void {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (ensureLocalhostDomain(false)) {
      return;
    }

    try {
      const pending = window.sessionStorage.getItem(PENDING_GOOGLE_OAUTH_KEY);
      if (pending === "1") {
        window.sessionStorage.removeItem(PENDING_GOOGLE_OAUTH_KEY);
        handleResilientGoogleSignIn(undefined, options);
      }
    } catch {
      // Ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
