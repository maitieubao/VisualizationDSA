import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadLecture, hasLecture, getAvailableLectureIds } from '../services/lectureLoader';

describe('lectureLoader', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hasLecture returns true for bubble-sort', () => {
    expect(hasLecture('bubble-sort')).toBe(true);
  });

  it('hasLecture returns false for unknown algorithm', () => {
    expect(hasLecture('unknown-algo')).toBe(false);
  });

  it('getAvailableLectureIds returns bundled lecture IDs', () => {
    const ids = getAvailableLectureIds();
    expect(ids).toContain('bubble-sort');
    expect(ids.length).toBeGreaterThan(0);
  });

  it('loadLecture returns bundled lecture for bubble-sort', async () => {
    const lecture = await loadLecture('bubble-sort');
    expect(lecture).not.toBeNull();
    expect(lecture?.lectureId).toBe('bubble-sort-intro-101');
    expect(lecture?.algorithmId).toBe('bubble-sort');
    expect(lecture?.title).toBeTruthy();
    expect(lecture?.slides.length).toBeGreaterThanOrEqual(3);
  });

  it('loadLecture returns null for unknown algorithm (fetch fails)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));
    const lecture = await loadLecture('radix-sort');
    expect(lecture).toBeNull();
  });

  it('loadLecture returns null when API returns 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);
    const lecture = await loadLecture('heap-sort');
    expect(lecture).toBeNull();
  });

  it('bundled bubble-sort lecture has correct slide types', async () => {
    const lecture = await loadLecture('bubble-sort');
    expect(lecture).not.toBeNull();

    const types = lecture!.slides.map(s => s.type);
    expect(types).toContain('theory');
    expect(types).toContain('guided-animation');
    expect(types).toContain('interactive-check');
  });

  it('bundled bubble-sort lecture has valid actions', async () => {
    const lecture = await loadLecture('bubble-sort');
    expect(lecture).not.toBeNull();

    for (const slide of lecture!.slides) {
      expect(['RESET_CANVAS', 'PLAY_UNTIL', 'PAUSE']).toContain(slide.action.command);
      expect(slide.action.targetFrame).toBeGreaterThanOrEqual(0);
    }
  });
});
