import { Cover } from "../components/Cover";
import { resolveArtwork } from "../feeds/artwork";
import type { FeedDocType } from "../db/schemas";
import { formatTime } from "./formatTime";
import { usePlayer } from "./PlayerContext";

export function PlayerBar({ feeds }: { feeds: FeedDocType[] | undefined }) {
  const { current, isPlaying, position, duration, error, play, pause, seek } = usePlayer();

  if (!current) {
    return null;
  }

  return (
    <footer className="player">
      <Cover
        src={resolveArtwork(current, feeds?.find((feed) => feed.id === current.feedId))}
        title={current.title}
        size={48}
      />
      <button type="button" onClick={() => (isPlaying ? pause() : void play(current))}>
        {isPlaying ? "Pause" : "Play"}
      </button>
      <strong className="player-title">{current.title}</strong>
      <small className="muted">{formatTime(position)}</small>
      <input
        type="range"
        aria-label="Seek"
        min={0}
        max={duration || 0}
        step={1}
        value={Math.min(position, duration || 0)}
        disabled={duration === 0}
        onChange={(event) => seek(Number(event.target.value))}
      />
      <small className="muted">{formatTime(duration)}</small>
      {error && (
        <span role="alert" className="error">
          {error}
        </span>
      )}
    </footer>
  );
}
