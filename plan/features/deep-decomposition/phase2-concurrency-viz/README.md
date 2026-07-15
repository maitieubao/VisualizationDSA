# 🧵 TRỰC QUAN HÓA BẤT ĐỒNG BỘ & SONG SONG (CONCURRENCY & THREADING VISUALIZER)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Concurrency & Threading Visualizer** - phân hệ trực quan hóa lập trình song song, khóa tranh chấp (Locks) và xung đột luồng thuộc **Phase 2** của **VisualizationDSA**. Tài liệu này đặc tả chi tiết kiến trúc mô phỏng trạng thái luồng (Thread State Machine), giải thuật phát hiện tắc nghẽn vòng tròn (Deadlock Detection Graph), thiết kế đường ray luồng (Thread Rails) và vùng găng (Critical Section), và các giải pháp sư phạm trực quan hóa bất đồng bộ đỉnh cao.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Nghiệp vụ & Bản đồ Đa luồng (PRD)](#1-tầm-nhìn-nghiệp-vụ--bản-đồ-đa-luồng-prd)
2. [Kiến trúc Mô phỏng Luồng & Phát hiện Deadlock (TECHNICAL SPEC)](#2-kiến-trúc-mô-phỏng-luồng--phát-hiện-deadlock-technical-spec)
3. [Hiện thực hóa Bộ máy Mô phỏng Luồng (Core Logic)](#3-hiện-thực-hóa-bộ-máy-mô-phỏng-luồng-core-logic)
4. [Thiết kế Đường ray Thread Rails & Vùng Găng (UI/UX)](#4-thiết-kế-đường-ray-thread-rails--vùng-găng-uiux)
5. [Quản lý Trạng thái Pinia Concurrency (State Management)](#5-quản-lý-trạng-thái-pinia-concurrency-state-management)
6. [Hạ tầng Tiền tải Kịch bản Đa luồng Kinh điển (Infrastructure)](#6-hạ-tầng-tiền-tải-kịch-bản-đa-luồng-kinh-điển-infrastructure)
7. [Hợp đồng JSON Schema API Bất đồng bộ (API Reference)](#7-hợp-đồng-json-schema-api-bất-đồng-bộ-api-reference)
8. [Quyết định Kiến trúc & Đồ thị Khóa Động (ADR)](#8-quyết-định-kiến-trúc--đồ-thị-khóa-động-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN NGHIỆP VỤ & BẢN ĐỒ ĐA LUỒNG (PRD)

### 1.1. Tầm nhìn: Biến các luồng vô hình trong CPU thành các thực thể chuyển động
Lập trình đa luồng (Multithreading) và bất đồng bộ (Concurrency) là một trong những chương học khó nhất của khoa học máy tính:
*   *Vấn đề:* Các khái niệm như vùng găng (Critical Section), khóa loại trừ tương hỗ (Mutex), đèn báo (Semaphore), xung đột tài nguyên (Race Condition) và tắc nghẽn (Deadlock) đều diễn ra vô hình bên trong CPU. Sinh viên chỉ học qua các dòng logs chữ thô sơ, dẫn đến việc cực kỳ lúng túng khi debug mã nguồn đa luồng thực tế.
*   *Giải pháp:* **Concurrency & Threading Visualizer** hữu hình hóa các luồng chạy thành các đường ray song song (Thread Rails). Các tiến trình luồng được vẽ thành các đoàn tàu hoặc các quả cầu di chuyển. 

### 1.2. Các Kịch bản đa luồng MVP kinh điển:
*   **Race Condition (Tranh chấp tài nguyên):** Hai luồng cùng cộng dồn vào một biến đếm `Counter` dùng chung không có khóa, sinh ra kết quả sai lệch thực tế. Bật công tắc `Mutex Lock` để xem chúng xếp hàng đi qua vùng găng tuần tự thế nào để ra kết quả đúng.
*   **Producer - Consumer (Nhà sản xuất & Người tiêu dùng):** Trực quan hóa vùng đệm giới hạn (Bounded Buffer) bằng Semaphore quản lý kho chứa hàng.
*   **Deadlock (Tắc nghẽn vòng tròn):** Luồng A chiếm Khóa 1 đợi Khóa 2, Luồng B chiếm Khóa 2 đợi Khóa 1. Hệ thống lóe đỏ Neon báo hiệu Deadlock bằng đồ thị vòng lặp khép kín.

---

## 2. KIẾN TRÚC MÔ PHỎNG LUỒNG & PHÁT HIỆN DEADLOCK (TECHNICAL SPEC)

Hệ thống biểu diễn trạng thái của từng luồng dưới dạng máy trạng thái hữu hạn (Finite State Machine):

### Máy Trạng thái Luồng (Thread State Transitions)
```
  [READY] (Chuẩn bị chạy)
     |
     v Luồng được cấp phát CPU
 [RUNNING] (Đang chạy trên đường ray)
     |
     +---> Yêu cầu Khóa đang bị luồng khác chiếm đóng
     |        |
     |        v
     |   [BLOCKED] (Bị chặn ở Cổng khóa - Xếp hàng chờ)
     |        |
     |        v Khóa được giải phóng (Signal)
     |        |
     +<-------+
     |
     v Chạy hoàn thành nhiệm vụ
 [FINISHED]
```

### Giải thuật Phát hiện Deadlock (Cycle Detection Algorithm)
Khi các luồng gửi yêu cầu khóa, bộ máy giám sát `ConcurrencySimulationEngine` cập nhật **Đồ thị Chờ đợi Khóa (Wait-For Graph - WFG)**:
1.  Các đỉnh đồ thị đại diện cho các Luồng và các Tài nguyên khóa.
2.  Cạnh có hướng vẽ từ Luồng $A \to$ Khóa $1$ biểu thị Luồng A đang đợi Khóa 1 giải phóng.
3.  Cạnh có hướng vẽ từ Khóa $1 \to$ Luồng $B$ biểu thị Khóa 1 đang bị Luồng B chiếm giữ.
4.  Hệ thống liên tục chạy giải thuật **Tìm kiếm theo chiều sâu (DFS - Cycle Detection)** trên đồ thị WFG. Nếu phát hiện một chu trình khép kín (ví dụ: $A \to 1 \to B \to 2 \to A$):
    *   Xác định có **Deadlock xảy ra**.
    *   Lập tức kích hoạt cờ `isDeadlocked = true`.
    *   Phát sáng đỏ Neon quanh chu trình khóa bị nghẽn trên Canvas để sinh viên nhận biết.

---

## 3. HIỆN THỰC HÓA BỘ MÁY MÔ PHỎNG LUỒNG (CORE LOGIC)

Chúng ta xây dựng động cơ giả lập đa luồng bằng TypeScript, xử lý dịch chuyển luồng và phát hiện chu trình tắc nghẽn đồ thị.

```typescript
export type ThreadState = 'READY' | 'RUNNING' | 'BLOCKED' | 'FINISHED';

export interface ThreadDTO {
  id: string;
  name: string;
  state: ThreadState;
  progress: number; // Vị trí trên đường ray vẽ (0 - 100)
  heldLocks: string[]; // Các khóa đang giữ
  waitingForLock: string | null; // Khóa đang đợi giải phóng
}
```
Chi tiết giải thuật DFS phát hiện chu trình vòng lặp sẽ được trình bày đầy đủ trong file logic lõi.

---

## 4. THIẾT KẾ ĐƯỜNG RAY THREAD RAILS & VÙNG GĂNG (UI/UX)

### 4.1. Đường ray luồng (Thread Rails Layout)
*   **Styling:** Các luồng được hiển thị dưới dạng các đường ray nằm ngang song song tuyệt đẹp màu Slate mờ.
*   **Vùng găng (Critical Section Gate):** Được biểu diễn bằng một hộp chữ nhật bo viền Glassmorphism nổi bật ở giữa. 
    *   **Khi mở khóa (Free):** Cửa cổng sáng màu Cyan dịu nhẹ, cho phép luồng chạy qua.
    *   **Khi khóa (Locked):** Xuất hiện ổ khóa màu vàng hổ phách sáng lấp lánh ngăn cản luồng sau.
    *   **Khi xảy ra Deadlock:** Toàn bộ khu vực vùng găng nhấp nháy đỏ Rose rực rỡ kèm tiếng còi cảnh báo trực quan.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA CONCURRENCY (STATE MANAGEMENT)

Xây dựng bộ quản lý trạng thái Pinia Setup Store `useConcurrencyStore.ts`:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useConcurrencyStore = defineStore('concurrency', () => {
  // State
  const threads = ref<ThreadDTO[]>([]);
  const locks = ref<Record<string, string | null>>({}); // lockId -> threadId giữ khóa
  const sharedCounter = ref(0);
  const isDeadlocked = ref(false);

  return { threads, locks, sharedCounter, isDeadlocked };
});
```

---

## 6. HẠ TẦNG TIỀN TẢI KỊCH BẢN ĐA LUỒNG KINH ĐIỂN (INFRASTRUCTURE)

### 6.1. Dịch vụ Tải kịch bản (Scenario Assets Preloader)
Hạ tầng Client tiền tải các tệp JSON cấu hình kịch bản đa luồng từ Backend (Ví dụ kịch bản Dining Philosophers - Triết gia ăn tối) để đảm bảo hoạt ảnh luồng chuyển động trơn tru không gián đoạn mạng.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐỒ THỊ KHÓA ĐỘNG (ADR)

### ADR-11: Event-driven Thread State Trace Modeling

*   **Quyết định:** Sử dụng mô hình **Ghi vết Trạng thái Luồng theo Sự kiện (Event-driven Thread State Trace)** chạy ở Client-side.
*   **Lý do:** Khác với các cấu trúc dữ liệu tĩnh, bất đồng bộ là sự giao thoa thời gian của các sự kiện ngẫu nhiên. Mô hình hóa vết luồng theo chuỗi sự kiện sự kiện gán/giải khóa giúp dễ dàng tái lập chính xác tiến trình lỗi đa luồng để học viên phân tích tĩnh.
*   **Kết quả:** Học sinh có thể phát tua, tạm dừng, kéo tua lùi thời gian để xem lại mốc chính xác phát sinh Race Condition, hỗ trợ tối đa tư duy lập trình hệ thống.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Thread Rails & Cổng khóa Neon (Ngày 1-3):** Dựng giao diện đường ray luồng song song, cổng khóa vùng găng mở/đóng lộng lẫy, tích hợp Monaco Code xem code song hành.
2.  **Sprint B: Động cơ Giả lập Đa luồng & DFS Cycle Detector (Ngày 4-6):** Viết lớp giả lập luồng chạy, giải thuật phát hiện Deadlock chu trình đồ thị DFS, kết nối cờ báo đỏ Neon cảnh báo tắc nghẽn và lưu vết stats.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Hiển thị rõ ràng các luồng chạy như đoàn tàu di chuyển dọc đường ray Slate.
*   Tranh chấp tài nguyên (Race Condition) thể hiện chính xác giá trị sai lệch khi tắt Mutex, và ra kết quả đúng khi bật Mutex.
*   Giải thuật phát hiện Deadlock khoanh vùng lóe đỏ Neon báo động đúng chu trình tắc nghẽn dưới 10ms khi phát sinh deadlock.
*   Thanh tua kéo Slider tua đồng bộ mượt mà tiến trình đa luồng.
