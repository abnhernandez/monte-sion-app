// app/actions/password-feedback.ts
"use server"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function passwordFeedback(meta: {
  length: number
  hasUpper: boolean
  hasNumber: boolean
  hasSymbol: boolean
}) {
const prompt = `
Evalúa esta contraseña SOLO con metadatos.

Responde en una sola frase clara y entendible.
Puedes usar 1 emoji si ayuda.

Complementa con UN versículo bíblico CORTO.

REGLAS IMPORTANTES:
- NO uses siempre el mismo versículo
- VARÍA entre distintos libros (Salmos, Proverbios, Efesios, Colosenses, 1 Corintios)
- EVITA repetir Filipenses 4:13
- El versículo debe relacionarse con esfuerzo, crecimiento o sabiduría
- Mantén el texto breve y amigable

Datos:
- Longitud: ${meta.length}
- Mayúsculas: ${meta.hasUpper}
- Números: ${meta.hasNumber}
- Símbolos: ${meta.hasSymbol}
`


  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 100,
  })

  return res.choices[0].message.content
}