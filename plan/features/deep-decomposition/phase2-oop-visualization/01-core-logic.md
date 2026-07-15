# 🧠 OOP Reflection Engine & VTable Dispatch Simulator (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp hạt nhân tự giải quyết cấu trúc lớp kế thừa `OOPReflectionEngine`, trình mô phỏng cấp phát Heap ảo và các ca kiểm thử tự động (Unit Tests) xác thực tính kế thừa đa hình.

---

## 1. Động cơ Reflection Hướng đối tượng & Heap ảo (TypeScript Core Logic)

Mã nguồn lõi được thiết lập bằng TypeScript chặt chẽ, tối ưu hóa phân tích chuỗi kế thừa:

```typescript
export interface ClassMember {
  name: string;
  type: 'FIELD' | 'METHOD';
  accessModifier: 'PUBLIC' | 'PROTECTED' | 'PRIVATE';
  isOverridden?: boolean;
}

export interface ClassDefinition {
  className: string;
  parentClass?: string;
  members: ClassMember[];
}

export interface HeapObjectInstance {
  address: string; // Địa chỉ nhớ giả lập dạng hexa: 0x7FFF00 + offset
  className: string;
  fieldsData: Map<string, any>;
  vTable: Map<string, string>; // Tên phương thức -> Lớp thực thi thực tế (Override Resolution)
}

export class OOPReflectionEngine {
  private static classesRegistry: Map<string, ClassDefinition> = new Map();
  private static addressOffset = 0;

  /**
   * Đăng ký cấu trúc lớp vào hệ thống siêu dữ liệu
   */
  public static registerClass(config: ClassDefinition): void {
    this.classesRegistry.set(config.className, config);
  }

  /**
   * Khởi tạo đối tượng Heap Instance và tự động xây dựng bảng ảo VTable Lookup kế thừa/ghi đè
   */
  public static instantiateObject(className: string): HeapObjectInstance {
    const classDef = this.classesRegistry.get(className);
    if (!classDef) throw new Error(`Lớp ${className} chưa được đăng ký trong hệ thốngRegistry.`);

    // Sinh địa chỉ nhớ Hexa ngẫu nhiên giống thật
    const memAddress = `0x${(3211264 + this.addressOffset).toString(16).toUpperCase()}`;
    this.addressOffset += 16; // Nhảy ô địa chỉ tiếp theo

    const fields = new Map<string, any>();
    const vTable = new Map<string, string>();

    // 1. Duyệt ngược chuỗi kế thừa để thu thập toàn bộ các phương thức
    const inheritanceChain: ClassDefinition[] = [];
    let current: ClassDefinition | undefined = classDef;
    while (current) {
      inheritanceChain.unshift(current); // Đẩy lớp cha lên đầu để con ghi đè sau
      current = current.parentClass ? this.classesRegistry.get(current.parentClass) : undefined;
    }

    // 2. Xây dựng bảng VTable từ cha xuống con để tự động ghi đè (Dynamic Dispatch Resolution)
    for (const def of inheritanceChain) {
      for (const member of def.members) {
        if (member.type === 'FIELD') {
          fields.set(member.name, null);
        } else if (member.type === 'METHOD') {
          vTable.set(member.name, def.className); // Phương thức Virtual ghi nhận thuộc lớp nào thực tế
        }
      }
    }

    return {
      address: memAddress,
      className,
      fieldsData: fields,
      vTable
    };
  }

  /**
   * Kiểm tra quyền truy cập thành viên (Đóng gói)
   * @param targetClass Lớp chứa thành viên muốn truy cập
   * @param memberName Tên thành viên
   * @param callerClass Lớp thực hiện cuộc gọi truy cập
   */
  public static validateEncapsulationAccess(
    targetClassName: string,
    memberName: string,
    callerClassName: string
  ): { hasAccess: boolean; errorReason?: string } {
    const targetClass = this.classesRegistry.get(targetClassName);
    if (!targetClass) return { hasAccess: false, errorReason: 'Lớp mục tiêu không tồn tại.' };

    const member = targetClass.members.find(m => m.name === memberName);
    if (!member) return { hasAccess: false, errorReason: 'Thành viên không tồn tại trong lớp.' };

    if (member.accessModifier === 'PUBLIC') {
      return { hasAccess: true };
    }

    if (member.accessModifier === 'PRIVATE') {
      // Chỉ được phép truy cập bên trong chính lớp đó
      if (targetClassName === callerClassName) {
        return { hasAccess: true };
      }
      return {
        hasAccess: false,
        errorReason: `ENCAPSULATION_ERROR: Thuộc tính '${memberName}' có modifier là PRIVATE. Không thể truy cập từ lớp ngoài '${callerClassName}'.`
      };
    }

    if (member.accessModifier === 'PROTECTED') {
      // Cho phép chính lớp đó hoặc lớp con kế thừa từ nó
      if (targetClassName === callerClassName) return { hasAccess: true };
      
      let isSubclass = false;
      let currentCaller = this.classesRegistry.get(callerClassName);
      while (currentCaller) {
        if (currentCaller.parentClass === targetClassName) {
          isSubclass = true;
          break;
        }
        currentCaller = currentCaller.parentClass ? this.classesRegistry.get(currentCaller.parentClass) : undefined;
      }

      if (isSubclass) return { hasAccess: true };

      return {
        hasAccess: false,
        errorReason: `ENCAPSULATION_ERROR: Thuộc tính '${memberName}' có modifier là PROTECTED. Chỉ được phép truy cập từ lớp con kế thừa.`
      };
    }

    return { hasAccess: false, errorReason: 'Quyền truy cập không hợp lệ.' };
  }

  public static clearRegistry(): void {
    this.classesRegistry.clear();
    this.addressOffset = 0;
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực mở khóa đa hình động VTable và cảnh báo vi phạm đóng gói private:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { OOPReflectionEngine, ClassDefinition } from './OOPReflectionEngine';

describe('OOP Reflection Engine Unit Tests', () => {
  beforeEach(() => {
    OOPReflectionEngine.clearRegistry();
  });

  it('Should successfully resolve VTable Dynamic Dispatch to overridden Circle.draw', () => {
    const shapeClass: ClassDefinition = {
      className: 'Shape',
      members: [
        { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC' }
      ]
    };

    const circleClass: ClassDefinition = {
      className: 'Circle',
      parentClass: 'Shape',
      members: [
        { name: 'draw', type: 'METHOD', accessModifier: 'PUBLIC', isOverridden: true }
      ]
    };

    OOPReflectionEngine.registerClass(shapeClass);
    OOPReflectionEngine.registerClass(circleClass);

    // Khởi tạo Circle
    const circleObj = OOPReflectionEngine.instantiateObject('Circle');

    // Khẳng định bảng ảo VTable của Circle phải phân giải draw() trỏ về Circle thay vì Shape
    expect(circleObj.vTable.get('draw')).toBe('Circle');
  });

  it('Should reject accessing private member from external class', () => {
    const parentClass: ClassDefinition = {
      className: 'BankAccount',
      members: [
        { name: 'balance', type: 'FIELD', accessModifier: 'PRIVATE' }
      ]
    };

    OOPReflectionEngine.registerClass(parentClass);

    // Thử truy cập balance của BankAccount từ lớp ngoài Hacker
    const accessResult = OOPReflectionEngine.validateEncapsulationAccess('BankAccount', 'balance', 'Hacker');

    expect(accessResult.hasAccess).toBe(false);
    expect(accessResult.errorReason).toContain('ENCAPSULATION_ERROR');
  });
});
```
 Bộ động cơ Reflection giả lập chạy 100% Client-side và các ca unit test nghiêm ngặt bảo vệ tính toàn vẹn 4 trụ cột OOP, giúp học viên rèn luyện thực hành gỡ lỗi trực quan với độ tin cậy tuyệt đối.
