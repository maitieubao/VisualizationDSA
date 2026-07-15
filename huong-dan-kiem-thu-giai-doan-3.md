# 📋 Hướng Dẫn Kiểm Thử Giai Đoạn 5: Quiz System & Gamification Engine

> **Phiên bản:** 1.0 — Ngày tạo: 2026-06-05
>
> **Mục đích:** Hướng dẫn chi tiết cho đội ngũ kiểm thử thủ công xác nhận tính năng Quiz và Gamification hoạt động đúng end-to-end giữa frontend Vue 3 và backend .NET 9.0.

---

## 1. Chuẩn Bị Môi Trường

### 1.1 Yêu cầu hệ thống

- **Node.js** >= 18.x
- **.NET SDK** >= 9.0
- **Trình duyệt** Chrome/Edge mới nhất
- **Terminal** 2 tab riêng biệt (1 cho backend, 1 cho frontend)

### 1.2 Cài đặt dependencies

```bash
# Tab 1: Frontend
cd frontend
npm install

# Tab 2: Backend (không cần PostgreSQL — endpoint stateless)
cd backend/src/WebApi
dotnet restore
```

---

## 2. Khởi Động Server

### 2.1 Backend (.NET 9.0)

```bash
cd backend/src/WebApi
export ASPNETCORE_ENVIRONMENT=Development
dotnet run --urls "http://0.0.0.0:5050"
```

**Kiểm tra khởi động thành công:**

```bash
curl http://localhost:5055/api/v1/concepts/quiz/all
# Phải trả về JSON array chứa 6 quiz
```

> ⚠️ **QUAN TRỌNG:** Phải set `ASPNETCORE_ENVIRONMENT=Development` để CORS cho phép `localhost:5173` truy cập. Nếu thiếu, browser sẽ báo lỗi `Failed to fetch`.

### 2.2 Frontend (Vue 3 + Vite)

```bash
cd frontend
VITE_API_BASE_URL=http://localhost:5055 npx vite --host 0.0.0.0 --port 5173
```

Mở trình duyệt tại: `http://localhost:5173`

---

## 3. Kiểm Thử Quiz System

### 3.1 Kiểm tra API backend (curl)

#### 3.1.1 Lấy danh sách quiz

```bash
curl -s http://localhost:5055/api/v1/concepts/quiz/all | python3 -m json.tool
```

**Kỳ vọng:** Trả về 6 quiz với ID:
| ID | Chủ đề | Số câu | XP |
|---|---|---|---|
| `sorting-fundamentals` | sorting | 5 | 50 |
| `graph-traversal` | graph | 4 | 75 |
| `oop-pillars` | oop | 4 | 75 |
| `solid-principles` | solid | 5 | 100 |
| `design-patterns` | design-patterns | 4 | 100 |
| `di-container` | di | 4 | 100 |

#### 3.1.2 Lấy chi tiết quiz theo ID

```bash
curl -s http://localhost:5055/api/v1/concepts/quiz/sorting-fundamentals | python3 -m json.tool
```

**Kỳ vọng:** JSON chứa `title: "Cơ bản về Sắp xếp"`, `questions` array có 5 phần tử, mỗi phần tử có `text`, `options` (4 đáp án), `correctIndex`, và `explanation` bằng tiếng Việt.

#### 3.1.3 Lấy quiz theo chủ đề

```bash
curl -s http://localhost:5055/api/v1/concepts/quiz/topic/solid | python3 -m json.tool
```

**Kỳ vọng:** Trả về array chứa quiz `solid-principles`.

#### 3.1.4 Submit bài làm (đúng hết)

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"quizId":"sorting-fundamentals","answers":[2,2,1,0,2]}' | python3 -m json.tool
```

**Kỳ vọng:**
- `score: 5`, `maxScore: 5`, `passed: true`, `xpAwarded: 50`
- `questionResults`: 5 mục, tất cả `isCorrect: true`
- Mỗi mục có `explanation` bằng tiếng Việt

#### 3.1.5 Submit bài làm (sai 3 câu)

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"quizId":"sorting-fundamentals","answers":[0,0,0,0,2]}' | python3 -m json.tool
```

**Kỳ vọng:**
- `score: 1`, `maxScore: 5`, `passed: false`, `xpAwarded: 0`
- Chỉ câu cuối `isCorrect: true`

#### 3.1.6 Quiz không tồn tại

```bash
curl -s http://localhost:5055/api/v1/concepts/quiz/invalid-id | python3 -m json.tool
```

**Kỳ vọng:** HTTP 404 với `error: "QUIZ_NOT_FOUND"`.

---

### 3.2 Kiểm tra giao diện frontend

1. **Mở trang Quiz:** Điều hướng đến `http://localhost:5173/#/quiz`
2. **Xác nhận danh sách quiz:**
   - Phải thấy 6 thẻ quiz card
   - Mỗi thẻ hiển thị: tiêu đề tiếng Việt, difficulty badge (easy/medium/hard), XP reward, số câu hỏi
