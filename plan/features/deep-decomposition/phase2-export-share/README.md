# 📤 XUẤT SƠ ĐỒ & CHIA SẺ VẠN NĂNG (EXPORT & SHARE)
## 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2)

Chào mừng bạn đến với tài liệu kỹ thuật chi tiết nhất về **Export & Share Pipeline** - phân hệ cho phép giáo viên, lập trình viên và sinh viên xuất bản sơ đồ thuật toán, cấu trúc lớp UML của **VisualizationDSA** thành hình ảnh vector độ phân giải siêu cao (SVG), ảnh in ấn độ phóng đại 3x (PNG) và đóng gói trạng thái phòng lab (Workspace Lab State Serialization) thành các liên kết rút gọn chia sẻ mạng xã hội thông qua kho lưu trữ Supabase PostgreSQL. Tài liệu này đặc tả chi tiết kiến trúc chuyển dịch SVG-to-Canvas bảo toàn style kính mờ CSS, giải thuật nén dữ liệu Base64 Deflate và cơ chế sinh thẻ OpenGraph phục vụ SEO mạng xã hội sành điệu.

---

## 📌 BẢN ĐỒ MỤC LỤC
1. [Tầm nhìn Sư phạm & Tương tác Cộng đồng (PRD)](#1-tầm-nhìn-sư-phạm--tương-tác-cộng-đồng-prd)
2. [Đường ống Chuyển đổi SVG-to-Canvas & Nén trạng thái (TECHNICAL SPEC)](#2-đường-ống-chuyển-đổi-svg-to-canvas--nén-trạng-thái-technical-spec)
3. [Hiện thực hóa Bộ máy Exporter & Compressor (Core Logic)](#3-hiện-thực-hóa-bộ-máy-exporter--compressor-core-logic)
4. [Bố cục Hộp thoại Kính mờ Share Modal & QR Code (UI/UX)](#4-bố-cục-hộp-thoại-kính-mờ-share-modal--qr-code-uiux)
5. [Quản lý Trạng thái Pinia useExportShareStore (State Management)](#5-quản-lý-trạng-thái-pinia-useexportsharestore-state-management)
6. [Hạ tầng Trích xuất CSS & Sao chép An toàn (Infrastructure)](#6-hạ-tầng-trích-xuất-css--sao-chép-an-toàn-infrastructure)
7. [Hợp đồng API Chia sẻ & C# DTO (API Reference)](#7-hợp-đồng-api-chia-sẻ--c-dto-api-reference)
8. [Quyết định Kiến trúc & Bộ xuất ảnh thuần Client (ADR)](#8-quyết-định-kiến-trúc--bộ-xuất-ảnh-thuần-client-adr)
9. [Kế hoạch triển khai & Tiêu chí nghiệm thu (DoD)](#9-kế-hoạch-triển-khai--tiêu-chí-nghiệm-thu-dod)

---

## 1. TẦM NHÌN SƯ PHẠM & TƯƠNG TÁC CỘNG ĐỒNG (PRD)

### 1.1. Tầm nhìn: Chia sẻ Tri thức DSA tức thời
Học thuật trực quan chỉ thực sự lan tỏa mạnh mẽ khi người dùng dễ dàng chia sẽ những gì họ tự tay thiết lập:
*   *Vấn đề:* Sinh viên làm xong một sơ đồ lớp SOLID rất đẹp hoặc giáo viên muốn minh họa một cây đệ quy QuickSort phức tạp trong giáo án in ấn, nhưng không có cách nào xuất ảnh sắc nét không vỡ hạt (Retina Sharp) hoặc không thể chia sẻ cấu trúc động đó cho bạn bè cùng mở xem.
*   *Giải pháp:* **Export & Share Pipeline** cung cấp bộ công cụ "Một nhấp chuột vạn năng":
    1.  **Xuất ảnh Vector (SVG/PNG 3x):** Trích xuất trực tiếp mã nguồn SVG động, vẽ lên Canvas độ phóng đại gấp 3 lần, tạo tệp PNG trong suốt sắc nét tuyệt vời phục vụ in slide bài giảng.
    2.  **Chia sẻ Trạng thái Workspace (Share State Link):** Đóng gói toàn bộ tọa độ thẻ lớp, các bước debug thuật toán đang chạy dở thành một mã băm siêu ngắn (Share URL), cho phép người nhận click link mở ra đúng 100% hiện trạng phòng thí nghiệm của người gửi.

---

## 2. ĐƯỜNG ỐNG CHUYỂN ĐỔI SVG-TO-CANVAS & NÉN TRẠNG THÁI (TECHNICAL SPEC)

Khi sinh viên bấm nút "Export PNG 3x", quy trình chuyển đổi vector sang pixel (Rasterization Pipeline) vận hành như sau:

```
[Khung SVG góc trên Canvas] --> [Đọc toàn bộ thuộc tính, CSS Styles] 
                                          |
                                          v
[Nén chuỗi SVG thành DataURI] --> [Khởi tạo ảnh ảo Image()] 
                                          |
                                          v
[Khởi tạo Canvas ẩn kích thước nhân 3] --> [Vẽ Image lên Canvas qua ctx.drawImage]
                                          |
                                          v
[Kích hoạt Tải xuống file PNG 3x] <-- [Trích xuất canvas.toDataURL("image/png")]
```

### Thuật toán Nén chuỗi Trạng thái Workspace (Deflate Serialization)
Để đường link chia sẻ không bị quá dài gây lỗi trình duyệt, toàn bộ mảng đối tượng cấu hình được nén băm bằng thuật toán **Deflate/Base64 Compression**:
```
JSON State Object --> Stringify JSON --> Deflate Compression --> Base64 URL Safe Encoding
```
Giúp giảm dung lượng trạng thái từ 8KB xuống dưới **600 bytes** gọn gàng.

---

## 3. HIỆN THỰC HÓA BỘ MÁY EXPORTER & COMPRESSOR (CORE LOGIC)

Chúng ta xây dựng bộ logic trích xuất ảnh và nén băm trạng thái bằng TypeScript:

```typescript
export interface WorkspaceState {
  algorithmId: string;
  layoutNodes: Array<{ id: string; x: number; y: number }>;
  currentStepIndex: number;
}
```
Chi tiết lớp hạt nhân `SVGToCanvasExporter` và `WorkspaceStateCompressor` sẽ được đặc tả trong tệp core logic.

---

## 4. BỐ CỤC HỘP THOẠI KÍNH MỜ SHARE MODAL & QR CODE (UI/UX)

### 4.1. Thiết kế Giao diện Export & Share Dialog
*   **Glassmorphism Dialog Panel:** Bảng hộp thoại mờ kính sang trọng bao quanh bởi đường viền Neon mảnh dẻ phát sáng.
*   **Neon Format Selectors:** Các nút lựa chọn định dạng tải xuống (PNG 3x, SVG Vector) bo viền bo góc Cyan lộng lẫy.
*   **Glowing QR Code Container:** Sinh mã QR để sinh viên quét camera điện thoại mở nhanh sơ đồ thuật toán trên thiết bị di động, được bao quanh bởi khung phát sáng vàng hoàng kim ấm áp.

---

## 5. QUẢN LÝ TRẠNG THÁI PINIA EXPORT STORE (STATE MANAGEMENT)

Xây dựng store `useExportShareStore.ts` quản lý tiến trình xuất bản sơ đồ:

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useExportShareStore = defineStore('exportShare', () => {
  const isSharingModalOpen = ref(false);
  const shareLink = ref('');
  const isExporting = ref(false);
  const exportProgress = ref(0); // Thanh tiến trình Emerald chạy từ 0 đến 100%

  return { isSharingModalOpen, shareLink, isExporting, exportProgress };
});
```

---

## 6. HẠ TẦNG TRÍCH XẤU CSS & SAO CHÉP AN TOÀN (INFRASTRUCTURE)

*   **Bộ phân tích CSS Ngoại vi (External CSS Styles Extractor):**
    *   Hạ tầng trích xuất toàn bộ các khai báo CSS Neon, font JetBrains Mono của trang web chủ rồi nhúng chui trực tiếp vào thẻ `<style>` của SVG trước khi vẽ lên Canvas. Đảm bảo ảnh PNG xuất ra giữ nguyên 100% thiết kế kính mờ lung linh.

---

## 7. QUYẾT ĐỊNH KIẾN TRÚC & BỘ XUẤT ẢNH THUẦN CLIENT (ADR)

### ADR-16: Client-side SVG Vector Render-to-PNG Exporter Engine

*   **Quyết định:** Sử dụng giải pháp **Vẽ Rasterization chuyển đổi SVG sang PNG trực tiếp tại Client-side** thông qua HTML5 Canvas ẩn, thay vì gửi mã HTML lên cụm máy chủ Backend chạy Chromium không đầu (Headless Puppeteer Exporter).
*   **Lý do:**
    1.  *Tốc độ và Chi phí:* Xuất ảnh trực tiếp ở Client mất chưa đầy **150ms** và không tốn bất kỳ tài nguyên CPU/RAM máy chủ nào. Chạy Puppeteer phía Backend tốn tối thiểu 2-3 giây cho một lượt xuất ảnh và gây thắt nút cổ chai hệ thống khi nhiều sinh viên cùng tải bài tập.
    2.  *Độ bảo mật tối đa:* Sơ đồ lớp SOLID, dữ liệu học tập cá nhân của sinh viên không cần truyền lên Internet, xử lý 100% cục bộ tại trình duyệt giúp bảo vệ an toàn quyền riêng tư.
*   **Kết quả:** Trải nghiệm xuất ảnh tức thời, sắc nét vô hạn, tiết kiệm tuyệt đối chi phí vận hành hạ tầng.

---

## 8. KẾ HOẠCH TRIỂN KHAI & TIÊU CHÍ NGHIỆM THU (DoD)

### 8.1. Lộ trình Triển khai
1.  **Sprint A: Thiết kế Hộp thoại Share Dialog & QR Renderer (Ngày 1-3):** Dựng khung kính mờ share modal, các nút lựa chọn viền Neon, trình sinh mã QR động và clipboard copy tiện lợi.
2.  **Sprint B: Hiện thực hóa Đường ống SVG-to-Canvas & N Nén Trạng thái (Ngày 4-6):** Lập trình `SVGToCanvasExporter`, viết thuật toán nén băm `WorkspaceStateCompressor`, trích xuất CSS ngoại vi gộp vào SVG và kết nối lưu trữ share link lên backend Supabase.

### 8.2. Tiêu chí nghiệm thu (DoD)
*   Ảnh PNG tải xuống có độ phóng đại 3x sắc nét tuyệt hảo (độ phân giải trên 3000px), không bị nhòe mờ chữ JetBrains Mono.
*   Đường liên kết chia sẻ (Share URL) nén gọn gàng dưới 800 ký tự, tích hợp lưu băm an toàn vào Supabase Database.
*   Người nhận nhấp vào Share URL mở ra đúng 100% hiện trạng tọa độ thẻ lớp, thuật toán của người gửi.
*   Ảnh SVG Vector tải xuống mở được trực tiếp trong Adobe Illustrator, Figma có đầy đủ các Node quan hệ.
*   Mã QR Code quét nhạy bén trên cả camera iOS và Android, dẫn đúng liên kết chia sẻ.
