import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist");

const common = { bundle: true, loader: { ".md": "text" }, target: "chrome120", logLevel: "info" };

await build({ ...common, entryPoints: ["src/background.js"], outfile: "dist/background.js", format: "esm" });
await build({ ...common, entryPoints: ["src/content.js"], outfile: "dist/content.js", format: "iife" });
await build({ ...common, entryPoints: ["src/sidepanel.js"], outfile: "dist/sidepanel.js", format: "iife" });

for (const f of ["manifest.json", "sidepanel.html", "sidepanel.css"]) cpSync(`src/${f}`, `dist/${f}`);
