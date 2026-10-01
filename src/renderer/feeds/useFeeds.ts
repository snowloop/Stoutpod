import { useEffect, useState } from "react";
import { getDatabase } from "../db/database";
import type { EpisodeDocType, FeedDocType } from "../db/schemas";

// Subscribes to a reactive RxDB query for the lifetime of the component.
function useQuery<T>(
  createQuery: (database: Awaited<ReturnType<typeof getDatabase>>) => {
    $: { subscribe(next: (docs: { toJSON(): unknown }[]) => void): { unsubscribe(): void } };
  },
  deps: unknown[],
): T[] | undefined {
  const [results, setResults] = useState<T[]>();

  useEffect(() => {
    let subscription: { unsubscribe(): void } | undefined;
    let cancelled = false;

    setResults(undefined);
    void getDatabase().then((database) => {
      if (cancelled) {
        return;
      }
      subscription = createQuery(database).$.subscribe((docs) => {
        setResults(docs.map((doc) => doc.toJSON() as T));
      });
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return results;
}

export function useFeeds() {
  return useQuery<FeedDocType>(
    (database) => database.feeds.find({ sort: [{ title: "asc" }] }),
    [],
  );
}

export function useEpisodes(feedId: string | undefined) {
  return useQuery<EpisodeDocType>(
    (database) =>
      database.episodes.find({
        selector: { feedId: feedId ?? "" },
        sort: [{ publishedAt: "desc" }],
      }),
    [feedId],
  );
}
