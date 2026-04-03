import "server-only";

import { getSupabaseServer } from "@/lib/supabase-server";

export class CampAuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 = 401
  ) {
    super(message);
    this.name = "CampAuthError";
  }
}

export async function assertCampAdminAccess() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new CampAuthError("No autenticado.", 401);
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || profile?.role !== "admin") {
    throw new CampAuthError("No autorizado.", 403);
  }

  return user;
}
