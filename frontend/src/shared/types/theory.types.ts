export interface TheorySection {
  id: string;
  title: string;
  content: string;
  codeSample?: string;
  keywordTags?: string[];
}

export interface TheoryDocument {
  id: string;
  title: string;
  sections: TheorySection[];
}