3. **Bắt đầu quiz:**
   - Click vào thẻ "Cơ bản về Sắp xếp"
   - Phải thấy câu hỏi đầu tiên: "Bubble Sort có độ phức tạp thời gian trung bình là gì?"
   - 4 đáp án A/B/C/D hiển thị rõ ràng
   - Progress hiển thị "1 / 5"
4. **Chọn đáp án:**
   - Click đáp án C (O(n²)) → đáp án được highlight màu accent
   - Click nút "Câu tiếp →" → chuyển sang câu 2, progress "2 / 5"
5. **Điều hướng:**
   - Nút "← Câu trước" quay lại câu 1 (đáp án C vẫn được chọn)
   - Nhấn "Câu tiếp →" liên tục đến câu 5/5
6. **Nộp bài:**
   - Tại câu cuối, nút "Nộp bài ✓" xuất hiện (thay vì "Câu tiếp →")
   - Nếu chưa trả lời hết → nút bị vô hiệu hóa (cursor-not-allowed)
   - Chọn đáp án cho tất cả câu → click "Nộp bài ✓"
7. **Kết quả:**
   - Hiển thị điểm X/5 với emoji (🎉 nếu đạt, 😔 nếu rớt)
   - Nếu đạt (≥70%): hiển thị "+50 XP"
   - Danh sách kết quả từng câu với ✓/✗ và giải thích tiếng Việt
   - Nút "Quay lại danh sách" và "Làm lại"
8. **Thoát quiz:**
   - Click "Thoát Quiz" (góc phải) → quay về danh sách quiz catalog

---

## 4. Kiểm Thử Gamification Engine

### 4.1 Kiểm tra API backend (curl)

#### 4.1.1 Lấy profile người dùng demo

```bash
curl -s http://localhost:5055/api/v1/concepts/gamification/profile | python3 -m json.tool
```

**Kỳ vọng:**
- `userId: "demo-user"`, `username: "VisualizationDSA Student"`
- `totalXp: 150`, `currentLevel: 2`, `levelName: "Explorer"`
- `streakDays: 3`
- `earnedBadges`: 1 badge (first-steps)
- `recentActivity`: 2 mục

#### 4.1.2 Cộng XP

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/gamification/award-xp \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"reason":"Hoàn thành bài quiz OOP"}' | python3 -m json.tool
```

**Kỳ vọng:**
- `totalXp: 250` (150 + 100)
- `currentLevel: 2`, `levelName: "Explorer"`
- `recentActivity[0]`: mục mới nhất có `description: "Hoàn thành bài quiz OOP"`

#### 4.1.3 Cộng XP đến mức mở badge mới

```bash
# Cộng thêm 200 XP → tổng = 450 → đạt ngưỡng sorting-wizard (300 XP)
curl -s -X POST http://localhost:5055/api/v1/concepts/gamification/award-xp \
  -H "Content-Type: application/json" \
  -d '{"amount":200,"reason":"Hoàn thành module Sorting"}' | python3 -m json.tool
```

**Kỳ vọng:**
- `totalXp: 450`
- `earnedBadges`: 2 badges (first-steps + sorting-wizard)

#### 4.1.4 Lấy danh sách badges

```bash
curl -s http://localhost:5055/api/v1/concepts/gamification/badges | python3 -m json.tool
```

**Kỳ vọng:** 8 badges, mỗi badge có `id`, `name`, `description` (tiếng Việt), `icon`, `color`, `earnedAt` (chuỗi rỗng nếu chưa đạt).

#### 4.1.5 Lấy bảng xếp hạng

```bash
curl -s http://localhost:5055/api/v1/concepts/gamification/leaderboard?limit=5 | python3 -m json.tool
```

**Kỳ vọng:** 5 entries, rank 1-5, mỗi entry có `username`, `totalXp`, `level`, `levelName`, `badgeCount`, `streakDays`.

#### 4.1.6 Lấy config gamification

```bash
curl -s http://localhost:5055/api/v1/concepts/gamification/config | python3 -m json.tool
```

**Kỳ vọng:** JSON có `levels` (8 cấp), `badges` (8 badges), `xpEvents` (4 loại).

#### 4.1.7 XP không hợp lệ

```bash
curl -s -X POST http://localhost:5055/api/v1/concepts/gamification/award-xp \
  -H "Content-Type: application/json" \
  -d '{"amount":0,"reason":"Invalid"}' | python3 -m json.tool
```

**Kỳ vọng:** HTTP 400 với `error: "INVALID_AMOUNT"`.

---

### 4.2 Kiểm tra giao diện frontend

1. **Mở trang Gamification:** Điều hướng đến `http://localhost:5173/#/gamification`
2. **Xác nhận dữ liệu từ backend:**
   - Header hiển thị XP từ server (150 XP ban đầu hoặc giá trị đã cộng)
   - Level + Level Name hiển thị (ví dụ: "Level 2 — Explorer")
   - Streak fire hiển thị 3 ngày
3. **Cộng XP qua nút demo:**
   - Click "+50 XP Demo"
   - XP tăng từ 150 → 200 (gọi API backend)
   - Progress bar cập nhật
