import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useI18n, messages } from '../index';

describe('shared/i18n (D2)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('mặc định locale = vi — t() trả chuỗi tiếng Việt hiện tại (không phá hành vi cũ)', () => {
    const { locale, t } = useI18n();
    expect(locale.value).toBe('vi');
    expect(t('playground.title')).toBe('Trình chạy từng bước (JavaScript)');
    expect(t('playground.menu.exportPng')).toBe('Xuất ảnh PNG');
  });

  it('setLocale chuyển sang en + persist qua localStorage', () => {
    const { locale, t, setLocale } = useI18n();
    setLocale('en');
    expect(locale.value).toBe('en');
    expect(t('playground.title')).toBe('Step-by-step Runner (JavaScript)');
    expect(t('playground.watchBtn')).toBe('Watch');
    expect(localStorage.getItem('app-locale')).toBe('en');
  });

  it('t() khôi phục locale đã persist khi tạo mới composable', () => {
    localStorage.setItem('app-locale', 'en');
    const { locale, t } = useI18n();
    expect(locale.value).toBe('en');
    expect(t('playground.run')).toBe('Run');
  });

  it('t() nội suy {var} trong chuỗi', () => {
    const { t } = useI18n();
    expect(t('playground.menu.exportPng')).not.toContain('{');
  });

  it('t() key không tồn tại → trả về chính key (không crash)', () => {
    const { t } = useI18n();
    expect(t('khong-ton-tai')).toBe('khong-ton-tai');
  });

  it('messages: mọi key của vi đều có bản en tương ứng', () => {
    for (const key of Object.keys(messages.vi)) {
      expect(messages.en[key], `thiếu bản dịch en cho '${key}'`).toBeDefined();
    }
  });
});
