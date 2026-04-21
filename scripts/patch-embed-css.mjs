// Post-build: replace the embed bundle's Tailwind CSS with the CSS
// produced by the regular build.
//
// Why:
//   @tailwindcss/vite scans content via Vite's module graph. In library
//   build mode (entry = src/embed.tsx) it misses ~500 utility classes
//   that it emits correctly from the regular build (entry = index.html).
//   Rather than fight the scanner, we run both builds and splice the
//   good CSS into the embed IIFE.
//
// Flow:
//   1. vite build              → dist/assets/index-*.css (complete CSS)
//   2. vite build --mode embed → dist/embed/locly-widget.js
//   3. this script             → overwrite the template-literal CSS
//                                inside the IIFE with the regular CSS

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const regularCssDir = path.join(root, 'dist/assets');
const embedJsPath = path.join(root, 'dist/embed/locly-widget.js');

// 1. Load the regular build's CSS
const cssFiles = fs
  .readdirSync(regularCssDir)
  .filter((f) => f.endsWith('.css'));
if (cssFiles.length === 0) {
  console.error('[patch-embed-css] no regular-build CSS in dist/assets');
  process.exit(1);
}
const cssPath = path.join(regularCssDir, cssFiles[0]);
const goodCss = fs.readFileSync(cssPath, 'utf8');

// 2. Load the embed bundle
let js = fs.readFileSync(embedJsPath, 'utf8');

// 3. Find the template literal passed to createTextNode, scanning the
//    raw string forward until the matching unescaped backtick.
const start = js.indexOf('createTextNode(`');
if (start < 0) {
  console.error(
    '[patch-embed-css] could not locate createTextNode(`...`) in embed bundle',
  );
  process.exit(1);
}
const contentStart = start + 'createTextNode(`'.length;

let i = contentStart;
while (i < js.length) {
  const ch = js[i];
  if (ch === '\\') {
    i += 2;
    continue;
  }
  if (ch === '`') break;
  i++;
}
if (i >= js.length) {
  console.error('[patch-embed-css] unterminated template literal');
  process.exit(1);
}
const contentEnd = i;

// 4. Escape replacement for a template literal: backtick, backslash,
//    and ${ must be escaped so the JS parser doesn't reinterpret them.
const escaped = goodCss
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const patched = js.slice(0, contentStart) + escaped + js.slice(contentEnd);
fs.writeFileSync(embedJsPath, patched);

const kb = (n) => (n / 1024).toFixed(1);
console.log(
  `[patch-embed-css] swapped ${kb(contentEnd - contentStart)} KB of CSS → ${kb(escaped.length)} KB from ${path.basename(cssPath)}`,
);
