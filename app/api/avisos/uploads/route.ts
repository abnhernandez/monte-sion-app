import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { assertAuthenticatedActor } from "@/lib/avisos/permissions"
import { maxUploadSizeByKind, uploadIntentSchema } from "@/lib/avisos/schemas"
import type { AvisoAttachmentRecord } from "@/lib/avisos/types"

const bucketName = process.env.AVISOS_STORAGE_BUCKET ?? "avisos-media"

function sanitizeFileName(fileName: string) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() ?? "bin"
    : "bin"

  return `${crypto.randomUUID()}.${extension.replace(/[^a-z0-9]/g, "") || "bin"}`
}

export async function POST(request: Request) {
  try {
    await assertAuthenticatedActor()

    const formData = await request.formData()
    const rawKind = String(formData.get("kind") ?? "")
    const rawExternalUrl = String(formData.get("external_url") ?? "")
    const rawTitle = String(formData.get("title") ?? "")
    const parsed = uploadIntentSchema.parse({
      kind: rawKind,
      external_url: rawExternalUrl || undefined,
      title: rawTitle || undefined,
    })

    if (parsed.kind === "embed") {
      const attachment: AvisoAttachmentRecord = {
        id: crypto.randomUUID(),
        aviso_id: "",
        kind: "embed",
        source_type: "external",
        storage_bucket: null,
        storage_path: null,
        external_url: parsed.external_url ?? null,
        thumbnail_path: null,
        title: parsed.title ?? "",
        file_name: parsed.title ?? "Enlace externo",
        mime_type: "text/uri-list",
        size_bytes: null,
        position: 0,
        metadata: {},
        resolved_url: parsed.external_url ?? null,
        thumbnail_url: null,
      }

      return NextResponse.json({ attachment })
    }

    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Selecciona un archivo válido." }, { status: 400 })
    }

    const maxSize = maxUploadSizeByKind[parsed.kind]
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo excede el tamaño permitido." },
        { status: 400 }
      )
    }

    const storagePath = `uploads/${new Date().toISOString().slice(0, 10)}/${sanitizeFileName(file.name)}`
    const arrayBuffer = await file.arrayBuffer()
    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })

    if (error) {
      throw new Error(error.message)
    }

    const { data: signed, error: signedError } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(storagePath, 60 * 60)

    if (signedError) {
      throw new Error(signedError.message)
    }

    const attachment: AvisoAttachmentRecord = {
      id: crypto.randomUUID(),
      aviso_id: "",
      kind: parsed.kind,
      source_type: "storage",
      storage_bucket: bucketName,
      storage_path: storagePath,
      external_url: null,
      thumbnail_path: null,
      title: parsed.title ?? file.name,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      position: 0,
      metadata: {},
      resolved_url: signed.signedUrl,
      thumbnail_url: null,
    }

    return NextResponse.json({ attachment })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo subir el archivo.",
      },
      { status: 400 }
    )
  }
}
