'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, useTransition } from 'react'
import confetti from 'canvas-confetti'
import { BookOpen, Brain, CheckCircle2, Copy, RefreshCw } from 'lucide-react'
import { getVersiculoProgressState, getVersiculos, saveVersiculoProgress, type Versiculo } from '@/lib/bible-actions'

type DifficultyOption = {
	key: number
	label: string
	hiddenRatio: number
}

type EvaluationResult = {
	total: number
	correct: number
	score: number
	mistakes: Array<{ expected: string; typed: string }>
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
	{ key: 1, label: 'Suave', hiddenRatio: 0.18 },
	{ key: 2, label: 'Medio', hiddenRatio: 0.3 },
	{ key: 3, label: 'Alto', hiddenRatio: 0.42 },
	{ key: 4, label: 'Experto', hiddenRatio: 0.56 },
]

function cleanWord(word: string): string {
	return word
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9ñáéíóúü]/gi, '')
}

function getHiddenIndexes(words: string[], ratio: number, seed: number): number[] {
	if (words.length === 0) return []

	const totalToHide = Math.max(1, Math.min(words.length - 1, Math.floor(words.length * ratio)))
	const indexes = new Set<number>()
	let cursor = Math.abs(seed) % words.length
	const step = Math.max(1, Math.floor(words.length / totalToHide))

	while (indexes.size < totalToHide) {
		indexes.add(cursor)
		cursor = (cursor + step + seed) % words.length
		if (cursor < 0) cursor += words.length
	}

	return Array.from(indexes).sort((a, b) => a - b)
}

