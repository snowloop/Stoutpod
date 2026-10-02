import { createContext, useContext } from "react";
import type { EpisodeDocType } from "../db/schemas";

export type PlayerState = {
  current: EpisodeDocType | undefined;
  isPlaying: boolean;
  position: number;
  duration: number;
  play(episode: EpisodeDocType): Promise<void>;
  pause(): void;
  seek(seconds: number): void;
};

export const PlayerContext = createContext<PlayerState | undefined>(undefined);

export function usePlayer(): PlayerState {
  const player = useContext(PlayerContext);
  if (!player) {
    throw new Error("usePlayer must be used inside a PlayerProvider.");
  }
  return player;
}
