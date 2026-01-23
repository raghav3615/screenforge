import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const inputSvg = resolve("public", "icon.svg");
const outputDir = resolve("build");
const outputPng = resolve(outputDir, "icon.png");

await mkdir(outputDir, { recursive: true });

await sharp(inputSvg)
  .resize(512, 512)
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPng);

console.log("Generated", outputPng);
