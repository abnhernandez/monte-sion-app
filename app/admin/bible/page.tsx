import Link from "next/link"
import { BookOpen } from "lucide-react"

export default function AdminBiblePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-6 w-6 text-amber-600" />
        <h1 className="text-2xl font-bold">Biblia</h1>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
        Accede al lector de la Biblia desde aquí.
      </p>
      <Link
        href="/bible"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
      >
        <BookOpen className="h-4 w-4" />
        Abrir lector de Biblia
      </Link>
    </div>
  )
}
