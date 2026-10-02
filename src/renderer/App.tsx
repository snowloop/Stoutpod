import { useState } from "react";
import { Cover } from "./components/Cover";
import { resolveArtwork } from "./feeds/artwork";
import { AddFeedForm } from "./feeds/AddFeedForm";
import { refreshFeed, unsubscribeFromFeed } from "./feeds/feedService";
import { useEpisodes, useFeeds } from "./feeds/useFeeds";
import { formatTime } from "./player/formatTime";
import { usePlayer } from "./player/PlayerContext";
import { PlayerBar } from "./player/PlayerBar";
import { useProgress } from "./player/useProgress";

function formatDate(timestamp: number): string {
  return timestamp > 0 ? new Date(timestamp).toLocaleDateString() : "";
}

export function App() {
  const feeds = useFeeds();
  console.log("hey", feeds)
  const [selectedFeedId, setSelectedFeedId] = useState<string>();
  const episodes = useEpisodes(selectedFeedId);
  const selectedFeed = feeds?.find((feed) => feed.id === selectedFeedId);
  const progress = useProgress();
  const player = usePlayer();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setError(undefined);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function handleUnsubscribe(feedId: string) {
    void runAction(async () => {
      await unsubscribeFromFeed(feedId);
      setSelectedFeedId((current) => (current === feedId ? undefined : current));
    });
  }

  return (
    <>
    <main style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", padding: "1rem 1rem 5rem" }}>
      <section>
        <h1>Stoutpod</h1>
        <AddFeedForm onSubscribed={setSelectedFeedId} />
        <h2>Subscriptions</h2>
        {error && <p role="alert">{error}</p>}
        {feeds === undefined ? (
          <p>Loading...</p>
        ) : feeds.length === 0 ? (
          <p>No subscriptions yet.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {feeds.map((feed) => (
              <li key={feed.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Cover src={feed.imageUrl} title={feed.title} size={40} />
                <span>
                <button
                  type="button"
                  onClick={() => setSelectedFeedId(feed.id)}
                  aria-current={feed.id === selectedFeedId}
                  style={{ fontWeight: feed.id === selectedFeedId ? "bold" : "normal" }}
                >
                  {feed.title}
                </button>{" "}
                <button type="button" disabled={busy} onClick={() => void runAction(() => refreshFeed(feed.id))}>
                  Refresh
                </button>{" "}
                <button type="button" disabled={busy} onClick={() => handleUnsubscribe(feed.id)}>
                  Unsubscribe
                </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Episodes</h2>
        {selectedFeed && (
          <header style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <Cover src={selectedFeed.imageUrl} title={selectedFeed.title} size={96} />
            <strong>{selectedFeed.title}</strong>
          </header>
        )}
        {selectedFeedId === undefined ? (
          <p>Select a subscription to see its episodes.</p>
        ) : episodes === undefined ? (
          <p>Loading...</p>
        ) : episodes.length === 0 ? (
          <p>No episodes found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {episodes.map((episode) => {
              const saved = progress.get(episode.id);
              const isCurrent = player.current?.id === episode.id;
              const isPlayingThis = isCurrent && player.isPlaying;
              return (
                <li key={episode.id} style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Cover src={resolveArtwork(episode, selectedFeed)} title={episode.title} size={48} />
                  <span>
                  <button
                    type="button"
                    onClick={() => (isPlayingThis ? player.pause() : void player.play(episode))}
                  >
                    {isPlayingThis ? "Pause" : "Play"}
                  </button>{" "}
                  {episode.title} <small>{formatDate(episode.publishedAt)}</small>{" "}
                  {saved?.completed ? (
                    <small>Played</small>
                  ) : saved && saved.positionSeconds > 0 ? (
                    <small>
                      {formatTime(saved.positionSeconds)}
                      {saved.durationSeconds > 0 && ` / ${formatTime(saved.durationSeconds)}`}
                    </small>
                  ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
    <PlayerBar feeds={feeds} />
    </>
  );
}