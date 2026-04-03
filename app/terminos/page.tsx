import LegalMarkdownPage from "@/app/legal/_components/LegalMarkdownPage"
import { LEGAL_DOCS } from "@/lib/legal"

export default function TerminosPage() {
  return (
    <LegalMarkdownPage
      title="Terminos y Condiciones"
      description="Reglas de uso de Monte Sion para una convivencia segura, clara y respetuosa."
      docRelativePath={LEGAL_DOCS.terminos}
    />
  )
}
