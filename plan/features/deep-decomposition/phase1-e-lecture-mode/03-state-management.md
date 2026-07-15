# 🗄️ Pinia State Management - useLectureStore (Vue 3)

Tài liệu này đặc tả chi tiết mã nguồn bộ quản lý trạng thái **useLectureStore** viết bằng **TypeScript** điều hành vòng đời Slide, phân phối kịch bản và phối hợp đồng bộ liên Store với Animation Engine.

---

## 1. Cấu trúc Mã nguồn TypeScript Store (`useLectureStore.ts`)

Mã nguồn được thiết kế theo cú pháp **Vue 3 Setup Store** chuẩn mực, định nghĩa rõ ràng các kiểu dữ liệu và kiểm soát nghiêm ngặt trạng thái khóa tương tác trong tiến trình hoạt ảnh đệ quy.

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from './useAnimationStore';

// ==========================================
// ĐỊNH NGHĨA KIỂU DỮ LIỆU
// ==========================================

export interface SlideAction {
  command: 'RESET_CANVAS' | 'PLAY_UNTIL' | 'PAUSE';
  targetFrame: number;
}

export interface Slide {
  slideId: number;
  type: 'theory' | 'guided-animation' | 'interactive-check';
  content: string;
  action: SlideAction;
}

export interface Lecture {
  lectureId: string;
  algorithmId: string;
  title: string;
  slides: Slide[];
}

export const useLectureStore = defineStore('lecture', () => {
  const animStore = useAnimationStore();

  // ==========================================
  // 1. STATE (Trạng thái)
  // ==========================================
  const isActive = ref<boolean>(false);
  const currentLecture = ref<Lecture | null>(null);
  const currentSlideIndex = ref<number>(0);
  const isWaitingForAnimation = ref<boolean>(false);

  // ==========================================
  // 2. GETTERS (Trạng thái dẫn xuất)
  // ==========================================
  const activeSlide = computed<Slide | null>(() => {
    if (!currentLecture.value || currentSlideIndex.value >= currentLecture.value.slides.length) return null;
    return currentLecture.value.slides[currentSlideIndex.value];
  });

  const isFirstSlide = computed<boolean>(() => currentSlideIndex.value === 0);
  const isLastSlide = computed<boolean>(() => {
    if (!currentLecture.value) return true;
    return currentSlideIndex.value === currentLecture.value.slides.length - 1;
  });

  // ==========================================
  // 3. ACTIONS (Hành động điều hành)
  // ==========================================

  /**
   * Khởi chạy một bài giảng điện tử
   */
  function startLecture(lectureData: Lecture) {
    currentLecture.value = lectureData;
    currentSlideIndex.value = 0;
    isActive.value = true;
    
    // Khóa thanh trượt kéo thả tự do để giữ vững context sư phạm
    animStore.setInteractionLocked(true);
    
    // Thực thi ngay lệnh của Slide khởi đầu
    executeSlideAction(lectureData.slides[0]);
  }

  /**
   * Tiến sang Slide kế tiếp (Next Slide)
   */
  async function nextSlide() {
    if (!currentLecture.value || isLastSlide.value || isWaitingForAnimation.value) return;
    
    currentSlideIndex.value++;
    await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
  }

  /**
   * Quay lại Slide phía trước (Back Slide)
   */
  async function prevSlide() {
    if (!currentLecture.value || isFirstSlide.value || isWaitingForAnimation.value) return;
    
    currentSlideIndex.value--;
    await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
  }

  /**
   * Thực thi lệnh của slide hiện tại và đồng bộ hóa với Canvas
   */
  async function executeSlideAction(slide: Slide) {
    const { command, targetFrame } = slide.action;
    
    switch (command) {
      case 'RESET_CANVAS':
        animStore.goToFrame(targetFrame);
        animStore.pause();
        break;
        
      case 'PLAY_UNTIL':
        isWaitingForAnimation.value = true;
        // Gửi lệnh và đợi Animation Engine chạy tới điểm đích sư phạm
        await animStore.playUntilFrame(targetFrame);
        isWaitingForAnimation.value = false;
        break;
        
      case 'PAUSE':
        animStore.pause();
        break;
    }
  }

  /**
   * Thoát bài giảng, khôi phục lại quyền tương tác tự do
   */
  function exitLecture() {
    isActive.value = false;
    currentLecture.value = null;
    currentSlideIndex.value = 0;
    isWaitingForAnimation.value = false;
    
    // Mở khóa thanh kéo trượt timeline
    animStore.setInteractionLocked(false);
  }

  return {
    // States
    isActive,
    currentLecture,
    currentSlideIndex,
    isWaitingForAnimation,
    
    // Getters
    activeSlide,
    isFirstSlide,
    isLastSlide,
    
    // Actions
    startLecture,
    nextSlide,
    prevSlide,
    exitLecture
  };
});
```

---

## 2. Ưu việt của Thiết lập Async Flow trong Store

Bằng cách sử dụng **Async/Await** kết hợp với **Promises**:
*   **Tránh hiện tượng chạy chồng chéo (Race Conditions):** Người học không thể bấm chuyển tiếp slide khi hệ thống chưa đưa các cột đồ họa Canvas về đúng khung hình minh họa.
*   **Tải lượng bất đồng bộ mượt mà (Smooth UI UX):** Đảm bảo giao diện người dùng luôn phản hồi mịn màng mà không gây đơ hoặc giật khung hình hoạt họa 60 FPS vẽ Canvas.
