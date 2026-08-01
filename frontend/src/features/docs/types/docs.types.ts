export interface AlertItem {
  type: 'info' | 'tip' | 'warning' | 'danger';
  title?: string;
  content: string;
}

export interface UMLDiagramData {
  title: string;
  className: string;
  type?: 'class' | 'interface' | 'abstract';
  fields: { name: string; type: string; visibility: '+' | '-' | '#' }[];
  methods: { name: string; returnType: string; visibility: '+' | '-' | '#' }[];
}

export interface DocsSection {
  id: string;
  title: string;
  content: string; 
  codeSample?: string;
  codeLanguage?: string;
  keywordTags?: string[];
  alerts?: AlertItem[];
  umlDiagram?: UMLDiagramData;
}

export interface DocsDocument {
  id: string;
  title: string;
  description?: string;
  sections: DocsSection[];
  prev?: { path: string; title: string };
  next?: { path: string; title: string };
}

export interface NavItem {
  id: string;
  title: string;
  path?: string;
  children?: NavItem[];
}
