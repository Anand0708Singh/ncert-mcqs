import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import type { TestResult, TestSettings, Attempt, Question } from '../types';

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface AppState {
  // User Data
  testHistory: TestResult[];
  bookmarkedQuestions: string[];
  
  // Data caching
  metadata: any | null;
  loadedChapters: Record<string, Question[]>;

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
  loadMetadata: () => Promise<void>;
  loadChapter: (bookId: string, chapterId: string) => Promise<void>;
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
    (set, get) => ({
      testHistory: [],
      bookmarkedQuestions: [],
      metadata: null,
      loadedChapters: {},
      activeBookId: 'science10',
      selectedChapters: [],
      testSettings: initialSettings,
      activeQuestions: [],
      currentQuestionIndex: 0,
      attempts: {},
      isTestActive: false,
      isTestFinished: false,
      timeRemaining: 0,

      loadMetadata: async () => {
        if (get().metadata) return;
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}question_bank/metadata.json`);
          if (res.ok) {
            const data = await res.json();
            set({ metadata: data });
          }
        } catch (e) {
          console.error("Failed to load metadata", e);
        }
      },

      loadChapter: async (bookId: string, chapterId: string) => {
        const cacheKey = `${bookId}_${chapterId}`;
        if (get().loadedChapters[cacheKey]) return;
        try {
          const res = await fetch(`${import.meta.env.BASE_URL}question_bank/${cacheKey}.json`);
          if (res.ok) {
            const data = await res.json();
            set((state) => ({
              loadedChapters: {
                ...state.loadedChapters,
                [cacheKey]: data.questions
              }
            }));
          }
        } catch (e) {
          console.error("Failed to load chapter", e);
        }
      },

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
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        testHistory: state.testHistory,
        bookmarkedQuestions: state.bookmarkedQuestions,
      }),
    }
  )
);
