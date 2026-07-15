# 🎨 UI & UX Specifications - Thread Rails & Critical Sections

Tài liệu này đặc tả chi tiết thiết kế CSS của các đường ray luồng song song (Thread Rails), cổng kiểm soát vùng găng Glassmorphism bóng bẩy, biểu tượng ổ khóa Mutex Lock lấp lánh Neon và hệ thống cảnh báo nhấp nháy đỏ báo động Deadlock trong phân hệ **Concurrency & Threading Visualizer**.

---

## 1. Bố cục Đường ray luồng chạy (Thread Rails CSS Grid)

Các luồng được vẽ thành các đường ray nằm ngang song song tuyệt đẹp màu Slate mờ. Các phần tử luồng ảo (đoàn tàu/quả cầu) chuyển động mượt mà dọc theo đường ray:

```css
.concurrency-rails-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  background: #0B0F19; /* Tông Navy vũ trụ tối thẳm */
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.thread-rail-row {
  position: relative;
  height: 48px;
  background: rgba(255, 255, 255, 0.02); /* Đường ray Slate mờ */
  border-bottom: 2px dashed rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  display: flex;
  align-items: center;
}

/* Quả cầu đại diện cho Luồng đang di chuyển dọc đường ray */
.thread-runner-node {
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #06B6D4; /* Cyan tươi tắn cho luồng READY/RUNNING */
  box-shadow: 0 0 12px #06B6D4;
  transition: left 0.1s linear, background-color 0.2s ease;
}

.thread-runner-node.status-blocked {
  background: #F59E0B; /* Amber Vàng hổ phách biểu thị bị chặn xếp hàng */
  box-shadow: 0 0 12px #F59E0B;
}

.thread-runner-node.status-finished {
  background: #10B981; /* Emerald Xanh lá biểu thị đã chạy hoàn thành */
  box-shadow: 0 0 12px #10B981;
}
```

---

## 2. Cổng kiểm soát Vùng găng & Mutex Lock Padlocks

Vùng găng (Critical Section) được đặt ở giữa đường ray và được trang bị cổng ổ khóa đóng mở phát sáng sinh động:

```css
.critical-section-gate {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 100%;
  background: rgba(244, 63, 94, 0.05); /* Lớp phủ sương mờ hồng cực nhẹ */
  border-left: 2px solid rgba(244, 63, 94, 0.2);
  border-right: 2px solid rgba(244, 63, 94, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Biểu tượng ổ khóa Mutex Lock */
.mutex-lock-icon {
  width: 28px;
  height: 28px;
  fill: #06B6D4; /* Cyan khi đang mở tự do */
  filter: drop-shadow(0 0 6px #06B6D4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mutex-lock-icon.state-locked {
  fill: #F59E0B; /* Amber Vàng hổ phách khi có luồng chiếm giữ khóa */
  filter: drop-shadow(0 0 8px #F59E0B);
  transform: scale(1.15) rotate(360deg); /* Hiệu ứng xoay tròn đóng khóa */
}
```

---

## 3. Còi cảnh báo Nhấp nháy Neon Báo động Deadlock (Deadlock Alarm Styles)

Khi giải thuật DFS đồ thị WFG báo cờ Deadlock phát hiện chu trình tắc nghẽn vòng tròn khép kín:

```css
@keyframes deadlock-neon-pulse {
  0% {
    border-color: rgba(244, 63, 94, 0.2);
    box-shadow: 0 0 15px rgba(244, 63, 94, 0.1);
  }
  50% {
    border-color: #F43F5E; /* Đỏ Rose cực rực */
    box-shadow: 0 0 35px rgba(244, 63, 94, 0.6);
  }
  100% {
    border-color: rgba(244, 63, 94, 0.2);
    box-shadow: 0 0 15px rgba(244, 63, 94, 0.1);
  }
}

.concurrency-rails-container.deadlock-active {
  animation: deadlock-neon-pulse 1.2s infinite ease-in-out;
  border-width: 2px;
}

.deadlock-alert-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid #F43F5E;
  padding: 12px 20px;
  border-radius: 12px;
  color: #FDA4AF;
  font-weight: 700;
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  gap: 10px;
}
```
 Bố cục đường ray trực quan Thread Rails kết hợp với các hiệu ứng ổ khóa xoay Amber và bộ chuông cảnh báo nhấp nháy đỏ Rose rực rỡ mang lại một trải nghiệm đa luồng vô cùng sống động, hữu hình hóa các hiện tượng ẩn sâu trong CPU cực kỳ tinh tế.
