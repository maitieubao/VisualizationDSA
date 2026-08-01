#!/usr/bin/env node
/* eslint-disable */
// Detect duplicate `let`/`const`/`var` declarations in the same module scope
// within .ts / .vue <script setup> blocks. This catches the kind of bug
// where the same variable name is declared twice at top level.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'src');
const EXTS = ['.vue', '.ts'];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (EXTS.some((e) => entry.name.endsWith(e))) yield full;
  }
}

// Extract <script setup lang="ts">...</script> from .vue, or whole file for .ts
function extractScript(content, ext) {
  if (ext === '.vue') {
    const m = content.match(/<script[^>]*\bsetup\b[^>]*>([\s\S]*?)<\/script>/);
    return m ? m[1] : null;
  }
  return content;
}

const declRegex = /^\s*(?:let|const|var)\s+([A-Za-z_$][\w$]*)\s*[:=]/;

function findDuplicates(scriptBody) {
  const seen = new Map(); // name -> first line
  const dupes = [];
  const lines = scriptBody.split(/\r?\n/);
  // Track brace depth to detect module-scope only
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Update depth: count braces but ignore braces inside strings (rough)
    let inString = null;
    let inLineComment = false;
    for (let p = 0; p < line.length; p++) {
      const ch = line[p];
      if (inLineComment) break;
      if (inString) {
        if (ch === '\\') { p++; continue; }
        if (ch === inString) inString = null;
        continue;
      }
      if (ch === '/' && line[p + 1] === '/') { inLineComment = true; break; }
      if (ch === '"' || ch === "'" || ch === '`') { inString = ch; continue; }
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
    }
    if (depth > 0) continue; // only top-level module scope
    const m = line.match(declRegex);
    if (!m) continue;
    const name = m[1];
    if (seen.has(name)) {
      dupes.push({ name, firstLine: seen.get(name), secondLine: i + 1 });
    } else {
      seen.set(name, i + 1);
    }
  }
  return dupes;
}

let totalIssues = 0;
for (const file of walk(ROOT)) {
  const content = fs.readFileSync(file, 'utf8');
  const ext = path.extname(file);
  const script = extractScript(content, ext);
  if (!script) continue;
  const dupes = findDuplicates(script);
  if (dupes.length > 0) {
    const rel = path.relative(path.resolve(ROOT, '..'), file).replace(/\\/g, '/');
    for (const d of dupes) {
      console.log(`${rel}:${d.secondLine}  duplicate top-level declaration '${d.name}' (first seen at line ${d.firstLine})`);
      totalIssues++;
    }
  }
}

if (totalIssues === 0) {
  console.log('OK: No duplicate top-level declarations found.');
  process.exit(0);
}
console.log(`\nTotal: ${totalIssues} duplicate declaration(s) across files.`);
process.exit(1);