export default function VersiculosPage() {
	const [versiculos, setVersiculos] = useState<Versiculo[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isPending, startTransition] = useTransition()
	const [canPersistProgress, setCanPersistProgress] = useState(false)

	const [selectedId, setSelectedId] = useState<number | null>(null)
	const [practiceMode, setPracticeMode] = useState(false)
	const [examMode, setExamMode] = useState(false)
	const [examDurationSeconds, setExamDurationSeconds] = useState(120)
	const [examTimeLeft, setExamTimeLeft] = useState(120)
	const [difficulty, setDifficulty] = useState<number>(2)
	const [answers, setAnswers] = useState<string[]>([])
	const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')
	const [completedChallengeKey, setCompletedChallengeKey] = useState<string | null>(null)
	const [showEvaluation, setShowEvaluation] = useState(false)
	const [bestExamScore, setBestExamScore] = useState<number | null>(null)

	useEffect(() => {
		startTransition(async () => {
			try {
				setError(null)
				const [data, progressState] = await Promise.all([getVersiculos(), getVersiculoProgressState()])
				setVersiculos(data)
				setCanPersistProgress(progressState.isAuthenticated)

				if (progressState.progress) {
					setSelectedId(progressState.progress.current_verse_id)
					setDifficulty(progressState.progress.difficulty)
					setPracticeMode(progressState.progress.practice_mode)
					setExamMode(progressState.progress.exam_mode)
					setExamDurationSeconds(progressState.progress.exam_duration_seconds)
					setExamTimeLeft(progressState.progress.exam_duration_seconds)
					setBestExamScore(progressState.progress.best_exam_score)
				}

				if (data.length > 0) {
					const fallbackId = data[data.length - 1].id
					const requestedId = progressState.progress?.current_verse_id
					const hasRequestedId = requestedId ? data.some((verse) => verse.id === requestedId) : false
					setSelectedId(hasRequestedId ? (requestedId ?? fallbackId) : fallbackId)
				}
			} catch {
				setError('No se pudieron cargar los versiculos en este momento.')
			} finally {
				setLoading(false)
			}
		})
	}, [])

	const selectedVerse = useMemo(() => {
		if (versiculos.length === 0) return null
		return versiculos.find((verse) => verse.id === selectedId) ?? versiculos[versiculos.length - 1]
	}, [selectedId, versiculos])

	const words = useMemo(() => {
		if (!selectedVerse) return []
		return selectedVerse.texto.split(/\s+/).filter(Boolean)
	}, [selectedVerse])

	const currentDifficulty = useMemo(() => {
		return DIFFICULTY_OPTIONS.find((option) => option.key === difficulty) ?? DIFFICULTY_OPTIONS[1]
	}, [difficulty])

	const hiddenIndexes = useMemo(() => {
		if (!practiceMode || !selectedVerse) return []
		const seed = selectedVerse.id * (difficulty + 3)
		return getHiddenIndexes(words, currentDifficulty.hiddenRatio, seed)
	}, [practiceMode, selectedVerse, words, difficulty, currentDifficulty.hiddenRatio])

	const challengeKey = useMemo(() => {
		if (!selectedVerse) return 'empty'
		return `${selectedVerse.id}-${difficulty}-${hiddenIndexes.join(',')}`
	}, [selectedVerse, difficulty, hiddenIndexes])

	useEffect(() => {
		setAnswers(Array(hiddenIndexes.length).fill(''))
		setCopyState('idle')
		setShowEvaluation(false)
	}, [challengeKey, hiddenIndexes.length])

	const completionRatio = useMemo(() => {
		if (!practiceMode || hiddenIndexes.length === 0) return 0
		const completeCount = hiddenIndexes.reduce((acc, wordIndex, answerIndex) => {
			const expected = cleanWord(words[wordIndex] ?? '')
			const typed = cleanWord(answers[answerIndex] ?? '')
			return expected.length > 0 && typed === expected ? acc + 1 : acc
		}, 0)

		return Math.round((completeCount / hiddenIndexes.length) * 100)
	}, [practiceMode, hiddenIndexes, answers, words])

	const isCompleted = practiceMode && hiddenIndexes.length > 0 && completionRatio === 100
    const isExamFinished = examMode && examTimeLeft <= 0

	const evaluation = useMemo<EvaluationResult>(() => {
		if (!practiceMode || hiddenIndexes.length === 0) {
			return { total: 0, correct: 0, score: 0, mistakes: [] }
		}

		const mistakes: Array<{ expected: string; typed: string }> = []
		let correct = 0

		hiddenIndexes.forEach((wordIndex, answerIndex) => {
			const expectedRaw = words[wordIndex] ?? ''
			const typedRaw = answers[answerIndex] ?? ''
			const expected = cleanWord(expectedRaw)
			const typed = cleanWord(typedRaw)

			if (expected.length > 0 && expected === typed) {
				correct += 1
				return
			}

			mistakes.push({
				expected: expectedRaw,
				typed: typedRaw,
			})
		})

		const total = hiddenIndexes.length
		const score = total > 0 ? Math.round((correct / total) * 100) : 0

		return {
			total,
			correct,
			score,
			mistakes,
		}
	}, [practiceMode, hiddenIndexes, words, answers])

	const examScore = useMemo(() => {
		if (!examMode || !practiceMode || hiddenIndexes.length === 0) return null
		const timeBonus = Math.max(0, Math.round((examTimeLeft / examDurationSeconds) * 20))
		return Math.min(100, evaluation.score + timeBonus)
	}, [examMode, practiceMode, hiddenIndexes.length, examTimeLeft, examDurationSeconds, evaluation.score])

	const suggestedNextVerse = useMemo(() => {
		if (!selectedVerse || versiculos.length === 0) return null

		const selectedIndex = versiculos.findIndex((verse) => verse.id === selectedVerse.id)
		if (selectedIndex < 0) return null

		const stepByDifficulty: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 3 }
		const step = stepByDifficulty[difficulty] ?? 1
		const nextIndex = Math.min(versiculos.length - 1, selectedIndex + step)

		if (nextIndex === selectedIndex) {
			return versiculos[0] ?? null
		}

		return versiculos[nextIndex]
	}, [selectedVerse, versiculos, difficulty])

	useEffect(() => {
		if (!examMode || !practiceMode) return
		if (examTimeLeft <= 0) {
			setShowEvaluation(true)
			return
		}

		const timer = window.setInterval(() => {
			setExamTimeLeft((current) => Math.max(0, current - 1))
		}, 1000)

		return () => window.clearInterval(timer)
	}, [examMode, practiceMode, examTimeLeft])

	useEffect(() => {
		if (!isCompleted || completedChallengeKey === challengeKey) {
			return
		}

		setCompletedChallengeKey(challengeKey)
		confetti({
			particleCount: 120,
			spread: 75,
			origin: { y: 0.62 },
		})
	}, [isCompleted, challengeKey, completedChallengeKey])

	useEffect(() => {
		if (!showEvaluation || !examMode || examScore === null) return
		setBestExamScore((current) => (current === null ? examScore : Math.max(current, examScore)))
	}, [showEvaluation, examMode, examScore])

	useEffect(() => {
		if (!canPersistProgress || !selectedVerse) return

		const persistTimer = window.setTimeout(() => {
			void saveVersiculoProgress({
				current_verse_id: selectedVerse.id,
				difficulty,
				practice_mode: practiceMode,
				exam_mode: examMode,
				exam_duration_seconds: examDurationSeconds,
				best_exam_score: bestExamScore,
				last_score: showEvaluation ? evaluation.score : null,
			})
		}, 800)

		return () => window.clearTimeout(persistTimer)
	}, [
		canPersistProgress,
		selectedVerse,
		difficulty,
		practiceMode,
		examMode,
		examDurationSeconds,
		bestExamScore,
		showEvaluation,
		evaluation.score,
	])

	const copyVerse = async () => {
		if (!selectedVerse) return

		try {
			await navigator.clipboard.writeText(selectedVerse.texto)
			setCopyState('success')
		} catch {
			setCopyState('error')
		}

		window.setTimeout(() => setCopyState('idle'), 1800)
	}

	if (loading || isPending) {
		return <main className="p-8 text-sm text-muted-foreground">Cargando versiculos...</main>
	}

	if (error) {
		return <main className="p-8 text-sm text-red-500">{error}</main>
	}

	if (!selectedVerse) {
		return <main className="p-8 text-sm text-muted-foreground">No hay versiculos disponibles.</main>
	}

	const timerMinutes = Math.floor(examTimeLeft / 60)
	const timerSeconds = examTimeLeft % 60
	const inputsDisabled = isExamFinished

	return (
		<main className="min-h-screen bg-gradient-to-b from-amber-50/60 via-background to-background px-4 py-8 sm:px-6 lg:px-8">
			<div className="mx-auto w-full max-w-6xl space-y-8">
				<header className="rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm sm:p-8">
					<p className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-100/70 px-3 py-1 text-xs font-semibold text-amber-800">
						<Brain className="h-3.5 w-3.5" />
						Entrenamiento semanal de memoria biblica
					</p>
					<h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Versiculos para memorizar</h1>
					<p className="mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
						Lee, practica por dificultad y evalua tu progreso en tiempo real sin perder el enfoque del texto.
					</p>
				</header>

				<section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
					<article className="rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm sm:p-8">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Versiculo activo</p>
							<span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
								{selectedVerse.libro} {selectedVerse.capitulo}:{selectedVerse.versiculo}
							</span>
						</div>

						<div className="mt-5 rounded-2xl border border-border/70 bg-muted/25 p-4 sm:p-5">
							<p className="text-lg leading-9 text-foreground sm:text-xl">
								{words.map((word, index) => {
									const hiddenPosition = hiddenIndexes.indexOf(index)

									if (!practiceMode || hiddenPosition === -1) {
										return (
											<span key={`${word}-${index}`} className="mr-1.5 inline-block">
												{word}
											</span>
										)
									}

									const widthChars = Math.max(5, Math.min(14, word.length + 1))
									return (
										<input
											key={`${word}-${index}`}
											value={answers[hiddenPosition] ?? ''}
											disabled={inputsDisabled}
											onChange={(event) => {
												const next = [...answers]
												next[hiddenPosition] = event.target.value
												setAnswers(next)
											}}
											aria-label={`Palabra ${hiddenPosition + 1} oculta`}
											className="mx-1.5 mb-2 inline-block rounded-lg border border-amber-300/60 bg-background px-2 py-1 text-center text-base text-foreground outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/35"
											style={{ width: `${widthChars}ch` }}
										/>
									)
								})}
							</p>
						</div>

						<div className="mt-6 flex flex-wrap gap-3">
							<button
								type="button"
								onClick={() => setPracticeMode((current) => !current)}
								className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
							>
								{practiceMode ? 'Salir de practica' : 'Modo memorizar'}
							</button>

							<button
								type="button"
								onClick={copyVerse}
								className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
							>
								<Copy className="h-4 w-4" />
								{copyState === 'success' ? 'Copiado' : copyState === 'error' ? 'No se pudo copiar' : 'Copiar texto'}
							</button>

							<Link
								href={`/bible?book=${encodeURIComponent(selectedVerse.libro)}&chapter=${selectedVerse.capitulo}`}
								className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
							>
								<BookOpen className="h-4 w-4" />
								Abrir en Biblia
							</Link>

							{practiceMode ? (
								<button
									type="button"
									onClick={() => setShowEvaluation(true)}
									disabled={examMode && examTimeLeft > 0}
									className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-500/15 dark:text-emerald-300"
								>
									Evaluar ejercicio
								</button>
							) : null}
						</div>

						{showEvaluation ? (
							<div className="mt-5 rounded-2xl border border-border/70 bg-muted/20 p-4">
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Resultado del ejercicio</p>
								<p className="mt-2 text-sm text-foreground">
									Puntaje: <span className="font-semibold">{evaluation.score}%</span> · Correctas: {evaluation.correct}/{evaluation.total}
								</p>
								{examMode ? (
									<p className="mt-1 text-sm text-foreground">
										Puntaje examen: <span className="font-semibold">{examScore ?? 0}%</span>
									</p>
								) : null}
								{evaluation.mistakes.length === 0 ? (
									<p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
										Memorizacion completada sin errores. Excelente trabajo.
									</p>
								) : (
									<div className="mt-3 space-y-2">
										<p className="text-xs text-muted-foreground">Palabras por reforzar:</p>
										{evaluation.mistakes.slice(0, 4).map((mistake, index) => (
											<p key={`${mistake.expected}-${index}`} className="text-sm text-foreground">
												Esperada: <span className="font-semibold">{mistake.expected || '(vacia)'}</span>
												{mistake.typed ? ` · Tu respuesta: ${mistake.typed}` : ' · Sin respuesta'}
											</p>
										))}
									</div>
								)}
							</div>
						) : null}
					</article>

					<aside className="rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm sm:p-8">
						<h2 className="text-xl font-semibold">Panel de practica</h2>
						<p className="mt-2 text-sm text-muted-foreground">Ajusta dificultad y sigue tu avance por palabras completas.</p>

						<div className="mt-5 rounded-2xl border border-border/70 bg-muted/20 p-4">
							<div className="flex items-center justify-between gap-3">
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Modo examen</p>
								<button
									type="button"
									onClick={() => {
										setExamMode((current) => !current)
										setShowEvaluation(false)
										setExamTimeLeft(examDurationSeconds)
									}}
									className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
										examMode ? 'bg-foreground text-background' : 'border border-border text-foreground hover:bg-muted'
									}`}
								>
									{examMode ? 'Activo' : 'Activar'}
								</button>
							</div>

							{examMode ? (
								<div className="mt-3 space-y-3">
									<div className="flex flex-wrap gap-2">
										{[60, 120, 180].map((seconds) => (
											<button
												key={seconds}
												type="button"
												onClick={() => {
													setExamDurationSeconds(seconds)
													setExamTimeLeft(seconds)
													setShowEvaluation(false)
												}}
												className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
													examDurationSeconds === seconds
														? 'border-primary/50 bg-primary/10 text-foreground'
														: 'border-border bg-background text-foreground hover:bg-muted'
												}`}
											>
												{Math.floor(seconds / 60)} min
											</button>
										))}
									</div>

									<p className="text-sm font-semibold text-foreground">
										Tiempo: {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
									</p>
									<p className="text-xs text-muted-foreground">En examen la evaluacion se habilita al terminar el tiempo.</p>
								</div>
							) : null}
						</div>

						<div className="mt-5 space-y-2">
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Dificultad</p>
							<div className="grid grid-cols-2 gap-2">
								{DIFFICULTY_OPTIONS.map((option) => (
									<button
										key={option.key}
										type="button"
										onClick={() => setDifficulty(option.key)}
										className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
											difficulty === option.key
												? 'border-amber-500 bg-amber-100 text-amber-900'
												: 'border-border bg-background text-foreground hover:bg-muted'
										}`}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>

						<div className="mt-6 rounded-2xl border border-border/70 bg-muted/20 p-4">
							<p className="text-xs text-muted-foreground">Ocultas</p>
							<p className="mt-1 text-lg font-semibold text-foreground">
								{practiceMode ? hiddenIndexes.length : 0} de {words.length} palabras
							</p>
							<p className="mt-3 text-xs text-muted-foreground">Progreso</p>
							<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-emerald-500 transition-all"
									style={{ width: `${practiceMode ? completionRatio : 0}%` }}
								/>
							</div>
							<p className="mt-2 text-sm font-medium text-foreground">{practiceMode ? completionRatio : 0}% completado</p>
						</div>

						{isCompleted ? (
							<div className="mt-5 flex items-start gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">
								<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
								<p className="text-sm font-medium">Excelente, completaste este reto. Sube dificultad o cambia de versiculo.</p>
							</div>
						) : null}

						<button
							type="button"
							onClick={() => {
								setAnswers(Array(hiddenIndexes.length).fill(''))
								setShowEvaluation(false)
								if (examMode) {
									setExamTimeLeft(examDurationSeconds)
								}
							}}
							className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
						>
							<RefreshCw className="h-4 w-4" />
							Reiniciar intento
						</button>

						{bestExamScore !== null ? (
							<p className="mt-3 text-sm text-muted-foreground">Mejor puntaje en examen: <span className="font-semibold text-foreground">{bestExamScore}%</span></p>
						) : null}

						{canPersistProgress ? (
							<p className="mt-1 text-xs text-muted-foreground">Tu progreso se guarda automaticamente para retomar despues.</p>
						) : (
							<p className="mt-1 text-xs text-muted-foreground">Inicia sesion para guardar progreso y retomar donde te quedaste.</p>
						)}
					</aside>
				</section>

				{suggestedNextVerse ? (
					<section className="rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm sm:p-8">
						<h2 className="text-xl font-semibold">Sugerencia automatica de siguiente versiculo</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							Basada en dificultad {difficulty}, te recomendamos continuar con este pasaje.
						</p>
						<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4">
							<div>
								<p className="text-sm font-semibold text-foreground">
									{suggestedNextVerse.libro} {suggestedNextVerse.capitulo}:{suggestedNextVerse.versiculo}
								</p>
								<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{suggestedNextVerse.texto}</p>
							</div>
							<button
								type="button"
								onClick={() => {
									setSelectedId(suggestedNextVerse.id)
									setPracticeMode(true)
									setShowEvaluation(false)
									if (examMode) {
										setExamTimeLeft(examDurationSeconds)
									}
								}}
								className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
							>
								Practicar siguiente
							</button>
						</div>
					</section>
				) : null}

				<section className="rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm sm:p-8">
					<h2 className="text-xl font-semibold">Historial de versiculos</h2>
					<p className="mt-2 text-sm text-muted-foreground">Selecciona otro versiculo para practicar con la misma dinamica.</p>

					<div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{versiculos.map((verse, index) => {
							const isCurrent = verse.id === selectedVerse.id
							return (
								<button
									type="button"
									key={verse.id}
									onClick={() => {
										setSelectedId(verse.id)
										setPracticeMode(false)
									}}
									className={`rounded-2xl border p-4 text-left transition ${
										isCurrent
											? 'border-primary/40 bg-primary/5'
											: 'border-border/70 bg-background hover:bg-muted/30'
									}`}
								>
									<p className="text-xs text-muted-foreground">
										Semana {index + 1} {index === versiculos.length - 1 ? '· Actual' : ''}
									</p>
									<p className="mt-2 font-semibold text-foreground">
										{verse.libro} {verse.capitulo}:{verse.versiculo}
									</p>
									<p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{verse.texto}</p>
								</button>
							)
						})}
					</div>
				</section>
			</div>
		</main>
	)
}
