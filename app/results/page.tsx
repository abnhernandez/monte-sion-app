import { redirect } from "next/navigation"

export default function ResultsRedirectPage() {
  redirect("/examen?view=results")
}
