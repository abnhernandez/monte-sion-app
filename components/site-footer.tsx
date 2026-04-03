import Link from "next/link"
import { Youtube, Instagram, Facebook, MessageCircle } from "lucide-react"

const SOCIAL_LINKS = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/@montesionoaxaca",
    icon: Youtube,
    label: "Síguenos en YouTube",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/montesionoaxaca",
    icon: Instagram,
    label: "Síguenos en Instagram",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/montesionoax",
    icon: Facebook,
    label: "Síguenos en Facebook",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/529512091644?text=Hola.%20Necesito%20de%20Dios.",
    icon: MessageCircle,
    label: "Contáctanos por WhatsApp",
  },
]

const QUICK_LINKS = [
  { label: "Bienvenida", href: "#inicio" },
  { label: "Si eres nuevo", href: "#nuevos" },
  { label: "Horarios", href: "#horarios" },
  { label: "Ministerios", href: "#ministerios" },
  { label: "Ubicación", href: "#visitanos" },
  { label: "Avisos", href: "/avisos" },
]

const RESOURCES = [
  { label: "Biblia", href: "/bible" },
  { label: "Cómo orar", href: "/orar" },
  { label: "Eventos", href: "/eventos" },
  { label: "Entrar", href: "/login" },
  { label: "Crear cuenta", href: "/registro" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-serif text-lg font-medium text-primary-foreground">
                  M
                </span>
              </div>
              <span className="text-base font-semibold text-foreground">
                Monte Sion
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Una casa para acercarte a Dios, encontrar comunidad y dar pasos
              reales en la fe con paz y acompañamiento.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Navegación
            </h3>
            <ul className="mt-4 space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recursos</h3>
            <ul className="mt-4 space-y-3">
              {RESOURCES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Contacto</h3>
            <address className="mt-4 space-y-3 not-italic">
              <p className="text-sm text-muted-foreground">
                Cuicatlán 184, Col. Niños Héroes
                <br />
                Santa María Atzompa, Oaxaca
              </p>
              <a
                href="https://wa.me/529512091644?text=Hola.%20Necesito%20de%20Dios."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent/80"
              >
                <MessageCircle className="h-4 w-4" />
                +52 951 209 1644
              </a>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Monte Sion Oaxaca. Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/legal"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Legal
            </Link>
            <Link
              href="/privacidad"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Términos
            </Link>
            <Link
              href="/legal/marcas"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Marcas
            </Link>
            <Link
              href="/legal/limitacion"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Limitación
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
