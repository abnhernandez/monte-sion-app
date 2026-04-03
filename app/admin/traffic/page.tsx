import { getAuditLogs } from "@/lib/audit-actions"
import TrafficPanelClient from "./TrafficPanelClient"

export default async function TrafficPage() {
  const logs = await getAuditLogs(500)

  const trafficLogs = logs.filter((log) =>
    [
      "query_params_captured",
      "landing_view",
      "smart_redirect_applied",
      "campaign_conversion_completed",
    ].includes(log.action)
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tráfico y campañas</h1>
          <p className="text-sm text-neutral-500">
            Query state, redirecciones inteligentes y conversiones atribuidas
          </p>
        </div>

        <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5">
          <TrafficPanelClient logs={trafficLogs} />
        </section>
      </div>
    </div>
  )
}