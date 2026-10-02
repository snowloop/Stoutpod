import { formatTime } from "./formatTime";
import { usePlayer } from "./PlayerContext";

export function PlayerBar() {
  const { current, isPlaying, position, duration, play, pause, seek } = usePlayer();

  if (!current) {
    return null;
  }

  return (
    <footer
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "0.75rem 1rem",
        background: "Canvas",
        borderTop: "1px solid GrayText",
      }}
    >
      <button type="button" onClick={() => (isPlaying ? pause() : void play(current))}>
        {isPlaying ? "Pause" : "Play"}
      </button>
      <strong style={{ flex: "0 1 280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {current.title}
      </strong>
      <small>{formatTime(position)}</small>
      <input
        type="range"
        aria-label="Seek"
        min={0}
        max={duration || 0}
        step={1}
        value={Math.min(position, duration || 0)}
        disabled={duration === 0}
        onChange={(event) => seek(Number(event.target.value))}
        style={{ flex: 1 }}
      />
      <small>{formatTime(duration)}</small>
    </footer>
  );
}
