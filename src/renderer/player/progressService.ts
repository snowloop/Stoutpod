import { getDatabase } from "../db/database";
import type { ProgressDocType } from "../db/schemas";

export async function getProgress(episodeId: string): Promise<ProgressDocType | undefined> {
  const database = await getDatabase();
  const doc = await database.progress.findOne(episodeId).exec();
  return doc?.toJSON() as ProgressDocType | undefined;
}

export async function saveProgress(
  episodeId: string,
  positionSeconds: number,
  durationSeconds: number,
  completed = false,
): Promise<void> {
  const database = await getDatabase();
  await database.progress.upsert({
    episodeId,
    positionSeconds,
    durationSeconds,
    completed,
    updatedAt: Date.now(),
  });
}
