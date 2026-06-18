#!/usr/bin/env node
/** Bundle dashboard ES modules into a single file for production. */
import { execSync } from "child_process";
import path from "path";

const root = path.resolve("dashboard/static");
const entry = path.join(root, "js/main.js");
const out = path.join(root, "app.bundle.js");

execSync(
  `npx esbuild "${entry}" --bundle --format=esm --outfile="${out}" --minify`,
  { stdio: "inherit", cwd: path.resolve(".") },
);
console.log("Wrote", out);
