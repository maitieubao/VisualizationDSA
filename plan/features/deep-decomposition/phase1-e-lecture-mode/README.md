# 🎓 CHẾ ĐỘ BÀI GIẢNG ĐIỆN TỬ (E-LECTURE MODE)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **E-Lecture Mode** - phân hệ biến đổi **VisualizationDSA** từ một "công cụ trực quan hóa đơn thuần" trở thành một **nền tảng EdTech giáo dục dẫn dắt chuẩn sư phạm**. Tài liệu này đặc tả chi tiết từ mục tiêu giảm thiểu tải lượng nhận thức (Cognitive Load Theory), kiến trúc dẫn dắt kịch bản bằng cấu trúc dữ liệu JSON (Script-driven Architecture), cách phối hợp đồng bộ giữa `LectureStore` và `AnimationStore`, đến thiết kế giao diện thẻ Overlay thông minh tự động thu phóng và làm mờ nền Canvas.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Mục tiêu Nghiệp vụ & Triết lý Giảm tải Nhận thức (PRD)](#1-mục-tiêu-nghiệp-vụ--triết-lý-giảm-tải-nhận-thức-prd)
2. [Kiến trúc Dẫn dắt Kịch bản qua JSON (TECHNICAL SPEC)](#2-kiến-trúc-dẫn-dắt-kịch-bản-qua-json-technical-spec)
3. [Hiện thực hóa Logic Điều phối Liên dịch vụ (Core Logic Interoperability)](#3-hiện-thực-hóa-logic-điều-phối-liên-dịch-vụ-core-logic-interoperability)
4. [Đặc tả Giao diện Overlay & Hiệu ứng Chuyển cảnh (UI/UX Overlay Design)](#4-đặc-tả-giao-dẫn-overlay--hiệu-ứng-chuyển-cảnh-uiux-overlay-design)
5. [Quản lý Trạng thái & Đồng bộ Hoạt ảnh (Frontend Pinia Store)](#5-quản-lý-trạng-thái--đồng-bộ-hoạt-ảnh-frontend-pinia-store)
6. [Đặc tả API Giao tiếp & Hợp đồng Dữ liệu (API Reference)](#6-đặc-tả-api-giao-tiếp--hợp-đồng-dữ-liệu-api-reference)
7. [Quyết định Kiến trúc & Khả năng Mở rộng Quy mô (ADR)](#7-quyết-định-kiến-trúc--khả-năng-mở-rộng-quy-mô-adr)
8. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#8-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. MỤC TIÊU NGHIỆP VỤ & TRIẾT LÝ GIẢM TẢI NHẬN THỨC (PRD)

### 1.1. Triết lý Sư phạm: Giảm tải Nhận thức (Cognitive Load Theory)
Khi sinh viên mới tiếp cận một thuật toán phức tạp như Quick Sort hay Cây BST, việc quăng họ trực tiếp vào một màn hình tương tác tự do (Exploration Mode) chứa đầy các nút điều khiển, thanh trượt tốc độ và mã nguồn nhấp nháy sẽ tạo ra **sự quá tải nhận thức cực độ (Cognitive Overload)**. 

**E-Lecture Mode** ra đời nhằm giải quyết vấn đề này bằng phương pháp **Dẫn dắt có Kịch bản (Scripted Guidance)**. Thay vì để người dùng tự bơi, hệ thống sẽ chia nhỏ bài học thành một chuỗi các slide giáo án ngắn gọn:
*   Mỗi slide giới thiệu một khái niệm cốt lõi bằng lý thuyết súc tích.
*   Kích hoạt chạy hoạt ảnh Canvas minh họa cụ thể cho khái niệm đó rồi **tự động dừng lại đúng điểm dừng sư phạm**.
*   Bắt buộc người dùng tương tác hoặc nhấn nút "Tiếp tục" để mở slide tiếp theo, giúp kiến thức được hấp thụ tuần tự, sâu sắc.

### 1.2. Các Loại Slide được Hỗ trợ trong Phase 1
*   **Slide Lý thuyết (Theory Slide):** Hiển thị văn bản định dạng phong phú (Rich Text/Markdown), hình ảnh tĩnh hoặc công thức toán học LaTeX, không chạy hoạt ảnh hoặc đặt Canvas ở trạng thái tĩnh.
*   **Slide Hoạt họa Dẫn dắt (Guided Animation Slide):** Chứa văn bản giải thích và tự động ra lệnh cho Canvas chạy từ Frame hiện tại đến một Frame đích được chỉ định trước (lệnh `PLAY_UNTIL`), sau đó dừng lại và hiển thị thông tin đúc kết.
*   **Slide Thực hành Nhẹ (Interactive Quiz/Step Slide):** Yêu cầu sinh viên thực hiện một thao tác nhỏ trên Canvas (ví dụ: "Nhấp vào phần tử chốt Pivot hiện tại") trước khi cho phép tiến sang Slide tiếp theo.

---

## 2. KIẾN TRÚC DẪN DẮT KỊCH BẢN QUA JSON (TECHNICAL SPEC)

Kiến trúc lõi của phân hệ dựa hoàn toàn trên **Mô hình Dẫn dắt bằng Kịch bản (Script-driven Architecture)**. Toàn bộ nội dung và các lệnh tương tác hoạt ảnh của bài giảng được đóng gói dưới dạng cấu trúc dữ liệu JSON linh hoạt, cho phép chỉnh sửa giáo trình dễ dàng mà không cần lập trình lại.

### Sơ đồ Kiến trúc Điều khiển
```
+-----------------------------------------------------------+
|                      LECTURE ENGINE                       | (Tầng Điều phối)
|                  (useLectureStore Pinia)                  |
+-----------------------------------------------------------+
       |                                             ^
       | 1. Đọc lệnh Slide                           | 3. Phát sự kiện
       | (Ví dụ: PLAY_UNTIL Frame 15)                |    đạt điểm dừng
       v                                             |
+-----------------------------------------------------------+
|                     ANIMATION ENGINE                      | (Tầng Chạy Hoạt Họa)
|                 (useAnimationStore Pinia)                 |
+-----------------------------------------------------------+
       |                                             |
       | 2. Vẽ từng khung hình                       | 4. Cập nhật dữ liệu
       v                                             v
+-----------------------------+               +-------------+
|     HTML5 Canvas Layer      |               | Code Panel  |
+-----------------------------+               +-------------+
```

### 2.1. Cấu trúc Dữ liệu JSON Kịch bản (`LectureScript.json`)
```json
{
  "lectureId": "quick-sort-pivot-101",
  "algorithmId": "quick-sort",
  "title": "Hiểu sâu về khái niệm phần tử chốt (Pivot)",
  "slides": [
    {
      "slideId": 1,
      "type": "theory",
      "content": "<h3>Khái niệm Chốt (Pivot) là gì?</h3><p>Trong Quick Sort, <b>Pivot</b> đóng vai trò là ranh giới phân tách mảng thành hai nửa: nửa nhỏ hơn chốt nằm bên trái và nửa lớn hơn chốt nằm bên phải.</p>",
      "action": {
        "command": "RESET_CANVAS",
        "targetFrame": 0
      }
    },
    {
      "slideId": 2,
      "type": "guided-animation",
      "content": "<p>Hãy xem cách giải thuật lựa chọn phần tử cuối cùng làm chốt Pivot (tô màu tím) và trượt hai con trỏ quét để phân loại phần tử.</p>",
      "action": {
        "command": "PLAY_UNTIL",
        "targetFrame": 12
      }
    },
    {
      "slideId": 3,
      "type": "interactive-check",
      "content": "<p>Tuyệt vời! Giải thuật đã tạm dừng lại ở bước Pivot về đúng vị trí sắp xếp. Bạn có nhận xét gì về các phần tử nằm bên trái và bên phải Pivot lúc này?</p>",
      "action": {
        "command": "PAUSE",
        "targetFrame": 12
      }
    }
  ]
}
```

---

## 3. HIỆN THỰC HÓA LOGIC ĐIỀU PHỐI LIÊN DỊCH VỤ (CORE LOGIC)

Sự kết nối chặt chẽ giữa `useLectureStore` (điều phối slide) và `useAnimationStore` (điều khiển phát lại hoạt ảnh) được thực hiện qua các Promise và các Callback Hook theo dõi dòng thời gian.

### 3.1. Phân tích Luồng thực thi Lệnh `PLAY_UNTIL`
1.  **Bước 1:** Khi người dùng chuyển sang Slide 2, `useLectureStore` phát hiện thuộc tính hành động có lệnh `PLAY_UNTIL` nhắm tới `targetFrame = 12`.
2.  **Bước 2:** Store thiết lập trạng thái khóa tương tác `isWaitingForAnimation = true`, vô hiệu hóa nút "Tiếp tục" (Next) để tránh người dùng nhấn quá tốc độ. Đồng thời gửi tín hiệu yêu cầu `useAnimationStore` chạy hoạt ảnh.
3.  **Bước 3:** Tại vòng lặp thời gian thực (`tick()`) của `useAnimationStore`, sau mỗi khung hình được vẽ, công cụ kiểm tra điều kiện:
    $$\text{currentFrameId} \ge \text{targetFrameId}$$
4.  **Bước 4:** Khi điều kiện thỏa mãn, `useAnimationStore` gọi hàm `pause()`, trả về kết quả hoàn thành (Resolve Promise). `useLectureStore` bắt được sự kiện này, đặt `isWaitingForAnimation = false` và kích hoạt lại nút "Tiếp tục" cho sinh viên chuyển Slide.

---

## 4. ĐẶC TẢ GIAO DIỆN OVERLAY & HIỆU ỨNG CHUYỂN CẢNH (UI/UX OVERLAY DESIGN)

### 4.1. Thiết kế Trình diễn Thông minh (Visual Presence)
*   **Thẻ Bài giảng (Lecture Modal/Panel):** Hiển thị dạng một tấm kính mờ (Glassmorphism CSS) bo tròn tinh tế nổi đè lên trên giao diện chính (Overlay Backdrop Dimming). Nền đằng sau (gồm Canvas và Code Panel) sẽ hơi tối đi 40% để kéo trọn vẹn sự chú ý của sinh viên vào nội dung bài giảng.
*   **Hiệu ứng Thu nhỏ Tập trung (Active Play Focus):** 
    *   *Thách thức UX:* Khi hoạt ảnh Canvas đang chạy theo lệnh `PLAY_UNTIL`, nếu thẻ bài giảng vẫn chiếm diện tích lớn trên màn hình sẽ che khuất tầm nhìn chuyển động cột.
    *   *Giải pháp thiết kế:* Ngay khi nhấn chạy, thẻ E-Lecture sẽ tự động thu nhỏ về một góc phải màn hình hoặc chuyển sang chế độ trong suốt 80% (Opacity 0.2), làm nổi rõ trở lại vùng vẽ Canvas để người học quan sát trực quan sự chuyển dịch. Khi hoạt ảnh dừng, thẻ tự động phóng to lại kích thước mặc định cùng lời thuyết minh mới.

---

## 5. QUẢN LÝ TRẠNG THÁI & ĐỒNG BỘ HOẠT ẢNH (FRONTEND PINIA STORE)

Mã nguồn Pinia Store được viết bằng ngôn ngữ **TypeScript** điều hành trạng thái slide và khóa hành động tương tác timeline để tránh phá vỡ ngữ cảnh bài giảng.

```typescript
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAnimationStore } from './useAnimationStore';

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

  // --- STATE ---
  const isActive = ref<boolean>(false);
  const currentLecture = ref<Lecture | null>(null);
  const currentSlideIndex = ref<number>(0);
  const isWaitingForAnimation = ref<boolean>(false);

  // --- GETTERS ---
  const activeSlide = computed<Slide | null>(() => {
    if (!currentLecture.value || currentSlideIndex.value >= currentLecture.value.slides.length) return null;
    return currentLecture.value.slides[currentSlideIndex.value];
  });

  const isFirstSlide = computed<boolean>(() => currentSlideIndex.value === 0);
  const isLastSlide = computed<boolean>(() => {
    if (!currentLecture.value) return true;
    return currentSlideIndex.value === currentLecture.value.slides.length - 1;
  });

  // --- ACTIONS ---
  
  /**
   * Kích hoạt bài giảng điện tử và tải dữ liệu kịch bản
   */
  function startLecture(lectureData: Lecture) {
    currentLecture.value = lectureData;
    currentSlideIndex.value = 0;
    isActive.value = true;
    
    // Khóa các công cụ kéo thả timeline tự do để đảm bảo ngữ cảnh học tập
    animStore.setInteractionLocked(true);
    
    // Thực thi lệnh của slide đầu tiên
    executeSlideAction(lectureData.slides[0]);
  }

  /**
   * Chuyển tiếp sang Slide kế tiếp
   */
  async function nextSlide() {
    if (!currentLecture.value || isLastSlide.value || isWaitingForAnimation.value) return;
    
    currentSlideIndex.value++;
    await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
  }

  /**
   * Quay lại Slide phía trước
   */
  async function prevSlide() {
    if (!currentLecture.value || isFirstSlide.value || isWaitingForAnimation.value) return;
    
    currentSlideIndex.value--;
    await executeSlideAction(currentLecture.value.slides[currentSlideIndex.value]);
  }

  /**
   * Thực thi lệnh tương tác hoạt ảnh tương ứng của Slide
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
        // Ra lệnh chạy hoạt ảnh và đợi tín hiệu hoàn thành từ Animation Engine
        await animStore.playUntilFrame(targetFrame);
        isWaitingForAnimation.value = false;
        break;
        
      case 'PAUSE':
        animStore.pause();
        break;
    }
  }

  /**
   * Thoát chế độ bài giảng điện tử, mở khóa tương tác tự do
   */
  function exitLecture() {
    isActive.value = false;
    currentLecture.value = null;
    currentSlideIndex.value = 0;
    
    // Mở khóa thanh kéo trượt timeline cho người dùng tự do khám phá
    animStore.setInteractionLocked(false);
  }

  return {
    isActive,
    currentLecture,
    currentSlideIndex,
    isWaitingForAnimation,
    activeSlide,
    isFirstSlide,
    isLastSlide,
    
    startLecture,
    nextSlide,
    prevSlide,
    exitLecture
  };
});
```

---

## 6. ĐẶC TẢ API GIAO TIẾP & HỢP ĐỒNG DỮ LIỆU (API REFERENCE)

### 6.1. Endpoint: Lấy kịch bản bài giảng điện tử của một giải thuật
*   **URL:** `/api/v1/lectures/{algorithmId}`
*   **Method:** `GET`
*   **Response Payload JSON (HTTP 200 OK):**
```json
{
  "lectureId": "qs-pivot-intro",
  "algorithmId": "quick-sort",
  "title": "Khám phá Cơ chế chọn Chốt của Quick Sort",
  "slides": [
    {
      "slideId": 1,
      "type": "theory",
      "content": "<h3>Quick Sort & Điểm Chốt</h3><p>Mảng ban đầu chưa sắp xếp...</p>",
      "action": {
        "command": "RESET_CANVAS",
        "targetFrame": 0
      }
    },
    {
      "slideId": 2,
      "type": "guided-animation",
      "content": "<p>Hệ thống tự động chạy thuật toán đến khi Pivot đứng vững ở vị trí cuối cùng...</p>",
      "action": {
        "command": "PLAY_UNTIL",
        "targetFrame": 28
      }
    }
  ]
}
```

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & KHẢ NĂNG MỞ RỘNG QUY MÔ (ADR)

### ADR-04: Kiến trúc Dẫn dắt Kịch bản bằng Dữ liệu (Script-driven Architecture)

*   **Bối cảnh:** Nếu mã nguồn bài giảng điện tử được viết cứng (Hardcoded) tại Frontend Vue 3 (ví dụ: `if (slideId === 2) playUntil(15)`), mỗi lần đội ngũ thiết kế bài giảng (Instructional Designers) muốn thay đổi nội dung chữ, bổ sung sơ đồ tĩnh hay đổi vị trí dừng hoạt ảnh, lập trình viên frontend buộc phải thay đổi code và phát hành lại (re-deploy) ứng dụng.
*   **Quyết định:** Chuyển dịch toàn bộ cấu trúc bài giảng thành **Kịch bản động dạng cấu trúc dữ liệu JSON**. 
    *   Tách rời dữ liệu sư phạm khỏi mã nguồn hiển thị.
    *   Giáo án được lấy động qua API Backend hoặc nạp từ file cấu hình tĩnh độc lập.
*   **Kết quả:** Đội thiết kế giáo án có thể tự sửa đổi nội dung slide và đổi khung hình hoạt ảnh dừng sư phạm bằng cách biên tập file JSON, giúp tăng tốc quy trình hoàn thiện bài giảng gấp 10 lần mà hoàn toàn không đụng vào mã nguồn hệ thống.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình triển khai 3 giai đoạn cụ thể
1.  **Giai đoạn 1: Thiết kế JSON Schema & Mockup (Ngày 1-2):** Định nghĩa cấu trúc hợp đồng dữ liệu JSON kịch bản, viết dữ liệu mockup bài giảng Quick Sort và Bubble Sort để phát triển Frontend độc lập.
2.  **Giai đoạn 2: Xây dựng Giao diện Lecture Overlay (Ngày 3-4):** Hoàn thành Component thẻ bài giảng dạng kính mờ (Glassmorphism), nút Back/Next, chấm tròn phân trang và hiệu ứng tự động thu nhỏ mờ đục khi bắt đầu lệnh phát Canvas.
3.  **Giai đoạn 3: Tích hợp Đồng bộ Hai động cơ (Ngày 5-6):** Hiện thực hóa `useLectureStore` TypeScript, cài đặt hàm Callback lắng nghe mốc thời gian hoạt ảnh từ `useAnimationStore` để dừng chính xác tại khung hình đích.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Khi kịch bản phát lệnh `PLAY_UNTIL`, giao diện bài giảng phải tự động mờ đi hoặc thu nhỏ sang một góc để nhường tiêu điểm tập trung trực quan vào Canvas đang chuyển động.
*   Nút chuyển Slide tiếp theo (Next) bắt buộc phải bị vô hiệu hóa (disabled) trong suốt thời gian hoạt ảnh Canvas đang trượt tới điểm đích.
*   Bấm nút thoát `Exit E-Lecture` lập tức tắt bài giảng, phục hồi độ sáng nền và mở khóa hoàn toàn thanh timeline cho học viên tự do kéo thả.
