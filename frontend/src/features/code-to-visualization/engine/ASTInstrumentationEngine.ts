/**
 * ASTInstrumentationEngine — Bộ máy phân tích AST & tiêm mã tracing tự động.
 *
 * Sử dụng Acorn để parse JS → AST, acorn-walk để duyệt cây,
 * escodegen để tái tạo mã nguồn đã tiêm traceCompare/traceAssign
 * và __loopCounter chống lặp vô hạn.
 */

import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import * as escodegen from 'escodegen';
import type { Node } from 'estree';
import type { CompilationResult } from '../types/compiler.types';

const LOOP_LIMIT = 5000;

/**
 * Phân tích mã nguồn thô của học sinh và tiêm mã ghi vết tự động.
 * Hỗ trợ: BinaryExpression (so sánh mảng), AssignmentExpression (hoán đổi),
 * ForStatement/WhileStatement/DoWhileStatement (chống loop vô hạn).
 */
export function compileAndInstrument(rawJsCode: string): CompilationResult {
  try {
    const ast = acorn.parse(rawJsCode, {
      ecmaVersion: 2020,
      sourceType: 'script',
      locations: true,
    });

    instrumentAST(ast as unknown as Node);
    appendAutoInvoke(ast as unknown as import('estree').Program);

    const instrumentedCode =
      `let __loopCounter = 0;\n` +
      escodegen.generate(ast as unknown as Node);

    return { success: true, instrumentedCode };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'Lỗi cú pháp không thể biên dịch AST.';
    const errorLine = extractErrorLine(err);
    return { success: false, error: errorMessage, errorLine };
  }
}

function extractErrorLine(err: unknown): number | undefined {
  if (err && typeof err === 'object' && 'loc' in err) {
    const loc = (err as { loc?: { line?: number } }).loc;
    if (loc && typeof loc.line === 'number') return loc.line;
  }
  return undefined;
}

/**
 * Tìm FunctionDeclaration ở top-level và thêm lời gọi hàm cuối chương trình.
 * Truyền tham số 'arr' từ Worker sandbox vào hàm người dùng.
 */
function appendAutoInvoke(program: import('estree').Program): void {
  const funcDecl = program.body.find(
    (stmt): stmt is import('estree').FunctionDeclaration =>
      stmt.type === 'FunctionDeclaration' && stmt.id !== null,
  );
  if (!funcDecl || !funcDecl.id) return;

  const callStatement: import('estree').ExpressionStatement = {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: funcDecl.id.name } as import('estree').Identifier,
      arguments: [{ type: 'Identifier', name: 'arr' } as import('estree').Identifier],
      optional: false,
    } as import('estree').CallExpression,
  };

  program.body.push(callStatement as import('estree').Statement);
}

/**
 * Duyệt qua cây AST và tiêm mã tracing vào các nút phù hợp.
 * Sử dụng walk.ancestor để truy cập parent context.
 */
function instrumentAST(ast: Node): void {
  const nodesToReplace: Array<{
    parent: Node;
    key: string;
    index?: number;
    replacement: Node;
  }> = [];

  const binaryReplacements = new Map<Node, Node>();
  const assignReplacements = new Map<Node, Node>();

  walk.ancestor(ast as acorn.Node, {
    BinaryExpression(node: acorn.Node, _state: unknown, ancestors: acorn.Node[]) {
      const n = node as unknown as import('estree').BinaryExpression;
      if (
        ['>', '<', '>=', '<='].includes(n.operator) &&
        n.left.type === 'MemberExpression' &&
        n.right.type === 'MemberExpression' &&
        n.left.computed &&
        n.right.computed
      ) {
        const replacement: Node = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'traceCompare' } as Node,
          arguments: [
            n.left.object as Node,
            n.left.property as Node,
            n.right.property as Node,
            { type: 'Literal', value: n.operator } as Node,
          ],
          optional: false,
        } as unknown as Node;

        binaryReplacements.set(node as unknown as Node, replacement);
      }
    },

    AssignmentExpression(node: acorn.Node, _state: unknown, ancestors: acorn.Node[]) {
      const n = node as unknown as import('estree').AssignmentExpression;
      if (
        n.operator === '=' &&
        n.left.type === 'MemberExpression' &&
        n.left.computed
      ) {
        const replacement: Node = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'traceAssign' } as Node,
          arguments: [
            n.left.object as Node,
            n.left.property as Node,
            n.right as Node,
          ],
          optional: false,
        } as unknown as Node;

        assignReplacements.set(node as unknown as Node, replacement);
      }
    },

    ForStatement(node: acorn.Node) {
      injectLoopGuard(node as unknown as import('estree').ForStatement);
    },

    WhileStatement(node: acorn.Node) {
      injectLoopGuard(node as unknown as import('estree').WhileStatement);
    },

    DoWhileStatement(node: acorn.Node) {
      injectLoopGuard(node as unknown as import('estree').DoWhileStatement);
    },
  });

  applyReplacements(ast, binaryReplacements);
  applyReplacements(ast, assignReplacements);
}

/**
 * Tiêm biến đếm __loopCounter vào đầu khối lặp.
 */
function injectLoopGuard(
  node: import('estree').ForStatement | import('estree').WhileStatement | import('estree').DoWhileStatement,
): void {
  const guardStatement = {
    type: 'IfStatement',
    test: {
      type: 'BinaryExpression',
      operator: '>',
      left: {
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: '__loopCounter' },
        prefix: true,
      },
      right: { type: 'Literal', value: LOOP_LIMIT },
    },
    consequent: {
      type: 'ThrowStatement',
      argument: {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' },
        arguments: [
          {
            type: 'Literal',
            value: `Phát hiện lỗi lặp vô hạn! Thuật toán đã vượt ngưỡng ${LOOP_LIMIT} lượt lặp.`,
          },
        ],
      },
    },
    alternate: null,
  } as unknown as import('estree').IfStatement;

  const body = node.body;
  if (body.type === 'BlockStatement') {
    body.body.unshift(guardStatement as unknown as import('estree').Statement);
  } else {
    node.body = {
      type: 'BlockStatement',
      body: [
        guardStatement as unknown as import('estree').Statement,
        body as import('estree').Statement,
      ],
    } as import('estree').BlockStatement;
  }
}

/**
 * Áp dụng thay thế node trong toàn bộ AST bằng cách duyệt đệ quy.
 */
function applyReplacements(ast: Node, replacements: Map<Node, Node>): void {
  if (replacements.size === 0) return;
  replaceInNode(ast, replacements);
}

function replaceInNode(node: Node, replacements: Map<Node, Node>): void {
  if (!node || typeof node !== 'object') return;

  for (const key of Object.keys(node)) {
    if (key === 'type') continue;
    const value = (node as unknown as Record<string, unknown>)[key];

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const child = value[i];
        if (child && typeof child === 'object' && 'type' in child) {
          const replacement = replacements.get(child as Node);
          if (replacement) {
            value[i] = replacement;
          } else {
            replaceInNode(child as Node, replacements);
          }
        }
      }
    } else if (value && typeof value === 'object' && 'type' in (value as unknown as Record<string, unknown>)) {
      const replacement = replacements.get(value as Node);
      if (replacement) {
        (node as unknown as Record<string, unknown>)[key] = replacement;
      } else {
        replaceInNode(value as Node, replacements);
      }
    }
  }
}
