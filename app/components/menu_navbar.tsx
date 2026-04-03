"use client";

import { useState } from "react";
import clsx from "clsx";

const OPTIONS = ["Inicio", "Artistas", "Listas", "Canciones"];

export default function NavBar() {
  const [active, setActive] = useState("Inicio");

  return (
    <nav className="w-fit mx-auto mt-4">
      <div
        className="
          flex gap-2 px-3 py-1 rounded-full 
          bg-white/10 backdrop-blur-xl
          border border-white/20
          shadow-md
        "
      >
        {OPTIONS.map((opt) => {
          const isActive = active === opt;

          return (
            <button
              key={opt}
              onClick={() => setActive(opt)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                isActive
                  ? "bg-white/25 text-white"
                  : "text-white/70 hover:text-white/90"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </nav>
  );
}