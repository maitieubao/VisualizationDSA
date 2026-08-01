#!/usr/bin/env node
/* eslint-disable */
// Find all relative imports in .ts/.vue files that do not resolve to a real file.
// Outputs lines: "<source>:<line>\t<resolved>".

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');
const EXTS_VUE_TS = ['.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const EXTS_RESOLVE = ['', '.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '/index.ts', '/index.vue', '/index.js'];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (EXTS_VUE_TS.some((ext) => entry.name.endsWith(ext))) yield full;
  }
}

const importRegexes = [
  // from '...'
  /\bfrom\s*['"]([^'"]+)['"]/g,
  // import('...') dynamic
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function extractImports(content) {
  const out = [];
  for (const rx of importRegexes) {
    let m;
    while ((m = rx.exec(content)) !== null) {
      out.push(m[1]);
    }
  }
  return out;
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null; // skip bare + alias
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const ext of EXTS_RESOLVE) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  // also try as directory
  if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
    for (const ext of EXTS_RESOLVE) {
      const candidate = path.join(base, ext);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
  }
  return null;
}

const missing = [];
for (const file of walk(ROOT)) {
  const content = fs.readFileSync(file, 'utf8');
  const specs = extractImports(content);
  // Also figure out approximate line for each spec
  const lines = content.split(/\r?\n/);
  for (const spec of specs) {
    if (!spec.startsWith('.')) continue;
    const resolved = resolveImport(file, spec);
    if (!resolved) {
      // find first line containing the spec
      let line = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(spec)) { line = i + 1; break; }
      }
      missing.push({
        from: path.relative(path.resolve(ROOT, '..'), file).replace(/\\/g, '/'),
        line,
        spec,
        resolved: path.relative(path.resolve(ROOT, '..'), path.resolve(path.dirname(file), spec)).replace(/\\/g, '/'),
      });
    }
  }
}

if (missing.length === 0) {
  console.log('OK: No missing relative imports found.');
  process.exit(0);
}

console.log(`Missing imports (${missing.length}):`);
for (const m of missing) {
  console.log(`  ${m.from}:${m.line}  ->  ${m.spec}  (would be: ${m.resolved})`);
}
process.exit(1);
