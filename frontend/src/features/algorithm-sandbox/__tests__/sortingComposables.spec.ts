// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { mount } from '@vue/test-utils';

import { useRadixSortVisualizer } from '../composables/useRadixSortVisualizer';
import { useBucketSortVisualizer } from '../composables/useBucketSortVisualizer';
import { useCountingSortVisualizer } from '../composables/useCountingSortVisualizer';
import { useHeapSortVisualizer } from '../composables/useHeapSortVisualizer';
import { generateRadixSortFrames } from '../algorithms/radixSort';
import { generateBucketSortFrames } from '../algorithms/bucketSort';
import { generateCountingSortFrames } from '../algorithms/countingSort';
import { generateHeapSortFrames } from '../algorithms/heapSort';
import RadixSortVisualizer from '../components/RadixSortVisualizer.vue';
import SortingAlgorithmControls from '../components/SortingAlgorithmControls.vue';

describe('SV-015 (P2): Composables riêng — phase/color/label logic', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('useRadixSortVisualizer', () => {
    const frames = generateRadixSortFrames([45, 12, 85, 32, 9, 60]);

    it('digitPlaceLabel theo activeDigitPlace + isDistributePhase', () => {
      const tens = frames.find(f => f.activeDigitPlace === 10 && f.radixStep === 'distribute')!;
      const viz = useRadixSortVisualizer(() => tens);
      expect(viz.activeDigitPlace.value).toBe(10);
      expect(viz.digitPlaceLabel.value).toBe('Hàng chục (10s)');
      expect(viz.isDistributePhase.value).toBe(true);

      const ones = frames.find(f => f.activeDigitPlace === 1 && f.radixStep === 'distribute')!;
      const vizOnes = useRadixSortVisualizer(() => ones);
      expect(vizOnes.digitPlaceLabel.value).toBe('Hàng đơn vị (1s)');
    });

    it('activeElementIdx/activeBucketIdx theo comparingIndices + digit thực', () => {
      const distribute = frames.find(f => f.radixStep === 'distribute' && f.comparingIndices !== null)!;
      const viz = useRadixSortVisualizer(() => distribute);
      const [activeIdx] = distribute.comparingIndices!;
      const val = distribute.arrayState[activeIdx];
      const expectedDigit = Math.floor(val / distribute.activeDigitPlace!) % 10;
      expect(viz.activeElementIdx.value).toBe(activeIdx);
      expect(viz.activeBucketIdx.value).toBe(expectedDigit);
      expect(viz.hasActiveConnection.value).toBe(true);
    });

    it('cellClass trả class dist/coll/idle theo phase', () => {
      const distribute = frames.find(f => f.radixStep === 'distribute' && f.comparingIndices !== null)!;
      const viz = useRadixSortVisualizer(() => distribute);
      const [activeIdx] = distribute.comparingIndices!;
      expect(viz.cellClass(activeIdx)).toBe('r-cell--dist');
      expect(viz.cellClass(activeIdx + 1)).toBe('r-cell--idle');
    });

    it('activeDigit/prefixDigits/suffixDigits tách chữ số đúng', () => {
      const tens = frames.find(f => f.activeDigitPlace === 10)!;
      const viz = useRadixSortVisualizer(() => tens);
      expect(viz.activeDigit(45)).toBe('4');
      expect(viz.prefixDigits(45)).toBe('');
      expect(viz.suffixDigits(45)).toBe('5');
    });

    it('frame null → displayItems dùng arrayState fallback, không crash', () => {
      const viz = useRadixSortVisualizer(() => null);
      expect(viz.n.value).toBe(1);
      expect(viz.isDistributePhase.value).toBe(true);
      expect(viz.digitPlaceLabel.value).toBe('Hàng đơn vị (1s)');
      expect(viz.cellClass(0)).toBe('r-cell--idle');
    });
  });

  describe('useBucketSortVisualizer', () => {
    const frames = generateBucketSortFrames([45, 12, 85, 32, 9, 60]);

    it('phaseClass: phase hiện tại → active, sau → complete, trước → idle', () => {
      const distributeDone = frames.find(f => f.description.includes('Phân phối thành công phần tử A[3]'))!;
      const viz = useBucketSortVisualizer(() => distributeDone);
      expect(viz.phase.value).toBe('distribute');
      expect(viz.phaseClass('distribute')).toBe('bucket-phase--distribute');
      expect(viz.phaseClass('sort')).toBe('bucket-phase--idle');
      expect(viz.phaseClass('collect')).toBe('bucket-phase--idle');

      const collectStart = frames.find(f => f.bucketStep === 'collect')!;
      const vizCollect = useBucketSortVisualizer(() => collectStart);
      expect(vizCollect.phaseClass('distribute')).toBe('bucket-phase--complete');
      expect(vizCollect.phaseClass('sort')).toBe('bucket-phase--complete');
      expect(vizCollect.phaseClass('collect')).toBe('bucket-phase--collect');
    });

    it('bucketStatus: NHẬN / XONG / CHỜ theo activeBucket & phase', () => {
      const distributing = frames.find(f => f.description.includes('Đang phân loại phần tử A[1]'))!;
      const viz = useBucketSortVisualizer(() => distributing);
      const active = viz.activeBucket.value;
      expect(viz.bucketStatus(active)).toBe('NHẬN');
      if (active > 0) expect(viz.bucketStatus(active - 1)).toBe('XONG');
      if (active < 3) expect(viz.bucketStatus(active + 1)).toBe('CHỜ');
    });

    it('stableColor ổn định theo id (cùng id → cùng màu)', () => {
      const viz = useBucketSortVisualizer(() => frames[0]);
      const a = viz.stableColor(3);
      const b = viz.stableColor(3);
      const c = viz.stableColor(4);
      expect(a).toEqual(b);
      expect(a.border).toContain('var(--color-accent');
      expect(c.border).toContain('var(--color-accent');
    });

    it('outputItems giữ độ dài input, phần chưa thu hồi là null', () => {
      const collectFrame = frames.find(f => f.bucketStep === 'collect')!;
      const viz = useBucketSortVisualizer(() => collectFrame);
      expect(viz.outputItems.value.length).toBe(6);
      expect(viz.outputItems.value.some(item => item === null)).toBe(true);
    });
  });

  describe('useCountingSortVisualizer', () => {
    const frames = generateCountingSortFrames([45, 12, 85]);

    it('digitParts: tách prefix/digit/suffix theo activePlace', () => {
      const tens = frames.find(f => f.activeDigitPlace === 10)!;
      const viz = useCountingSortVisualizer(() => tens);
      expect(viz.placeLabel.value).toBe('chục');
      expect(viz.digitParts(45)).toEqual({ prefix: '', digit: '4', suffix: '5' });
      expect(viz.digitParts(85)).toEqual({ prefix: '', digit: '8', suffix: '5' });
    });

    it('digitParts hỗ trợ số âm qua countOffset', () => {
      const negFrames = generateCountingSortFrames([-5, -9, 3]);
      const ones = negFrames.find(f => f.activeDigitPlace === 1)!;
      const viz = useCountingSortVisualizer(() => ones);
      expect(viz.digitOf(-5)).toBe(4);
      expect(viz.digitParts(-9)).toEqual({ prefix: '-', digit: '0', suffix: '' });
    });

    it('phaseClass: count → accumulate/output lần lượt active/complete', () => {
      const countFrame = frames.find(f => f.countingStep === 'count' && f.comparingIndices !== null)!;
      const viz = useCountingSortVisualizer(() => countFrame);
      expect(viz.phaseClass('count')).toBe('count-phase--count');
      expect(viz.phaseClass('accumulate')).toBe('count-phase--idle');

      const accumulateFrame = frames.find(f => f.countingStep === 'accumulate')!;
      const vizAcc = useCountingSortVisualizer(() => accumulateFrame);
      expect(vizAcc.phaseClass('count')).toBe('count-phase--complete');
      expect(vizAcc.phaseClass('accumulate')).toBe('count-phase--accumulate');
    });

    it('isComplete đúng khi sortedIndices phủ toàn bộ input', () => {
      const finalFrame = frames[frames.length - 1];
      const viz = useCountingSortVisualizer(() => finalFrame);
      expect(viz.isComplete.value).toBe(true);
      const initFrame = frames[0];
      const vizInit = useCountingSortVisualizer(() => initFrame);
      expect(vizInit.isComplete.value).toBe(false);
    });
  });

  describe('useHeapSortVisualizer', () => {
    const frames = generateHeapSortFrames([5, 3, 8, 4, 2]);

    it('getNodeClass: node-comparing khi nằm trong comparingIndices', () => {
      const compareFrame = frames.find(f => f.comparingIndices !== null)!;
      const viz = useHeapSortVisualizer(() => compareFrame);
      const [a] = compareFrame.comparingIndices!;
      expect(viz.getNodeClass(a)).toContain('node-comparing');
    });

    it('getNodeClass: node-swapped khi nằm trong swappedIndices', () => {
      const swapFrame = frames.find(f => f.swappedIndices !== null)!;
      const viz = useHeapSortVisualizer(() => swapFrame);
      const [a] = swapFrame.swappedIndices!;
      expect(viz.getNodeClass(a)).toContain('node-swapped');
    });

    it('getNodeClass: ngoài heap (SORT phase) → node-sorted', () => {
      const sortedNodeFrame = frames.find(f => {
        const hs = f.heapSize;
        return hs !== undefined
          && hs < 5
          && f.swappedIndices === null
          && !(f.comparingIndices?.includes(hs));
      });
      expect(sortedNodeFrame).toBeDefined();
      const viz = useHeapSortVisualizer(() => sortedNodeFrame!);
      const hs = sortedNodeFrame!.heapSize!;
      expect(viz.getNodeClass(hs)).toContain('node-sorted');
    });

    it('getParentIndex/getXPct/getYPct hợp lệ trong [0,100]', () => {
      const viz = useHeapSortVisualizer(() => frames[0]);
      expect(viz.getParentIndex(3)).toBe(1);
      expect(viz.getParentIndex(4)).toBe(1);
      expect(viz.getParentIndex(0)).toBe(0);
      for (let i = 0; i < 5; i++) {
        const x = viz.getXPct(i);
        const y = viz.getYPct(i);
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(100);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(100);
      }
    });

    it('currentPhase chuyển BUILD → SORT khi heapSize < total', () => {
      const vizBuild = useHeapSortVisualizer(() => frames[0]);
      expect(vizBuild.currentPhase.value).toBe('BUILD');
      const extractFrame = frames.find(f => f.heapSize! < 5)!;
      const vizSort = useHeapSortVisualizer(() => extractFrame);
      expect(vizSort.currentPhase.value).toBe('SORT');
    });
  });

  describe('Component mount: RadixSortVisualizer + SortingAlgorithmControls', () => {
    const frames = generateRadixSortFrames([45, 12, 85, 32, 9, 60]);

    it('RadixSortVisualizer render banner với frame', () => {
      const wrapper = mount(RadixSortVisualizer, {
        props: { frame: frames[0] },
        global: { stubs: { BaseIcon: { template: '<span />' } } },
      });
      expect(wrapper.find('.r-banner').exists()).toBe(true);
      expect(wrapper.text()).toContain('Phân Phối');
    });

    it('SortingAlgorithmControls: 7 nút, aria-pressed đúng + type=button', () => {
      const wrapper = mount(SortingAlgorithmControls, {
        props: { selectedAlgo: 'bubble' },
      });
      const buttons = wrapper.findAll('button');
      expect(buttons.length).toBe(7);
      expect(buttons.map(b => b.text())).toEqual([
        'Bubble', 'Quick', 'Merge', 'Heap', 'Radix', 'Counting', 'Bucket',
      ]);
      for (const b of buttons) {
        expect(b.attributes('type')).toBe('button');
      }
      const pressed = buttons.filter(b => b.attributes('aria-pressed') === 'true');
      expect(pressed.length).toBe(1);
      expect(pressed[0].text()).toBe('Bubble');
    });

    it('SortingAlgorithmControls: click nút → emit select với algo key', async () => {
      const wrapper = mount(SortingAlgorithmControls, {
        props: { selectedAlgo: 'bubble' },
      });
      const quickBtn = wrapper.findAll('button')[1];
      await quickBtn.trigger('click');
      expect(wrapper.emitted('select')).toEqual([['quick']]);
    });
  });
});
