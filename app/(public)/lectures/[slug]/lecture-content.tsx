"use client";

import { Clock, Download, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AudioCard } from "@/components/episodes/audio-card";
import { PlayerControls } from "@/components/player/player-controls";
import { cn } from "@/components/ui/cn";
import { formatDuration } from "@/lib/audio";
import { downloadEpisode, resumeDownload } from "@/lib/download";
import { updateDownloadedEpisodeMetadata } from "@/lib/downloads-db";
import { invalidateDownloads } from "@/lib/query-client";
import { useDownloadedIds } from "@/lib/use-downloaded";
import { useDownloadsStore } from "@/store/downloads";
import { usePlayerStore } from "@/store/player";
import type { Episode, Speed } from "@/types";

interface LectureContentProps {
  episode: Episode;
  moreEpisodes: Episode[];
}

const SLEEP_TIMER_OPTIONS = [15, 30, 60] as const;

export function LectureContent({ episode, moreEpisodes }: LectureContentProps) {
  const downloadedIds = useDownloadedIds();
  const download = useDownloadsStore((s) =>
    s.inProgress.find((d) => d.episodeId === episode.id),
  );
  const isDownloading =
    download?.status === "downloading" || download?.status === "saving";
  const isPaused = download?.status === "paused";
  const downloadPercent = download?.percent ?? 0;
  const downloadIndeterminate = isDownloading && (download?.total ?? 0) === 0;
  const [sleepTimerIndex, setSleepTimerIndex] = useState(-1);
  const [audioOutdated, setAudioOutdated] = useState(false);

  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    speed,
    isLoading,
    sleepTimerRemaining,
    setEpisode,
    setPlaying,
    setCurrentTime,
    setSpeed,
    setSleepTimer,
    tickSleepTimer,
    queue,
    queueIndex,
    playNext,
    playPrevious,
  } = usePlayerStore();

  const isCurrentEpisode = currentEpisode?.id === episode.id;
  const isThisEpisodePlaying = isCurrentEpisode && isPlaying;
  const isThisEpisodeLoading = isCurrentEpisode && isLoading;

  const handlePlay = useCallback(() => {
    if (!isCurrentEpisode) {
      setEpisode(episode);
      return;
    }
    setPlaying(!isPlaying);
  }, [isCurrentEpisode, episode, setEpisode, setPlaying, isPlaying]);

  const handleSeek = useCallback(
    (time: number) => {
      setCurrentTime(time);
    },
    [setCurrentTime],
  );

  const handleSkipBack = useCallback(() => {
    handleSeek(Math.max(0, currentTime - 10));
  }, [currentTime, handleSeek]);

  const handleSkipForward = useCallback(() => {
    handleSeek(Math.min(duration, currentTime + 10));
  }, [currentTime, duration, handleSeek]);

  const handleSpeedChange = useCallback(
    (newSpeed: Speed) => {
      setSpeed(newSpeed);
    },
    [setSpeed],
  );

  const handleSleepTimer = useCallback(() => {
    const nextIndex = (sleepTimerIndex + 1) % (SLEEP_TIMER_OPTIONS.length + 1);
    setSleepTimerIndex(nextIndex);
    if (nextIndex === SLEEP_TIMER_OPTIONS.length) {
      setSleepTimer(null);
    } else {
      setSleepTimer(SLEEP_TIMER_OPTIONS[nextIndex] * 60);
    }
  }, [sleepTimerIndex, setSleepTimer]);

  const handleDownload = useCallback(async () => {
    if (isPaused) {
      resumeDownload(episode.id);
      return;
    }
    if (isDownloading || downloadedIds.has(episode.id)) return;
    await downloadEpisode(episode);
  }, [episode, isDownloading, isPaused, downloadedIds]);

  const handleWhatsAppShare = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `\u{1F4DA} Listen to "${episode.title}" by ${episode.scholar?.name} on Manhaj\n\nIlm, organized.`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [episode]);

  const handleCopyLink = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  }, []);

  useEffect(() => {
    if (!downloadedIds.has(episode.id)) return;
    void updateDownloadedEpisodeMetadata(episode).then((result) => {
      setAudioOutdated(result.audioOutdated);
      if (result.updated) invalidateDownloads();
    });
  }, [downloadedIds, episode]);

  useEffect(() => {
    if (isCurrentEpisode && sleepTimerRemaining !== null) {
      const interval = setInterval(tickSleepTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [isCurrentEpisode, sleepTimerRemaining, tickSleepTimer]);

  const recordedDate = episode.recorded_date
    ? new Date(episode.recorded_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="w-full page-enter">
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="bg-gradient-to-b from-forest-50 to-transparent px-4 py-10 sm:py-12 dark:from-ink-900/80">
        <div className="mx-auto max-w-3xl flex flex-col items-center text-center">
          {episode.scholar?.photo_url && (
            <div className="mb-6 w-20 h-20 rounded-full overflow-hidden border-4 border-forest-100/80 shadow-[0_4px_16px_rgba(26,107,60,0.15)] dark:border-ink-700">
              <Image
                src={episode.scholar.photo_url}
                alt={episode.scholar.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="mb-3 text-2xl font-bold leading-tight text-forest-900 sm:text-3xl dark:text-ink-100">
            {episode.title}
          </h1>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-forest-600 mb-6 dark:text-ink-500">
            {episode.scholar && (
              <>
                <Link
                  href={`/scholars/${episode.scholar.slug}`}
                  className="font-semibold text-forest-700 hover:text-forest-800 transition-colors dark:text-ink-100 dark:hover:text-white"
                >
                  {episode.scholar.name}
                </Link>
                {episode.series && (
                  <span className="text-sand-300 dark:text-ink-500">·</span>
                )}
              </>
            )}
            {episode.series && (
              <Link
                href={`/scholars/${episode.scholar?.slug}/${episode.series.slug}`}
                className="font-semibold text-forest-700 hover:text-forest-800 transition-colors dark:text-ink-100 dark:hover:text-white"
              >
                {episode.series.title}
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 text-forest-700 text-xs font-semibold uppercase tracking-wide dark:bg-ink-800 dark:text-ink-100">
              <Clock size={12} />
              {formatDuration(episode.duration_seconds ?? 0)}
            </span>

            {episode.language && (
              <span className="inline-block px-3 py-1 rounded-full bg-sand-200 text-forest-700 text-xs font-semibold capitalize dark:bg-ink-800 dark:text-ink-100">
                {episode.language}
              </span>
            )}

            {episode.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-block px-3 py-1 rounded-full bg-forest-50 text-forest-700 text-xs font-medium capitalize dark:bg-ink-800 dark:text-ink-100"
              >
                {tag}
              </span>
            ))}
          </div>

          {recordedDate && (
            <p className="text-xs text-forest-500 font-medium dark:text-ink-500">
              Recorded {recordedDate}
            </p>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* PLAYER CONTROLS */}
      {/* ============================================ */}
      <section className="px-4 py-6 border-b border-sand-200/60 bg-white dark:border-ink-700/40 dark:bg-ink-950">
        <div className="mx-auto max-w-3xl">
          {audioOutdated && (
            <output className="mb-4 block rounded-lg border border-clay-500/30 bg-clay-500/10 px-4 py-3 text-sm text-clay-600 dark:text-clay-400">
              The downloaded audio is an older revision. Delete and download it
              again to replace it.
            </output>
          )}
          <PlayerControls
            isPlaying={isThisEpisodePlaying ?? false}
            isLoading={isThisEpisodeLoading ?? false}
            currentTime={isCurrentEpisode ? currentTime : 0}
            duration={
              isCurrentEpisode ? duration : (episode.duration_seconds ?? 0)
            }
            speed={speed}
            sleepTimerRemaining={sleepTimerRemaining}
            onPlay={handlePlay}
            onSeek={handleSeek}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
            onPrevious={queueIndex > 0 ? playPrevious : undefined}
            onNext={queueIndex < queue.length - 1 ? playNext : undefined}
            onSpeedChange={handleSpeedChange}
            onSleepTimer={handleSleepTimer}
          />
        </div>
      </section>

      {/* ============================================ */}
      {/* ACTION BUTTONS */}
      {/* ============================================ */}
      <section className="px-4 py-6 bg-sand-50/80 dark:bg-ink-950">
        <div className="mx-auto max-w-3xl flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading || downloadedIds.has(episode.id)}
            className={cn(
              "relative flex items-center justify-center gap-2 overflow-hidden px-6 py-3 rounded-xl font-semibold text-sm motion-safe:transition-all motion-safe:duration-150 active:scale-[0.97] motion-reduce:active:scale-100",
              downloadedIds.has(episode.id)
                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                : "bg-forest-600 text-white hover:bg-forest-700 shadow-sm",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex-1 sm:flex-none",
            )}
            title={
              downloadedIds.has(episode.id)
                ? "Already downloaded"
                : "Download for offline listening"
            }
          >
            {isDownloading && (
              <span
                className="absolute bottom-0 left-0 h-1 bg-white/30 dark:bg-black/25"
                style={{
                  width: downloadIndeterminate ? "33%" : `${downloadPercent}%`,
                }}
                aria-hidden="true"
              />
            )}
            <Download
              size={18}
              fill={downloadedIds.has(episode.id) ? "currentColor" : "none"}
            />
            {isPaused
              ? "Resume download"
              : isDownloading
                ? downloadIndeterminate
                  ? "Downloading…"
                  : `Downloading ${downloadPercent}%`
                : downloadedIds.has(episode.id)
                  ? "Downloaded"
                  : "Download"}
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm motion-safe:transition-all motion-safe:duration-150 active:scale-[0.97] motion-reduce:active:scale-100",
              "bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-sm",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
              "flex-1 sm:flex-none",
            )}
            title="Share via WhatsApp"
          >
            <Image
              src="/icons/whatsapp.svg"
              alt="WhatsApp"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Share on WhatsApp
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm motion-safe:transition-all motion-safe:duration-150 active:scale-[0.97] motion-reduce:active:scale-100",
              "bg-sand-200 text-forest-700 hover:bg-sand-300 dark:bg-ink-800 dark:text-ink-100 dark:hover:bg-ink-700",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500",
              "flex-1 sm:flex-none",
            )}
            title="Copy link to clipboard"
          >
            <Share2 size={18} />
            Copy Link
          </button>
        </div>
      </section>

      {/* ============================================ */}
      {/* DESCRIPTION */}
      {/* ============================================ */}
      {episode.description && (
        <section className="px-4 py-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-lg font-semibold text-forest-900 mb-4 dark:text-ink-100">
              About this lecture
            </h2>
            <div className="rounded-2xl border border-sand-200/60 bg-sand-50 p-5 dark:border-ink-700/50 dark:bg-ink-900">
              <p className="text-sm leading-relaxed text-forest-700 whitespace-pre-line dark:text-ink-500">
                {episode.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ============================================ */}
      {/* MORE FROM THIS SERIES */}
      {/* ============================================ */}
      {moreEpisodes.length > 0 && (
        <section className="px-4 py-8 border-t border-sand-200/60 dark:border-ink-700/40">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-forest-900 dark:text-ink-100">
                More from this series
              </h2>
              {episode.series && episode.scholar && (
                <Link
                  href={`/scholars/${episode.scholar.slug}/${episode.series.slug}`}
                  className="text-sm font-semibold text-forest-600 hover:text-forest-700 transition-colors dark:text-ink-500 dark:hover:text-ink-100"
                >
                  View all &rarr;
                </Link>
              )}
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3">
              {moreEpisodes.map((e) => (
                <div key={e.id} className="flex-shrink-0 md:flex-shrink">
                  <AudioCard episode={e} variant="card" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
