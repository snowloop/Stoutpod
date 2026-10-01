import { app, ipcMain, type WebContents } from "electron";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { Subject } from "rxjs";
import { exposeRxStorageRemote, type MessageToRemote } from "rxdb/plugins/storage-remote";
import { getRxStorageSQLiteTrial, getSQLiteBasicsNodeNative } from "rxdb/plugins/storage-sqlite";
import { STORAGE_CHANNEL } from "./channels";

export function exposeSqliteStorage() {
  const userData = app.getPath("userData");
  mkdirSync(userData, { recursive: true });

  // Swap for getRxStorageSQLite from "rxdb-premium/plugins/storage-sqlite" to leave the trial limits.
  const storage = getRxStorageSQLiteTrial({
    sqliteBasics: getSQLiteBasicsNodeNative(DatabaseSync),
    databaseNamePrefix: `${userData}/`,
  });

  const messages$ = new Subject<MessageToRemote>();
  const renderers = new Set<WebContents>();

  ipcMain.on(STORAGE_CHANNEL, (event, message: MessageToRemote) => {
    const sender = event.sender;
    if (!renderers.has(sender)) {
      renderers.add(sender);
      sender.once("destroyed", () => renderers.delete(sender));
    }
    messages$.next(message);
  });

  exposeRxStorageRemote({
    storage,
    messages$,
    send(message) {
      for (const renderer of renderers) {
        if (!renderer.isDestroyed()) {
          renderer.send(STORAGE_CHANNEL, message);
        }
      }
    },
  });
}
