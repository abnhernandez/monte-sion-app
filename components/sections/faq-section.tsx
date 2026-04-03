import { getFaqs } from "@/lib/faq-actions"
import { FaqAccordion } from "@/components/sections/faq-accordion"

export async function FaqSection() {
  const items = await getFaqs()

  return (
    <section
      id="faq"
      className="mx-auto w-full max-w-6xl px-6 py-16"
      aria-labelledby="titulo-faq"
    >
      <div className="text-center">
        <h2
          id="titulo-faq"
          className="font-serif text-3xl font-normal text-foreground sm:text-4xl"
        >
          Preguntas frecuentes
        </h2>
        <p className="mt-3 text-muted-foreground">
          Resolvemos las dudas más comunes
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
          Aún no hay preguntas publicadas.
        </div>
      ) : (
        <FaqAccordion items={items} />
      )}
    </section>
  )
}
