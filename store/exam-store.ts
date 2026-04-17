"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import type { QuizAnswers, QuizMode } from "@/lib/examen/types"

type StartExamInput = {
  studentName: string
  mode: QuizMode
  durationMinutes: number
  totalQuestions: number
}

type ExamStore = {
  studentName: string
  mode: QuizMode
  durationMinutes: number
  totalQuestions: number
  startedAtIso: string | null
  endAtEpochMs: number | null
  submittedAtIso: string | null
  currentIndex: number
  answers: QuizAnswers
  setConfig: (input: Omit<StartExamInput, "totalQuestions">) => void
  startExam: (input: StartExamInput) => void
  setAnswer: (questionId: number, selectedIndex: number) => void
  setCurrentIndex: (nextIndex: number) => void
  submitExam: () => void
  resetExam: () => void
}

const initialState = {
  studentName: "",
  mode: "exam" as QuizMode,
  durationMinutes: 15,
  totalQuestions: 0,
  startedAtIso: null,
  endAtEpochMs: null,
  submittedAtIso: null,
  currentIndex: 0,
  answers: {} as QuizAnswers,
}

export const useExamStore = create<ExamStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setConfig: (input) => {
        set({
          studentName: input.studentName,
          mode: input.mode,
          durationMinutes: input.durationMinutes,
        })
      },
      startExam: (input) => {
        const now = Date.now()
        const endAtEpochMs = now + input.durationMinutes * 60 * 1000

        set({
          studentName: input.studentName,
          mode: input.mode,
          durationMinutes: input.durationMinutes,
          totalQuestions: input.totalQuestions,
          startedAtIso: new Date(now).toISOString(),
          endAtEpochMs,
          submittedAtIso: null,
          currentIndex: 0,
          answers: {},
        })
      },
      setAnswer: (questionId, selectedIndex) => {
        if (get().submittedAtIso) return
        set((state) => ({
          answers: {
            ...state.answers,
            [questionId]: selectedIndex,
          },
        }))
      },
      setCurrentIndex: (nextIndex) => {
        if (nextIndex < 0) return
        set({ currentIndex: nextIndex })
      },
      submitExam: () => {
        if (get().submittedAtIso) return
        set({ submittedAtIso: new Date().toISOString() })
      },
      resetExam: () => {
        set(initialState)
      },
    }),
    {
      name: "examen-quiz-v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
