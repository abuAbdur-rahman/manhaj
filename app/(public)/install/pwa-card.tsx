"use client";

import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isAppleMobile =
      /iphone|ipad|ipod/i.test(ua) ||
      // iPadOS 13+ reports as MacIntel in desktop-class mode
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIos(isAppleMobile);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as NavigatorWithStandalone).standalone === true;
    if (standalone) {
      setIsStandalone(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setIsStandalone(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIos) {
      setShowIosSteps((v) => !v);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }, [deferredPrompt, isIos]);

  if (isIos) return null;

  if (isStandalone) {
    return (
      <section className="rounded-2xl border border-forest-200 bg-forest-50 p-6 dark:border-ink-700 dark:bg-ink-800">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-700 text-white dark:bg-forest-600">
            ✓
          </span>
          <div>
            <h2 className="text-base font-bold text-forest-900 dark:text-ink-100">
              Already on your home screen
            </h2>
            <p className="mt-1 text-sm leading-6 text-sand-400 dark:text-ink-400">
              Open Manhaj from your home screen or app drawer for the fastest
              experience.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-sand-200/70 bg-white p-6 shadow-sm dark:border-ink-700/40 dark:bg-ink-800">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-700 text-white dark:bg-forest-600">
          ✦
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-forest-900 dark:text-ink-100">
            Add to home screen
          </h2>
          <p className="mt-1 text-sm leading-6 text-sand-400 dark:text-ink-400">
            One tap. Opens like an app — offline lectures, background playback,
            faster launch.
          </p>

          <div className="mt-5">
            {isIos ? (
              <>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest-700 px-6 text-sm font-bold text-white shadow-sm hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 active:scale-[0.98]"
                >
                  {showIosSteps ? "Hide steps" : "How to add"}
                </button>
                {showIosSteps && (
                  <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-sand-400 dark:text-ink-400">
                    <li>Tap the Share icon in Safari.</li>
                    <li>Choose “Add to Home Screen”.</li>
                    <li>Tap Add.</li>
                  </ol>
                )}
                {!showIosSteps && (
                  <p className="mt-3 text-xs text-sand-300 dark:text-ink-500">
                    Safari → Share → Add to Home Screen.
                  </p>
                )}
              </>
            ) : deferredPrompt ? (
              <button
                type="button"
                onClick={handleInstall}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest-700 px-6 text-sm font-bold text-white shadow-sm hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 active:scale-[0.98]"
              >
                Add to home screen
              </button>
            ) : (
              <p className="rounded-xl bg-sand-50 px-4 py-3 text-sm leading-6 text-sand-400 dark:bg-ink-900/50 dark:text-ink-400">
                Open your browser menu → <strong>Install app</strong> or{" "}
                <strong>Add to Home Screen</strong>.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
