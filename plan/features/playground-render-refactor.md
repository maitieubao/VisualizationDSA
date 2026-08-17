# 🎨 PRD: Refactor Kiến Trúc Render Algo Playground — Mỗi Nhóm Thuật Toán Một Renderer

> Trạng thái: ✅ CODE DONE (P1–P4 hoàn tất, P5 tracking đang cập nhật)
>
> Ngày: 2026-08-16 · ADR: ADR-44 · File code: `frontend/src/features/algo-playground/`

---

## 1. Bối cảnh & Vấn đề

Khảo sát toàn bộ 21 thuật toán của Algo Playground cho thấy:

| Vấn đề | Chi tiết |
|---|---|
| **Monolith engine** | `SortingAnimationEngine.ts` (1138 dòng) gộp rAF loop + transition + 3 custom layout (counting/radix/bucket) + 4 overlay thuật toán |
| **Monolith helpers** | `algoCanvasHelpers.ts` (1057 dòng) gộp colors + tree + graph + badges + overlay + playback frame |
| **Thiếu renderer riêng** | 12/21 thuật toán (search, two-pointers, stack/queue, tree, graph) dùng chung pipeline generic — không mô tả đúng tính chất |
| **Animation thiếu** | Merge sort không lerp; counting không lerp; pointer search nhảy cóc; overlay biến mất khi transition |
| **Stack/Queue chỉ là badge chữ** | Không thể hiện LIFO/FIFO |
| **BST không tô node tìm thấy** | `COLORS.nodeFound` định nghĩa mà không dùng |

## 2. Kiến trúc mục tiêu

```
engine/
├── AlgoAnimationEngine.ts        ← base duy nhất: rAF, snapshots, progress, dispatch
├── rendererRegistry.ts           ← map algorithmId → renderer (Open-Closed)
└── renderers/
    ├── types.ts                  ← interface AlgoRenderer + PlaybackContext
    ├── ArraySortingRenderer.ts   ← bubble/selection/insertion/quick
    ├── MergeSortRenderer.ts      ← + chip bay L/R → OUT
    ├── HeapSortRenderer.ts       ← giữ layout hero-array + mini-tree + caption
    ├── CountingSortRenderer.ts   ← + ghost bay input→count→output
    ├── RadixSortRenderer.ts      ← + bay input↔xô (đã có)
    ├── BucketSortRenderer.ts     ← + bay input↔xô (đã có)
    ├── SearchingRenderer.ts      ← pointer lerp + vùng dim (linear/binary)
    ├── TwoPointersRenderer.ts    ← cửa sổ highlight + 2 pointer lerp
    ├── StackQueueRenderer.ts     ← visual LIFO/FIFO thật + push/pop animation
    ├── TreeRenderer.ts           ← BST tô node tìm thấy (glow)
    └── GraphRenderer.ts          ← chip HÀNG ĐỢI/NGĂN XẾP cho BFS/DFS
renderer/  (tách algoCanvasHelpers 1057 dòng → 9 file)
├── colors.ts ├── geometry.ts ├── arrayBars.ts ├── nodeStates.ts
├── treeDrawer.ts ├── graphDrawer.ts ├── overlays.ts
├── playbackFrame.ts └── barSortTransitions.ts (pipeline thanh mảng chung)
```

## 3. Lộ trình thực thi & trạng thái

| Pha | Nội dung | Trạng thái | Chứng cứ |
|---|---|---|---|
| **P1** | Tách `algoCanvasHelpers.ts` → 9 file nhỏ (colors/geometry/arrayBars/nodeStates/treeDrawer/graphDrawer/overlays/playbackFrame) + barrel tạm | ✅ CODE DONE | 223/223 test pass |
| **P2** | `AlgoAnimationEngine` base + `rendererRegistry` + 11 renderer files; xóa `SortingAnimationEngine`/`MergeSortAnimationEngine`/`HeapSortAnimationEngine`; update `useAlgoAnimation.ts`; đổi spec import | ✅ CODE DONE | 3518/3518 test pass, vue-tsc sạch |
| **P3** | Fix animation: merge chip bay, counting ghost bay, search pointer lerp + dim, two-pointers cửa sổ, stack/queue visual thật, BST found node glow, overlay tồn tại khi transition | ✅ CODE DONE | spec mới `newRenderers.spec.ts` 15 tests |
| **P4** | Demo fix: bucket-sort sort phase dùng `setBucketComparing` (insertion sort trực quan); quick-sort push/pop partition stack | ✅ CODE DONE | 3523/3523 test pass |
| **P5** | Test mới (`rendererRegistry.spec.ts`, `newRenderers.spec.ts`) + tracking (progress.md, decisions.md ADR-44, features-tested.md) | 🟡 IN PROGRESS | file này |

## 4. Ghi chú kỹ thuật quan trọng

- **Open-Closed (Quy tắc 1)**: thêm nhóm thuật toán mới = 1 file renderer + 1 dòng registry, không sửa lõi engine.
- **Data-driven (Quy tắc 3)**: mọi renderer chỉ vẽ từ `CanvasStateSnapshot` — không chứa logic so sánh/kiểm tra thuật toán.
- **Preserve API cũ**: `MergeSortRenderer.instance()/canHandle()/render()`, `HeapSortRenderer.instance()/canHandle()/captionFor()/render()` giữ nguyên cho test backward-compat.
- **Overlay khi transition**: `BarTransitionPipeline.draw()` gọi `drawSnapshotOverlays` ở cuối MỌI nhánh transition — badge không biến mất giữa chừng.
- **BST found node**: `searchFound === true && activeIds.includes(id)` → `COLORS.nodeFound` + glow ring (demo BST gọi `found(-1)` nên không dùng `foundIndex`).
- **Stack/Queue visual**: `stackIds`/`queueIds` chứa chỉ số mảng → renderer hiển thị giá trị mảng tương ứng, push trượt từ trên/phải, pop trượt ra + mờ.
