import { useState } from "react";
import { AddFeedForm } from "./feeds/AddFeedForm";
import { refreshFeed, unsubscribeFromFeed } from "./feeds/feedService";
import { useEpisodes, useFeeds } from "./feeds/useFeeds";

function formatDate(timestamp: number): string {
  return timestamp > 0 ? new Date(timestamp).toLocaleDateString() : "";
}

export function App() {
  const feeds = useFeeds();
  const [selectedFeedId, setSelectedFeedId] = useState<string>();
  const episodes = useEpisodes(selectedFeedId);
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
    <main style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", padding: "1rem" }}>
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
              <li key={feed.id}>
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Episodes</h2>
        {selectedFeedId === undefined ? (
          <p>Select a subscription to see its episodes.</p>
        ) : episodes === undefined ? (
          <p>Loading...</p>
        ) : episodes.length === 0 ? (
          <p>No episodes found.</p>
        ) : (
          <ul>
            {episodes.map((episode) => (
              <li key={episode.id}>
                {episode.title} <small>{formatDate(episode.publishedAt)}</small>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}