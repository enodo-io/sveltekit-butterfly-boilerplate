#!/usr/bin/env node

/**
 * Generate all favicon PNGs and ICO from favicon.svg using sharp.
 *
 * Usage:  npm run generate:favicons
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const staticDir = resolve(__dirname, '..', 'static');
const svgPath = resolve(staticDir, 'favicon.svg');

// All PNG sizes matching the current naming convention: favicon-{width}.png
const PNG_SIZES = [16, 32, 48, 57, 60, 72, 76, 120, 144, 152, 180, 192, 512, 558];

// Sizes embedded inside favicon.ico (standard multi-resolution .ico)
const ICO_SIZES = [16, 32, 48];

/**
 * Build an ICO file buffer from an array of PNG buffers.
 * ICO format: https://en.wikipedia.org/wiki/ICO_(file_format)
 */
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const dataOffset = headerSize + entrySize * count;

  let totalDataSize = 0;
  for (const buf of pngBuffers) {
    totalDataSize += buf.length;
  }

  const ico = Buffer.alloc(dataOffset + totalDataSize);

  // ICONDIR header
  ico.writeUInt16LE(0, 0); // reserved
  ico.writeUInt16LE(1, 2); // type: 1 = ICO
  ico.writeUInt16LE(count, 4); // number of images

  let currentDataOffset = dataOffset;

  for (let i = 0; i < count; i++) {
    const png = pngBuffers[i];
    const entryOffset = headerSize + i * entrySize;

    // Parse dimensions from PNG IHDR chunk
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);

    // ICONDIRENTRY
    ico.writeUInt8(width >= 256 ? 0 : width, entryOffset);
    ico.writeUInt8(height >= 256 ? 0 : height, entryOffset + 1);
    ico.writeUInt8(0, entryOffset + 2); // color palette
    ico.writeUInt8(0, entryOffset + 3); // reserved
    ico.writeUInt16LE(1, entryOffset + 4); // color planes
    ico.writeUInt16LE(32, entryOffset + 6); // bits per pixel
    ico.writeUInt32LE(png.length, entryOffset + 8); // data size
    ico.writeUInt32LE(currentDataOffset, entryOffset + 12); // data offset

    png.copy(ico, currentDataOffset);
    currentDataOffset += png.length;
  }

  return ico;
}

const svgBuffer = readFileSync(svgPath);
console.log(`Source: ${svgPath}`);

// Generate all PNG favicons
await Promise.all(
  PNG_SIZES.map(async (size) => {
    const outputPath = resolve(staticDir, `favicon-${size}.png`);
    await sharp(svgBuffer, { density: Math.max(72, Math.round((72 * size) / 560)) * 4 })
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  favicon-${size}.png`);
  }),
);

// Generate ICO with multiple embedded sizes
const icoBuffers = [];
for (const size of ICO_SIZES) {
  const buf = await sharp(svgBuffer, { density: Math.max(72, Math.round((72 * size) / 560)) * 4 })
    .resize(size, size)
    .png()
    .toBuffer();
  icoBuffers.push(buf);
}

const icoBuffer = buildIco(icoBuffers);
writeFileSync(resolve(staticDir, 'favicon.ico'), icoBuffer);
console.log(`  favicon.ico (${ICO_SIZES.join(', ')}px)`);

console.log('\nDone!');
