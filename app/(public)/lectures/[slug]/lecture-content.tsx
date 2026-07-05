"use client";

import { Download, ExternalLink, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EpisodeCard } from "@/components/episodes/episode-card";
import { PlayButton } from "@/components/player/play-button";
import { PlayerControls } from "@/components/player/player-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/audio";
import { downloadEpisode } from "@/lib/download";
import { usePlayerStore } from "@/store/player";
import type { Episode, Speed } from "@/types";

interface LectureContentProps {
  episode: Episode;
  moreEpisodes: Episode[];
}

const SLEEP_TIMER_OPTIONS = [15, 30, 60] as const;

export function LectureContent({ episode, moreEpisodes }: LectureContentProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [sleepTimerIndex, setSleepTimerIndex] = useState(-1);

  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    speed,
    isLoading,
    sleepTimerRemaining,
    audioRef,
    setEpisode,
    setPlaying,
    setCurrentTime,
    setSpeed,
    setSleepTimer,
    tickSleepTimer,
  } = usePlayerStore();

  const isCurrentEpisode = currentEpisode?.id === episode.id;

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
      if (audioRef) {
        audioRef.currentTime = time;
      }
    },
    [setCurrentTime, audioRef],
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
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadEpisode(episode);
    } catch (err) {
      console.error("Download failed:", err);
      toast.error(
        `Couldn't download "${episode.title}". Check your connection and storage space.`,
      );
    } finally {
      setIsDownloading(false);
    }
  }, [episode, isDownloading]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: episode.title,
          text: `Listen to "${episode.title}" by ${episode.scholar?.name} on Manhaj`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        console.error("Share failed:", error);
        toast.error(
          "Couldn't share this lecture. Check your sharing permissions.",
        );
      }
    }
  }, [episode]);

  const handleWhatsAppShare = useCallback(() => {
    const url = window.location.href;
    const text = `Listen to "${episode.title}" by ${episode.scholar?.name} on Manhaj`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }, [episode]);

  useEffect(() => {
    if (isCurrentEpisode && sleepTimerRemaining !== null) {
      const interval = setInterval(tickSleepTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [isCurrentEpisode, sleepTimerRemaining, tickSleepTimer]);

  const isThisEpisodePlaying = isCurrentEpisode && isPlaying;
  const isThisEpisodeLoading = isCurrentEpisode && isLoading;

  const recordedDate = episode.recorded_date
    ? new Date(episode.recorded_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-col items-center">
        <PlayButton
          isPlaying={isThisEpisodePlaying ?? false}
          isLoading={isThisEpisodeLoading}
          size="lg"
          onClick={handlePlay}
        />

        <h1 className="mt-6 text-center text-2xl font-semibold text-forest-900">
          {episode.title}
        </h1>

        <p className="mt-1 text-sm text-forest-700">
          {episode.scholar?.name}
          {episode.series && (
            <>
              <span className="mx-1.5 text-sand-300">·</span>
              {episode.series.title}
            </>
          )}
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="default">{episode.language}</Badge>
          {episode.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          <span className="font-mono text-xs text-sand-300">
            {formatDuration(episode.duration_seconds ?? 0)}
          </span>
        </div>
      </div>

      <PlayerControls
        isPlaying={isThisEpisodePlaying ?? false}
        isLoading={isThisEpisodeLoading ?? false}
        currentTime={isCurrentEpisode ? currentTime : 0}
        duration={isCurrentEpisode ? duration : (episode.duration_seconds ?? 0)}
        speed={speed}
        sleepTimerRemaining={sleepTimerRemaining}
        onPlay={handlePlay}
        onSeek={handleSeek}
        onSkipBack={handleSkipBack}
        onSkipForward={handleSkipForward}
        onSpeedChange={handleSpeedChange}
        onSleepTimer={handleSleepTimer}
        className="mt-8"
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download"}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleWhatsAppShare}
          className="w-full sm:w-auto"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Share via WhatsApp
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          aria-label="Share lecture link"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {episode.description && (
        <section className="mt-8 rounded-lg border border-sand-200 bg-sand-100 p-4">
          <p className="text-sm leading-relaxed text-forest-700 whitespace-pre-line">
            {episode.description}
          </p>
          {recordedDate && (
            <p className="mt-3 text-xs text-sand-300">
              Recorded: {recordedDate}
            </p>
          )}
        </section>
      )}

      {moreEpisodes.length > 0 && (
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-forest-900">
              More from this series
            </h2>
            {episode.series && episode.scholar && (
              <a
                href={`/scholars/${episode.scholar.slug}/${episode.series.slug}`}
                className="text-sm font-medium text-forest-500 hover:text-forest-600 transition-colors"
              >
                View all &rarr;
              </a>
            )}
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {moreEpisodes.map((e) => (
              <EpisodeCard key={e.id} episode={e} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
