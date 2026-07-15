/**
 * DebuggerYieldEngine — Bộ máy biến đổi AST tiêm Generator yield.
 *
 * Parse mã JS sinh viên bằng Acorn, duyệt AST bằng acorn-walk,
 * chuyển FunctionDeclaration → GeneratorDeclaration (function*),
 * tiêm yield { lineNumber, arrayState, variables, callStack } tại mỗi dòng thực thi,
 * tái tạo mã bằng escodegen.
 */

import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import * as escodegen from 'escodegen';
import type { Node } from 'estree';
import type { DebugCompilationResult } from '../types/debug.types';

const MAX_RECURSION_DEPTH = 500;
const LOOP_LIMIT = 5000;

/** Tên biến nội bộ engine — không được capture vào Watch Panel */
const ENGINE_RESERVED_NAMES = new Set(['__loopCounter', '__callStack', '__recursionDepth', 'arr']);

/**
 * Biên dịch mã JS thô sang dạng Generator function* với yield tại mỗi dòng.
 * Trả về chuỗi mã đã tiêm yield, sẵn sàng eval() trong sandbox.
 */
export function compileToDebugGenerator(rawJsCode: string): DebugCompilationResult {
  try {
    const ast = acorn.parse(rawJsCode, {
      ecmaVersion: 2020,
      sourceType: 'script',
      locations: true,
    });

    const program = ast as unknown as import('estree').Program;

    // 🆕 Bước 1: Thu thập tên biến THỰC TẾ người dùng khai báo (dynamic scan)
    const capturedVarNames = extractDeclaredVariableNames(program);

    convertFunctionsToGenerators(program);
    injectYieldStatements(program, capturedVarNames);
    injectLoopGuards(program);
    appendAutoInvoke(program);

    const generatorCode =
      `let __loopCounter = 0;\n` +
      `let __callStack = [];\n` +
      `let __recursionDepth = 0;\n` +
      escodegen.generate(program as unknown as Node);

    return { success: true, generatorCode };
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : 'Loi cu phap khong the bien dich AST.';
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
 * 🆕 Quét toàn bộ AST để thu thập tên biến thực tế người dùng khai báo.
 * Hỗ trợ: let/const/var declarations + biến trong for-loop init + function parameters.
 * Không capture tên nội bộ engine (ENGINE_RESERVED_NAMES).
 */
function extractDeclaredVariableNames(program: import('estree').Program): string[] {
  const names = new Set<string>();

  walk.simple(program as unknown as acorn.Node, {
    // let x = ..., const y = ..., var z = ...  (bao gồm cả for-loop init)
    VariableDeclarator(node: acorn.Node) {
      const decl = node as unknown as import('estree').VariableDeclarator;
      if (decl.id.type === 'Identifier') {
        names.add(decl.id.name);
      }
    },
    // Capture function parameters: function sort(arr, n, l, r)
    FunctionDeclaration(node: acorn.Node) {
      const func = node as unknown as import('estree').FunctionDeclaration;
      for (const param of func.params) {
        if (param.type === 'Identifier') {
          names.add(param.name);
        }
      }
    },
  });

  // Loại bỏ các tên nội bộ engine — không được hiển thị trong Watch Panel
  for (const reserved of ENGINE_RESERVED_NAMES) {
    names.delete(reserved);
  }

  return Array.from(names);
}

/**
 * Convert all FunctionDeclarations to GeneratorDeclarations (function*).
 */
function convertFunctionsToGenerators(program: import('estree').Program): void {
  walk.simple(program as unknown as acorn.Node, {
    FunctionDeclaration(node: acorn.Node) {
      const funcNode = node as unknown as import('estree').FunctionDeclaration;
      (funcNode as { generator: boolean }).generator = true;
    },
  });
}

/**
 * Inject yield statements after each executable line (ExpressionStatement, VariableDeclaration, ReturnStatement).
 * Yield payload contains: lineNumber, arrayState (spread arr), variables in scope, callStack.
 * 🆕 Nhận capturedVarNames từ dynamic scan thay vì hardcode.
 */
function injectYieldStatements(program: import('estree').Program, capturedVarNames: string[]): void {
  walk.simple(program as unknown as acorn.Node, {
    BlockStatement(node: acorn.Node) {
      const block = node as unknown as import('estree').BlockStatement;
      injectYieldsIntoBody(block.body, capturedVarNames);
    },
    Program(node: acorn.Node) {
      const prog = node as unknown as import('estree').Program;
      injectYieldsIntoBody(prog.body as import('estree').Statement[], capturedVarNames);
    },
  });
}

function injectYieldsIntoBody(body: import('estree').Statement[], capturedVarNames: string[]): void {
  const newBody: import('estree').Statement[] = [];

  for (const stmt of body) {
    newBody.push(stmt);

    const line = getStatementLine(stmt);
    if (line === null) continue;

    if (
      stmt.type === 'ExpressionStatement' ||
      stmt.type === 'VariableDeclaration' ||
      stmt.type === 'ReturnStatement'
    ) {
      const yieldStmt = createYieldStatement(line, capturedVarNames);
      newBody.push(yieldStmt);
    }
  }

  body.length = 0;
  body.push(...newBody);
}

function getStatementLine(stmt: import('estree').Statement): number | null {
  if ('loc' in stmt && stmt.loc) {
    return stmt.loc.start.line;
  }
  return null;
}

/**
 * 🆕 Create an inline IIFE that captures block-scoped variables DYNAMICALLY.
 * Nhận danh sách tên biến thực tế từ AST scan — không còn hardcode.
 * Arrow function IIFE inherits the enclosing scope, so it can access let-scoped variables.
 * Nếu biến chưa được khai báo tại điểm yield, try/catch ngăn ReferenceError.
 */
function createInlineCaptureVars(capturedVarNames: string[]): import('estree').CallExpression {
  const captureLines = capturedVarNames
    .map(name => `try { if (typeof ${name} !== 'undefined') v.${name} = ${name}; } catch(e) {}`)
    .join('\n    ');

  const captureCode = `(() => {
    var v = {};
    ${captureLines}
    return v;
  })()`;
  const parsed = acorn.parse(captureCode, { ecmaVersion: 2020, sourceType: 'script' });
  const exprStmt = (parsed as unknown as import('estree').Program).body[0] as import('estree').ExpressionStatement;
  return exprStmt.expression as import('estree').CallExpression;
}

/**
 * Create a yield expression statement:
 * yield { lineNumber: N, arrayState: typeof arr !== 'undefined' ? [...arr] : [],
 *         variables: (() => { ... })(), callStack: [...__callStack] };
 * 🆕 Nhận capturedVarNames để build IIFE capture động.
 */
function createYieldStatement(lineNumber: number, capturedVarNames: string[]): import('estree').ExpressionStatement {
  const yieldExpr: import('estree').YieldExpression = {
    type: 'YieldExpression',
    delegate: false,
    argument: {
      type: 'ObjectExpression',
      properties: [
        {
          type: 'Property',
          kind: 'init',
          key: { type: 'Identifier', name: 'lineNumber' } as import('estree').Identifier,
          value: { type: 'Literal', value: lineNumber } as import('estree').Literal,
          computed: false,
          method: false,
          shorthand: false,
        } as import('estree').Property,
        {
          type: 'Property',
          kind: 'init',
          key: { type: 'Identifier', name: 'arrayState' } as import('estree').Identifier,
          value: {
            type: 'ConditionalExpression',
            test: {
              type: 'BinaryExpression',
              operator: '!==',
              left: {
                type: 'UnaryExpression',
                operator: 'typeof',
                prefix: true,
                argument: { type: 'Identifier', name: 'arr' } as import('estree').Identifier,
              } as import('estree').UnaryExpression,
              right: { type: 'Literal', value: 'undefined' } as import('estree').Literal,
            } as import('estree').BinaryExpression,
            consequent: {
              type: 'ArrayExpression',
              elements: [{
                type: 'SpreadElement',
                argument: { type: 'Identifier', name: 'arr' } as import('estree').Identifier,
              } as import('estree').SpreadElement],
            } as import('estree').ArrayExpression,
            alternate: {
              type: 'ArrayExpression',
              elements: [],
            } as import('estree').ArrayExpression,
          } as import('estree').ConditionalExpression,
          computed: false,
          method: false,
          shorthand: false,
        } as import('estree').Property,
        {
          type: 'Property',
          kind: 'init',
          key: { type: 'Identifier', name: 'variables' } as import('estree').Identifier,
          value: createInlineCaptureVars(capturedVarNames),
          computed: false,
          method: false,
          shorthand: false,
        } as import('estree').Property,
        {
          type: 'Property',
          kind: 'init',
          key: { type: 'Identifier', name: 'callStack' } as import('estree').Identifier,
          value: {
            type: 'ArrayExpression',
            elements: [{
              type: 'SpreadElement',
              argument: { type: 'Identifier', name: '__callStack' } as import('estree').Identifier,
            } as import('estree').SpreadElement],
          } as import('estree').ArrayExpression,
          computed: false,
          method: false,
          shorthand: false,
        } as import('estree').Property,
      ],
    } as import('estree').ObjectExpression,
  };

  return {
    type: 'ExpressionStatement',
    expression: yieldExpr,
  } as import('estree').ExpressionStatement;
}

/**
 * Inject loop guards into for/while/do-while statements.
 */
function injectLoopGuards(program: import('estree').Program): void {
  walk.simple(program as unknown as acorn.Node, {
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
}

function injectLoopGuard(
  loopNode: import('estree').ForStatement | import('estree').WhileStatement | import('estree').DoWhileStatement,
): void {
  const guardStatement: import('estree').IfStatement = {
    type: 'IfStatement',
    test: {
      type: 'BinaryExpression',
      operator: '>',
      left: {
        type: 'UpdateExpression',
        operator: '++',
        prefix: true,
        argument: { type: 'Identifier', name: '__loopCounter' } as import('estree').Identifier,
      } as import('estree').UpdateExpression,
      right: { type: 'Literal', value: LOOP_LIMIT } as import('estree').Literal,
    } as import('estree').BinaryExpression,
    consequent: {
      type: 'ThrowStatement',
      argument: {
        type: 'NewExpression',
        callee: { type: 'Identifier', name: 'Error' } as import('estree').Identifier,
        arguments: [
          {
            type: 'Literal',
            value: `Vuot qua gioi han an toan ${LOOP_LIMIT} buoc lap! Kiem tra dieu kien dung cua vong lap.`,
          } as import('estree').Literal,
        ],
      } as import('estree').NewExpression,
    } as import('estree').ThrowStatement,
    alternate: null,
  };

  if (loopNode.body.type === 'BlockStatement') {
    loopNode.body.body.unshift(guardStatement);
  } else {
    loopNode.body = {
      type: 'BlockStatement',
      body: [guardStatement, loopNode.body],
    } as import('estree').BlockStatement;
  }
}

/**
 * Find top-level FunctionDeclaration and append auto-invoke + callStack management.
 */
function appendAutoInvoke(program: import('estree').Program): void {
  const funcDecl = program.body.find(
    (stmt): stmt is import('estree').FunctionDeclaration =>
      stmt.type === 'FunctionDeclaration' && stmt.id !== null,
  );
  if (!funcDecl || !funcDecl.id) return;

  const funcName = funcDecl.id.name;

  const pushCallStack: import('estree').ExpressionStatement = {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: '__callStack' } as import('estree').Identifier,
        property: { type: 'Identifier', name: 'push' } as import('estree').Identifier,
        computed: false,
        optional: false,
      } as import('estree').MemberExpression,
      arguments: [
        { type: 'Literal', value: `${funcName}(arr)` } as import('estree').Literal,
      ],
      optional: false,
    } as import('estree').CallExpression,
  };

  if (funcDecl.body.type === 'BlockStatement') {
    funcDecl.body.body.unshift(pushCallStack);

    const depthGuard: import('estree').IfStatement = {
      type: 'IfStatement',
      test: {
        type: 'BinaryExpression',
        operator: '>',
        left: {
          type: 'UpdateExpression',
          operator: '++',
          prefix: true,
          argument: { type: 'Identifier', name: '__recursionDepth' } as import('estree').Identifier,
        } as import('estree').UpdateExpression,
        right: { type: 'Literal', value: MAX_RECURSION_DEPTH } as import('estree').Literal,
      } as import('estree').BinaryExpression,
      consequent: {
        type: 'ThrowStatement',
        argument: {
          type: 'NewExpression',
          callee: { type: 'Identifier', name: 'Error' } as import('estree').Identifier,
          arguments: [
            {
              type: 'Literal',
              value: `STACK_OVERFLOW_EXCEEDED: Vuot qua ${MAX_RECURSION_DEPTH} cap de quy! Kiem tra dieu kien dung cua ham de quy.`,
            } as import('estree').Literal,
          ],
        } as import('estree').NewExpression,
      } as import('estree').ThrowStatement,
      alternate: null,
    };

    funcDecl.body.body.unshift(depthGuard);
  }

  const callYieldFrom: import('estree').ExpressionStatement = {
    type: 'ExpressionStatement',
    expression: {
      type: 'YieldExpression',
      delegate: true,
      argument: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: funcName } as import('estree').Identifier,
        arguments: [{ type: 'Identifier', name: 'arr' } as import('estree').Identifier],
        optional: false,
      } as import('estree').CallExpression,
    } as import('estree').YieldExpression,
  };

  const wrapperFunc: import('estree').FunctionDeclaration = {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: '__debugMain' } as import('estree').Identifier,
    params: [],
    body: {
      type: 'BlockStatement',
      body: [callYieldFrom],
    } as import('estree').BlockStatement,
    generator: true,
    async: false,
  };

  program.body.push(wrapperFunc as import('estree').Statement);
}
