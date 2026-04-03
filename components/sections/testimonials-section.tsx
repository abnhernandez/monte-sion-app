import { Quote } from "lucide-react"
import { getTestimonials } from "@/lib/testimonials-actions"

export async function TestimonialsSection() {
  const testimonials = await getTestimonials()

  return (
    <section
      id="testimonios"
      className="mx-auto w-full max-w-6xl px-6 py-16"
      aria-labelledby="titulo-testimonios"
    >
      <div className="text-center">
        <h2
          id="titulo-testimonios"
          className="font-serif text-3xl font-normal text-foreground sm:text-4xl"
        >
          Testimonios
        </h2>
        <p className="mt-3 text-muted-foreground">
          Historias reales de fe y restauración
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {testimonials.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground lg:col-span-3">
            Aún no hay testimonios publicados.
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/30 hover:shadow-lg"
            >
              {/* Quote Icon */}
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Quote className="h-5 w-5" />
              </div>

              {/* Quote Text */}
              <blockquote className="text-base leading-relaxed text-card-foreground">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              {/* Author */}
              <footer className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {testimonial.name}
                  </p>
                  {testimonial.role ? (
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  ) : null}
                </div>
              </footer>
            </article>
          ))
        )}
      </div>
    </section>
  )
}