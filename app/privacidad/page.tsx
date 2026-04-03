import LegalMarkdownPage from "@/app/legal/_components/LegalMarkdownPage"
import { LEGAL_DOCS } from "@/lib/legal"

export default function PrivacidadPage() {
  return (
    <LegalMarkdownPage
      title="Aviso de Privacidad"
      description="Conoce como tratamos tus datos y como ejercer tus derechos de acceso, correccion y eliminacion."
      docRelativePath={LEGAL_DOCS.privacidad}
    />
  )
}
