# 🎨 UI & UX Specifications - Glassmorphic UML Cards & Neon Padlocks

Tài liệu này đặc tả chi tiết thiết kế CSS của thẻ sơ đồ lớp UML mờ kính sang trọng (Glassmorphic UML Cards), ổ khóa Neon access modifiers bảo vệ quyền truy cập và hoạt ảnh bắn tia laser phân giải đa hình.

---

## 1. Thẻ Sơ đồ Lớp UML mờ ảo & Rung lắc vi phạm Đóng gói (UML Cards UI)

Thẻ UML lơ lửng trên không gian nền tối với hiệu ứng kính mờ và ổ khóa sành điệu:

```css
.uml-class-card-container {
  width: 250px;
  background: rgba(15, 23, 42, 0.45); /* Slate 900 kính mờ */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', sans-serif;
  color: #E2E8F0;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/* Hoạt ảnh rung lắc wiggle chấn động khi vi phạm đóng gói private */
.encapsulation-breach-wiggle {
  animation: wiggle-vibrate 0.4s cubic-bezier(.36,.07,.19,.97) both;
  border-color: #EF4444 !important; /* Đỏ rực Neon */
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.5) !important;
}

@keyframes wiggle-vibrate {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
```

---

## 2. Các Ổ khóa Neon Quyền truy cập & Hoạt ảnh Tia Laser VTable (Padlocks & Lasers)

```css
/* Ổ khóa Neon Quyền truy cập */
.padlock-icon-private {
  color: #EF4444; /* Đỏ rực */
  filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.7));
}

.padlock-icon-protected {
  color: #F59E0B; /* Vàng hổ phách */
  filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.6));
}

.padlock-icon-public {
  color: #10B981; /* Lục Emerald */
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));
}

/* Tia Laser phát sáng phân giải đa hình SVG uốn lượn */
.dynamic-dispatch-laser-line {
  fill: none;
  stroke: #10B981; /* Mặc định tia lục Neon mát mắt */
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 8, 12;
  animation: dynamic-laser-flow 1.2s infinite linear;
}

@keyframes dynamic-laser-flow {
  to {
    stroke-dashoffset: -30; /* Tạo dòng điện chạy cuộn trào chỉ hướng */
  }
}
```
 Giao diện UML Class Cards kính mờ Glassmorphic kết hợp các ổ khóa Neon bừng sáng và hoạt ảnh rung wiggle lỗi đóng gói private mang lại cho học viên cảm giác chân thực nhất về bức tường bảo vệ đóng gói và cơ chế dynamic dispatch đa hình.
