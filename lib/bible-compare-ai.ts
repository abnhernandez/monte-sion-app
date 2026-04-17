"use server"

import "server-only"

import OpenAI from "openai"

export type BibleComparisonSummaryInput = {
  reference: string
  baseVersionId?: string
  baseVersionName: string
  baseText: string
  comparisons: Array<{
    versionId: string
    versionName: string
    text: string
    similarity: number
  }>
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function summarizeBibleComparison(
  input: BibleComparisonSummaryInput
): Promise<{ summary: string }> {
  if (!input.comparisons.length) {
    throw new Error("Se requiere al menos una comparación")
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    max_tokens: 220,
    messages: [
      {
        role: "system",
        content:
          "Eres un analista bíblico breve y preciso. Resume diferencias de redacción y énfasis entre versiones en español sin inventar contexto, sin afirmar contradicciones doctrinales y sin hacer comentarios pastorales. Responde solo en español, en 2 a 4 frases claras.",
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  })

  const summary = completion.choices[0]?.message?.content?.trim()

  if (!summary) {
    throw new Error("No se pudo generar el resumen")
  }

  return { summary }
}
