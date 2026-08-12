import { vi } from 'vitest';

/**
 * LocalStorage mock dùng chung cho bộ test Auth (AU-053).
 *
 * Hành vi bám sát Storage thật:
 *  - getItem trả về null khi key KHÔNG tồn tại, nhưng trả đúng giá trị đã lưu
 *    (kể cả chuỗi rỗng) khi key tồn tại — không dùng `|| null` làm chết chuỗi rỗng.
 *  - setItem luôn lưu dưới dạng string.
 */
export class LocalStorageMock {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

/** Tạo mock và cài lên globalThis.localStorage (được vitest tự phục hồi cuối file). */
export function installLocalStorageMock(): LocalStorageMock {
  const mock = new LocalStorageMock();
  vi.stubGlobal('localStorage', mock);
  return mock;
}
