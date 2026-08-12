import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import * as escodegen from 'escodegen';
import type { Node } from 'estree';
import type { CompilationResult } from '../types/compiler.types';

const LOOP_LIMIT = 20000;
const ENTRY_NAME_PATTERN = /sort|search|main|run|execute|demo/i;
const SECOND_PARAM_PATTERN = /^(n|len|length|size)$/;
const COMPARE_OPERATORS = ['>', '<', '>=', '<='];
const MAX_TRACED_VARIABLES = 6;

export function compileAndInstrument(rawJsCode: string): CompilationResult {
  try {
    const ast = acorn.parse(rawJsCode, {
      ecmaVersion: 2020,
      sourceType: 'script',
      locations: true,
    });

    instrumentAST(ast as unknown as Node);
    appendAutoInvoke(ast as unknown as import('estree').Program);

    const instrumentedCode = escodegen.generate(ast as unknown as Node);

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

interface EntryCandidate {
  name: string;
  params: import('estree').Pattern[];
}

function appendAutoInvoke(program: import('estree').Program): void {
  const candidates: EntryCandidate[] = [];
  for (const stmt of program.body) {
    if (stmt.type === 'FunctionDeclaration' && stmt.id !== null) {
      candidates.push({ name: stmt.id.name, params: stmt.params });
    } else if (stmt.type === 'VariableDeclaration') {
      for (const decl of stmt.declarations) {
        const init = decl.init;
        if (
          decl.id.type === 'Identifier' &&
          (init?.type === 'ArrowFunctionExpression' || init?.type === 'FunctionExpression')
        ) {
          candidates.push({ name: decl.id.name, params: init.params });
        }
      }
    }
  }
  if (candidates.length === 0) return;

  const calledNames = new Set<string>();
  walk.simple(program as unknown as acorn.Node, {
    CallExpression(node: acorn.Node) {
      const callee = (node as unknown as import('estree').CallExpression).callee;
      if (callee.type === 'Identifier') calledNames.add(callee.name);
    },
  });

  let notCalled = candidates.filter((candidate) => !calledNames.has(candidate.name));
  if (notCalled.length === 0) notCalled = candidates;
  const named = notCalled.filter((candidate) => ENTRY_NAME_PATTERN.test(candidate.name));
  const ordered = named.length > 0 ? named : notCalled;

  const target = ordered.find((candidate) => buildAutoInvokeArgs(candidate) !== null);
  if (!target) return;
  const args = buildAutoInvokeArgs(target);
  if (!args) return;

  const callStatement: import('estree').ExpressionStatement = {
    type: 'ExpressionStatement',
    expression: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: target.name } as import('estree').Identifier,
      arguments: args,
      optional: false,
    } as import('estree').CallExpression,
  };

  program.body.push(callStatement as import('estree').Statement);
}

function buildAutoInvokeArgs(candidate: EntryCandidate): import('estree').Expression[] | null {
  if (candidate.params.length === 1) {
    return [{ type: 'Identifier', name: 'arr' } as import('estree').Identifier];
  }
  if (candidate.params.length === 2) {
    const second = candidate.params[1];
    let secondName = '';
    if (second.type === 'Identifier') secondName = second.name;
    else if (second.type === 'AssignmentPattern' && second.left.type === 'Identifier') {
      secondName = second.left.name;
    } else if (second.type === 'RestElement' && second.argument.type === 'Identifier') {
      secondName = second.argument.name;
    }
    if (secondName && SECOND_PARAM_PATTERN.test(secondName)) {
      return [
        { type: 'Identifier', name: 'arr' } as import('estree').Identifier,
        {
          type: 'MemberExpression',
          object: { type: 'Identifier', name: 'arr' } as import('estree').Identifier,
          property: { type: 'Identifier', name: 'length' } as import('estree').Identifier,
          computed: false,
        } as import('estree').MemberExpression,
      ];
    }
  }
  return null;
}

