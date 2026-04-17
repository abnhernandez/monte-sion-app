import { redirect } from "next/navigation"

export default function PdfRedirectPage() {
  redirect("/examen?view=results")
}
