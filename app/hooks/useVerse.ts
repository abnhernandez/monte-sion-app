"use client"

import { useState, useCallback } from "react"
import { getVerseFromReference } from "@/lib/bible-actions"

interface UseVerseResult {
	verseText: string
	loading: boolean
	error: string | null
	fetchVerse: (reference: string) => Promise<void>
	reference: string | null
}

export function useVerse(): UseVerseResult {
	const [verseText, setVerseText] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string | null>(null)
	const [reference, setReference] = useState<string | null>(null)

	const fetchVerse = useCallback(async (verseReference: string) => {
		if (!verseReference.trim()) {
			setError("Referencia vacía")
			return
		}

		setLoading(true)
		setError(null)
		setVerseText("")

		try {
			const result = await getVerseFromReference(verseReference)

			if (result.text && result.text !== "No se pudo cargar el pasaje") {
				setVerseText(result.text)
				setReference(result.reference)
				setError(null)
			} else {
				setError(`No se encontró el versículo: ${verseReference}`)
				setVerseText("")
				setReference(null)
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : "Error desconocido"
			setError(`Error al cargar el versículo: ${message}`)
			setVerseText("")
			setReference(null)
		} finally {
			setLoading(false)
		}
	}, [])

	return { verseText, loading, error, fetchVerse, reference }
}
