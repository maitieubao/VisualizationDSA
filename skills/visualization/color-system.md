# 🎨 Design System Color Rules

## 🎯 Mục tiêu
Quy tắc bắt buộc về việc sử dụng màu sắc trong toàn bộ hệ thống visualization, đảm bảo nhất quán giữa dark/light theme và tuân thủ design system tokens.

---

## 📜 Quy tắc sắt

### 1. Tuyệt đối KHÔNG dùng hardcoded hex/rgb trong Canvas
Mọi màu sắc trên canvas PHẢI được resolve từ CSS custom properties (design tokens). Không được phép viết:
```typescript
// ❌ SAI
ctx.fillStyle = '#6366f1';
ctx.fillStyle = '#f59e0b';
ctx.strokeStyle = 'rgba(239,68,68,0.8)';

// ✅ ĐÚNG
import { COLORS } from './algoCanvasHelpers';
ctx.fillStyle = COLORS.barDefault;
ctx.fillStyle = COLORS.barCompare;
ctx.strokeStyle = COLORS.barSwap;
```

### 2. Luôn dùng `COLORS` object từ `algoCanvasHelpers.ts`
File `algoCanvasHelpers.ts` export một object `COLORS` đã được resolve từ CSS variables:
```typescript
import { COLORS, refreshColors } from './algoCanvasHelpers';
```
- `COLORS.barDefault` — màu mặc định của thanh (dark: `rgba(255,255,255,0.25)`, light: `rgba(0,0,0,0.22)`)
- `COLORS.barCompare` — màu đang so sánh
- `COLORS.barSwap` — màu đang hoán đổi
- `COLORS.barSorted` — màu đã sắp xếp xong
- `COLORS.barPruned` — màu đã loại bỏ (alpha nhẹ)
- `COLORS.barText` — màu chữ trên thanh
- `COLORS.nodeDefault` — màu node tree/graph mặc định
- `COLORS.nodeActive` — màu node đang active
- `COLORS.nodeVisited` — màu node đã thăm
- `COLORS.nodePruned` — màu node đã loại bỏ
- `COLORS.nodeText` — màu chữ trên node
- `COLORS.nodeFound` — màu node tìm thấy
- `COLORS.nodeBorder` — viền node
- `COLORS.edgeDefault` — màu cạnh mặc định
- `COLORS.edgeHighlight` — màu cạnh highlight
- `COLORS.edgeWeightText` — màu chữ trọng số cạnh
- `COLORS.badgeBg` — nền badge
- `COLORS.badgeText` — chữ badge
- `COLORS.rangeActive` — vùng actively searched
- `COLORS.rangePruned` — vùng đã loại bỏ
- `COLORS.pointerColors.L/M/H/R` — màu con trỏ binary search
- `COLORS.callStackBg/Border/Active` — call stack overlay
- `COLORS.legendBg/Text` — legend overlay
- `COLORS.notFoundBg/Text` — not found state
- `COLORS.targetBg/Text` — target element
- `COLORS.depthText` — depth label
- `COLORS.foundGlow` — found glow effect
- `COLORS.heapNodeDefault/Active/Text/BarDefault` — heap sort colors
- `COLORS.chipBg/Active/Out/Slot` — merge sort chip colors
- `COLORS.barSegment` — merge sort segment
- `COLORS.text/TextDim` — general text colors

### 3. Gọi `refreshColors()` khi theme thay đổi
Khi user chuyển dark↔light, PHẢI gọi `refreshColors()` để cập nhật COLORS:
```typescript
import { refreshColors } from './algoCanvasHelpers';

// Trong watch theme:
watch(() => themeStore.currentTheme, () => {
  refreshColors();
  // ... redraw canvas
});
```

### 4. Mapping token cho từng loại visual element

| Visual Element | CSS Token (Dark) | CSS Token (Light) |
|---|---|---|
| Bar default | `--vis-color-default` | `--vis-color-default` |
| Bar compare | `--vis-color-compare` | `--vis-color-compare` |
| Bar swap | `--vis-color-swap` | `--vis-color-swap` |
| Bar sorted | `--vis-color-sorted` | `--vis-color-sorted` |
| Node default | `--canvas-node-default` | `--canvas-node-default` |
| Node active | `--vis-color-active` | `--vis-color-active` |
| Node visited | `--vis-color-sorted` | `--vis-color-sorted` |
| Edge default | `--canvas-edge-default` | `--canvas-edge-default` |
| Edge highlight | `--color-accent-yellow` | `--color-accent-yellow` |
| Pointer L | `--color-accent-cyan` | `--color-accent-cyan` |
| Pointer H | `--color-accent-purple-light` | `--color-accent-purple-light` |
| Pointer M | `--color-accent-yellow` | `--color-accent-yellow` |
| Pointer R | `--color-accent-red` | `--color-accent-red` |
| Text primary | `--color-text-primary` | `--color-text-primary` |
| Text secondary | `--color-text-secondary` | `--color-text-secondary` |
| Badge bg | `--color-bg-overlay` | `--color-bg-overlay` |
| Found glow | `--color-accent-yellow` | `--color-accent-yellow` |

### 5. Template classes trong Vue components
KHÔNG dùng Tailwind color classes trực tiếp (ví dụ `text-emerald-400`, `text-amber-300`). Thay vào đó:
```html
<!-- ❌ SAI — hardcoded, broken in light mode -->
<span class="text-emerald-400">✓</span>
<span class="text-amber-300">⚠</span>

<!-- ✅ ĐÚNG — dùng CSS variables -->
<span :style="{ color: 'var(--color-accent-green)' }">✓</span>
<span :style="{ color: 'var(--color-accent-yellow-light)' }">⚠</span>
```

Hoặc dùng Tailwind bridge classes đã định nghĩa trong `style.css`:
```html
<!-- ✅ ĐÚNG — dùng bridge classes -->
<span class="text-accent">✓</span>
<span class="bg-surface">...</span>
```

### 6. Engine overlay colors
Trong SortingAnimationEngine, MergeSortAnimationEngine, HeapSortAnimationEngine:
- Import `COLORS` từ `algoCanvasHelpers.ts`
- Thay thế mọi hardcoded hex bằng `COLORS.*`
- KHÔNG tạo color constants mới trong engine files

### 7. Fallback khi document chưa sẵn sàng
`refreshColors()` tự động handle SSR/test environment. Không cần check `typeof document` ở mỗi call site.

---

## 🔍 Checklist kiểm tra
Trước khi commit, grep toàn bộ codebase:
```bash
# Không được có hex color nào trong engine/helpers (trừ COLORS definition)
rg "#[0-9a-fA-F]{3,8}" frontend/src/features/algo-playground/engine/
rg "#[0-9a-fA-F]{3,8}" frontend/src/features/algo-playground/renderer/algoCanvasHelpers.ts

# Không được có Tailwind color classes trong template
rg "text-(emerald|amber|red|cyan|green|yellow|purple|blue|indigo|pink|rose|orange|teal|violet|fuchsia|sky|lime|slate|gray|zinc|neutral|stone)-\d" frontend/src/features/algo-playground/components/

# Chỉ được có hex trong COLORS definition block (dòng ~38-77)
```
