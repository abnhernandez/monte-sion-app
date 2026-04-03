import { getAllUsers } from "@/lib/admin-actions"
import { getPeticiones } from "@/lib/peticiones-actions"
import { getUnreadCount } from "@/lib/notifications"
import { getSupabaseServer } from "@/lib/supabase-server"
import AdminPageClient from "./AdminPageClient"

export default async function AdminPage() {
  const users = await getAllUsers()
  const peticiones = await getPeticiones()
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const unreadCount = user ? await getUnreadCount(user.id) : 0

  return (
    <AdminPageClient
      users={users}
      peticiones={peticiones}
      unreadCount={unreadCount}
    />
  )
}