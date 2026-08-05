export interface LessonReference {
  id: string;
  title: string;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Sorting' | 'Searching' | 'Tree/Graph' | 'OOP' | 'SOLID' | 'Design Patterns' | 'DI/IoC' | 'System Design';
  /** Backend dùng Beginner/Intermediate/Advanced; dữ liệu local cũ dùng Easy/Medium/Hard. */
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  /** Backend trả về dưới dạng coverImageUrl; UI ưu tiên field này rồi mới fallback coverImage */
  coverImageUrl?: string;
  coverImage?: string;
  isPremium: boolean;
  lessons: LessonReference[];
  totalLessons: number;
  isPublished: boolean;
}

export interface CourseProgress {
  courseId: string;
  completedLessonIds: string[];
  totalLessons: number;
  progressPercent: number;
  xpEarned: number;
  isCompleted: boolean;
}
