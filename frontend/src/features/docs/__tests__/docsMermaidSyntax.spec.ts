// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { buildMermaidInitConfig } from '../../../utils/mermaidTheme';

const DOCS_DIR = join(__dirname, '..', 'content');

interface MermaidBlock {
  file: string;
  blockIndex: number;
  code: string;
}

function collectMermaidBlocks(dir: string): MermaidBlock[] {
  const blocks: MermaidBlock[] = [];
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const p = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(p);
      } else if (entry.name.endsWith('.md')) {
        const content = readFileSync(p, 'utf8');
        const re = /```mermaid\n?([\s\S]*?)```/g;
        let match: RegExpExecArray | null;
        let index = 0;
        while ((match = re.exec(content)) !== null) {
          blocks.push({
            file: relative(DOCS_DIR, p).replace(/\\/g, '/'),
            blockIndex: index++,
            code: match[1],
          });
        }
      }
    }
  };
  walk(dir);
  return blocks;
}

const allBlocks = collectMermaidBlocks(DOCS_DIR);

describe('Docs Mermaid Syntax — toàn bộ tài liệu', () => {
  let mermaid: any;
  let parseError: any;

  beforeAll(async () => {
    mermaid = (await import('mermaid')).default;
    mermaid.initialize(buildMermaidInitConfig());
  }, 30000);

  it('phát hiện được ít nhất 1 khối mermaid trong tài liệu', () => {
    expect(allBlocks.length).toBeGreaterThan(0);
  });

  it(`cú pháp hợp lệ cho ${allBlocks.length} khối mermaid (${new Set(allBlocks.map(b => b.file)).size} file)`, async () => {
    const failures: string[] = [];
    for (const block of allBlocks) {
      try {
        await mermaid.parse(block.code);
      } catch (err: any) {
        parseError = err;
        const message = String(err?.message ?? err).replace(/\s+/g, ' ').slice(0, 300);
        failures.push(`${block.file} (khối #${block.blockIndex + 1}): ${message}`);
      }
    }
    expect(failures, `Các khối mermaid lỗi cú pháp:\n${failures.join('\n')}`).toEqual([]);
  }, 60000);
});
