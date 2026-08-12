// @vitest-environment jsdom

// EX-002/EX-007: Route /s/ khôi phục phòng lab — deserialize state từ
// ?state= qua đúng compressor URI-safe; state hỏng/thiếu → error state rõ ràng.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ShareRestoreView from '../ShareRestoreView.vue';
import { WorkspaceStateCompressor } from '../../../features/export-share';
import { useExportShareStore } from '../../../features/export-share/store/useExportShareStore';
import { setActivePinia, createPinia } from 'pinia';
import type { WorkspaceState } from '../../../features/export-share/types/export-share.types';

const stateParamRef = vi.hoisted(() => ({ value: '' }));
const routerPushMock = vi.hoisted(() => vi.fn());

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {
      get state() {
        return stateParamRef.value;
      },
    },
  }),
  useRouter: () => ({ push: routerPushMock }),
}));

function buildPayload(state: WorkspaceState): string {
  return WorkspaceStateCompressor.serializeState(state);
}

const sampleState: WorkspaceState = {
  algorithmId: 'quicksort-recursion',
  layoutNodes: [
    { id: 'Pivot', x: 200, y: 100 },
    { id: 'Left', x: 100, y: 250 },
    { id: 'Right 📦', x: 350, y: 250 },
  ],
  currentStepIndex: 4,
};

describe('ShareRestoreView (EX-002 / EX-007)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    stateParamRef.value = '';
    routerPushMock.mockClear();
  });

  it('should show the error state when ?state= is missing', async () => {
    const wrapper = mount(ShareRestoreView);

    expect(wrapper.find('.share-restore-error').exists()).toBe(true);
    expect(wrapper.text()).toContain('KHÔNG THỂ KHÔI PHỤC PHÒNG LAB');
    expect(wrapper.text()).toContain('thiếu tham số ?state=');

    wrapper.unmount();
  });

  it('should restore the workspace from a valid compressed payload', async () => {
    stateParamRef.value = buildPayload(sampleState);

    const wrapper = mount(ShareRestoreView);

    expect(wrapper.find('.share-restore-error').exists()).toBe(false);
    expect(wrapper.text()).toContain('PHÒNG LAB ĐƯỢC CHIA SẺ');
    expect(wrapper.text()).toContain('quicksort-recursion');
    expect(wrapper.text()).toContain('3 node');

    wrapper.unmount();
  });

  it('should render one SVG node rect per layout node', async () => {
    stateParamRef.value = buildPayload(sampleState);

    const wrapper = mount(ShareRestoreView);

    expect(wrapper.findAll('.share-restore-svg rect')).toHaveLength(4);

    wrapper.unmount();
  });

  it('should show error state for corrupt/invalid payload', async () => {
    stateParamRef.value = 'not-a-valid-lz-payload!!!';

    const wrapper = mount(ShareRestoreView);

    expect(wrapper.find('.share-restore-error').exists()).toBe(true);
    expect(wrapper.text()).toContain('bị hỏng hoặc không hợp lệ');

    wrapper.unmount();
  });

  it('should show error state when payload decompresses but state shape is invalid', async () => {
    stateParamRef.value = buildPayload({
      algorithmId: 'broken',
      layoutNodes: [{ id: '', x: Number.NaN, y: 5 }],
      currentStepIndex: 0,
    });

    const wrapper = mount(ShareRestoreView);

    expect(wrapper.find('.share-restore-error').exists()).toBe(true);

    wrapper.unmount();
  });

  it('roundtrip: generateShareLink → restore view khôi phục đúng state (EX-007)', async () => {
    const store = useExportShareStore();
    await store.generateShareLink(sampleState);

    const url = new URL(store.generatedShareLink);
    stateParamRef.value = url.searchParams.get('state') as string;

    const wrapper = mount(ShareRestoreView);

    expect(wrapper.find('.share-restore-error').exists()).toBe(false);
    expect(wrapper.text()).toContain('quicksort-recursion');
    expect(wrapper.text()).toContain('Right 📦');

    wrapper.unmount();
  });

  it('MỞ TRONG PHÒNG LAB → router.push("/export-share") với state đã serialize', async () => {
    stateParamRef.value = buildPayload(sampleState);

    const wrapper = mount(ShareRestoreView);

    const openBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('MỞ TRONG PHÒNG LAB'));
    expect(openBtn).toBeTruthy();
    await openBtn!.trigger('click');

    expect(routerPushMock).toHaveBeenCalledTimes(1);
    expect(routerPushMock).toHaveBeenCalledWith({
      path: '/export-share',
      query: { state: expect.any(String) },
    });

    wrapper.unmount();
  });

  it('QUAY VỀ → router.push("/export-share") khi state lỗi', async () => {
    const wrapper = mount(ShareRestoreView);

    const backBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('QUAY VỀ TRANG EXPORT / SHARE'));
    expect(backBtn).toBeTruthy();
    await backBtn!.trigger('click');

    expect(routerPushMock).toHaveBeenCalledWith({ path: '/export-share' });

    wrapper.unmount();
  });
});
