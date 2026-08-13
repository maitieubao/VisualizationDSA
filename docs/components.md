# Core UI Components — Tài liệu tham khảo nhanh

> D3 (2026-08-13): tài liệu component thư viện dạng nhẹ (markdown) thay vì Storybook —
> không thêm dependency/build config. Cập nhật khi thêm component mới.

## BaseIcon

Icon SVG inline, thay thế toàn bộ icon font/emoji. Tất cả icon tập trung trong 1 file
(`src/shared/components/BaseIcon.vue`) — thêm icon mới bằng cách thêm `<g>` tương ứng.

```vue
<BaseIcon name="play" class="w-4 h-4" />
```

- `name`: tên icon (xem danh sách trong `BaseIcon.vue` — `check`, `x`, `play`, `pause`,
  `spinner`, `users`, `chart-bar`, `clipboard-list`, `cog`, `shield`, `trending-up`, `eye`,
  `download`, `image`, `link`, `list`, `info`, `refresh-cw`, `zap`, `flask`, `dice`,
  `timer`, `database`, `crown`, `snowflake`, `step-backward/forward`, `skip-backward/forward`, ...).
- Kích thước: dùng class `w-* h-*` của Tailwind (không hardcode trong component).
- `aria-hidden` tự động nếu không có `aria-label`.

## TheoryAccordionItem / TheoryCollapsiblePanel

Panel gập/mở nội dung lý thuyết (dùng trong Lesson Study bước 1).

```vue
<TheoryAccordionItem title="Độ phức tạp thời gian" :expanded="true">
  <p>Nội dung bên trong...</p>
</TheoryAccordionItem>
```

- `title`: tiêu đề panel.
- `expanded` (optional): trạng thái mặc định.
- CSS riêng trong `TheoryAccordionItem.css` (import bởi component).

## TheorySummaryView

Tóm tắt lý thuyết sau khi học xong bước 1 (tổng hợp các ý chính).

## Ghi chú phong cách (dùng chung)

- Biến CSS theme: `var(--color-text-primary)`, `--color-text-secondary`,
  `--color-bg-surface`, `--color-bg-secondary`, `--color-border-strong`,
  `--color-border-subtle`, `--color-accent`, `--color-accent-cyan-light`,
  `--color-accent-emerald-light`, `--color-accent-yellow`.
- Dark mode theo mặc định — light theme qua `useThemeStore` (theme `vs`/`vs-dark` cho Monaco).
- Không dùng `any`; component mới phải có test (Vitest + Vue Test Utils).
