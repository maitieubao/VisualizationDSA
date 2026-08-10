import type { PseudocodeScript, LanguageCode, CodeLine, SupportedLanguage } from '../types/pseudocode.types';
import { SUPPORTED_LANGUAGES } from '../types/pseudocode.types';
import { bubbleSortScript } from './bubble-sort.pseudocode';

const scriptRegistry: Record<string, PseudocodeScript> = {};

// ─── PS-023: Validate cấu trúc script TRƯỚC khi vào registry ───
// Chỉ bắt lỗi ở runtime trước đây (thiếu languages, lineNumber trùng, logicalId
// rỗng) → nay fail nhanh (fail-fast) ngay tại điểm đăng ký với thông báo rõ ràng.
export function validatePseudocodeScript(script: PseudocodeScript): string[] {
  const errors: string[] = [];

  if (!script || typeof script.algorithmId !== 'string' || script.algorithmId.trim() === '') {
    errors.push('script.algorithmId must be a non-empty string');
  }

  if (!Array.isArray(script.languages) || script.languages.length === 0) {
    errors.push('script.languages must be a non-empty array of LanguageCode');
    return errors;
  }

  const seenLanguage = new Set<SupportedLanguage>();
  for (const lang of script.languages as LanguageCode[]) {
    if (!SUPPORTED_LANGUAGES.includes(lang.language as SupportedLanguage)) {
      errors.push(`language '${String(lang.language)}' is not supported (expected one of: ${SUPPORTED_LANGUAGES.join(', ')})`);
    } else if (seenLanguage.has(lang.language)) {
      errors.push(`language '${lang.language}' is declared more than once`);
    } else {
      seenLanguage.add(lang.language);
    }

    if (!Array.isArray(lang.lines) || lang.lines.length === 0) {
      errors.push(`language '${String(lang.language)}' must have a non-empty lines array`);
      continue;
    }

    const seenLineNumbers = new Set<number>();
    for (const line of lang.lines as CodeLine[]) {
      if (typeof line.lineNumber !== 'number' || !Number.isInteger(line.lineNumber) || line.lineNumber <= 0) {
        errors.push(`language '${String(lang.language)}': lineNumber must be a positive integer (got '${String(line.lineNumber)}')`);
      } else if (seenLineNumbers.has(line.lineNumber)) {
        errors.push(`language '${String(lang.language)}': duplicate lineNumber ${line.lineNumber}`);
      } else {
        seenLineNumbers.add(line.lineNumber);
      }
      if (typeof line.text !== 'string' || line.text.trim() === '') {
        errors.push(`language '${String(lang.language)}' line ${String(line.lineNumber)}: text must be a non-empty string`);
      }
      if (typeof line.logicalId !== 'string' || line.logicalId.trim() === '') {
        errors.push(`language '${String(lang.language)}' line ${String(line.lineNumber)}: logicalId must be a non-empty string`);
      }
    }
  }

  return errors;
}

export function registerPseudocodeScript(script: PseudocodeScript): void {
  const errors = validatePseudocodeScript(script);
  if (errors.length > 0) {
    const message = `[scriptLoader] Invalid pseudocode script '${String(script?.algorithmId)}':\n  - ${errors.join('\n  - ')}`;
    console.error(message);
    throw new Error(message);
  }
  scriptRegistry[script.algorithmId] = script;
}

registerPseudocodeScript(bubbleSortScript);

export function loadPseudocodeScript(algorithmId: string): PseudocodeScript | null {
  // PS-017: `Object.hasOwn` thay `in` — `in` trả true cho `'toString'`/`'constructor'`
  // kế thừa từ Object.prototype, làm `loadPseudocodeScript('constructor')` trả về
  // hàm dựng → crash khi truy cập .languages.
  if (!Object.hasOwn(scriptRegistry, algorithmId)) return null;
  return scriptRegistry[algorithmId];
}

export function hasPseudocodeScript(algorithmId: string): boolean {
  return Object.hasOwn(scriptRegistry, algorithmId);
}
