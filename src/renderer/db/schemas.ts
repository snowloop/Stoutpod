import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const feedSchemaLiteral = {
  title: "feed",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    // The feed URL doubles as the primary key.
    id: { type: "string", maxLength: 2048 },
    title: { type: "string" },
    description: { type: "string" },
    imageUrl: { type: "string" },
    link: { type: "string" },
    lastFetchedAt: { type: "number" },
  },
  required: ["id", "title"],
} as const;

export const episodeSchemaLiteral = {
  title: "episode",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    // Composite of feed id and episode GUID, so refreshes upsert instead of duplicating.
    id: { type: "string", maxLength: 4200 },
    feedId: { type: "string", maxLength: 2048 },
    guid: { type: "string", maxLength: 2048 },
    title: { type: "string" },
    description: { type: "string" },
    audioUrl: { type: "string" },
    publishedAt: {
      type: "number",
      minimum: 0,
      maximum: 8_640_000_000_000_000,
      multipleOf: 1,
    },
    durationSeconds: { type: "number" },
  },
  required: ["id", "feedId", "guid", "title", "audioUrl", "publishedAt"],
  indexes: [["feedId", "publishedAt"]],
} as const;

// Kept apart from episodes so a feed refresh never overwrites listening state.
export const progressSchemaLiteral = {
  title: "progress",
  version: 0,
  primaryKey: "episodeId",
  type: "object",
  properties: {
    episodeId: { type: "string", maxLength: 4200 },
    positionSeconds: { type: "number", minimum: 0 },
    durationSeconds: { type: "number", minimum: 0 },
    completed: { type: "boolean" },
    updatedAt: { type: "number" },
  },
  required: ["episodeId", "positionSeconds", "durationSeconds", "completed", "updatedAt"],
} as const;

const typedFeedSchema = toTypedRxJsonSchema(feedSchemaLiteral);
const typedEpisodeSchema = toTypedRxJsonSchema(episodeSchemaLiteral);
const typedProgressSchema = toTypedRxJsonSchema(progressSchemaLiteral);

export type FeedDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof typedFeedSchema>;
export type EpisodeDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof typedEpisodeSchema>;
export type ProgressDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof typedProgressSchema>;

export const feedSchema: RxJsonSchema<FeedDocType> = feedSchemaLiteral;
export const episodeSchema: RxJsonSchema<EpisodeDocType> = episodeSchemaLiteral;
export const progressSchema: RxJsonSchema<ProgressDocType> = progressSchemaLiteral;
