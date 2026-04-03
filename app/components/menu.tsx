"use client";

import {
  Home,
  List,
  Calendar,
  Settings,
  Book,
  Bell,
  Rewind,
  ArrowUpRight,
  FileText
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

/* =======================
   Tipos
======================= */
type MenuProps = {
  collapsed: boolean;
  onToggle: () => void;
  notificationsCount?: number;
  showNotifications?: boolean;
};

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  section?: "CLASES";
  href?: string | null;
  target?: string;
  onClick?: () => void; // agregado para clicks custom
  badgeCount?: number;
};

/* =======================
   Data
======================= */
export default function Menu({
  collapsed,
  onToggle,
  notificationsCount,
  showNotifications,
}: MenuProps) {
  const pathname = usePathname();
  const [showBible, setShowBible] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const bibleIframeRef = React.useRef<HTMLIFrameElement>(null);

  const items: MenuItem[] = [
    { label: "Inicio", icon: <Home size={20} />, href: "/" },
    { label: "Avisos", icon: <List size={20} />, href: "/avisos" },
    { label: "Eventos", icon: <Calendar size={20} />, href: "/eventos" },
    ...(showNotifications
      ? [
          {
            label: "Notificaciones",
            icon: <Bell size={20} />,
            href: "/admin",
            badgeCount: notificationsCount,
          },
        ]
      : []),
    { label: "CLASES", icon: null, section: "CLASES" },
    {
      label: "Biblia",
      icon: <Book size={20} />,
      href: null, // se abre en iframe
      onClick: () => setShowBible(true),
    },
    {
      label: "Cómo orar",
      icon: <FileText size={20} />,
      href: "/orar",
    },
    {
      label: "Soporte",
      icon: <Settings size={20} />,
      href: "https://tally.so/r/RGxeaQ",
      target: "_blank",
    },
  ];

  const MenuContent = (
    <>
      {/* Header */}
      <div
        className={`
          p-3 flex items-center
          ${collapsed ? "justify-center" : "justify-between"}
        `}
      >
        {!collapsed && (
          <span className="text-foregroud font-bold text-base">Menú</span>
        )}

        <button
          onClick={onToggle}
          className={`
            bg-foregroud hover:bg-gray-800 rounded-lg
            flex items-center transition-all
            ${collapsed ? "p-2" : "px-3 py-2 gap-2"}
          `}
        >
          {collapsed ? <ArrowUpRight size={18} /> : <Rewind size={18} />}
          {!collapsed && <span className="font-semibold">Cerrar menú</span>}
          {collapsed && <span className="font-semibold sr-only">Abrir menú</span>}
        </button>
      </div>

      {/* Items */}
      <nav className="p-2 flex flex-col gap-2 overflow-y-auto">
        {items.map((item, idx) => {
          if (item.section) {
            return (
              !collapsed && (
                <div
                  key={idx}
                  className="mt-2 mb-1 px-3 text-xs font-bold tracking-wide text-gray-500"
                >
                  {item.section}
                </div>
              )
            );
          }

          const isActive = item.href ? pathname === item.href : false;

          const content = (
            <span
              className={`
                flex items-center w-full rounded-lg transition-colors
                ${collapsed ? "p-2 justify-center" : "px-3 py-2 gap-3"}
                ${isActive ? "bg-red-900" : "hover:bg-gray-800"}
              `}
            >
              <span className="relative grid place-items-center w-6 h-6">
                {item.icon}
                {!!item.badgeCount && collapsed && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-600 text-[10px] leading-4 text-white text-center px-1">
                    {item.badgeCount > 9 ? "9+" : item.badgeCount}
                  </span>
                )}
              </span>
              {!collapsed && (
                <span className="flex items-center gap-2 text-sm font-medium truncate">
                  {item.label}
                  {!!item.badgeCount && (
                    <span className="min-w-5 h-5 rounded-full bg-red-600 text-[11px] leading-5 text-white text-center px-1">
                      {item.badgeCount > 99 ? "99+" : item.badgeCount}
                    </span>
                  )}
                </span>
              )}
            </span>
          );

          if (!item.href) {
            return (
              <button
                key={idx}
                type="button"
                className="text-left"
                onClick={() => {
                  item.onClick?.()
                  setMobileOpen(false)
                }}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={idx}
              href={item.href}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 h-11 w-11 rounded-full bg-black/80 text-white shadow-lg backdrop-blur flex items-center justify-center"
        aria-label="Abrir menú"
      >
        <ArrowUpRight size={18} />
      </button>

      <aside
        className={`
          hidden md:flex h-screen bg-foregroud
          flex-col overflow-hidden
          transition-all duration-300
          ${collapsed ? "w-16" : "w-72"}
        `}
      >
        {MenuContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-80 max-w-[85vw] h-full bg-foregroud flex flex-col shadow-2xl border-r border-white/10">
            {MenuContent}
          </aside>
        </div>
      )}

      {/* Iframe de Biblia */}
      {showBible && (
        <div className="fixed top-0 left-0 w-full h-full z-50 bg-black/80 flex flex-col">
          <button
            className="text-white p-2 self-end"
            onClick={() => setShowBible(false)}
          >
            Cerrar ✕
          </button>
          <iframe
            ref={bibleIframeRef}
            src="https://www.bible.com/bible/128/MAT.5.NVI"
            title="Biblia"
            className="flex-1 w-full border-0"
            allowFullScreen
          />
        </div>
      )}
    </>
  );
}