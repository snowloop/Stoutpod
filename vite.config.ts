import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import electron from "vite-plugin-electron/simple";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(),
        electron({
            main: {
                entry: "electron/main.ts",
                vite: { build: { outDir: "dist/electron" } },
            },
            preload: {
                input: "electron/preload.ts",
                // Sandboxed preloads must be CommonJS; the .cjs extension survives "type": "module".
                vite: {
                    build: {
                        outDir: "dist/electron",
                        rolldownOptions: {
                            output: {
                                format: "cjs",
                                entryFileNames: "[name].cjs",
                                chunkFileNames: "[name].cjs",
                            },
                        },
                    },
                },
            },
        }),
    ],
    server: {
        host: "0.0.0.0",
        port: 5173,
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                renderer: resolve(__dirname, "index.html")
            },
            output: {
                entryFileNames: () => {
                    return "assets/[name]-[hash].js";
                },
                chunkFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash][extname]",
            }
        },
    },
});
