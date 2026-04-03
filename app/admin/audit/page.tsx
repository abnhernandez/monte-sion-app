import { getAuditLogs } from "@/lib/audit-actions"
import AuditLogTable from "./AuditLogTable"

export default async function AuditPage() {
  const logs = await getAuditLogs(200)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Auditoría</h1>
          <p className="text-sm text-neutral-500">
            Registro de cambios para consistencia DB ↔ server
          </p>
        </div>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
          <AuditLogTable logs={logs} />
        </section>
      </div>
    </div>
  )
}
