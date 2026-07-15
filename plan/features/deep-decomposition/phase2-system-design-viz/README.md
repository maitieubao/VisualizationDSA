# 🌐 TRỰC QUAN HÓA THIẾT KẾ HỆ THỐNG PHÂN TÂN (SYSTEM DESIGN VISUALIZER)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **System Design Visualizer Engine** - phân hệ trực quan hóa thiết kế hệ thống lớn và kiến trúc phân tán thời gian thực của **VisualizationDSA** hỗ trợ kéo thả các Node máy chủ mờ kính Glassmorphic, bắn luồng gói tin Neon trôi nổi và mô phỏng đứt gãy sập nguồn (failover) sinh động. Tài liệu này đặc tả chi tiết kiến trúc hạt nhân bộ quản lý `SystemDesignEngine`, thuật toán định tuyến Load Balancer tròn (Round-Robin), giải pháp đo đạc độ trễ replication lag DB và hệ thống hạt sương mù hạt lửa bốc cháy 60 FPS khi quá tải.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Trực quan hóa Thiết kế Hệ thống (PRD)](#1-tầm-nhìn-trực-quan-hóa-thiết-kế-hệ-thống-prd)
2. [Bộ máy Định tuyến Gói tin & Phục hồi Sự cố (TECHNICAL SPEC)](#2-bộ-máy-định-tuyến-gói-tin--phục-hồi-sự-cố-technical-spec)
3. [Hiện thực hóa Engine Định tuyến TS & Replication (Core Logic)](#3-hiện-thực-hóa-engine-định-tuyến-ts--replication-core-logic)
4. [Bố cục Server Kính mờ & Luồng tin Neon (UI/UX)](#4-bố-cục-server-kính-mờ--luồng-tin-neon-uiux)
5. [Quản lý Trạng thái Pinia useSystemDesignStore (State Management)](#5-quản-lý-trạng-thái-pinia-usesystemdesignstore-state-management)
6. [Hạ tầng Canvas Hạt Quá tải & SVG Paths (Infrastructure)](#6-hạ-tầng-canvas-hạt-quá-tải--svg-paths-infrastructure)
7. [Hợp đồng Cấu trúc Network Topology JSON Schema & C# Entity (API Reference)](#7-hợp-đồng-cấu-trúc-network-topology-json-schema--c-entity-api-reference)
8. [Quyết định Kiến trúc & Mô phỏng Actor-Model (ADR)](#8-quyết-định-kiến-trúc--mô-phỏng-actor-model-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN TRỰC QUAN HÓA THIẾT KẾ HỆ THỐNG (PRD)

### 1.1. Tầm nhìn: Biến các lý thuyết phân tán khô khan thành Tương tác Vật lý Sống động
Thiết kế hệ thống lớn (System Design) là chương học khó nhằn nhất, đòi hỏi sự tưởng tượng cao về luồng dữ liệu truyền tải giữa các thành phần phân tán (Load Balancer, API Gateway, Redis Cache, Database, Message Queue):
*   *Vấn đề:* Sinh viên học "Load Balancer Round-Robin" nhưng chỉ thấy sơ đồ tĩnh trên sách vở, không có cảm nhận thực tế về dòng chảy gói tin bị chia đôi. Họ học "Database Replication Lag" nhưng không thấy cảnh Database Primary đồng bộ dữ liệu sang Replica thế nào khi có độ trễ mạng.
*   *Giải pháp:* **System Design Visualizer Engine** hiện thực hóa sống động thế giới phân tán:
    1.  **Vibrant Interactive Architecture Canvas:** Sinh viên được tự tay kéo thả các Node kính mờ Glassmorphism (Client, Load Balancer, Server, Cache, DB, Kafka).
    2.  **Dynamic Flowing Data Packets (Neon SVG Packets):** Các gói tin là các hạt tròn Neon phát sáng trôi trượt nhẹ nhàng dọc theo các đường nối nối kết các server. Nhấp chuột tăng lưu lượng (traffic spike) làm hàng vạn hạt bắn như mưa sa.
    3.  **Visual Bottlenecks & Failures Simulator:** Nhấp tắt Server A (Sập nguồn), Load Balancer lập tức phát hiện trong 5ms, đổi hướng toàn bộ dòng hạt Neon trôi chảy sang Server B dự phòng an toàn (Failover). Server A sập chuyển đỏ rực tỏa khói bụi mù mịt Canvas.

---

## 2. BỘ MÁY ĐỊNH TUYẾN GÓI TIN & PHỤC HỒI SỰ CỐ (TECHNICAL SPEC)

Để kiểm chứng kiến trúc mạng phân tán, hệ thống thiết lập bộ mô phỏng **SystemDesignEngine**:

```
[Client] ===> (Mưa hạt Neon Green) ===> [Load Balancer]
                                             | (Định tuyến 50/50 Round-Robin)
                                     +-------+-------+
                                     |               |
                                     v               v
                                 [Server A]      [Server B] (Glowing Crimson if Failed)
```

### Thuật toán Định tuyến Load Balancer (Round-Robin Routing)
Hệ thống sử dụng chỉ số xoay vòng `activeIndex = (activeIndex + 1) % healthyServers.length` để định tuyến dòng hạt Neon đi dọc các vector SVG paths.

---

## 3. HIỆN THỰC HÓA ENGINE ĐỊNH TUYẾN TS & REPLICATION (CORE LOGIC)

Chúng ta xây dựng các cấu trúc dữ liệu mô tả Network Node và gói tin bằng TypeScript:

```typescript
export interface SystemNode {
  nodeId: string;
  nodeType: 'CLIENT' | 'LOAD_BALANCER' | 'WEB_SERVER' | 'REDIS_CACHE' | 'POSTGRES_PRIMARY' | 'POSTGRES_REPLICA';
  label: string;
  status: 'HEALTHY' | 'OVERLOADED' | 'FAILED';
  requestCount: number;
}

export interface NetworkPacket {
  packetId: string;
  sourceId: string;
  targetId: string;
  progress: number; // 0.0 -> 1.0 tỷ lệ di chuyển trên SVG Path
  status: 'IN_TRANSIT' | 'DROPPED' | 'ARRIVED';
}
```
Lớp hạt nhân `SystemDesignEngine` sẽ được đặc tả trong tệp core logic.

---

## 4. BỐ CỤC SERVER KÍNH MỜ & LUỒNG TIN NEON (UI/UX)

### 4.1. Thiết kế Giao diện Thẻ Server (Server Cards UI)
*   **Glassmorphic Server Card:** Thẻ server mờ kính lơ lửng, nền đen sẫm Slate 900.
*   **Neon Flowing Packets:** Các hạt tròn Neon phát sáng chạy dọc theo nét vẽ. Gói tin đi qua API Gateway sáng lục Cyan, đi qua Cache sáng cam hổ phách, ghi xuống DB sáng vàng rực.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA PATH STORE (STATE MANAGEMENT)

Xây dựng store `useSystemDesignStore.ts` quản lý cấu trúc liên kết:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSystemDesignStore = defineStore('systemDesign', () => {
  const nodes = ref<any[]>([]);
  const activePackets = ref<any[]>([]);
  const isFailoverActive = ref(false);

  return { nodes, activePackets, isFailoverActive };
});
```

---

## 6. QUYẾT ĐỊNH KIẾN TRÚC & MÔ PHỎNG ACTOR-MODEL (ADR)

### ADR-24: Bộ máy Mô phỏng Actor-Model định tuyến luồng tin chạy 100% Client-side bằng TypeScript

*   **Quyết định:** Sử dụng giải pháp mô phỏng hành vi luồng tin định tuyến phi tập trung mạng lưới (Actor-Model simulator) hoàn toàn ở Client-side thông qua vòng lặp FPS `requestAnimationFrame` thay vì gọi API Backend mô phỏng.
*   **Lý do:**
    1.  *Mượt mà tuyệt đối 60 FPS:* Nhấp sập nguồn một Server là Load Balancer chuyển hướng dòng chảy hạt Neon mượt mà ngay lập tức dưới **10ms**, mang lại hiệu ứng thị giác đỉnh cao, kích thích tư duy nghiên cứu của người học.
    2.  *Chịu tải mưa hạt lớn:* Đảm bảo máy khách có thể render cùng lúc 200 hạt Neon trôi nổi mà không sụt giảm FPS.

---

## 7. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 7.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Giao diện Nodes & Luồng Hạt Neon (Ngày 1-3):** Dựng layout kéo thả các Node Glassmorphic, thiết kế hạt Neon trôi nổi trượt trên SVG Paths, Canvas quá nhiệt sập nguồn bốc khói.
2.  **Sprint B: Engine Định tuyến SystemDesignEngine & DB Replication (Ngày 4-6):** Lập trình logic Round-Robin, cơ chế sập nguồn Failover tự động định tuyến lại, đo độ trễ replication lag DB.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Load Balancer định tuyến Round-Robin chia đôi lưu lượng mượt mà 60 FPS khi sinh viên xả mưa hạt.
*   Nhấp tắt Server A (chuyển sang FAILED) bắt buộc đổi viền Server sang đỏ rực chói, bốc khói Canvas 2D và Load Balancer chuyển hướng 100% hạt sang Server B an toàn dưới 5ms.
*   Mô phỏng Database Replication Lag đồng bộ hạt từ Primary sang Replica có thanh kéo cấu hình độ trễ 100ms - 5000ms hoạt động chuẩn chỉ.
*   Tự động dọn dẹp các hạt đã về đích hoặc bị drop khỏi RAM GC để tránh rò rỉ bộ nhớ.
*   Giải phóng 100% vòng lặp hoạt ảnh `requestAnimationFrame` khi thoát phòng thực hành.
