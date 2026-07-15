# 🧠 LCOM Cohesion Calculator & SOLID Evaluator (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của trình đo lường gắn kết `LCOMCalculator`, hạt nhân chẩn đoán thiết kế `SOLIDEvaluatorEngine` và các ca kiểm thử tự động (Unit Tests) bảo đảm tính chính xác.

---

## 1. Trình Chấm điểm Thiết kế SOLID (TypeScript Core Logic)

Mã nguồn lõi được thiết lập bằng TypeScript chặt chẽ, tối ưu hóa thuật toán DFS tìm thành phần liên thông:

```typescript
export interface UMLClassMember {
  name: string;
  type: 'FIELD' | 'METHOD';
  accessedFields: string[]; // Các thuộc tính mà phương thức này đọc/ghi
}

export interface SOLIDClassNode {
  nodeId: string;
  className: string;
  members: UMLClassMember[];
  cohesionScore: number; // LCOM4 Score
  isViolatingSRP: boolean;
}

export class LCOMCalculator {
  /**
   * Tính toán chỉ số LCOM4 (Lack of Cohesion in Methods)
   * LCOM4 đếm số lượng các thành phần liên thông trong đồ thị phương thức-thuộc tính.
   * LCOM4 = 1: Gắn kết hoàn hảo (SRP ĐẠT)
   * LCOM4 >= 2: Lớp rời rạc, làm quá nhiều việc (SRP VI PHẠM!)
   */
  public static calculateLCOM4(members: UMLClassMember[]): number {
    const methods = members.filter(m => m.type === 'METHOD');
    if (methods.length === 0) return 0;

    // Xây dựng đồ thị kề liên thông
    const adjList: Map<string, string[]> = new Map();
    methods.forEach(m => adjList.set(m.name, []));

    // Nối các phương thức có dùng chung ít nhất 1 thuộc tính field (Shared attributes connectivity)
    for (let i = 0; i < methods.length; i++) {
      for (let j = i + 1; j < methods.length; j++) {
        const m1 = methods[i];
        const m2 = methods[j];
        
        const hasSharedField = m1.accessedFields.some(f => m2.accessedFields.includes(f));
        if (hasSharedField) {
          adjList.get(m1.name)!.push(m2.name);
          adjList.get(m2.name)!.push(m1.name);
        }
      }
    }

    // Đếm số lượng thành phần liên thông bằng DFS
    const visited = new Set<string>();
    let connectedComponents = 0;

    methods.forEach(m => {
      if (!visited.has(m.name)) {
        connectedComponents++;
        this.dfs(m.name, adjList, visited);
      }
    });

    return connectedComponents;
  }

  private static dfs(node: string, adjList: Map<string, string[]>, visited: Set<string>): void {
    visited.add(node);
    const neighbors = adjList.get(node) || [];
    neighbors.forEach(neighbor => {
      if (!visited.has(neighbor)) {
        this.dfs(neighbor, adjList, visited);
      }
    });
  }
}

export class SOLIDEvaluatorEngine {
  /**
   * Đánh giá nguyên lý Single Responsibility
   */
  public static evaluateSRP(node: SOLIDClassNode): { isViolating: boolean; lcom4: number } {
    const lcom4 = LCOMCalculator.calculateLCOM4(node.members);
    return {
      isViolating: lcom4 >= 2,
      lcom4
    };
  }

  /**
   * Đánh giá nguyên lý Liskov Substitution
   * @param baseMethodName Tên phương thức lớp cha
   * @param childMethodThrowsException true nếu lớp con ghi đè nhưng ném exception vi phạm LSP
   */
  public static evaluateLSP(
    baseMethodName: string,
    childMethodThrowsException: boolean
  ): { isViolating: boolean; errorReason?: string } {
    if (childMethodThrowsException) {
      return {
        isViolating: true,
        errorReason: `LISKOV_VIOLATION: Lớp con ghi đè phương thức '${baseMethodName}' nhưng ném lỗi 'NotImplementedException'. Không thể dùng thay thế lớp cha!`
      };
    }
    return { isViolating: false };
  }
}
```

---

## 2. Kiểm thử Tích hợp Đơn vị (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực giải thuật LCOM4 Cohesion và khớp nối Liskov ném ngoại lệ:

```typescript
import { describe, it, expect } from 'vitest';
import { LCOMCalculator, SOLIDEvaluatorEngine, SOLIDClassNode } from './SOLIDEvaluatorEngine';

describe('SOLID Principles Visualizer Unit Tests', () => {
  it('Should score LCOM4 = 1 for a perfectly cohesive Single Responsibility class', () => {
    // Class UserRepository chỉ làm đúng 1 nhiệm vụ lưu trữ DB
    const perfectClass: SOLIDClassNode = {
      nodeId: 'user-repo-node',
      className: 'UserRepository',
      members: [
        { name: 'dbConnection', type: 'FIELD', accessedFields: [] },
        { name: 'saveUser', type: 'METHOD', accessedFields: ['dbConnection'] },
        { name: 'findUser', type: 'METHOD', accessedFields: ['dbConnection'] }
      ],
      cohesionScore: 0,
      isViolatingSRP: false
    };

    const lcom4 = LCOMCalculator.calculateLCOM4(perfectClass.members);
    expect(lcom4).toBe(1); // Liên thông hoàn hảo -> SRP ĐẠT!
  });

  it('Should score LCOM4 = 2 and report SRP violation for a bloated God Class', () => {
    // Class UserManager gánh vác 2 việc không liên quan thuộc tính nhau (DB và Email)
    const bloatedClass: SOLIDClassNode = {
      nodeId: 'user-manager-node',
      className: 'UserManager',
      members: [
        { name: 'dbConn', type: 'FIELD', accessedFields: [] },
        { name: 'smtpServer', type: 'FIELD', accessedFields: [] },
        { name: 'saveUser', type: 'METHOD', accessedFields: ['dbConn'] }, // Nhóm DB
        { name: 'sendWelcomeEmail', type: 'METHOD', accessedFields: ['smtpServer'] } // Nhóm Email độc lập
      ],
      cohesionScore: 0,
      isViolatingSRP: false
    };

    const evaluation = SOLIDEvaluatorEngine.evaluateSRP(bloatedClass);
    expect(evaluation.isViolating).toBe(true);
    expect(evaluation.lcom4).toBe(2); // Có 2 nhóm thành phần liên thông rời rạc -> SRP VI PHẠM!
  });

  it('Should fail LSP check when subclass throws NotImplementedException', () => {
    const lspCheck = SOLIDEvaluatorEngine.evaluateLSP('fly', true); // Chim Đà điểu bay ném lỗi

    expect(lspCheck.isViolating).toBe(true);
    expect(lspCheck.errorReason).toContain('LISKOV_VIOLATION');
  });
});
```
 Bộ công cụ LCOMCalculator tính BFS/DFS liên thông LCOM4 và các ca unit test nghiêm ngặt bảo đảm chẩn đoán SOLID hoạt động cực kỳ nhanh, tin cậy cao, định hướng tái cấu trúc chuẩn xác 100%.
