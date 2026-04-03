"use client";

import { useState, useCallback } from "react";
import Menu from "@/app/components/menu";
import ChatBot from "@/app/components/chatbot"

export default function Page() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Sidebar */}
      <Menu collapsed={collapsed} onToggle={toggleMenu} />

      {/* Content */}
      <section className="w-full px-4 py-6">
        <h2 className="sr-only">Chat con IA</h2>
        <ChatBot />
        <p className="text-gray-400 text-center text-xs mt-3">
          La IA puede equivocarse. Si es importante, verifica con un líder o pastor.
        </p>
      </section>
    </div>
  );
}