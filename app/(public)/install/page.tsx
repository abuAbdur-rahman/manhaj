import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { PwaInstallCard } from "./pwa-card";

export const metadata: Metadata = {
  title: "Install — Manhaj Sunnah",
  description:
    "Install Manhaj for offline listening — add to your home screen or download the Android APK.",
  alternates: { canonical: "/install" },
};

const APK_URL = process.env.NEXT_PUBLIC_APP_APK_URL ?? "";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
const UPDATED_AT = "Aug 2026";
const APK_SIZE = "~35–50 MB";

export default function InstallPage() {
  const hasApk = Boolean(APK_URL);
  const qrSrc = hasApk
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(APK_URL)}`
    : null;

  return (
    <>
      <Header title="Install" />
      <main className="flex-1 page-enter">
        <div className="mx-auto max-w-3xl px-4 py-10">
          {/* Hero */}
          <div className="flex items-start gap-4">
            <div className="relative hidden h-12 w-12 shrink-0 sm:block">
              <Image
                src="/logo.png"
                alt=""
                fill
                className="object-contain dark:hidden"
              />
              <Image
                src="/logo-light.png"
                alt=""
                fill
                className="hidden object-contain dark:block"
              />
            </div>
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-forest-900 dark:text-ink-100">
                Install Manhaj
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-sand-400 dark:text-ink-400">
                Get one-tap access and offline playback. Choose what fits your
                device — on any phone you can add Manhaj to your home screen; on
                Android you can also install the APK.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6">
            <PwaInstallCard />

            {hasApk && (
              <section className="rounded-2xl border border-sand-200/70 bg-white p-6 shadow-sm dark:border-ink-700/40 dark:bg-ink-800">
                <h2 className="text-base font-bold text-forest-900 dark:text-ink-100">
                  Android APK
                </h2>
                <p className="mt-1 text-sm leading-6 text-sand-400 dark:text-ink-400">
                  Native Android with lock-screen controls, background playback,
                  and offline downloads. Sideloaded until Play Store ships.
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-sand-300 dark:text-ink-500">
                  <span className="rounded-full bg-forest-50 px-2.5 py-1 text-forest-700 dark:bg-forest-900/30 dark:text-forest-200">
                    v{APP_VERSION}
                  </span>
                  <span>• {UPDATED_AT}</span>
                  <span>• {APK_SIZE}</span>
                  <span>• Android 7+</span>
                </div>

                <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
                  <a
                    href={APK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest-700 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-forest-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 active:scale-[0.98]"
                  >
                    Download APK
                  </a>

                  {qrSrc && (
                    <div className="flex flex-col items-start gap-2">
                      {/* biome-ignore lint/performance/noImgElement: external QR via api.qrserver.com */}
                      <img
                        src={qrSrc}
                        alt="QR code for APK download"
                        width={180}
                        height={180}
                        className="rounded-xl border border-sand-200 bg-white p-2 dark:border-ink-700"
                      />
                      <span className="text-xs text-sand-300 dark:text-ink-500">
                        Scan to install on your phone
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-xl bg-sand-50 p-4 dark:bg-ink-900/40">
                  <h3 className="text-sm font-semibold text-forest-900 dark:text-ink-100">
                    After downloading
                  </h3>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-sand-400 dark:text-ink-400">
                    <li>Open the APK.</li>
                    <li>
                      If Android says “Install blocked”, tap{" "}
                      <strong>Settings → Allow from this source</strong>.
                    </li>
                    <li>Tap Install.</li>
                  </ol>
                </div>
              </section>
            )}
          </div>

          <section className="mt-8">
            <h2 className="text-base font-bold text-forest-900 dark:text-ink-100">
              What&apos;s inside
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-sand-400 dark:text-ink-400">
              <li>Browse scholars, series, episodes</li>
              <li>
                Stream or download for offline — with file size & 2 GB cap
              </li>
              <li>
                Background playback, notification controls, speed 0.75–2×, sleep
                timer
              </li>
              <li>Search, share to WhatsApp, offline queue</li>
            </ul>
          </section>

          <nav className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link
              href="/privacy"
              className="font-semibold text-forest-700 underline-offset-4 hover:underline dark:text-forest-300"
            >
              Privacy Policy →
            </Link>
            <span className="text-sand-200 dark:text-ink-700">•</span>
            <a
              href="https://github.com/abuAbdur-rahman/manhaj"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sand-400 hover:text-forest-700 dark:text-ink-400"
            >
              Source
            </a>
          </nav>
        </div>
      </main>
    </>
  );
}
