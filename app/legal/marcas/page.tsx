import LegalMarkdownPage from "@/app/legal/_components/LegalMarkdownPage"
import { LEGAL_DOCS } from "@/lib/legal"

export default function MarcasPage() {
  return (
    <LegalMarkdownPage
      title="Marcas, logos y propiedad intelectual"
      description="Lineamientos de uso del nombre Monte Sion, logos institucionales y material derivado."
      docRelativePath={LEGAL_DOCS.marcas}
    />
  )
}
