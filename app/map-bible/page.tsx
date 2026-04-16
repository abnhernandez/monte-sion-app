import Link from "next/link"
import { ArrowRight, BookOpen, Search, Sparkles } from "lucide-react"
import { getBibleCatalog } from "@/lib/bible-actions"

export const metadata = {
  title: "Mapa de la Biblia | Monte Sion Oaxaca",
  description:
    "Acceso rápido a libros y capítulos de la Biblia.",
}

export default async function MapBiblePage() {
  const catalog = await getBibleCatalog()

  const books = catalog.books.map((book) => ({
    name: book,
    href: `/bible?book=${encodeURIComponent(book)}&chapter=1`,
  }))

  const totalChapters = Object.values(catalog.chaptersByBook).reduce(
    (a, b) => a + b.length,
    0
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-6 py-14">

        {/* HERO */}
        <div className="text-center space-y-4">

          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/40 px-4 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Acceso rápido a la Biblia
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Encuentra un libro y empieza a leer
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Un mapa simple para entrar directo a la lectura sin perder tiempo.
          </p>

        </div>

        {/* MAIN ACTION (MUY IMPORTANTE) */}
        <div className="mt-10 flex justify-center">

          <Link
            href={`/bible?book=${encodeURIComponent(books[0]?.name ?? "Genesis")}&chapter=1`}
            className="inline-flex items-center gap-3 rounded-2xl bg-foreground text-background px-6 py-4 text-sm font-semibold hover:opacity-90 transition shadow-md"
          >
            <BookOpen className="h-4 w-4" />
            Abrir lectura ahora
          </Link>

        </div>

        {/* STATS */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">

          <div className="rounded-xl border border-border/40 p-4">
            <p className="text-xs text-muted-foreground">Libros</p>
            <p className="mt-1 font-medium">{books.length}</p>
          </div>

          <div className="rounded-xl border border-border/40 p-4">
            <p className="text-xs text-muted-foreground">Capítulos</p>
            <p className="mt-1 font-medium">{totalChapters}</p>
          </div>

        </div>

        {/* MAPA (NO CATÁLOGO) */}
        <div className="mt-10">

          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            Explorar libros
          </div>

          <div className="grid sm:grid-cols-3 gap-2">

            {books.map((book) => (
              <Link
                key={book.name}
                href={book.href}
                className="group flex items-center justify-between rounded-xl border border-border/40 px-4 py-3 hover:bg-muted/30 transition"
              >
                <span className="text-sm font-medium">
                  {book.name}
                </span>

                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
              </Link>
            ))}

          </div>

        </div>

      </section>
    </main>
  )
}