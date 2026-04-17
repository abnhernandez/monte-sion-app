"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Clock3, X } from "lucide-react"
import { loadExamQuestionsAction } from "@/lib/examen/actions"
import { useVerse } from "@/app/hooks/useVerse"

const ACCENT = "#213c2d"

type Question = {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  verse: string
}

export default function BiblicalExamApp() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [timeLeft, setTimeLeft] = useState(3600)
  const [showVerse, setShowVerse] = useState(false)

  const { verseText, loading: verseLoading, fetchVerse } = useVerse()

  // =======================
  // LOAD
  // =======================
  useEffect(() => {
    loadExamQuestionsAction()
      .then((data) => setQuestions(data || []))
      .finally(() => setLoading(false))
  }, [])

  // =======================
  // TIMER
  // =======================
  useEffect(() => {
    if (submitted) return
    const t = setInterval(() => {
      setTimeLeft((p) => (p <= 1 ? 0 : p - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [submitted])

  const timerLabel = useMemo(() => {
    const m = Math.floor(timeLeft / 60)
    const s = timeLeft % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }, [timeLeft])

  const current = questions[index]
  const answeredCount = Object.keys(answers).length

  if (loading) return <Centered msg="Preparando examen..." />
  if (!questions.length) return <Centered msg="Examen no disponible" />

  // =======================
  const selectOption = (i: number) => {
    setAnswers((p) => ({ ...p, [current.id]: i }))
    setError("")
  }

  const next = () => {
    if (answers[current.id] === undefined) {
      setError("Debes responder antes de continuar")
      return
    }
    setIndex((i) => i + 1)
  }

  const prev = () => {
    setIndex((i) => i - 1)
  }

  const submit = () => {
    if (answeredCount !== questions.length) {
      setError("Responde todas las preguntas antes de enviar")
      return
    }
    setSubmitted(true)
  }

  const openVerse = async () => {
    await fetchVerse(current.verse)
    setShowVerse(true)
  }

  // =======================
  if (submitted) {
    const correct = questions.filter(q => answers[q.id] === q.correctAnswer).length
    const percentage = Math.round((correct / questions.length) * 100)

    return (
      <main className="max-w-3xl mx-auto p-6 text-center space-y-6">
        <h1 className="text-3xl font-bold">Resultado</h1>

        <div className="grid grid-cols-2 gap-4">
          <Stat label="Correctas" value={correct} />
          <Stat label="Incorrectas" value={questions.length - correct} />
          <Stat label="Sin responder" value={questions.length - answeredCount} />
          <Stat label="Porcentaje" value={`${percentage}%`} />
        </div>

        <p className="text-muted-foreground">
          {percentage >= 85 && "Dominio sólido"}
          {percentage >= 65 && percentage < 85 && "Buen nivel"}
          {percentage < 65 && "Reforzar conocimiento"}
        </p>
      </main>
    )
  }

  // =======================
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between text-sm font-medium">
        <span>Pregunta {index + 1} de {questions.length}</span>
        <span className="flex items-center gap-2">
          <Clock3 size={16}/> {timerLabel}
        </span>
      </div>

      {/* PROGRESS */}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ backgroundColor: ACCENT, width: `${(answeredCount / questions.length) * 100}%` }}
        />
      </div>

      {/* QUESTION */}
      <motion.div key={current.id}>
        {/* VERSE */}
        <button
          onClick={openVerse}
          className="mb-4 block w-270 text-center text-sm font-bold"
        >
          Ver {current.verse}
        </button>

        <h2 className="text-xl font-bold text-center mb-4">
          {current.question}
        </h2>

        <div className="space-y-3">
          {current.options.map((opt, i) => {
            const selected = answers[current.id] === i
            return (
              <button
                key={i}
                onClick={() => selectOption(i)}
                className={`w-full p-4 border rounded-xl text-left transition ${
                  selected
                    ? "border-transparent text-white"
                    : "hover:bg-muted"
                }`}
                style={selected ? { backgroundColor: ACCENT } : undefined}
              >
                <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
              </button>
            )
          })}
        </div>
      </motion.div>

      {error && (
        <p className="text-center text-rose-600 text-sm">{error}</p>
      )}

      {/* NAV */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prev}
          disabled={index === 0}
          className="opacity-70"
        >
          Anterior
        </button>

        {index === questions.length - 1 ? (
          <button
            onClick={submit}
            className="text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: ACCENT }}
          >
            Enviar examen
          </button>
        ) : (
          <button
            onClick={next}
            className="text-white px-4 py-2 rounded-lg font-old"
            style={{ backgroundColor: ACCENT }}
          >
            Siguiente
          </button>
        )}
      </div>

      {/* MODAL VERSE */}
      {showVerse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ color: ACCENT }}> 
          <div className="bg-white p-6 rounded-xl max-w-md w-full relative border border-black/10">
            <button
              onClick={() => setShowVerse(false)}
              className="absolute top-2 right-2 rounded-full p-1"
              style={{ color: ACCENT }}
            >
              <X />
            </button>

            <h3 className="font-bold mb-2" style={{ color: ACCENT }}>{current.verse}</h3>
            <p className="text-sm text-background font-bold">
              {verseLoading ? "Cargando..." : verseText}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}

function Centered({ msg }: { msg: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      {msg}
    </div>
  )
}

function Stat({ label, value }: any) {
  return (
    <div className="border rounded-xl p-4 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  )
}