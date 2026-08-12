// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils';
import CanvasConfettiOverlay from '../components/CanvasConfettiOverlay.vue';

const rafSpy = vi.fn();
const cancelSpy = vi.fn();
const ctxMock = {
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillRect: vi.fn(),
  fillStyle: '',
};

function canvasInDom(): HTMLCanvasElement | null {
  return document.body.querySelector('canvas');
}

describe('CanvasConfettiOverlay (GM-030)', () => {
  let wrapper: VueWrapper | null = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    rafSpy.mockReset().mockReturnValue(1);
    cancelSpy.mockReset();
    vi.stubGlobal('requestAnimationFrame', rafSpy);
    vi.stubGlobal('cancelAnimationFrame', cancelSpy);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(ctxMock as unknown as never);
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('visible=false → không render canvas', () => {
    wrapper = mount(CanvasConfettiOverlay, { props: { visible: false } });
    expect(canvasInDom()).toBeNull();
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it('visible true→false→true: burst mỗi lần hiện + destroy mỗi lần ẩn', async () => {
    wrapper = mount(CanvasConfettiOverlay, { props: { visible: false } });

    await wrapper.setProps({ visible: true });
    await flushPromises();
    expect(canvasInDom()).not.toBeNull();
    expect(rafSpy).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ visible: false });
    await flushPromises();
    expect(canvasInDom()).toBeNull();
    expect(cancelSpy).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ visible: true });
    await flushPromises();
    expect(canvasInDom()).not.toBeNull();
    expect(rafSpy).toHaveBeenCalledTimes(2);
  });

  it('unmount khi đang chạy → cancelAnimationFrame + engine bị hủy', async () => {
    wrapper = mount(CanvasConfettiOverlay, { props: { visible: false } });
    await wrapper.setProps({ visible: true });
    await flushPromises();
    expect(canvasInDom()).not.toBeNull();

    wrapper.unmount();
    wrapper = null;
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('GM-035: watch immediate — mount với visible=true → burst ngay không cần đổi prop', async () => {
    wrapper = mount(CanvasConfettiOverlay, { props: { visible: true } });
    await flushPromises();
    expect(canvasInDom()).not.toBeNull();
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });
});
