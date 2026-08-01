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
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  coverImage?: string;
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
