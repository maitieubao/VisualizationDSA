# Weld Guide — F5 / F6 / F7

> File hướng dẫn hàn (weld) cho 3 feature: F5 (ghi chú bài học), F6 (yêu thích mô phỏng), F7 (cấu hình hệ thống).
>
> **Nguyên tắc:** bước tích hợp cuối sẽ áp dụng đúng các dòng bên dưới vào các "điểm hàn" chung.
> Các file source của 3 feature KHÔNG được sửa vào các điểm hàn chung trong quá trình phát triển.

---

## 1. Migration

Migration duy nhất đã tạo (chứa cả 3 bảng mới, ADD-only):

```
backend/src/Infrastructure/Migrations/20260816143343_GapF567NotesFavoritesSettings.cs
backend/src/Infrastructure/Migrations/20260816143343_GapF567NotesFavoritesSettings.Designer.cs
```

Tên migration: **`GapF567NotesFavoritesSettings`**

Migration tạo 3 bảng:
- `LessonNotes` — unique index `(UserId, LessonId)`, FK `UserId → Users` (Cascade), FK `LessonId → Lessons` (Cascade)
- `Favorites` — unique index `(UserId, SimulationKey)`, FK `UserId → Users` (Cascade)
- `SystemSettings` — PK `Key` (string), không có FK

> KHÔNG chạy `dotnet ef database update` ở bước phát triển feature. Bước tích hợp cuối sẽ chạy.

---

## 2. Backend — dòng cần thêm vào `ApplicationDbContext.cs`

File: `backend/src/Infrastructure/Data/ApplicationDbContext.cs`

Thêm 3 dòng `DbSet` ngay sau `public DbSet<CodelabSubmission> CodelabSubmissions { get; set; }`:

```csharp
public DbSet<LessonNote> LessonNotes { get; set; }
public DbSet<Favorite> Favorites { get; set; }
public DbSet<SystemSetting> SystemSettings { get; set; }
```

### 2.1. Cấu hình Fluent API (OnModelCreating)

Thêm vào cuối `OnModelCreating` (trước `base.OnModelCreating(modelBuilder);` hoặc cuối method):

```csharp
modelBuilder.Entity<LessonNote>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.HasIndex(e => new { e.UserId, e.LessonId }).IsUnique();
    entity.Property(e => e.ContentHtml).IsRequired();
    entity.HasOne(e => e.User)
          .WithMany()
          .HasForeignKey(e => e.UserId)
          .OnDelete(DeleteBehavior.Cascade);
    entity.HasOne(e => e.Lesson)
          .WithMany()
          .HasForeignKey(e => e.LessonId)
          .OnDelete(DeleteBehavior.Cascade);
});

modelBuilder.Entity<Favorite>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.HasIndex(e => new { e.UserId, e.SimulationKey }).IsUnique();
    entity.Property(e => e.SimulationKey).IsRequired().HasMaxLength(120);
    entity.HasOne(e => e.User)
          .WithMany()
          .HasForeignKey(e => e.UserId)
          .OnDelete(DeleteBehavior.Cascade);
});

modelBuilder.Entity<SystemSetting>(entity =>
{
    entity.HasKey(e => e.Key);
    entity.Property(e => e.Key).HasMaxLength(150);
    entity.Property(e => e.Value).IsRequired();
    entity.Property(e => e.Description).HasMaxLength(500);
});
```

> **Lưu ý quan trọng về cách sinh migration:**
> Trong lúc phát triển, code đã được tạm thêm DbSet + Fluent API ở trên để chạy
> `dotnet ef migrations add GapF567NotesFavoritesSettings`, sau đó **đã revert** file
> `ApplicationDbContext.cs` về nguyên trạng (vì ràng buộc không sửa file chung).
> Các controller mới dùng `_dbContext.Set<TEntity>()` thay vì property `DbSet<T>`,
> nên code feature vẫn compile/hoạt động ngay cả trước khi hàn DbSet.
> Migration sinh ra đã khớp đúng cấu hình ở trên.

---

## 3. Frontend — hướng dẫn gắn component

### 3.1. F5 — gắn `LessonNotesPanel` vào `LessonStudyView.vue`

File: `frontend/src/views/lesson/LessonStudyView.vue`

**Bước 1 — import (thêm vào `<script setup lang="ts">`):**

```ts
import LessonNotesPanel from '../../features/lesson/components/LessonNotesPanel.vue';
```

