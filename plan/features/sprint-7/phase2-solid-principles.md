# ⚙️ Technical Specification - SOLID Principles & LCOM4 Mathematics (Sprint 7)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình phân tích kết dính lớp **SOLIDLCOM4Calculator** đo lường nguyên lý SRP và bộ kiểm tra tính thay thế **LiskovSubstitutionGuard** trong Sprint 7.

---

## 1. Thuật toán Tính toán Chỉ số Kết dính Lớp LCOM4 (SRP Cohesion Spec)

Nguyên lý SRP (Single Responsibility Principle) được định lượng cụ thể bằng chỉ số LCOM4 (Lack of Cohesion in Methods). Thuật toán biểu diễn các phương thức lớp thành các đỉnh đồ thị, kết nối 2 phương thức nếu chúng truy cập chung ít nhất một trường dữ liệu (field):

```typescript
export interface MethodNode {
  name: string;
  accessedFields: Set<string>;
}

export class SOLIDLCOM4Calculator {
  /**
   * Tính toán chỉ số LCOM4 (SRP Cohesion Math) bằng cách đếm số đồ thị con liên thông
   */
  public static calculateLCOM4(methods: MethodNode[]): number {
    if (methods.length === 0) return 0;

    const adj: Record<string, string[]> = {};
    methods.forEach(m => {
      adj[m.name] = [];
    });

    // Tạo các cạnh kết nối đồ thị giữa các phương thức nếu chúng có trường dữ liệu truy xuất chung
    for (let i = 0; i < methods.length; i++) {
      for (let j = i + 1; j < methods.length; j++) {
        const m1 = methods[i];
        const m2 = methods[j];
        
        // Kiểm tra tập giao các trường (Set Intersection)
        const commonFields = [...m1.accessedFields].filter(f => m2.accessedFields.has(f));
        if (commonFields.length > 0) {
          adj[m1.name].push(m2.name);
          adj[m2.name].push(m1.name);
        }
      }
    }

    // Đếm các thành phần liên thông đồ thị rời rạc bằng duyệt BFS (Breadth-First Search)
    const visited: Set<string> = new Set();
    let disjointComponentsCount = 0;

    methods.forEach(m => {
      if (!visited.has(m.name)) {
        disjointComponentsCount++;
        this.bfs(m.name, adj, visited);
      }
    });

    return disjointComponentsCount; // LCOM4 = số đồ thị rời rạc
  }

  private static bfs(start: string, adj: Record<string, string[]>, visited: Set<string>): void {
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const u = queue.shift()!;
      adj[u].forEach(v => {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
        }
      });
    }
  }
}
```

---

## 2. Bộ Kiểm Tra Quy Tắc Thay Thế Liskov (LiskovSubstitutionGuard TS)

Minh họa việc kiểm duyệt và ngăn chặn nứt vỡ hệ thống khi kế thừa sai lớp con vi phạm nguyên lý LSP:

```typescript
export interface InheritanceContract {
  baseClass: string;
  subClass: string;
  baseBehaviorContract: (args: any) => boolean;
  subBehaviorContract: (args: any) => boolean;
}

export class LiskovSubstitutionGuard {
  /**
   * Xác thực xem lớp con có phá vỡ hợp ước hành vi của lớp cha (LSP Violations Checker)
   */
  public static checkLSPViolation(contract: InheritanceContract, testInput: any): { isViolated: boolean; reason: string } {
    const baseResult = contract.baseBehaviorContract(testInput);
    const subResult = contract.subBehaviorContract(testInput);

    // Nếu lớp cha trả về kết quả hợp lệ (true) nhưng lớp con ném lỗi hoặc trả về không hợp lệ (false)
    // -> Vi phạm nguyên lý LSP!
    if (baseResult && !subResult) {
      return {
        isViolated: true,
        reason: `Vi phạm nguyên lý LSP: Lớp con '${contract.subClass}' làm hỏng hợp ước hành vi của lớp cha '${contract.baseClass}' khi nhận tham số đầu vào. Hệ thống nứt vỡ!`
      };
    }

    return { isViolated: false, reason: 'Hợp lệ' };
  }
}
```

---

## 3. Ca Kiểm Thử Tự Động Thiết Kế SOLID (Unit Test Specs)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { SOLIDLCOM4Calculator, MethodNode, LiskovSubstitutionGuard, InheritanceContract } from './SOLIDLCOM4Calculator';

describe('Sprint 7 SOLID Principles Unit Tests', () => {
  it('Should perfectly calculate LCOM4 = 1 for a high cohesive SRP Class', () => {
    const methods: MethodNode[] = [
      { name: 'getId', accessedFields: new Set(['userId']) },
      { name: 'getName', accessedFields: new Set(['userId', 'name']) }
    ];

    const lcom4 = SOLIDLCOM4Calculator.calculateLCOM4(methods);

    // LCOM4 = 1 chỉ ra lớp cực kỳ gắn kết, tuân thủ hoàn hảo SRP
    expect(lcom4).toBe(1);
  });

  it('Should calculate LCOM4 = 2 for a disjoint class violating SRP', () => {
    const methods: MethodNode[] = [
      { name: 'sendMail', accessedFields: new Set(['smtpConfig']) },
      { name: 'connectDb', accessedFields: new Set(['dbUrl']) }
    ];

    const lcom4 = SOLIDLCOM4Calculator.calculateLCOM4(methods);

    // LCOM4 = 2 chỉ ra lớp chứa 2 thành phần rời rạc, vi phạm SRP nghiêm trọng
    expect(lcom4).toBe(2);
  });

  it('Should catch LSP substitution violation during behavior contract check', () => {
    const contract: InheritanceContract = {
      baseClass: 'Bird',
      subClass: 'Ostrich', // Đà điểu không biết bay
      baseBehaviorContract: (canFly: boolean) => canFly === true,
      subBehaviorContract: (canFly: boolean) => false // Luôn ném false về bay
    };

    const check = LiskovSubstitutionGuard.checkLSPViolation(contract, true);

    expect(check.isViolated).toBeTruthy();
    expect(check.reason).toContain('Vi phạm nguyên lý LSP');
  });
});
```
 Thiết kế giải thuật tính chỉ số kết dính lớp LCOM4 rời rạc đo lường SRP và bộ kiểm soát hợp ước thay thế Liskov LSP 100% Client-side đảm bảo sinh viên thấu hiểu bản chất kỹ nghệ phần mềm chất lượng cao, sành điệu bậc nhất.
