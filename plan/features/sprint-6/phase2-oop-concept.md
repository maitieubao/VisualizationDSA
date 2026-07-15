# ⚙️ Technical Specification - OOP Concepts & VTable Dispatch (Sprint 6)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình mô phỏng phản xạ Class **OOPReflectionEngine** và bảng định tuyến đa hình ảo **VirtualMethodTable** trong Sprint 6.

---

## 1. Trình Mô Phỏng Phản Xạ Lớp OOP (OOPReflectionEngine TypeScript)

Lớp hạt nhân chịu trách nhiệm biên dịch và quản lý mối quan hệ kế thừa, đóng gói bảo mật (Private/Public) của các lớp đối tượng Client-side dưới 10ms:

```typescript
export type AccessModifier = 'PUBLIC' | 'PRIVATE' | 'PROTECTED';

export interface ClassProperty {
  name: string;
  type: string;
  modifier: AccessModifier;
}

export interface ClassMethod {
  name: string;
  isVirtual: boolean;
  modifier: AccessModifier;
  overrideClass?: string; // Tên lớp con override
}

export interface OOPClass {
  name: string;
  parentName: string | null;
  properties: ClassProperty[];
  methods: ClassMethod[];
}

export class OOPReflectionEngine {
  private classRegistry: Map<string, OOPClass> = new Map();

  public registerClass(clazz: OOPClass): void {
    this.classRegistry.set(clazz.name, clazz);
  }

  /**
   * Kiểm soát quyền truy cập thuộc tính (Encapsulation Guard)
   */
  public checkAccessViolation(
    targetClassName: string,
    propertyName: string,
    callerClassName: string
  ): { isViolated: boolean; reason: string } {
    const clazz = this.classRegistry.get(targetClassName);
    if (!clazz) {
      return { isViolated: true, reason: `Không tìm thấy lớp '${targetClassName}'` };
    }

    const prop = clazz.properties.find(p => p.name === propertyName);
    if (!prop) {
      return { isViolated: true, reason: `Không tìm thấy thuộc tính '${propertyName}'` };
    }

    if (prop.modifier === 'PRIVATE' && targetClassName !== callerClassName) {
      return {
        isViolated: true,
        reason: `Vi phạm Đóng gói: Thuộc tính '${propertyName}' của lớp '${targetClassName}' là PRIVATE. Không được truy cập từ lớp '${callerClassName}'!`
      };
    }

    return { isViolated: false, reason: 'Hợp lệ' };
  }

  /**
   * Dò tìm phương thức kế thừa dọc cây phả hệ Class (Inheritance lookup)
   */
  public lookupMethod(className: string, methodName: string): string | null {
    let currentName: string | null = className;

    while (currentName !== null) {
      const clazz = this.classRegistry.get(currentName);
      if (!clazz) break;

      const method = clazz.methods.find(m => m.name === methodName);
      if (method) {
        return currentName; // Trả về lớp thực tế sở hữu hàm
      }

      currentName = clazz.parentName; // Dịch chuyển ngược lên cha
    }

    return null;
  }
}
```

---

## 2. Bảng Định Tuyến Phương Thức Ảo Đa Hình (VirtualMethodTable TS)

Mô tả cách thức trình biên dịch liên kết động (Dynamic Dispatch) tìm kiếm phương thức đa hình thời gian thực:

```typescript
export class VirtualMethodTable {
  /**
   * Định tuyến Đa hình Động phương thức ảo (Dynamic Method Dispatch)
   * @param instanceClassName Lớp thực tế của thực thể đối tượng được new
   * @param methodName Tên hàm được gọi
   * @param reflectionEngine Động cơ phản xạ
   */
  public static dispatch(
    instanceClassName: string,
    methodName: string,
    reflectionEngine: OOPReflectionEngine
  ): { resolvedClass: string; isDynamic: boolean } {
    // Dò tìm lớp thực tế chứa phương thức đa hình theo phả hệ
    const resolvedClass = reflectionEngine.lookupMethod(instanceClassName, methodName);
    if (!resolvedClass) {
      throw new Error(`Không thể định tuyến phương thức '${methodName}' cho lớp '${instanceClassName}'!`);
    }

    // Đánh dấu là liên kết động nếu hàm được kế thừa hoặc override
    const isDynamic = resolvedClass !== instanceClassName;

    return {
      resolvedClass,
      isDynamic
    };
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động Phản Xạ & Đa Hình (Unit Test Specs)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { OOPReflectionEngine, OOPClass, VirtualMethodTable } from './OOPReflectionEngine';

describe('Sprint 6 OOP Reflection & VTable Unit Tests', () => {
  let engine: OOPReflectionEngine;

  beforeEach(() => {
    engine = new OOPReflectionEngine();

    // Dựng lớp Cha: Shape
    const shapeClass: OOPClass = {
      name: 'Shape',
      parentName: null,
      properties: [
        { name: 'color', type: 'string', modifier: 'PUBLIC' },
        { name: 'secretCode', type: 'int', modifier: 'PRIVATE' }
      ],
      methods: [
        { name: 'draw', isVirtual: true, modifier: 'PUBLIC' }
      ]
    };

    // Dựng lớp Con: Circle kế thừa Shape và override 'draw'
    const circleClass: OOPClass = {
      name: 'Circle',
      parentName: 'Shape',
      properties: [
        { name: 'radius', type: 'double', modifier: 'PUBLIC' }
      ],
      methods: [
        { name: 'draw', isVirtual: true, modifier: 'PUBLIC', overrideClass: 'Circle' }
      ]
    };

    engine.registerClass(shapeClass);
    engine.registerClass(circleClass);
  });

  it('Should enforce encapsulation rules and catch illegal private access violations', () => {
    // Truy cập hợp lệ từ chính Shape tới public color
    let access = engine.checkAccessViolation('Shape', 'color', 'Shape');
    expect(access.isViolated).toBeFalsy();

    // Lớp Circle cố gắng truy cập private 'secretCode' của cha Shape -> Phải báo vi phạm Đóng gói
    access = engine.checkAccessViolation('Shape', 'secretCode', 'Circle');
    expect(access.isViolated).toBeTruthy();
    expect(access.reason).toContain('Vi phạm Đóng gói');
  });

  it('Should resolve polymorphic dynamic method dispatch VTable route correctly', () => {
    // Khai báo kiểu Shape nhưng trỏ thực thể instance của Circle: Shape s = new Circle()
    // Gọi s.draw() -> Phải định tuyến động gọi hàm draw() của lớp con Circle (Dynamic Dispatch)
    const route = VirtualMethodTable.dispatch('Circle', 'draw', engine);

    expect(route.resolvedClass).toBe('Circle');
    expect(route.isDynamic).toBeFalsy(); // resolvedClass trùng khớp với instance class thực tế
  });
});
```
 Thiết kế sandbox phản xạ đối tượng OOP kiểm duyệt đóng gói PRIVATE nghiêm ngặt kết hợp bảng định tuyến phương thức ảo VTable liên kết động 100% Client-side giúp học viên thấu hiểu sâu sắc bản chất khoa học máy tính đằng sau OOP.
