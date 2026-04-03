import { redirect } from "next/navigation"

export default async function AdminAvisosPage() {
  redirect("/avisos#gestion")
}