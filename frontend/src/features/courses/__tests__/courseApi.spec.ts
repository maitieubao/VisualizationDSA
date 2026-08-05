import { describe, it, expect, vi, beforeEach } from 'vitest';
import { courseApi } from '../../../services/courseApi';
import type { CreateCourseDto, AddModuleDto, AddModuleItemDto } from '../../../services/courseApi';
import type { Course } from '../../../features/courses/types/course.types';
import * as apiClient from '../../../services/apiClient';

vi.mock('../../../services/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockCourseDto: CreateCourseDto = {
  title: 'Thuật toán Sắp xếp',
  description: 'Khóa học sắp xếp cơ bản',
  category: 'Sorting',
  difficulty: 'Easy',
  isPremium: false,
  coverImageUrl: 'https://example.com/cover.png',
  isPublished: true,
};

const mockModuleDto: AddModuleDto = {
  title: 'Chương 1: Giới thiệu',
  description: 'Mô tả chương',
  orderIndex: 0,
};

const mockItemDto: AddModuleItemDto = {
  itemType: 'Lesson',
  lessonId: 'lesson-1',
  quizId: null,
  codelabId: null,
  overrideTitle: 'Bài 1: Bubble Sort',
  orderIndex: 0,
  isRequired: true,
};

const mockCourses: Course[] = [
  {
    id: 'sorting-101',
    title: 'Thuật toán Sắp xếp Cơ bản',
    description: 'Làm chủ các thuật toán sắp xếp cơ bản.',
    category: 'Sorting',
    difficulty: 'Easy',
    xpReward: 300,
    isPremium: false,
    totalLessons: 3,
    lessons: [
      { id: 'bubble-sort', title: 'Bubble Sort', order: 1 },
      { id: 'selection-sort', title: 'Selection Sort', order: 2 },
      { id: 'insertion-sort', title: 'Insertion Sort', order: 3 },
    ],
    isPublished: true,
    coverImage: 'https://example.com/cover.png',
  },
];

describe('courseApi — Giao tiếp Backend Khóa học', () => {
  const mockedApi = vi.mocked(apiClient.api);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCourses', () => {
    it('GET từ /concepts/courses trả về danh sách khóa học', async () => {
      mockedApi.get.mockResolvedValueOnce(mockCourses);

      const result = await courseApi.getCourses();

      expect(mockedApi.get).toHaveBeenCalledWith('/concepts/courses');
      expect(result).toHaveLength(1);
      expect(result[0]?.title).toBe('Thuật toán Sắp xếp Cơ bản');
    });

    it('GET từ /concepts/courses trả về mảng rỗng khi không có khóa học', async () => {
      mockedApi.get.mockResolvedValueOnce([]);

      const result = await courseApi.getCourses();

      expect(result).toHaveLength(0);
    });
  });

  describe('getCourseById', () => {
    it('GET từ /concepts/courses/{id} trả về khóa học theo id', async () => {
      mockedApi.get.mockResolvedValueOnce(mockCourses[0]);

      const result = await courseApi.getCourseById('sorting-101');

      expect(mockedApi.get).toHaveBeenCalledWith('/concepts/courses/sorting-101');
      expect(result?.id).toBe('sorting-101');
    });

    it('GET từ /concepts/courses/{id} trả về undefined khi không tìm thấy', async () => {
      mockedApi.get.mockResolvedValueOnce(null);

      const result = await courseApi.getCourseById('unknown-id');

      expect(result).toBeNull();
    });
  });

  describe('createCourse', () => {
    it('POST tới /concepts/courses với DTO đầy đủ', async () => {
      mockedApi.post.mockResolvedValueOnce({ courseId: 'course-1', message: 'Tạo khóa học thành công' });

      const result = await courseApi.createCourse(mockCourseDto);

      expect(mockedApi.post).toHaveBeenCalledWith('/concepts/courses', mockCourseDto);
      expect(result.courseId).toBe('course-1');
    });
  });

  describe('addModule', () => {
    it('POST tới /concepts/courses/{courseId}/modules với dữ liệu module', async () => {
      mockedApi.post.mockResolvedValueOnce({ moduleId: 'module-1', message: 'Thêm module thành công' });

      const result = await courseApi.addModule('course-1', mockModuleDto);

      expect(mockedApi.post).toHaveBeenCalledWith('/concepts/courses/course-1/modules', mockModuleDto);
      expect(result.moduleId).toBe('module-1');
    });
  });

  describe('addModuleItem', () => {
    it('POST tới /concepts/modules/{moduleId}/items với item tương ứng', async () => {
      mockedApi.post.mockResolvedValueOnce({ message: 'Thêm item thành công' });

      const result = await courseApi.addModuleItem('module-1', mockItemDto);

      expect(mockedApi.post).toHaveBeenCalledWith('/concepts/modules/module-1/items', mockItemDto);
      expect(result.message).toBe('Thêm item thành công');
    });
  });

  describe('xử lý lỗi Backend', () => {
    it('lan truyền lỗi API (400) khi backend từ chối tạo khóa học', async () => {
      mockedApi.post.mockRejectedValueOnce({
        status: 400,
        title: 'Bad Request',
        detail: 'Tiêu đề không được để trống',
      });

      await expect(courseApi.createCourse(mockCourseDto)).rejects.toMatchObject({ status: 400 });
    });

    it('lan truyền lỗi mạng (NetworkError) khi backend không phản hồi', async () => {
      mockedApi.post.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(courseApi.addModule('course-1', mockModuleDto)).rejects.toThrow('Failed to fetch');
    });

    it('lan truyền lỗi khi GET danh sách khóa học thất bại', async () => {
      mockedApi.get.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(courseApi.getCourses()).rejects.toThrow('Failed to fetch');
    });
  });
});
