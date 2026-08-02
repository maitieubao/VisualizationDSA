export { default as LectureOverlay } from './components/LectureOverlay.vue';
export { useLectureStore } from './store/useLectureStore';
export { loadLecture, hasLecture, getAvailableLectureIds } from './services/lectureLoader';
export type {
  LectureScript,
  Slide,
  SlideAction,
  SlideCommand,
  SlideType,
} from './types/lecture.types';
