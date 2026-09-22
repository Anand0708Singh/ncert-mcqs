export interface Option {
  id: string;
  text: string;
}

export interface Source {
  section: string;
  page: number;
}

export interface Question {
  id: string;
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  type: string;
  source: Source;
  tags?: string[];
}

export interface Chapter {
  chapterId: string;
  chapterTitle: string;
  questions: Question[];
}

export interface Book {
  bookId: string;
  bookTitle: string;
  chapters: Chapter[];
}

export interface TestSettings {
  mode: "practice" | "mock";
  questionCount: number;
  difficulty: "all" | "easy" | "medium" | "hard";
  chapters: string[];
  timer: number; // in minutes, 0 means no timer
  isRandomized: boolean;
}

export interface Attempt {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timeSpentMs: number;
}

export interface TestResult {
  id: string;
  date: string;
  settings: TestSettings;
  attempts: Attempt[];
  score: number;
  totalQuestions: number;
  timeTakenMs: number;
}
