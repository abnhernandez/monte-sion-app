import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HandHelping,
  Heart,
  Home,
  Sparkles,
} from "lucide-react"

const componentesOracion = [
  {
    titulo: "Adoración y alabanza",
    descripcion: "Reconoce quién es Dios antes de hablar de tus necesidades.",
  },
  {
    titulo: "Acción de gracias",
    descripcion: "Agradece su fidelidad, provisión y misericordia diaria.",
  },
  {
    titulo: "Confesión",
    descripcion: "Presenta tu corazón con humildad y pide perdón con sinceridad.",
  },
  {
    titulo: "Petición e intercesión",
    descripcion: "Pide por tu vida y por otros, confiando en su voluntad perfecta.",
  },
]

const versiculosClave = [
  {
    cita: "Mateo 6:9-13",
    texto:
      "Jesús enseña una oración modelo: adorar, buscar el Reino, pedir provisión, perdón y protección.",
  },
  {
    cita: "Filipenses 4:6-7",
    texto:
      "Presenta tus peticiones con acción de gracias y la paz de Dios guardará tu corazón.",
  },
  {
    cita: "1 Tesalonicenses 5:17",
    texto:
      "Orad sin cesar: una vida de comunión continua y dependencia de Dios.",
  },
  {
    cita: "Jeremías 33:3",
    texto:
      "Clama a mí, y yo te responderé; Dios invita a buscarle con confianza.",
  },
  {
    cita: "Santiago 5:16",
    texto:
      "La oración ferviente del justo tiene gran poder para interceder y traer restauración.",
  },
  {
    cita: "Mateo 6:6",
    texto:
      "Ora en secreto para cultivar intimidad real con el Padre.",
  },
]

const pasosPracticos = [
  "Ora con fe: cree que Dios oye y responde con sabiduría.",
  "Habla con sinceridad: sin palabrería ni apariencias.",
  "Ora en el nombre de Jesús: confiando en su obra redentora.",
  "Persevera: sigue orando aun cuando no veas respuesta inmediata.",
]

export default function LandingOracion() {
  return (
    <main className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-background to-background text-neutral-800 dark:from-neutral-950 dark:text-neutral-200">
      <div className="absolute inset-0 -z-10 opacity-30 [background:radial-gradient(circle_at_top_right,#f59e0b_0%,transparent_40%)]" />

      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <header className="mb-14 flex items-center justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-100/70 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-700/60 dark:bg-amber-900/30 dark:text-amber-200">
              <Sparkles className="h-3.5 w-3.5" />
              Guía bíblica de oración
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              La oración bíblica transforma el corazón
            </h1>
            <p className="max-w-3xl text-base text-neutral-700 dark:text-neutral-300 md:text-lg">
              No es una repetición vacía: es comunicación personal y directa con
              Dios, una vida de adoración, dependencia, fe y comunión continua.
            </p>
          </div>

          <Link
            href="/"
            aria-label="Ir al inicio"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white/80 px-4 py-2 text-sm font-medium text-amber-800 shadow-sm transition hover:bg-amber-50 dark:border-amber-700 dark:bg-neutral-900 dark:text-amber-200"
          >
            <Home className="h-4 w-4" /> Inicio
          </Link>
        </header>

        <section className="mb-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-background/90 p-5 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <Heart className="h-4 w-4 text-amber-600" /> Qué es orar
            </h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Es hablar con Dios, en voz alta o en silencio, derramando el alma
              con honestidad y confianza.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-background/90 p-5 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <BookOpen className="h-4 w-4 text-amber-600" /> Cómo se ora
            </h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Al Padre, por medio de Jesús y con la ayuda del Espíritu Santo,
              buscando su voluntad con fe.
            </p>
          </article>

          <article className="rounded-2xl border border-border bg-background/90 p-5 shadow-sm">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold">
              <HandHelping className="h-4 w-4 text-amber-600" /> Para qué sirve
            </h2>
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              Fortalece tu vida espiritual, trae paz en medio de ansiedad y te
              alinea con el propósito de Dios.
            </p>
          </article>
        </section>

        <section className="mb-16 rounded-3xl border border-amber-200/70 bg-amber-50/70 p-6 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 md:p-8">
          <p className="text-sm uppercase tracking-wide text-amber-700 dark:text-amber-300">
            Explicación profunda
          </p>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            Orar es relación, no solo petición
          </h2>
          <p className="mt-3 max-w-4xl text-neutral-700 dark:text-neutral-300">
            La oración bíblica incluye adoración, acción de gracias, confesión e
            intercesión. También implica rendición: como Jesús en Getsemaní,
            &quot;no se haga mi voluntad, sino la tuya&quot;. Cuando oramos, no buscamos
            manipular a Dios; aprendemos a depender de Él y a vivir con un
            corazón obediente.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mb-5 text-2xl font-semibold md:text-3xl">
            Componentes de la oración bíblica
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {componentesOracion.map((item) => (
              <article
                key={item.titulo}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <h3 className="mb-2 text-lg font-semibold">{item.titulo}</h3>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {item.descripcion}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="mb-5 text-2xl font-semibold md:text-3xl">
            Versículos clave sobre la oración
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {versiculosClave.map((v) => (
              <blockquote
                key={v.cita}
                className="rounded-2xl border border-border bg-background p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {v.cita}
                </p>
                <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
                  {v.texto}
                </p>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-3xl border border-border bg-background p-6 shadow-sm md:p-8">
          <h2 className="mb-4 text-2xl font-semibold md:text-3xl">
            Guía práctica para empezar hoy
          </h2>
          <ul className="space-y-3">
            {pasosPracticos.map((paso) => (
              <li key={paso} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span className="text-neutral-700 dark:text-neutral-300">{paso}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-neutral-300/80 bg-neutral-50 p-6 text-center shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-10">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Haz de la oración tu estilo de vida
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-neutral-700 dark:text-neutral-300">
            Ora antes de actuar. Ora en todo momento. Dios escucha y sostiene a
            quienes se acercan a Él con confianza.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/peticion"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Enviar una petición de oración <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}