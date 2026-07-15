# 🧪 Hướng Dẫn Thực Thi Kiểm Thử Tự Động - Vitest Test Execution Manual

Tài liệu này hướng dẫn học viên và lập trình viên cách khởi chạy, thực thi và theo dõi kết quả của các ca kiểm thử tự động Vitest trong dự án **VisualizationDSA**.

---

## 1. Các Lệnh Khởi Chạy Kiểm Thử (Test Execution Commands)

Tất cả các lệnh được định nghĩa sẵn trong `package.json` và khởi chạy từ terminal:

### 🚀 Lệnh 1: Khởi chạy kiểm thử ở chế độ giám sát đổi code (Watch Mode)
Dùng trong quá trình lập trình (Tự động chạy lại test khi lưu file):
```bash
npm run test
# hoặc chạy trực tiếp bằng vitest
npx vitest
```

### 🚀 Lệnh 2: Khởi chạy kiểm thử một lần duy nhất (Single Run for CI)
Dùng cho quy trình tích hợp tự động GitHub Actions CI:
```bash
npm run test:run
# hoặc chạy bằng vitest
npx vitest run
```

### 🚀 Lệnh 3: Khởi chạy kiểm thử xuất báo cáo bao phủ (Coverage Report)
Tự động sinh thư mục `/coverage` chứa báo cáo HTML bao phủ:
```bash
npm run test:coverage
# hoặc chạy bằng vitest
npx vitest run --coverage
```

---

## 2. Bản Đồ Thư Mục Viết Kiểm Thử (Testing Files Map)

Các file kiểm thử đơn vị được đặt nằm ngay cạnh file logic chính `.ts` để đảm bảo tính dễ tìm kiếm và liên kết chặt chẽ:

```
[src/core/]
  ├── CoreAnimationEngine.ts
  └── __tests__/
        └── CoreAnimationEngine.spec.ts  <-- Kiểm thử Lerp, rAF, AST compile
[src/dsa/]
  ├── ArraySortingVisualizer.ts
  └── __tests__/
        └── ArraySortingVisualizer.spec.ts <-- Kiểm thử Swap Parabol, Bubble frames
[src/solid/]
  ├── SOLIDLCOM4Calculator.ts
  └── __tests__/
        └── SOLIDLCOM4Calculator.spec.ts  <-- Kiểm thử LCOM4 BFS, LSP contract
```

---

## 3. Đọc Kết Quả Kiểm Thử (Interpreting Test Results)
Khi test suite hoàn tất, màn hình terminal sẽ hiển thị chỉ số xanh mướt:
```text
 ✓ src/core/__tests__/CoreAnimationEngine.spec.ts (2 tests)
 ✓ src/dsa/__tests__/ArraySortingVisualizer.spec.ts (2 tests)
 ✓ src/solid/__tests__/SOLIDLCOM4Calculator.spec.ts (3 tests)
 
 Test Files  3 passed (3)
      Tests  7 passed (7)
   Start at  14:45:12
   Duration  180ms (transform 45ms, setup 0ms, collect 80ms, tests 5ms)
```
 Chỉ số chạy cực nhanh **180ms** của Vitest đảm bảo lập trình viên luôn có phản hồi phản xạ lập trình nhanh chóng nhất thời gian thực.
