# DSA Modules — Task Tracking

## P0: Critical (2 tasks)

- [x] **T1**: Fix silent fallback trong dsaApi.ts — hiện error message rõ ràng (`ExecuteResult { result, isFallback, errorMessage }`)
- [x] **T2**: Fix unsafe type cast trong AlgorithmVisualizer.vue — `as unknown as FrameDTO` (đã xóa, renderer chọn theo data-driven)

## P1: Important (2 tasks)

- [x] **T3**: Fix DSAPlayer.vue catch block — hiện error cho user qua toast (`toastStore.error` / `toastStore.warning`) thay vì chỉ console.error
- [x] **T4**: Fix useAlgorithmStore.ts — validate backendAlgos response (`Array.isArray(raw) ? raw : []`)

## Execution Order

```
T1 → T2 → T3 → T4
```
