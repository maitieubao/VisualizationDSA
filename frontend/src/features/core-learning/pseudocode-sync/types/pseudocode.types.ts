




export type SupportedLanguage = 'cpp' | 'java' | 'python' | 'javascript';

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
