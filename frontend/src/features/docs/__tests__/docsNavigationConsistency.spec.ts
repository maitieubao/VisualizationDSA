import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { docsNavigation } from '../data/docsNavigation';
import type { NavItem } from '../types/docs.types';

const CONTENT_DIR = join(__dirname, '..', 'content');

function collectMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const p = join(current, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.md')) files.push(p);
    }
  };
  walk(dir);
  return files;
}

function collectNavPaths(items: NavItem[]): string[] {
  const paths: string[] = [];
  const walk = (nodes: NavItem[]): void => {
    for (const node of nodes) {
      if (node.path) paths.push(node.path);
      if (node.children) walk(node.children);
    }
  };
  walk(items);
  return paths;
}

// Mirror công thức sinh heading id trong DocsMarkdownRenderer.vue (renderer.heading, DC-010):
// lower → NFD bỏ dấu → bỏ ký tự không phải [\w\s-] → gom [\s_-]+ thành '-' → trim '-' hai đầu; custom {#id} ưu tiên.
function slugifyHeading(rawLine: string): string {
  const text = rawLine.replace(/^#{1,6}\s+/, '').trim();
  const customId = text.match(/\{#([^}]+)\}/);
  if (customId) return customId[1];
  const id = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return id || 'section';
}

function collectHeadingSlugs(content: string): string[] {
  const slugs: string[] = [];
  let inFence = false;
  for (const line of content.split(/\r?\n/)) {
    if (/^```/.test(line.trim())) {
      inFence = !inFence;
      continue;
    }
    if (!inFence && /^#{1,6}\s/.test(line)) slugs.push(slugifyHeading(line));
  }
  return slugs;
}

// Nợ nội dung đã biết: "Cách sử dụng cơ bản" ×2 trong csharp-hash-collections.md (DC-010).
// Renderer đã dedup -1/-2 nên không crash, nhưng content cần sửa đúng 2 heading này.
// Nếu content được sửa → test fail với actual = {} → cập nhật allowlist này thành {}.
const KNOWN_DUPLICATE_SLUGS: Record<string, string[]> = {};

describe('Docs navigation ↔ content consistency (DC-T3)', () => {
  const mdFiles = collectMarkdownFiles(CONTENT_DIR);
  const navPaths = collectNavPaths(docsNavigation);
  const relFiles = mdFiles.map(f => relative(CONTENT_DIR, f).replace(/\\/g, '/'));

  it(`nav có ${navPaths.length} path bài học, mỗi path đều có file .md tồn tại`, () => {
    expect(navPaths.length).toBe(68);
    for (const p of navPaths) {
      const match = p.match(/^\/docs\/([^/]+)\/([^/]+)$/);
      expect(match, `path không đúng định dạng /docs/<topic>/<slug>: ${p}`).toBeTruthy();
      if (match) {
        const file = join(CONTENT_DIR, match[1], `${match[2]}.md`);
        expect(existsSync(file), `thiếu file nội dung cho nav path ${p}`).toBe(true);
      }
    }
  });

  it('mọi file .md trong content đều được nav trỏ tới — không file mồ côi (68/68)', () => {
    const expected = new Set(navPaths.map(p => `${p.replace(/^\/docs\//, '')}.md`));
    expect(relFiles.length).toBe(68);
    for (const rel of relFiles) {
      expect(expected.has(rel), `file nội dung không có trong nav: ${rel}`).toBe(true);
    }
  });

  it('nav có 14 nhóm, id duy nhất toàn cục, title không rỗng', () => {
    expect(docsNavigation.length).toBe(14);
    const seenIds = new Set<string>();
    const walk = (nodes: NavItem[]): void => {
      for (const node of nodes) {
        expect(seenIds.has(node.id), `trùng nav id: ${node.id}`).toBe(false);
        seenIds.add(node.id);
        expect(node.title.trim().length).toBeGreaterThan(0);
        if (node.children) walk(node.children);
      }
    };
    walk(docsNavigation);
  });

  it('heading id không trùng trong cùng file — chốt regression DC-010', () => {
    const actual: Record<string, string[]> = {};
    for (const rel of relFiles) {
      const content = readFileSync(join(CONTENT_DIR, rel), 'utf8');
      const seen = new Set<string>();
      for (const slug of collectHeadingSlugs(content)) {
        if (seen.has(slug)) {
          (actual[rel] ??= []).push(slug);
        }
        seen.add(slug);
      }
    }
    expect(actual).toEqual(KNOWN_DUPLICATE_SLUGS);
  });

  it('mọi file .md có title — frontmatter dòng 2 hoặc heading đầu', () => {
    for (const rel of relFiles) {
      const lines = readFileSync(join(CONTENT_DIR, rel), 'utf8').split(/\r?\n/);
      const hasFrontmatterTitle = lines[0] === '---' && /^title:\s*\S/.test(lines[1] ?? '');
      const hasFirstHeading = lines.some(l => /^#{1,6}\s/.test(l.trim()));
      expect(hasFrontmatterTitle || hasFirstHeading, `${rel} thiếu title/frontmatter`).toBe(true);
    }
  });
});
