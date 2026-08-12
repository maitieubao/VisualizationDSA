// @vitest-environment jsdom
// CU-025 (P2): Toast contract — assert icon BaseIcon thật (check/close/warning/info),
// cap maxToasts 5, clearAll, duration=0 không tự đóng, handleApiError (Error/string/ApiError),
// progress animationDuration theo duration.
// CU-035 (P3): Toast-004 click `.toast-close` (không `.toast-item`).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';
import ToastContainer from '../ToastContainer.vue';
import { useToastStore } from '../../composables/useToast';
import BaseIcon from '../../shared/components/BaseIcon.vue';

function mountContainer() {
  return mount(ToastContainer, {
    global: { components: { BaseIcon } },
    attachTo: document.body,
  });
}

describe('ToastContainer + useToastStore — CU-025/CU-035', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('Toast-001 (P0): addToast hiển thị title + message', async () => {
    const store = useToastStore();
    mountContainer();

    store.addToast('info', 'Test Title', 'Test Message');
    await flushPromises();

    expect(document.querySelector('.toast-item')).not.toBeNull();
    expect(document.body.innerHTML).toContain('Test Title');
    expect(document.body.innerHTML).toContain('Test Message');
  });

  it('Toast-002 (P0): 4 loại success/error/warning/info render icon BaseIcon thật khác nhau', async () => {
    const store = useToastStore();
    mountContainer();

    store.addToast('success', 'OK', 'Thành công');
    store.addToast('error', 'Err', 'Lỗi');
    store.addToast('warning', 'Warn', 'Cảnh báo');
    store.addToast('info', 'Info', 'Thông báo');
    await flushPromises();

    const items = document.querySelectorAll('.toast-item');
    expect(items).toHaveLength(4);
    expect(items[0].classList.contains('toast-item--success')).toBe(true);
    expect(items[1].classList.contains('toast-item--error')).toBe(true);
    expect(items[2].classList.contains('toast-item--warning')).toBe(true);
    expect(items[3].classList.contains('toast-item--info')).toBe(true);

    // CU-025: mỗi toast phải có icon BaseIcon thật (svg) — 4 icon khác nhau (check/close/warning/info).
    const icons = Array.from(document.querySelectorAll('.toast-item .toast-icon svg'));
    expect(icons).toHaveLength(4);
    const iconMarkup = new Set(icons.map((icon) => (icon as SVGElement).innerHTML));
    expect(iconMarkup.size).toBe(4);
  });

  it('Toast-003 (P0): tự động đóng sau duration', () => {
    const store = useToastStore();
    mountContainer();

    store.addToast('info', 'Auto', 'Sẽ biến mất', 2000);
    expect(store.activeToasts).toHaveLength(1);
    try {
      vi.advanceTimersByTime(2100);
      expect(store.activeToasts).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('Toast-004 (CU-035): click .toast-close đóng đúng toast (không dùng .toast-item)', async () => {
    const store = useToastStore();
    mountContainer();

    store.addToast('info', 'First', 'Toast đầu');
    store.addToast('error', 'Second', 'Toast hai');
    await flushPromises();

    const closeButtons = document.querySelectorAll('.toast-close');
    expect(closeButtons).toHaveLength(2);

    (closeButtons[0] as HTMLElement).dispatchEvent(new Event('click'));
    await flushPromises();

    expect(store.activeToasts).toHaveLength(1);
    expect(store.activeToasts[0].title).toBe('Second');
  });

  it('CU-025: cap maxToasts — chỉ giữ 5 toast cuối', async () => {
    const store = useToastStore();
    mountContainer();

    for (let i = 0; i < 7; i += 1) {
      store.addToast('info', `Toast ${i}`, 'Nội dung');
    }
    await flushPromises();

    expect(store.activeToasts).toHaveLength(5);
    expect(store.activeToasts[0].title).toBe('Toast 2');
    expect(store.activeToasts[4].title).toBe('Toast 6');
    expect(document.querySelectorAll('.toast-item')).toHaveLength(5);
  });

  it('CU-025: clearAll xóa toàn bộ toast', async () => {
    const store = useToastStore();
    mountContainer();

    store.addToast('info', 'A', '1');
    store.addToast('error', 'B', '2');
    await flushPromises();
    expect(store.activeToasts).toHaveLength(2);

    store.clearAll();
    await flushPromises();

    expect(store.activeToasts).toHaveLength(0);
    expect(document.querySelectorAll('.toast-item')).toHaveLength(0);
  });

  it('CU-025: duration=0 → toast không tự đóng', () => {
    const store = useToastStore();
    mountContainer();

    store.addToast('info', 'Pinned', 'Vĩnh viễn', 0);
    expect(store.activeToasts).toHaveLength(1);
    try {
      vi.advanceTimersByTime(60_000);
      expect(store.activeToasts).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('CU-025: progress bar animationDuration theo duration của toast', async () => {
    const store = useToastStore();
    mountContainer();

    store.addToast('warning', 'Warn', 'Cảnh báo', 5000);
    await flushPromises();

    const progress = document.querySelector('.toast-progress') as HTMLElement | null;
    expect(progress).not.toBeNull();
    expect(progress!.style.animationDuration).toBe('5000ms');
  });

  it('CU-025: handleApiError với Error → toast error chứa message', () => {
    const store = useToastStore();
    store.handleApiError(new Error('Network failed'));

    expect(store.activeToasts).toHaveLength(1);
    expect(store.activeToasts[0].type).toBe('error');
    expect(store.activeToasts[0].message).toBe('Network failed');
  });

  it('CU-025: handleApiError với string → toast error chứa chuỗi', () => {
    const store = useToastStore();
    store.handleApiError('Email đã tồn tại');

    expect(store.activeToasts).toHaveLength(1);
    expect(store.activeToasts[0].type).toBe('error');
    expect(store.activeToasts[0].message).toBe('Email đã tồn tại');
  });

  it('CU-013: handleApiError với ApiError (status/title/detail) → hiển thị detail backend', () => {
    const store = useToastStore();
    store.handleApiError({ status: 400, title: 'Bad Request', detail: 'Email đã tồn tại.' });

    expect(store.activeToasts).toHaveLength(1);
    expect(store.activeToasts[0].type).toBe('error');
    expect(store.activeToasts[0].message).toContain('Email đã tồn tại.');
  });
});
