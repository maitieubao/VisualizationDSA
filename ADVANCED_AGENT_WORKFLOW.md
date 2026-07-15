# 🤖 BỘ QUY TRÌNH & BẢN ĐỒ TRI THỨC TOÀN DIỆN CHO AGENT (ĐÃ QUÉT 389 FILES)

Tài liệu này được tự động phân tích và trích xuất từ 100% các file .md trong thư mục plan và skills. Do số lượng file quá lớn (389 file), Agent không thể đọc ngẫu nhiên mà BẮT BUỘC phải làm theo các Step sau:

## 🔄 QUY TRÌNH ĐỌC TÀI LIỆU TIÊU CHUẨN 5 BƯỚC

### 🛠 BƯỚC 1: Khởi tạo bối cảnh hệ thống (Core Context)
Trước khi code, Agent cần nạp 3 file nền tảng sau để không làm hỏng kiến trúc hệ thống:
- plan/architecture.md: Nắm vững luồng Client-First, Vue + .NET.
- plan/database.md: Hiểu cấu trúc DB, tránh tạo schema rác.
- plan/api-spec.md: Tuân thủ chuẩn REST API JSON.

### 🛠 BƯỚC 2: Rà soát Roadmap và Mục tiêu Sprint
Đọc file theo Sprint tương ứng. Ví dụ nếu làm Sprint 5, hãy đọc:
- plan/roadmap-sprint.md: Xem tổng quan.
- plan/features/sprint-X/*: Đọc tài liệu tính năng của Sprint.
- Kiểm tra Testcases: plan/tracking/testcases-sprint-X.md.

### 🛠 BƯỚC 3: Tra cứu Bản đồ Phân rã Sâu (Deep Decomposition)
Mọi tính năng đều nằm trong 25 phân hệ cốt lõi. Hãy tìm trong plan/features/deep-decomposition/:
Hãy check README.md ở đây trước, sau đó đi vào thư mục con (ví dụ phase2-solid-visualization hay phase1-animation-engine).

### 🛠 BƯỚC 4: Nhập Vai Kỹ Năng (Thẻ Bài Agent)
Đọc file trong skills/ dựa trên Role. Bạn phải tuân thủ nghiêm ngặt Role này:
- **Backend**: dotnet-core-specialist.md, pi-design.md, ...
- **Frontend**: ue-state-management.md, ui-component-builder.md, ...
- **Visualization**: canvas-rendering-engine.md, nimation-timeline-manager.md, ...
- **Core/System**: project-architect.md, eature-builder.md.

### 🛠 BƯỚC 5: Kiểm tra Lịch sử Lỗi và Quyết định (Tracking)
Tuyệt đối không lặp lại lỗi cũ. Hãy đọc:
- plan/tracking/errors.md
- plan/tracking/decisions.md

## 🗂 CHỈ MỤC TÀI LIỆU CHI TIẾT (ĐÃ QUÉT THỰC TẾ)

### 📂 Thư mục: plan (6 files)
- **api-spec.md**: 🔌 Đặc Tả Giao Diện Lập Trình Ứng Dụng - Web API Specifications (Nội dung chính: 1. Kiến Trúc Giao Tiếp (Communication Architecture), 2. Danh Sách Các Cổng API (API Endpoints Directory)) - *95 dòng*
- **database.md**: 🗄️ Thiết Kế Cơ Sở Dữ Liệu Quan Hệ - Relational Database Schema (Nội dung chính: 1. Sơ Đồ Thực Thể Quan Hệ (ER Diagram Schema), 2. Đặc Tả Chi Tiết Các Bảng Dữ Liệu (Table Schemas), 3. Chỉ Mục Tăng Tốc Truy Vấn (Performance Database Indexes)) - *82 dòng*
- **architecture.md**: 🏛️ Kiến Trúc Tổng Thể Hệ Thống - System Architecture Blueprint (Nội dung chính: 1. Sơ Đồ Kiến Trúc Phân Tầng (Layered Architecture Blueprint), 2. Các Thành Phần Hạt Nhân Cốt Lõi (Core Components)) - *64 dòng*
- **roadmap.md**: 🗺️ Lộ Trình Phát Triển Vĩ Mô - Overarching Project Roadmap & Phases (Nội dung chính: 📌 Các Giai Đoạn Phát Triển (Macro Phases Overview), 1. GIAI ĐOẠN 1: ĐỘNG CƠ HOẠT ẢNH & THƯ VIỆN DSA CỐT LÕI (PHASE 1), 2. GIAI ĐOẠN 2: SANDBOX KỸ NGHỆ PHẦN MỀM CAO CẤP (PHASE 2)) - *48 dòng*
- **roadmap-sprint.md**: 🗓️ Lộ Trình Phân Chia Sprint & Hướng Dẫn Vận Hành - Sprint Delivery Guidelines (Nội dung chính: 1. Cơ Chế Vận Hành Sprint (Sprint Cadence), 2. Tiêu Chí Nghiệm Thu Bắt Buộc (DoD Guidelines), 3. Tóm Lược Phân Chia 12 Sprints Phát Triển) - *33 dòng*
- **future-plan.md**: 🔮 Định Hướng Kế Hoạch Tương Lai - Future Extension Blueprint (Nội dung chính: 1. Tính Năng 1: Trợ Lý Ảo Phân Tích Code Bằng Generative AI (Gemini AI Debugger), 2. Tính Năng 2: Đấu Trường Lập Trình Giải Thuật Thời Gian Thực (Multiplayer Coding Duels), 3. Tính Năng 3: Trình Xuất Bản Phim Hoạt Ảnh DSA Độ Phân Giải Cao (HD MP4/WebM Animation Exporter)) - *28 dòng*

### 📂 Thư mục: plan\features\deep-decomposition (1 files)
- **README.md**: 🏛️ BẢN ĐỒ PHÂN RÃ CHI TIẾT DỰ ÁN VISUALIZATIONDSA (DEEP DECOMPOSITION MASTER INDEX) (Nội dung chính: 📝 TRUNG TÂM QUẢN TRỊ KIẾN TRÚC & CHỈ MỤC CÁC PHÂN HỆ (PHASE 1 & PHASE 2), 📌 BẢN ĐỒ CHỈ MỤC LIÊN KẾT NHANH (MASTER PATHS INDEX), 🏛️ ĐẶC TẢ CHI TIẾT CÁC PHÂN HỆ ĐÃ HOÀN THÀNH (COMPLETED DEEP SPECS)) - *90 dòng*

### 📂 Thư mục: plan\features\deep-decomposition\phase1-animation-engine (12 files)
- **README.md**: 🚀 HỆ THỐNG HOẠT HỌA THUẬT TOÁN (DSA ANIMATION ENGINE) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1), 📌 BẢN ĐỒ MỤC LỤC, 1. MỤC TIÊU SẢN PHẨM & YÊU CẦU NGHIỆP VỤ (PRD)) - *624 dòng*
- **01-core-logic.md**: 🧠 Backend State Generator & Core Logic (C# .NET) (Nội dung chính: 1. Cơ chế Capture State (State Recorder Pattern), 2. Bài toán Tối ưu hóa Bộ nhớ (Memory Constraint & Analysis), 3. Hiện thực hóa Thuật toán thực tế (Bubble Sort Executor)) - *218 dòng*
- **03-state-management.md**: 🗄️ Pinia State Management - useAnimationStore (Vue 3) (Nội dung chính: 1. Thiết kế Mã nguồn Pinia Store (`useAnimationStore.ts`), 2. Các điểm kỹ thuật tối ưu hóa then chốt (Key Optimization Points)) - *218 dòng*
- **API_REFERENCE.md**: 🔌 API Reference & JSON Protocol Spec (Phase 1) (Nội dung chính: 1. API: Sinh trạng thái mô phỏng thuật toán, 2. Đặc tả Cấu trúc Yêu cầu (Request Payload Schema), 3. Đặc tả Cấu trúc Phản hồi (Response Payload Schema)) - *161 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Canvas Rendering System (Vue 3) (Nội dung chính: 1. Kiến trúc Thành phần Giao diện (Component Architecture), 2. Giải pháp Vẽ Đồ họa: HTML5 Canvas vs DOM/SVG, 3. Bản đồ Tọa độ & Bảng màu Chuẩn hóa (Coordinates & Colors)) - *148 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Performance Optimization Guide (Nội dung chính: 1. Tối ưu hóa JSON Payload & Nén Băng thông Mạng, 2. Quản lý Bộ nhớ Client-Side (Vue 3 Memory Management), 3. Chiến lược Lưu trữ Đệm (Caching Strategy)) - *105 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & State Machine (Nội dung chính: 1. Bản đồ Trạng thái (FSM State List), 2. Ma trận Chuyển đổi Trạng thái (State Transition Matrix), 3. Đặc tả Chi tiết Hành vi Ranh giới (Edge Case & Boundary Checks)) - *81 dòng*
- **plan.md**: 📅 Detailed Sprint Implementation Plan - Animation Engine (Phase 1) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH TRIỂN KHAI, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *78 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Detailed Interaction Specification (Nội dung chính: 1. Hành trình Người dùng Từng bước (Step-by-step User Journey), 2. Trạng thái Giao diện Người dùng (UI States), 3. Hệ thống Phím tắt Tiện ích (Keyboard Shortcuts)) - *75 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Animation Engine (Phase 1) (Nội dung chính: 1. Kiến trúc Tổng thể (System Architecture), 2. Luồng xử lý Dữ liệu (Detailed Data Flow), 3. Lý do Lựa chọn Công nghệ (Technology Stack Decisions)) - *72 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase1-custom-input (12 files)
- **README.md**: 🚀 BỘ SINH DỮ LIỆU ĐẦU VÀO TÙY CHỈNH (CUSTOM INPUT GENERATOR) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1), 📌 BẢN ĐỒ MỤC LỤC, 1. MỤC TIÊU NGHIỆP VỤ & CHÂN DUNG NGƯỜI DÙNG (PRD)) - *408 dòng*
- **03-state-management.md**: 🗄️ Pinia State Management - useInputStore (Vue 3) (Nội dung chính: 1. Thiết kế Mã nguồn Pinia Store (`useInputStore.ts`), 2. Điểm tích hợp Liên thông thiết kế (Integration Pattern)) - *197 dòng*
- **01-core-logic.md**: 🧠 Core Logic & Backend Validation Pipeline (C# .NET) (Nội dung chính: 1. Bộ Phân tích Cú pháp Đầu vào (Input Parsing Engine), 2. Bộ Giải quyết Giới hạn Tài nguyên (Safety Constraints Resolver), 3. Xác thực Logic cấu trúc nâng cao (Graph/Tree Validation Gate)) - *129 dòng*
- **API_REFERENCE.md**: 🔌 API Reference & JSON Schema (Custom Input Generator) (Nội dung chính: 1. Endpoint: Sinh mô phỏng từ dữ liệu tùy biến, 2. Mô hình Yêu cầu gửi đi (Request JSON Schema), 3. Đặc tả Cấu trúc Dữ liệu Phản hồi thành công (HTTP 200 OK)) - *118 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Custom Input Forms (Vue 3) (Nội dung chính: 1. Thiết kế Giao diện Biểu mẫu (Input Panel Layout), 2. Xác thực Trực quan & Phản hồi Lỗi (Real-time Visual Feedback), 3. Thuật toán Sinh số thông minh phía Trình duyệt (Client-side Generation)) - *97 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Security - DDoS Shield & Protection (Backend) (Nội dung chính: 1. Phòng chống Tấn công Từ chối Dịch vụ (DDoS Shield), 2. Bảo mật CORS & Lọc Tiêu đề HTTP (HTTP Headers Validation)) - *88 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Custom Input Generator (Phase 1) (Nội dung chính: 1. Luồng chạy Dữ liệu & Xác thực Đa tầng (Multi-tier Validation Flow), 2. Đặc tả Cấu trúc Dữ liệu Đầu vào (Input Structure Specifications)) - *76 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavior Specification & Client-Side Logic (Custom Input) (Nội dung chính: 1. Trạng thái Biểu mẫu Nhập liệu (Input Form States), 2. Đặc tả Hành vi Tương tác Chi tiết (Interaction Specifications)) - *64 dòng*
- **plan.md**: 📅 Detailed Implementation Plan - Custom Input Generator (Phase 1) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH TRIỂN KHAI, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *64 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Detailed Interaction Specification (Custom Input) (Nội dung chính: 1. Bản đồ Hành trình Người dùng Từng bước (Step-by-step User Journey), 2. Tiện ích phím tắt hỗ trợ tiếp cận (Keyboard Shortcuts), 3. Thiết kế Thích ứng Thiết bị (Responsive Form Adaptation)) - *55 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase1-dsa-modules (12 files)
- **README.md**: 📚 THƯ VIỆN GIẢI THUẬT & CẤU TRÚC DỮ LIỆU (DSA MODULES LIBRARY) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1), 📌 BẢN ĐỒ MỤC LỤC, 1. MỤC TIÊU NGHIỆP VỤ & DANH MỤC THUẬT TOÁN MVP (PRD)) - *492 dòng*
- **01-core-logic.md**: 🧠 Core Logic & Algorithm Implementation Specification (C#) (Nội dung chính: 1. Cơ chế Chụp Trạng thái Đệ quy (Recursive State Capture), 2. Logic Sinh Trạng thái Cây tìm kiếm nhị phân (BST Node Insertion), 3. Logic CTDL Tuyến tính Stack / Queue) - *154 dòng*
- **03-state-management.md**: 🗄️ Pinia State Management - useAlgorithmStore (Vue 3) (Nội dung chính: 1. Thiết kế Mã nguồn Pinia Store (`useAlgorithmStore.ts`), 2. Lợi thế của Thiết kế Phân rã Store (Decoupled Store Benefit)) - *135 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & DI - Automatic Strategy Registration (.NET) (Nội dung chính: 1. Cơ chế Quét tự động & Hiện thực hóa Mã nguồn (Reflection Scan), 2. Cách thức sử dụng bên trong Service/Controller (Strategy Resolution), 3. Tối ưu hóa Hiệu năng & Vòng đời Dịch vụ (Lifecycle Optimizations)) - *105 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - DSA Modules Library (Phase 1) (Nội dung chính: 1. Kiến trúc Cắm Rút Độc lập (Strategy Pattern Architecture), 2. Cơ chế Tự động Đăng ký (Reflection-based Auto Registration), 3. Quản lý Siêu dữ liệu Tĩnh (Metadata & Big-O Structure)) - *87 dòng*
- **API_REFERENCE.md**: 🔌 API Reference & JSON Contracts (DSA Modules Library) (Nội dung chính: 1. API: Lấy danh mục thuật toán hiển thị ở Dashboard, 2. API: Lấy siêu dữ liệu lý thuyết & mã giả của thuật toán, 3. Các phản hồi lỗi tiêu chuẩn (Standard Error Responses)) - *83 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Visual Differentiation (Canvas) (Nội dung chính: 1. Cơ chế Component Động trong Vue 3 Setup Store, 2. Quy chuẩn Trực quan hóa đặc thù (Visual Render Forms)) - *80 dòng*
- **plan.md**: 📅 Detailed Implementation Plan - DSA Modules Library (Phase 1) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *57 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Algorithm Discovery Specification (Nội dung chính: 1. Sơ đồ Hành trình Người dùng Từng bước (Step-by-step User Journey), 2. Tiện ích phím tắt khám phá nhanh (Dashboard Shortcuts), 3. Thiết kế Thích ứng Thiết bị (Responsive Adaptivity)) - *54 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & Execution Rules (DSA Library) (Nội dung chính: 1. Phân nhóm Sắp xếp (Sorting Algorithms), 2. Phân nhóm Tìm kiếm (Searching Algorithms), 3. Phân nhóm Cấu trúc dữ liệu tuyến tính (Stack / Queue)) - *47 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase1-e-lecture-mode (12 files)
- **README.md**: 🎓 CHẾ ĐỘ BÀI GIẢNG ĐIỆN TỬ (E-LECTURE MODE) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1), 📌 BẢN ĐỒ MỤC LỤC, 1. MỤC TIÊU NGHIỆP VỤ & TRIẾT LÝ GIẢM TẢI NHẬN THỨC (PRD)) - *326 dòng*
- **03-state-management.md**: 🗄️ Pinia State Management - useLectureStore (Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn TypeScript Store (`useLectureStore.ts`), 2. Ưu việt của Thiết lập Async Flow trong Store) - *168 dòng*
- **01-core-logic.md**: 🧠 Core Logic Specification & Interoperability (E-Lecture Mode) (Nội dung chính: 1. Thiết kế Mô hình Dữ liệu C# ở Backend (Lecture Models), 2. Logic Đồng bộ Tương tác liên Store ở Frontend (TypeScript)) - *145 dòng*
- **API_REFERENCE.md**: 🔌 API Reference & JSON Schema Contracts (E-Lecture Mode) (Nội dung chính: 1. API: Truy xuất kịch bản bài giảng điện tử theo thuật toán, 2. Đặc tả Chi tiết các thuộc tính JSON Schema, 3. Các phản hồi lỗi tiêu chuẩn (Standard Error Responses)) - *83 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Content Delivery (E-Lecture Mode) (Nội dung chính: 1. Phân phối Kịch bản qua CDN & Caching, 2. Nén băng thông tối đa (Brotli & Gzip Compression), 3. Preloading & Offline Bundling (Hướng dẫn cho người dùng mới)) - *71 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specification - Presentation Layer (Overlay) (Nội dung chính: 1. Thiết kế Thẻ Kính mờ (Glassmorphism Modal), 2. Các Trạng thái Giao diện & Hiệu ứng Chuyển cảnh, 3. Các thành phần điều khiển nội dung) - *61 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - E-Lecture Mode (Phase 1) (Nội dung chính: 1. Kiến trúc Hướng Kịch bản (Script-driven Architecture), 2. Phân hệ Kết nối Hai Động cơ (Core Engine Interoperability)) - *60 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interaction Design - E-Lecture Mode (Nội dung chính: 1. Hành trình Người dùng Mới (First-Time User Journey), 2. Kích hoạt Chủ động (Manual Activation Flow), 3. Bản đồ Chuyển dịch Phím tắt Tiếp cận (Accessibility Key Mappings)) - *58 dòng*
- **plan.md**: 📅 Implementation Plan - E-Lecture Mode (Phase 1) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *54 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & Interaction Rules (E-Lecture) (Nội dung chính: 1. Cơ chế Bỏ qua Hoạt ảnh (Skip / Fast-forward Behavior), 2. Bảo vệ Ngữ cảnh Sư phạm (State Interaction Lock), 3. Quy tắc làm mờ mờ đục hóa (Focus Overlay Transitions)) - *39 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase1-execution-control (12 files)
- **README.md**: 🎛️ BẢNG ĐIỀU KHIỂN TIẾN TRÌNH THỰC THI (EXECUTION CONTROL) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1), 📌 BẢN ĐỒ MỤC LỤC, 1. MỤC TIÊU NGHIỆP VỤ & BẢN ĐIỀU KHIỂN DÒNG THỜI GIAN (PRD)) - *205 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Control Panel & Timeline (Vue 3) (Nội dung chính: 1. Thiết kế Giao diện Bảng điều khiển (VCR Control Panel), 2. Thiết kế CSS Custom Youtube-style Slider, 3. Logic Tính toán Tọa độ Tooltip Động khi Hover) - *147 dòng*
- **01-core-logic.md**: 🧠 Playback Control Logic & Scrubbing Math (TypeScript) (Nội dung chính: 1. Cơ chế Tua thời gian Không Lag (Throttled Scrubbing Engine), 2. Toán học Tính toán Thời lượng Bước giải thuật (Speed & Duration Scaling)) - *106 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Hotkeys - Keyboard Listeners (Vue 3) (Nội dung chính: 1. Thiết lập Bộ lắng nghe Phím tắt Toàn cục (Global Hotkey Listeners), 2. Giải pháp chống rò rỉ bộ nhớ (Memory Leak Prevention)) - *92 dòng*
- **03-state-management.md**: 🗄️ State Management & Store Bindings (Execution Control) (Nội dung chính: 1. Thiết lập Computed Properties hai chiều trong Component, 2. Thiết kế logic Nút Phát lại (Replay Action Handler), 3. Khóa tương tác khi kích hoạt E-Lecture Mode) - *85 dòng*
- **API_REFERENCE.md**: 🔌 Preferences API & Local Storage Schema (Execution Control) (Nội dung chính: 1. Lưu trữ Cấu hình cục bộ (Local Storage Schema), 2. API Backend Lưu trữ Cấu hình Cá nhân (Đề xuất Phase 2)) - *65 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interaction Scenarios - Execution Control (Nội dung chính: 📌 KỊCH BẢN 1: ĐIỀU CHỈNH TỐC ĐỘ ĐỂ HỌC BƯỚC KHÓ, 📌 KỊCH BẢN 2: LÙI/TIẾN TỪNG BƯỚC KHỚP VỚI MÃ GIẢ (PSEUDOCODE), 📌 KỊCH BẢN 3: KÉO THẢ TUA TIMELINE & XEM TOOLTIP ĐỘNG) - *63 dòng*
- **plan.md**: 📅 Implementation Plan - Execution Control (Phase 1) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *56 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & Interaction Rules (Execution Control) (Nội dung chính: 1. Khóa giao diện khi kích hoạt Bài giảng điện tử (E-Lecture Mode Override), 2. Quy tắc tự động Tạm dừng khi Tua thời gian (Scrubbing Auto-Pause), 3. Ràng buộc Biên nút bấm Lùi/Tiến bước (Step Boundary Limits)) - *43 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Execution Control (Phase 1) (Nội dung chính: 1. Kiến trúc Phát lệnh Tương tác (Command Issuer Pattern), 2. Công thức Toán học co giãn Tốc độ phát (Speed Scaling), 3. Quản lý Đăng ký Hotkeys hệ thống) - *41 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase1-interactive-playground (12 files)
- **README.md**: 🎨 SÂN CHƠI TƯƠNG TÁC ĐỒ THỊ & CÂY (INTERACTIVE PLAYGROUND) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1), 📌 BẢN ĐỒ MỤC LỤC, 1. MỤC TIÊU NGHIỆP VỤ & SÂN CHƠI ĐỒ HỌA (PRD)) - *181 dòng*
- **03-state-management.md**: 🗄️ State Management - usePlaygroundStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`usePlaygroundStore.ts`), 2. Ưu điểm của Thiết kế Cascade Delete) - *176 dòng*
- **01-core-logic.md**: 🧠 Mathematical Graph Interaction & Arrow Routing Logic (TypeScript) (Nội dung chính: 1. Va chạm Đỉnh & Vẽ Mũi tên Sát viền (Geometry & Trigonometry Engine), 2. Vòng lặp Mô phỏng Vật lý Đồ thị (Force-Directed Simulation Engine)) - *163 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Serialization - Shareable Graphs (Phase 1) (Nội dung chính: 1. Cơ chế Chia sẻ Đồ thị Qua URL (URL Shareable Base64 String), 2. Xuất và Nhập Tệp Đồ thị (Local File Export/Import)) - *107 dòng*
- **API_REFERENCE.md**: 🔌 Graph Parser & Backend API Integration (Phase 1) (Nội dung chính: 1. Bản Biên dịch Đồ thị (Graph Parser Model), 2. Mô hình tiếp nhận C# tại Backend Controller (.NET Core), 3. Các quy tắc Kiểm tra tính toàn vẹn (Payload Validation)) - *89 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Drawing Toolbars & Feedback (Nội dung chính: 1. Thiết kế Thanh công cụ nổi dọc (Floating Glassmorphic Toolbar), 2. Phản hồi Thị giác khi đang Kéo vẽ Cạnh (Edge Drawing Feedback), 3. Hộp thoại Nhập trọng số Cạnh (Weight Input Box UX)) - *82 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Drawing Walkthroughs - Interactive Playground (Nội dung chính: 📌 KỊCH BẢN 1: THIẾT KẾ ĐỒ THỊ Dijkstra & CHIA SẺ LINK BÀI TẬP, 📌 KỊCH BẢN 2: THAO TÁC XÓA NHANH BẰNG PHÍM TẮT BÀN PHÍM, 3. Bản đồ Chuyển dịch Phím tắt Vẽ nhanh (Accessibility shortcuts)) - *59 dòng*
- **plan.md**: 📅 Implementation Plan - Interactive Playground (Phase 1) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *56 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Interactive Playground (Phase 1) (Nội dung chính: 1. Thuật toán Nhận diện Va chạm Đỉnh (Hit Detection math), 2. Lượng giác Định vị Đầu Mũi tên (Trigonometric Arrowhead Placement), 3. Thuật toán Vật lý Ổn định Đồ thị (Force-Directed Graph Physics)) - *47 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & Validation Rules (Playground) (Nội dung chính: 1. Giới hạn Quy mô Đồ thị (Max Nodes Constraint), 2. Kiểm tra Luật Thù hình Thuật toán (Algorithm-Specific Rules), 3. Khóa bảng tương tác khi thuật toán đang phát (Active Playback Lock)) - *44 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase1-pseudocode-sync (12 files)
- **README.md**: 💻 ĐỒNG BỘ MÃ GIẢ & THEO DÕI BIẾN (PSEUDOCODE SYNC & WATCH PANEL) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1), 📌 BẢN ĐỒ MỤC LỤC, 1. MỤC TIÊU NGHIỆP VỤ & SỰ ĐỒNG BỘ SƯ PHẠM (PRD)) - *195 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Code Workspace & Variable Watch Panel (Nội dung chính: 1. Bố cục Phân cực Màn hình (Split-Screen Workspace Grid), 2. Thiết kế Code Panel Glassmorphism & Trình chọn Ngôn ngữ, 3. Thiết kế Danh sách Dòng mã & Highlight Emerald Phát sáng) - *178 dòng*
- **03-state-management.md**: 🗄️ State Management - usePseudocodeStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`usePseudocodeStore.ts`), 2. Ưu điểm nổi bật của cấu trúc Getters Phản ứng Động) - *148 dòng*
- **API_REFERENCE.md**: 🔌 Multilingual Code Schema & API Specifications (Phase 1) (Nội dung chính: 1. Bản đặc tả JSON Schema Giáo trình Mã nguồn (Multilingual Script Schema), 2. Mô hình Kiểm soát Dữ liệu Đầu vào C# ở Backend (.NET Core), 3. Các quy tắc Phản hồi Lỗi Hệ thống (Validation Errors Payload)) - *131 dòng*
- **01-core-logic.md**: 🧠 Pseudocode Sync & Click-to-Snap Reverse Lookup Engine (TypeScript) (Nội dung chính: 1. Bộ máy Đồng bộ dòng Mã giả & Định vị ngược (TypeScript Class), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Concept)) - *123 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Automated Code Compiler Script (Phase 1) (Nội dung chính: 1. Công cụ biên dịch mã nguồn tự động (Assets Pre-compiler Script), 2. Lợi ích vượt trội của Thiết kế Biên dịch Hạ tầng) - *85 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Pseudocode Sync & Watch Panel (Phase 1) (Nội dung chính: 1. Hợp đồng Dữ liệu Cấu trúc Mã nguồn (TypeScript Interfaces), 2. Cơ chế Đồng bộ Liên Store (Inter-Store Sync Mechanics), 3. Thuật toán Tương tác ngược Click-to-Snap (Reverse Lookup Algorithm)) - *77 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Code Walkthroughs - Pseudocode Sync (Nội dung chính: 📌 KỊCH BẢN 1: HỌC THUẬT TOÁN SẮP XẾP SỬ DỤNG TÍNH NĂNG TABS & WATCH PANEL, 📌 KỊCH BẢN 2: TƯƠNG TÁC NGƯỢC (CLICK-TO-SNAP) & ĐIỀU HƯỚNG BẰNG PHÍM MŨI TÊN, 3. Bản đồ Phím tắt Điều khiển Mã nguồn (Keyboard Navigation shortcuts)) - *59 dòng*
- **plan.md**: 📅 Implementation Plan - Pseudocode Sync & Watch Panel (Phase 1) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *54 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & Edge Case Rules (Pseudocode Sync) (Nội dung chính: 1. Cơ chế Tua nhanh & Đồng bộ Tốc độ cao (Fast Playback Performance), 2. Quy tắc Định vị Ngược Click-to-Snap Trùng lặp (Duplicate Logical ID Snapping), 3. Quản lý tầm vực biến ở Watch Panel (Out of Scope Variables)) - *35 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase1-quiz-system (12 files)
- **README.md**: 📝 HỆ THỐNG TRẮC NGHIỆM TƯƠNG TÁC (INTERACTIVE QUIZ SYSTEM) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 1), 📌 BẢN ĐỒ MỤC LỤC, 1. MỤC TIÊU NGHIỆP VỤ & TRẮC NGHIỆM SƯ PHẠM (PRD)) - *190 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Interactive Quiz Overlay (Nội dung chính: 1. Lớp phủ Trắc nghiệm Kính mờ (Glassmorphic Quiz Overlay Container), 2. Các phương án lựa chọn & Hiệu ứng phát sáng Neon viền Đúng/Sai, 3. Lắng nghe Tương tác Canvas (CANVAS_TARGET Cursor Guide)) - *164 dòng*
- **03-state-management.md**: 🗄️ State Management - useQuizStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useQuizStore.ts`), 2. Ý nghĩa thiết kế Mở khóa và Tự phát tiếp (Resume Auto-play)) - *163 dòng*
- **01-core-logic.md**: 🧠 Quiz Verification & Canvas Click Chấm điểm Engine (TypeScript) (Nội dung chính: 1. Bộ máy Kiểm tra đáp án & Chấm điểm va chạm Canvas (TypeScript Class), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *161 dòng*
- **API_REFERENCE.md**: 🔌 Quiz JSON Schema & API Specifications (Phase 1) (Nội dung chính: 1. Bản đặc tả JSON Schema Câu hỏi Trắc nghiệm (Quiz Schema Definition), 2. Mô hình Kiểm soát Dữ liệu C# ở Backend (.NET Core), 3. Quy trình xác thực nghiệp vụ đầu vào ở Máy chủ (Server Validation Rules)) - *114 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Automated Quiz Script Preloader (Phase 1) (Nội dung chính: 1. Cơ chế Tải trước Câu hỏi (Quiz Asset Preloading), 2. Công cụ Kiểm tra Tính toàn vẹn của Bộ đề (Schema Verification Script)) - *102 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Interactive Quiz System (Phase 1) (Nội dung chính: 1. Hợp đồng Dữ liệu Trắc nghiệm (TypeScript Interfaces), 2. Giải thuật Nhận diện nhấp chọn Đáp án Canvas (Canvas Collision Chấm điểm), 3. Quy trình Lưu trữ cục bộ (Local Storage Statistics)) - *95 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Quiz Walkthroughs - Quiz System (Nội dung chính: 📌 KỊCH BẢN 1: GẶP ĐIỂM DỪNG TRẮC NGHIỆM ĐỘT XUẤT KHI XEM BÀI GIẢNG BUBBLE SORT, 📌 KỊCH BẢN 2: TRẢ LỜI CÂU HỎI TƯƠNG TÁC NHẤP CHỌN ĐỈNH CANVAS (Dijkstra)) - *55 dòng*
- **plan.md**: 📅 Implementation Plan - Interactive Quiz System (Phase 1) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *54 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & Playback Lock Rules (Quiz System) (Nội dung chính: 1. Cơ chế Khóa cứng Bảng điều khiển (Playback Lock Dynamics), 2. Kiểm duyệt Câu hỏi Nhấp Canvas (CANVAS_TARGET Click Validation), 3. Chính sách Kiểm tra Checkpoint Lặp (Checkpoint Repetition Policy)) - *37 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-code-to-visualization (12 files)
- **03-state-management.md**: 🗄️ State Management - useLiveCompilerStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useLiveCompilerStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Sandboxed Thread) - *184 dòng*
- **01-core-logic.md**: 🧠 AST Instrumentation & Live Compiler Engine (TypeScript) (Nội dung chính: 1. Bộ máy Phân tích AST & Tiêm mã Tracing (TypeScript Engine), 2. Kiểm thử Đơn vị Tự động (Unit Test Specs)) - *163 dòng*
- **README.md**: 🚀 BIÊN DỊCH MÃ NGUỒN SANG HOẠT ẢNH (CODE-TO-VISUALIZATION COMPILER) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN NGHIỆP VỤ & TRÌNH SOẠN THẢO SÁNG TẠO (PRD)) - *135 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - IDE Monaco Workspace (Nội dung chính: 1. Bố cục Không gian Lập trình Phân cực Grid (IDE Layout Grid), 2. Thiết lập trình soạn thảo Monaco Editor (Monaco Container Styling), 3. Bảng Nhật ký Biên dịch Console Logs (Compiler Console Logs)) - *129 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Web Worker Lifecycle Manager (Phase 2) (Nội dung chính: 1. Dịch vụ Điều phối Vòng đời Web Worker (Worker Lifecycle Coordinator), 2. Giải pháp Phòng ngừa Rò rỉ Bộ nhớ (Memory Leak Prevention)) - *94 dòng*
- **API_REFERENCE.md**: 🔌 Live Compilation Outputs & API Specifications (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Vết thực thi Hoạt ảnh tự sinh (Execution Trace Schema), 2. API Lưu trữ Thuật toán Tự viết lên Cloud (Algorithm Cloud Storage API), 3. Giao thức Báo cáo Lỗi thực thi Sandbox (Execution Error Payload)) - *92 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Code-to-Visualization Compiler (Phase 2) (Nội dung chính: 1. Thiết kế Tiêm mã Ghi vết Cây Cú pháp (AST Instrumentation Design), 2. Giải thuật Chống Lặp vô hạn (Infinite Loop Prevention), 3. Kiến trúc Luồng cát Web Worker Sandbox (Sandboxed Thread Flow)) - *75 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive IDE Walkthroughs - Code-to-Visualization (Nội dung chính: 📌 KỊCH BẢN 1: HỌC VIÊN SOẠN THẢO THUẬT TOÁN CUSTOM BUBBLE SORT & SỬA LỖI CÚ PHÁP, 📌 KỊCH BẢN 2: HỌC VIÊN VÔ TÌNH VIẾT VÒNG LẶP VÔ HẠN (INFINITE LOOP SAFETY)) - *55 dòng*
- **plan.md**: 📅 Implementation Plan - Code-to-Visualization Compiler (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *54 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & Sandbox Security Rules (Phase 2) (Nội dung chính: 1. Ràng buộc Bảo mật Sandbox (Worker Security Constraints), 2. Ngưỡng giới hạn Lặp & Chống Lặp vô hạn (Infinite Loop Policies), 3. Chính sách chống Nhấp chuột Biên dịch Liên tiếp (Debounced Run Protection)) - *40 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-compare-algorithms (12 files)
- **01-core-logic.md**: 🧠 Unified Playback Coordinator & Dynamic Rendering (TypeScript) (Nội dung chính: 1. Bộ điều phối Phát kép & Lập lịch Render (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *173 dòng*
- **03-state-management.md**: 🗄️ State Management - useCompareAlgorithmsStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useCompareAlgorithmsStore.ts`), 2. Ưu điểm nổi bật của thiết kế So sánh Trực quan liên kết store) - *172 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Split Screen & Stats Dashboard (Nội dung chính: 1. Bố cục Chia tách Màn hình Song song Grid (Dual Split Layout Grid), 2. Thẻ so sánh Hiệu năng Trực quan (Comparative Stats Cards), 3. Cụm thanh Range Slider Điều khiển Đồng bộ (Unified Timeline Slider)) - *142 dòng*
- **README.md**: ⚖️ SO SÁNH ĐỐI CHIẾU GIẢI THUẬT (SIDE-BY-SIDE ALGORITHM COMPARATOR) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN SƯ PHẠM & ĐỐI CHIẾU HIỆU NĂNG (PRD)) - *142 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - side-by-side Algorithm Comparator (Phase 2) (Nội dung chính: 1. Kiến trúc Bộ điều phối Playback Trung tâm (UnifiedPlaybackCoordinator), 2. Giải pháp Đồng bộ Vẽ RequestAnimationFrame (rAF Optimization)) - *110 dòng*
- **API_REFERENCE.md**: 🔌 Comparison API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Phiên so sánh Giải thuật (Compare Session Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Các quy tắc xác thực nghiệp vụ đầu vào ở Máy chủ (Server validation)) - *94 dòng*
- **plan.md**: 📅 Implementation Plan - side-by-side Algorithm Comparator (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *55 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Comparator Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: HỌC VIÊN SO SÁNH TRỰC DIỆN BUBBLE SORT VÀ QUICK SORT, 📌 KỊCH BẢN 2: KÉO SLIDER ĐỒNG BỘ ĐỂ PHÂN TÍCH TĨNH TRẠNG THÁI 50% TIẾN TRÌNH) - *55 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Dual Canvas Rendering Optimization (Phase 2) (Nội dung chính: 1. Dịch vụ Tải trước Giáo trình Song hành (Double Payloads Preloader), 2. Giải pháp Phòng ngừa Tràn Bộ nhớ Đệm Canvas (Double Buffer Recycling)) - *53 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - side-by-side Algorithm Comparator (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *35 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-concurrency-viz (12 files)
- **01-core-logic.md**: 🧠 Concurrency Simulation Engine & DFS Deadlock Detector (TypeScript) (Nội dung chính: 1. Bộ máy Giả lập Đa luồng & DFS Cycle Detector (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *228 dòng*
- **03-state-management.md**: 🗄️ State Management - useConcurrencyStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useConcurrencyStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồng bộ Đa luồng Ảo Pinia) - *192 dòng*
- **README.md**: 🧵 TRỰC QUAN HÓA BẤT ĐỒNG BỘ & SONG SONG (CONCURRENCY & THREADING VISUALIZER) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN NGHIỆP VỤ & BẢN ĐỒ ĐA LUỒNG (PRD)) - *150 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Thread Rails & Critical Sections (Nội dung chính: 1. Bố cục Đường ray luồng chạy (Thread Rails CSS Grid), 2. Cổng kiểm soát Vùng găng & Mutex Lock Padlocks, 3. Còi cảnh báo Nhấp nháy Neon Báo động Deadlock (Deadlock Alarm Styles)) - *134 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Concurrency Visualizer (Phase 2) (Nội dung chính: 1. Kiến trúc Động cơ Giả lập Đa luồng (ConcurrencySimulationEngine), 2. Giải thuật Phát hiện Tắc nghẽn Đồ thị (DFS Cycle Detection Graph)) - *111 dòng*
- **API_REFERENCE.md**: 🔌 Concurrency API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Kịch bản Đa luồng (Concurrency Scenario Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Quy chuẩn Kiểm duyệt phía Máy chủ (Server validation rules)) - *84 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Scenario Preloader - Concurrency Viz (Phase 2) (Nội dung chính: 1. Dịch vụ Tải trước Kịch bản Đa luồng (Multi-thread Scenario Preloader), 2. Giải pháp Hợp nhất Chu kỳ Vẽ & Phòng ngừa Rò rỉ RAM (GC & RAF Optimization)) - *56 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Multithreading Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: HỌC VIÊN PHÁT HIỆN LỖI RACE CONDITION & BẢO VỆ BẰNG MUTEX LOCK, 📌 KỊCH BẢN 2: THỰC THI SCENARIO DEADLOCK & ĐƯỢC GIẢI CỨU BỞI DEADLOCK DETECTOR) - *56 dòng*
- **plan.md**: 📅 Implementation Plan - Concurrency Visualizer (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *55 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & Thread Lock Policies (Phase 2) (Nội dung chính: 1. Hành vi Dịch chuyển Luồng & Tranh chấp khóa (Thread Collision Policy), 2. Hành vi Đông cứng Hoạt ảnh khi nghẽn Deadlock (Deadlock Freeze Policy), 3. Quy chuẩn Thích ứng Khung hình co giãn (Resize Observer Policy)) - *38 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-debug-mode (12 files)
- **03-state-management.md**: 🗄️ State Management - useLiveDebuggerStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useLiveDebuggerStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đập nhịp Iterator Pinia Store) - *167 dòng*
- **01-core-logic.md**: 🧠 Coroutine Generator Debugger & Call Stack (TypeScript) (Nội dung chính: 1. Bộ máy Gỡ lỗi Cô-ru-tin Debugger (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *137 dòng*
- **README.md**: 🐛 CHẾ ĐỘ DEBUG THUẬT TOÁN (ALGORITHMIC STEP DEBUGGER WORKSPACE) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN NGHIỆP VỤ & BẢN ĐỒ GỠ LỖI (PRD)) - *125 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Debugger Workspace & Call Stack Tree (Nội dung chính: 1. Đồng bộ Chấm Đỏ Breakpoint lề Monaco Gutter & Sáng Dòng Cyan, 2. Ngăn xếp Đệ quy Xếp chồng 3D Glassmorphism (Visual Call Stack Card Stack), 3. Bảng Giám sát Biến chạy sắc sảo lôi cuốn (Watch Panel Neon Highlights)) - *116 dòng*
- **API_REFERENCE.md**: 🔌 Debugger API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Bước chạy Gỡ lỗi (Debug Step Frame Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Quy chuẩn Kiểm duyệt phía Máy chủ (Server validation rules)) - *79 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Algorithmic Debugger (Phase 2) (Nội dung chính: 1. Cơ chế Tiêm mã Generator yield qua Cây Cú pháp AST, 2. Đồng bộ Điểm dừng lề Monaco Editor (Gutter Breakpoint Sync)) - *79 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Monaco Breakpoint Listener (Phase 2) (Nội dung chính: 1. Cơ chế Lắng nghe Nhấp lề Gutter Monaco Editor (Monaco Gutter Listener), 2. Giải pháp Hạn chế Độ sâu Đệ quy Tránh tràn Ngăn xếp (Stack Overflow Protection)) - *72 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Debugger Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: HỌC VIÊN ĐẶT BREAKPOINT & GỠ LỖI THUẬT TOÁN INSERTION SORT, 📌 KỊCH BẢN 2: TRỰC QUAN HÓA NGĂN XẾP ĐỆ QUY QUICK SORT DẠNG 3D XẾP CHỒNG) - *56 dòng*
- **plan.md**: 📅 Implementation Plan - Algorithmic Debugger Workspace (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *55 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - Algorithmic Debugger Workspace (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *36 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-design-patterns (12 files)
- **03-state-management.md**: 🗄️ State Management - useDesignPatternsStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useDesignPatternsStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store) - *162 dòng*
- **01-core-logic.md**: 🧠 SVG Relationship Engine & Bezier Calculations (TypeScript) (Nội dung chính: 1. Bộ máy Quản lý Sơ đồ UML (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *149 dòng*
- **README.md**: 📐 TRỰC QUAN HÓA DESIGN PATTERNS & SOLID (STRUCTURAL RELATIONSHIP VISUALIZER) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN SƯ PHẠM & KIẾN TRÚC SOLID (PRD)) - *144 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Class Nodes & UML Connections (Nội dung chính: 1. Hộp Lớp Class Node Glassmorphism (UML Node Cards Styling), 2. Đường cong Liên kết Neon SVG (UML Relationship Neon Paths), 3. Hoạt ảnh Observer gửi tín hiệu & DIP Coupling Sandbox) - *118 dòng*
- **API_REFERENCE.md**: 🔌 Design Patterns API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Sơ đồ lớp UML (UML Diagram Class Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Quy chuẩn Kiểm duyệt phía Máy chủ (Server validation rules)) - *96 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Structural Relationship (Phase 2) (Nội dung chính: 1. Giải thuật Tính toán Đường cong Cubic Bezier Uốn lượn SVG, 2. Hoạt ảnh Truyền tín hiệu (Observer Path Neon Pulse Animation)) - *75 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & UML Asset Loader - Design Patterns (Phase 2) (Nội dung chính: 1. Dịch vụ Tải Sơ đồ Lớp Gang of Four (UML Scenario Asset Loader), 2. Tối ưu hóa Chu kỳ Kéo thả chuột & Chống rò rỉ RAM (GC Optimization)) - *55 dòng*
- **plan.md**: 📅 Implementation Plan - Design Patterns & SOLID Visualizer (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *55 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Patterns Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: HỌC VIÊN HOÁN CHUYỂN STRATEGY RUNTIME TRÊN SƠ ĐỒ UML, 📌 KỊCH BẢN 2: THỰC NGHIỆM SANDBOX SOLID DIP - KHẮC PHỤC KHỚP NỐI CỨNG) - *48 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - Design Patterns & SOLID (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *37 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-di-visualization (12 files)
- **01-core-logic.md**: 🧠 IoC Simulator Engine & Circular Dependency DFS (TypeScript) (Nội dung chính: 1. Bộ máy Giả lập IoC Container (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *180 dòng*
- **03-state-management.md**: 🗄️ State Management - useIoCDebuggerStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useIoCDebuggerStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đập nhịp VCR DI Pinia Store) - *141 dòng*
- **README.md**: 📦 TRỰC QUAN HÓA DEPENDENCY INJECTION & IoC CONTAINER (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN SƯ PHẠM & VÒNG ĐỜI DỊCH VỤ (PRD)) - *132 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - IoC Vault & Laser Injection (Nội dung chính: 1. Tủ kính mô phỏng IoC Cabinet & Ngăn Chứa (Chamber Layout Grid), 2. Thẻ Lớp Vòng đời Dịch vụ (Singleton Gold / Transient Silver Nodes), 3. Hoạt ảnh Tia Laser Neon bơm Phụ thuộc (Laser Injection Path FX)) - *101 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - IoC Container & DI (Phase 2) (Nội dung chính: 1. Cơ chế Phân giải Phụ thuộc Đệ quy (Constructor Resolution Algorithm), 2. Giải thuật DFS Phát hiện phụ thuộc vòng tròn (DFS Cycle Detector)) - *99 dòng*
- **API_REFERENCE.md**: 🔌 DI API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Đăng ký dịch vụ (DI Service Registrations Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Quy chuẩn Kiểm duyệt phía Máy chủ (Server validation rules)) - *86 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & IoC Scenario Loader (Phase 2) (Nội dung chính: 1. Dịch vụ Tải cấu trúc Đăng ký IoC (DI Scenario Asset Loader), 2. Giải pháp Hợp nhất Vẽ & Phòng ngừa rò rỉ RAM (Resource Cleanups)) - *60 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive IoC Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: HỌC VIÊN PHÂN GIẢI WEB API ĐỒNG BỘ CONSTRUCTOR INJECTION, 📌 KỊCH BẢN 2: CHỨNG KIẾN LỖI THIẾT KẾ PHỤ THUỘC VÒNG TRÒN (CIRCULAR DEPENDENCY)) - *56 dòng*
- **plan.md**: 📅 Implementation Plan - IoC Container Visualizer (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *55 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - IoC Container Visualizer (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *36 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-embed-widget (12 files)
- **01-core-logic.md**: 🧠 postMessage Bridge & Event Dispatcher (TypeScript) (Nội dung chính: 1. Bộ cầu nối Truyền tin bảo mật (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *151 dòng*
- **README.md**: 🧩 TIỆN ÍCH NHÚNG SƠ ĐỒ TRỰC QUAN (EMBED WIDGET) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN SƯ PHẠM & TÁC ĐỘNG LAN TỎA (PRD)) - *133 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - postMessage Bridge & Bundle Optimization (Nội dung chính: 1. Giao thức Truyền tin Hai chiều (postMessage Protocol Schema), 2. Giải thuật Tự động Co giãn Chiều cao (ResizeObserver Dynamic Resizer), 3. Cấu hình Rollup/Vite Tách gói Tải Siêu Nhẹ (Lightweight Bundle Config)) - *114 dòng*
- **03-state-management.md**: 🗄️ State Management - useEmbedConfiguratorStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useEmbedConfiguratorStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Embed Store) - *109 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Embed Configurator & Live Preview (Nội dung chính: 1. Bảng cấu hình mờ ảo Kính Glassmorphism (Settings Sidebar CSS), 2. Hộp Xem thử Trực tiếp & Code Snippet Viền Neon (Live Preview & Snippet)) - *94 dòng*
- **API_REFERENCE.md**: 🔌 Embed Widget API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Giao tiếp postMessage (Embed Message Schema), 2. Mã nguồn Tích hợp Mẫu tại Host (Host Website Integration Script)) - *83 dòng*
- **plan.md**: 📅 Implementation Plan - Embed Widget (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *55 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Secure Embed Origin Checker (Phase 2) (Nội dung chính: 1. Dịch vụ Kiểm duyệt Nguồn tin an toàn (Secure Origin Checker), 2. Giải pháp Hợp nhất ResizeObserver & Giải phóng bộ nhớ RAM) - *50 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Embed Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: GIÁO VIÊN TÙY BIẾN VÀ NHÚNG SƠ ĐỒ VÀO MOODLE LMS, 📌 KỊCH BẢN 2: TRANG CHỦ HOST ĐIỀU KHIỂN CÂY ĐỆ QUY QUICKSORT NHÚNG TỪ XA) - *50 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - Interactive Embed Widget (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *36 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-export-share (12 files)
- **03-state-management.md**: 🗄️ State Management - useExportShareStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useExportShareStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồng bộ Xuất ảnh Pinia Store) - *141 dòng*
- **01-core-logic.md**: 🧠 Exporter Engine & Lz-string State Compressor (TypeScript) (Nội dung chính: 1. Bộ máy Xuất ảnh & Nén băm (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *140 dòng*
- **README.md**: 📤 XUẤT SƠ ĐỒ & CHIA SẺ VẠN NĂNG (EXPORT & SHARE) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN SƯ PHẠM & TƯƠNG TÁC CỘNG ĐỒNG (PRD)) - *132 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Image Exporter & State Compression (Nội dung chính: 1. Đường ống Trích xuất SVG sang ảnh PNG 3x (SVG Rasterization Pipeline), 2. Giải thuật N Nén Trạng thái Workspace (Lz-string Base64 Compression)) - *110 dòng*
- **API_REFERENCE.md**: 🔌 Share Registry API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Trạng thái Workspace Nén (WorkspaceState Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Cấu trúc Bảng Cơ sở Dữ liệu Supabase Schema (PostgreSQL)) - *90 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Share Modal & Emerald Progress Bar (Nội dung chính: 1. Hộp thoại Chia sẻ Kính Mờ Glassmorphism (Share Dialog Panel), 2. Mã QR Phát sáng Vàng Hoàng Kim & Tiến trình Emerald (QR & Progress)) - *84 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & CSS Stylesheet Extractor (Phase 2) (Nội dung chính: 1. Dịch vụ Trích xuất Stylesheet Ngoại vi (External CSS Styles Injector), 2. Giải pháp Hợp nhất Tải Font Chữ & Giải phóng bộ nhớ RAM Canvas) - *62 dòng*
- **plan.md**: 📅 Implementation Plan - Export & Share (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *55 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Export Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: SINH VIÊN XUẤT ẢNH RETINA PNG 3X NỀN TRONG SUỐT NỘP BÀI TẬP, 📌 KỊCH BẢN 2: CHIA SẺ LIÊN KẾT PHÒNG LAB DỰNG SẴN CÂY ĐỆ QUY CHO BẠN HỌC) - *52 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - Export & Share (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *35 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-gamification (12 files)
- **03-state-management.md**: 🗄️ State Management - useGamificationStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useGamificationStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Gamification Store) - *135 dòng*
- **01-core-logic.md**: 🧠 Streak Calculator & Badge Unlocking Rules (TypeScript) (Nội dung chính: 1. Bộ máy Gamification & Streak (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *134 dòng*
- **README.md**: 🏆 HỆ THỐNG TRÒ CHƠI HÓA & THỬ THÁCH (GAMIFICATION & CHALLENGE) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN SƯ PHẠM & CƠ CHẾ ĐỘNG LỰC (PRD)) - *133 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Canvas Confetti Particle System (Phase 2) (Nội dung chính: 1. Động cơ Phun hạt Canvas Confetti (HTML5 Canvas Confetti Engine)) - *117 dòng*
- **API_REFERENCE.md**: 🔌 Gamification API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Sự kiện Nhận Điểm XP (XPEarnedEvent Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Bản Đặc tả Endpoint API Vinh danh (Weekly Leaderboard Endpoints)) - *99 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Badges Cabinet & Neon Flame (Nội dung chính: 1. Tủ Huy hiệu Kính Mờ Kính Glassmorphism (Badges Cabinet UI), 2. Ngọn lửa Streak Cam Neon & Vinh danh Podium Top 3 (Leaderboard)) - *91 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Gamification Engine & Redis Idempotency Lock (Nội dung chính: 1. Giải thuật Tính toán Streak Cú đêm (Grace Period Date Adjustment), 2. Khóa phân tán chống farm điểm Redis Idempotency Lock) - *84 dòng*
- **plan.md**: 📅 Implementation Plan - Gamification & Challenges (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *55 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Gamification Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: SINH VIÊN MỞ KHÓA HUY HIỆU & NỔ TUNG PHÁO HOA ĂN MỪNG, 📌 KỊCH BẢN 2: CỨU RỖI CHUỖI NGÀY HỌC STREAK CHO "CÚ ĐÊM" LẬP TRÌNH) - *52 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - Gamification & Challenges (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *36 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-learning-path (12 files)
- **01-core-logic.md**: 🧠 Prerequisite DAG Solver & AI Personalized Evaluator (TypeScript) (Nội dung chính: 1. Động cơ Cây Tiên quyết & Đề xuất AI (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *135 dòng*
- **03-state-management.md**: 🗄️ State Management - useLearningPathStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useLearningPathStore.ts`), 2. Giao diện Đồ họa Tự động Đồng bộ Cây Kỹ năng) - *128 dòng*
- **README.md**: 🗺️ LỘ TRÌNH HỌC TẬP CÁ NHÂN HÓA (LEARNING PATH SKILL TREE) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN SƯ PHẠM & BẢN ĐỒ PHIÊU LƯU (PRD)) - *124 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Prerequisite DAG Engine & AI Path Advisor (Nội dung chính: 1. Đồ thị Tiên quyết DAG & Giải thuật duyệt khóa Node (DAG Solver), 2. Giải thuật Đề xuất AI Cá nhân hóa (AI Personalized Path Evaluator)) - *101 dòng*
- **API_REFERENCE.md**: 🔌 Learning Path API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Cấu hình Cây Kỹ năng (SkillTree Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Cấu trúc Bảng Cơ sở Dữ liệu Supabase Schema (PostgreSQL)) - *97 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - RPG Map Skill Tree & Neon Laser Bridges (Nội dung chính: 1. Bản đồ Phiêu lưu Lưới mờ Glassmorphism (RPG Map Grid UI), 2. Các Trạng thái Node Ải & Hoạt ảnh Cầu nối Laser SVG (Bridges & Nodes States)) - *94 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & rAF Laser Batch Renderer (Phase 2) (Nội dung chính: 1. Bộ vẽ Laser Đồng bộ Khung hình rAF (rAF Laser Batch Renderer), 2. Giải pháp Đồng bộ Tọa độ Responsive & Chống rò rỉ RAM) - *56 dòng*
- **plan.md**: 📅 Implementation Plan - Learning Path Skill Tree (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *56 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Skill Tree Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: SINH VIÊN VƯỢT ẢI THẮP SÁNG CẦU NỐI LASER ĐẾN ẢI MỚI, 📌 KỊCH BẢN 2: BỘ NÃO AI ĐỀ XUẤT CÁ NHÂN HÓA ÔN TẬP CHO HỌC VIÊN ĐẠT ĐIỂM YẾU) - *53 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - Learning Path Skill Tree (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *36 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-multi-view (12 files)
- **01-core-logic.md**: 🧠 Multi-View Event Bus & Synchronized Timeline Manager (TypeScript) (Nội dung chính: 1. Trục Đồng bộ Đa giao diện Song song (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *156 dòng*
- **03-state-management.md**: 🗄️ State Management - useMultiViewStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useMultiViewStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store) - *143 dòng*
- **README.md**: 🖥️ ĐA GIAO DIỆN & CHẾ ĐỘ XEM SONG SONG (MULTI-VIEW SYNCHRONIZATION) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN ĐA GIAO DIỆN SONG SONG (PRD)) - *125 dòng*
- **API_REFERENCE.md**: 🔌 Multi-View API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Gói tin Bước Thời gian Giải thuật (TimelineStep Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Bản Đặc tả Endpoint API Tải Dữ liệu Tua Dòng thời gian (Timeline Endpoints)) - *98 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Throttled Drag Coordinator (Phase 2) (Nội dung chính: 1. Bộ điều phối Kéo thả Co giãn Tối ưu hóa rAF (Throttled Drag Coordinator), 2. Quy trình Tháo lắp Panel & GC thu hồi tài nguyên (Cleanups on Unmount)) - *96 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Multi-View Sync Engine & Unidirectional Event Bus (Nội dung chính: 1. Trục Đồng bộ Đơn hướng Event Bus thuần RAM (MultiViewEventBus), 2. Giải thuật Đồng bộ hóa Monaco Gutter Highlighting & SVG Visualizer) - *93 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Resizable Splitters & Monaco Line Highlights (Nội dung chính: 1. Khung Chia màn hình Resizable Kính mờ (Split Panes UI), 2. Monaco Code Highlights & Trục VCR Slider Neon) - *90 dòng*
- **plan.md**: 📅 Implementation Plan - Multi-View Synchronization (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *56 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Multi-View Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: SINH VIÊN KÉO TUA TIMELINE SLIDER QUICKSORT SONG SONG, 📌 KỊCH BẢN 2: CO GIÃN KHUNG RESIZABLE SPLITTER KHI ĐANG PHÁT GIẢI THUẬT) - *54 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - Multi-View Synchronization (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *35 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-oop-visualization (12 files)
- **01-core-logic.md**: 🧠 OOP Reflection Engine & VTable Dispatch Simulator (TypeScript) (Nội dung chính: 1. Động cơ Reflection Hướng đối tượng & Heap ảo (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *207 dòng*
- **03-state-management.md**: 🗄️ State Management - useOOPVisualizerStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useOOPVisualizerStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store) - *148 dòng*
- **API_REFERENCE.md**: 🔌 OOP Concepts API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Cấu hình Định nghĩa Lớp (ClassDefinition Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Bản Đặc tả Endpoint API Tải Sơ đồ Lớp UML Sandbox (UML Hierarchy Endpoints)) - *135 dòng*
- **README.md**: 🧬 TRỰC QUAN HÓA HƯỚNG ĐỐI TƯỢNG (OOP CONCEPTS VISUALIZER) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN TRỰC QUAN HÓA OOP (PRD)) - *131 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - OOP Reflection Simulator & VTable Dynamic Dispatch (Nội dung chính: 1. Bộ máy Tự Reflection & Trình cấp phát Heap ảo (OOPReflectionEngine), 2. Giải thuật bắn tia Laser Phân giải Đa hình động (Dynamic Dispatch Lasers Vector Math)) - *95 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Glassmorphic UML Cards & Neon Padlocks (Nội dung chính: 1. Thẻ Sơ đồ Lớp UML mờ ảo & Rung lắc vi phạm Đóng gói (UML Cards UI), 2. Các Ổ khóa Neon Quyền truy cập & Hoạt ảnh Tia Laser VTable (Padlocks & Lasers)) - *77 dòng*
- **plan.md**: 📅 Implementation Plan - OOP Concepts Visualizer (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *56 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & SVG Dynamic Dispatch Laser Pointer (Phase 2) (Nội dung chính: 1. Bộ vẽ Laser Đa hình Động uốn lượn SVG (SVG Laser Batch Renderer), 2. Giải pháp Đồng bộ Laser Khung hình rAF & GC Memory Leak Prevent) - *53 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive OOP Sandbox Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: PHÂN GIẢI ĐA HÌNH ĐỘNG DYNAMIC DISPATCH TRỰC QUAN, 📌 KỊCH BẢN 2: THỰC NGHIỆM VI PHẠM ĐÓNG GÓI ACCESS MODIFIERS) - *52 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - OOP Concepts Visualizer (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *36 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-smart-quiz (12 files)
- **01-core-logic.md**: 🧠 Quiz Evaluation Engine & Playback Interceptors (TypeScript) (Nội dung chính: 1. Trình kiểm soát Trắc nghiệm Tương tác (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *152 dòng*
- **03-state-management.md**: 🗄️ State Management - useSmartQuizStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useSmartQuizStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store) - *143 dòng*
- **README.md**: 🧠 TRẮC NGHIỆM TƯƠNG TÁC THÔNG MINH (SMART INTERACTIVE QUIZ) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN TRẮC NGHIỆM TƯƠNG TÁC THÔNG MINH (PRD)) - *131 dòng*
- **API_REFERENCE.md**: 🔌 Smart Quiz API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Cấu hình Câu đố (InteractiveQuizQuestion Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Bản Đặc tả Endpoint API Tải Bộ Trắc Nghiệm Giải Thuật (Quizzes API)) - *123 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Monaco Click Interceptor bindings (Phase 2) (Nội dung chính: 1. Monaco Editor Line Click Interceptor & Event Redirection, 2. Giải pháp tháo dỡ Event Listeners & GC Memory Leak Prevent) - *103 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - Quiz Execution Engine & Playback Interceptor (Nội dung chính: 1. Trình đánh chặn Dòng thời gian VCR (VCR Playback Interceptor Hook), 2. Giải thuật Chấm điểm Tương tác SVG Node Binding (SVG Target Resolver)) - *101 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Slide-in Glassmorphic Quiz & Node Highlights (Nội dung chính: 1. Thẻ Trắc nghiệm Slide-in Kính mờ trượt nhẹ (Quiz Overlays UI), 2. Banner Phản hồi HSL Emerald & Crimson (HSL Feedback States)) - *94 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Smart Quiz Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: DỰ ĐOÁN PHẦN TỬ HOÁN ĐỔI TRÊN CANVAS SVG (HEAP SORT), 📌 KỊCH BẢN 2: DỰ ĐOÁN DÒNG CODE THỰC THI TRONG MONACO (QUICKSORT)) - *59 dòng*
- **plan.md**: 📅 Implementation Plan - Smart Interactive Quiz Widget (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *56 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - Smart Interactive Quiz (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *39 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-solid-visualization (12 files)
- **01-core-logic.md**: 🧠 LCOM Cohesion Calculator & SOLID Evaluator (TypeScript) (Nội dung chính: 1. Trình Chấm điểm Thiết kế SOLID (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *169 dòng*
- **03-state-management.md**: 🗄️ State Management - useSOLIDVisualizerStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useSOLIDVisualizerStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store) - *150 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Canvas Spark Physics Scheduler (Phase 2) (Nội dung chính: 1. Bộ phát Hạt lửa Nhiệt lượng Canvas 2D (ThermalSparkParticleEngine), 2. Giải pháp tháo dỡ RAM & GC Memory Leak Prevent) - *130 dòng*
- **API_REFERENCE.md**: 🔌 SOLID UML API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Cấu hình Class Node UML (SOLID UML Class Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Bản Đặc tả Endpoint API Tải Bộ Bài Tập Thiết Kế SOLID (UML API)) - *127 dòng*
- **README.md**: 🧬 TRỰC QUAN HÓA NGUYÊN LÝ SOLID (SOLID PRINCIPLES VISUALIZER) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN TRỰC QUAN HÓA SOLID (PRD)) - *123 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - SOLID Evaluator Engine & Thermal Spark Canvas (Nội dung chính: 1. Trình chấm điểm Nguyên lý SRP bằng LCOM Cohesion (LCOM Calculator), 2. Giải thuật nứt vỡ rạn nứt Laser LSP (SVG Laser Fracture Math), 3. Hệ thống hạt Canvas Hạt Lửa Nhiệt lượng (Thermal Spark Particle Math)) - *94 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Thermal SRP Cards & Laser Fractures (Nội dung chính: 1. Thẻ Lớp Quá nhiệt Tỏa lửa & Rạn nứt Laser (Thermal SRP UI), 2. Rạn nứt Laser LSP & Luồng sáng Neon DIP (Laser Fracture & Flowing Paths)) - *88 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive SOLID Visualizer Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: TÁI CẤU TRÚC LỚP QUÁ NHIỆT SRP (SINGLE RESPONSIBILITY), 📌 KỊCH BẢN 2: THAY THẾ CON TRỎ LSP BỊ NỨT VỠ LASER (LISKOV SUBSTITUTION)) - *60 dòng*
- **plan.md**: 📅 Implementation Plan - SOLID Principles Visualizer (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *56 dòng*
- **BEHAVIOR_SPEC.md**: 🎭 Behavioral Specification & Cohesion Math Bounds (Phase 2) (Nội dung chính: 1. Ràng buộc Chỉ số Cohesion SRP (SRP Cohesion Metrics Limits), 2. Ràng buộc con trỏ LSP & Trễ nứt vỡ Laser (LSP Shatter Delay), 3. Ràng buộc DIP Đảo chiều Mũi tên (DIP Neon Flowing Paths)) - *40 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-state-inspector (12 files)
- **01-core-logic.md**: 🧠 Call Stack Engine & Recursion Tree Generator (TypeScript) (Nội dung chính: 1. Trình Quản lý Ngăn xếp & Cây Đệ quy (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *195 dòng*
- **03-state-management.md**: 🗄️ State Management - useStateInspectorStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useStateInspectorStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store) - *137 dòng*
- **API_REFERENCE.md**: 🔌 State Inspector API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Cấu hình Call Stack (StackFrame Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Bản Đặc tả Endpoint API Tải Trạng Thái RAM Giải Thuật (Execution API)) - *131 dòng*
- **README.md**: 🔍 BỘ THANH TRA TRẠNG THÁI RAM (STATE INSPECTOR & DYNAMIC VARIABLES) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN BỘ THANH TRA TRẠNG THÁI (PRD)) - *114 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Dynamic Pointer Arrow Recalculator (Phase 2) (Nội dung chính: 1. Bộ Vẽ Co Giãn Mũi Tên Tham Chiếu SVG (PointerArrowBatchRenderer), 2. Giải pháp tháo dỡ RAM & GC Memory Leak Prevent) - *105 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - State Inspector & Dynamic Pointer Lines (Nội dung chính: 1. Trình Quản lý Call Stack Ngăn xếp (StateInspectorEngine), 2. Giải thuật Tính tọa độ động Mũi tên Pointer SVG (Dynamic Bezier Math), 3. Thuật toán Dựng Cây Đệ quy Động (RecursionTreeGenerator)) - *90 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - 3D Stack Frames & Neon Pointer Arrows (Nội dung chính: 1. Ngăn xếp Call Stack 3D Kính mờ (Stack Overlays UI), 2. Mũi tên Neon Chỉ Heap & Xung Nhịp Chớp Tắt (Pointer & Pulse UI)) - *85 dòng*
- **plan.md**: 📅 Implementation Plan - State Inspector & Stack Frames (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *56 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & Interactive Debugging Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: THEO DÕI BIẾN SỐ ĐỘNG CON TRỎ CHỈ SANG HEAP (HEAP POINTER LINK), 📌 KỊCH BẢN 2: LỘI NGƯỢC DÒNG THỜI GIAN NHẤP CHỌN FRAME CŨ (STACK FRAME REVEAL)) - *54 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - State Inspector & Stack Frames (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *37 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-system-design-viz (12 files)
- **01-core-logic.md**: 🧠 Distributed Routing Engine & DB Replication Schedulers (TypeScript) (Nội dung chính: 1. Trình Định Tuyến Luồng Tin Phân Tán (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *181 dòng*
- **API_REFERENCE.md**: 🔌 System Design Topology API & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema cấu hình Topology mạng (SystemTopology Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Bản Đặc tả Endpoint API Lưu trữ Sơ đồ (Topology storage API)) - *172 dòng*
- **03-state-management.md**: 🗄️ State Management - useSystemDesignStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Mã nguồn Store (`useSystemDesignStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store) - *143 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Canvas Overload Particles Engine (Phase 2) (Nội dung chính: 1. Hệ thống Canvas Hạt Khói Nghi ngút (FailureSmokeEmitterEngine), 2. Giải pháp tháo dỡ RAM & GC Memory Leak Prevent) - *142 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - System Design Engine & Dynamic Packet Router (Nội dung chính: 1. Trình Điều Phối Định Tuyến Mạng (SystemDesignEngine TS Core), 2. Giải thuật Đồng bộ Database Replication Lag (Replication Queue), 3. Hệ thống hạt Sương mù khói bụi sập nguồn Canvas 2D (Failure Smoke Math)) - *137 dòng*
- **README.md**: 🌐 TRỰC QUAN HÓA THIẾT KẾ HỆ THỐNG PHÂN TÂN (SYSTEM DESIGN VISUALIZER) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN TRỰC QUAN HÓA THIẾT KẾ HỆ THỐNG (PRD)) - *125 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - Glassmorphic Nodes & Neon Packets Flow (Nội dung chính: 1. Thẻ Máy Chủ Kính Mờ Glassmorphism (Server Cards UI), 2. Hạt Neon dữ liệu và Khói Bụi Sập Nguồn (Packets & Smoke Particles UI)) - *83 dòng*
- **plan.md**: 📅 Implementation Plan - System Design Visualizer (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *56 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & System Design Simulator Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: CÂN BẰNG TẢI TRÒN VÀ MÔ PHỎNG SẬP NGUỒN (ROUND-ROBIN & FAILOVER), 📌 KỊCH BẢN 2: THỬ NGHIỆM ĐỒNG BỘ TRỄ DB (REPLICATION LAG TIME TRIAL)) - *53 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - System Design Visualizer (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *39 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\deep-decomposition\phase2-timeline-playback (12 files)
- **01-core-logic.md**: 🧠 VCR Playback Engine & High-Res Scheduling Loop (TypeScript) (Nội dung chính: 1. Trình Lập Lịch Khung Hình Tốc Độ Cao (TypeScript Core Logic), 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)) - *192 dòng*
- **03-state-management.md**: 🗄️ State Management - useVCRTimelineStore (Pinia Vue 3) (Nội dung chính: 1. Cấu trúc Giao diện Mã Store (`useVCRTimelineStore.ts`), 2. Ưu điểm Vượt trội của Thiết kế Đồ họa Reactive Pinia Store) - *173 dòng*
- **TECHNICAL_SPEC.md**: 🛠 Technical Specification - VCR Playback Engine & High-Res Scheduler (Nội dung chính: 1. Trình Lập Lịch Xung Nhịp Độ Phân Giải Cao (VCRPlaybackEngine TS), 2. Thuật toán Caching Snapshot và Tái thiết lập Trạng thái (State Reconciliation), 3. Công thức định vị chỉ số thanh trượt Scrubber (Scrubber Math)) - *137 dòng*
- **API_REFERENCE.md**: 🔌 VCR Playback API Specifications & JSON Schemas (Phase 2) (Nội dung chính: 1. Bản đặc tả JSON Schema Cấu hình Playback Frames (PlaybackFrame Schema), 2. Mô hình tiếp nhận DTO C# ở Backend ASP.NET Core (.NET Core), 3. Bản Đặc tả Endpoint API Tải Phim Giải Thuật (VCR Playback API)) - *120 dòng*
- **README.md**: 📼 BỘ ĐIỀU HƯỚNG VCR & DÒNG THỜI GIAN GIẢI THUẬT (TIMELINE PLAYBACK VCR) (Nội dung chính: 📝 TÀI LIỆU KHẢO SÁT & THIẾT KẾ CHI TIẾT (PHASE 2), 📌 BẢN ĐỒ MỤC LỤC, 1. TẦM NHÌN DÒNG THỜI GIAN & BỘ PHÁT LẠI VCR (PRD)) - *118 dòng*
- **02-ui-ux.md**: 🎨 UI & UX Specifications - VCR Panels & Neon Progress Tracks (Nội dung chính: 1. Cụm Phím Điều Hướng VCR Kính Mờ (VCR Panel UI), 2. Thanh trượt Scrubber Neon và Indicator Quét (Scrubber UI)) - *105 dòng*
- **04-infrastructure.md**: ⚙️ Infrastructure & Monaco Line Syncer Coordinator (Phase 2) (Nội dung chính: 1. Bộ Máy Đồng Bộ Monaco Editor (MonacoLineSyncerCoordinator), 2. Giải pháp tháo dỡ RAM & GC Memory Leak Prevent) - *68 dòng*
- **plan.md**: 📅 Implementation Plan - VCR Timeline Playback (Phase 2) (Nội dung chính: 📌 BẢN ĐỒ LỘ TRÌNH PHÁT TRIỂN, 🛠 CHI TIẾT CÁC BƯỚC THỰC HIỆN, 🎯 TIÊU CHÍ HOÀN THÀNH (DEFINITION OF DONE - DoD)) - *55 dòng*
- **UX_FLOW.md**: 🌊 UX Flow & VCR Debugger Interaction Walkthroughs (Nội dung chính: 📌 KỊCH BẢN 1: KÉO MIẾT THANH TRƯỢT SCRUBBER CHUYỂN BƯỚC (SCRUBBER SEEKING), 📌 KỊCH BẢN 2: PHÁT TỰ ĐỘNG TỐC ĐỘ 1.5X ĐỒNG BỘ DÒNG LỆNH (AUTOPLAY LOOP)) - *50 dòng*
- **PRD.md**: 🚀 Product Requirements Document (PRD) - VCR Timeline & Playback (Phase 2) (Nội dung chính: 1. Tổng quan Nghiệp vụ (Overview), 2. Mục tiêu Nghiệp vụ (Goals), 3. Các Tính năng trong Phạm vi MVP (Phase 2 MVP Scope)) - *38 dòng*
- *...và 2 file khác.*

### 📂 Thư mục: plan\features\master-design (6 files)
- **phase1-dsa-library.md**: 📚 Core DSA Library Visualizer & Tree/Graph Rotation Math (Phase 1) (Nội dung chính: 1. Phân phối Tọa độ và Xoay Cây AVL Tự Cân bằng (Tree Rotations Spec), 2. Tìm Đường Đồ Thị Dijkstra & Vẽ Luồng Hạt Neon (Graph Layout Math), 3. Ca Kiểm Thử Tự Động Thư Viện Thuật Toán (Unit Test Specs)) - *202 dòng*
- **phase1-core-engine.md**: 🧠 Core Animation Engine & Compiler Step Executor Design (Phase 1) (Nội dung chính: 1. Động Cơ Hoạt Ảnh Đồng Bộ Nhịp FPS (Core Animation Engine), 2. Trình Biên Dịch Mã Nguồn Lập Lịch Bước (Compiler Step Executor), 3. Ca Kiểm Thử Tự Động Xác Thực Động Cơ (Unit Test Specs)) - *172 dòng*
- **phase1-ux-platform.md**: 🎨 Glassmorphic Design System & Premium Monaco Shell Shell (Phase 1) (Nội dung chính: 1. Ngôn ngữ Thiết kế và Token Giao diện (Glassmorphic Design Tokens), 2. Trình Soạn Thảo Monaco Editor Tương tác (Monaco Editor Integration Spec), 3. Động cơ Phản hồi Âm thanh Vật lý Trễ cực thấp (Acoustic Feedback Engine)) - *160 dòng*
- **phase1-learning-system.md**: 🎓 Interactive Lecture Mode & Dynamic Quiz Scoring (Phase 1) (Nội dung chính: 1. Đồng bộ Trực quan Bài giảng và Hoạt ảnh DSA (Lecture Animations Sync), 2. Động cơ Chấm Điểm Trắc nghiệm và Code Thực hành (Quiz Scoring Engine), 3. Ca Kiểm Thử Tự Động Đánh Giá Học Tập (Unit Test Specs)) - *145 dòng*
- **phase2-advanced-cs-concepts.md**: 🚀 Advanced CS Concepts & SOLID LCOM4 Mathematics Design (Phase 2) (Nội dung chính: 1. Bản thiết kế Phân hệ SOLID Principles Visualizer & LCOM4 Math, 2. Bản thiết kế Kiến trúc Trục quan hóa Đa phân hệ Phase 2, 3. Ca Kiểm Thử Tự Động Thuật Toán LCOM4 Cohesion (Unit Test Specs)) - *134 dòng*
- **README.md**: 🏛️ HỒ SƠ THIẾT KẾ CỐT LÕI HỆ THỐNG VISUALIZATIONDSA (MASTER DESIGN BLUEPRINT) (Nội dung chính: 📝 TRUNG TÂM QUẢN TRỊ KIẾN TRÚC & HƯỚNG DẪN THIẾT KẾ HỆ THỐNG, 📌 BẢN ĐỒ CHỈ MỤC THIẾT KẾ HẠT NHÂN (MASTER DESIGN INDEX), 🎨 HƯỚNG DẪN KIẾN TRÚC THIẾT KẾ THỐNG NHẤT (UNIFIED ARCHITECTURE RULES)) - *61 dòng*

### 📂 Thư mục: plan\features\sprint-1 (2 files)
- **phase1-engine-setup.md**: ⚙️ Technical Specification - Core Animation Engine & AST Compiler Setup (Sprint 1) (Nội dung chính: 1. Thiết kế Bộ Lập Lịch Xung Hoạt Ảnh (CoreAnimationEngine TypeScript), 2. Thiết kế Bộ Phân Tích Mã Cú Pháp AST (CompilerStepExecutor Spec), 3. Các ca Unit Tests Kiểm Thử Hạt Nhân (Unit Test Specs)) - *168 dòng*
- **feature-plan.md**: 🗺️ LỘ TRÌNH 12 SPRINT VÀ CHI TIẾT SPRINT 1 - CORE ENGINE SETUP (Nội dung chính: 📝 TÀI LIỆU KẾ HOẠCH TRIỂN KHAI VÀ PHÂN CHIA TÍNH NĂNG (SPRINT 1 MASTER PLAN), 📌 BẢNG LỘ TRÌNH 12 SPRINT PHÁT TRIỂN (MASTER ROADMAP), 🛠 SPRINT 1: CORE ENGINE & ANIMATION COMPILER SETUP) - *46 dòng*

### 📂 Thư mục: plan\features\sprint-10 (2 files)
- **phase2-state-inspector-and-dsl.md**: ⚙️ Technical Specification - State Inspector Stack-Heap & DSL Engine (Sprint 10) (Nội dung chính: 1. Trình Giám Sát Call Stack & Pointer Bezier SVG (StateInspectorEngine TS), 2. Động Cơ Biên Dịch Lệnh DSL Tùy Biến (DSLEngine TS), 3. Ca Kiểm Thử Tự Động State Inspector & DSL (Unit Test Specs)) - *159 dòng*
- **feature-plan.md**: 🗺️ Sprint 10 Feature Plan - State Inspector Stack-Heap & Custom DSL Compiler (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\features\sprint-11 (2 files)
- **phase2-real-world-systems.md**: ⚙️ Technical Specification - System Design & Failover Smoke (Sprint 11) (Nội dung chính: 1. Trình Điều Phối Phân Phối Tải & Trễ Đồng Bộ (SystemDesignEngine TS), 2. Máy Phun Hạt Bụi Khói Khi Sập Máy Chủ (FailureSmokeEmitterEngine TS), 3. Ca Kiểm Thử Tự Động Kiến Trúc Hệ Thống (Unit Test Specs)) - *169 dòng*
- **feature-plan.md**: 🗺️ Sprint 11 Feature Plan - System Design Network Simulator & Failover Smoke (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\features\sprint-12 (2 files)
- **phase2-gamification-and-export.md**: ⚙️ Technical Specification - Gamification Rewards & Embed Widget (Sprint 12) (Nội dung chính: 1. Trình Sinh Chuỗi Mã Nhúng Iframe Tùy Biến (EmbeddingWidgetGenerator TS), 2. Hệ Thống Tính Điểm XP Thăng Cấp Thành Tích (GamificationRewardEngine TS), 3. Ca Kiểm Thử Tự Động Xuất Bản & Thăng Hạng (Unit Test Specs)) - *142 dòng*
- **feature-plan.md**: 🗺️ Sprint 12 Feature Plan - Gamification Rewards & Embed Widget Generator (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\features\sprint-2 (2 files)
- **phase1-basic-dsa.md**: ⚙️ Technical Specification - Basic DSA Array & Sorting (Sprint 2) (Nội dung chính: 1. Thuật toán Hoán vị Mảng Lerp Mượt mà (Array Swap Math), 2. Trình Biên Dịch Hoạt Ảnh Sắp Xếp Bubble/Quick Sort (Frame Generators), 3. Ca Kiểm Thử Tự Động Giải Thuật (Unit Test Specs)) - *169 dòng*
- **feature-plan.md**: 🗺️ Sprint 2 Feature Plan - Basic DSA Array & Sorting Visualizers (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\features\sprint-3 (2 files)
- **phase1-pseudocode-sync.md**: ⚙️ Technical Specification - Pseudocode Synchronization & Monaco Hooks (Sprint 3) (Nội dung chính: 1. Trình Đồng Bộ Hai Chiều Code & Giải Thuật (PseudocodeSyncer TypeScript), 2. Tương tác Nhấp chọn Dòng lệnh Nhảy Bước (Gutter Click Interceptor), 3. Ca Kiểm Thử Tự Động Đồng Bộ Hai Chiều (Unit Test Specs)) - *154 dòng*
- **feature-plan.md**: 🗺️ Sprint 3 Feature Plan - Pseudocode Synchronization & Code Tracking (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *30 dòng*

### 📂 Thư mục: plan\features\sprint-4 (2 files)
- **phase1-quiz-and-lecture.md**: ⚙️ Technical Specification - Interactive Quiz & Lecture System (Sprint 4) (Nội dung chính: 1. Bộ Điều Phối Bài Giảng Slide & Giải Thuật (LecturePlaybackCoordinator TS), 2. Động Cơ Chấm Điểm Trắc Nghiệm & Kiểm Tra Code (QuizEvaluationEngine TS), 3. Ca Kiểm Thử Tự Động Đánh Giá Học Tập (Unit Test Specs)) - *155 dòng*
- **feature-plan.md**: 🗺️ Sprint 4 Feature Plan - Interactive Quiz & Lecture System (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\features\sprint-5 (2 files)
- **phase1-playground-and-custom-input.md**: ⚙️ Technical Specification - Interactive Playground & Custom Input (Sprint 5) (Nội dung chính: 1. Trình Phân Tích Dữ Liệu Tùy Biến (CustomInputParser TypeScript), 2. Động Cơ Vẽ Đồ Thị Tương Tác (InteractivePlaygroundEngine TS), 3. Ca Kiểm Thử Tự Động Phân Tích & Vẽ Nút (Unit Test Specs)) - *185 dòng*
- **feature-plan.md**: 🗺️ Sprint 5 Feature Plan - Interactive Playground & Custom Input (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\features\sprint-6 (2 files)
- **phase2-oop-concept.md**: ⚙️ Technical Specification - OOP Concepts & VTable Dispatch (Sprint 6) (Nội dung chính: 1. Trình Mô Phỏng Phản Xạ Lớp OOP (OOPReflectionEngine TypeScript), 2. Bảng Định Tuyến Phương Thức Ảo Đa Hình (VirtualMethodTable TS), 3. Ca Kiểm Thử Tự Động Phản Xạ & Đa Hình (Unit Test Specs)) - *192 dòng*
- **feature-plan.md**: 🗺️ Sprint 6 Feature Plan - OOP Concepts Visualizer & VTable Sandboxing (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\features\sprint-7 (2 files)
- **phase2-solid-principles.md**: ⚙️ Technical Specification - SOLID Principles & LCOM4 Mathematics (Sprint 7) (Nội dung chính: 1. Thuật toán Tính toán Chỉ số Kết dính Lớp LCOM4 (SRP Cohesion Spec), 2. Bộ Kiểm Tra Quy Tắc Thay Thế Liskov (LiskovSubstitutionGuard TS), 3. Ca Kiểm Thử Tự Động Thiết Kế SOLID (Unit Test Specs)) - *159 dòng*
- **feature-plan.md**: 🗺️ Sprint 7 Feature Plan - SOLID Principles Dynamic Visualizer & LCOM4 Linter (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\features\sprint-8 (2 files)
- **phase2-di-ioc.md**: ⚙️ Technical Specification - Dependency Injection & IoC Container (Sprint 8) (Nội dung chính: 1. Thùng Chứa Đăng Ký & Phân Giải Dịch Vụ (DIContainer TypeScript), 2. Ca Kiểm Thử Tự Động Thùng Chứa IoC (Unit Test Specs)) - *177 dòng*
- **feature-plan.md**: 🗺️ Sprint 8 Feature Plan - Dependency Injection & IoC Container Visualizer (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\features\sprint-9 (2 files)
- **phase2-design-patterns.md**: ⚙️ Technical Specification - Design Patterns & Observer Simulator (Sprint 9) (Nội dung chính: 1. Trình Mô Phỏng Mẫu Thiết Kế Observer (ObserverPatternSimulator TS), 2. Ca Kiểm Thử Tự Động Mẫu Thiết Kế Observer (Unit Test Specs)) - *157 dòng*
- **feature-plan.md**: 🗺️ Sprint 9 Feature Plan - Design Patterns Interactive Visualizer (Nội dung chính: 1. Mục tiêu Sprint (Sprint Goal), 2. Danh sách công việc (Task Backlog), 3. Tiêu chí nghiệm thu (DoD)) - *28 dòng*

### 📂 Thư mục: plan\reports (26 files)
- **phase1-summary-report.md**: phase1-summary-report.md - *0 dòng*
- **phase2-summary-report.md**: phase2-summary-report.md - *0 dòng*
- **sprint-1-report.md**: sprint-1-report.md - *0 dòng*
- **sprint-10-report.md**: sprint-10-report.md - *0 dòng*
- **sprint-11-report.md**: sprint-11-report.md - *0 dòng*
- **sprint-12-report.md**: sprint-12-report.md - *0 dòng*
- **sprint-2-report.md**: sprint-2-report.md - *0 dòng*
- **sprint-3-report.md**: sprint-3-report.md - *0 dòng*
- **sprint-4-report.md**: sprint-4-report.md - *0 dòng*
- **sprint-5-report.md**: sprint-5-report.md - *0 dòng*
- *...và 16 file khác.*

### 📂 Thư mục: plan\tracking (9 files)
- **testing.md**: 🧪 Hướng Dẫn Thực Thi Kiểm Thử Tự Động - Vitest Test Execution Manual (Nội dung chính: 1. Các Lệnh Khởi Chạy Kiểm Thử (Test Execution Commands), 2. Bản Đồ Thư Mục Viết Kiểm Thử (Testing Files Map), 3. Đọc Kết Quả Kiểm Thử (Interpreting Test Results)) - *70 dòng*
- **test-plan.md**: 🎯 Kế Hoạch Kiểm Thử Toàn Diện - Visualizations Testing Strategy (Nội dung chính: 1. Chiến Lược Kiểm Thử (Testing Strategy), 2. Thiết Lập Môi Trường Chạy Kiểm Thử (Test Environment Setup), 3. Quy Trình Tích Hợp Liên Tục (Automated CI Pipeline)) - *45 dòng*
- **features-tested.md**: 🧪 Danh Sách Tính Năng Đã Kiểm Thử - Features Verified & Test Suite Status (Nội dung chính: 📌 Trạng Thái Bao Phủ Kiểm Thử (Test Coverage Status), 📋 Danh Sách 23 Tính Năng Đã Kiểm Thử Hoàn Hảo (Verified Features Log)) - *44 dòng*
- **dependencies.md**: 📦 Quản Lý Phụ Thuộc Hệ Thống - Dependency Management Map (Nội dung chính: 1. Bản Đồ Công Nghệ Lõi (Core Technology Stack), 2. Gói Phụ Thuộc Frontend (Frontend Dependencies), 3. Gói Phụ Thuộc Phát Triển & Kiểm Thử (DevDependencies)) - *42 dòng*
- **errors.md**: ⚠️ Nhật Ký Lỗi Và Sự Cố Thường Gặp - Error Codes & Failover Scenarios (Nội dung chính: 1. Danh Mục Mã Lỗi & Cách Xử Lý (Error Directory), 2. Kịch Bản Tự Phục Hồi Khi Gặp Sự Cố (Failover Scenarios)) - *41 dòng*
- **decisions.md**: 🏛️ Nhật Ký Quyết Định Kiến Trúc - Architectural Decision Records (ADR) (Nội dung chính: 1. ADR-01: Kiến Trúc Biên Dịch Tĩnh Client-Side First (AST Compilation under 5ms), 2. ADR-02: Đồng Bộ Hoạt Ảnh Xung requestAnimationFrame (rAF 60 FPS Engine), 3. ADR-03: Tính Toán Kết Dính LCOM4 Bằng Thuật Toán BFS Đồ Thị) - *38 dòng*
- **progress.md**: 📈 Báo Cáo Tiến Độ Dự Án - Development Progress Tracking Log (Nội dung chính: 1. Trạng Thái Tổng Thể (Overall Project Health), 2. Nhật Ký Tiến Độ Theo Sprint (Sprint Progress Log), 3. Các Cột Mốc Quan Trọng Đạt Được (Key Milestones)) - *38 dòng*
- **comparison-quenti.md**: 📊 So Sánh Hiệu Năng Hoạt Ảnh & Giải Thuật - Benchmarking & Metrics Analysis (Nội dung chính: 1. So Sánh Hiệu Năng Dựng Hoạt Ảnh (Rendering Performance Benchmark), 2. So Sánh Hiệu Năng Giải Thuật Sắp Xếp (DSA Sorting Benchmarks), 3. Khảo Sát Thải Rác Vùng Nhớ (GC Memory Footprint Cycles)) - *34 dòng*
- **session-notes.md**: 📝 Nhật Ký Phiên Làm Việc - Session Notes & Architect Recommendations (Nội dung chính: 1. Nhật Ký Phiên Làm Việc (Session Achievements), 2. Khuyến Nghị Kiến Trúc Thực Thi Vue 3 (Architect Recommendations)) - *21 dòng*

### 📂 Thư mục: skills\backend (3 files)
- **algorithm-logic.md**: 🧠 Algorithm Logic Specialist (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc (Guiding Principles)) - *105 dòng*
- **api-design.md**: 🔌 API Designer (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc (Guiding Principles)) - *78 dòng*
- **dotnet-core-specialist.md**: 🧱 .NET Core Specialist (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc (Guiding Principles)) - *73 dòng*

### 📂 Thư mục: skills\core (2 files)
- **feature-builder.md**: 🛠️ Fullstack Feature Builder (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc (Guiding Principles)) - *104 dòng*
- **project-architect.md**: 🏗️ Project Architect (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc (Guiding Principles)) - *75 dòng*

### 📂 Thư mục: skills\frontend (4 files)
- **abstract-concept-ui-specialist.md**: 🧩 Abstract Concept UI Specialist (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc (Guiding Principles)) - *125 dòng*
- **vue-state-management.md**: 🗄️ Vue State Manager (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), ⚙️ Kỹ năng chuyên môn) - *88 dòng*
- **ui-component-builder.md**: 🎨 UI Component Builder (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), ⚙️ Kỹ năng chuyên môn) - *77 dòng*
- **dsa-ui-specialist.md**: 📐 DSA UI Specialist (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), ⚙️ Kỹ năng chuyên môn) - *63 dòng*

### 📂 Thư mục: skills\product (3 files)
- **instructional-designer.md**: 📚 Instructional Designer (Kỹ sư sư phạm) (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc) - *57 dòng*
- **product-owner.md**: 🎯 Product Owner (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc) - *43 dòng*
- **sprint-management.md**: ⏱️ Sprint Manager (Scrum Master) (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc) - *42 dòng*

### 📂 Thư mục: skills\quality (2 files)
- **bug-fixer.md**: 🐛 Bug Fixer (Debugging Specialist) (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc) - *88 dòng*
- **qa-strategist.md**: 🎯 QA Strategist & Automation Engineer (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc) - *78 dòng*

### 📂 Thư mục: skills\visualization (3 files)
- **graph-drawing-tool.md**: 🕸️ Graph Drawing Tool (Interactive Input Specialist) (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc) - *111 dòng*
- **animation-timeline-manager.md**: 🎞️ Animation Timeline Manager (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc) - *105 dòng*
- **canvas-rendering-engine.md**: 🖼️ Canvas Rendering Engine Core (Nội dung chính: 🎯 Mục tiêu vai trò (Role Objective), 🛠 Trách nhiệm cốt lõi (Core Responsibilities), 📜 Nguyên tắc làm việc) - *90 dòng*