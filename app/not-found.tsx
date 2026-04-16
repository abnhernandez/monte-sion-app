"use client"

import { FormEvent, useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, ChevronRight, ArrowRight } from "lucide-react"

const SEARCH_HINTS = [
	// Eventos y Avisos
	{ keyword: "evento", href: "/eventos", category: "Eventos" },
	{ keyword: "eventos", href: "/eventos", category: "Eventos" },
	{ keyword: "aviso", href: "/avisos", category: "Avisos" },
	{ keyword: "avisos", href: "/avisos", category: "Avisos" },
	{ keyword: "noticias", href: "/avisos", category: "Avisos" },
	
	// Espiritual y Oración
	{ keyword: "orar", href: "/orar", category: "Espiritual" },
	{ keyword: "oracion", href: "/orar", category: "Espiritual" },
	{ keyword: "peticion", href: "/peticion", category: "Espiritual" },
	{ keyword: "peticiones", href: "/peticion", category: "Espiritual" },
	{ keyword: "biblia", href: "/bible", category: "Biblia" },
	{ keyword: "versiculo", href: "/versiculos", category: "Versículos" },
	{ keyword: "versiculos", href: "/versiculos", category: "Versículos" },
	
	// Educación y Estudio
	{ keyword: "leccion", href: "/lecciones", category: "Lecciones" },
	{ keyword: "lecciones", href: "/lecciones", category: "Lecciones" },
	{ keyword: "estudio", href: "/estudio", category: "Estudio" },
	
	// Comunidad y Social
	{ keyword: "iglesia", href: "/iglesia_cercana", category: "Iglesia" },
	{ keyword: "iglesias", href: "/iglesia_cercana", category: "Iglesia" },
	{ keyword: "cumpleaños", href: "/birthdays", category: "Cumpleaños" },
	{ keyword: "cumple", href: "/birthdays", category: "Cumpleaños" },
	{ keyword: "chat", href: "/chat", category: "Chat" },
	{ keyword: "mensajes", href: "/chat", category: "Chat" },
	{ keyword: "comunidad", href: "/home", category: "Comunidad" },
	
	// Campamentos
	{ keyword: "campamento", href: "/camp", category: "Campamentos" },
	{ keyword: "camp", href: "/camp", category: "Campamentos" },
	
	// Cuenta y Configuración
	{ keyword: "cuenta", href: "/account", category: "Cuenta" },
	{ keyword: "perfil", href: "/account", category: "Cuenta" },
	{ keyword: "configuracion", href: "/account", category: "Configuración" },
	{ keyword: "ajustes", href: "/account", category: "Configuración" },
	
	// Panel de Control
	{ keyword: "dashboard", href: "/dashboard", category: "Panel" },
	{ keyword: "panel", href: "/dashboard", category: "Panel" },
	{ keyword: "admin", href: "/admin", category: "Admin" },
	{ keyword: "administrador", href: "/admin", category: "Admin" },
	
	// Enlaces y Contacto
	{ keyword: "contacto", href: "/enlaces", category: "Contacto" },
	{ keyword: "enlaces", href: "/enlaces", category: "Enlaces" },
	{ keyword: "redes", href: "/enlaces", category: "Enlaces" },
]

function getFilteredSuggestions(value: string) {
	const normalized = value.trim().toLowerCase()
	
	if (!normalized) {
		return []
	}

	const filtered = SEARCH_HINTS.filter(({ keyword }) => 
		keyword.includes(normalized) || keyword.startsWith(normalized)
	)

	// Deduplicar por href y ordenar por relevancia (coincidencia exacta y longitud)
	const seen = new Set<string>()
	const unique = filtered.filter(item => {
		if (seen.has(item.href)) return false
		seen.add(item.href)
		return true
	})

	return unique.sort((a, b) => {
		const aExact = a.keyword === normalized ? 0 : 1
		const bExact = b.keyword === normalized ? 0 : 1
		if (aExact !== bExact) return aExact - bExact
		return a.keyword.length - b.keyword.length
	})
}