function instrumentAST(ast: Node): void {
  const binaryReplacements = new Map<Node, Node>();
  const assignReplacements = new Map<Node, Node>();
  const loopCounterNames: string[] = [];

  walk.ancestor(ast as acorn.Node, {
    BinaryExpression(node: acorn.Node, _state: unknown) {
      const n = node as unknown as import('estree').BinaryExpression;
      if (!COMPARE_OPERATORS.includes(n.operator)) return;
      const left = describeCompareSide(n.left);
      const right = describeCompareSide(n.right);
      if (!left.isMember && !right.isMember) return;

      const replacement = buildCompareReplacement(n, node.loc?.start.line ?? 0);
      binaryReplacements.set(node as unknown as Node, replacement);
    },

    AssignmentExpression(node: acorn.Node, _state: unknown) {
      const n = node as unknown as import('estree').AssignmentExpression;
      if (
        n.operator === '=' &&
        n.left.type === 'MemberExpression' &&
        n.left.computed
      ) {
        // CV-143: truyền tên biến thật của vị trí được gán (vd `arr[k] = x` → 'k')
        // qua cặp [tên, giá trị] — cùng hợp đồng `vars` của traceCompare (CV-124).
        const replacement: Node = {
          type: 'CallExpression',
          callee: { type: 'Identifier', name: 'traceAssign' } as Node,
          arguments: [
            n.left.object as Node,
            n.left.property as Node,
            n.right as Node,
            buildVariableTuples([n.left.property], new Map<string, string>()),
            { type: 'Literal', value: node.loc?.start.line ?? 0 } as Node,
          ],
          optional: false,
        } as unknown as Node;

        assignReplacements.set(node as unknown as Node, replacement);
      }
    },

    ForStatement(node: acorn.Node, _state: unknown, ancestors: acorn.Node[]) {
      const counterName = `__loopCounter${loopCounterNames.length}`;
      loopCounterNames.push(counterName);
      injectLoopGuard(node as unknown as import('estree').ForStatement, counterName);
      wrapLoopWithReset(node as unknown as import('estree').Statement, ancestors, counterName);
    },

    ForInStatement(node: acorn.Node, _state: unknown, ancestors: acorn.Node[]) {
      const counterName = `__loopCounter${loopCounterNames.length}`;
      loopCounterNames.push(counterName);
      injectLoopGuard(node as unknown as import('estree').ForInStatement, counterName);
      wrapLoopWithReset(node as unknown as import('estree').Statement, ancestors, counterName);
    },

    ForOfStatement(node: acorn.Node, _state: unknown, ancestors: acorn.Node[]) {
      const counterName = `__loopCounter${loopCounterNames.length}`;
      loopCounterNames.push(counterName);
      injectLoopGuard(node as unknown as import('estree').ForOfStatement, counterName);
      wrapLoopWithReset(node as unknown as import('estree').Statement, ancestors, counterName);
    },

    WhileStatement(node: acorn.Node, _state: unknown, ancestors: acorn.Node[]) {
      const counterName = `__loopCounter${loopCounterNames.length}`;
      loopCounterNames.push(counterName);
      injectLoopGuard(node as unknown as import('estree').WhileStatement, counterName);
      wrapLoopWithReset(node as unknown as import('estree').Statement, ancestors, counterName);
    },

    DoWhileStatement(node: acorn.Node, _state: unknown, ancestors: acorn.Node[]) {
      const counterName = `__loopCounter${loopCounterNames.length}`;
      loopCounterNames.push(counterName);
      injectLoopGuard(node as unknown as import('estree').DoWhileStatement, counterName);
      wrapLoopWithReset(node as unknown as import('estree').Statement, ancestors, counterName);
    },
  });

  if (loopCounterNames.length > 0) {
    const declaration: import('estree').VariableDeclaration = {
      type: 'VariableDeclaration',
      kind: 'let',
      declarations: loopCounterNames.map((name) => ({
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name } as import('estree').Identifier,
        init: { type: 'Literal', value: 0 },
      })),
    };
    // Chèn SAU directive đầu Program (vd "use strict") để không demote strict mode.
    const program = ast as unknown as import('estree').Program;
    let insertIndex = 0;
    while (insertIndex < program.body.length && isDirectiveStatement(program.body[insertIndex])) {
      insertIndex++;
    }
    program.body.splice(insertIndex, 0, declaration as import('estree').Statement);
  }

  applyReplacements(ast, binaryReplacements);
  applyReplacements(ast, assignReplacements);
}

