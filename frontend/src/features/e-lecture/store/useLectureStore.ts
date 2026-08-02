import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from '../../animation-engine/store/useAnimationStore';
import type { LectureScript, Slide } from '../types/lecture.types';

export const useLectureStore = defineStore('lecture', () => {
  const animStore = useAnimationStore();

  const isActive = ref<boolean>(false);
  const currentLecture = ref<LectureScript | null>(null);
  const currentSlideIndex = ref<number>(0);
  const isWaitingForAnimation = ref<boolean>(false);
  const isMinimized = ref<boolean>(false);

  const activeSlide = computed<Slide | null>(() => {
    if (!currentLecture.value || currentSlideIndex.value >= currentLecture.value.slides.length) return null;
    return currentLecture.value.slides[currentSlideIndex.value];
  });

  const isFirstSlide = computed<boolean>(() => currentSlideIndex.value === 0);
  const isLastSlide = computed<boolean>(() => !currentLecture.value || currentSlideIndex.value === currentLecture.value.slides.length - 1);
  const totalSlides = computed<number>(() => currentLecture.value?.slides.length ?? 0);
  const slideProgress = computed<string>(() => `${currentSlideIndex.value + 1} / ${currentLecture.value?.slides.length ?? 0}`);

  function startLecture(lectureData: LectureScript): void {
    currentLecture.value = lectureData;
    currentSlideIndex.value = 0;
    isActive.value = true;
    isMinimized.value = false;
    animStore.setInteractionLocked(true);
    if (lectureData.slides.length > 0) executeSlideAction(lectureData.slides[0]);
  }

  async function nextSlide(): Promise<void> {
    if (!currentLecture.value || isLastSlide.value) return;
    if (isWaitingForAnimation.value) {
      animStore.cancelPlayUntil();
      isWaitingForAnimation.value = false;
      isMinimized.value = false;
    }
    currentSlideIndex.value++;
    await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
  }

  async function prevSlide(): Promise<void> {
    if (!currentLecture.value || isFirstSlide.value || isWaitingForAnimation.value) return;
    currentSlideIndex.value--;
    await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
  }

  async function goToSlide(index: number): Promise<void> {
    if (!currentLecture.value || isWaitingForAnimation.value) return;
    if (index < 0 || index >= currentLecture.value.slides.length) return;
    currentSlideIndex.value = index;
    await executeSlideAction(currentLecture.value.slides[index]);
  }

  async function executeSlideAction(slide: Slide): Promise<void> {
    const { command, targetFrame } = slide.action;
    isMinimized.value = command === 'PLAY_UNTIL';
    if (command === 'RESET_CANVAS') {
      animStore.goToFrame(targetFrame);
      animStore.pause();
    } else if (command === 'PLAY_UNTIL') {
      isWaitingForAnimation.value = true;
      await animStore.playUntilFrame(targetFrame);
      isWaitingForAnimation.value = false;
      isMinimized.value = false;
    } else if (command === 'PAUSE') {
      animStore.pause();
    }
  }

  function exitLecture(): void {
    if (isWaitingForAnimation.value) animStore.cancelPlayUntil();
    isActive.value = false;
    currentLecture.value = null;
    currentSlideIndex.value = 0;
    isWaitingForAnimation.value = false;
    isMinimized.value = false;
    animStore.setInteractionLocked(false);
  }

  return {
    isActive, currentLecture, currentSlideIndex, isWaitingForAnimation, isMinimized,
    activeSlide, isFirstSlide, isLastSlide, totalSlides, slideProgress,
    startLecture, nextSlide, prevSlide, goToSlide, exitLecture,
    lockLectureInteraction: () => { animStore.pause(); animStore.setInteractionLocked(true); },
    unlockLectureInteraction: () => animStore.setInteractionLocked(false),
  };
});
