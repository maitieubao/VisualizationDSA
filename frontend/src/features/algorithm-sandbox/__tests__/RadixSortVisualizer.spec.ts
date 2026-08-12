// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RadixSortVisualizer from '../components/RadixSortVisualizer.vue';
import { generateRadixSortFrames } from '../algorithms/radixSort';

const BASE_STUBS = { BaseIcon: { template: '<span />' } };

describe('SV-015 (P2): RadixSortVisualizer mount', () => {
  const frames = generateRadixSortFrames([45, 12, 85, 32, 9, 60]);

  it('render banner + inspector + phase Phân Phối với frame distribute', () => {
    const wrapper = mount(RadixSortVisualizer, {
      props: { frame: frames[0] },
      global: { stubs: BASE_STUBS },
    });

    expect(wrapper.find('.r-banner').exists()).toBe(true);
    expect(wrapper.find('.r-inspector').exists()).toBe(true);
    expect(wrapper.text()).toContain('Phân Phối');
    expect(wrapper.text()).toContain('Đơn vị (1s)');
  });

  it('frame collect → phase Thu Hoạch + không crash', () => {
    const collect = frames.find(f => f.radixStep === 'collect')!;
    const wrapper = mount(RadixSortVisualizer, {
      props: { frame: collect },
      global: { stubs: BASE_STUBS },
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain('Thu Hoạch');
  });

  it('chip chữ số sáng đúng hàng theo activeDigitPlace (SV-036: >100 không kẹt)', () => {
    const hundreds = generateRadixSortFrames([123, 456, 789]).find(f => f.activeDigitPlace === 100)!;
    const wrapper = mount(RadixSortVisualizer, {
      props: { frame: hundreds },
      global: { stubs: BASE_STUBS },
    });

    const onChips = wrapper.findAll('.r-chip--on');
    expect(onChips.length).toBe(1);
    expect(onChips[0].text()).toContain('Trăm (100s)');
  });

  it('frame null → không crash', () => {
    const wrapper = mount(RadixSortVisualizer, {
      props: { frame: null },
      global: { stubs: BASE_STUBS },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it('banner mô tả theo frame hiện tại', () => {
    const distribute = frames.find(f => f.radixStep === 'distribute' && f.comparingIndices !== null)!;
    const wrapper = mount(RadixSortVisualizer, {
      props: { frame: distribute },
      global: { stubs: BASE_STUBS },
    });
    expect(wrapper.text()).toContain(distribute.description);
  });
});
