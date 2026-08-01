




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
