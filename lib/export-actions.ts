"use server"

import { getPeticiones } from "./peticiones-actions"
import { type EstadoPeticion } from "@/lib/peticiones-types"
import { Parser } from "json2csv"
import ExcelJS from "exceljs"

export async function exportCSV() {
  const data = (await getPeticiones()) as PeticionRow[]
  const fields = data.length > 0 ? Object.keys(data[0]) : []
  const parser = new Parser({ fields })

  return parser.parse(data) // string
}

export async function exportXLSX() {
  const data = (await getPeticiones()) as PeticionRow[]
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Peticiones")

  sheet.columns = Object.keys(data[0] || {}).map(k => ({
    header: k,
    key: k,
  }))

  sheet.addRows(data)

  const buffer = await workbook.xlsx.writeBuffer()
  return Array.from(new Uint8Array(buffer)) // 🔥 IMPORTANTE
}

type ExportFilters = {
  search?: string
  estado?: EstadoPeticion | "all"
  sortBy?: "recent" | "oldest"
}

type PeticionRow = {
  nombre?: string | null
  email?: string | null
  estado?: EstadoPeticion | null
  created_at?: string | null
  [key: string]: unknown
}

function filterPeticiones(
  data: PeticionRow[],
  { search, estado = "all", sortBy = "recent" }: ExportFilters
) {
  const q = search?.trim().toLowerCase()
  let next = data

  if (q) {
    next = next.filter((p) =>
      `${p.nombre ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q)
    )
  }

  if (estado !== "all") {
    next = next.filter((p) => p.estado === estado)
  }

  const sortMultiplier = sortBy === "recent" ? -1 : 1
  next = [...next].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return (aTime - bTime) * sortMultiplier
  })

  return next
}

export async function exportCSVFiltered(filters: ExportFilters) {
  const data = (await getPeticiones()) as PeticionRow[]
  const filtered = filterPeticiones(data, filters)
  const fields = filtered.length > 0 ? Object.keys(filtered[0]) : []
  const parser = new Parser({ fields })

  return parser.parse(filtered)
}

export async function exportXLSXFiltered(filters: ExportFilters) {
  const data = (await getPeticiones()) as PeticionRow[]
  const filtered = filterPeticiones(data, filters)
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Peticiones")

  sheet.columns = Object.keys(filtered[0] || {}).map(k => ({
    header: k,
    key: k,
  }))

  sheet.addRows(filtered)

  const buffer = await workbook.xlsx.writeBuffer()
  return Array.from(new Uint8Array(buffer))
}