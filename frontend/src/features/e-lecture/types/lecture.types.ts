/**
 * lecture.types.ts — Type-safe interfaces cho phân hệ E-Lecture Mode.
 * Khớp 1:1 với JSON Schema kịch bản bài giảng điện tử và Backend C# DTOs.
 */

export type SlideCommand = 'RESET_CANVAS' | 'PLAY_UNTIL' | 'PAUSE';

export type SlideType = 'theory' | 'guided-animation' | 'interactive-check';

export interface SlideAction {
  command: SlideCommand;
  targetFrame: number;
}

export interface Slide {
  slideId: number;
  type: SlideType;
  content: string;
  action: SlideAction;
}

export interface LectureScript {
  lectureId: string;
  algorithmId: string;
  title: string;
  slides: Slide[];
}

export interface LectureErrorResponse {
  status: number;
  title: string;
  errorType: string;
  message: string;
}
