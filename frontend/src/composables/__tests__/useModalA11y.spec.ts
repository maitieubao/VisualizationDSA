// @vitest-environment jsdom
// CU-008 (P1): useModalA11y — Esc đóng, Tab/shift+Tab trap vòng, restore focus,
// scroll-lock, case mở sẵn show=true (watch immediate), stack 2 modal (đóng 1 không unlock scroll).
// CU-031 (P3): unmount khi mở → gỡ listener + khôi phục scroll + restore focus.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { mount, type VueWrapper } from '@vue/test-utils';
import { useModalA11y } from '../useModalA11y';

interface HarnessVm {
  show: boolean;
  open: () => void;
  close: () => void;
}

function createHarness(initialOpen = false) {
  return {
    template: `
      <div ref="overlayEl" role="dialog" aria-modal="true" aria-label="Test modal">
        <button class="harness-first">Đóng</button>
        <input class="harness-middle" />
        <button class="harness-last">Xác nhận</button>
      </div>
    `,
    setup() {
      const show = ref(initialOpen);
      const { overlayEl } = useModalA11y(show);
      const open = (): void => { show.value = true; };
      const close = (): void => { show.value = false; };
      return { overlayEl, show, open, close };
    },
  };
}

function vmOf(w: VueWrapper): HarnessVm {
  return w.vm as unknown as HarnessVm;
}

let wrapper: VueWrapper | null = null;

beforeEach(() => {
  document.body.innerHTML = '';
  document.body.style.overflow = '';
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
});

afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
  vi.unstubAllGlobals();
  document.body.style.overflow = '';
});

describe('useModalA11y — CU-008/CU-031', () => {
  it('Esc đóng modal + mở/đóng khóa scroll body', async () => {
    wrapper = mount(createHarness(), { attachTo: document.body });
    const vm = vmOf(wrapper);

    vm.open();
    await nextTick();
    expect(document.body.style.overflow).toBe('hidden');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();

    expect(vm.show).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('mở modal → focus vào phần tử tương tác đầu tiên', async () => {
    const outside = document.createElement('button');
    outside.id = 'outside-btn';
    document.body.appendChild(outside);
    outside.focus();

    wrapper = mount(createHarness(), { attachTo: document.body });
    const vm = vmOf(wrapper);

    vm.open();
    await nextTick();

    const first = document.querySelector('.harness-first') as HTMLElement;
    expect(document.activeElement).toBe(first);
  });

  it('đóng modal → restore focus về phần tử trước đó', async () => {
    const outside = document.createElement('button');
    outside.id = 'outside-btn';
    document.body.appendChild(outside);
    outside.focus();

    wrapper = mount(createHarness(), { attachTo: document.body });
    const vm = vmOf(wrapper);

    vm.open();
    await nextTick();
    expect(document.activeElement).toBe(document.querySelector('.harness-first'));

    vm.close();
    await nextTick();

    expect(document.activeElement).toBe(outside);
  });

  it('Tab trap: Tab ở phần tử cuối → vòng về đầu; Shift+Tab ở đầu → vòng về cuối', async () => {
    wrapper = mount(createHarness(), { attachTo: document.body });
    const vm = vmOf(wrapper);
    vm.open();
    await nextTick();

    const first = document.querySelector('.harness-first') as HTMLElement;
    const last = document.querySelector('.harness-last') as HTMLElement;

    last.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(first);

    first.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    await nextTick();
    expect(document.activeElement).toBe(last);
  });

  it('CU-008: mở sẵn show=true khi mount → scroll-lock ngay + Esc đóng được (watch immediate)', async () => {
    wrapper = mount(createHarness(true), { attachTo: document.body });
    await nextTick();

    expect(document.body.style.overflow).toBe('hidden');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();

    expect(vmOf(wrapper).show).toBe(false);
  });

  it('CU-003: xếp chồng 2 modal — đóng 1 không unlock scroll, đóng cả 2 mới unlock', async () => {
    const w1 = mount(createHarness(), { attachTo: document.body });
    const w2 = mount(createHarness(), { attachTo: document.body });
    const vm1 = vmOf(w1);
    const vm2 = vmOf(w2);

    vm1.open();
    await nextTick();
    expect(document.body.style.overflow).toBe('hidden');

    vm2.open();
    await nextTick();
    expect(document.body.style.overflow).toBe('hidden');

    vm1.close();
    await nextTick();
    expect(document.body.style.overflow).toBe('hidden');

    vm2.close();
    await nextTick();
    expect(document.body.style.overflow).toBe('');

    w1.unmount();
    w2.unmount();
  });

  it('CU-031: unmount khi đang mở → gỡ listener + khôi phục scroll + restore focus', async () => {
    const outside = document.createElement('button');
    outside.id = 'outside-btn';
    document.body.appendChild(outside);
    outside.focus();

    wrapper = mount(createHarness(), { attachTo: document.body });
    const vm = vmOf(wrapper);
    vm.open();
    await nextTick();
    expect(document.body.style.overflow).toBe('hidden');

    wrapper.unmount();
    wrapper = null;
    await nextTick();

    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(outside);
  });
});
