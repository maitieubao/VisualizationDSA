import type { LectureScript } from '../types/lecture.types';

import bubbleSortIntro from '../assets/lectures/bubble-sort-intro.json';

const BUNDLED_LECTURES: Record<string, LectureScript> = {
  'bubble-sort': bubbleSortIntro as LectureScript,
};

const API_BASE = '/api/v1/lectures';





export async function loadLecture(algorithmId: string): Promise<LectureScript | null> {
  const bundled = BUNDLED_LECTURES[algorithmId];
  if (bundled) return bundled;

  try {
    const response = await fetch(`${API_BASE}/${algorithmId}`);
    if (!response.ok) return null;
    const data: LectureScript = await response.json();
    return data;
  } catch {
    return null;
  }
}




export function hasLecture(algorithmId: string): boolean {
  return algorithmId in BUNDLED_LECTURES;
}




export function getAvailableLectureIds(): string[] {
  return Object.keys(BUNDLED_LECTURES);
}
