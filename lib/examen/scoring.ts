import type { QuizAnswers, QuizEvaluation, QuizQuestion } from "@/lib/examen/types"

export function evaluateQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswers
): QuizEvaluation {
  const details = questions.map((question) => {
    const selectedIndex = answers[question.id]
    const hasAnswer = Number.isInteger(selectedIndex)
    const normalizedSelected = hasAnswer ? selectedIndex : null
    const isCorrect = normalizedSelected === question.correctAnswer

    return {
      id: question.id,
      question: question.question,
      selectedOption:
        normalizedSelected === null ? null : question.options[normalizedSelected],
      selectedIndex: normalizedSelected,
      correctOption: question.options[question.correctAnswer],
      correctIndex: question.correctAnswer,
      isCorrect,
      verse: question.verse,
    }
  })

  const total = questions.length
  const correct = details.filter((detail) => detail.isCorrect).length
  const unanswered = details.filter((detail) => detail.selectedIndex === null).length
  const incorrect = total - correct - unanswered
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  return {
    total,
    correct,
    incorrect,
    unanswered,
    percentage,
    details,
  }
}
