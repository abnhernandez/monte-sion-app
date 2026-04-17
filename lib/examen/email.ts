import "server-only"

import nodemailer from "nodemailer"
import type { QuizResultPayload } from "@/lib/examen/types"
import { buildQuizResultPdf } from "@/lib/examen/pdf"

function getSmtpConfig() {
  const host = process.env.SMTP_HOST ?? process.env.EMAIL_HOST
  const port = Number(process.env.SMTP_PORT ?? process.env.EMAIL_PORT ?? 0)
  const user = process.env.SMTP_USER ?? process.env.EMAIL_USER
  const pass = process.env.SMTP_PASS ?? process.env.EMAIL_PASSWORD

  if (!host || !port || !user || !pass) {
    return null
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  }
}

export async function sendQuizResultEmail(input: {
  to: string
  result: QuizResultPayload
}) {
  const smtpConfig = getSmtpConfig()
  const from = process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? process.env.EMAIL_USER

  if (!smtpConfig || !from) {
    throw new Error("SMTP no configurado en variables de entorno")
  }

  const transporter = nodemailer.createTransport(smtpConfig)
  const pdfBytes = await buildQuizResultPdf(input.result)

  const safeName = (input.result.studentName || "estudiante")
    .toLowerCase()
    .replace(/\s+/g, "-")

  await transporter.sendMail({
    from,
    to: input.to,
    subject: `Resultado del examen biblico - ${input.result.studentName}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;padding:24px;background:#f8fafc;color:#0f172a">
        <h2 style="margin:0 0 8px">Resultado del examen biblico</h2>
        <p style="margin:0 0 8px"><strong>Estudiante:</strong> ${input.result.studentName}</p>
        <p style="margin:0 0 8px"><strong>Puntaje:</strong> ${input.result.score.correct}/${input.result.score.total} (${input.result.score.percentage}%)</p>
        <p style="margin:0">Adjuntamos el PDF con el detalle completo de respuestas.</p>
      </div>
    `,
    attachments: [
      {
        filename: `resultado-examen-${safeName}.pdf`,
        content: Buffer.from(pdfBytes),
        contentType: "application/pdf",
      },
    ],
  })
}
