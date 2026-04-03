import { getAllUsers } from "@/lib/admin-actions"
import AdminUsersTable from "../AdminUsersTable"

export default async function AdminUsersPage() {
  const users = await getAllUsers()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Usuarios</h1>
          <p className="text-sm text-neutral-500">
            Gestiona roles, accesos y cuentas
          </p>
        </div>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
          <AdminUsersTable users={users} />
        </section>
      </div>
    </div>
  )
}
