
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PlaygroundDebouncer } from '../engine/PlaygroundDebouncer';

describe('PlaygroundDebouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay execution until after the debounce window', () => {
    const callback = vi.fn();
    const debouncer = new PlaygroundDebouncer(500);
    debouncer.schedule(callback);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(499);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should collapse multiple rapid schedules into a single execution', () => {
    const callback = vi.fn();
    const debouncer = new PlaygroundDebouncer(300);

    debouncer.schedule(callback);
    vi.advanceTimersByTime(100);
    debouncer.schedule(callback);
    vi.advanceTimersByTime(100);
    debouncer.schedule(callback);
    vi.advanceTimersByTime(100);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should allow cancel to prevent execution entirely', () => {
    const callback = vi.fn();
    const debouncer = new PlaygroundDebouncer(300);
    debouncer.schedule(callback);
    debouncer.cancel();
    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('should allow immediate flush', () => {
    const callback = vi.fn();
    const debouncer = new PlaygroundDebouncer(500);
    debouncer.schedule(callback);
    debouncer.flush();
    expect(callback).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use the latest callback when schedule called repeatedly', () => {
    const first = vi.fn();
    const second = vi.fn();
    const debouncer = new PlaygroundDebouncer(200);

    debouncer.schedule(first);
    debouncer.schedule(second);
    vi.advanceTimersByTime(200);
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
