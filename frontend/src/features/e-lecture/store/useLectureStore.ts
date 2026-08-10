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

  // Chống race "stale continuation": khi skip PLAY_UNTIL, promise cũ resolve ở microtask sau
  // sẽ ghi đè trạng thái của slide mới. Generation token loại bỏ continuation cũ.
  let actionGeneration = 0;
  // Chống double-click/arrow repeat nhảy 2 slide.
  const isTransitioning = ref<boolean>(false);

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
    lockLectureInteraction('lecture');
    if (lectureData.slides.length > 0) executeSlideAction(lectureData.slides[0]);
  }

  async function nextSlide(): Promise<void> {
    if (!currentLecture.value || isLastSlide.value) return;
    // Cho phép skip (Bỏ qua) khi PLAY_UNTIL đang chạy: isTransitioning chỉ chặn khi
    // không phải đang chờ animation, tránh nhảy 2 slide do double-click.
    if (isTransitioning.value && !isWaitingForAnimation.value) return;
    if (isWaitingForAnimation.value) {
      animStore.cancelPlayUntil();
      isWaitingForAnimation.value = false;
      isMinimized.value = false;
    }
    isTransitioning.value = true;
    try {
      currentSlideIndex.value++;
      await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
    } finally {
      isTransitioning.value = false;
    }
  }

  async function prevSlide(): Promise<void> {
    if (!currentLecture.value || isFirstSlide.value) return;
    // Bất đối xứng với nextSlide: cho phép cancel autoplay để lùi slide.
    if (isTransitioning.value && !isWaitingForAnimation.value) return;
    if (isWaitingForAnimation.value) {
      animStore.cancelPlayUntil();
      isWaitingForAnimation.value = false;
      isMinimized.value = false;
    }
    isTransitioning.value = true;
    try {
      currentSlideIndex.value--;
      await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
    } finally {
      isTransitioning.value = false;
    }
  }

  async function goToSlide(index: number): Promise<void> {
    if (!currentLecture.value || isWaitingForAnimation.value || isTransitioning.value) return;
    if (index < 0 || index >= currentLecture.value.slides.length) return;
    isTransitioning.value = true;
    try {
      currentSlideIndex.value = index;
      await executeSlideAction(currentLecture.value.slides[index]);
    } finally {
      isTransitioning.value = false;
    }
  }

  async function executeSlideAction(slide: Slide): Promise<void> {
    const generation = ++actionGeneration;
    const { command, targetFrame } = slide.action;
    isMinimized.value = command === 'PLAY_UNTIL';
    if (command === 'RESET_CANVAS') {
      animStore.goToFrame(targetFrame);
      animStore.pause();
    } else if (command === 'PLAY_UNTIL') {
      isWaitingForAnimation.value = true;
      await animStore.playUntilFrame(targetFrame);
      // Continuation chỉ hợp lệ khi vẫn là action mới nhất (không bị skip/next ghi đè).
      if (generation === actionGeneration) {
        isWaitingForAnimation.value = false;
        isMinimized.value = false;
      }
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
    // Chỉ nhả lock của lecture — lock của quiz checkpoint (nếu đang mở) được GIỮ NGUYÊN
    // để không mở khóa canvas giữa câu hỏi (trước đây unlock vô điều kiện).
    unlockLectureInteraction('lecture');
  }

  // Chủ quyền lock: mỗi bên (lecture/quiz) giữ token riêng — thoát lecture không phá lock quiz.
  // Dùng `ref<string[]>` thay vì `ref<Set>`: Vue ref KHÔNG track mutation của Set (.add/.delete),
  // array thay bằng reassignment thì reactive 100%.
  const interactionLockOwners = ref<string[]>([]);

  function lockLectureInteraction(owner: string = 'lecture'): void {
    animStore.pause();
    if (!interactionLockOwners.value.includes(owner)) {
      interactionLockOwners.value.push(owner);
    }
    animStore.setInteractionLocked(interactionLockOwners.value.length > 0);
  }

  function unlockLectureInteraction(owner: string = 'lecture'): void {
    interactionLockOwners.value = interactionLockOwners.value.filter(o => o !== owner);
    animStore.setInteractionLocked(interactionLockOwners.value.length > 0);
  }

  /**
   * QZ-019: tiếp tục phát bài giảng từ vị trí hiện tại — gọi từ
   * quizStore.dismissQuestionAndContinue() sau khi câu hỏi checkpoint được trả lời.
   * - Nếu lecture đang chờ animation PLAY_UNTIL (cửa sổ hiếm sau khi lock đã pause),
   *   chạy lại playUntilFrame từ currentIndex để hoàn tất đoạn chờ — không kẹt lecture.
   * - Nếu không, phát tiếp bình thường từ frame hiện tại (tự động resume, khỏi bấm Play).
   */
  function resumeLecturePlayback(): void {
    if (!isActive.value || !currentLecture.value) return;
    if (isWaitingForAnimation.value) {
      const slide = activeSlide.value;
      if (slide && slide.action.command === 'PLAY_UNTIL') {
        isWaitingForAnimation.value = true;
        void animStore.playUntilFrame(slide.action.targetFrame).then(() => {
          if (isWaitingForAnimation.value) {
            isWaitingForAnimation.value = false;
            isMinimized.value = false;
          }
        });
        return;
      }
    }
    animStore.play();
  }

  return {
    isActive, currentLecture, currentSlideIndex, isWaitingForAnimation, isMinimized,
    activeSlide, isFirstSlide, isLastSlide, totalSlides, slideProgress,
    startLecture, nextSlide, prevSlide, goToSlide, exitLecture,
    lockLectureInteraction, unlockLectureInteraction, resumeLecturePlayback,
  };});
