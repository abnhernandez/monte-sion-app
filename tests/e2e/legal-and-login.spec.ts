import { expect, test } from "@playwright/test"

test("legal center and login essentials are reachable", async ({ page }) => {
  await page.goto("/legal")
  await expect(page.getByRole("heading", { name: "Documentos legales" })).toBeVisible()

  await page.getByRole("link", { name: "Terminos y Condiciones" }).click()
  await expect(page.getByRole("heading", { name: "Terminos y Condiciones" })).toBeVisible()

  await page.goto("/login")
  await expect(page.getByRole("button", { name: "Entrar ahora" })).toBeVisible()
  await expect(page.getByRole("button", { name: /Continuar con GitHub/i })).toBeVisible()
  await expect(page.getByRole("button", { name: /Continuar con Notion/i })).toBeVisible()
  await expect(page.getByRole("button", { name: /Continuar con Spotify/i })).toBeVisible()
})
