"use server"

import { getSupabaseServer } from "@/lib/supabase-server"
import type { QuizQuestion } from "@/lib/examen/types"

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 🔥 CLAVE: convertir A/B/C/D → índice
function mapCorrectOption(letter: string) {
  return letter.charCodeAt(0) - 65
}

export async function loadExamQuestionsAction(): Promise<QuizQuestion[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase
    .from("question_bank")
    .select(`
      id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      verse
    `)
    .eq("active", true)
    .limit(30)

  if (error || !data) {
    console.error("DB ERROR:", error)
    return []
  }

  const mapped: QuizQuestion[] = data.map((row: any) => ({
    id: row.id,
    question: row.question,
    options: [
      row.option_a,
      row.option_b,
      row.option_c,
      row.option_d,
    ],
    correctAnswer: mapCorrectOption(row.correct_option), // 🔥 FIX CLAVE
    verse: row.verse,
  }))

  return shuffle(mapped)
}