import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestResult, TestSettings, Attempt, Question } from '../types';

interface AppState {
  // User Data
  testHistory: TestResult[];
  bookmarkedQuestions: string[];
  
  // Current Test Configuration
  activeBookId: string | null;
  selectedChapters: string[];
  testSettings: TestSettings;
  
  // Active Test State
  activeQuestions: Question[];
  currentQuestionIndex: number;
  attempts: Record<string, Attempt>;
  isTestActive: boolean;
  isTestFinished: boolean;
  timeRemaining: number;
  
  // Actions
  addTestResult: (result: TestResult) => void;
  toggleBookmark: (questionId: string) => void;
  setActiveBook: (bookId: string) => void;
  toggleChapter: (chapterId: string) => void;
  setTestSettings: (settings: Partial<TestSettings>) => void;
  startTest: (questions: Question[]) => void;
  recordAttempt: (questionId: string, optionId: string, isCorrect: boolean, timeSpentMs: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  finishTest: () => void;
  resetTest: () => void;
  tickTimer: () => void;
}

const initialSettings: TestSettings = {
  mode: 'practice',
  questionCount: 10,
  difficulty: 'all',
  chapters: [],
  timer: 0,
  isRandomized: false,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      testHistory: [],
      bookmarkedQuestions: [],
      activeBookId: 'science10',
      selectedChapters: [],
      testSettings: initialSettings,
      activeQuestions: [],
      currentQuestionIndex: 0,
      attempts: {},
      isTestActive: false,
      isTestFinished: false,
      timeRemaining: 0,

      addTestResult: (result) => set((state) => ({ testHistory: [...state.testHistory, result] })),
      
      toggleBookmark: (questionId) => set((state) => ({
        bookmarkedQuestions: state.bookmarkedQuestions.includes(questionId)
          ? state.bookmarkedQuestions.filter(id => id !== questionId)
          : [...state.bookmarkedQuestions, questionId]
      })),

      setActiveBook: (bookId) => set({ activeBookId: bookId, selectedChapters: [] }),
      
      toggleChapter: (chapterId) => set((state) => {
        const chapters = state.selectedChapters.includes(chapterId)
          ? state.selectedChapters.filter(id => id !== chapterId)
          : [...state.selectedChapters, chapterId];
        return { selectedChapters: chapters, testSettings: { ...state.testSettings, chapters } };
      }),

      setTestSettings: (settings) => set((state) => ({ testSettings: { ...state.testSettings, ...settings } })),

      startTest: (questions) => set((state) => ({
        activeQuestions: questions,
        currentQuestionIndex: 0,
        attempts: {},
        isTestActive: true,
        isTestFinished: false,
        timeRemaining: state.testSettings.timer * 60,
      })),

      recordAttempt: (questionId, optionId, isCorrect, timeSpentMs) => set((state) => ({
        attempts: {
          ...state.attempts,
          [questionId]: { questionId, selectedOption: optionId, isCorrect, timeSpentMs }
        }
      })),

      nextQuestion: () => set((state) => ({
        currentQuestionIndex: Math.min(state.currentQuestionIndex + 1, state.activeQuestions.length - 1)
      })),

      prevQuestion: () => set((state) => ({
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0)
      })),

      goToQuestion: (index) => set({ currentQuestionIndex: index }),

      finishTest: () => set({ isTestActive: false, isTestFinished: true }),

      resetTest: () => set({
        activeQuestions: [],
        currentQuestionIndex: 0,
        attempts: {},
        isTestActive: false,
        isTestFinished: false,
        timeRemaining: 0
      }),

      tickTimer: () => set((state) => ({
        timeRemaining: Math.max(state.timeRemaining - 1, 0)
      })),
    }),
    {
      name: 'ncert-mcq-storage',
      partialize: (state) => ({
        testHistory: state.testHistory,
        bookmarkedQuestions: state.bookmarkedQuestions,
      }),
    }
  )
);
