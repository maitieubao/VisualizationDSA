// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount, flushPromises } from '@vue/test-utils';
import ToastContainer from '../ToastContainer.vue';
import { useToastStore } from '../../composables/useToast';
import BaseIcon from '../../shared/components/BaseIcon.vue';

describe('ToastContainer + useToastStore — P0 Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Toast-001 (P0): addToast() displays a toast', async () => {
    const store = useToastStore();
    mount(ToastContainer, {
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });

    store.addToast('info', 'Test Title', 'Test Message');
    await flushPromises();

    const bodyHtml = document.body.innerHTML;
    expect(bodyHtml).toContain('Test Title');
    expect(bodyHtml).toContain('Test Message');
    expect(document.querySelector('.toast-item')).not.toBeNull();
  });

  it('Toast-002 (P0): 4 loại success/error/warning/info render đúng class', async () => {
    const store = useToastStore();
    mount(ToastContainer, {
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });

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
  });

  it('Toast-003 (P0): Toast tự động đóng sau duration', async () => {
    const store = useToastStore();
    mount(ToastContainer, {
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });

    store.addToast('info', 'Auto', 'Sẽ biến mất', 2000);
    expect(store.activeToasts).toHaveLength(1);

    vi.advanceTimersByTime(2100);
    await flushPromises();

    expect(store.activeToasts).toHaveLength(0);
  });

  it('Toast-004 (P0): Đóng thủ công khi click removeToast()', async () => {
    const store = useToastStore();
    mount(ToastContainer, {
      global: { components: { BaseIcon } },
      attachTo: document.body,
    });

    store.addToast('info', 'Click', 'Đóng tay');
    await flushPromises();

    expect(store.activeToasts).toHaveLength(1);

    const toastItem = document.querySelector('.toast-item');
    expect(toastItem).not.toBeNull();
    toastItem!.dispatchEvent(new Event('click'));
    await flushPromises();

    expect(store.activeToasts).toHaveLength(0);
  });
});
