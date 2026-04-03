import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

interface AgendaEvent {
  id: string
  start_time: string
  end_time: string
  title: string
  host: string | null
  description: string | null
  category: string | null
  duration_min: number
  order_index: number
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function AgendaPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data, error } = await supabase
    .from("agenda_decisiones")
    .select("*")
    .order("order_index", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    throw new Error("Error cargando agenda")
  }

  const events = data as AgendaEvent[]

  if (!events.length) {
    return (
      <section className="py-24 text-center">
        <p className="text-muted-foreground">
          Aún no hay agenda disponible.
        </p>
      </section>
    )
  }

  const totalMinutes = events.reduce(
    (sum, e) => sum + (e.duration_min ?? 0),
    0
  )

  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  const eventDate = formatDate(events[0].start_time)

  return (
    <section
    id="agenda" 
    className="py-24">
      <div className="mx-auto max-w-6xl px-6">

        {/* HEADER */}
        <div className="text-center">
          <h2 className="font-serif text-4xl font-semibold">
            Agenda del Evento
          </h2>

          <p className="mt-3 text-muted-foreground capitalize">
            {eventDate}
          </p>

          <p className="mt-2 text-sm text-primary">
            Duración total: {hours}h {mins}m
          </p>
        </div>
                
        {/* BUTTONS PDF & JPG */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="https://bplojzsfddhfqnygvomh.supabase.co/storage/v1/object/public/PDFs/itinerario.pdf"
            download
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-9-2m9 2l9-2m-9-8l9 18m-9-18l-9-2m9 18v-8" />
            </svg>
            Descargar PDF
          </a>
          <a
            href="https://bplojzsfddhfqnygvomh.supabase.co/storage/v1/object/public/PDFs/itinerario.jpeg"
            download
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-background px-6 py-3 text-sm font-medium text-primary hover:bg-primary/5 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Descargar JPG
          </a>
        </div>

        {/* TABLE */}
        <div className="mt-16 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-base">
            <thead className="border-b border-border bg-background">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-5">Horario</th>
                <th className="px-6 py-5">Actividad</th>
                <th className="px-6 py-5">Responsable</th>
                <th className="px-6 py-5">Descripción</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-border hover:bg-primary/5 transition-colors"
                >
                  <td className="px-6 py-6 font-medium whitespace-nowrap">
                    {formatTime(event.start_time)} —{" "}
                    {formatTime(event.end_time)}
                  </td>

                  <td className="px-6 py-6 text-lg font-semibold">
                    {event.title}
                  </td>

                  <td className="px-6 py-6 text-muted-foreground">
                    {event.host ?? "—"}
                  </td>

                  <td className="px-6 py-6 text-muted-foreground">
                    {event.description ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  )
}