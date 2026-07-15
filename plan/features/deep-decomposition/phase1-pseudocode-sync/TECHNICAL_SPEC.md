# 🛠 Technical Specification - Pseudocode Sync & Watch Panel (Phase 1)

Tài liệu này đặc tả chi tiết kiến trúc kịch bản dòng mã đa ngôn ngữ, cơ chế ánh xạ qua mã logic toàn cục và giải pháp phân giải tương tác ngược từ dòng code sang khung hình Canvas.

---

## 1. Hợp đồng Dữ liệu Cấu trúc Mã nguồn (TypeScript Interfaces)

Để đảm bảo khả năng mở rộng thêm ngôn ngữ mới (như Go, Rust) ở các phase tiếp theo, chúng ta quy hoạch cấu trúc kịch bản mã nguồn thành bộ Interfaces chuẩn mực:

```typescript
export interface CodeLine {
  // Số dòng hiển thị vật lý (ví dụ: 1, 2, 3...)
  lineNumber: number;
  
  // Nội dung mã nguồn hiển thị
  text: string;
  
  // Định danh dòng logic toàn cục (ví dụ: "COMPARE_STEP", "SWAP_STEP")
  // Dùng để đồng bộ highlight chéo ngôn ngữ lập trình
  logicalId: string;
}

export interface LanguageCode {
  language: 'cpp' | 'java' | 'python' | 'javascript';
  lines: CodeLine[];
}

export interface VariableState {
  name: string;
  value: string | number;
  type: 'index' | 'pointer' | 'temporary';
}
```

---

## 2. Cơ chế Đồng bộ Liên Store (Inter-Store Sync Mechanics)

Sự tương tác hai chiều giữa động cơ Canvas và Bảng mã nguồn được phối hợp chặt chẽ qua luồng Pinia:

```
[useAnimationStore] (currentFrameIndex thay đổi)
        |
        v Kích hoạt phản ứng
[usePseudocodeStore]
        |
        +---> 1. Lấy activeFrame.activeLogicalLineId
        |     Tìm dòng CodeLine khớp logicalId trong ngôn ngữ hiện tại
        |     Cập nhật activePhysicalLineNumber -> Giao diện Highlight
        |
        +---> 2. Lấy activeFrame.variables (object)
              Chuyển đổi thành mảng VariableState
              Cập nhật watchVariables -> Watch Panel vẽ lại bảng số
```

---

## 3. Thuật toán Tương tác ngược Click-to-Snap (Reverse Lookup Algorithm)

Khi người dùng click vào một dòng mã giả trên màn hình:
1.  Hệ thống nhận diện dòng đó có định danh logic là `logicalId`.
2.  Tiến hành quét mảng `frames` của `useAnimationStore` từ đầu đến cuối.
3.  Tìm khung hình đầu tiên có thuộc tính `activeLogicalLineId === logicalId`.
4.  Nếu tìm thấy, ra lệnh cho store lõi thực hiện nhảy nhanh dòng thời gian tới khung hình đó:
    ```typescript
    function snapToLogicalLine(logicalId: string) {
      const targetFrameIdx = animStore.frames.findIndex(
        f => f.activeLogicalLineId === logicalId
      );
      if (targetFrameIdx !== -1) {
        animStore.goToFrame(targetFrameIdx);
        animStore.pause(); // Tạm dừng phát để người học phân tích tĩnh
      }
    }
    ```
5.  Canvas vẽ lại ngay lập tức tại vị trí khung hình đích.
