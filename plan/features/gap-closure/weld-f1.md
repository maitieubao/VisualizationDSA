# Weld instructions — F1 & F2 (thuần frontend)

> File này chỉ **ghi** các dòng cần hàn vào router/tab. KHÔNG tự ý sửa
> `frontend/src/router/routes.ts` hay `frontend/src/appTabs.ts` khi chưa được
> phê duyệt merge. Mỗi feature chỉ thêm đúng **1 route entry** + **1 tab entry**.

---

## F1 — FAQ công khai (FR-7.2)

### 1) `frontend/src/router/routes.ts`

Thêm đúng 1 dòng (đề xuất đặt cạnh block route `/docs`):

```ts
  { path: '/faq', name: 'faq', component: () => import('../views/docs/FaqView.vue'), meta: { title: 'Trợ giúp', icon: 'help-circle' } },
```

> Lưu ý: `BaseIcon` **không có** icon tên `help`; dùng `help-circle` (đã có sẵn
> trong `frontend/src/shared/components/BaseIcon.vue`).

### 2) `frontend/src/appTabs.ts`

Thêm vào group `Khái niệm` (sau item `docs`):

```ts
      { id: 'faq', path: '/faq', name: 'Trợ giúp' }
```

Kết quả group sau khi hàn:

```ts
  {
    groupName: 'Khái niệm',
    items: [
      { id: 'docs', path: '/docs', name: 'Tài liệu tham khảo' },
      { id: 'faq',  path: '/faq',  name: 'Trợ giúp' }
    ]
  },
```

---

## F2 — Benchmark Lab (FR-3.20)

### 1) `frontend/src/router/routes.ts`

Thêm đúng 1 dòng (đề xuất đặt cạnh block route `/sorting` / `/playground`):

```ts
  { path: '/benchmark', name: 'benchmark', component: () => import('../views/benchmark/BenchmarkLabView.vue'), meta: { title: 'Đo điểm chuẩn', icon: 'compare' } },
```

### 2) `frontend/src/appTabs.ts`

Thêm vào group `Giải thuật` (sau item `playground`):

```ts
      { id: 'benchmark', path: '/benchmark', name: 'Đo điểm chuẩn' }
```

Kết quả group sau khi hàn:

```ts
  {
    groupName: 'Giải thuật',
    items: [
      { id: 'sorting',    path: '/sorting',    name: 'Sắp xếp' },
      { id: 'graph',      path: '/graph',      name: 'Đồ thị' },
      { id: 'code-ide',   path: '/code-ide',   name: 'Gỡ lỗi Code' },
      { id: 'playground', path: '/playground', name: 'Playground' },
      { id: 'benchmark',  path: '/benchmark',  name: 'Đo điểm chuẩn' }
    ]
  },
```

---

## Files đã tạo (không cần hàn thêm)

- `frontend/src/views/docs/FaqView.vue`
- `frontend/src/views/docs/__tests__/faqView.spec.ts`
- `frontend/src/features/benchmark-lab/types.ts`
- `frontend/src/features/benchmark-lab/services/benchmarkApi.ts`
- `frontend/src/features/benchmark-lab/store/useBenchmarkStore.ts`
- `frontend/src/features/benchmark-lab/__tests__/benchmarkP0.spec.ts`
- `frontend/src/views/benchmark/BenchmarkLabView.vue`
