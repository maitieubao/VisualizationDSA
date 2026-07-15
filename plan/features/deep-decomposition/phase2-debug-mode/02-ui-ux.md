# 🎨 UI & UX Specifications - Debugger Workspace & Call Stack Tree

Tài liệu này đặc tả chi tiết thiết kế CSS của lề Monaco Editor đặt điểm dừng Breakpoint, dòng code hiện tại phát sáng Neon Cyan sương mờ, các thẻ đệ quy xếp chồng Glassmorphism 3D lộng lẫy và Watch Panel biến chạy trực quan trong phân hệ **Algorithmic Step Debugger Workspace**.

---

## 1. Đồng bộ Chấm Đỏ Breakpoint lề Monaco Gutter & Sáng Dòng Cyan

*   **Breakpoint Gutter:** Thiết lập chấm tròn Neon Rose đỏ rực rỡ bên cột số dòng Monaco Editor.
*   **Active Line Execution:** Dòng code hiện hành đang dừng gỡ lỗi được tô màu nền Cyan sương mờ phát sáng dịu mắt:

```css
/* Chấm tròn đỏ Breakpoint Neon bên lề Monaco */
.monaco-breakpoint-margin-icon {
  width: 12px;
  height: 12px;
  background: #F43F5E; /* Đỏ Rose cực rực */
  border-radius: 50%;
  margin-left: 4px;
  box-shadow: 0 0 10px #F43F5E, 0 0 20px rgba(244, 63, 94, 0.4);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.monaco-breakpoint-margin-icon:hover {
  transform: scale(1.3);
  background: #FDA4AF;
}

/* Dòng code hiện hành đang dừng Debug */
.monaco-active-debug-line {
  background: rgba(6, 182, 212, 0.12) !important; /* Cyan sương mờ */
  border-left: 3px solid #06B6D4; /* Viền trái sáng Cyan rực rỡ */
  box-shadow: inset 5px 0 15px rgba(6, 182, 212, 0.05);
}
```

---

## 2. Ngăn xếp Đệ quy Xếp chồng 3D Glassmorphism (Visual Call Stack Card Stack)

Ngăn xếp đệ quy biểu diễn quá trình gọi hàm lồng nhau được thiết kế dưới dạng các khối thẻ chồng lên nhau có bóng đổ 3D Glassmorphic sang trọng:

```css
.call-stack-3d-container {
  display: flex;
  flex-direction: column-reverse; /* Xếp thẻ hàm mới lên đỉnh Stack */
  gap: 8px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.stack-frame-card {
  position: relative;
  background: rgba(30, 41, 59, 0.45); /* Slate 800 với opacity */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px 18px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.3);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
}

/* Thẻ hàm hiện hành ở đỉnh Stack có viền sáng rực Neon Cyan */
.stack-frame-card.active-top-frame {
  border-color: rgba(6, 182, 212, 0.4);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.15), 0 8px 25px -5px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px) scale(1.01);
}
```

---

## 3. Bảng Giám sát Biến chạy sắc sảo lôi cuốn (Watch Panel Neon Highlights)

```css
.watch-variables-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.watch-variable-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border-left: 2px solid transparent;
  transition: all 0.2s ease;
}

/* Khi giá trị biến chạy bị biến đổi ở dòng hiện tại, lóe sáng Neon Cyan */
.watch-variable-item-row.value-mutated {
  border-left-color: #06B6D4;
  background: rgba(6, 182, 212, 0.04);
}

.watch-var-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #94A3B8; /* Slate 400 */
}

.watch-var-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #E2E8F0;
}
```
 Giao diện Debug Workspace lộng lẫy kết hợp các thẻ xếp chồng Call Stack 3D và Watch Panel Neon mang lại cho học sinh chiếc kính lúp khoa học trực quan, thấu hiểu tường tận từng nhịp rẽ đệ quy khó nhằn.
