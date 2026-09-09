"use client";

import { useCallback, useEffect, useRef } from "react";
import { listDownloads } from "@/lib/downloads-db";
import { usePlayerStore } from "@/store/player";

export function AudioProvider() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const playingRef = useRef(false);
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
      return;
    }

    let cancelled = false;

    const resolveAndPlay = async () => {
      let downloads: Awaited<ReturnType<typeof listDownloads>> = [];
      try {
        downloads = await listDownloads();
      } catch {
        // IDB unavailable — stream from network
      }

      if (cancelled) return;

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      const local = downloads.find((d) => d.episode.id === currentEpisode.id);

      if (local?.audioBlob) {
        const url = URL.createObjectURL(local.audioBlob);
        objectUrlRef.current = url;
        audio.src = url;
      } else {
        audio.src = currentEpisode.audio_url;
      }
      audio.load();

      if (cancelled) return;

      if (playingRef.current) {
        try {
          await audio.play();
        } catch {
          setPlaying(false);
        }
      }
    };

    if (audio.src) {
      const currentSrc = audio.src;
      if (
        !currentSrc.startsWith("blob:") &&
        currentSrc !== currentEpisode.audio_url
      ) {
        resolveAndPlay();
      } else if (currentSrc.startsWith("blob:") && !objectUrlRef.current) {
        resolveAndPlay();
      }
    } else {
      resolveAndPlay();
    }

    return () => {
      cancelled = true;
    };
  }, [currentEpisode, setPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    audio.playbackRate = speed;
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
      if (audio.readyState >= 2 || audio.src) {
        audio.play().catch(() => setPlaying(false));
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentEpisode, setPlaying]);

  const onError = useCallback(() => setLoading(false), [setLoading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };
    const onEnded = () => setPlaying(false);
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
  }, [currentEpisode, setCurrentTime, setDuration, setLoading, setPlaying]);

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
