/**
 * generate-icons.js
 * Generates PWA icons for ARENA using only Node.js built-in modules.
 * Produces:
 *   public/icons/icon-192.png  (192×192)
 *   public/icons/icon-512.png  (512×512)
 *
 * Design: amber #F59E0B background, dark navy #0F172A "A" lettermark centered.
 */

'use strict';

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ─── Colours ────────────────────────────────────────────────────────────────
const BG  = { r: 245, g: 158, b: 11  }; // #F59E0B amber
const FG  = { r: 15,  g: 23,  b: 42  }; // #0F172A dark navy

// ─── PNG helpers ────────────────────────────────────────────────────────────

function u32be(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function crc32(buf) {
  // CRC-32 table
  if (!crc32._table) {
    crc32._table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      crc32._table[i] = c;
    }
  }
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crc32._table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const crcInput  = Buffer.concat([typeBytes, data]);
  return Buffer.concat([
    u32be(data.length),
    typeBytes,
    data,
    u32be(crc32(crcInput)),
  ]);
}

function ihdr(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width,  0);
  data.writeUInt32BE(height, 4);
  data[8]  = 8; // bit depth
  data[9]  = 2; // colour type: RGB
  data[10] = 0; // compression
  data[11] = 0; // filter
  data[12] = 0; // interlace
  return chunk('IHDR', data);
}

function idat(pixels, width, height) {
  // Build raw scanlines: filter byte 0x00 + RGB triples
  const rowBytes = 1 + width * 3;
  const raw = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    raw[y * rowBytes] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      const pi = (y * width + x) * 3;
      const ri = y * rowBytes + 1 + x * 3;
      raw[ri]     = pixels[pi];
      raw[ri + 1] = pixels[pi + 1];
      raw[ri + 2] = pixels[pi + 2];
    }
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return chunk('IDAT', compressed);
}

function iend() {
  return chunk('IEND', Buffer.alloc(0));
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

function buildPng(pixels, width, height) {
  return Buffer.concat([PNG_SIG, ihdr(width, height), idat(pixels, width, height), iend()]);
}

// ─── Pixel buffer helpers ────────────────────────────────────────────────────

function createPixels(size) {
  // Fill with background colour
  const buf = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    buf[i * 3]     = BG.r;
    buf[i * 3 + 1] = BG.g;
    buf[i * 3 + 2] = BG.b;
  }
  return buf;
}

function setPixel(buf, size, x, y, col) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (y * size + x) * 3;
  buf[i]     = col.r;
  buf[i + 1] = col.g;
  buf[i + 2] = col.b;
}

function fillRect(buf, size, x, y, w, h, col) {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      setPixel(buf, size, x + dx, y + dy, col);
}

// ─── Draw "A" lettermark ─────────────────────────────────────────────────────
// The "A" is drawn as a set of filled rectangles (pixel-art style) scaled to
// the icon size.  The reference grid is 10×12 units; we scale to ~55 % of the
// icon height and centre it.

function drawA(buf, size) {
  // Target height for the letter: ~58 % of icon size
  const letterH = Math.round(size * 0.58);
  const letterW = Math.round(letterH * 0.72); // aspect ratio
  const ox = Math.round((size - letterW) / 2); // top-left x
  const oy = Math.round((size - letterH) / 2); // top-left y

  // Stroke thickness scales with size
  const sw = Math.max(2, Math.round(letterW * 0.14)); // stroke width

  // ── Left diagonal leg ──────────────────────────────────────────────────────
  // We approximate the diagonal with a series of horizontal slices.
  // The left leg goes from (ox + letterW/2, oy) down-left to (ox, oy+letterH).
  const midX = ox + Math.round(letterW / 2);

  for (let row = 0; row < letterH; row++) {
    const t = row / (letterH - 1); // 0 at top, 1 at bottom
    // Left edge of left leg
    const leftX  = Math.round(ox + t * (letterW / 2 - sw / 2));
    // Right edge of left leg
    const rightX = Math.round(ox + t * (letterW / 2 + sw / 2));
    fillRect(buf, size, leftX, oy + row, rightX - leftX + 1, 1, FG);
  }

  // ── Right diagonal leg ─────────────────────────────────────────────────────
  for (let row = 0; row < letterH; row++) {
    const t = row / (letterH - 1);
    const leftX  = Math.round(midX - sw / 2 + t * (letterW / 2 - sw / 2));
    const rightX = Math.round(midX + sw / 2 + t * (letterW / 2 - sw / 2));
    fillRect(buf, size, leftX, oy + row, rightX - leftX + 1, 1, FG);
  }

  // ── Crossbar ───────────────────────────────────────────────────────────────
  // Positioned at ~45 % down the letter height
  const barY  = oy + Math.round(letterH * 0.45);
  const barH  = Math.max(2, Math.round(letterH * 0.10));
  // Width of the letter at barY
  const tBar  = (barY - oy) / (letterH - 1);
  const barX1 = Math.round(ox + tBar * (letterW / 2 - sw / 2)) + sw;
  const barX2 = Math.round(midX + sw / 2 + tBar * (letterW / 2 - sw / 2)) - sw;
  if (barX2 > barX1) {
    fillRect(buf, size, barX1, barY, barX2 - barX1, barH, FG);
  }
}

// ─── Generate one icon ───────────────────────────────────────────────────────

function generateIcon(size, outPath) {
  const pixels = createPixels(size);
  drawA(pixels, size);
  const png = buildPng(pixels, size, size);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, png);
  console.log(`✓ ${outPath}  (${png.length} bytes, ${size}×${size}px)`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
generateIcon(192, path.join(iconsDir, 'icon-192.png'));
generateIcon(512, path.join(iconsDir, 'icon-512.png'));

console.log('\nDone. Both icons written to public/icons/');
