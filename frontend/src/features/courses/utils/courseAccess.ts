import type { Course } from '../types/course.types';

/**
 * Helper gating Premium DÙNG CHUNG (LM-037): mọi điểm vào bài học
 * (chi tiết khóa học / sidebar / CTA / prev-next) đều đi qua đây để
 * không lệch luồng (detail → /checkout nhưng sidebar lại đi thẳng vào 403).
 */
export function resolveLessonRoute(
  course: Pick<Course, 'id' | 'isPremium'> | null | undefined,
  lessonId: string,
  hasPremium: boolean,
): string {
  if (course?.isPremium && !hasPremium) return '/checkout';
  const courseQuery = course ? `?courseId=${encodeURIComponent(course.id)}` : '';
  return `/lessons/${lessonId}${courseQuery}`;
}

/** Đường dẫn CTA "Bắt đầu/Tiếp tục/Ôn tập" trên trang chi tiết khóa học. */
export function resolveStartCourseUrl(
  course: (Pick<Course, 'id' | 'isPremium'> & { lessons: Array<{ id: string }> }) | null | undefined,
  firstUncompletedLessonId: string | null,
  hasPremium: boolean,
): string {
  if (!course) return '/courses';
  if (course.isPremium && !hasPremium) return '/checkout';
  if (firstUncompletedLessonId) return `/lessons/${firstUncompletedLessonId}?courseId=${course.id}`;
  if (course.lessons.length > 0) return `/lessons/${course.lessons[0].id}?courseId=${course.id}`;
  return `/courses/${course.id}`;
}
