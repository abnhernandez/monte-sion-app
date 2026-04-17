export type QuizQuestion = {
  id: number
  question: string
  options: [string, string, string, string]
  correctAnswer: number
  verse: string
}

export type QuizMode = "exam" | "study"

export type QuizAnswers = Record<number, number>

export type QuestionResult = {
  id: number
  question: string
  selectedOption: string | null
  selectedIndex: number | null
  correctOption: string
  correctIndex: number
  isCorrect: boolean
  verse: string
}

export type QuizEvaluation = {
  total: number
  correct: number
  incorrect: number
  unanswered: number
  percentage: number
  details: QuestionResult[]
}

export type QuizResultPayload = {
  title: string
  studentName: string
  submittedAtIso: string
  mode: QuizMode
  score: QuizEvaluation
}
