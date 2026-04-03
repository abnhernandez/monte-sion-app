import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";

const CAMP_DOCUMENTS_BUCKET =
  process.env.CAMP_STORAGE_BUCKET ?? "camp-documents";

function sanitizeFileName(fileName: string) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop()?.toLowerCase() ?? "bin"
    : "bin";

  return `${crypto.randomUUID()}.${extension.replace(/[^a-z0-9]/g, "") || "bin"}`;
}

export async function uploadGuardianIdentification(file: File, ticketId: string) {
  const storagePath = `campamento-monte-sion-2026/guardian-ids/${ticketId}/${sanitizeFileName(
    file.name
  )}`;
  const fileBytes = await file.arrayBuffer();
  const { error } = await supabaseAdmin.storage
    .from(CAMP_DOCUMENTS_BUCKET)
    .upload(storagePath, fileBytes, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (error) {
    throw new Error(
      `No se pudo subir la identificacion del tutor: ${error.message}`
    );
  }

  return storagePath;
}
