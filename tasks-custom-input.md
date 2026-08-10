# Custom Input — Remaining Issues Tasks

## P0: Critical Bugs (2 tasks)

- [x] **T1**: Fix fallback — import algorithm-specific dummy generators, tạo mapping algorithmId → generator (`generateDummyResult(algorithmId, parsedArray)`)
- [x] **T2**: Fix maxLimit dynamic — gọi `setAlgorithmLimit()` khi algorithm thay đổi trong VisualizationPlayer (watch `animStore.algorithmId`)

## P1: Important (4 tasks)

- [x] **T3**: Sync ALGORITHM_LIMITS với backend ConstraintResolver (thêm heap-sort, radix-sort, counting-sort, bucket-sort vào backend)
- [x] **T4**: Sync DEFAULT_LIMIT — frontend 15 → backend 10, thống nhất về 15
- [x] **T5**: Thêm loading overlay trong CustomInputForm.vue
- [x] **T6**: Tạo InputParserTests.cs cho backend

## P2: Minor (3 tasks)

- [x] **T7**: Thêm keyboard shortcut hints trong CustomInputForm.vue
- [x] **T8**: Thêm max value warning khi parsedArray có phần tử > 10000
- [x] **T9**: Cập nhật tests cho tất cả thay đổi

## Execution Order

```
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9
```
