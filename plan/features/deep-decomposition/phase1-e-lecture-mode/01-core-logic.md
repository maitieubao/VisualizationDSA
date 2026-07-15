# 🧠 Core Logic Specification & Interoperability (E-Lecture Mode)

Tài liệu này đặc tả chi tiết logic điều phối liên dịch vụ giữa **Lecture Engine** và **Animation Engine**, đồng thời cung cấp mã nguồn hiện thực hóa cả ở Backend (C# Models) và Frontend (TypeScript Orchestration).

---

## 1. Thiết kế Mô hình Dữ liệu C# ở Backend (Lecture Models)

Để phục vụ quá trình lưu trữ kịch bản bài giảng trong cơ sở dữ liệu và tuần tự hóa sang JSON truyền tải qua API, chúng ta xây dựng cấu trúc lớp đối tượng chuẩn mực ở Backend .NET Core:

```csharp
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace VisualizationDSA.Core.Models
{
    public class Lecture
    {
        [Required]
        public string LectureId { get; set; }

        [Required]
        public string AlgorithmId { get; set; }

        [Required]
        [StringLength(150)]
        public string Title { get; set; }

        public List<Slide> Slides { get; set; } = new List<Slide>();
    }

    public class Slide
    {
        [Required]
        public int SlideId { get; set; }

        [Required]
        // Kiểu slide: "theory", "guided-animation", "interactive-check"
        public string Type { get; set; }

        [Required]
        // Nội dung văn bản mô tả sư phạm, hỗ trợ Markdown/HTML
        public string Content { get; set; }

        [Required]
        public SlideAction Action { get; set; }
    }

    public class SlideAction
    {
        [Required]
        // Lệnh: "RESET_CANVAS", "PLAY_UNTIL", "PAUSE"
        public string Command { get; set; }

        [Required]
        // Vị trí Frame đích trong danh sách FrameDTO hoạt họa
        public int TargetFrame { get; set; }
    }
}
```

---

## 2. Logic Đồng bộ Tương tác liên Store ở Frontend (TypeScript)

Sự phức tạp nhất nằm ở cơ chế lắng nghe hoạt ảnh đang phát để dừng đúng điểm kịch bản của lệnh `PLAY_UNTIL`. Chúng ta xây dựng bộ phân phối lệnh không chặn (non-blocking async resolver) ở frontend:

```typescript
import { useAnimationStore } from '@/stores/useAnimationStore';
import { useLectureStore } from '@/stores/useLectureStore';

/**
 * Lớp điều phối kịch bản bài giảng kết nối trực tiếp vào Animation Engine.
 */
public class LectureOrchestrator {
  private animStore = useAnimationStore();
  private lectureStore = useLectureStore();

  /**
   * Phân giải lệnh hành động của Slide và thực thi đồng bộ với Canvas
   */
  public async resolveSlideAction(slide: Slide): Promise<void> {
    const { command, targetFrame } = slide.action;

    switch (command) {
      case 'RESET_CANVAS':
        // Đặt lại Canvas về vị trí ban đầu
        this.animStore.goToFrame(targetFrame);
        this.animStore.pause();
        break;

      case 'PLAY_UNTIL':
        // Đánh dấu luồng đang đợi hoạt ảnh để khóa giao diện
        this.lectureStore.setWaitingForAnimation(true);

        // Phát hoạt ảnh và lắng nghe đến khi đạt mốc đích
        await this.playAnimationUntilFrame(targetFrame);

        // Mở khóa giao diện sau khi đạt mốc sư phạm
        this.lectureStore.setWaitingForAnimation(false);
        break;

      case 'PAUSE':
        this.animStore.pause();
        break;
        
      default:
        console.warn(`Lệnh không hợp lệ hoặc không được hỗ trợ trong Phase 1: ${command}`);
        break;
    }
  }

  /**
   * Phương thức Promise-based chạy hoạt ảnh và tự động ngắt khi đạt mốc khung hình
   */
  private playAnimationUntilFrame(targetFrameId: number): Promise<void> {
    return new Promise<void>((resolve) => {
      // 1. Đặt tốc độ hoạt ảnh vừa phải cho sư phạm (ví dụ: 1 frame/giây)
      this.animStore.setPlaybackSpeed(1.0);
      
      // 2. Kích hoạt động cơ phát hoạt ảnh
      this.animStore.play();

      // 3. Thiết lập vòng lặp giám sát trong quá trình phát khung hình
      const checkThresholdInterval = setInterval(() => {
        const currentFrame = this.animStore.currentFrameIndex;

        // Nếu chỉ số khung hình hiện tại vượt quá hoặc bằng mốc đích sư phạm
        if (currentFrame >= targetFrameId) {
          // Ngắt vòng lặp giám sát
          clearInterval(checkThresholdInterval);
          
          // Dừng động cơ phát hoạt ảnh
          this.animStore.pause();
          
          // Trả về tín hiệu hoàn thành
          resolve();
        }
      }, 50); // Giám sát định kỳ mỗi 50ms (độ trễ siêu thấp)
    });
  }
}
```

Cơ chế này sử dụng vòng lặp giám sát siêu mịn đảm bảo độ chính xác tuyệt đối mà không gây nghẽn luồng xử lý đồ họa (UI Freeze) của trình duyệt.
