import "@testing-library/jest-dom/jest-globals"
import { describe, expect, it, beforeEach, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import LoginForm from "@/app/components/login"

jest.mock("@/lib/auth-actions", () => ({
  loginAction: jest.fn(),
  getOAuthUrlAction: jest.fn(),
}))

describe("LoginForm", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("muestra validaciones cuando se envía vacío", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /entrar ahora/i }))

    expect(await screen.findByText("Correo inválido")).toBeInTheDocument()
    expect(await screen.findByText("Contraseña inválida")).toBeInTheDocument()
  })

  it("muestra los accesos rápidos disponibles", () => {
    render(<LoginForm />)

    expect(screen.getByRole("button", { name: /continuar con github/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /continuar con notion/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /continuar con spotify/i })).toBeInTheDocument()
  })
})