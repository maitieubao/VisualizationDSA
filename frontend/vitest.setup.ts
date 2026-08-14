class MemoryStorage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as Record<string, unknown>).localStorage = new MemoryStorage();
}

if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as Record<string, unknown>).sessionStorage = new MemoryStorage();
}

// Review 2026-08-14: jsdom KHÔNG cài CSS.escape — component dùng
// `CSS.escape(itemId)` (StudentCurriculumSidebar.vue) ném TypeError trong test
// làm sập nhiều file không liên quan. Polyfill theo spec của MDN (đủ cho
// selector attribute trong test: escape mọi ký tự đặc biệt về dạng hex).
if (typeof globalThis.CSS === 'undefined') {
  (globalThis as Record<string, unknown>).CSS = {} as CSS;
}
if (typeof (globalThis.CSS as { escape?: unknown }).escape !== 'function') {
  (globalThis.CSS as { escape: (value: string) => string }).escape = (value: string): string =>
    String(value).replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch.codePointAt(0)!.toString(16)} `);
}
