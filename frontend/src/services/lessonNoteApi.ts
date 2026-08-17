import { api } from './apiClient';

/** F5 (FR-2.6) — Ghi chú bài học: payload/response của LessonNotesController. */
export interface LessonNoteDto {
  contentHtml: string;
  updatedAt: string;
}

export interface UpsertLessonNoteDto {
  contentHtml: string;
}

export const lessonNoteApi = {
  getNote: (lessonId: string) =>
    api.get<{ note: LessonNoteDto | null }>(`/lessons/${encodeURIComponent(lessonId)}/note`),
  upsertNote: (lessonId: string, contentHtml: string) =>
    api.put<{ message: string; note: LessonNoteDto }>(
      `/lessons/${encodeURIComponent(lessonId)}/note`,
      { contentHtml } satisfies UpsertLessonNoteDto,
    ),
  deleteNote: (lessonId: string) =>
    api.delete<{ message: string }>(`/lessons/${encodeURIComponent(lessonId)}/note`),
};
