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
      <main className={player.current ? "app has-player" : "app"}>
        <aside className="sidebar">
          <h1>Stoutpod</h1>
          <AddFeedForm onSubscribed={setSelectedFeedId} />
          <h2>Subscriptions</h2>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {feeds === undefined ? (
            <p className="muted">Loading...</p>
          ) : feeds.length === 0 ? (
            <p className="muted">No subscriptions yet.</p>
          ) : (
            <ul>
              {feeds.map((feed) => (
                <li key={feed.id} className={feed.id === selectedFeedId ? "feed active" : "feed"}>
                  <button
                    type="button"
                    className="feed-select"
                    onClick={() => setSelectedFeedId(feed.id)}
                    aria-current={feed.id === selectedFeedId}
                  >
                    <Cover src={feed.imageUrl} title={feed.title} size={40} />
                    <span>{feed.title}</span>
                  </button>
                  <div className="feed-actions">
                    <button
                      type="button"
                      className="link-button"
                      disabled={busy}
                      onClick={() => void runAction(() => refreshFeed(feed.id))}
                    >
                      Refresh
                    </button>
                    <button
                      type="button"
                      className="link-button"
                      disabled={busy}
                      onClick={() => handleUnsubscribe(feed.id)}
                    >
                      Unsubscribe
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <section className="content">
          {selectedFeed && (
            <header className="feed-header">
              <Cover src={selectedFeed.imageUrl} title={selectedFeed.title} size={96} />
              <h2>{selectedFeed.title}</h2>
            </header>
          )}
          {selectedFeedId === undefined ? (
            <p className="muted">Select a subscription to see its episodes.</p>
          ) : episodes === undefined ? (
            <p className="muted">Loading...</p>
          ) : episodes.length === 0 ? (
            <p className="muted">No episodes found.</p>
          ) : (
            <ul>
              {episodes.map((episode) => {
                const saved = progress.get(episode.id);
                const isPlayingThis = player.current?.id === episode.id && player.isPlaying;
                return (
                  <li key={episode.id} className="episode" 
                  onClick={() => (isPlayingThis ? player.pause() : void player.play(episode))}
                  
                  >
                    <Cover src={resolveArtwork(episode, selectedFeed)} title={episode.title} size={48} />
                    <div className="episode-info">
                      <div className="episode-title">{episode.title}</div>
                      <div className="muted">
                        {formatDate(episode.publishedAt)}
                        {saved?.completed
                          ? " · Played"
                          : saved && saved.positionSeconds > 0
                            ? ` · ${formatTime(saved.positionSeconds)}${saved.durationSeconds > 0 ? ` / ${formatTime(saved.durationSeconds)}` : ""}`
                            : ""}
                      </div>
                    </div>
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