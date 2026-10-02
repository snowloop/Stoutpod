import { useEffect, useState } from "react";
import { getDatabase } from "../db/database";
import type { ProgressDocType } from "../db/schemas";

// Reactive map of episode id to saved progress.
export function useProgress(): Map<string, ProgressDocType> {
  const [progress, setProgress] = useState<Map<string, ProgressDocType>>(() => new Map());

  useEffect(() => {
    let cancelled = false;
    let subscription: { unsubscribe(): void } | undefined;

    void getDatabase().then((database) => {
      if (cancelled) {
        return;
      }
      subscription = database.progress.find().$.subscribe((docs) => {
        setProgress(new Map(docs.map((doc) => [doc.episodeId, doc.toJSON() as ProgressDocType])));
      });
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  return progress;
}
