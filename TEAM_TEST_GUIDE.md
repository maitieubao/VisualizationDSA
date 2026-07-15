# Hướng Dẫn Kiểm Thử Nền Tảng 6 Trụ Cột — VisualizationDSA

> **Đối tượng:** Đồng đội kỹ thuật (Developer, QA, DevOps).
> **Phiên bản:** 2026-06-06 — bao gồm 6 trụ cột kỹ thuật nâng cao.

---

## Mục Lục

1. [Khởi Chạy Toàn Hệ Thống (1-Click)](#1-khởi-chạy-toàn-hệ-thống-1-click)
2. [Kiểm Tra Trụ Cột 5 — Graph RAG Backend](#2-kiểm-tra-trụ-cột-5--graph-rag-backend)
3. [Kiểm Tra Trụ Cột 6 — Event Sourcing Ledger](#3-kiểm-tra-trụ-cột-6--event-sourcing-ledger)
4. [Tổng Quan 6 Trụ Cột Kỹ Thuật](#4-tổng-quan-6-trụ-cột-kỹ-thuật)
5. [Xây Dựng & Biên Dịch (Build Verification)](#5-xây-dựng--biên-dịch-build-verification)
6. [Xử Lý Sự Cố Thường Gặp](#6-xử-lý-sự-cố-thường-gặp)

---

## 1. Khởi Chạy Toàn Hệ Thống (1-Click)

### Cách A: Docker Compose (Khuyến nghị — không cần cài .NET / Node trên máy)

```bash
# Từ thư mục gốc dự án:
docker-compose up --build
```

Hệ thống sẽ khởi động 3 container:

| Container       | Cổng          | Mô tả                     |
|-----------------|---------------|----------------------------|
| `vdsa-database` | `localhost:5432` | PostgreSQL 15 Alpine       |
| `vdsa-backend`  | `localhost:5055` | .NET 9 WebAPI              |
| `vdsa-frontend` | `localhost:5173` | Vue 3 (nginx static)       |

- Backend tự động chạy `Database.Migrate()` + seed dữ liệu mẫu khi khởi động.
- Frontend kết nối API qua `http://localhost:5055`.

### Cách B: Script 1-Click (phát triển nội bộ — cần .NET SDK 9 + Node.js)

**Linux / macOS:**
```bash
chmod +x run-project.sh
./run-project.sh
```

**Windows:**
```cmd
run-project.bat
```

Script khởi động đồng thời Backend (cổng 5055) và Frontend Vite dev server (cổng 5173).

> **Lưu ý:** Cách B yêu cầu PostgreSQL đang chạy tại `127.0.0.1:5432` với
> database `visualization_dsa_dev`, user `postgres`, password `postgres`.
> Cách nhanh nhất: `docker run -d --name vdsa-db -e POSTGRES_DB=visualization_dsa_dev -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15-alpine`

---

## 2. Kiểm Tra Trụ Cột 5 — Graph RAG Backend

Endpoint chính: `GET /api/v1/concepts/analytics/semantic-graph`

### 2.1. Kiểm tra bằng `curl`

```bash
# Truy vấn toàn bộ đồ thị tri thức:
curl -s http://localhost:5055/api/v1/concepts/analytics/semantic-graph | python3 -m json.tool
```

**Kết quả mong đợi (HTTP 200):**
```json
{
    "nodes": [
        {
            "id": "...",
            "conceptKey": "oop.encapsulation",
            "title": "Encapsulation",
            "category": "OOP",
            "description": "...",
            "importance": 0.9,
            "degree": 1,
            "embedding": [0.1, 0.2, 0.3]
        }
    ],
    "edges": [
        {
            "id": "...",
            "sourceNodeId": "...",
            "targetNodeId": "...",
            "relationType": "DependsOn",
            "weight": 1.5
        }
    ],
    "stats": {
        "nodeCount": 2,
        "edgeCount": 1,
        "graphDensity": 0.5,
        "categoryCount": 2
    },
    "generatedAt": "2026-06-06T..."
}
```

### 2.2. Lọc theo danh mục (Category Filter)

```bash
# Chỉ lấy các khái niệm OOP — đồ thị con cảm ứng (induced subgraph):
curl -s "http://localhost:5055/api/v1/concepts/analytics/semantic-graph?category=OOP" | python3 -m json.tool
```

**Kỳ vọng:** Chỉ trả về node OOP; các edge nối sang category khác sẽ bị loại
(vì induced subgraph chỉ giữ cạnh giữa các node trong tập kết quả).

### 2.3. Kiểm tra bằng Postman

1. Mở Postman → **New Request** → chọn **GET**.
2. URL: `http://localhost:5055/api/v1/concepts/analytics/semantic-graph`
3. Params (tùy chọn): thêm key `category`, value `OOP` hoặc `SOLID`.
4. Bấm **Send** → xác nhận HTTP **200 OK** và JSON trả về chứa `nodes`, `edges`, `stats`.

### 2.4. Kiểm tra trực tiếp trong cơ sở dữ liệu

```bash
# Kết nối PostgreSQL:
docker exec -it vdsa-database psql -U postgres -d visualization_dsa

# Hoặc nếu dùng Cách B (database dev):
docker exec -it vdsa-db psql -U postgres -d visualization_dsa_dev
```

```sql
-- Xem tất cả concept nodes:
SELECT "Id", "ConceptKey", "Title", "Category", "Importance"
FROM "SemanticConceptNodes"
ORDER BY "Importance" DESC;

-- Xem tất cả cạnh tri thức có hướng:
SELECT e."RelationType", e."Weight",
       src."ConceptKey" AS "Source", tgt."ConceptKey" AS "Target"
FROM "KnowledgeEdges" e
JOIN "SemanticConceptNodes" src ON src."Id" = e."SourceNodeId"
JOIN "SemanticConceptNodes" tgt ON tgt."Id" = e."TargetNodeId";
```

---

## 3. Kiểm Tra Trụ Cột 6 — Event Sourcing Ledger

Mỗi khi người dùng gọi bất kỳ API endpoint nào, hệ thống tự động ghi một
**frame sự kiện bất biến (immutable)** vào bảng `SystemAuditEventStreams`.

### 3.1. Tạo tương tác thử nghiệm

```bash
# Gửi 3 request liên tiếp:
curl -s http://localhost:5055/api/v1/concepts/analytics/semantic-graph > /dev/null
curl -s "http://localhost:5055/api/v1/concepts/analytics/semantic-graph?category=OOP" > /dev/null
curl -s http://localhost:5055/api/v1/concepts/analytics/semantic-graph > /dev/null
echo "Đã gửi 3 request thử nghiệm."
```

### 3.2. Xác thực các frame audit đã ghi trong PostgreSQL

```bash
# Kết nối:
docker exec -it vdsa-database psql -U postgres -d visualization_dsa
# (hoặc vdsa-db / visualization_dsa_dev nếu Cách B)
```

```sql
-- Truy vấn 10 frame audit mới nhất:
SELECT "EventType",
       "HttpMethod",
       "Path",
       "StatusCode",
       "CorrelationId",
       "OccurredAt",
       "Payload"
FROM "SystemAuditEventStreams"
ORDER BY "Sequence" DESC
LIMIT 10;
```

**Kết quả mong đợi:** Mỗi lần gọi API → 1 dòng audit tương ứng với:
- `EventType` = `ApiInteraction:Concepts.GetSemanticGraph`
- `HttpMethod` = `GET`
- `Path` = `/api/v1/concepts/analytics/semantic-graph`
- `StatusCode` = `200`
- `Payload` chứa JSON route + query.

### 3.3. Chứng minh tính bất biến (Immutable)

Tính bất biến được bảo vệ bởi `ImmutableAuditInterceptor` ở tầng EF Core — mọi
thao tác `UPDATE` hoặc `DELETE` trên entity `SystemAuditEventStream` qua ứng dụng
đều bị chặn và ném ra `InvalidOperationException`.

**Kiểm chứng:**
- Ở cấp ứng dụng (EF Core): nếu code cố gắng `context.SystemAuditEventStreams.Remove(...)` rồi
  `SaveChanges()`, interceptor sẽ ném lỗi:
  > `"SystemAuditEventStream là append-only (immutable); không được phép UPDATE hoặc DELETE."`
- Ở cấp cơ sở dữ liệu: bản ghi vẫn có thể bị xóa bằng raw SQL (vì constraint nằm ở tầng ứng dụng,
  không phải DB trigger). Để bảo vệ cấp DB, có thể bổ sung PostgreSQL rule hoặc trigger.

**Kiểm tra nhanh bằng SQL:**
```sql
-- Đếm tổng số frame đã ghi (con số chỉ tăng, không giảm):
SELECT count(*) AS total_frames,
       min("OccurredAt") AS oldest,
       max("OccurredAt") AS newest
FROM "SystemAuditEventStreams";

-- Kiểm tra không có frame nào bị sửa (OccurredAt không đổi sau ghi):
SELECT * FROM "SystemAuditEventStreams"
WHERE "OccurredAt" > now()  -- Không có frame nào từ tương lai
ORDER BY "Sequence" DESC
LIMIT 5;
```

### 3.4. Phân tích time-series nâng cao

```sql
-- Thống kê số lượng tương tác theo loại sự kiện:
SELECT "EventType", count(*) AS total
FROM "SystemAuditEventStreams"
GROUP BY "EventType"
ORDER BY total DESC;

-- Timeline hoạt động theo phút (hữu ích cho giám sát realtime):
SELECT date_trunc('minute', "OccurredAt") AS time_bucket,
       count(*) AS interactions
FROM "SystemAuditEventStreams"
GROUP BY time_bucket
ORDER BY time_bucket DESC
LIMIT 20;

-- Lọc tương tác của 1 user cụ thể:
SELECT "EventType", "Path", "StatusCode", "OccurredAt"
FROM "SystemAuditEventStreams"
WHERE "UserId" = '<uuid-cần-tra>'
ORDER BY "Sequence" DESC
LIMIT 20;
```

---

## 4. Tổng Quan 6 Trụ Cột Kỹ Thuật

| # | Trụ Cột                                | Tầng      | Trạng Thái   | Cách Kiểm Tra Nhanh                              |
|---|----------------------------------------|-----------|-------------|---------------------------------------------------|
| 1 | Production Docker Compose              | Infra     | ✅ Tích hợp  | `docker-compose up --build`                       |
| 2 | WebGPU Rendering Pipeline              | Frontend  | ✅ Tích hợp  | Mở Dashboard → kiểm tra badge WebGPU              |
| 3 | WASM Compute Engine                    | Frontend  | ✅ Tích hợp  | Chạy thuật toán → xác nhận Web Worker hoạt động    |
| 4 | CRDT Collaborative Graph (Yjs)         | Frontend  | ✅ Tích hợp  | Mở 2 tab → chỉnh graph → đồng bộ CRDT            |
| 5 | Graph RAG Backend Layer                | Backend   | ✅ Tích hợp  | `curl .../semantic-graph` → xem Mục 2             |
| 6 | Event Sourcing Ledger                  | Backend   | ✅ Tích hợp  | SQL kiểm tra `SystemAuditEventStreams` → xem Mục 3 |

---

## 5. Xây Dựng & Biên Dịch (Build Verification)

### Backend (.NET 9)

```bash
cd backend
dotnet build src/WebApi/WebApi.csproj
```

**Kỳ vọng:** `Build succeeded` — 0 Error(s). Các cảnh báo nullable (CS8618)
là preexisting trong code cũ; code mới của trụ cột 5 & 6 không tạo thêm cảnh báo.

### Frontend (Vue 3 + TypeScript)

```bash
cd frontend
npx vue-tsc --noEmit
```

**Kỳ vọng:** Không có lỗi TypeScript. Toàn bộ workspace biên dịch sạch.

### Unit Tests

```bash
# Backend:
cd backend
dotnet test tests/VisualizationDSA.UnitTests/VisualizationDSA.UnitTests.csproj

# Frontend:
cd frontend
npm run test
```

---

## 6. Xử Lý Sự Cố Thường Gặp

| Triệu chứng                                       | Nguyên nhân                                | Giải pháp                                                     |
|----------------------------------------------------|--------------------------------------------|---------------------------------------------------------------|
| `docker-compose up` lỗi port 5432 đã dùng         | PostgreSQL local đang chạy                 | `sudo systemctl stop postgresql` hoặc đổi port trong compose  |
| Backend báo `connection refused` khi khởi động     | PostgreSQL chưa sẵn sàng                   | Đợi healthcheck → restart backend: `docker-compose restart backend` |
| `dotnet ef` báo `libhostfxr not found`             | Thiếu `DOTNET_ROOT`                        | `export DOTNET_ROOT=$HOME/.dotnet`                            |
| `vue-tsc` lỗi `Cannot find module`                | Thiếu node_modules                         | `cd frontend && npm install`                                  |
| Endpoint trả `500` thay vì `200`                   | Migration chưa chạy                        | Restart backend (tự chạy Migrate()) hoặc `dotnet ef database update` |
| Audit frames không xuất hiện                       | Action filter lỗi (không chặn request)     | Kiểm tra log Serilog: tìm cảnh báo `Không thể ghi audit event frame` |

---

> **Biên soạn bởi:** Devin AI — Phiên bản kiến trúc 6 trụ cột (2026-06-06).
