"use client"

import { useState, useEffect, useCallback } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "Inicio", href: "/eventos/7742448" },
  { label: "Invitados", href: "#invitado" },
  { label: "Ubicación", href: "#ubicacion" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("#inicio")

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20)

    const sections = navLinks.map((link) => link.href.replace("#", ""))
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i])
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 120) {
          setActiveSection(`#${sections[i]}`)
          break
        }
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#14090c]/90 backdrop-blur-xl shadow-[0_1px_10px_rgba(0,0,0,0.2)] border-b border-amber-400/30"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">

        {/* Brand */}
        <a href="#inicio" className="flex items-center gap-2.5 text-amber-400">
          <span className="flex items-center justify-center size-8 rounded-full border border-amber-400/30 bg-amber-400/10 text-xs font-semibold tracking-wider text-amber-400 transition-colors duration-300 group-hover:bg-amber-400 group-hover:text-[#14090c]">
            M
          </span>
          <span className="text-sm font-medium tracking-[0.2em] uppercase">
            Monte Sion
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`relative px-4 py-2 text-sm tracking-wide rounded-full transition-all duration-300 ${
                    isActive
                      ? "text-amber-400 bg-amber-400/10 shadow-[0_0_6px_rgba(255,191,0,0.6)]"
                      : "text-white/70 hover:text-amber-400 hover:bg-amber-400/10"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(255,191,0,0.8)]" />
                  )}
                </a>
              </li>
            )
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`relative md:hidden flex items-center justify-center size-10 rounded-full transition-all duration-300 ${
            open ? "bg-amber-400 text-[#14090c]" : "text-amber-400 hover:bg-amber-400/10"
          }`}
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
        >
          <span className={`absolute transition-all duration-300 ${open ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"}`}>
            <X className="size-4" />
          </span>
          <span className={`absolute transition-all duration-300 ${open ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`}>
            <Menu className="size-4" />
          </span>
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div className={`fixed inset-0 top-[65px] md:hidden transition-all duration-500 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[#14090c]/90 backdrop-blur-2xl transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />

        {/* Menu content */}
        <div className="relative flex flex-col justify-center px-8 py-12 h-full">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link, index) => {
              const isActive = activeSection === link.href
              return (
                <li
                  key={link.href}
                  className={`transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
                  style={{ transitionDelay: open ? `${index * 80 + 100}ms` : "0ms" }}
                >
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`group flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
                      isActive ? "bg-amber-400/10 shadow-[0_0_6px_rgba(255,191,0,0.6)]" : "hover:bg-amber-400/10"
                    }`}
                  >
                    <span className={`flex items-center justify-center size-10 rounded-xl text-xs font-medium transition-all duration-300 ${
                      isActive ? "bg-amber-400 text-[#14090c]" : "bg-amber-400/20 text-white/70 group-hover:bg-amber-400/30"
                    }`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={`text-2xl font-light tracking-wide transition-colors duration-300 ${
                      isActive ? "text-amber-400" : "text-white/70 group-hover:text-amber-400"
                    }`}>
                      {link.label}
                    </span>
                    <span className={`ml-auto transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}>
                      <span className="block size-2 rounded-full bg-amber-400" />
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>

          {/* Footer line in mobile menu */}
          <div
            className={`mt-auto pt-8 border-t border-amber-400/30 transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
            style={{ transitionDelay: open ? "500ms" : "0ms" }}
          >
            <p className="text-xs text-amber-400 tracking-widest uppercase">
              Iglesia Monte Sion
            </p>
          </div>
        </div>
      </div>
    </nav>
  )
}