// Privacy utilities for user data protection
// Provides anonimization, masking, and role-based visibility control

export type UserRole = 'admin' | 'leader' | 'staff' | 'user' | 'guest'

export interface PrivacyContext {
  isAuthenticated: boolean
  isOwner: boolean
  userRole?: UserRole
  forceAnon?: boolean
}

/**
 * Anonimizes a full name to initials
 * @example anonimizeName("Juan Pérez", { isAuthenticated: false }) => "J.P."
 */
export function anonimizeName(
  name: string | null | undefined,
  context: PrivacyContext
): string {
  if (!name) return 'Anónimo'

  // User can always see their own name
  if (context.isOwner && context.isAuthenticated) {
    return name
  }

  // Force anonimization
  if (context.forceAnon) {
    return getInitials(name)
  }

  // Authenticated users see full names
  if (context.isAuthenticated) {
    return name
  }

  // Guests see only initials
  return getInitials(name)
}

/**
 * Extracts initials from a full name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('.')
}

/**
 * Masks an email address
 * @example maskEmail("juan@example.com") => "j***@example.com"
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return email

  const masked =
    localPart.charAt(0) +
    '*'.repeat(Math.max(3, localPart.length - 2)) +
    '@' +
    domain

  return masked
}

/**
 * Masks a phone number
 * @example maskPhone("5551234567") => "****4567"
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const lastDigits = cleaned.slice(-4)
  return '*'.repeat(Math.max(4, cleaned.length - 4)) + lastDigits
}

/**
 * Removes sensitive fields from an object
 */
export function stripSensitiveData<T extends Record<string, unknown>>(
  obj: T,
  fieldsToKeep: (keyof T)[]
): Partial<T> {
  const result: Partial<T> = {}
  for (const key of fieldsToKeep) {
    result[key] = obj[key]
  }
  return result
}

/**
 * Creates a public view of a user object
 */
export function createPublicUserView(
  user: any,
  context: PrivacyContext
): any {
  return {
    id: user.id,
    name: anonimizeName(user.name, context),
    avatar: user.avatar,
    role: context.isAuthenticated ? user.role : undefined,
  }
}

/**
 * Determines if a field should be visible to the current user
 */
export function isFieldPublic(
  fieldName: string,
  userRole: UserRole = 'guest'
): boolean {
  const publicFields = ['id', 'name', 'avatar', 'createdAt']
  const staffFields = [...publicFields, 'email', 'role']
  const adminFields = [...staffFields, 'internalNotes']

  const roleVisibility: Record<UserRole, Set<string>> = {
    guest: new Set(publicFields),
    user: new Set(publicFields),
    staff: new Set(staffFields),
    leader: new Set(staffFields),
    admin: new Set(adminFields),
  }

  return roleVisibility[userRole].has(fieldName)
}

/**
 * Applies privacy rules to a user record
 */
export function applyPrivacyRules<T extends Record<string, unknown>>(
  user: T,
  context: PrivacyContext
): Partial<T> {
  const filtered: Partial<T> = {}
  const userRole = context.userRole || 'guest'

  for (const [key, value] of Object.entries(user)) {
    if (isFieldPublic(key, userRole)) {
      if (key === 'name' && typeof value === 'string') {
        filtered[key as keyof T] = anonimizeName(
          value,
          context
        ) as unknown as T[keyof T]
      } else if (key === 'email' && typeof value === 'string') {
        filtered[key as keyof T] = maskEmail(value) as unknown as T[keyof T]
      } else if (key === 'phone' && typeof value === 'string') {
        filtered[key as keyof T] = maskPhone(value) as unknown as T[keyof T]
      } else {
        filtered[key as keyof T] = value as unknown as T[keyof T]
      }
    }
  }

  return filtered
}
