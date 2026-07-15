# 🛠 Technical Specification - OOP Reflection Simulator & VTable Dynamic Dispatch

Tài liệu này đặc tả chi tiết bộ máy tự phản chiếu siêu dữ liệu Meta-Object Reflection Engine, giải thuật tra cứu bảng phương thức ảo VTable Lookup và mô hình tính toán tia laser bắn đa hình.

---

## 1. Bộ máy Tự Reflection & Trình cấp phát Heap ảo (OOPReflectionEngine)

Để tạo ra môi trường tương tác OOP thuần Client không cần trình biên dịch backend, lớp `OOPReflectionEngine` thực thi mô phỏng định nghĩa cấu trúc lớp và phân bổ Heap ảo:

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

  public static registerClass(config: ClassDefinition): void {
    this.classesRegistry.set(config.className, config);
  }

  /**
   * Khởi tạo đối tượng Heap Instance và tự động xây dựng bảng ảo VTable Lookup kế thừa/ghi đè
   */
  public static instantiateObject(className: string): HeapObjectInstance {
    const classDef = this.classesRegistry.get(className);
    if (!classDef) throw new Error(`Lớp ${className} chưa được đăng ký trong hệ thống.`);

    // Sinh địa chỉ nhớ Hexa ngẫu nhiên giống RAM thật
    const memAddress = `0x${(3211264 + this.addressOffset).toString(16).toUpperCase()}`;
    this.addressOffset += 16; // Nhảy ô địa chỉ tiếp theo

    const fields = new Map<string, any>();
    const vTable = new Map<string, string>();

    // 1. Duyệt chuỗi kế thừa để thu thập toàn bộ các phương thức
    const inheritanceChain: ClassDefinition[] = [];
    let current: ClassDefinition | undefined = classDef;
    while (current) {
      inheritanceChain.unshift(current); // Đẩy lớp cha lên trước để nạp đè sau
      current = current.parentClass ? this.classesRegistry.get(current.parentClass) : undefined;
    }

    // 2. Xây dựng bảng VTable từ cha xuống con để tự động ghi đè (Dynamic Dispatch Resolution)
    for (const def of inheritanceChain) {
      for (const member of def.members) {
        if (member.type === 'FIELD') {
          fields.set(member.name, null);
        } else if (member.type === 'METHOD') {
          // Ghi nhận phương thức Virtual thuộc về lớp nào thực thi thực tế
          vTable.set(member.name, def.className);
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
}
```

---

## 2. Giải thuật bắn tia Laser Phân giải Đa hình động (Dynamic Dispatch Lasers Vector Math)

Khi người dùng gọi `shape.draw()`, hạ tầng SVG tính toán đường đi của tia laser Neon bắn trực quang:
*   **Vị trí nguồn bắn (Vector Start Source):** Tâm của hàm Monaco Editor kích hoạt cuộc gọi.
*   **Vị trí trung gian VTable (VTable Lookup Pivot):** Địa chỉ ô nhớ `address` của đối tượng Heap ảo.
*   **Vị trí đích thực thi (Target Method Node):** Ô chứa phương thức thực tế đã phân giải ghi đè (ví dụ: `Circle.draw`).
*   **Công thức vector vẽ Laser phát sáng:**
    *   Sử dụng thẻ `<path>` SVG có thuộc tính stroke-glow và hoạt ảnh chạy cuộn nét đứt:
        $$d = \text{"M } X_{\text{start}} \text{ } Y_{\text{start}} \text{ L } X_{\text{vTable}} \text{ } Y_{\text{vTable}} \text{ L } X_{\text{target}} \text{ } Y_{\text{target}}\text{"}$$
    *   Tia Laser bừng sáng màu lục Neon khi phân giải đúng lớp con và màu cam Neon khi kế thừa trực tiếp từ lớp cha.
