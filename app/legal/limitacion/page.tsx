import LegalMarkdownPage from "@/app/legal/_components/LegalMarkdownPage"
import { LEGAL_DOCS } from "@/lib/legal"

export default function LimitacionPage() {
  return (
    <LegalMarkdownPage
      title="Limitacion de responsabilidad y garantia"
      description="Alcance legal del servicio digital, exclusiones y advertencias de uso."
      docRelativePath={LEGAL_DOCS.limitacion}
    />
  )
}
