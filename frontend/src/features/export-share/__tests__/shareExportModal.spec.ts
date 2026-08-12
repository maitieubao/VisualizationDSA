// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { Pinia } from 'pinia';
import { setActivePinia, createPinia } from 'pinia';
import { nextTick } from 'vue';
import ShareExportModal from '../components/ShareExportModal.vue';
import { useExportShareStore } from '../store/useExportShareStore';
import type { WorkspaceState } from '../types/export-share.types';

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn(async () => {}),
  },
}));

const SHARE_LINK =
  'https://visualization-dsa.edu.vn/s/?state=N4IghiBcCMC%2BQ';

function createSvgElement(): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 800 500');
  return svg;
}

const workspaceState: WorkspaceState = {
  algorithmId: 'quicksort-recursion',
  layoutNodes: [{ id: 'Root', x: 0, y: 0 }],
  currentStepIndex: 2,
};

describe('ShareExportModal (EX-007)', () => {
  let pinia: Pinia;
  let store: ReturnType<typeof useExportShareStore>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    store = useExportShareStore();
    store.openModal();
  });

  function mountModal(props: {
    svgElement?: SVGElement | null;
    workspaceState?: WorkspaceState | null;
  } = {}) {
    return mount(ShareExportModal, {
      props,
      global: {
        plugins: [pinia],
        stubs: { Teleport: true },
      },
    });
  }

  it('should render the dialog title when modal is open', () => {
    const wrapper = mountModal();
    expect(wrapper.text()).toContain('XUẤT SƠ ĐỒ / SHARE');
    wrapper.unmount();
  });

  it('should not render anything when modal is closed', () => {
    store.closeModal();
    const wrapper = mountModal();
    expect(wrapper.text()).not.toContain('XUẤT SƠ ĐỒ / SHARE');
    wrapper.unmount();
  });

  it('TẢI PNG click → store.downloadPNG3x called with the svgElement prop (EX-007)', async () => {
    const svgElement = createSvgElement();
    const downloadPNG3xSpy = vi
      .spyOn(store, 'downloadPNG3x')
      .mockResolvedValue(undefined);

    const wrapper = mountModal({ svgElement });
    const exportBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('TẢI ẢNH PNG 3X'));
    expect(exportBtn).toBeTruthy();

    await exportBtn!.trigger('click');
    expect(downloadPNG3xSpy).toHaveBeenCalledTimes(1);
    expect(downloadPNG3xSpy).toHaveBeenCalledWith(svgElement);

    wrapper.unmount();
    downloadPNG3xSpy.mockRestore();
  });

  it('TẢI SVG click → store.downloadSVG called with the svgElement prop (EX-007)', async () => {
    const svgElement = createSvgElement();
    store.selectedFormat = 'svg-vector';
    const downloadSVGSpy = vi.spyOn(store, 'downloadSVG').mockResolvedValue();

    const wrapper = mountModal({ svgElement });
    const exportBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('TẢI TỆP SVG VECTOR'));
    expect(exportBtn).toBeTruthy();

    await exportBtn!.trigger('click');
    expect(downloadSVGSpy).toHaveBeenCalledTimes(1);
    expect(downloadSVGSpy).toHaveBeenCalledWith(svgElement);

    wrapper.unmount();
    downloadSVGSpy.mockRestore();
  });

  it('should not export when svgElement prop is missing', async () => {
    const downloadPNG3xSpy = vi
      .spyOn(store, 'downloadPNG3x')
      .mockResolvedValue(undefined);
    const downloadSVGSpy = vi.spyOn(store, 'downloadSVG').mockResolvedValue();

    const wrapper = mountModal({ svgElement: null, workspaceState });
    const exportBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('TẢI ẢNH PNG 3X'));
    await exportBtn!.trigger('click');

    expect(downloadPNG3xSpy).not.toHaveBeenCalled();
    expect(downloadSVGSpy).not.toHaveBeenCalled();

    wrapper.unmount();
    downloadPNG3xSpy.mockRestore();
    downloadSVGSpy.mockRestore();
  });

  it('GENERATE SHARE LINK click → store.generateShareLink called with workspaceState (EX-007)', async () => {
    const generateShareLinkSpy = vi
      .spyOn(store, 'generateShareLink')
      .mockResolvedValue(undefined);

    const wrapper = mountModal({ workspaceState });
    const generateBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('GENERATE SHARE LINK'));
    expect(generateBtn).toBeTruthy();

    await generateBtn!.trigger('click');
    expect(generateShareLinkSpy).toHaveBeenCalledTimes(1);
    expect(generateShareLinkSpy).toHaveBeenCalledWith(workspaceState);

    wrapper.unmount();
    generateShareLinkSpy.mockRestore();
  });

  it('should not generate link when workspaceState prop is missing', async () => {
    const generateShareLinkSpy = vi
      .spyOn(store, 'generateShareLink')
      .mockResolvedValue(undefined);

    const wrapper = mountModal({ svgElement: createSvgElement() });
    const generateBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('GENERATE SHARE LINK'));
    await generateBtn!.trigger('click');

    expect(generateShareLinkSpy).not.toHaveBeenCalled();

    wrapper.unmount();
    generateShareLinkSpy.mockRestore();
  });

  it('COPY LINK click → store.copyShareLinkToClipboard called (EX-007)', async () => {
    store.generatedShareLink = SHARE_LINK;
    const copySpy = vi
      .spyOn(store, 'copyShareLinkToClipboard')
      .mockResolvedValue(true);

    const wrapper = mountModal({ workspaceState });
    await nextTick();

    const linkDisplay = wrapper.find('.link-display');
    expect(linkDisplay.exists()).toBe(true);
    expect(wrapper.find('.link-text').text()).toBe(SHARE_LINK);

    const copyBtn = wrapper
      .findAll('button')
      .find((b) => b.text().includes('COPY LINK'));
    expect(copyBtn).toBeTruthy();

    await copyBtn!.trigger('click');
    expect(copySpy).toHaveBeenCalledTimes(1);

    wrapper.unmount();
    copySpy.mockRestore();
  });

  it('should display overflowError message when set', async () => {
    store.overflowError = 'WORKSPACE_OVERFLOW: Sơ đồ quá đồ sộ...';

    const wrapper = mountModal({ workspaceState });
    await nextTick();

    expect(wrapper.find('.overflow-error').text()).toContain('WORKSPACE_OVERFLOW');

    wrapper.unmount();
  });
});
