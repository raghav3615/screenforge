import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const inputSvg = resolve("public", "icon.svg");
const outputDir = resolve("build");
const outputPng = resolve(outputDir, "icon.png");
const outputIco = resolve(outputDir, "icon.ico");

await mkdir(outputDir, { recursive: true });

// Generate 512x512 PNG for electron-builder
await sharp(inputSvg)
  .resize(512, 512)
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPng);

console.log("Generated", outputPng);

// Generate multiple sizes for Windows ICO
// ICO needs 16, 32, 48, 64, 128, 256 sizes
const icoSizes = [16, 32, 48, 64, 128, 256];
const icoBuffers = await Promise.all(
  icoSizes.map(size =>
    sharp(inputSvg)
      .resize(size, size)
      .png()
      .toBuffer()
  )
);

// Simple ICO file creation (uncompressed PNG icons)
// ICO format: header + directory entries + image data
const createIco = (pngBuffers, sizes) => {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;
  
  // Calculate offsets
  let offset = headerSize + dirSize;
  const offsets = pngBuffers.map(buf => {
    const currentOffset = offset;
    offset += buf.length;
    return currentOffset;
  });
  
  // ICO Header
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);      // Reserved
  header.writeUInt16LE(1, 2);      // Type: 1 = ICO
  header.writeUInt16LE(numImages, 4); // Number of images
  
  // Directory entries
  const directory = Buffer.alloc(dirSize);
  for (let i = 0; i < numImages; i++) {
    const entryOffset = i * dirEntrySize;
    const size = sizes[i];
    directory.writeUInt8(size >= 256 ? 0 : size, entryOffset);     // Width (0 = 256)
    directory.writeUInt8(size >= 256 ? 0 : size, entryOffset + 1); // Height (0 = 256)
    directory.writeUInt8(0, entryOffset + 2);    // Color palette
    directory.writeUInt8(0, entryOffset + 3);    // Reserved
    directory.writeUInt16LE(1, entryOffset + 4); // Color planes
    directory.writeUInt16LE(32, entryOffset + 6); // Bits per pixel
    directory.writeUInt32LE(pngBuffers[i].length, entryOffset + 8); // Image size
    directory.writeUInt32LE(offsets[i], entryOffset + 12); // Image offset
  }
  
  return Buffer.concat([header, directory, ...pngBuffers]);
};

const icoBuffer = createIco(icoBuffers, icoSizes);
await import("node:fs/promises").then(fs => fs.writeFile(outputIco, icoBuffer));

console.log("Generated", outputIco);
