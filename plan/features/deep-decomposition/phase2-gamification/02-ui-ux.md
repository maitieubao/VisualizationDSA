# 🎨 UI & UX Specifications - Badges Cabinet & Neon Flame

Tài liệu này đặc tả chi tiết thiết kế CSS của tủ kính huy hiệu mờ ảo (Badges Cabinet), hoạt ảnh ngọn lửa Streak bập bùng màu cam Neon (Pulsing Streak Fire) và bảng xếp hạng tuần động vinh danh Top 3 phát sáng trong phân hệ **Gamification & Challenge Engine**.

---

## 1. Tủ Huy hiệu Kính Mờ Kính Glassmorphism (Badges Cabinet UI)

Hộp trưng bày danh hiệu hiển thị mượt mà với dải màu xám huyền ảo cho huy hiệu khóa và phát hào quang Neon cho huy hiệu mở:

```css
.badges-cabinet-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
  background: rgba(15, 23, 42, 0.45); /* Slate 900 kính mờ */
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 24px;
  backdrop-filter: blur(16px);
}

.badge-card-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-card-slot:hover {
  transform: translateY(-6px);
}

/* Huy hiệu bị khóa - phong cách bóng xám tối */
.badge-image-locked {
  filter: grayscale(1) opacity(0.35);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* Huy hiệu mở khóa - bừng sáng hào quang Neon Emerald */
.badge-image-unlocked {
  filter: grayscale(0) drop-shadow(0 0 12px rgba(16, 185, 129, 0.5));
  border: 2px solid #10B981;
  animation: badge-unlock-pulse 2s infinite ease-in-out;
}

@keyframes badge-unlock-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

---

## 2. Ngọn lửa Streak Cam Neon & Vinh danh Podium Top 3 (Leaderboard)

```css
/* Ngọn lửa Streak bập bùng màu cam Neon nhiệt huyết */
.streak-fire-icon {
  width: 24px;
  height: 24px;
  fill: #F97316; /* Cam rực rỡ */
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.6));
  animation: streak-fire-burn 1.2s infinite ease-in-out;
}

@keyframes streak-fire-burn {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.9; }
  50% { transform: scale(1.15) rotate(-3deg); opacity: 1; filter: drop-shadow(0 0 12px rgba(249, 115, 22, 0.8)); }
}

/* Bảng vinh danh Top 3 lộng lẫy */
.leaderboard-podium-first {
  border: 2px solid #F59E0B; /* Vàng hổ phách */
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, transparent 100%);
}

.leaderboard-podium-second {
  border: 2px solid #94A3B8; /* Bạc */
  box-shadow: 0 0 15px rgba(148, 163, 184, 0.2);
}

.leaderboard-podium-third {
  border: 2px solid #B45309; /* Đồng */
  box-shadow: 0 0 10px rgba(180, 83, 9, 0.15);
}
```
 Tủ danh hiệu kính mờ kết hợp ngọn lửa Streak bập bùng cam Neon nhiệt huyết và khung Top vinh danh phát sáng mang đến cho sinh viên cảm xúc thăng hoa học tập, thôi thúc tinh thần thi đua giải thuật hăng say mỗi ngày.
