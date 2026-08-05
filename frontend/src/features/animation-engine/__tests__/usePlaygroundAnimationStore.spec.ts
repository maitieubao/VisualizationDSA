import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAnimationStore, usePlaygroundAnimationStore } from '../store/useAnimationStore';
import type { AlgorithmResult, FrameDTO } from '../types/animation.types';

function makeResult(seed: number, frameCount = 1): AlgorithmResult {
  const frames: FrameDTO[] = Array.from({ length: frameCount }, (_, i) => ({
    stepId: i + 1,
    activeLine: 0,
    explanation: `seed-${seed}-${i}`,
    dataState: [seed],
  }));
  return { algorithmId: `algo-${seed}`, pseudoCode: ['line'], frames };
}

describe('usePlaygroundAnimationStore — cô lập khỏi useAnimationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('loadResult vào playground không ảnh hưởng store chính (GraphView v-show)', () => {
    const main = useAnimationStore();
    const playground = usePlaygroundAnimationStore();

    playground.loadResult(makeResult(1));

    expect(playground.totalSteps).toBe(1);
    expect(playground.algorithmId).toBe('algo-1');
    expect(main.totalSteps).toBe(0);
    expect(main.algorithmId).toBe('');
  });

  it('loadResult vào store chính không ảnh hưởng playground', () => {
    const main = useAnimationStore();
    const playground = usePlaygroundAnimationStore();

    main.loadResult(makeResult(2));

    expect(main.totalSteps).toBe(1);
    expect(playground.totalSteps).toBe(0);
  });

  it('currentIndex / isPlaying / currentFrame hoạt động độc lập giữa hai instance', () => {
    const main = useAnimationStore();
    const playground = usePlaygroundAnimationStore();

    playground.loadResult(makeResult(3, 4));
    playground.stepForward();
    main.play();

    expect(main.isPlaying).toBe(true);
    expect(playground.isPlaying).toBe(false);
    expect(playground.currentIndex).toBe(1);
    expect(main.currentFrame).toBeNull();

    main.pause();
    playground.pause();
  });
});
