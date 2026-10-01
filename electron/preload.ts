import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("stoutpod", {
  platform: process.platform,
});