"use server";

import { getSupabaseServer } from "@/lib/supabase-server";

export async function uploadAvatar(file: File) {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona una imagen válida.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La imagen debe pesar 5 MB o menos.");
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return data.publicUrl;
}
