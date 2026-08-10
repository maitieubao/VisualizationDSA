




export type SupportedLanguage = 'cpp' | 'java' | 'python' | 'javascript';

// PS-023: tập ngôn ngữ hợp lệ dùng chung cho validation script khi đăng ký.
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = ['cpp', 'java', 'python', 'javascript'];

export interface CodeLine {
  lineNumber: number;
  text: string;
  logicalId: string;
}

export interface LanguageCode {
  language: SupportedLanguage;
  lines: CodeLine[];
}

export interface VariableState {
  name: string;
  value: string | number;
}

export interface PseudocodeScript {
  algorithmId: string;
  languages: LanguageCode[];
}
