import { describe, expect, it } from "@jest/globals"

import type { AccountProfile } from "@/lib/account"
import {
  buildPrayerRequestAutofill,
  countAutofillEntries,
} from "@/lib/form-autofill"

const profile: AccountProfile = {
  id: "user-1",
  name: "Juan Pérez",
  bio: "",
  avatar_url: null,
  email: "juan@example.com",
  username: null,
  phone: "+5215555555555",
  role: "user",
  canAccessBirthdays: false,
  birthday: null,
  autofill: {
    enabled: true,
    churchName: "",
    city: "",
    campRole: "participant",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
    emergencyAddress: "",
    guardianName: "",
    guardianRelationship: "",
    guardianPhone: "",
    guardianEmail: "",
  },
  created_at: null,
  updated_at: null,
}

describe("form-autofill helpers", () => {
  it("returns empty values when autofill is disabled", () => {
    const values = buildPrayerRequestAutofill({
      ...profile,
      autofill: {
        ...profile.autofill,
        enabled: false,
      },
    })

    expect(values).toEqual({
      nombre: "",
      email: "",
      telefono: "",
    })
  })

  it("maps profile data into prayer request autofill", () => {
    const values = buildPrayerRequestAutofill(profile)

    expect(values).toEqual({
      nombre: "Juan Pérez",
      email: "juan@example.com",
      telefono: "+5215555555555",
    })
  })

  it("counts non-empty autofill entries", () => {
    expect(
      countAutofillEntries({
        nombre: "Juan Pérez",
        email: "",
        anonimo: false,
        telefono: "",
        visible: true,
      }),
    ).toBe(2)
  })
})