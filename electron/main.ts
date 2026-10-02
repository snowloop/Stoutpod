import { app, BrowserWindow, nativeImage } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { registerFeedHandlers } from "./feeds";

const currentDirectory = dirname(fileURLToPath(import.meta.url));

// Electron cannot load SVG, and macOS does not round dock icons, so build/dock.png is pre-rounded.
const icon = nativeImage.createFromPath(join(currentDirectory, "../../build/icon.png"));


function createWindow() {
  const window = new BrowserWindow({
    width: 1100,
    height: 760,
    ...(!icon.isEmpty() && { icon }),
    webPreferences: {
      preload: join(currentDirectory, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
  });

  const rendererUrl = process.env.VITE_DEV_SERVER_URL;
  if (rendererUrl) {
    void window.loadURL(rendererUrl);
    void window.webContents.openDevTools();
  } else {
    void window.loadFile(join(currentDirectory, "../index.html"));
  }
}

app.whenReady().then(() => {
  if (!icon.isEmpty()) {
    app.dock?.setIcon(icon);
  }
  registerFeedHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});