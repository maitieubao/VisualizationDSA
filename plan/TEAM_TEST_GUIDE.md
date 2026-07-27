# TEAM_TEST_GUIDE.md (Hướng Dẫn Kiểm Thử Nền Tảng 6 Trụ Cột)

## Mục 6: Xử Lý Sự Cố Thường Gặp

Dưới đây là bản tổng hợp tất cả các sự cố, nguyên nhân gốc và giải pháp chuẩn đã được kiểm chứng trên cả Docker Compose và môi trường dev cục bộ:

### 🚨 Bảng Xử Lý Sự Cố Nền Tảng 6 Trụ Cột

| STT | Triệu chứng phát sinh | Nguyên nhân gốc (Root Cause) | Giải pháp chuẩn | Trụ cột liên quan |
|---|---|---|---|---|
| **1** | `docker-compose up` lỗi **port 5432 đã được sử dụng** | Dịch vụ PostgreSQL local đang chạy trên host chiếm cổng | `sudo systemctl stop postgresql` (Linux) hoặc đổi cổng trong `docker-compose.yml` → `5433:5432` | #1 Infra |
| **2** | Backend log **`connection refused`** khi khởi động | Container `vdsa-database` chưa sẵn sàng nhận kết nối khi backend start (race condition) | Đợi healthcheck PostgreSQL pass → restart backend: `docker-compose restart backend` | #1 Infra |
| **3** | Lệnh `dotnet ef` báo **`libhostfxr not found`** | Biến môi trường `DOTNET_ROOT` chưa được export vào shell | `export DOTNET_ROOT=$HOME/.dotnet` (thêm vào `~/.bashrc` / `~/.zshrc`) | #5 Build |
| **4** | `npx vue-tsc --noEmit` báo **`Cannot find module 'xxx'`** | Thư mục `node_modules` bị thiếu hoặc bị hỏng sau git pull | `cd frontend && rm -rf node_modules package-lock.json && npm install` | #5 Build |
| **5** | Endpoint trả **HTTP 500** thay vì 200 OK | Migration EF Core chưa được chạy lên DB schema | Restart backend container (tự chạy `Migrate()` ở `Program.cs`) hoặc chạy thủ công: `dotnet ef database update` | #5 Graph RAG / #6 Event Sourcing |
| **6** | **Audit frames không xuất hiện** trong `SystemAuditEventStreams` | Action filter / `ImmutableAuditInterceptor` bị lỗi khi chặn request → không ghi frame | Kiểm tra log Serilog → tìm cảnh báo `Không thể ghi audit event frame` → xác nhận DI đã đăng ký `IAuditEventService` | #6 Event Sourcing |
| **7** | Frontend console báo **`Failed to fetch`** (CORS error) | Thiếu biến `ASPNETCORE_ENVIRONMENT=Development` → CORS policy không whitelist `localhost:5173` | Khởi động backend với: `ASPNETCORE_ENVIRONMENT=Development dotnet run` | #2 WebGPU / #3 WASM |
| **8** | Port **5173 / 5050 bị chiếm** bởi process cũ | .NET / Vite process trước đó chưa được kill sạch | `lsof -i :5173 && kill -9 <PID>` hoặc `fuser -k 5050/tcp` | #1 Infra |
| **9** | WebGPU **không active** (badge không hiện) | Trình duyệt / driver card đồ họa không hỗ trợ WebGPU hoặc flag chưa bật | Dùng Chrome ≥ 113 / Edge ≥ 113 → truy cập `chrome://flags/#enable-unsafe-webgpu` → Enable | #2 WebGPU |
| **10** | **Packets flash tức thời** (không di chuyển mượt) trong System Design | `deltaTime` normalization bị vỡ → `PACKET_SPEED=0.05` không được chia đúng frame time | Kiểm tra `Ticker.ts` → đảm bảo `dt` luôn được tính bằng `performance.now()` delta, không dùng cố định | #3 WASM Compute |
| **11** | CRDT **không đồng bộ** giữa 2 tab | Yjs provider chưa kết nối đúng signaling channel hoặc WebSocket bị chặn | Mở DevTools → Network → WS → kiểm tra message `sync` được trao đổi; xác nhận `Y.Doc` đã `.getMap()` chung key | #4 CRDT Graph |
| **12** | `dotnet build` có **nullable warnings (CS8618)** | Preexisting trong code cũ — **không phải lỗi mới** của trụ 5 & 6 | Chỉ cần đảm bảo **code mới của Graph RAG + Event Sourcing không tạo thêm warning** nào | #5 Build |
| **13** | `SemanticGraph` trả về **rỗng (0 node)** | Seed data `SemanticConceptNodes` chưa được insert vào DB | Kiểm tra `DbContext.Seed()` chạy ở startup → query SQL: `SELECT count(*) FROM "SemanticConceptNodes"` | #5 Graph RAG |
| **14** | **403 Forbidden** khi gọi `award-xp` | JWT token hết hạn hoặc role không đủ quyền | Gọi `/auth/refresh` để lấy token mới; xác nhận claim `role` trong JWT là `Student` / `Teacher` | #6 Event Sourcing |
| **15** | Docker build **thời gian rất dài** (>10 phút) | Layer cache bị vô hiệu hóa do thay đổi `*.csproj` thường xuyên | Tách `dotnet restore` thành layer riêng trong `Dockerfile` (trước khi copy toàn bộ source) | #1 Infra |

### ✅ Quy trình xử lý sự cố chuẩn (3 bước)

Khi gặp bất kỳ lỗi nào, **bắt buộc** thực hiện theo thứ tự:

1. **Bước 1 — Kiểm tra log cụ thể**:
   - Backend: `docker logs vdsa-backend --tail 100` hoặc `Serilog_YYYYMMDD.log`
   - Frontend: DevTools → Console + Network tab
   - DB: `docker logs vdsa-database`

2. **Bước 2 — Đối chiếu với bảng trên**: Tìm hàng có triệu chứng trùng khớp → áp dụng giải pháp.

3. **Bước 3 — Smoke test lại sau fix**:
   - `curl http://localhost:5055/api/v1/diagnostics/health` → phải trả `success: true`
   - Mở `http://localhost:5173` → xác nhận 6 badge trụ cột đều hiện ✅

### 📌 Các lỗi "chẩn đoán khó" cần lưu ý đặc biệt

| Lỗi ẩn | Cách nhận biết sớm |
|---|---|
| **EF Core Migration bị kẹt** | Backend start được nhưng mọi endpoint trả 500 → log có `relation "xxx" does not exist` |
| **JWT không chứa role claim** | Đăng nhập được nhưng mọi API `[RequireJwtRole]` đều 403 → decode token tại jwt.io |
| **Serilog không ghi file** | Thư mục `logs/` không tồn tại hoặc không có quyền ghi → kiểm tra `Directory.CreateDirectory()` |
| **Event Sourcing ghi trùng frame** | `Sequence` bị trùng do `DateTime.UtcNow.Ticks` độ phân giải thấp → cần thêm `Interlocked.Increment` |
