import { ipcMain } from "electron";
import { FETCH_FEED_CHANNEL } from "./channels";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_FEED_BYTES = 20 * 1024 * 1024;

async function fetchFeedXml(url: unknown): Promise<string> {
  if (typeof url !== "string") {
    throw new Error("Feed URL must be a string.");
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid feed URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Feed URL must use http or https.");
  }

  const response = await fetch(parsed, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Feed request failed with status ${response.status}.`);
  }

  const xml = await response.text();
  if (xml.length > MAX_FEED_BYTES) {
    throw new Error("Feed is too large.");
  }
  return xml;
}

export function registerFeedHandlers() {
  ipcMain.handle(FETCH_FEED_CHANNEL, (_event, url: unknown) => fetchFeedXml(url));
}
