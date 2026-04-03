"use server"
import "server-only"

import { createClient } from "@supabase/supabase-js"
import { getSupabaseServer } from "@/lib/supabase-server"

export type AuditLogEntry = {
  id: string
  actor_id: string
  action: string
  entity: string
  entity_id: string | null
  before_state: string | null
  after_state: string | null
  created_at: string
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function assertAdmin() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("No autenticado")

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data || !["admin", "leader"].includes(data.role)) {
    throw new Error("No autorizado")
  }

  return user
}

export async function getAuditLogs(limit = 200) {
  await assertAdmin()

  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .select("id, actor_id, action, entity, entity_id, before_state, after_state, created_at")
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return (data ?? []) as AuditLogEntry[]
}

type AuditFilters = {
  search?: string
  action?: string | "all"
  sortBy?: "recent" | "oldest"
}

function filterAuditLogs(
  data: AuditLogEntry[],
  { search, action = "all", sortBy = "recent" }: AuditFilters
) {
  const q = search?.trim().toLowerCase()
  let next = data

  if (q) {
    next = next.filter((l) =>
      `${l.action} ${l.entity} ${l.entity_id ?? ""} ${l.actor_id}`
        .toLowerCase()
        .includes(q)
    )
  }

  if (action !== "all") {
    next = next.filter((l) => l.action === action)
  }

  const sortMultiplier = sortBy === "recent" ? -1 : 1
  next = [...next].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return (aTime - bTime) * sortMultiplier
  })

  return next
}

export async function exportAuditCSV(filters: AuditFilters) {
  await assertAdmin()
  const { Parser } = await import("json2csv")
  const data = await getAuditLogs(500)
  const filtered = filterAuditLogs(data, filters)
  const fields = filtered.length > 0 ? Object.keys(filtered[0]) : []
  const parser = new Parser({ fields })
  return parser.parse(filtered)
}

export async function exportAuditXLSX(filters: AuditFilters) {
  await assertAdmin()
  const ExcelJS = (await import("exceljs")).default
  const data = await getAuditLogs(500)
  const filtered = filterAuditLogs(data, filters)
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Audit Logs")

  sheet.columns = Object.keys(filtered[0] || {}).map((k) => ({
    header: k,
    key: k,
  }))

  sheet.addRows(filtered)

  const buffer = await workbook.xlsx.writeBuffer()
  return Array.from(new Uint8Array(buffer))
}
