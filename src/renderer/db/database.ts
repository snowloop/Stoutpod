import { createRxDatabase, type RxCollection, type RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import {
  episodeSchema,
  feedSchema,
  progressSchema,
  type EpisodeDocType,
  type FeedDocType,
  type ProgressDocType,
} from "./schemas";

export type StoutpodCollections = {
  feeds: RxCollection<FeedDocType>;
  episodes: RxCollection<EpisodeDocType>;
  progress: RxCollection<ProgressDocType>;
};

export type StoutpodDatabase = RxDatabase<StoutpodCollections>;

let databasePromise: Promise<StoutpodDatabase> | undefined;

async function createDatabase(): Promise<StoutpodDatabase> {
  const database = await createRxDatabase<StoutpodCollections>({
    name: "stoutpod",
    storage: getRxStorageDexie(),
  });

  await database.addCollections({
    feeds: { schema: feedSchema },
    episodes: { schema: episodeSchema },
    progress: { schema: progressSchema },
  });

  return database;
}

export function getDatabase(): Promise<StoutpodDatabase> {
  databasePromise ??= createDatabase();
  return databasePromise;
}
