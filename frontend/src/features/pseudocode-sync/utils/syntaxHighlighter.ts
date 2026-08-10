/**
 * Syntax Highlighter cho bảng mã giả đa ngôn ngữ (Pseudocode Sync).
 *
 * PS-003 (P0): Tokenizer MỘT LƯỢT chạy trên TEXT GỐC — alternation regex
 * `(comment|string|apiFunc|keyword|number|punct)` khớp raw text, từng token
 * được ESCAPE (`&` `<` `>`) trước khi nối chuỗi HTML. KHÔNG bao giờ chạy
 * regex lên HTML đã sinh span (nguyên nhân chữ rác CSS `#60a5fa` trước đây:
 * 3 regex pass cuối đã bọc ký tự bên trong attribute `style`).
 *
 * PS-039 (P2): Bộ keyword/API được tách theo từng ngôn ngữ — `def/in/range/len`
 * chỉ được tô trong Python, `print` chỉ là API function trong Python, keyword
 * chuẩn riêng cho từng ngôn ngữ.
 *
 * PS-036 (P3): Dòng trống hoặc chỉ chứa khoảng trắng trả về chuỗi rỗng —
 * không render ký tự `//` giả.
 */

export type HighlightLanguage = 'pseudocode' | 'cpp' | 'java' | 'python' | 'javascript';

// ─── Bộ token theo ngôn ngữ (PS-039) ──────────────────────────────────────────

const KEYWORDS: Record<HighlightLanguage, readonly string[]> = {
  pseudocode: [
    'if', 'else', 'then', 'for', 'while', 'do', 'to', 'from', 'in',
    'return', 'end', 'function', 'input', 'output', 'and', 'or', 'not',
  ],
  cpp: [
    'void', 'int', 'double', 'float', 'char', 'bool', 'true', 'false',
    'for', 'if', 'else', 'while', 'return', 'class', 'new', 'public',
    'private', 'protected', 'struct', 'const', 'static', 'using',
    'namespace', 'std', 'break', 'continue', 'nullptr',
  ],
  java: [
    'void', 'int', 'double', 'float', 'char', 'long', 'boolean', 'true', 'false',
    'for', 'if', 'else', 'while', 'return', 'class', 'new', 'public',
    'private', 'protected', 'static', 'final', 'this', 'null', 'throw',
    'try', 'catch', 'switch', 'case', 'break', 'continue',
  ],
  python: [
    'def', 'in', 'range', 'len', 'if', 'elif', 'else', 'for', 'while',
    'return', 'class', 'not', 'and', 'or', 'True', 'False', 'None',
    'import', 'from', 'as', 'with', 'lambda', 'pass', 'break', 'continue', 'is',
  ],
  javascript: [
    'function', 'let', 'const', 'var', 'for', 'if', 'else', 'while',
    'return', 'class', 'new', 'true', 'false', 'null', 'undefined', 'this',
    'typeof', 'instanceof', 'throw', 'try', 'catch', 'switch', 'case',
    'break', 'continue', 'do', 'of',
  ],
};

const API_FUNCS: Record<HighlightLanguage, readonly string[]> = {
  pseudocode: ['swap', 'bubble_sort', 'bubbleSort', 'print'],
  cpp: ['swap', 'bubble_sort', 'bubbleSort'],
  java: ['swap', 'bubble_sort', 'bubbleSort'],
  python: ['print', 'swap', 'bubble_sort', 'bubbleSort'],
  javascript: ['swap', 'bubble_sort', 'bubbleSort'],
};

// Comment pattern theo ngôn ngữ: Python dùng `#`, nhánh C-family dùng `//`,
// `pseudocode` chấp nhận cả hai. Tránh `//` bị hiểu là comment trong Python
// (toán tử chia nguyên).
const COMMENT_PATTERNS: Record<HighlightLanguage, string> = {
  pseudocode: '(?:#[^\\n]*|\\/\\/[^\\n]*)',
  cpp: '\\/\\/[^\\n]*',
  java: '\\/\\/[^\\n]*',
  javascript: '\\/\\/[^\\n]*',
  python: '#[^\\n]*',
};

const STRING_PATTERN = '"(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'';
const NUMBER_PATTERN = '\\b\\d+(?:\\.\\d+)?\\b';
const PUNCT_PATTERN = '[{}()\\[\\];,:]';

// ─── Màu sắc token ────────────────────────────────────────────────────────────

const TOKEN_STYLES: Record<string, string> = {
  comment: 'color: #64748b; font-style: italic;',
  string: 'color: #a78bfa;',
  apiFunc: 'color: #22d3ee; font-weight: 500;',
  keyword: 'color: #60a5fa; font-weight: 500;',
  number: 'color: #fbbf24;',
  punct: 'color: #64748b;',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Escape từng token/chunk text gốc trước khi nối vào chuỗi HTML. */
function escapeHtml(raw: string): string {
  return raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function normalizeLanguage(language?: string): HighlightLanguage {
  if (language && language in KEYWORDS) return language as HighlightLanguage;
  return 'pseudocode';
}

function buildTokenRegex(lang: HighlightLanguage): RegExp {
  const commentSource = COMMENT_PATTERNS[lang];
  const apiFuncSource = API_FUNCS[lang].map((fn) => `\\b${fn}\\b`).join('|');
  const keywordSource = KEYWORDS[lang].map((kw) => `\\b${kw}\\b`).join('|');
  return new RegExp(
    `(${commentSource})|(${STRING_PATTERN})|(${apiFuncSource})|(${keywordSource})|(${NUMBER_PATTERN})|(${PUNCT_PATTERN})`,
    'g',
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function highlightSyntax(text: string, language?: string): string {
  // PS-036: dòng trống / chỉ khoảng trắng → không render `//` giả.
  if (!text || text.trim() === '') return '';

  const lang = normalizeLanguage(language);
  const tokenRegex = buildTokenRegex(lang);

  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // MỘT LƯỢT quét trên raw text: token khớp → escape + bọc span;
  // phần chữ giữa các token → escape trần.
  while ((match = tokenRegex.exec(text)) !== null) {
    result += escapeHtml(text.slice(lastIndex, match.index));

    const token = match[0];
    // Nhóm khớp theo thứ tự alternation: 1=comment 2=string 3=apiFunc
    // 4=keyword 5=number 6=punct.
    const styleKey = match[1]
      ? 'comment'
      : match[2]
        ? 'string'
        : match[3]
          ? 'apiFunc'
          : match[4]
            ? 'keyword'
            : match[5]
              ? 'number'
              : 'punct';

    result += `<span style="${TOKEN_STYLES[styleKey]}">${escapeHtml(token)}</span>`;
    lastIndex = match.index + token.length;

    // Phòng tránh vòng lặp vô hạn nếu regex rỗng tại vị trí hiện tại.
    if (match.index === tokenRegex.lastIndex) tokenRegex.lastIndex++;
  }

  result += escapeHtml(text.slice(lastIndex));
  return result;
}
