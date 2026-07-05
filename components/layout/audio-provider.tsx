"use client";

import { useCallback, useEffect, useRef } from "react";
import { listDownloads } from "@/lib/downloads-db";
import { usePlayerStore } from "@/store/player";

export function AudioProvider() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const {
    currentEpisode,
    isPlaying,
    speed,
    setPlaying,
    setCurrentTime,
    setDuration,
    setLoading,
    setAudioRef,
  } = usePlayerStore();

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

    const resolveSrc = async () => {
      const downloads = await listDownloads();
      const local = downloads.find((d) => d.episode.id === currentEpisode.id);

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      if (local?.audioBlob) {
        const url = URL.createObjectURL(local.audioBlob);
        objectUrlRef.current = url;
        audio.src = url;
      } else {
        audio.src = currentEpisode.audio_url;
      }
      audio.load();
    };

    if (audio.src) {
      const currentSrc = audio.src;
      if (
        !currentSrc.startsWith("blob:") &&
        currentSrc !== currentEpisode.audio_url
      ) {
        resolveSrc();
      } else if (currentSrc.startsWith("blob:") && !objectUrlRef.current) {
        resolveSrc();
      }
    } else {
      resolveSrc();
    }
  }, [currentEpisode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    audio.playbackRate = speed;
  }, [speed, currentEpisode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    if (isPlaying) {
      audio.play().catch(() => setPlaying(false));
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
