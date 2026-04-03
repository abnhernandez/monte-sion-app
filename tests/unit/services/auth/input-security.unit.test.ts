import { describe, expect, it } from "@jest/globals"

import {
  hasSuspiciousPayload,
  isValidEmail,
  normalizeEmail,
  validateLoginInput,
} from "@/src/services/auth/input-security"

describe("auth input security", () => {
  it("normaliza email", () => {
    expect(normalizeEmail("  USER@MAIL.COM  ")).toBe("user@mail.com")
  })

  it("detecta formato de email válido e inválido", () => {
    expect(isValidEmail("persona@mail.com")).toBe(true)
    expect(isValidEmail("persona-mail.com")).toBe(false)
  })

  it("detecta payloads sospechosos (XSS/SQL-like)", () => {
    expect(hasSuspiciousPayload("<script>alert(1)</script>")).toBe(true)
    expect(hasSuspiciousPayload("' UNION SELECT * FROM users --")).toBe(true)
    expect(hasSuspiciousPayload("javascript:alert(1)")).toBe(true)
    expect(hasSuspiciousPayload("onerror=alert(1)")).toBe(true)
    expect(hasSuspiciousPayload("onload=alert(1)")).toBe(true)
    expect(hasSuspiciousPayload("DROP TABLE users;")).toBe(true)
    expect(hasSuspiciousPayload("contenido normal")).toBe(false)
  })

  it("rechaza input inválido y acepta input seguro", () => {
    expect(validateLoginInput({ email: "", password: "" })).toEqual({
      valid: false,
      reason: "Campos requeridos",
    })

    expect(
      validateLoginInput({ email: "foo@mail.com", password: "123" })
    ).toEqual({ valid: false, reason: "Password inválido" })

    expect(
      validateLoginInput({
        email: "foo@mail.com",
        password: "123456<script>alert(1)</script>",
      })
    ).toEqual({ valid: false, reason: "Payload sospechoso" })

    expect(
      validateLoginInput({
        email: "javascript:foo@mail.com",
        password: "123456",
      })
    ).toEqual({ valid: false, reason: "Payload sospechoso" })

    expect(
      validateLoginInput({
        email: "foo@mail.com",
        password: "123456",
      })
    ).toEqual({ valid: true })
  })

  it("cubre edge cases adicionales de validación", () => {
    expect(
      validateLoginInput({
        email: "   ",
        password: "123456",
      })
    ).toEqual({ valid: false, reason: "Campos requeridos" })

    expect(
      validateLoginInput({
        email: "foo@mail.com",
        password: "",
      })
    ).toEqual({ valid: false, reason: "Campos requeridos" })

    expect(
      validateLoginInput({
        email: "foo@mail.com",
        password: "123456--",
      })
    ).toEqual({ valid: false, reason: "Payload sospechoso" })
  })
})
