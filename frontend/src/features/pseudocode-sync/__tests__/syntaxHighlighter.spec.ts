// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { highlightSyntax } from '../utils/syntaxHighlighter';

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function spanTexts(html: string): string[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return Array.from(doc.body.querySelectorAll('span')).map((s) => s.textContent ?? '');
}

describe('highlightSyntax (PS-003 rewrite)', () => {
  it('never leaks CSS color codes or attribute fragments into rendered text', () => {
    const input = 'for (int i = 0; i < n-1; i++) {';
    const html = highlightSyntax(input, 'cpp');
    expect(stripTags(html)).toBe(input);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.body.textContent).not.toContain('#60a5fa');
    expect(doc.body.textContent).not.toContain('font-weight');
    expect(doc.body.textContent).not.toContain('">:');
  });

  it('wraps keywords, numbers and punctuation in spans', () => {
    const texts = spanTexts(highlightSyntax('for (int i = 0; i < n; i++) {', 'cpp'));
    expect(texts).toContain('for');
    expect(texts).toContain('int');
    expect(texts).toContain('0');
    expect(texts).toContain('(');
    expect(texts).toContain(')');
    expect(texts).toContain('{');
  });

  it('renders a comment as a single unbroken block', () => {
    const input = '  // j = 0; swap arr[1] with arr[2]';
    const html = highlightSyntax(input, 'cpp');
    expect(stripTags(html)).toBe(input);
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const commentSpan = Array.from(doc.body.querySelectorAll('span')).find((s) =>
      s.textContent?.startsWith('//'),
    );
    expect(commentSpan).toBeDefined();
    expect(commentSpan!.children.length).toBe(0);
  });

  it('treats a decimal number as a single token', () => {
    const texts = spanTexts(highlightSyntax('ratio = 3.14', 'pseudocode'));
    expect(texts).toContain('3.14');
  });

  it('escapes HTML injection payloads (XSS)', () => {
    const html = highlightSyntax('<script>alert(1)</script>', 'javascript');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    expect(doc.body.querySelector('script')).toBeNull();
  });

  it('returns empty output for blank lines (PS-036)', () => {
    expect(highlightSyntax('')).toBe('');
    expect(highlightSyntax('   ')).toBe('');
  });

  it('distinguishes Python keywords from C-family code (PS-039)', () => {
    const cppTexts = spanTexts(highlightSyntax('def bubble_sort(arr):', 'cpp'));
    expect(cppTexts).not.toContain('def');
    const pythonTexts = spanTexts(highlightSyntax('def bubble_sort(arr):', 'python'));
    expect(pythonTexts).toContain('def');
  });

  it('treats # as comment only in python mode', () => {
    const pythonHtml = highlightSyntax('# total = sum(values)', 'python');
    const pythonDoc = new DOMParser().parseFromString(pythonHtml, 'text/html');
    const commentSpan = Array.from(pythonDoc.body.querySelectorAll('span')).find((s) =>
      s.textContent?.startsWith('#'),
    );
    expect(commentSpan).toBeDefined();
    expect(commentSpan!.children.length).toBe(0);
    const cppHtml = highlightSyntax('#include <vector>', 'cpp');
    expect(stripTags(cppHtml)).toBe('#include <vector>');
  });
});
