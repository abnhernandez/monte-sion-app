"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

export type StorageFile = {
  name: string
  id?: string
  updated_at?: string
}

export async function listStorageFiles(
  bucket: string,
  prefix: string = ""
): Promise<StorageFile[]> {
  const supabase = await getSupabaseServer()

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, {
      limit: 1000,
      sortBy: { column: "name", order: "asc" },
    })

  if (error) throw error

  return (data ?? []) as StorageFile[]
}

export async function getPublicFileUrl(
  bucket: string,
  path: string
): Promise<string> {
  const supabase = await getSupabaseServer()

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}
