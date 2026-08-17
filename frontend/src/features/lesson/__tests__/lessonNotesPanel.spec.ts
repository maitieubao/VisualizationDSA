// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import LessonNotesPanel from '../components/LessonNotesPanel.vue';

const { getNote, upsertNote, deleteNote } = vi.hoisted(() => ({
  getNote: vi.fn(),
  upsertNote: vi.fn(),
  deleteNote: vi.fn(),
}));

vi.mock('../../../services/lessonNoteApi', () => ({
  lessonNoteApi: { getNote, upsertNote, deleteNote },
}));

describe('LessonNotesPanel — autosave ghi chú (F5/FR-2.6)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getNote.mockReset();
    upsertNote.mockReset();
    deleteNote.mockReset();
    getNote.mockResolvedValue({ note: null });
    upsertNote.mockResolvedValue({ message: 'ok', note: { contentHtml: 'x', updatedAt: 'now' } });
    deleteNote.mockResolvedValue({ message: 'ok' });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('tải ghi chú hiện có khi mount', async () => {
    getNote.mockResolvedValue({ note: { contentHtml: '<p>Ghi chú cũ</p>', updatedAt: '2026-01-01' } });
    const wrapper = mount(LessonNotesPanel, {
      props: { lessonId: 'lesson-1' },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('<p>Ghi chú cũ</p>');
  });

  it('debounce 1 giây: gõ nhanh chỉ gọi upsert 1 lần sau khi dừng', async () => {
    const wrapper = mount(LessonNotesPanel, {
      props: { lessonId: 'lesson-1' },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    const textarea = wrapper.find('textarea');
    await textarea.setValue('ghi chú 1');
    await textarea.setValue('ghi chú 2');
    await textarea.setValue('ghi chú cuối');

    expect(upsertNote).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);
    expect(upsertNote).toHaveBeenCalledTimes(1);
    expect(upsertNote).toHaveBeenCalledWith('lesson-1', 'ghi chú cuối');
  });

  it('bấm xóa ghi chú gọi DELETE và xóa textarea', async () => {
    getNote.mockResolvedValue({ note: { contentHtml: '<p>Để xóa</p>', updatedAt: 'now' } });
    const wrapper = mount(LessonNotesPanel, {
      props: { lessonId: 'lesson-1' },
      global: { stubs: { BaseIcon: { template: '<span />' } } },
    });
    await flushPromises();

    const button = wrapper.findAll('button').find((b) => b.text().includes('Xóa ghi chú'));
    await button!.trigger('click');
    await flushPromises();

    expect(deleteNote).toHaveBeenCalledWith('lesson-1');
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('');
  });
});
