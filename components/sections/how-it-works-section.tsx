import { getHowItWorksSteps } from "@/lib/how-it-works-actions"

export async function HowItWorksSection() {
  const data = await getHowItWorksSteps()
  const steps = data

  return (
    <section
      className="mx-auto w-full max-w-6xl px-6 py-16"
      aria-labelledby="titulo-como"
    >
      <div>
        <h2
          id="titulo-como"
          className="font-serif text-3xl font-normal text-foreground sm:text-4xl"
        >
          ¿Cómo empezar?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Tres pasos simples para iniciar tu camino
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {steps.map((item) => (
          <article
            key={item.step}
            className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/30 hover:shadow-md"
          >
            {/* Step Number */}
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              {item.step}
            </div>

            <h3 className="text-lg font-semibold text-card-foreground">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>

            {/* Connector Line (hidden on last item and mobile) */}
            {item.step < 3 && (
              <div
                className="absolute right-0 top-11 hidden h-0.5 w-6 bg-border lg:block"
                style={{ transform: "translateX(100%)" }}
                aria-hidden="true"
              />
            )}
          </article>
        ))}
      </div>
    </section>
  )
}