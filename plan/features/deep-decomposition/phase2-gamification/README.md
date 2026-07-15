# 🏆 HỆ THỐNG TRÒ CHƠI HÓA & THỬ THÁCH (GAMIFICATION & CHALLENGE)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Gamification & Challenge Engine** - phân hệ trò chơi hóa học tập, kích thích động lực học thuật thuật toán của **VisualizationDSA** thông qua hệ thống điểm số kinh nghiệm (XP), chuỗi ngày học tập liên tục (Study Streaks) trang bị khung giờ vàng tự động cứu rỗi ban đêm (Late-Night Grace Period), tủ trưng bày danh hiệu kính mờ (Badges Cabinet) và bảng xếp hạng vinh danh tuần động kết nối hạ tầng Redis khóa phân tán idempotency. Tài liệu này đặc tả chi tiết kiến trúc hạt nhân bộ tính toán Streak, hoạt ảnh hạt Confetti Canvas rơi rụng lộng lẫy và thiết lập khóa đồng thời Redis bảo vệ điểm số tuyệt đối ở Backend C#.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Sư phạm & Cơ chế Động lực (PRD)](#1-tầm-nhìn-sư-phạm--cơ-chế-động-lực-prd)
2. [Bộ tính toán Streak ban đêm & Khóa phân tán Redis (TECHNICAL SPEC)](#2-bộ-tính-toán-streak-ban-đêm--khóa-phân-tán-redis-technical-spec)
3. [Hiện thực hóa Bộ máy Gamification & Streak (Core Logic)](#3-hiện-thực-hóa-bộ-máy-gamification--streak-core-logic)
4. [Bố cục Tủ danh hiệu Badges Cabinet & Cơn mưa Confetti (UI/UX)](#4-bố-cục-tủ-danh-hiệu-badges-cabinet--cơn-mưa-confetti-uiux)
5. [Quản lý Trạng thái Pinia useGamificationStore (State Management)](#5-quản-lý-trạng-thái-pinia-usegamificationstore-state-management)
6. [Hạ tầng Phân rã Hạt Hạt Confetti & Xử lý Múi giờ (Infrastructure)](#6-hạ-tầng-phân-rã-hạt-hạt-confetti--xử-lý-múi-giờ-infrastructure)
7. [Hợp đồng API Gamification & C# Entity (API Reference)](#7-hợp-đồng-api-gamification--c-entity-api-reference)
8. [Quyết định Kiến trúc & Động cơ Sự kiện Idempotent (ADR)](#8-quyết-định-kiến-trúc--động-cơ-sự-kiện-idempotent-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN SƯ PHẠM & CƠ CHẾ ĐỘNG LỰC (PRD)

### 1.1. Tầm nhìn: Chuyển hóa việc học DSA thành trò chơi nhập vai
Thuật toán và cấu trúc dữ liệu nổi tiếng là "cơn ác mộng" gây chán nản và dễ bỏ cuộc nhất của sinh viên CNTT:
*   *Vấn đề:* Người học thiếu động lực duy trì thói quen rèn luyện hàng ngày. Học sinh thường chỉ học dồn vào cuối kỳ, dẫn đến việc quên kiến thức cực nhanh và không hình thành được tư duy phản xạ giải thuật.
*   *Giải pháp:* **Gamification & Challenge Engine** biến tiến trình vượt qua các thử thách DSA thành một hành trình leo rank RPG lôi cuốn:
    1.  **Học tập liên tục (Study Streak):** Mỗi ngày vào tương tác, giải quyết quiz nhúng sẽ duy trì ngọn lửa Streak rực cháy.
    2.  **Khung giờ vàng cứu rỗi ban đêm (Late-Night Grace Period):** Thấu hiểu thói quen cú đêm của sinh viên lập trình, ngọn lửa Streak được bảo vệ kéo dài thời hạn đến **2:00 AM** sáng hôm sau mới tính là sang ngày mới, thay vì tắt ngúm vào lúc 12:00 PM đêm.
    3.  **Tủ huy hiệu danh giá (Badges Cabinet):** Mở khóa huy hiệu kính mờ sành điệu khi vượt thử thách khó (ví dụ: "Recursion Master" khi giải thành công cây đệ quy QuickSort).

---

## 2. BỘ TÍNH TOÁN STREAK BAN ĐÊM & KHÓA PHÂN TÁN REDIS (TECHNICAL SPEC)

Khi sinh viên hoàn thành bài tập, hệ thống xử lý logic cập nhật điểm số và duy trì chuỗi Streak:

```
[Học viên hoàn thành Quiz nhúng] --> [Gửi Event XPEarnedEvent lên C# Backend]
                                             |
                                             v
[Khóa Idempotency khóa Redis theo UserId] -> [Kiểm tra trùng lặp Request ID]
                                             |
                                             v
[Tính toán Streak kết hợp Grace Period 2:00 AM] -> [Cập nhật XP & Streak DB]
                                             |
                                             v
[Bắn tín hiệu Server Sent Events] --> [Client nổ tung pháo hoa Confetti Canvas]
```

### Thuật toán Tính toán Streak thích ứng Múi giờ (Grace Period Calculation)
Hệ thống thiết lập một khoảng đệm thời gian (Buffer offset) 2 tiếng vào ban đêm. Khi xác định một ngày học tập mới, múi giờ được dịch chuyển động:
$$\text{AdjustedTime} = \text{CurrentTime} - 2 \text{ hours}$$
Đảm bảo sinh viên nộp bài lúc 1:30 AM vẫn được tính thuộc chuỗi Streak của ngày hôm trước, bảo vệ công sức học tập không bị đứt đoạn vô lý.

---

## 3. HIỆN THỰC HÓA BỘ MÁY GAMIFICATION & STREAK (CORE LOGIC)

Chúng ta xây dựng bộ máy tính toán Streak và kiểm tra điều kiện mở khóa huy hiệu bằng TypeScript:

```typescript
export interface UserProgressState {
  userId: string;
  totalXP: number;
  activeStreak: number;
  lastActiveDate: string; // Định dạng YYYY-MM-DD
  unlockedBadges: string[];
}
```
Lớp logic lõi `GamificationEngine` và `StreakCalculator` điều phối tính toán điểm số sẽ được đặc tả chi tiết trong tệp logic hạt nhân.

---

## 4. BỐ CỤC TỦ DANH HIỆU BADGES CABINET & CƠN MƯA CONFETTI (UI/UX)

### 4.1. Thiết kế Badge Cabinet & Leaderboard Grid
*   **Glassmorphic Badges Cabinet:** Thiết kế tủ kính trưng bày huy hiệu tuyệt đẹp. Các huy hiệu chưa mở khóa hiển thị dạng bóng tối mờ ảo (Locked grayscale mask), khi được mở khóa sẽ bừng sáng Neon phát sáng hào quang Emerald rực rỡ.
*   **Pulsing Streak Fire Icon:** Biểu tượng ngọn lửa Streak tự động bập bùng hoạt ảnh keyframe lửa Neon Cam nhiệt huyết khi có chuỗi ngày tích cực.
*   **Canvas Confetti Rain Layer:** Lớp canvas phủ toàn màn hình tự động phun trào hàng nghìn hạt màu sắc rơi rụng chao lượn 60 FPS khi sinh viên mở khóa thành công một danh hiệu cao cấp, tạo cảm giác ăn mừng chiến thắng ngập tràn cảm xúc.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA GAMIFICATION STORE (STATE MANAGEMENT)

Xây dựng store `useGamificationStore.ts` quản lý điểm số:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGamificationStore = defineStore('gamification', () => {
  const currentXP = ref(1250);
  const activeStreakCount = ref(5);
  const showConfettiTrigger = ref(false);
  const unlockedBadges = ref<string[]>([]);

  return { currentXP, activeStreakCount, showConfettiTrigger, unlockedBadges };
});
```

---

## 6. HẠ TẦNG PHÂN RÃ HẠT CONFETTI & XỬ LÝ MÚI GIỜ (INFRASTRUCTURE)

*   **Bộ giả lập hạt Confetti hiệu năng cao (HTML5 Canvas Particle System):**
    *   Sử dụng hệ thống hạt (Particle System) vẽ thuần túy trên HTML5 Canvas thay vì sinh hàng nghìn thẻ DOM div gây gián đoạn trình duyệt.
    *   Các hạt Confetti có màu sắc Neon, tự động rơi xoay tròn, chịu lực cản không khí ảo và biến mất sau 3 giây, cam kết mượt mà 60 FPS.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐỘNG CƠ SỰ KIỆN IDEMPOTENT (ADR)

### ADR-17: Idempotent Redis-backed Event-Driven Gamification Engine

*   **Quyết định:** Sử dụng mô hình **Xử lý Sự kiện Bất đồng bộ Idempotency hỗ trợ bộ nhớ đệm Redis** tại máy chủ Backend C# ASP.NET Core để tiếp nhận và cộng điểm XP cho sinh viên.
*   **Lý do:**
    1.  *Chống gian lận Double-Clicking:* Sinh viên rất thông minh và tinh nghịch, họ có thể dùng các tool tự động click liên tục gửi hàng trăm request hoàn thành quiz trong 1 giây để farm XP bất hợp pháp. Khóa phân tán **Redis Distributed Lock** theo cặp `userId:quizId` chặn đứng hoàn toàn các request trùng lặp dưới 500ms.
    2.  *Bảo toàn dữ liệu an toàn tuyệt đối:* Điểm số XP, bảng xếp hạng luôn đòi hỏi tính toàn vẹn cao. Gửi sự kiện qua Broker bất đồng bộ giúp hệ thống chịu tải cực tốt kể cả khi có hàng nghìn sinh viên cùng nộp bài thi giải thuật cuối khóa.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Tủ kính Huy hiệu & Bảng xếp hạng Tuần (Ngày 1-3):** Dựng khung tủ badges mờ, bảng vinh danh Top 10 lung linh, lịch chuỗi ngày streak và ngọn lửa Neon bập bùng.
2.  **Sprint B: Bộ máy Tính toán Streak & Khóa Phân tán Redis (Ngày 4-6):** Lập trình `GamificationEngine` tại Client, hiện thực hóa hệ thống hạt pháo hoa Confetti Canvas, lập trình API nhận sự kiện nộp bài, tích hợp Redis lock an toàn ở Backend C#.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Chuỗi Streak được duy trì chính xác kết hợp Grace Period 2:00 AM (nộp bài lúc 1:59 AM vẫn giữ chuỗi streak thành công).
*   Khóa phân tán Redis chặn đứng 100% các cuộc tấn công gửi sự kiện farm XP trùng lặp.
*   Hoạt ảnh pháo hoa Confetti Canvas rơi rụng lộng lẫy mượt mà 60 FPS, không gây gián đoạn khung hình.
*   Huy hiệu mở khóa bừng sáng Neon phát hào quang rực rỡ, cập nhật trực quan tức thời lên tủ kính Badges Cabinet.
*   Bảng xếp hạng tuần tự động sắp xếp chính xác thứ hạng Top theo XP thời gian thực.
