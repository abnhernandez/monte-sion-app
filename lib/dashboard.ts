import { getSupabaseServer } from "@/lib/supabase-server"

export async function getDashboardData() {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // 1️⃣ Intentar leer perfil
  let { data: profile } = await supabase
    .from("profiles")
    .select("name, bio, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  // 2️⃣ Si NO existe, crearlo
  if (!profile) {
    const { data: createdProfile, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        name: "",
        bio: "",
        avatar_url: null,
      })
      .select("name, bio, avatar_url")
      .single()

    if (error) throw error

    profile = createdProfile
  }

  // 3️⃣ Obtener progreso
  const { data: progress } = await supabase
    .from("progress")
    .select("course_id, lesson_id, progress_percent, completed")
    .eq("user_id", user.id)

  return {
    profile,
    progress: progress ?? [],
  }
}