function isDirectiveStatement(
  stmt: import('estree').Statement | import('estree').ModuleDeclaration,
): boolean {
  return (
    stmt.type === 'ExpressionStatement' &&
    (stmt as import('estree').ExpressionStatement).expression.type === 'Literal' &&
    typeof ((stmt as import('estree').ExpressionStatement).expression as import('estree').Literal)
      .value === 'string'
  );
}

interface CompareSide {
  isMember: boolean;
  expr: Node;
}

function describeCompareSide(side: import('estree').Expression | import('estree').PrivateIdentifier): CompareSide {
  if (side.type === 'MemberExpression' && side.computed) {
    return { isMember: true, expr: side.property as Node };
  }
  return { isMember: false, expr: side as Node };
}

function collectUpdateExpressions(expr: Node): Array<Node> {
  const updates: Array<Node> = [];
  walk.simple(expr as acorn.Node, {
    UpdateExpression(node: acorn.Node) {
      updates.push(node as unknown as Node);
    },
  });
  return updates;
}

function collectSideIdentifiers(expr: Node): Array<[string, Node]> {
  const result: Array<[string, Node]> = [];
  const seen = new Set<string>();
  walk.ancestor(expr as acorn.Node, {
    Identifier(node: acorn.Node, _state: unknown, ancestors: acorn.Node[]) {
      const id = node as unknown as import('estree').Identifier;
      if (seen.has(id.name)) return;
      for (let i = ancestors.length - 2; i >= 0; i--) {
        const anc = ancestors[i] as unknown as import('estree').MemberExpression | undefined;
        if (!anc || typeof anc !== 'object' || anc.type !== 'MemberExpression') continue;
        if (anc.object === (node as unknown as Node)) return;
        if (!anc.computed && anc.property === (node as unknown as Node)) return;
      }
      seen.add(id.name);
      result.push([id.name, id as unknown as Node]);
    },
  });
  return result;
}

function cloneWithBindings(node: Node, bindings: Map<Node, string>): Node {
  if (bindings.has(node)) {
    return { type: 'Identifier', name: bindings.get(node)! } as Node;
  }
  if (Array.isArray(node)) {
    return node.map((child) =>
      child && typeof child === 'object' ? cloneWithBindings(child as Node, bindings) : child,
    ) as unknown as Node;
  }
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(node)) {
      const value = (node as unknown as Record<string, unknown>)[key];
      if (Array.isArray(value)) {
        out[key] = value.map((child) =>
          child && typeof child === 'object' ? cloneWithBindings(child as Node, bindings) : child,
        );
      } else if (value && typeof value === 'object') {
        out[key] = cloneWithBindings(value as Node, bindings);
      } else {
        out[key] = value;
      }
    }
    return out as unknown as Node;
  }
  return node;
}

function buildVariableTuples(
  sides: Array<import('estree').Expression | import('estree').PrivateIdentifier>,
  nameToLocal: Map<string, string>,
): Node {
  const pairs: Array<[string, Node]> = [];
  const seen = new Set<string>();
  for (const side of sides) {
    if (side.type === 'PrivateIdentifier') continue;
    for (const [name] of collectSideIdentifiers(side as Node)) {
      if (seen.has(name) || pairs.length >= MAX_TRACED_VARIABLES) continue;
      seen.add(name);
      const local = nameToLocal.get(name);
      const valueExpr: Node = local
        ? ({ type: 'Identifier', name: local } as Node)
        : ({ type: 'Identifier', name } as Node);
      pairs.push([name, valueExpr]);
    }
  }
  return {
    type: 'ArrayExpression',
    elements: pairs.map(([name, value]) => ({
      type: 'ArrayExpression',
      elements: [{ type: 'Literal', value: name } as Node, value],
    })),
  } as Node;
}

