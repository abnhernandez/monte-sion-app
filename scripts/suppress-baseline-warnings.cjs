const originalWarn = console.warn

console.warn = (...args) => {
  const firstArg = args[0]

  if (typeof firstArg === "string") {
    if (firstArg.includes("[baseline-browser-mapping]") && firstArg.includes("over two months old")) {
      return
    }

    if (firstArg.includes("baseline-browser-mapping") && firstArg.includes("over two months old")) {
      return
    }
  }

  originalWarn(...args)
}