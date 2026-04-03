import Link from "next/link"
import { LessonCard } from "@/components/lesson-card"
import { getLessons } from "@/lib/lessons-actions"

export default async function LeccionesLandingPage() {
  const lessons = await getLessons()

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Lecciones</h1>
            <p className="text-sm text-neutral-500">
              Serie de fundamentos para crecer en la fe
            </p>
          </div>
          <Link href="/" className="text-sm text-amber-600">Inicio</Link>
        </header>

        {lessons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
            Aún no hay clases publicadas.
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                title={lesson.title}
                href={lesson.href}
                index={index}
                publishedAt={lesson.published_at}
                views={lesson.views}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
