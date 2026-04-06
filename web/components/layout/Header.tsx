"use client";

import { Bell, Search, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Visão geral do sistema" },
  "/users": { title: "Usuários", subtitle: "Gerenciar pacientes cadastrados" },
  "/glucose": { title: "Glicose", subtitle: "Monitoramento glicêmico" },
  "/meals": { title: "Alimentação", subtitle: "Diário alimentar e nutrição" },
  "/journal": { title: "Diário", subtitle: "Registros emocionais e de saúde" },
  "/medications": { title: "Medicamentos", subtitle: "Controle de medicações" },
  "/goals": { title: "Metas", subtitle: "Objetivos de saúde" },
  "/tips": { title: "Dicas & Artigos", subtitle: "Gerenciar conteúdo educativo" },
  "/notifications": { title: "Notificações", subtitle: "Central de notificações" },
  "/reports": { title: "Relatórios", subtitle: "Análises e métricas do sistema" },
  "/settings": { title: "Configurações", subtitle: "Preferências e configurações" },
};

export default function Header() {
  const pathname = usePathname();
  const meta = pageMeta[pathname] ?? { title: "DiabetesCare Admin", subtitle: "" };

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center px-5 gap-4 sticky top-0 z-30">
      {/* Title — pushed right on mobile to avoid hamburger */}
      <div className="flex-1 min-w-0 ml-10 lg:ml-0">
        <h1 className="text-base font-bold text-[#1A2332] leading-tight truncate">{meta.title}</h1>
        <p className="text-xs text-[#9CA3AF] hidden sm:block">{meta.subtitle}</p>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 w-56">
        <Search size={15} className="text-[#9CA3AF] shrink-0" />
        <input
          type="text"
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-sm text-[#1A2332] placeholder-[#9CA3AF] outline-none"
        />
      </div>

      {/* Notifications */}
      <button className="relative w-9 h-9 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl flex items-center justify-center hover:bg-[#E8F5EE] transition-colors">
        <Bell size={17} className="text-[#6B7280]" />
        <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          2
        </span>
      </button>

      {/* Avatar */}
      <button className="flex items-center gap-2 hover:bg-[#F3F4F6] rounded-xl px-2 py-1.5 transition-colors">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
        >
          <span className="text-white text-xs font-bold">AD</span>
        </div>
        <span className="hidden sm:block text-sm font-medium text-[#1A2332]">Admin</span>
        <ChevronDown size={14} className="hidden sm:block text-[#9CA3AF]" />
      </button>
    </header>
  );
}
