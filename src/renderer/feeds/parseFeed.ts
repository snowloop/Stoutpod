import { XMLParser } from "fast-xml-parser";
import type { EpisodeDocType, FeedDocType } from "../db/schemas";

export type ParsedFeed = {
  feed: FeedDocType;
  episodes: EpisodeDocType[];
};

type XmlNode = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Keep GUIDs and titles as strings instead of coercing numeric-looking values.
  parseTagValue: false,
  isArray: (name) => name === "item",
});

function isNode(value: unknown): value is XmlNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | undefined {
  const raw = isNode(value) ? value["#text"] : value;
  if (typeof raw !== "string" && typeof raw !== "number") {
    return undefined;
  }
  const trimmed = String(raw).trim();
  return trimmed === "" ? undefined : trimmed;
}

function attribute(node: unknown, name: string): string | undefined {
  return isNode(node) ? text(node[`@_${name}`]) : undefined;
}

// Accepts "HH:MM:SS", "MM:SS" or plain seconds.
function parseDuration(value: unknown): number | undefined {
  const raw = text(value);
  if (!raw) {
    return undefined;
  }
  const parts = raw.split(":").map(Number);
  if (parts.length > 3 || parts.some((part) => !Number.isFinite(part) || part < 0)) {
    return undefined;
  }
  return Math.round(parts.reduce((total, part) => total * 60 + part, 0));
}

function parseDate(value: unknown): number {
  const raw = text(value);
  const time = raw ? Date.parse(raw) : Number.NaN;
  return Number.isFinite(time) && time >= 0 ? time : 0;
}

function parseEpisode(item: XmlNode, feedId: string): EpisodeDocType | undefined {
  const audioUrl = attribute(item["enclosure"], "url");
  if (!audioUrl) {
    return undefined;
  }

  const guid = text(item["guid"]) ?? audioUrl;
  const episode: EpisodeDocType = {
    id: `${feedId}|${guid}`,
    feedId,
    guid,
    title: text(item["title"]) ?? "Untitled episode",
    audioUrl,
    publishedAt: parseDate(item["pubDate"]),
  };

  const description = text(item["description"]) ?? text(item["itunes:summary"]);
  const durationSeconds = parseDuration(item["itunes:duration"]);
  const imageUrl = attribute(item["itunes:image"], "href");
  return {
    ...episode,
    ...(description !== undefined && { description }),
    ...(durationSeconds !== undefined && { durationSeconds }),
    ...(imageUrl !== undefined && { imageUrl }),
  };
}

export function parseFeed(xml: string, feedUrl: string): ParsedFeed {
  const rss = (parser.parse(xml) as XmlNode)["rss"];
  const channelNode = isNode(rss) ? rss["channel"] : undefined;
  if (!isNode(channelNode)) {
    throw new Error("Not a valid RSS feed.");
  }

  const description = text(channelNode["description"]);
  const imageUrl =
    attribute(channelNode["itunes:image"], "href") ??
    text(isNode(channelNode["image"]) ? channelNode["image"]["url"] : undefined);
  const link = text(channelNode["link"]);

  const feed: FeedDocType = {
    id: feedUrl,
    title: text(channelNode["title"]) ?? feedUrl,
    lastFetchedAt: Date.now(),
    ...(description !== undefined && { description }),
    ...(imageUrl !== undefined && { imageUrl }),
    ...(link !== undefined && { link }),
  };

  const items = Array.isArray(channelNode["item"]) ? channelNode["item"] : [];
  const episodes = items
    .filter(isNode)
    .map((item) => parseEpisode(item, feedUrl))
    .filter((episode): episode is EpisodeDocType => episode !== undefined);

  return { feed, episodes };
}
