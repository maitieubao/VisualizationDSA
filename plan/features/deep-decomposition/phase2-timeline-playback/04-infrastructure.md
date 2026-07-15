# ⚙️ Infrastructure & Monaco Line Syncer Coordinator (Phase 2)

Tài liệu này đặc tả chi tiết giải pháp hạ tầng bộ xung nhịp đồng bộ Monaco Editor (`MonacoLineSyncerCoordinator`) và cơ chế quản lý thu hồi RAM an toàn chống rò rỉ khi gỡ lỗi.

---

## 1. Bộ Máy Đồng Bộ Monaco Editor (MonacoLineSyncerCoordinator)

Khi học sinh chạy giải thuật từng bước hoặc kéo miết thanh trượt Scrubber dòng thời gian, Monaco Editor cần nhảy con trỏ và tô sáng dòng code tương ứng thời gian thực cực kỳ nhanh nhạy. Chúng ta thiết lập hạ tầng điều phối sự kiện:

```typescript
export class MonacoLineSyncerCoordinator {
  private static activeDecorationIds: string[] = [];

  /**
   * Đồng bộ cuộn và tô sáng dòng code trong Monaco Editor cực nhanh dưới 10ms
   * @param editor Thực thể Monaco Editor
   * @param lineNumber Số dòng code cần nhảy đến
   */
  public static syncCodeLine(editor: any, lineNumber: number): void {
    if (!editor) return;

    // Cuộn dòng code về trung tâm màn hình mượt mà
    editor.revealLineInCenter(lineNumber, 0); // 0 = ScrollType.Smooth

    // Thiết lập lớp CSS để tô sáng viền vàng rực cho dòng code đang chạy
    const newDecorations = [
      {
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1
        },
        options: {
          isWholeLine: true,
          className: 'monaco-vcr-active-line-glow', // Tên lớp CSS phát sáng Cyan viền trái
          marginClassName: 'monaco-vcr-active-line-margin'
        }
      }
    ];

    // Cập nhật đè decoration cũ tránh rác chồng chéo
    this.activeDecorationIds = editor.deltaDecorations(
      this.activeDecorationIds,
      newDecorations
    );
  }

  /**
   * Giải phóng thu hồi tài nguyên trang trí dọn dẹp bộ nhớ RAM GC
   */
  public static clearDecorations(editor: any): void {
    if (editor && this.activeDecorationIds.length > 0) {
      editor.deltaDecorations(this.activeDecorationIds, []);
      this.activeDecorationIds = [];
    }
  }
}
```

---

## 2. Giải pháp tháo dỡ RAM & GC Memory Leak Prevent

*   **Chống rò rỉ bộ nhớ Decorations:**
    *   Hạ tầng trang trí dòng code `deltaDecorations` bắt buộc phải được dọn dẹp bằng phương thức `clearDecorations()` ngay khi học viên đóng phòng học trực quan giải thuật hoặc biên dịch code mới.
    *   *Mục đích:* Tránh lưu rác các ID mảng trang trí cũ gây nặng nề RAM trình duyệt.
