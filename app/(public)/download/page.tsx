import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Download the Android App — Manhaj Sunnah",
  description:
    "Download the Manhaj Sunnah Android APK. Sideload via EAS Build artifact — Play Store coming later.",
  alternates: { canonical: "https://manhaj-sunnah.vercel.app/download" },
};

const APK_URL = process.env.NEXT_PUBLIC_APP_APK_URL ?? "";
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
const UPDATED_AT = "Aug 2026";
const APK_SIZE = "~35–50 MB";

export default function DownloadPage() {
  const hasUrl = Boolean(APK_URL);
  const qrSrc = hasUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(APK_URL)}`
    : null;

  return (
    <main className="flex-1 page-enter">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-forest-900 dark:text-ink-100">
          Download the Android App
        </h1>
        <p className="mt-2 text-sm text-sand-300 dark:text-ink-500">
          Manhaj Sunnah — Ilm, organized. Native Android with offline downloads,
          background playback, and lock-screen controls.
        </p>

        {/* Latest APK card */}
        <section className="mt-8 rounded-2xl border border-sand-200/70 bg-white p-6 shadow-sm dark:border-ink-700/40 dark:bg-ink-800">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-sand-300 dark:text-ink-500">
            <span className="rounded-full bg-forest-50 px-2.5 py-1 text-forest-700 dark:bg-forest-900/30 dark:text-forest-200">
              Version {APP_VERSION}
            </span>
            <span>• Updated {UPDATED_AT}</span>
            <span>• APK {APK_SIZE}</span>
            <span>• Requires Android 7+</span>
          </div>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            <a
              href={hasUrl ? APK_URL : "#"}
              target={hasUrl ? "_blank" : undefined}
              rel={hasUrl ? "noopener noreferrer" : undefined}
              aria-disabled={!hasUrl}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white shadow-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 active:scale-[0.98] ${
                hasUrl
                  ? "bg-forest-700 hover:bg-forest-800"
                  : "pointer-events-none bg-sand-300"
              }`}
            >
              Download APK
            </a>

            {qrSrc ? (
              <div className="flex flex-col items-start gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrSrc}
                  alt="QR code for APK download URL"
                  width={180}
                  height={180}
                  className="rounded-xl border border-sand-200 bg-white p-2 dark:border-ink-700"
                />
                <span className="text-xs text-sand-300 dark:text-ink-500">
                  Scan from laptop to install on phone
                </span>
              </div>
            ) : (
              <p className="text-xs text-sand-300 dark:text-ink-500">
                Set <code>NEXT_PUBLIC_APP_APK_URL</code> in Vercel env to enable
                direct download + QR. Artifact URL from EAS production build.
              </p>
            )}
          </div>

          {!hasUrl && (
            <p className="mt-4 text-xs text-amber-700 dark:text-amber-300">
              Direct link not configured yet. Run{" "}
              <code className="rounded bg-sand-100 px-1 py-0.5 dark:bg-ink-900">
                eas build --platform android --profile production
              </code>{" "}
              and paste the artifact URL into{" "}
              <code>NEXT_PUBLIC_APP_APK_URL</code>.
            </p>
          )}
        </section>

        {/* Sideload steps */}
        <section className="mt-8 rounded-2xl border border-sand-200/70 bg-sand-50 p-6 dark:border-ink-700/40 dark:bg-ink-800/50">
          <h2 className="text-base font-bold text-forest-900 dark:text-ink-100">
            How to install (sideload)
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-sand-400 dark:text-ink-400">
            <li>Tap Download APK.</li>
            <li>
              When Android warns &quot;Install blocked — Allow install from
              browser&quot;, tap <strong>Settings → Allow</strong>.
            </li>
            <li>Open the APK and tap Install.</li>
          </ol>
          <p className="mt-4 text-xs leading-5 text-sand-300 dark:text-ink-500">
            <strong>Why sideload?</strong> Play Store listing is coming later.
            This APK is built by EAS Build from this repo — same source as the
            website.
          </p>
        </section>

        {/* What's in the app */}
        <section className="mt-8">
          <h2 className="text-base font-bold text-forest-900 dark:text-ink-100">
            What&apos;s in the app
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-sand-400 dark:text-ink-400">
            <li>Browse scholars, series, episodes</li>
            <li>
              Stream or download for offline (Downloads page), 2 GB default cap,
              shows file size
            </li>
            <li>
              Background playback + notification controls, speed 0.75–2×, sleep
              timer
            </li>
            <li>Search, Share to WhatsApp, offline queue</li>
          </ul>
        </section>

        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          Tested on Android 9+; Android 7–8 may work but isn&apos;t QA&apos;d
          on-device.
        </p>

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
  );
}
