export type AppRole = "admin" | "leader" | "staff" | "user"

export const APP_ROLES: AppRole[] = ["admin", "leader", "staff", "user"]

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole)
}

export function getSafeAppRole(value: unknown): AppRole {
  return isAppRole(value) ? value : "user"
}

export function isAdminRole(role: AppRole | null | undefined) {
  return role === "admin"
}

export function canEditBirthdayContent(role: AppRole | null | undefined) {
  return role === "admin" || role === "leader"
}

export function canAccessBirthdays(role: AppRole | null | undefined) {
  return role === "admin" || role === "leader" || role === "staff"
}

export function canManageBirthdayContent(role: AppRole | null | undefined) {
  return canEditBirthdayContent(role)
}

export function canAccessBirthdayAdmin(role: AppRole | null | undefined) {
  return role === "admin"
}

export function canAccessBirthdayComments(role: AppRole | null | undefined) {
  return role === "admin" || role === "leader" || role === "staff"
}

export function canManageBirthdayGifts(role: AppRole | null | undefined) {
  return role === "admin" || role === "leader" || role === "staff"
}

export function canModerateBirthdayComments(role: AppRole | null | undefined) {
  return role === "admin" || role === "leader"
}

export function getRoleLabel(role: AppRole) {
  const labels: Record<AppRole, string> = {
    admin: "Admin",
    leader: "Lider",
    staff: "Staff",
    user: "Usuario",
  }

  return labels[role]
}
