import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Manhaj Sunnah App",
  description:
    "Privacy policy for the Manhaj Sunnah Android app (v1, no accounts).",
};

const UPDATED = "August 2026";

export default function PrivacyPage() {
  return (
    <main className="flex-1 page-enter">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-forest-900 dark:text-ink-100">
          Privacy Policy — Manhaj Sunnah App
        </h1>
        <p className="mt-2 text-xs text-sand-300 dark:text-ink-500">
          Last updated: {UPDATED} · v1 (no accounts)
        </p>

        <article className="prose prose-sm mt-8 max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-forest-900 dark:prose-headings:text-ink-100 prose-p:text-sand-400 dark:prose-p:text-ink-400 prose-li:text-sand-400 dark:prose-li:text-ink-400 prose-strong:text-forest-900 dark:prose-strong:text-ink-100">
          <section>
            <h2>1. Overview</h2>
            <p>
              Manhaj Sunnah respects your privacy. The v1 Android app has no
              accounts — you can browse scholars, series, and lectures without
              signing in. This policy explains what we do and don&apos;t
              collect.
            </p>
          </section>

          <section>
            <h2>2. Data we collect</h2>
            <ul>
              <li>
                <strong>Anonymous play counts:</strong> <code>episode_id</code>{" "}
                + timestamp + source (<code>stream</code>/<code>offline</code>).
                No name, email, or device ID. Stored locally on your device. It
                is not sent to our servers.
              </li>
              <li>
                <strong>Anonymous crash logs:</strong> error message + stack +
                route + app version + OS version — only when an error occurs and
                the app can reach Supabase. Stored in <code>app_errors</code>.
              </li>
              <li>
                No location, contacts, or identifiers beyond what the OS
                requires for playback.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Data we do NOT collect</h2>
            <p>
              No accounts, no personal data, no third-party trackers or ad SDKs.
              We don&apos;t sell or share data. Analytics are aggregate play
              counts only.
            </p>
          </section>

          <section>
            <h2>4. Offline files</h2>
            <p>
              Lectures you download are stored on your device only (
              <code>FileSystem.documentDirectory/audio/&lt;id&gt;.mp3</code>).
              They never leave your device unless you share the lecture link.
              Uninstalling the app deletes them. The 2 GB default cap is
              enforced locally.
            </p>
          </section>

          <section>
            <h2>5. Permissions</h2>
            <ul>
              <li>
                <strong>Foreground service</strong> (
                <code>FOREGROUND_SERVICE_MEDIA_PLAYBACK</code>) — keeps audio
                playing when the app is backgrounded or the screen is off.
              </li>
              <li>
                <strong>Notifications</strong> (<code>POST_NOTIFICATIONS</code>)
                — one-time system prompt on first playback for the media
                notification + lock-screen controls. You can deny it; playback
                still works (you just won&apos;t see the notification). Choice
                is remembered; re-prompt only if you grant later via system
                settings.
              </li>
            </ul>
            <p>No storage, location, contacts, or camera permissions.</p>
          </section>

          <section>
            <h2>6. Sharing</h2>
            <p>
              The Share button opens the native Android share sheet to the
              website URL <code>manhaj-sunnah.vercel.app/lectures/[slug]</code>.
              We don&apos;t see who you share with, and no deep links / App
              Links are used in v1.
            </p>
          </section>

          <section>
            <h2>7. Contact</h2>
            <p>
              Same as the website footer — WhatsApp / Telegram links on the
              site. For data questions, contact the site admin.
            </p>
          </section>

          <section>
            <h2>8. Changes</h2>
            <p>
              We&apos;ll update this page when the policy changes and bump the
              date above. Linked from{" "}
              <Link
                href="/install"
                className="font-semibold text-forest-700 underline-offset-4 hover:underline"
              >
                /install
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
