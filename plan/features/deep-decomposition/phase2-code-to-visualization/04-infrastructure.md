# ⚙️ Infrastructure & Web Worker Lifecycle Manager (Phase 2)

Tài liệu này đặc tả chi tiết các giải pháp kỹ thuật hạ tầng điều phối vòng đời của Web Worker Sandbox, dọn dẹp bộ nhớ chống rò rỉ (Memory Leak Prevention) và lưu trữ bộ đệm AST (AST Parser Caching).

---

## 1. Dịch vụ Điều phối Vòng đời Web Worker (Worker Lifecycle Coordinator)

Để ngăn ngừa rò rỉ tài nguyên bộ nhớ hệ thống (Memory leaks) do sinh viên nhấn nút Run biên dịch liên tục, chúng ta xây dựng lớp dịch vụ điều hành vòng đời Web Worker:

```typescript
export class WorkerLifecycleCoordinator {
  private static activeWorker: Worker | null = null;
  private static timeoutId: any = null;

  /**
   * Khởi chạy an toàn Web Worker và bảo đảm dọn dẹp hoàn toàn tài nguyên cũ
   */
  public static executeInSandbox(
    workerCode: string,
    payload: any,
    timeoutMs: number = 1500
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // 1. Tự động chấm dứt luồng Worker cũ đang chạy dở trước khi chạy phiên mới
      this.terminateActiveSession();

      // 2. Tạo Blob URL từ chuỗi mã nguồn Worker
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const objectUrl = URL.createObjectURL(blob);
      
      this.activeWorker = new Worker(objectUrl);

      // 3. Thiết lập bộ ngắt thời gian Timeout Guard
      this.timeoutId = setTimeout(() => {
        this.terminateActiveSession();
        URL.revokeObjectURL(objectUrl); // Giải phóng Blob URL khỏi bộ nhớ trình duyệt
        reject(new Error('Thực thi quá tải thời gian! Phát hiện lỗi lặp vô hạn (Infinite Loop).'));
      }, timeoutMs);

      // 4. Lắng nghe phản hồi từ Worker
      this.activeWorker.onmessage = (e) => {
        this.clearTimeoutAndRevoke(objectUrl);
        const { success, frames, error } = e.data;
        
        if (success) {
          resolve(frames);
        } else {
          reject(new Error(error));
        }
      };

      this.activeWorker.onerror = (err) => {
        this.clearTimeoutAndRevoke(objectUrl);
        reject(new Error(`Lỗi luồng Worker: ${err.message}`));
      };

      // Gửi gói dữ liệu bắt đầu chạy
      this.activeWorker.postMessage(payload);
    });
  }

  /**
   * Chấm dứt triệt để luồng Worker đang chạy nền và làm sạch Timer
   */
  public static terminateActiveSession(): void {
    if (this.activeWorker) {
      this.activeWorker.terminate();
      this.activeWorker = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private static clearTimeoutAndRevoke(objectUrl: string): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    URL.revokeObjectURL(objectUrl);
  }
}
```

---

## 2. Giải pháp Phòng ngừa Rò rỉ Bộ nhớ (Memory Leak Prevention)

Khi chạy mã nguồn tùy biến liên tục trong Web Worker, các đối tượng dung lượng lớn như mảng kết quả `frames` và đối tượng `Blob URLs` được sinh ra hàng loạt:
*   **Giải phóng Blob URL:** Hệ thống luôn gọi `URL.revokeObjectURL(objectUrl)` ngay sau khi Worker kết thúc hoặc bị hủy để giải phóng vùng nhớ chứa script Blob của trình duyệt.
*   **Hủy tham chiếu chéo:** Đặt `activeWorker = null` để bộ thu gom rác trình duyệt (Garbage Collector) nhận diện và giải phóng hoàn toàn thực thể Worker cùng các biến chạy của nó khỏi RAM.
*   **Giới hạn số bước hoạt ảnh:** Hệ thống quy định mảng hoạt ảnh động tự sinh ra không vượt quá 2000 frames. Nếu vượt quá, Web Worker chủ động dừng sớm và trả về cảnh báo lỗi dung lượng.
