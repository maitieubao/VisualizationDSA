# Custom Input — Task Tracking

## P0: Fix Hardcoded Algorithm (3 tasks)

- [ ] **Task 1**: Thêm prop `algorithmId` vào `CustomInputForm.vue`
- [ ] **Task 2**: Sửa `onExecute` dùng prop `algorithmId` trong `useCustomInputForm.ts`
- [ ] **Task 3**: Sửa fallback dùng algorithm-specific generator trong `useInputStore.ts`

## P0: Fix Hardcoded Limit (2 tasks)

- [ ] **Task 4**: Thêm type `ALGORITHM_LIMITS` dictionary trong `useInputStore.ts`
- [ ] **Task 5**: Dynamic `maxLimit` theo algorithmId (store + form + parent)

## P1: Backend Tests (2 tasks)

- [ ] **Task 6**: Tạo `InputParserTests.cs`
- [ ] **Task 7**: Tạo `ConstraintResolverTests.cs`

## P1: UX Improvements (2 tasks)

- [ ] **Task 8**: Thêm loading overlay trong `CustomInputForm.vue`
- [ ] **Task 9**: Thêm keyboard shortcut hints trong `CustomInputForm.vue`

## P2: Minor Improvements (3 tasks)

- [ ] **Task 10**: Thêm max value warning
- [ ] **Task 11**: Thêm duplicate warning khi generate
- [ ] **Task 12**: Cập nhật tests cho tất cả thay đổi

## Execution Order

```
Task 4 → Task 1 → Task 2 → Task 5 → Task 3
→ Task 8 → Task 9 → Task 10 → Task 11
→ Task 6 → Task 7 → Task 12
```