export default function NotFound() {
	const router = useRouter()
	const [query, setQuery] = useState("")
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const [isOpen, setIsOpen] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)
	const suggestionsRef = useRef<HTMLDivElement>(null)

	const suggestions = getFilteredSuggestions(query)

	const handleSearch = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		const cleaned = query.trim()
		if (!cleaned) {
			router.push("/")
			return
		}

		if (selectedIndex >= 0 && suggestions[selectedIndex]) {
			router.push(suggestions[selectedIndex].href)
			return
		}

		const firstMatch = suggestions[0]
		if (firstMatch) {
			router.push(firstMatch.href)
			return
		}

		router.push("/")
	}

	const handleSuggestionClick = (href: string) => {
		router.push(href)
		setQuery("")
		setIsOpen(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen && e.key !== "ArrowDown") return

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault()
				setIsOpen(true)
				setSelectedIndex(prev => 
					prev < suggestions.length - 1 ? prev + 1 : prev
				)
				break
			case "ArrowUp":
				e.preventDefault()
				setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
				break
			case "Enter":
				e.preventDefault()
				if (selectedIndex >= 0 && suggestions[selectedIndex]) {
					handleSuggestionClick(suggestions[selectedIndex].href)
				} else {
					const form = e.currentTarget.closest("form") as HTMLFormElement
					form?.dispatchEvent(new Event("submit", { bubbles: true }))
				}
				break
			case "Escape":
				e.preventDefault()
				setIsOpen(false)
				setSelectedIndex(-1)
				break
		}
	}

	useEffect(() => {
		setSelectedIndex(-1)
		setIsOpen(query.length > 0)
	}, [query])

	return (
		<main className="min-h-screen bg-background text-foreground">
			<section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-16 text-center sm:px-8">
				<h1 className="text-[clamp(1.95rem,4.8vw,3.25rem)] font-semibold leading-none tracking-tight text-foreground">
					No se puede encontrar la pagina
				</h1>

				<form
					onSubmit={handleSearch}
					className="relative mt-9 w-full max-w-3xl"
					role="search"
					aria-label="Buscar en el sitio"
				>
					<label htmlFor="not-found-search" className="sr-only">
						Buscar en el sitio
					</label>
					<div className="mx-auto flex h-14 w-full items-center rounded-2xl border border-border/40 bg-background px-5 shadow-sm transition hover:border-border/60 focus-within:border-foreground/30 focus-within:shadow-md sm:h-16 sm:px-6">
						<Search className="h-5 w-5 text-muted-foreground/60 shrink-0" />
						<input
							ref={inputRef}
							id="not-found-search"
							name="q"
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							onKeyDown={handleKeyDown}
							onFocus={() => query.length > 0 && setIsOpen(true)}
							placeholder="Buscar"
							className="h-full w-full bg-transparent pl-4 text-base font-normal text-foreground outline-none placeholder:text-muted-foreground/50 sm:text-lg"
							autoComplete="off"
							aria-autocomplete="list"
							aria-controls="search-suggestions"
							aria-expanded={isOpen}
						/>
						<button
							type="submit"
							aria-label="Buscar"
							className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition hover:text-foreground ml-2"
						>
							<ArrowRight className="h-5 w-5" />
						</button>
					</div>

					{/* Dropdown de sugerencias */}
					{isOpen && suggestions.length > 0 && (
						<div
							ref={suggestionsRef}
							id="search-suggestions"
							className="absolute top-full left-0 right-0 mt-4 max-h-[420px] overflow-y-auto rounded-xl border border-border/40 bg-background shadow-xl"
							role="listbox"
						>
							{suggestions.map((suggestion, index) => (
								<button
									key={`${suggestion.href}-${index}`}
									type="button"
									onClick={() => handleSuggestionClick(suggestion.href)}
									className={`w-full flex items-center gap-3 px-5 py-3 sm:py-3.5 text-left transition ${
										index === selectedIndex
											? "bg-muted/80 text-foreground"
											: "hover:bg-muted/30 text-foreground/80 hover:text-foreground"
									}`}
									role="option"
									aria-selected={index === selectedIndex}
								>
									<Search className="h-4 w-4 text-muted-foreground/50 shrink-0" />
									<div className="flex-1 min-w-0">
										<div className="font-medium text-sm text-foreground truncate">{suggestion.keyword}</div>
									</div>
									{index === selectedIndex && (
										<ArrowRight className="h-4 w-4 text-foreground/40 shrink-0" />
									)}
								</button>
							))}
						</div>
					)}

					{/* Mensaje cuando no hay sugerencias */}
					{isOpen && query.length > 0 && suggestions.length === 0 && (
						<div className="absolute top-full left-0 right-0 mt-4 rounded-xl border border-border/40 bg-background p-4 sm:p-5 text-center">
							<p className="text-sm text-muted-foreground/70">Sin resultados para «{query}»</p>
						</div>
					)}
				</form>

				<p className="mt-7 text-sm text-foreground sm:text-sm">
					Utiliza el cuadro de búsqueda o regresa a{" "}
					<Link href="/" className="border-b border-foreground/40 hover:border-foreground">
						la pagina de inicio ›
					</Link>
				</p>
			</section>
		</main>
	)
}