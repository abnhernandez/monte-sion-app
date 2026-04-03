import Link from "next/link"

const LEGAL_LINKS = [
  {
    title: "Terminos y Condiciones",
    description: "Reglas de uso de la app, cuentas, conducta y alcance del servicio.",
    href: "/terminos",
  },
  {
    title: "Aviso de Privacidad",
    description: "Como tratamos tus datos personales y que derechos puedes ejercer.",
    href: "/privacidad",
  },
  {
    title: "Marcas, logos y propiedad intelectual",
    description: "Uso permitido del nombre Monte Sion, identidad institucional y forks.",
    href: "/legal/marcas",
  },
  {
    title: "Limitacion de responsabilidad y garantia",
    description: "Alcance del servicio digital y exclusiones legales aplicables.",
    href: "/legal/limitacion",
  },
]

export default function LegalIndexPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monte Sion
          </p>
          <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Documentos legales</h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Aqui puedes consultar los terminos de uso, privacidad y politicas de propiedad intelectual aplicables a la app.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/30"
            >
              <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-4 text-sm font-medium text-primary">Abrir documento</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}
