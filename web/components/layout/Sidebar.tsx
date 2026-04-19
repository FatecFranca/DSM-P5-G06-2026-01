"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Activity, UtensilsCrossed, BookOpen,
  Pill, Target, BarChart2, Lightbulb, Bell, Settings,
  Heart, LogOut, Menu, X, HelpCircle, Moon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    section: "VISÃO GERAL",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    section: "GESTÃO",
    items: [
      { label: "Usuários", href: "/users", icon: Users },
      { label: "Glicose", href: "/glucose", icon: Activity },
      { label: "Alimentação", href: "/meals", icon: UtensilsCrossed },
      { label: "Diário", href: "/journal", icon: BookOpen },
      { label: "Medicamentos", href: "/medications", icon: Pill },
      { label: "Metas", href: "/goals", icon: Target },
      { label: "Sono", href: "/sleep", icon: Moon },
    ],
  },
  {
    section: "CONTEÚDO",
    items: [
      { label: "Dicas & Artigos", href: "/tips", icon: Lightbulb },
      { label: "FAQ", href: "/faq", icon: HelpCircle },
      { label: "Notificações", href: "/notifications", icon: Bell, badge: 2 },
    ],
  },
  {
    section: "SISTEMA",
    items: [
      { label: "Relatórios", href: "/reports", icon: BarChart2 },
      { label: "Configurações", href: "/settings", icon: Settings },
    ],
  },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E7EB] flex items-center gap-3 shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
        >
          <Heart size={18} color="white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[#1A2332] text-sm leading-tight">DiabetesCare</p>
          <p className="text-[#6B7280] text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.section}>
            <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-1.5 px-2">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                        active
                          ? "bg-[#E8F5EE] text-[#4CAF82]"
                          : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A2332]"
                      )}
                    >
                      <item.icon
                        size={17}
                        className={cn(active ? "text-[#4CAF82]" : "text-[#9CA3AF] group-hover:text-[#6B7280]")}
                      />
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge ? (
                        <span className="bg-[#EF4444] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-3 border-t border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F3F4F6] cursor-pointer transition-colors group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
          >
            <span className="text-white text-xs font-bold">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1A2332] truncate">Admin</p>
            <p className="text-xs text-[#6B7280] truncate">admin@diabetescare.com</p>
          </div>
          <LogOut size={15} className="text-[#9CA3AF] group-hover:text-[#EF4444] transition-colors shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-white rounded-lg shadow-md border border-[#E5E7EB] flex items-center justify-center"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X size={18} className="text-[#1A2332]" /> : <Menu size={18} className="text-[#1A2332]" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E5E7EB] z-40 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onClose={() => setOpen(false)} />
      </aside>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-[#E5E7EB] h-screen sticky top-0 flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
