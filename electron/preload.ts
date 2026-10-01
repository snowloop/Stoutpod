import { contextBridge, ipcRenderer } from "electron";
import { FETCH_FEED_CHANNEL } from "./channels";

contextBridge.exposeInMainWorld("stoutpod", {
  platform: process.platform,
  fetchFeed: (url: string): Promise<string> => ipcRenderer.invoke(FETCH_FEED_CHANNEL, url),
});