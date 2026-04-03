import { getDashboardData } from "@/lib/dashboard"
import { getUserRole } from "@/lib/get-user-role"
import DashboardClient from "./DashboardClient"
import { RutaTemplo } from "../components/ruta-templo"

export default async function DashboardPage() {
  const data = await getDashboardData()
  const role = await getUserRole()

  if (!data) {
    return <p className="p-7">No autenticado</p>
  }

  return (
    <>
      <DashboardClient role={role} />
      <RutaTemplo/>
    </>
  )
}
