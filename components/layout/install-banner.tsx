"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const DISMISS_KEY = "manhaj-install-banner-dismissed";

export function InstallBanner({ className }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as NavigatorWithStandalone).standalone === true;
    if (isStandalone) return;

    if (sessionStorage.getItem(DISMISS_KEY) === "1") return;

    const iosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(iosDevice);

    if (iosDevice) {
      setVisible(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      sessionStorage.setItem(DISMISS_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, "1");
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (isIos) {
      setShowIosSteps(true);
      return;
    }

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);

    if (outcome !== "accepted") {
      sessionStorage.setItem(DISMISS_KEY, "1");
    }
  }, [deferredPrompt, isIos]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Manhaj"
      className={
        className ??
        "fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+0.5rem)] left-2 right-2 z-50 flex items-center justify-between gap-3 rounded-2xl bg-forest-900 px-4 py-3 text-white shadow-lg dark:bg-ink-800"
      }
    >
      {showIosSteps ? (
        <p className="text-sm">Tap the Share icon, then Add to Home Screen.</p>
      ) : (
        <p className="text-sm">
          Install Manhaj for offline listening from your home screen.
        </p>
      )}
      <div className="flex shrink-0 gap-2">
        {!showIosSteps && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="min-h-11 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-forest-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Install
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="min-h-11 min-w-11 rounded-lg px-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          x
        </button>
      </div>
    </div>
  );
}