**Bước 2 — chèn component vào template.** Gợi ý đặt ngay trước `<!-- Discussion panel ... -->`
(sau thẻ `</main>` và thanh điều hướng đáy, vẫn nằm trong `.lesson-study-view`). Component
tự nhận `lesson-id` và tự debounce autosave 1 giây:

```vue
<!-- Ghi chú bài học (F5/FR-2.6) — panel độc lập, autosave 1 giây. -->
<Transition name="slide-right">
  <div
    v-if="showNotes && lessonStore.currentLesson"
    class="fixed inset-y-0 right-0 z-40 w-[92vw] sm:w-96 bg-bg-secondary border-l border-border-subtle shadow-2xl flex flex-col"
    role="complementary"
    aria-label="Ghi chú bài học"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-border-subtle shrink-0">
      <span class="text-xs font-bold text-text-primary flex items-center gap-2">
        <BaseIcon name="edit" class="w-4 h-4 text-accent" />
        Ghi chú bài học
      </span>
      <button
        @click="showNotes = false"
        aria-label="Đóng ghi chú"
        class="p-1 rounded-md hover:bg-bg-hover text-text-muted transition-colors cursor-pointer"
      >
        <BaseIcon name="x" class="w-4 h-4" />
      </button>
    </div>
    <div class="flex-1 min-h-0 overflow-y-auto p-3">
      <LessonNotesPanel :lesson-id="lessonId" />
    </div>
  </div>
</Transition>
```

**Bước 3 — thêm state + nút mở panel.** Thêm `const showNotes = ref(false);` gần các ref khác
(ví dụ cạnh `showDiscussion`), và thêm nút mở cạnh nút "Thảo luận" trong Bottom Navigation Bar:

```vue
<button
  @click="showNotes = true"
  aria-label="Mở ghi chú bài học"
  class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all cursor-pointer"
>
  <BaseIcon name="edit" class="w-3.5 h-3.5" />
  <span>Ghi chú</span>
</button>
```

### 3.2. F6 — gắn `FavoriteToggle` vào `AlgorithmVisualizer.vue`

File: `frontend/src/features/dsa-modules/components/AlgorithmVisualizer.vue`

**Bước 1 — import:**

```ts
import FavoriteToggle from './FavoriteToggle.vue';
```

**Bước 2 — chèn nút sao vào header.** `AlgorithmVisualizer.vue` hiện chưa có header; nút
thường được đặt trên đầu canvas. Thêm ngay trước `<div v-if="currentFrame" ...>` (thẻ bước mô phỏng):

```vue
<div class="absolute top-3 right-4 z-10 pointer-events-auto">
  <FavoriteToggle :simulation-key="algoStore.currentAlgorithm?.id ?? ''" />
</div>
```

> `simulationKey` chính là `id` trong `ALGORITHM_CATALOG` (vd `"bubble-sort"`), khớp với
> `algoStore.currentAlgorithm?.id`. Nếu muốn lưu kèm input của mô phỏng hiện tại, truyền thêm
> prop `:input-json="JSON.stringify({ input: animStore.currentInput })"` (tùy theo store đang có).

### 3.3. F7 — gắn `SettingsFormSection` vào `AdminSystemTab.vue`

File: `frontend/src/views/admin/AdminSystemTab.vue`

**Bước 1 — import:**

```ts
import SettingsFormSection from './components/SettingsFormSection.vue';
```

**Bước 2 — chèn form settings.** Đặt bên dưới card `card--settings` hiện tại (trong `.system-layout`):

```vue
<SettingsFormSection />
```

> Component tự gọi `GET /api/v1/admin/settings` khi mount và `PUT /api/v1/admin/settings` khi bấm
> "Lưu cấu hình". Endpoint này yêu cầu quyền Admin — khớp với `AdminSystemTab` chỉ hiển thị cho admin.

---

## 4. Ghi chú tích hợp

- `routes.ts`, `appTabs.ts`, `Program.cs`, `ApplicationDbContext.cs`, `AdminPanelView.vue` đều **KHÔNG**
  bị sửa trong quá trình phát triển feature. Chỉ áp dụng các dòng ở mục 2 và 3 khi bước tích hợp cuối chạy.
- Nếu muốn endpoint settings hoạt động với cache `IMemoryCache` thay vì `ConcurrentDictionary` tự quản,
  có thể bỏ qua — controller đã tự chứa cache `static ConcurrentDictionary`, không cần đăng ký thêm vào `Program.cs`.