function buildCompareReplacement(
  n: import('estree').BinaryExpression,
  line: number,
): Node {
  const left = describeCompareSide(n.left);
  const right = describeCompareSide(n.right);

  const updateNodes: Array<Node> = [
    ...collectUpdateExpressions(left.expr),
    ...collectUpdateExpressions(right.expr),
  ];
  const needsWrapper = updateNodes.length > 0;

  const bindings = new Map<Node, string>();
  const nameToLocal = new Map<string, string>();
  if (needsWrapper) {
    updateNodes.forEach((update, index) => {
      const local = `__cv${index}`;
      bindings.set(update, local);
      const argument = (update as unknown as import('estree').UpdateExpression).argument;
      if (argument.type === 'Identifier') nameToLocal.set(argument.name, local);
    });
  }

  const leftExpr = needsWrapper ? cloneWithBindings(left.expr, bindings) : left.expr;
  const rightExpr = needsWrapper ? cloneWithBindings(right.expr, bindings) : right.expr;

  const arrayArg: Node =
    left.isMember && n.left.type === 'MemberExpression'
      ? (n.left.object as Node)
      : n.right.type === 'MemberExpression'
        ? (n.right.object as Node)
        : ({ type: 'Literal', value: null } as Node);

  const call: Node = {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'traceCompare' } as Node,
    arguments: [
      arrayArg,
      leftExpr,
      rightExpr,
      buildVariableTuples([n.left, n.right], nameToLocal),
      { type: 'Literal', value: n.operator } as Node,
      { type: 'Literal', value: left.isMember ? false : true } as Node,
      { type: 'Literal', value: right.isMember ? false : true } as Node,
      { type: 'Literal', value: line } as Node,
    ],
    optional: false,
  } as unknown as Node;

  if (!needsWrapper) return call;

  // Bọc IIFE: ràng buộc chỉ số có side-effect (vd arr[i++]) vào biến cục bộ trước
  // khi đọc — đảm bảo ngữ nghĩa "đọc trước, tăng sau" và chỉ số frame khớp giá trị cũ.
  const varDecl: import('estree').VariableDeclaration = {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: updateNodes.map((update) => ({
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: bindings.get(update)! } as import('estree').Identifier,
      init: update as import('estree').Expression,
    })),
  };

  return {
    type: 'CallExpression',
    callee: {
      type: 'FunctionExpression',
      id: null,
      params: [],
      body: {
        type: 'BlockStatement',
        body: [
          varDecl as import('estree').Statement,
          {
            type: 'ReturnStatement',
            argument: call,
          } as import('estree').ReturnStatement,
        ],
      },
    } as unknown as Node,
    arguments: [],
    optional: false,
  } as unknown as Node;
}

function injectLoopGuard(
  node:
    | import('estree').ForStatement
    | import('estree').ForInStatement
    | import('estree').ForOfStatement
    | import('estree').WhileStatement
    | import('estree').DoWhileStatement,
  counterName: string,
): void {
  const guardStatement = {
    type: 'IfStatement',
    test: {
      type: 'BinaryExpression',
      operator: '>',
      left: {
        type: 'UpdateExpression',
        operator: '++',
        argument: { type: 'Identifier', name: counterName },
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
            value: `[LOOP_LIMIT_EXCEEDED] Phát hiện vượt ngưỡng lặp: thuật toán đã chạy quá ${LOOP_LIMIT} lượt lặp — có thể do cấu trúc lặp vô hạn hoặc thuật toán chạy quá lâu.`,
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

function wrapLoopWithReset(
  node: import('estree').Statement,
  ancestors: acorn.Node[],
  counterName: string,
): void {
  if (ancestors.length < 2) return;
  const parent = ancestors[ancestors.length - 2];

  const resetStatement: import('estree').ExpressionStatement = {
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: { type: 'Identifier', name: counterName } as import('estree').Identifier,
      right: { type: 'Literal', value: 0 },
    } as import('estree').AssignmentExpression,
  };

  const wrapper: import('estree').BlockStatement = {
    type: 'BlockStatement',
    body: [resetStatement as import('estree').Statement, node],
  };

  replaceInParent(parent, node, wrapper as import('estree').Statement);
}

function replaceInParent(
  parent: acorn.Node,
  node: unknown,
  replacement: import('estree').Statement,
): void {
  for (const key of Object.keys(parent)) {
    if (key === 'type') continue;
    const value = (parent as unknown as Record<string, unknown>)[key];

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (value[i] === node) {
          value[i] = replacement;
          return;
        }
      }
    } else if (value === node) {
      (parent as unknown as Record<string, unknown>)[key] = replacement;
      return;
    }
  }
}

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
