export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodeLabTask {
  description: string;
  initialCode: string;
  solution: string;
  testCases: TestCase[];
}

export interface Lesson {
  id: string;
  title: string;
  algorithmId: string;
  xpReward: number;
  theoryContent: string;
  quizQuestions: QuizQuestion[];
  codelabTask: CodeLabTask;
}