4. **Bảng xếp hạng từ server:**
   - Section "Bảng xếp hạng (Server)" hiển thị 10 entries
   - Entry "VisualizationDSA Student" được highlight viền accent
   - Mỗi entry hiển thị: rank, username, level, levelName, XP, badge count
5. **Badges từ server:**
   - Section "Huy hiệu từ Server" hiển thị 8 badges
   - Badge đã đạt có nền xanh + label "Đạt"
   - Badge chưa đạt có opacity mờ
6. **Confetti:**
   - Khi cộng đủ XP để mở badge mới → hiệu ứng confetti xuất hiện 4 giây
7. **Streak Freeze:**
   - Nút "❄️ Freeze (2)" → click → giảm xuống "(1)" → click → "(0)" → vô hiệu hóa

---

## 5. Kiểm Thử Tích Hợp (Cross-Module)

### 5.1 Quiz → Gamification XP

1. Làm quiz "Cơ bản về Sắp xếp" tại `/#/quiz` → đạt (≥4/5)
2. Chuyển sang `/#/gamification` → xác nhận XP đã tăng (nếu cùng session backend)

### 5.2 Tất cả các route hoạt động

Kiểm tra lần lượt các URL sau không bị lỗi trắng:
- `http://localhost:5173/#/quiz` — Quiz System
- `http://localhost:5173/#/gamification` — Gamification Engine
- `http://localhost:5173/#/sorting` — Sorting (có sẵn)
- `http://localhost:5173/#/solid` — SOLID (Phase 4)
- `http://localhost:5173/#/patterns` — Design Patterns (Phase 4)
- `http://localhost:5173/#/di` — DI/IoC (Phase 4)
- `http://localhost:5173/#/system` — System Design (Phase 3)
- `http://localhost:5173/#/oop` — OOP Viz (Phase 3)

---

## 6. Xử Lý Sự Cố Thường Gặp

| Triệu chứng | Nguyên nhân | Cách khắc phục |
|---|---|---|
| `Failed to fetch` trong browser console | Thiếu CORS headers | Set `ASPNETCORE_ENVIRONMENT=Development` trước `dotnet run` |
| Quiz catalog trống (0 thẻ) | Backend chưa chạy hoặc sai port | Kiểm tra `curl http://localhost:5055/api/v1/concepts/quiz/all` |
| Gamification hiển thị 0 XP | API profile trả về lỗi | Kiểm tra backend console log, đảm bảo DI đã đăng ký `GamificationStrategy` |
| Leaderboard trống | Backend chưa chạy | Kiểm tra `curl http://localhost:5055/api/v1/concepts/gamification/leaderboard` |
| Port 5173 bị chiếm | Process cũ chưa tắt | `lsof -i :5173` và `kill` process cũ |
| Port 5050 bị chiếm | .NET process cũ chưa tắt | `lsof -i :5050` và `kill` process cũ |

---

## 7. Danh Sách Kiểm Thử Tổng Kết

| STT | Test Case | Endpoint / Trang | Kỳ Vọng | Kết Quả |
|---|---|---|---|---|
| 1 | GET /concepts/quiz/all | API | 6 quiz, tiếng Việt | ☐ |
| 2 | GET /concepts/quiz/{id} | API | Chi tiết quiz + đáp án | ☐ |
| 3 | POST /concepts/quiz/submit (đúng) | API | passed=true, XP>0 | ☐ |
| 4 | POST /concepts/quiz/submit (sai) | API | passed=false, XP=0 | ☐ |
| 5 | GET /concepts/quiz/invalid | API | 404 QUIZ_NOT_FOUND | ☐ |
| 6 | GET /concepts/gamification/profile | API | demo-user, 150 XP | ☐ |
| 7 | POST /concepts/gamification/award-xp | API | XP tăng, badge mới | ☐ |
| 8 | GET /concepts/gamification/badges | API | 8 badges | ☐ |
| 9 | GET /concepts/gamification/leaderboard | API | 10 entries | ☐ |
| 10 | GET /concepts/gamification/config | API | levels+badges+events | ☐ |
| 11 | Quiz catalog UI | /#/quiz | 6 thẻ quiz | ☐ |
| 12 | Quiz flow (chọn→nộp→kết quả) | /#/quiz | Score + giải thích VN | ☐ |
| 13 | Gamification profile UI | /#/gamification | XP + Level từ server | ☐ |
| 14 | Gamification leaderboard UI | /#/gamification | 10 entries + highlight | ☐ |
| 15 | Gamification badges UI | /#/gamification | 8 badges, earned/locked | ☐ |
| 16 | +50 XP Demo button | /#/gamification | XP tăng, API được gọi | ☐ |

---

> **Ghi chú:** Tất cả endpoint Quiz và Gamification trong Phase 5 là **stateless** — không cần PostgreSQL. Dữ liệu mock được quản lý trong bộ nhớ (Singleton). Khởi động lại server sẽ reset dữ liệu về trạng thái ban đầu.
