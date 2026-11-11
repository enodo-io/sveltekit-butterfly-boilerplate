#!/usr/bin/env node
/**
 * Performance budget of the client build (run after `npm run build`):
 *
 * - JS of the first load, per route: the client entry, the root layout and the
 *   route node with all their static imports (what the browser modulepreloads),
 *   gzip size;
 * - main CSS (gzip);
 * - number of font files in the build.
 *
 * Fails (exit 1) when a budget is exceeded: a new dependency imported at the top
 * of a page, Sentry back in the entry, every font weight again… show up here.
 * Raise a budget only on purpose.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const BUDGET = {
  jsKb: 72, // first-load JS of any route, gzip (65.9 kB on 2026-11-11, hooks entry included)
  cssKb: 12, // main stylesheet, gzip
  fonts: 30, // font files (woff/woff2) in the build
};

const client = '.svelte-kit/output/client';
const manifest = JSON.parse(fs.readFileSync(path.join(client, '.vite/manifest.json'), 'utf8'));
const gz = (file) => zlib.gzipSync(fs.readFileSync(path.join(client, file)), { level: 9 }).length;

const closure = (key, seen = new Set()) => {
  if (seen.has(key) || !manifest[key]) return seen;
  seen.add(key);
  (manifest[key].imports || []).forEach((k) => closure(k, seen));
  return seen;
};
const kb = (bytes) => Math.round(bytes / 102.4) / 10;

// the two client entries: the kit runtime (start) and the generated app (hooks, router)
const entries = Object.keys(manifest).filter(
  (k) => k.endsWith('runtime/client/entry.js') || /generated\/client-optimized\/app\.js$/.test(k),
);
const nodes = Object.keys(manifest).filter((k) =>
  /generated\/client-optimized\/nodes\/\d+\.js$/.test(k),
);
const layout = nodes.find((k) => k.endsWith('/nodes/0.js'));

const failures = [];
const rows = nodes
  .filter((k) => k !== layout && !k.endsWith('/nodes/1.js'))
  .map((node) => {
    const files = new Set();
    [...entries, layout, node].forEach((k) =>
      closure(k).forEach((f) => files.add(manifest[f].file)),
    );
    const size = [...files].reduce((sum, f) => sum + gz(f), 0);
    return { route: path.basename(node), kb: kb(size) };
  });
const worst = rows.sort((a, b) => b.kb - a.kb)[0];
if (worst.kb > BUDGET.jsKb)
  failures.push(`first-load JS ${worst.kb} kB gz (node ${worst.route}) > ${BUDGET.jsKb} kB`);

const css = fs
  .readdirSync(path.join(client, '_app/immutable/assets'))
  .filter((f) => /^0\..*\.css$/.test(f))
  .map((f) => kb(gz(`_app/immutable/assets/${f}`)))[0];
if (css > BUDGET.cssKb) failures.push(`main CSS ${css} kB gz > ${BUDGET.cssKb} kB`);

const fonts = fs
  .readdirSync(path.join(client, '_app/immutable/assets'))
  .filter((f) => /\.woff2?$/.test(f)).length;
if (fonts > BUDGET.fonts) failures.push(`${fonts} font files > ${BUDGET.fonts}`);

console.log(
  `budget: first-load JS max ${worst.kb}/${BUDGET.jsKb} kB gz, CSS ${css}/${BUDGET.cssKb} kB gz, fonts ${fonts}/${BUDGET.fonts}`,
);
if (failures.length) {
  console.error(`✗ performance budget exceeded:\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log('✓ performance budget OK');
