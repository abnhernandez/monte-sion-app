"use client"

import AvisosHubClient from "@/components/avisos/hub-client"
import type { AvisosHubPayload } from "@/lib/avisos/types"

export default function AvisosClient({
  initialData,
}: {
  initialData: AvisosHubPayload
}) {
  return <AvisosHubClient initialData={initialData} />
}
