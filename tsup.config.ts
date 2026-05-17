import { defineConfig } from "tsup";

export default defineConfig([{
  entry: ["src/extension.ts"],
  format: "cjs",
  platform: 'node',
  external: ["vscode"],
  outDir: "dist",
  sourcemap: true,
  clean: true,
  target: "es2022"
},
{
    entry: { webview: "src/webview.ts" },
    format: "iife",
    platform: "browser",
    outDir: "dist",
    sourcemap: true,
    target: "es2022",
}
]);