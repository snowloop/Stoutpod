import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { EpisodeDocType } from "../db/schemas";
import { PlayerContext, type PlayerState } from "./PlayerContext";
import { getProgress, saveProgress } from "./progressService";

const SAVE_INTERVAL_MS = 5000;
const COMPLETED_REMAINING_SECONDS = 10;

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined);
  const currentRef = useRef<EpisodeDocType | undefined>(undefined);
  // Guards against a slow progress lookup resolving after the user picked another episode.
  const playRequestRef = useRef(0);
  // False until the saved position is restored, so the initial position 0 never overwrites it.
  const canSaveRef = useRef(false);
  const lastSaveRef = useRef(0);

  const [current, setCurrent] = useState<EpisodeDocType>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const persistProgress = useCallback(() => {
    const audio = audioRef.current;
    const episode = currentRef.current;
    if (!audio || !episode || !canSaveRef.current) {
      return;
    }
    lastSaveRef.current = Date.now();
    const durationSeconds = Number.isFinite(audio.duration) ? audio.duration : (episode.durationSeconds ?? 0);
    const completed =
      audio.ended ||
      (durationSeconds > COMPLETED_REMAINING_SECONDS &&
        durationSeconds - audio.currentTime <= COMPLETED_REMAINING_SECONDS);
    // A completed episode restarts from the beginning next time.
    void saveProgress(episode.id, completed ? 0 : audio.currentTime, durationSeconds, completed);
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const syncDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handlers: [string, () => void][] = [
      ["play", () => setIsPlaying(true)],
      [
        "pause",
        () => {
          setIsPlaying(false);
          persistProgress();
        },
      ],
      [
        "ended",
        () => {
          setIsPlaying(false);
          persistProgress();
        },
      ],
      ["seeked", persistProgress],
      [
        "timeupdate",
        () => {
          setPosition(audio.currentTime);
          if (Date.now() - lastSaveRef.current >= SAVE_INTERVAL_MS) {
            persistProgress();
          }
        },
      ],
      ["durationchange", syncDuration],
      ["loadedmetadata", syncDuration],
    ];
    for (const [event, handler] of handlers) {
      audio.addEventListener(event, handler);
    }
    // Best effort: the write may not finish if the window closes immediately.
    window.addEventListener("beforeunload", persistProgress);

    return () => {
      window.removeEventListener("beforeunload", persistProgress);
      for (const [event, handler] of handlers) {
        audio.removeEventListener(event, handler);
      }
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = undefined;
    };
  }, [persistProgress]);

  const play = useCallback(async (episode: EpisodeDocType) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (currentRef.current?.id === episode.id) {
      await audio.play().catch(() => undefined);
      return;
    }

    const requestId = ++playRequestRef.current;
    const progress = await getProgress(episode.id);
    if (requestId !== playRequestRef.current || !audioRef.current) {
      return;
    }

    const startAt = progress && !progress.completed ? progress.positionSeconds : 0;
    persistProgress();
    canSaveRef.current = false;
    currentRef.current = episode;
    setCurrent(episode);
    setPosition(startAt);
    setDuration(episode.durationSeconds ?? 0);

    audio.src = episode.audioUrl;
    // currentTime can only be set reliably once metadata is available.
    audio.addEventListener(
      "loadedmetadata",
      () => {
        if (currentRef.current !== episode) {
          return;
        }
        if (startAt > 0) {
          audio.currentTime = startAt;
        }
        canSaveRef.current = true;
      },
      { once: true },
    );
    // Playback failures are reported through the audio "error" event (handled in C7).
    await audio.play().catch(() => undefined);
  }, [persistProgress]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const max = Number.isFinite(audio.duration) ? audio.duration : seconds;
    audio.currentTime = Math.min(Math.max(0, seconds), max);
    setPosition(audio.currentTime);
  }, []);

  const value = useMemo<PlayerState>(
    () => ({ current, isPlaying, position, duration, play, pause, seek }),
    [current, isPlaying, position, duration, play, pause, seek],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}
