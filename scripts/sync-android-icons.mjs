import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const sourceDir = path.resolve("src-tauri/icons/android");
const targetDir = path.resolve("src-tauri/gen/android/app/src/main/res");

if (!existsSync(sourceDir)) {
  console.error(`Android icon source not found: ${sourceDir}`);
  process.exit(1);
}

if (!existsSync(targetDir)) {
  console.error(`Android resource directory not found: ${targetDir}`);
  console.error("Run `npm run android:init` first.");
  process.exit(1);
}

for (const directory of [
  "mipmap-anydpi-v26",
  "mipmap-mdpi",
  "mipmap-hdpi",
  "mipmap-xhdpi",
  "mipmap-xxhdpi",
  "mipmap-xxxhdpi",
  "values",
]) {
  mkdirSync(path.join(targetDir, directory), { recursive: true });
}

cpSync(sourceDir, targetDir, { recursive: true, force: true });

console.log(`Synced Android icons from ${sourceDir} to ${targetDir}`);
