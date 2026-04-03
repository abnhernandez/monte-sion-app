const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MALICIOUS_PATTERNS = [
  /<script\b[^>]*>(.*?)<\/script>/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /union\s+select/i,
  /drop\s+table/i,
  /--/,
]

export type LoginInput = {
  email: string
  password: string
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(normalizeEmail(email))
}

export function hasSuspiciousPayload(value: string): boolean {
  return MALICIOUS_PATTERNS.some((pattern) => pattern.test(value))
}

export function validateLoginInput(input: LoginInput): { valid: true } | { valid: false; reason: string } {
  const email = normalizeEmail(input.email)
  const password = input.password

  if (!email || !password) {
    return { valid: false, reason: "Campos requeridos" }
  }

  if (!isValidEmail(email)) {
    return { valid: false, reason: "Email inválido" }
  }

  if (password.length < 6) {
    return { valid: false, reason: "Password inválido" }
  }

  if (hasSuspiciousPayload(email) || hasSuspiciousPayload(password)) {
    return { valid: false, reason: "Payload sospechoso" }
  }

  return { valid: true }
}
