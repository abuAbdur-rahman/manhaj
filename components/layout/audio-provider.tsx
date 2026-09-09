"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  getDownloadById,
  getPlaybackHistory,
  getResumePosition,
  removePlaybackHistory,
  savePlaybackHistory,
} from "@/lib/downloads-db";
import { usePlayerStore } from "@/store/player";

export function AudioProvider() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const playingRef = useRef(false);
  const sourceGenerationRef = useRef(0);
  const readyEpisodeIdRef = useRef<string | null>(null);
  const progressRef = useRef({
    episodeId: null as string | null,
    currentTime: 0,
    duration: 0,
    speed: 1,
  });
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    speed,
    setPlaying,
    setCurrentTime,
    setDuration,
    setLoading,
    setAudioRef,
    playNext,
  } = usePlayerStore();

  playingRef.current = isPlaying;

  useEffect(() => {
    setAudioRef(audioRef.current);
    return () => setAudioRef(null);
  }, [setAudioRef]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentEpisode) {
      audio.pause();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      audio.removeAttribute("src");
      audio.load();
      readyEpisodeIdRef.current = null;
      return;
    }

    const generation = ++sourceGenerationRef.current;
    const episodeId = currentEpisode.id;
    let cancelled = false;

    audio.pause();
    readyEpisodeIdRef.current = null;
    audio.removeAttribute("src");
    audio.load();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    const isCurrent = () =>
      !cancelled && sourceGenerationRef.current === generation;

    const resolveAndPlay = async () => {
      let local: Awaited<ReturnType<typeof getDownloadById>> = null;
      try {
        local = await getDownloadById(currentEpisode.id);
      } catch {
        // IDB unavailable — stream from network
      }

      if (!isCurrent()) return;

      if (local?.audioBlob) {
        const url = URL.createObjectURL(local.audioBlob);
        if (!isCurrent()) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrlRef.current = url;
        audio.src = url;
      } else {
        if (currentEpisode.audio_url) {
          audio.src = currentEpisode.audio_url;
        } else {
          setPlaying(false);
          setLoading(false);
          return;
        }
      }
      audio.load();
      readyEpisodeIdRef.current = episodeId;

      try {
        const history = await getPlaybackHistory(currentEpisode.id);
        if (isCurrent()) {
          const resume = getResumePosition(
            history,
            currentEpisode.duration_seconds ?? 0,
          );
          if (resume !== null) setCurrentTime(resume);
        }
      } catch {
        // Playback history is optional when IndexedDB is unavailable.
      }

      if (!isCurrent()) return;

      if (playingRef.current) {
        try {
          await audio.play();
        } catch {
          setPlaying(false);
        }
      }
    };

    void resolveAndPlay();

    return () => {
      cancelled = true;
      if (sourceGenerationRef.current === generation) {
        readyEpisodeIdRef.current = null;
      }
    };
  }, [currentEpisode, setCurrentTime, setPlaying, setLoading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    audio.playbackRate = speed;
    if (progressRef.current.episodeId === currentEpisode.id) {
      progressRef.current.speed = speed;
    }
  }, [speed, currentEpisode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    if (Math.abs(audio.currentTime - currentTime) > 0.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime, currentEpisode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    if (isPlaying) {
      if (readyEpisodeIdRef.current === currentEpisode.id) {
        audio.play().catch(() => setPlaying(false));
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentEpisode, setPlaying]);

  useEffect(() => {
    if (!currentEpisode) return;

    const save = () => {
      const latest = progressRef.current;
      if (latest.episodeId !== currentEpisode.id) return;
      if (latest.currentTime < 10) return;
      const effectiveDuration =
        latest.duration || currentEpisode.duration_seconds || 0;
      if (
        effectiveDuration > 0 &&
        latest.currentTime >= effectiveDuration - 30
      ) {
        void removePlaybackHistory(currentEpisode.id);
        return;
      }
      void savePlaybackHistory({
        episodeId: currentEpisode.id,
        episodeSlug: currentEpisode.slug,
        position: latest.currentTime,
        duration: effectiveDuration,
        speed: latest.speed,
        updatedAt: new Date().toISOString(),
      });
    };

    const interval = window.setInterval(save, 15_000);
    const onPageHide = () => save();
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("pagehide", onPageHide);
      save();
    };
  }, [currentEpisode]);

  const onError = useCallback(() => setLoading(false), [setLoading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    const episodeId = currentEpisode.id;
    progressRef.current = {
      episodeId,
      currentTime: 0,
      duration: currentEpisode.duration_seconds ?? 0,
      speed,
    };

    const onTimeUpdate = () => {
      if (readyEpisodeIdRef.current !== episodeId) return;
      progressRef.current.currentTime = audio.currentTime;
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      if (readyEpisodeIdRef.current !== episodeId) return;
      progressRef.current.duration = audio.duration;
      setDuration(audio.duration);
      setLoading(false);
    };
    const onEnded = () => {
      void removePlaybackHistory(episodeId);
      playNext();
    };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [
    currentEpisode,
    speed,
    setCurrentTime,
    setDuration,
    setLoading,
    playNext,
  ]);

  return (
    // biome-ignore lint/a11y/useMediaCaption: Lecture audio has no caption/subtitle track
    <audio
      ref={audioRef}
      preload="metadata"
      onError={onError}
      aria-label="Audio player"
    />
  );
}
