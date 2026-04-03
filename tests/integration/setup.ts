import { afterEach } from "@jest/globals"

afterEach(() => {
  jest.restoreAllMocks()
  jest.clearAllMocks()
})
