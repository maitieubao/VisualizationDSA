// ============================================================
// quiz module — Public API
// ============================================================

export { default as InteractiveLectureSlides } from './components/InteractiveLectureSlides.vue';
export { QuizEvaluationEngine, LecturePlaybackCoordinator } from './service/QuizEvaluationEngine';
export type { QuizQuestion, SlideEvent } from './service/QuizEvaluationEngine';
