import { getUserRole } from "@/lib/get-user-role"
import Sidebar from "./sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = await getUserRole()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={role} />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}