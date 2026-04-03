import { Youtube, Instagram, Facebook, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold">Monte Sion Oaxaca</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Un lugar para ti en el Reino de Dios.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Contacto</h4>
            <p className="mt-2 text-sm text-neutral-500">Cuicatlán 184, Santa María Atzompa</p>
            <a
              href="https://wa.me/529512091644?text=Hola.%20Necesito%20de%20Dios."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex text-sm text-amber-600"
            >
              WhatsApp +52 951 209 1644
            </a>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Síguenos</h4>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://www.youtube.com/@montesionoaxaca"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube @montesionoaxaca"
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800"
              >
                <Youtube size={18} />
              </a>
              <a
                href="https://www.instagram.com/montesionoaxaca"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram montesionoaxaca"
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/montesionoax"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook montesionoax"
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://wa.me/529512091644?text=Hola.%20Necesito%20de%20Dios."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp +52 951 209 1644"
                className="p-2 rounded-full border border-neutral-200 dark:border-neutral-800"
              >
                <MessageSquare size={18} />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-neutral-500">© {new Date().getFullYear()} Monte Sion Oaxaca</p>
      </div>
    </footer>
  )
}