# 📦 TRỰC QUAN HÓA DEPENDENCY INJECTION & IoC CONTAINER
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **IoC Container Dependency Visualizer** - phân hệ trực quan hóa cơ chế đảo ngược điều khiển (IoC Container), vòng đời dịch vụ (Singleton vs. Transient lifetimes) và tiến trình phân giải phụ thuộc hàm khởi dựng (Constructor Dependency Resolution Tree) thuộc **Phase 2** của **VisualizationDSA**. Tài liệu này đặc tả chi tiết kiến trúc của bộ giả lập bộ chứa IoC (Client-side Reflection IoC Engine), giải thuật phát hiện phụ thuộc vòng tròn (Circular Dependency DFS Exception), thiết kế giao diện khoang lưu trữ Vault Glassmorphic 3D và các luồng bắn laser Neon bơm phụ thuộc vào hàm dựng xuất sắc.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Sư phạm & Vòng đời Dịch vụ (PRD)](#1-tầm-nhìn-sư-phạm--vòng-đời-dịch-vụ-prd)
2. [Kiến trúc Phân giải Phụ thuộc & Đồ thị IoC (TECHNICAL SPEC)](#2-kiến-trúc-phân-giải-phụ-thuộc--đồ-thị-ioc-technical-spec)
3. [Hiện thực hóa Bộ máy IoC Container Simulator (Core Logic)](#3-hiện-thực-hóa-bộ-máy-ioc-container-simulator-core-logic)
4. [Thiết kế Khoang chứa Vault & Khung luồng Neon (UI/UX)](#4-thiết-ke-khoang-chứa-vault--khung-luồng-neon-uiux)
5. [Quản lý Trạng thái Pinia IoC Debugger (State Management)](#5-quản-lý-trạng-thái-pinia-ioc-debugger-state-management)
6. [Hạ tầng Tiền tải Cấu trúc Web API Phức tạp (Infrastructure)](#6-hạ-tầng-tiền-tải-cấu-trúc-web-api-phức-tạp-infrastructure)
7. [Hợp đồng JSON Schema Đăng ký IoC (API Reference)](#7-hợp-đồng-json-schema-đăng-ký-ioc-api-reference)
8. [Quyết định Kiến trúc & Động cơ Phản chiếu Client (ADR)](#8-quyết-định-kiến-trúc--động-cơ-phản-chiếu-client-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN SƯ PHẠM & VÒNG ĐỜI DỊCH VỤ (PRD)

### 1.1. Tầm nhìn: Hữu hình hóa thế giới bên trong của IoC Container
Các lập trình viên C# ASP.NET Core hay Java Spring Boot hàng ngày sử dụng Dependency Injection (DI) qua các lệnh đăng ký như `AddSingleton` hay `AddTransient` nhưng hầu như coi IoC Container như một chiếc "hộp đen" ma thuật:
*   *Vấn đề:* Sinh viên vô cùng khó khăn để hiểu rõ sự khác biệt thực tế giữa **Singleton** (tồn tại duy nhất) và **Transient** (luôn tạo mới), và cách container tự động lục tìm constructor để bơm đối tượng (Dependency Injection).
*   *Giải pháp:* **IoC Container Dependency Visualizer** biến IoC Container thành một tủ kính trong suốt 3D Glassmorphism gồm 2 khoang riêng biệt: "Singleton Vault" (Kho lưu trữ Singleton viền mạ vàng) và "Transient Lab" (Kho phòng thí nghiệm Transient viền mạ bạc). Học sinh đăng ký dịch vụ, bấm nút `Resolve<IController>()` và trực tiếp chứng kiến luồng phân giải đệ quy uốn lượn rực rỡ.

### 1.2. Vòng đời Dịch vụ trực quan:
*   **Singleton (Đăng ký duy nhất):** Khi được phân giải lần đầu, Container khởi tạo đối tượng vàng óng, đặt vào Singleton Vault. Các lượt `Resolve` sau, hệ thống bắn tia Neon chỉ thẳng vào đối tượng cũ đang nằm trong Vault để tái sử dụng, không sinh đối tượng mới.
*   **Transient (Đăng ký tạm thời):** Mỗi lượt phân giải `Resolve`, một đối tượng bạc sáng trượt mượt mà ra từ Transient Lab, nhận phụ thuộc bơm vào và trôi về phía Client, không hề lưu lại trong Container.

---

## 2. KIẾN TRÚC PHÂN GIẢI PHỤ THUỘC & ĐỒ THỊ IoC (TECHNICAL SPEC)

Khi sinh viên gọi lệnh `Resolve<T>()`, IoC Container thực thi giải thuật đệ quy dựng cây phụ thuộc như sau:

```
                  [Resolve: UserController] (Transient - Tạo mới)
                             |
         +-------------------+-------------------+
         |                                       |
         v                                       v
[UserService] (Transient - Tạo mới)      [LoggerService] (Singleton - Tái sử dụng)
         |                                       |
         v                                       v
[UserRepository] (Singleton - Tạo/Lấy)   [LoggerProvider] (Singleton)
```

### Giải thuật Phát hiện Phụ thuộc Vòng tròn (Circular Dependency Guard)
Trước khi khởi tạo, hệ thống sử dụng thuật toán duyệt chu trình **DFS Graph Cycle Detector** để quét đồ thị đăng ký. 
Nếu phát hiện vòng lặp đứt đoạn (ví dụ: `ServiceA -> ServiceB -> ServiceA`), hệ thống lập tức chặn đứng phân giải, chớp đỏ nhấp nháy màn hình và quăng lỗi `CircularDependencyException` sư phạm hướng dẫn học sinh sửa thiết kế.

---

## 3. HIỆN THỰC HÓA BỘ MÁY IoC CONTAINER SIMULATOR (CORE LOGIC)

Chúng ta xây dựng bộ phân giải Dependency Injection bằng TypeScript lưu vết từng mốc khởi tạo và vòng đời đối tượng.

```typescript
export type Lifetime = 'SINGLETON' | 'TRANSIENT';

export interface IoCRegistration {
  serviceType: string;
  implementationType: string;
  lifetime: Lifetime;
  dependencies: string[]; // Các tham số Constructor cần bơm vào
}
```
Chi tiết lớp hạt nhân `IoCContainerSimulator` điều phối luồng phân giải sẽ được trình bày cụ thể trong tệp logic lõi.

---

## 4. THIẾT KẾ KHOANG CHỨA VAULT & KHUNG LUỒNG NEON (UI/UX)

### 4.1. Thiết kế Giao diện IoC Workspace
*   **IoC Container Cabinet:** Dựng tủ kính 3D Glassmorphic sang trọng nổi bật chính giữa màn hình.
    *   **Singleton Vault Chamber:** Thiết kế màu vàng hoàng kim ấm áp phát sáng sương mờ.
    *   **Transient Chamber:** Thiết kế màu xanh bạc sang trọng ánh kim.
*   **Laser Injection Effect (Tia Neon bơm phụ thuộc):** Khi luồng đệ quy bơm repository vào service, một tia laser vàng Neon rực rỡ bắn uốn lượn uốn cong từ thẻ Repository chui tọt vào khe Constructor của thẻ Service, tạo cảm giác khớp nối dữ liệu sống động.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA IoC DEBUGGER (STATE MANAGEMENT)

Xây dựng bộ quản lý trạng thái Pinia Setup Store `useIoCDebuggerStore.ts`:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useIoCDebuggerStore = defineStore('iocDebugger', () => {
  const registrations = ref<Record<string, IoCRegistration>>({});
  const instancedSingletons = ref<Record<string, any>>({});
  const activeResolutionSteps = ref<string[]>([]);
  const isResolving = ref(false);

  return { registrations, instancedSingletons, activeResolutionSteps, isResolving };
});
```

---

## 6. HẠ TẦNG TIỀN TẢI CẤU TRÚC WEB API PHỨC TẠP (INFRASTRUCTURE)

### 6.1. Dịch vụ Tải Đăng ký (DI Scenario Asset Loader)
Hệ thống tải sẵn các bộ kịch bản đăng ký kiến trúc Web API thực tế (Controllers -> Services -> Repositories -> Supabase Client) giúp sinh viên bấm chạy mô phỏng lập tức mà không gặp trễ hình.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & ĐỘNG CƠ PHẢN CHIẾU CLIENT (ADR)

### ADR-14: Client-side Interactive Reflection-based IoC Simulator Engine

*   **Quyết định:** Sử dụng công nghệ **Giả lập Phản chiếu Đệ quy (Client-side Reflection Simulator)** chạy 100% bằng TypeScript tại Web Client, thay vì gọi lệnh DI thật từ máy chủ Backend.
*   **Lý do:** Khởi tạo DI thật trên máy chủ ASP.NET Core tốn nhiều thời gian phản hồi mạng và khó trích xuất được từng bước trung gian của đệ quy constructor để vẽ hoạt ảnh. Bằng cách giả lập cơ chế quét Reflection siêu nhẹ tại Client, ta có thể dễ dàng điều tiết tốc độ tua Range Slider tiến trình phân giải, ngắt nghỉ hoạt ảnh tại thời khắc tiêm tham số, mang lại hiệu quả sư phạm trực quan vô giá.
*   **Kết quả:** Học sinh thấu hiểu sâu sắc từng bước phân giải constructor, an toàn và cực kỳ mượt mà 60 FPS.

---

## 8. KÈ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Tủ kính IoC Cabinet & Form Đăng ký (Ngày 1-3):** Dựng khung tủ 3D Glassmorphic, thiết kế hai khoang chứa Singleton/Transient và tạo form nhập đăng ký dịch vụ JetBrains Mono.
2.  **Sprint B: Bộ máy Phân giải IoC Engine & Laser Injection (Ngày 4-6):** Lập trình đệ quy `IoCContainerSimulator`, bắt lỗi chu trình đệ quy DFS, vẽ tia laser Neon uốn cong bắn phụ thuộc mượt mà.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Thẻ Singleton hiển thị chuẩn viền mạ vàng nằm trong Singleton Vault sau khi phân giải.
*   Thẻ Transient tạo mới hoàn toàn viền mạ bạc trượt ra khỏi Transient Chamber mỗi khi Resolve.
*   Vẽ thành công cây phân giải constructor hình học sắc nét bằng SVG kết nối.
*   Phát hiện lỗi Circular Dependency chính xác 100%, lóe đỏ Neon cảnh báo an toàn sư phạm.
*   Tia laser bắn bơm phụ thuộc khớp đúng vị trí tham số constructor.
