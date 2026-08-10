# Integrity Check Service — Report

## Tổng quan
Triển khai dịch vụ kiểm tra tính toàn vẹn `Classroom` curriculum và endpoint API dùng cho admin/teacher debug.

## Thành phần
### Backend
- **Entity**: Thêm `RowVersion` (optimistic concurrency) vào `ClassroomModule` + `ClassroomModuleItem`.
  - `src/Domain/Entities/ClassroomModule.cs`
  - `src/Domain/Entities/ClassroomModuleItem.cs`
  - `src/Infrastructure/Data/ApplicationDbContext.cs` (Fluent: `.IsRowVersion()`)
- **Migration**: `20260807064706_AddRowVersionToClassroomModuleAndItem`
  - Thêm cột `RowVersion BLOB NOT NULL DEFAULT ''` cho cả 2 bảng.
- **Query**: `GetClassroomIntegrityReportQuery` + handler kiểm tra:
  - Duplicate `OrderIndex` (modules + items trong module)
  - Soft-deleted module còn trong kết quả
  - Trả về `IsValid` boolean.
  - `src/Application/Features/Classrooms/Queries/GetClassroomIntegrityReport/`
- **Controller endpoint**: `GET /api/v1/classrooms/{classroomId}/integrity-report`
  - `src/WebApi/Controllers/ClassroomCurriculumController.cs`
- **Middleware**: Handler `ConflictException` → HTTP 409 trong `ErrorHandlingMiddleware.cs`.
  - `src/WebApi/Middlewares/ErrorHandlingMiddleware.cs`
  - `src/Application/Common/Exceptions/ConflictException.cs` (mới)

### Reorder handlers (optimistic concurrency safety)
- `ReorderClassroomModulesCommandHandler.cs`: bắt `DbUpdateConcurrencyException` → ném `ConflictException`.
- `ReorderClassroomModuleItemsCommandHandler.cs`: tương tự.

## Trạng thái
- ✅ Backend build OK
- ✅ Migration applied (SQLite dev)
- ✅ FE typecheck OK
- ✅ Teacher tests: 55 passed (P0+P2)

## Test coverage
- `src/views/teacher/__tests__/teacherP0Tests.spec.ts`
- `src/views/teacher/__tests__/teacherP2Tests.spec.ts`
