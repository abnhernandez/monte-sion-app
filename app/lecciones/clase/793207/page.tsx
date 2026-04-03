import Reproductor from '@/app/components/reproductor'
import Link from 'next/link'
import { Calendar, Eye, Home } from 'lucide-react'
import { getLessonByHref } from '@/lib/lessons-actions'

export default async function Page() {
  const href = '/lecciones/clase/793207'
  const lesson = await getLessonByHref(href)
  const publishedLabel = lesson?.published_at
    ? new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(lesson.published_at))
    : null
  const viewsLabel = lesson ? lesson.views.toLocaleString('es-MX') : '0'

  return (
    <main className="min-h-screen p-6 bg-gray-50 dark:bg-neutral-900">
      <Link
        href="/"
        aria-label="Ir al inicio"
        className="fixed top-4 right-4 md:left-4 md:right-auto z-50 inline-flex items-center p-2 rounded-md bg-white/80 backdrop-blur text-gray-900 shadow dark:bg-neutral-800/80 dark:text-gray-100 hover:animate-pulse"
      >
        <Home className="h-5 w-5" />
      </Link>
      <Reproductor
        bucket="videos"
        title="Id y haced discípulos | La Gran Comisión | Episodio 2 | Prédicas Cristianas| Pastor Octaviano Rivera"
        videoUrl="https://www.youtube.com/embed/tO9luxZK1xI?si=9s5ehSFyg5G8V9g-"
        lessonId={lesson?.id}
        prevHref="/lecciones/clase/792207"
      >
        <section className="mx-auto mt-8 w-full max-w-4xl rounded-2xl border border-white/10 bg-white/80 p-6 shadow-sm dark:bg-neutral-900/60">
          <div className="mt-3 inline-flex flex-wrap items-center gap-3 rounded-full bg-black/5 px-3 py-1.5 text-[11px] font-medium text-neutral-700 shadow-sm dark:bg-white/5 dark:text-white/70">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-red-500/80" aria-hidden="true" />
              <span>Publicado {publishedLabel ?? '—'}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-red-500/80" aria-hidden="true" />
              <span>{viewsLabel} vistas</span>
            </span>
          </div>
        </section>
      </Reproductor>
    </main>
  )
}