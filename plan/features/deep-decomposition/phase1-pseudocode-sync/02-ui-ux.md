# 🎨 UI & UX Specifications - Code Workspace & Variable Watch Panel

Tài liệu này đặc tả chi tiết thiết kế CSS của bảng phân cực Split-Screen, thanh chuyển đổi ngôn ngữ tab dạng kính mờ (Glassmorphic Pills) và kiểu dáng hiển thị phát sáng dòng mã giả Emerald thời gian thực.

---

## 1. Bố cục Phân cực Màn hình (Split-Screen Workspace Grid)

Không gian học tập được định dạng bằng CSS Grid phân cực, đảm bảo tỉ lệ hiển thị cân đối giữa Hoạt ảnh trực quan bên trái và Lập trình lý thuyết bên phải.

```css
.dsa-workspace-container {
  display: grid;
  grid-template-columns: 7fr 3fr; /* 70% bên trái cho Canvas, 30% bên phải cho Code */
  gap: 24px;
  width: 100%;
  height: calc(100vh - 80px); /* Bớt khoảng trống cho thanh định vị Navbar */
  padding: 24px;
  box-sizing: border-box;
  background: #0F172A; /* Slate 900 nền tối huyền bí */
}
```

---

## 2. Thiết kế Code Panel Glassmorphism & Trình chọn Ngôn ngữ

Bảng hiển thị mã giả được phủ hiệu ứng mờ sương sang trọng kết hợp thanh công cụ chuyển tiếp tab ngôn ngữ sắc sảo.

```css
.code-panel-card {
  display: flex;
  flex-direction: column;
  background: rgba(30, 41, 59, 0.45); /* Slate 800 với opacity mỏng */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  overflow: hidden;
  height: 100%;
}

/* Thanh chứa ngôn ngữ dạng con nhộng trôi nổi (Glassmorphic Pills Selector) */
.language-selector-tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.6);
  padding: 4px;
  border-radius: 14px;
  margin: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.language-tab-btn {
  flex: 1;
  padding: 8px 12px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #64748B; /* Slate 500 */
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tab được chọn chuyển màu trắng tinh khôi và nổi khối nhẹ */
.language-tab-btn.active-tab {
  background: rgba(255, 255, 255, 0.08);
  color: #F8FAFC; /* Slate 50 */
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
}
```

---

## 3. Thiết kế Danh sách Dòng mã & Highlight Emerald Phát sáng

```css
.code-lines-viewport {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  background: rgba(15, 23, 42, 0.2);
}

.code-line-row {
  display: flex;
  align-items: flex-start;
  padding: 6px 20px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13.5px;
  line-height: 1.6;
  color: #94A3B8; /* Slate 400 */
  cursor: pointer; /* Cho phép Click-to-Snap */
  border-left: 4px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.code-line-row:hover {
  background: rgba(255, 255, 255, 0.02);
  color: #E2E8F0;
}

/* Hiển thị số dòng vật lý ở lề trái */
.line-number-gutter {
  width: 28px;
  text-align: right;
  margin-right: 16px;
  color: #475569; /* Slate 600 */
  user-select: none; /* Khóa bôi đen số dòng */
}

/* Dòng mã đang thực thi: Phát sáng Neon Xanh lá cây */
.code-line-row.active-executing-line {
  background: rgba(16, 185, 129, 0.12); /* Emerald 500 với 12% Opacity */
  color: #34D399; /* Emerald 400 */
  border-left-color: #10B981; /* Cột chỉ thị Emerald */
  font-weight: 500;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.5); /* Hiệu ứng Neon phát sáng nhẹ */
}
```

---

## 4. Thiết kế Watch Panel (Bảng theo dõi biến số động)

Watch Panel được đặt ngay bên dưới Code View, thiết kế dạng thẻ thẻ kính thẫm sang trọng.

```css
.watch-panel-card {
  margin: 16px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.watch-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748B; /* Slate 500 */
  margin-bottom: 12px;
  font-weight: 600;
}

.watch-variables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}

.watch-variable-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.var-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #94A3B8; /* Slate 400 */
}

.var-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: bold;
  color: #06B6D4; /* Cyan Neon */
  text-shadow: 0 0 6px rgba(6, 182, 212, 0.3);
}
```
 Giao diện phân bổ sắc sảo và phối hợp màu sắc Neon nổi bật giúp học sinh luôn hứng thú cao độ trong suốt buổi thực hành.
