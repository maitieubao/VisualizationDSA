import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLectureStore = defineStore('lecture', () => {
  const currentLecture = ref<any>(null);
  const activeSlide = ref<any>(null);
  const currentSlideIndex = ref(0);
  const isFirstSlide = ref(true);
  const isLastSlide = ref(false);
  const isWaitingForAnimation = ref(false);
  const isActive = ref(false);
  const isMinimized = ref(false);
  const slideProgress = ref(0);

  function startLecture(lecture: any) {
    currentLecture.value = lecture;
  }
  function exitLecture() {}
  function nextSlide() {}
  function prevSlide() {}
  function goToSlide(index: number) {}

  return {
    currentLecture,
    activeSlide,
    currentSlideIndex,
    isFirstSlide,
    isLastSlide,
    isWaitingForAnimation,
    isActive,
    isMinimized,
    slideProgress,
    startLecture,
    exitLecture,
    nextSlide,
    prevSlide,
    goToSlide,
  };
});
