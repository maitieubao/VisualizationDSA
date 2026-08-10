import { describe, it, expect, vi, afterEach } from 'vitest';
import { loadLecture, hasLecture, getAvailableLectureIds, isLectureAvailable } from '../services/lectureLoader';

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

describe('isLectureAvailable', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('trả về true cho lecture bundled mà không gọi API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const result = await isLectureAvailable('bubble-sort');

    expect(result).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('trả về true khi HEAD request thành công (lecture tồn tại trên server)', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as unknown as Response);

    const result = await isLectureAvailable('quick-sort');

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/lectures/quick-sort'),
      { method: 'HEAD' },
    );
  });

  it('trả về false khi HEAD trả về 404 (lecture không tồn tại)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as unknown as Response);

    const result = await isLectureAvailable('dijkstra');

    expect(result).toBe(false);
  });

  it('trả về false khi API không ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response);

    const result = await isLectureAvailable('dijkstra');

    expect(result).toBe(false);
  });

  it('trả về false khi API lỗi mạng', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const result = await isLectureAvailable('dijkstra');

    expect(result).toBe(false);
  });
});
