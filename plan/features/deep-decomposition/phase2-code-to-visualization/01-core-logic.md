# 🧠 AST Instrumentation & Live Compiler Engine (TypeScript)

Tài liệu này đặc tả chi tiết mã nguồn TypeScript của lớp hạt nhân chịu trách nhiệm phân tích cây cú pháp trừu tượng AST (Acorn), tự động tiêm mã theo dõi trạng thái hoạt ảnh (AST Instrumenter) và tạo vết thực thi giải thuật (Execution Trace).

---

## 1. Bộ máy Phân tích AST & Tiêm mã Tracing (TypeScript Engine)

Lớp `ASTInstrumentationEngine` duyệt qua cây cú pháp JavaScript của sinh viên và tự động tái cấu trúc các dòng lệnh so sánh hoặc hoán đổi phần tử mảng số.

```typescript
import * as acorn from 'acorn';
import * as estraverse from 'estraverse';
import * as escodegen from 'escodegen';

export interface CompilationResult {
  success: boolean;
  instrumentedCode?: string;
  error?: string;
}

export class ASTInstrumentationEngine {
  /**
   * Phân tích mã nguồn thô của học sinh và tiêm mã ghi vết tự động
   */
  public static compileAndInstrument(rawJsCode: string): CompilationResult {
    try {
      // 1. Phân tích cú pháp thô sang cây AST ES6
      const ast = acorn.parse(rawJsCode, { 
        ecmaVersion: 2020, 
        sourceType: 'script' 
      }) as any;

      // 2. Duyệt cây AST và tiêm mã tracing chống treo
      estraverse.replace(ast, {
        enter(node: any, parent: any) {
          // A. Tìm kiếm phép so sánh mảng: arr[i] > arr[j]
          if (
            node.type === 'BinaryExpression' &&
            ['>', '<', '>=', '<='].includes(node.operator) &&
            node.left.type === 'MemberExpression' &&
            node.right.type === 'MemberExpression'
          ) {
            // Thay thế bằng hàm traceCompare(arr, leftIdx, rightIdx, operator)
            return {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'traceCompare' },
              arguments: [
                node.left.object,                // Đối tượng mảng (arr)
                node.left.property,              // Chỉ số trái (i)
                node.right.property,             // Chỉ số phải (j)
                { type: 'Literal', value: node.operator } // Toán tử so sánh
              ]
            };
          }

          // B. Tìm kiếm phép gán trị mảng: arr[i] = temp hoặc arr[i] = arr[j]
          if (
            node.type === 'AssignmentExpression' &&
            node.operator === '=' &&
            node.left.type === 'MemberExpression'
          ) {
            // Thay thế bằng hàm traceAssign(arr, targetIdx, valueExpression)
            return {
              type: 'CallExpression',
              callee: { type: 'Identifier', name: 'traceAssign' },
              arguments: [
                node.left.object,                // Mảng đích (arr)
                node.left.property,              // Chỉ số gán (i)
                node.right                       // Giá trị gán mới (temp hoặc arr[j])
              ]
            };
          }

          // C. Tiêm cơ chế chống treo vào các khối lặp: for, while
          if (node.type === 'WhileStatement' || node.type === 'ForStatement') {
            const body = node.body;
            
            // Xây dựng khối lệnh tiêm kiểm thử số lượt lặp __loopCounter
            const counterIncrementStatement = acorn.parse(
              `if (++__loopCounter > 5000) throw new Error("LOOP_LIMIT_EXCEEDED");`,
              { ecmaVersion: 2020 }
            ).body[0];

            if (body.type === 'BlockStatement') {
              body.body.unshift(counterIncrementStatement);
            } else {
              // Bao bọc khối lặp đơn dòng thành BlockStatement
              node.body = {
                type: 'BlockStatement',
                body: [counterIncrementStatement, body]
              };
            }
          }
        }
      });

      // 3. Tái tạo mã nguồn sạch đã được tiêm mã đầy đủ
      let instrumentedCode = escodegen.generate(ast);

      // Chèn khai báo biến đếm lặp ở đầu mã nguồn
      instrumentedCode = `let __loopCounter = 0;\n` + instrumentedCode;

      return {
        success: true,
        instrumentedCode
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Lỗi cú pháp không thể biên dịch AST.'
      };
    }
  }
}
```

---

## 2. Kiểm thử Đơn vị Tự động (Unit Test Specs)

Chúng ta xây dựng bộ unit tests xác thực quá trình tái cấu trúc cây cú pháp của sinh viên diễn ra hoàn toàn chuẩn xác:

```typescript
import { describe, it, expect } from 'vitest';
import { ASTInstrumentationEngine } from './ASTInstrumentationEngine';

describe('ASTInstrumentationEngine AST Walker Tests', () => {
  it('Should successfully instrument array comparison', () => {
    const rawCode = `if (arr[i] > arr[j]) { swap(arr, i, j); }`;
    const result = ASTInstrumentationEngine.compileAndInstrument(rawCode);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('traceCompare(arr, i, j, \'>\')');
  });

  it('Should successfully instrument array assignment swap', () => {
    const rawCode = `arr[i] = temp;`;
    const result = ASTInstrumentationEngine.compileAndInstrument(rawCode);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('traceAssign(arr, i, temp)');
  });

  it('Should successfully inject loop limits to while blocks', () => {
    const rawCode = `while(i < n) { i++; }`;
    const result = ASTInstrumentationEngine.compileAndInstrument(rawCode);

    expect(result.success).toBe(true);
    expect(result.instrumentedCode).toContain('__loopCounter');
    expect(result.instrumentedCode).toContain('LOOP_LIMIT_EXCEEDED');
  });

  it('Should return syntax error for invalid javascript code', () => {
    const brokenCode = `function broken( { if(arr[i] ) }`; // Khuyết dấu đóng ngoặc nhọn
    const result = ASTInstrumentationEngine.compileAndInstrument(brokenCode);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```
 Bộ máy tự động tiêm mã cú pháp (AST walker Engine) cam kết tính năng trực quan hóa hoạt ảnh động chạy mượt mà tức thời, hỗ trợ mọi sáng tạo viết giải thuật của sinh viên.
