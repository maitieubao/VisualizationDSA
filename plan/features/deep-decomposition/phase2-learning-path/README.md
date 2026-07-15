# 🗺️ LỘ TRÌNH HỌC TẬP CÁ NHÂN HÓA (LEARNING PATH SKILL TREE)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Learning Path Skill Tree Engine** - phân hệ sơ đồ cây kỹ năng học tập cá nhân hóa của **VisualizationDSA** được thiết kế dưới dạng bản đồ phiêu lưu nhập vai (RPG Quest Map), kết nối các node giải thuật qua cầu nối ánh sáng Neon (Neon Laser Connectors) biểu diễn quan hệ tiên quyết Directed Acyclic Graph (DAG) và trang bị bộ đề xuất thông minh AI gợi ý chương học tiếp theo dựa trên học lực thực tế của học viên. Tài liệu này đặc tả chi tiết thuật toán giải quyết ràng buộc cây tiên quyết DAG, phong cách CSS bản đồ mờ ảo Glassmorphic và giải pháp tối ưu hóa tính toán cá nhân hóa ở Client-side.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Sư phạm & Bản đồ Phiêu lưu (PRD)](#1-tầm-nhìn-sư-phạm--bản-đồ-phiêu-lưu-prd)
2. [Giải thuật Cây Tiên quyết DAG & Đề xuất AI (TECHNICAL SPEC)](#2-giải-thuật-cây-tiên-quyết-dag--đề-xuất-ai-technical-spec)
3. [Hiện thực hóa Bộ máy DAG & Evaluator (Core Logic)](#3-hiện-thực-hóa-bộ-máy-dag--evaluator-core-logic)
4. [Bố cục Bản đồ RPG Map Grid & Cầu nối Laser (UI/UX)](#4-bố-cục-bản-đồ-rpg-map-grid--cầu-nối-laser-uiux)
5. [Quản lý Trạng thái Pinia useLearningPathStore (State Management)](#5-quản-lý-trạng-thái-pinia-uselearningpathstore-state-management)
6. [Hạ tầng Vẽ Cầu nối Laser SVG rAF Batch Rendering (Infrastructure)](#6-hạ-tầng-vẽ-cầu-nối-laser-svg-raf-batch-rendering-infrastructure)
7. [Hợp đồng Cây Kỹ năng JSON Schema & C# Entity (API Reference)](#7-hợp-đồng-cây-kỹ-năng-json-schema--c-entity-api-reference)
8. [Quyết định Kiến trúc & Động cơ Giải DAG thuần Client (ADR)](#8-quyết-định-kiến-trúc--động-cơ-giải-dag-thuần-client-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN SƯ PHẠM & BẢN ĐỒ PHIÊU LƯU (PRD)

### 1.1. Tầm nhìn: Biến chương trình đào tạo DSA khô khan thành Bản đồ RPG lôi cuốn
Việc học lập trình cấu trúc dữ liệu và thuật toán thường bị đứt gãy do sinh viên không thấy được bức tranh tổng quan và mối liên hệ giữa các phần kiến thức:
*   *Vấn đề:* Sinh viên học Sorting độc lập với Tree, học OOP độc lập với SOLID, dẫn đến việc học vẹt, mất phương hướng và dễ bỏ cuộc.
*   *Giải pháp:* **Learning Path Skill Tree** sơ đồ hóa chương trình học thành bản đồ phiêu lưu RPG trực quan:
    1.  **Cây kỹ năng Tiên quyết (Prerequisite Graph):** Học viên bắt buộc phải vượt qua "Ải môn" Basic Sorts thì cầu nối ánh sáng mới mở ra, dẫn đường sang ải QuickSort và Cây đệ quy.
    2.  **Cầu nối ánh sáng phát sáng (Neon Laser Bridges):** Liên kết các node ải bằng đường vẽ SVG rực rỡ, tự động nhấp nháy dòng chảy năng lượng khi ải tiếp theo được mở khóa.
    3.  **Đề xuất cá nhân hóa thông minh (AI Recommendations):** Hệ thống tự phân tích điểm số các bài trắc nghiệm trước đó của sinh viên để đưa ra lời khuyên phù hợp (ví dụ: "Bạn đã thiết kế DIP Sandbox xuất sắc, hãy thử mở khóa ải Dependency Injection Container tiếp theo nhé!").

---

## 2. GIẢI THUẬT CÂY TIÊN QUYẾT DAG & ĐỀ XUẤT AI (TECHNICAL SPEC)

Cây học thuật được biểu diễn dưới dạng Đồ thị có hướng không chu trình (Directed Acyclic Graph - DAG). Mỗi node học tập chứa danh sách các node tiên quyết (Prerequisites).

```
[Node 1: Bubble Sort] --(Laser Bridge)--> [Node 2: Quick Sort]
                                                  |
                                                  v
                                          [Node 3: Binary Tree]
```

### Thuật toán Xác định Trạng thái Node (DFS Unlock Evaluator)
Để kiểm tra xem một Node đã đủ điều kiện mở khóa chưa, hệ thống duyệt đồ thị tiên quyết bằng giải thuật **Khử đệ quy DFS**:
*   *Trạng thái Node:* `LOCKED` (Khóa), `UNLOCKED` (Đã mở nhưng chưa học), `IN_PROGRESS` (Đang học), `COMPLETED` (Đã hoàn thành xuất sắc).
*   *Điều kiện mở khóa Node $N$:* Tất cả các node $P \in \text{Prerequisites}(N)$ đều phải có trạng thái là `COMPLETED`.

---

## 3. HIỆN THỰC HÓA BỘ MÁY DAG & EVALUATOR (CORE LOGIC)

Chúng ta xây dựng bộ logic giải đồ thị DAG cây kỹ năng và đưa ra đề xuất thông minh bằng TypeScript:

```typescript
export interface PathNode {
  id: string;
  title: string;
  prerequisites: string[];
  status: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';
}
```
Lớp hạt nhân `PrerequisiteDAGEngine` và `PersonalizedPathEvaluator` sẽ được đặc tả chi tiết trong tệp logic hạt nhân.

---

## 4. BỐ CỤC BẢN ĐỒ RPG MAP GRID & CẦU NỐI LASER (UI/UX)

### 4.1. Thiết kế Giao diện Bản đồ RPG Map
*   **Glassmorphic Map Grid:** Bản đồ nền tối huyền bí với các đường lưới mờ ảo sành điệu, tạo cảm giác một không gian phòng điều khiển tối tân.
*   **Glowing Node Circles:** Các node ải tròn phát sáng. Node đã xong phát sáng Emerald nhẹ nhàng, node đang học nhấp nháy Cyan tươi mát, node bị khóa phủ bóng Slate u tối.
*   **Neon Laser Flow Connection:** Cầu nối liên kết các node vẽ bằng thẻ `<path>` SVG có hoạt ảnh nét đứt `stroke-dasharray` chạy cuồn cuộn biểu thị dòng năng lượng kiến thức đang chảy tràn.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA PATH STORE (STATE MANAGEMENT)

Xây dựng store `useLearningPathStore.ts` quản lý bản đồ:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLearningPathStore = defineStore('learningPath', () => {
  const completedMilestones = ref<string[]>([]);
  const currentActiveNode = ref('quicksort-recursion');
  const aiRecommendedNode = ref('');

  return { completedMilestones, currentActiveNode, aiRecommendedNode };
});
```

---

## 6. HẠ TẦNG VẼ CẦU NỐI LASER SVG RAF BATCH RENDERING (INFRASTRUCTURE)

*   **Bộ vẽ đồ họa cầu nối SVG hiệu năng cao (requestAnimationFrame Batch Renderer):**
    *   Tọa độ các node tròn có thể xê dịch khi giao diện co giãn Responsive. Hạ tầng thiết lập trình vẽ cầu nối tự động cập nhật tọa độ đầu cuối của đường laser, gom các tác vụ vẽ đường cong vào một khung hình rAF duy nhất để tránh lỗi nghẽn trình duyệt (Browser Layout Thrashing).

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐỘNG CƠ GIẢI DAG THUẦN CLIENT (ADR)

### ADR-18: Bộ giải Đồ thị Tiên quyết DAG cây kỹ năng chạy 100% ở Client-side (Client-side Prerequisite DAG Solver)

*   **Quyết định:** Thực thi toàn bộ quá trình duyệt đồ thị tiên quyết DAG và tính toán trạng thái mở khóa node, AI đề xuất cá nhân hóa trực tiếp tại Client-side thay vì gọi API Backend liên tục.
*   **Lý do:**
    1.  *Phản hồi tức thì (Instantaneous Feedback):* Khi sinh viên vừa vượt qua một bài quiz, node ải tiếp theo lập tức bừng sáng phát cầu nối laser lộng lẫy dưới **10ms** mà không phải chờ đợi phản hồi mạng của Backend.
    2.  *Lưu trữ ngoại tuyến (Offline Resiliency):* Sinh viên có thể học giải thuật, làm bài tập ngay cả khi kết nối mạng chập chờn, mọi trạng thái bản đồ học tập tự động đồng bộ vào LocalStorage và cập nhật lên máy chủ Supabase khi mạng ổn định.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Bản đồ RPG Skill Tree & Cầu nối Laser (Ngày 1-3):** Dựng layout map grid, các node ải phát sáng Neon, cầu nối SVG laser di chuyển dòng chảy năng lượng.
2.  **Sprint B: Bộ giải DAG cây kỹ năng & Đề xuất cá nhân hóa AI (Ngày 4-6):** Lập trình `PrerequisiteDAGEngine`, viết bộ máy AI `PersonalizedPathEvaluator`, tích hợp lưu trữ đồng bộ Supabase PostgreSQL.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Cây tiên quyết DAG duyệt chính xác, mở khóa ải tiếp theo đúng 100% điều kiện (chỉ khi ải trước đã COMPLETED).
*   Đường Laser SVG kết nối các node co giãn hoàn hảo theo Responsive màn hình, không bị đứt gãy tọa độ.
*   Bộ đề xuất AI Evaluator gợi ý chính xác node tiếp theo dựa trên học lực thực tế của học viên.
*   Hoạt ảnh dòng năng lượng chạy cuồn cuộn trên cầu nối Neon mượt mà 60 FPS.
*   Trạng thái bản đồ đồng bộ an toàn và tải nhanh dưới 150ms từ LocalStorage/Supabase.
