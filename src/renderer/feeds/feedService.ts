import { getDatabase } from "../db/database";
import { parseFeed, type ParsedFeed } from "./parseFeed";

export async function saveFeed({ feed, episodes }: ParsedFeed): Promise<void> {
  const database = await getDatabase();

  await database.feeds.upsert(feed);

  // Episode ids are feedId|guid, so a refresh overwrites existing episodes instead of duplicating them.
  const { error } = await database.episodes.bulkUpsert(episodes);
  if (error.length > 0) {
    throw new Error(`Failed to save ${error.length} episode(s).`);
  }
}

export async function subscribeToFeed(url: string): Promise<ParsedFeed> {
  const xml = await window.stoutpod.fetchFeed(url);
  const parsed = parseFeed(xml, url);
  await saveFeed(parsed);
  return parsed;
}

// Feed id is the feed URL, so a refresh is a re-subscribe.
export async function refreshFeed(feedId: string): Promise<void> {
  await subscribeToFeed(feedId);
}

export async function unsubscribeFromFeed(feedId: string): Promise<void> {
  const database = await getDatabase();
  const episodes = await database.episodes.find({ selector: { feedId } }).exec();
  await database.progress.bulkRemove(episodes.map((episode) => episode.id));
  await database.episodes.find({ selector: { feedId } }).remove();
  await database.feeds.findOne(feedId).remove();
}
