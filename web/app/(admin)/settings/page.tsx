"use client";

import { useState } from "react";
import {
  Settings, User, Bell, Shield, Database, Globe, Moon, Sun,
  Save, Eye, EyeOff, CheckCircle2, AlertCircle, Palette,
} from "lucide-react";

const SECTIONS = [
  { id: "profile", label: "Perfil Admin", icon: User },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "security", label: "Segurança", icon: Shield },
  { id: "system", label: "Sistema", icon: Database },
  { id: "appearance", label: "Aparência", icon: Palette },
];

const ROLES = ["Administrador", "Moderador", "Visualizador"];

const NOTIF_OPTS = [
  { key: "glucose_alerts", label: "Alertas de Glicose Alta/Baixa", desc: "Notificar quando usuário atingir nível crítico" },
  { key: "new_users", label: "Novos Cadastros", desc: "Receber alerta quando um novo usuário se registrar" },
  { key: "medication_missed", label: "Medicação Não Tomada", desc: "Alertar sobre usuários com baixa aderência" },
  { key: "weekly_report", label: "Relatório Semanal", desc: "Receber resumo semanal da plataforma por e-mail" },
  { key: "system_errors", label: "Erros do Sistema", desc: "Alertas técnicos e falhas críticas" },
  { key: "goal_completed", label: "Metas Concluídas", desc: "Celebrar conquistas dos usuários" },
];

