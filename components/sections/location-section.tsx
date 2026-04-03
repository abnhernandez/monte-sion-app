import { MapPin } from "lucide-react"
import { RouteToChurch } from "@/components/route-to-church"
import { getLocation } from "@/lib/location-actions"

export async function LocationSection() {
  const location = await getLocation()

  return (
    <section
      id="visitanos"
      className="mx-auto w-full max-w-6xl px-6 py-8"
      aria-labelledby="titulo-visitanos"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {location ? (
          <div className="grid lg:grid-cols-[1fr_auto]">
            {/* Content */}
            <div className="p-6 lg:p-8">
              <h3
                id="titulo-visitanos"
                className="font-serif text-2xl font-normal text-card-foreground"
              >
                {location.title}
              </h3>
              <address className="mt-4 space-y-2 not-italic">
                <p className="text-muted-foreground">
                  {location.address_line1}
                </p>
                <p className="text-muted-foreground">
                  {location.address_line2}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-accent" />
                  {location.city}
                </div>
              </address>

              <div className="mt-6">
                <RouteToChurch />
              </div>
            </div>

            {/* Map Placeholder / Decorative */}
            <div className="hidden h-full min-h-[200px] w-[300px] bg-gradient-to-br from-muted via-muted to-accent/5 lg:block">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto h-12 w-12 text-accent/30" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {location.map_label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Aún no hay información de ubicación publicada.
          </div>
        )}
      </div>
    </section>
  )
}
