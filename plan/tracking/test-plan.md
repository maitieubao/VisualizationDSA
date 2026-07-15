# 🎯 Kế Hoạch Kiểm Thử Toàn Diện - Visualizations Testing Strategy

Tài liệu này đặc tả chiến lược kiểm thử tự động, ngưỡng bao phủ (coverage thresholds) và thiết lập môi trường cho dự án **VisualizationDSA**.

---

## 1. Chiến Lược Kiểm Thử (Testing Strategy)
Hệ thống trực quan hóa chạy hoàn toàn dưới máy khách (Client-side), do đó kiểm thử tự động tập trung cực kỳ chặt chẽ vào:
*   **Unit Testing (Kiểm thử đơn vị):** Xác thực độ chính xác toán học của Linear Interpolation Lerp, uốn cong pointer Bezier SVG, giải thuật đếm thành phần đồ thị liên thông LCOM4, và chu trình đệ quy DFS của IoC Container.
*   **Regression Testing:** Chạy lại toàn bộ test suite mỗi khi cập nhật tính năng mới để đề phòng lỗi vỡ dây chuyền.
*   **Performance Benchmarking:** Xác thực thời gian phản hồi Client-side của các bộ parser, linter và compiler luôn dưới ngưỡng **5ms**.

---

## 2. Thiết Lập Môi Trường Chạy Kiểm Thử (Test Environment Setup)
*   **Testing Framework:** Vitest Engine (thay thế Jest để tích hợp siêu tốc với Vite HMR).
*   **Ngôn ngữ viết test:** TypeScript.
*   **Đo lường bao phủ (Coverage Tool):** `@vitest/coverage-v8`.
*   **Ngưỡng bao phủ bắt buộc (DoD Thresholds):**
    *   *Statements coverage:* >= 90%
    *   *Branches coverage:* >= 85%
    *   *Functions coverage:* >= 95%
    *   *Lines coverage:* >= 90%

---

## 3. Quy Trình Tích Hợp Liên Tục (Automated CI Pipeline)
Trong tệp tin cấu hình GitHub Actions CI pipeline, mỗi hành động Push hoặc Pull Request đều tự động kích hoạt kiểm thử:
```yaml
name: VisualizationDSA Automated Test Suite CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install Dependencies
        run: npm ci
      - name: Run Vitest Unit Tests
        run: npm run test:run --coverage
```
