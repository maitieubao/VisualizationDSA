// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import { setActivePinia, createPinia } from 'pinia';
import { nextTick } from 'vue';
import QRCode from 'qrcode';
import QRCodeDisplay from '../components/QRCodeDisplay.vue';
import { useExportShareStore } from '../store/useExportShareStore';

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn(async () => {}),
  },
}));

const SHARE_LINK = 'https://visualization-dsa.edu.vn/s/?state=N4IghiBcCMC2B2AjAdgAwEYGcA0BMAtALxAC';

describe('QRCodeDisplay (EX-007 / EX-001 / EX-003)', () => {
  let pinia: Pinia;
  let store: ReturnType<typeof useExportShareStore>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useExportShareStore();
    vi.mocked(QRCode.toCanvas).mockClear();
  });

  function mountComponent() {
    return mount(QRCodeDisplay, {
      global: { plugins: [pinia] },
    });
  }

  it('should not render the QR section when no share link exists', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.qr-section').exists()).toBe(false);
    wrapper.unmount();
  });

  it('should call QRCode.toCanvas with the real share link payload (flush post — EX-001/EX-007)', async () => {
    store.generatedShareLink = SHARE_LINK;

    const wrapper = mountComponent();
    await nextTick();

    expect(QRCode.toCanvas).toHaveBeenCalledTimes(1);
    const [canvas, payload, options] = vi.mocked(QRCode.toCanvas).mock.calls[0] as unknown as [
      HTMLCanvasElement,
      string,
      Record<string, unknown>,
    ];
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(payload).toBe(SHARE_LINK);
    expect(options).toMatchObject({ width: 180, margin: 2 });

    wrapper.unmount();
  });

  it('should re-render the QR when the link changes', async () => {
    store.generatedShareLink = SHARE_LINK;
    const wrapper = mountComponent();
    await nextTick();

    const updatedLink = SHARE_LINK + '-v2';
    store.generatedShareLink = updatedLink;
    await nextTick();

    const calls = vi.mocked(QRCode.toCanvas).mock.calls;
    expect(calls.length).toBe(2);
    expect(calls[1][1]).toBe(updatedLink);

    wrapper.unmount();
  });

  it('should fall back gracefully when QRCode.toCanvas rejects (EX-003)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(QRCode.toCanvas).mockRejectedValueOnce(
      new Error('QR capacity exceeded'),
    );

    try {
      store.generatedShareLink = SHARE_LINK;
      const wrapper = mountComponent();
      await nextTick();
      await nextTick();

      expect(consoleSpy).toHaveBeenCalled();
      expect(vi.mocked(QRCode.toCanvas)).toHaveBeenCalledTimes(1);

      wrapper.unmount();
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
