import "server-only"

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib"
import type { QuizResultPayload } from "@/lib/examen/types"

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(/\s+/)
  let line = ""
  let cursorY = y

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    const width = font.widthOfTextAtSize(candidate, size)

    if (width <= maxWidth) {
      line = candidate
      continue
    }

    page.drawText(line, { x, y: cursorY, font, size, color: rgb(0.12, 0.12, 0.12) })
    cursorY -= lineHeight
    line = word
  }

  if (line) {
    page.drawText(line, { x, y: cursorY, font, size, color: rgb(0.12, 0.12, 0.12) })
  }

  return cursorY - lineHeight
}

function formatDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export async function buildQuizResultPdf(payload: QuizResultPayload) {
  const pdfDoc = await PDFDocument.create()
  let page = pdfDoc.addPage([612, 792])

  const sans = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const sansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const marginX = 40
  const contentWidth = 612 - marginX * 2

  page.drawRectangle({ x: 0, y: 736, width: 612, height: 56, color: rgb(0.05, 0.22, 0.45) })
  page.drawText(payload.title, {
    x: marginX,
    y: 760,
    font: sansBold,
    size: 16,
    color: rgb(1, 1, 1),
  })

  page.drawText(`Estudiante: ${payload.studentName}`, {
    x: marginX,
    y: 716,
    font: sans,
    size: 10,
    color: rgb(0.15, 0.15, 0.15),
  })
  page.drawText(`Fecha: ${formatDate(payload.submittedAtIso)}`, {
    x: marginX,
    y: 700,
    font: sans,
    size: 10,
    color: rgb(0.15, 0.15, 0.15),
  })
  page.drawText(
    `Puntaje: ${payload.score.correct}/${payload.score.total} (${payload.score.percentage}%)`,
    {
      x: marginX,
      y: 684,
      font: sansBold,
      size: 11,
      color: rgb(0.07, 0.31, 0.16),
    }
  )

  let cursorY = 654

  for (const detail of payload.score.details) {
    if (cursorY < 110) {
      page = pdfDoc.addPage([612, 792])
      cursorY = 750
    }

    page.drawText(`${detail.id}. ${detail.question}`, {
      x: marginX,
      y: cursorY,
      font: sansBold,
      size: 10,
      color: rgb(0.1, 0.1, 0.1),
      maxWidth: contentWidth,
    })
    cursorY -= 16

    cursorY = drawWrappedText(
      page,
      `Tu respuesta: ${detail.selectedOption ?? "Sin respuesta"}`,
      marginX,
      cursorY,
      sans,
      9,
      contentWidth,
      13
    )

    cursorY = drawWrappedText(
      page,
      `Respuesta correcta: ${detail.correctOption}`,
      marginX,
      cursorY,
      sans,
      9,
      contentWidth,
      13
    )

    page.drawText(`Versiculo: ${detail.verse}`, {
      x: marginX,
      y: cursorY,
      font: sans,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    })
    cursorY -= 16

    page.drawText(detail.isCorrect ? "Resultado: Correcta" : "Resultado: Incorrecta", {
      x: marginX,
      y: cursorY,
      font: sans,
      size: 9,
      color: detail.isCorrect ? rgb(0.06, 0.45, 0.2) : rgb(0.65, 0.15, 0.15),
    })

    cursorY -= 18
    page.drawLine({
      start: { x: marginX, y: cursorY },
      end: { x: marginX + contentWidth, y: cursorY },
      thickness: 0.7,
      color: rgb(0.84, 0.84, 0.84),
    })
    cursorY -= 14
  }

  return pdfDoc.save()
}
