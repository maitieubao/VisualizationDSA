# 🛠 Technical Specification - E-Lecture Mode (Phase 1)

Tài liệu này đặc tả kiến trúc điều khiển động dựa trên kịch bản dữ liệu (Script-driven Architecture) và giao diện kết nối giữa hai phân hệ điều phối bài giảng và phát hoạt họa Canvas.

---

## 1. Kiến trúc Hướng Kịch bản (Script-driven Architecture)

Để đảm bảo khả năng tùy biến giáo trình linh hoạt mà không cần lập trình viên frontend viết lại mã nguồn giao diện, cấu trúc bài giảng được quy hoạch thành mô hình dữ liệu JSON chuẩn mực.

### 1.1. Khai báo TypeScript Interfaces hệ thống
```typescript
export interface SlideAction {
  // Lệnh tương tác: RESET_CANVAS (đặt lại), PLAY_UNTIL (phát đến frame đích), PAUSE (tạm dừng)
  command: 'RESET_CANVAS' | 'PLAY_UNTIL' | 'PAUSE';
  
  // Frame đích của Animation Engine
  targetFrame: number;
}

export interface Slide {
  slideId: number;
  type: 'theory' | 'guided-animation' | 'interactive-check';
  
  // Nội dung thuyết minh hỗ trợ định dạng HTML/Markdown
  content: string;
  
  // Hành động điều phối hoạt họa đi kèm
  action: SlideAction;
}

export interface LectureScript {
  lectureId: string;
  algorithmId: string;
  title: string;
  slides: Slide[];
}
```

---

## 2. Phân hệ Kết nối Hai Động cơ (Core Engine Interoperability)

**Lecture Engine** hoạt động như một lớp điều khiển (Orchestration Layer) nằm đè lên trên **Animation Engine**. Việc phối hợp hành động được thực hiện qua luồng logic sau:

```
[useLectureStore] (Bấm Next Slide)
        |
        v Kiểm tra Slide Action: PLAY_UNTIL targetFrame 20
[isWaitingForAnimation = true] (Khóa nút bấm tương tác)
        |
        v Gọi lệnh của Animation Engine
[useAnimationStore.playUntilFrame(20)]
        |
        v Animation Engine chạy hoạt ảnh 60 FPS vẽ Canvas...
        v Khi currentFrameId >= 20 -> pause() -> Resolve Promise
[isWaitingForAnimation = false] (Mở khóa nút bấm Next)
```

Cơ chế này đảm bảo người dùng chỉ được chuyển slide sau khi hoạt ảnh minh họa tương ứng đã thực thi xong và dừng lại đúng điểm nút kiến thức, bảo toàn tuyệt đối trải nghiệm học sư phạm.
