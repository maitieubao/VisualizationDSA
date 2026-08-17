# Weld Guide — F8 (Practice Ladder 3 bậc)

> File hướng dẫn hàn (weld) cho feature **F8 — Practice Ladder 3 bậc** (FR-4.11, FR-4.3).
>
> **Nguyên tắc:** bước tích hợp cuối sẽ áp dụng đúng các dòng bên dưới vào các "điểm hàn" chung.
> Các file source của F8 KHÔNG được sửa trực tiếp vào các điểm hàn chung trong quá trình phát triển.

---

## 1. Migration

Migration duy nhất đã tạo (ADD-only bảng `StageProgress`):

```
backend/src/Infrastructure/Migrations/20260816152230_GapF8StageProgress.cs
backend/src/Infrastructure/Migrations/20260816152230_GapF8StageProgress.Designer.cs
```

Tên migration: **`GapF8StageProgress`**

Migration tạo bảng `StageProgresses`:
- `Id` (Guid, PK)
- `UserId` (Guid) → FK `Users(Id)` Cascade
- `LessonId` (Guid) → FK `Lessons(Id)` Cascade
- `Stage` (int, 1/2/3)
- `Status` (int, 0 = Locked, 1 = Open, 2 = Passed)
- `BestScore` (int?, nullable)
- `PassedAt` (DateTime?, nullable)
- `UpdatedAt` (DateTime)
- Unique index `(UserId, LessonId, Stage)`

> KHÔNG chạy `dotnet ef database update` ở bước phát triển feature. Bước tích hợp cuối sẽ chạy.

---

## 2. Backend — dòng cần thêm vào `ApplicationDbContext.cs`

File: `backend/src/Infrastructure/Data/ApplicationDbContext.cs`

### 2.1. DbSet

Thêm **đúng 1 dòng** ngay sau `public DbSet<CodelabSubmission> CodelabSubmissions { get; set; }`:

```csharp
public DbSet<StageProgress> StageProgresses { get; set; }
```

### 2.2. Fluent API (OnModelCreating)

Thêm vào trong `OnModelCreating` (gợi ý ngay trước block `// QZ-001/QZ-002/QZ-005` hoặc cuối method):

```csharp
// F8 (FR-4.11, FR-4.3): Practice Ladder — unique (UserId, LessonId, Stage).
modelBuilder.Entity<StageProgress>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.HasIndex(e => new { e.UserId, e.LessonId, e.Stage }).IsUnique();
    entity.HasOne(e => e.User)
          .WithMany()
          .HasForeignKey(e => e.UserId)
          .OnDelete(DeleteBehavior.Cascade);
    entity.HasOne(e => e.Lesson)
          .WithMany()
          .HasForeignKey(e => e.LessonId)
          .OnDelete(DeleteBehavior.Cascade);
});
```

> **Lưu ý quan trọng về cách sinh migration:**
> Trong lúc phát triển, code đã được tạm thêm DbSet + Fluent API ở trên (cùng cả DbSet + Fluent
> của F5/F6/F7 để migration không drop các bảng đó), chạy
> `dotnet ef migrations add GapF8StageProgress --project src/Infrastructure --startup-project src/WebApi`,
> sau đó **đã revert** file `ApplicationDbContext.cs` về nguyên trạng (vì ràng buộc không sửa file chung).
> Controller mới dùng `_dbContext.Set<StageProgress>()` thay vì property `DbSet<T>` nên code feature
> vẫn compile/hoạt động ngay cả trước khi hàn DbSet.

---

## 3. Frontend — gắn `LadderPanel` vào `LessonStudyView.vue`

File: `frontend/src/views/lesson/LessonStudyView.vue` (KHÔNG sửa trong quá trình phát triển feature).

### 3.1. Import (thêm vào `<script setup lang="ts">`)

```ts
import LadderPanel from '../../features/ladder/components/LadderPanel.vue';
```

### 3.2. Chèn component vào template

Gợi ý đặt **trong `<main>`** sau block `<template v-else-if="lessonStore.currentLesson">` (sau bước
step content hiện tại, vẫn nằm trong `<main>`), để panel luôn hiển thị dưới nội dung từng bước:

```vue
<!-- Practice Ladder (F8/FR-4.11, FR-4.3) — 3 bậc: Quiz → Lab → CodeLab. -->
<div class="px-4 pb-4">
  <LadderPanel
    :lesson-id="lessonId"
    @go-codelab="lessonStore.goToStep(4)"
  />
</div>
```

> Bậc 3 (CodeLab) dùng lại codelab hiện có ở bước 4 của `LessonStudyView`. Component `LadderPanel`
> emit event `go-codelab`; hàn theo cách trên để chuyển thẳng tới bước 4 khi học viên bấm "Làm CodeLab".

### 3.3. (Tùy chọn) Nếu muốn hiển thị thành side panel

Có thể dùng mẫu giống `LessonDiscussionPanel` (fixed right panel). Khi đó cần thêm `ref` mở panel
và một nút ở Bottom Navigation Bar — tương tự nút "Thảo luận". Không bắt buộc; cách 3.2 đơn giản hơn.

---

## 4. Ghi chú tích hợp

- `routes.ts`, `appTabs.ts`, `Program.cs`, `ApplicationDbContext.cs`, `AdminPanelView.vue` đều **KHÔNG**
  bị sửa trong quá trình phát triển feature. Chỉ áp dụng các dòng ở mục 2 và 3 khi bước tích hợp cuối chạy.
- `LadderController` tự resolve user từ JWT (`JwtHelper.ExtractSubFromToken`) — không cần đăng ký thêm
  DI trong `Program.cs` (chỉ dùng `ApplicationDbContext` đã có sẵn).