const ALERT_THRESHOLDS = [
  { key: "glucose_high", label: "Glicose Alta", unit: "mg/dL", value: "180" },
  { key: "glucose_very_high", label: "Glicose Muito Alta", unit: "mg/dL", value: "250" },
  { key: "glucose_low", label: "Glicose Baixa", unit: "mg/dL", value: "70" },
  { key: "adherence_low", label: "Aderência Baixa", unit: "%", value: "60" },
  { key: "inactivity", label: "Inatividade", unit: "dias", value: "30" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("pt-BR");
  const [role, setRole] = useState("Administrador");
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_OPTS.map((o) => [o.key, true]))
  );
  const [thresholds, setThresholds] = useState<Record<string, string>>(
    Object.fromEntries(ALERT_THRESHOLDS.map((t) => [t.key, t.value]))
  );

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #374151 0%, #1A2332 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium">Painel Admin</p>
          <h2 className="text-2xl font-bold mt-1">Configurações</h2>
          <p className="text-white/50 text-sm mt-1">Gerencie preferências e parâmetros do sistema</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Settings size={120} strokeWidth={1} />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        {/* Sidebar nav */}
        <div className="xl:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={
                  activeSection === s.id
                    ? { backgroundColor: "#E8F5EE", color: "#4CAF82" }
                    : { color: "#6B7280" }
                }
              >
                <s.icon size={16} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-5">

          {/* Profile */}
          {activeSection === "profile" && (
            <>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-4">Informações do Administrador</h3>
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                  >
                    AD
                  </div>
                  <div>
                    <p className="font-bold text-[#1A2332]">Admin DiabetesCare</p>
                    <p className="text-sm text-[#9CA3AF]">admin@diabetescare.com</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F5EE] text-[#4CAF82]">
                      {role}
                    </span>
                  </div>
                  <button className="ml-auto text-xs text-[#3B8ED0] font-medium hover:underline border border-[#E5E7EB] px-3 py-1.5 rounded-lg">
                    Trocar foto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Nome completo", placeholder: "Admin DiabetesCare", type: "text" },
                    { label: "E-mail", placeholder: "admin@diabetescare.com", type: "email" },
                    { label: "Telefone", placeholder: "+55 (11) 99999-9999", type: "tel" },
                    { label: "CRM / Registro", placeholder: "Opcional", type: "text" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82] transition-colors bg-[#F7F9FC]"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">Papel / Permissão</label>
                  <div className="flex gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={
                          role === r
                            ? { backgroundColor: "#E8F5EE", color: "#4CAF82" }
                            : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                        }
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-1">Preferências de Notificação</h3>
                <p className="text-xs text-[#9CA3AF] mb-4">Configure quais alertas você deseja receber</p>
                <div className="divide-y divide-[#F0F2F5]">
                  {NOTIF_OPTS.map((opt) => (
                    <div key={opt.key} className="flex items-center justify-between py-3.5">
                      <div>
                        <p className="text-sm font-medium text-[#1A2332]">{opt.label}</p>
                        <p className="text-xs text-[#9CA3AF]">{opt.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifToggles((t) => ({ ...t, [opt.key]: !t[opt.key] }))}
                        className="w-11 h-6 rounded-full transition-all shrink-0 relative"
                        style={{ backgroundColor: notifToggles[opt.key] ? "#4CAF82" : "#D1D5DB" }}
                      >
                        <span
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                          style={{ left: notifToggles[opt.key] ? "calc(100% - 20px)" : "4px" }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-1">Limites de Alerta</h3>
                <p className="text-xs text-[#9CA3AF] mb-4">Defina os valores que disparam notificações automáticas</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ALERT_THRESHOLDS.map((t) => (
                    <div key={t.key}>
                      <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
                        {t.label} <span className="text-[#9CA3AF] font-normal">({t.unit})</span>
                      </label>
                      <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl overflow-hidden bg-[#F7F9FC]">
                        <input
                          type="number"
                          value={thresholds[t.key]}
                          onChange={(e) => setThresholds((prev) => ({ ...prev, [t.key]: e.target.value }))}
                          className="flex-1 px-3 py-2 text-sm text-[#1A2332] outline-none bg-transparent"
                        />
                        <span className="px-3 text-xs text-[#9CA3AF] shrink-0">{t.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-4">Alterar Senha</h3>
                <div className="space-y-4 max-w-md">
                  {[
                    { label: "Senha atual", placeholder: "••••••••" },
                    { label: "Nova senha", placeholder: "Mínimo 8 caracteres" },
                    { label: "Confirmar nova senha", placeholder: "Repita a nova senha" },
                  ].map((field, i) => (
                    <div key={field.label}>
                      <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">{field.label}</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder={field.placeholder}
                          className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82] transition-colors bg-[#F7F9FC] pr-10"
                        />
                        {i === 0 && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="bg-[#FEF3C7] rounded-xl p-3">
                    <p className="text-xs text-[#92400E] flex items-start gap-1.5">
                      <AlertCircle size={13} className="shrink-0 mt-0.5" />
                      A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-1">Segurança da Conta</h3>
                <p className="text-xs text-[#9CA3AF] mb-4">Configure medidas adicionais de proteção</p>
                <div className="space-y-4">
                  {[
                    { label: "Autenticação em dois fatores (2FA)", desc: "Adiciona camada extra de segurança no login", enabled: false },
                    { label: "Sessões simultâneas", desc: "Permitir login em múltiplos dispositivos", enabled: true },
                    { label: "Log de auditoria", desc: "Registrar todas as ações administrativas", enabled: true },
                    { label: "IP Whitelist", desc: "Restringir acesso a endereços IP específicos", enabled: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#F0F2F5] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#1A2332]">{item.label}</p>
                        <p className="text-xs text-[#9CA3AF]">{item.desc}</p>
                      </div>
                      <div
                        className="w-11 h-6 rounded-full transition-all shrink-0 relative cursor-pointer"
                        style={{ backgroundColor: item.enabled ? "#4CAF82" : "#D1D5DB" }}
                      >
                        <span
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                          style={{ left: item.enabled ? "calc(100% - 20px)" : "4px" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-3">Sessões Ativas</h3>
                <div className="space-y-3">
                  {[
                    { device: "Chrome · Windows 11", ip: "192.168.1.10", time: "Agora", current: true },
                    { device: "Safari · iPhone 15", ip: "187.52.14.220", time: "2h atrás", current: false },
                  ].map((session) => (
                    <div key={session.device} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-[#F7F9FC]">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#1A2332]">{session.device}</p>
                          {session.current && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-[#10B981] font-semibold">Atual</span>
                          )}
                        </div>
                        <p className="text-xs text-[#9CA3AF]">{session.ip} · {session.time}</p>
                      </div>
                      {!session.current && (
                        <button className="text-xs text-[#EF4444] font-medium hover:underline">Encerrar</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* System */}
          {activeSection === "system" && (
            <>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-1">Parâmetros Clínicos Padrão</h3>
                <p className="text-xs text-[#9CA3AF] mb-4">Valores utilizados como referência na plataforma</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Glicose Alvo Mínima", unit: "mg/dL", value: "70" },
                    { label: "Glicose Alvo Máxima", unit: "mg/dL", value: "140" },
                    { label: "HbA1c Meta Geral", unit: "%", value: "7.0" },
                    { label: "Água Diária Recomendada", unit: "ml", value: "2500" },
                    { label: "Passos Diários Meta", unit: "passos", value: "8000" },
                    { label: "Sono Mínimo", unit: "horas", value: "7" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">
                        {field.label} <span className="text-[#9CA3AF] font-normal">({field.unit})</span>
                      </label>
                      <input
                        type="number"
                        defaultValue={field.value}
                        className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82] transition-colors bg-[#F7F9FC]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-1">Localização & Idioma</h3>
                <p className="text-xs text-[#9CA3AF] mb-4">Configurações regionais do sistema</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">Idioma</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82] transition-colors bg-[#F7F9FC]"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] mb-1.5">Fuso Horário</label>
                    <select className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82] transition-colors bg-[#F7F9FC]">
                      <option>America/Sao_Paulo (UTC-3)</option>
                      <option>America/New_York (UTC-5)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-3">Status do Sistema</h3>
                <div className="space-y-3">
                  {[
                    { name: "API Principal", status: "Operacional", color: "#4CAF82" },
                    { name: "Banco de Dados", status: "Operacional", color: "#4CAF82" },
                    { name: "Serviço de Notificações", status: "Operacional", color: "#4CAF82" },
                    { name: "Backup Automático", status: "Último: hoje às 03:00", color: "#3B8ED0" },
                    { name: "Versão do Sistema", status: "v2.4.1", color: "#9CA3AF" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-2 border-b border-[#F0F2F5] last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <p className="text-sm text-[#1A2332]">{item.name}</p>
                      </div>
                      <p className="text-xs font-medium" style={{ color: item.color }}>{item.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <>
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-4">Tema do Painel</h3>
                <div className="flex gap-4">
                  {[
                    { label: "Claro", icon: Sun, active: !darkMode },
                    { label: "Escuro", icon: Moon, active: darkMode },
                  ].map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setDarkMode(t.label === "Escuro")}
                      className="flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                      style={
                        t.active
                          ? { borderColor: "#4CAF82", backgroundColor: "#E8F5EE" }
                          : { borderColor: "#E5E7EB", backgroundColor: "#F7F9FC" }
                      }
                    >
                      <t.icon size={24} style={{ color: t.active ? "#4CAF82" : "#9CA3AF" }} />
                      <span className="text-sm font-medium" style={{ color: t.active ? "#4CAF82" : "#6B7280" }}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-1">Cor de Destaque</h3>
                <p className="text-xs text-[#9CA3AF] mb-4">Escolha a cor principal da interface</p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { color: "#4CAF82", label: "Verde (padrão)", active: true },
                    { color: "#3B8ED0", label: "Azul", active: false },
                    { color: "#8B5CF6", label: "Roxo", active: false },
                    { color: "#F97316", label: "Laranja", active: false },
                    { color: "#EC4899", label: "Rosa", active: false },
                    { color: "#14B8A6", label: "Teal", active: false },
                  ].map((c) => (
                    <div key={c.color} className="flex flex-col items-center gap-1">
                      <button
                        className="w-10 h-10 rounded-full border-4 transition-all"
                        style={{
                          backgroundColor: c.color,
                          borderColor: c.active ? c.color : "transparent",
                          boxShadow: c.active ? `0 0 0 2px white, 0 0 0 4px ${c.color}` : "none",
                        }}
                      />
                      <span className="text-[10px] text-[#9CA3AF]">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <h3 className="font-bold text-[#1A2332] mb-4">Preferências de Layout</h3>
                <div className="space-y-3">
                  {[
                    { label: "Sidebar compacta", desc: "Mostrar apenas ícones na barra lateral", enabled: false },
                    { label: "Animações", desc: "Habilitar transições e micro-animações", enabled: true },
                    { label: "Números formatados", desc: "Usar separador de milhar nos valores", enabled: true },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#F0F2F5] last:border-0">
                      <div>
                        <p className="text-sm font-medium text-[#1A2332]">{item.label}</p>
                        <p className="text-xs text-[#9CA3AF]">{item.desc}</p>
                      </div>
                      <div
                        className="w-11 h-6 rounded-full transition-all shrink-0 relative cursor-pointer"
                        style={{ backgroundColor: item.enabled ? "#4CAF82" : "#D1D5DB" }}
                      >
                        <span
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                          style={{ left: item.enabled ? "calc(100% - 20px)" : "4px" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Save button */}
          <div className="flex items-center justify-between">
            {saved && (
              <div className="flex items-center gap-1.5 text-sm text-[#10B981] font-medium">
                <CheckCircle2 size={15} /> Configurações salvas com sucesso!
              </div>
            )}
            <button
              onClick={handleSave}
              className="ml-auto flex items-center gap-2 bg-[#4CAF82] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#388E63] transition-colors"
            >
              <Save size={16} />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
