import { Bell, BookOpen, Calendar, MessageSquare } from "lucide-react"
import { FeatureCard } from "@/components/feature-card"
import { getFeatures } from "@/lib/features-actions"

const ICONS = {
  book: BookOpen,
  message: MessageSquare,
  calendar: Calendar,
  bell: Bell,
}

export async function FeaturesSection() {
  const features = await getFeatures()

  return (
    <section
      className="mx-auto w-full max-w-6xl px-6 py-12"
      aria-labelledby="titulo-recursos"
    >
      <h2 id="titulo-recursos" className="sr-only">
        Recursos principales
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = ICONS[feature.icon] ?? BookOpen
          return (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              href={feature.href}
              icon={Icon}
            />
          )
        })}
      </div>
    </section>
  )
}
