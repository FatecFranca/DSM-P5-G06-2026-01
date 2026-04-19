"use client";

import { useState } from "react";
import {
  Settings, User, Bell, Shield, Palette, Database,
  Save, ChevronRight, Globe, Monitor, Moon, Sun,
  Lock, Key, Mail, Phone, CheckCircle2, Info, Eye, EyeOff,
  Smartphone, RefreshCw,
} from "lucide-react";

type SettingSection = "profile" | "notifications" | "security" | "appearance" | "system";

const sections: { id: SettingSection; label: string; icon: React.ElementType; description: string }[] = [
  { id: "profile", label: "Perfil Admin", icon: User, description: "Informações do administrador" },
  { id: "notifications", label: "Notificações", icon: Bell, description: "Preferências de alertas" },
  { id: "security", label: "Segurança", icon: Shield, description: "Senha e autenticação" },
  { id: "appearance", label: "Aparência", icon: Palette, description: "Tema e visualização" },
  { id: "system", label: "Sistema", icon: Database, description: "Configurações da plataforma" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex w-11 h-6 rounded-full transition-colors shrink-0"
      style={{ backgroundColor: checked ? "#4CAF82" : "#D1D5DB" }}
    >
      <span
        className="inline-block w-5 h-5 bg-white rounded-full shadow transition-transform mt-0.5"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>("profile");
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Profile
  const [adminName, setAdminName] = useState("Administrador");
  const [adminEmail, setAdminEmail] = useState("admin@diabetescare.com");
  const [adminPhone, setAdminPhone] = useState("+55 11 99999-0000");
  const [adminRole] = useState("Super Admin");

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifGlucose, setNotifGlucose] = useState(true);
  const [notifMedication, setNotifMedication] = useState(true);
  const [notifGoals, setNotifGoals] = useState(false);
  const [notifNewUsers, setNotifNewUsers] = useState(true);
  const [notifReports, setNotifReports] = useState(false);

  // Appearance
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [language, setLanguage] = useState("pt-BR");
  const [compactView, setCompactView] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // System
  const [dataRetention, setDataRetention] = useState("12");
  const [autoBackup, setAutoBackup] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A2332 0%, #374151 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Sistema</p>
          <h2 className="text-2xl font-bold mt-1">Configurações</h2>
          <p className="text-white/70 text-sm mt-1">Gerencie o perfil e preferências do painel administrativo</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Settings size={120} strokeWidth={1} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Sidebar sections */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            {sections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                  i < sections.length - 1 ? "border-b border-[#F0F2F5]" : ""
                } ${
                  activeSection === s.id
                    ? "bg-[#E8F5EE]"
                    : "hover:bg-[#F7F9FC]"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: activeSection === s.id ? "#4CAF82" : "#F0F2F5",
                  }}
                >
                  <s.icon size={15} style={{ color: activeSection === s.id ? "white" : "#6B7280" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${activeSection === s.id ? "text-[#4CAF82]" : "text-[#1A2332]"}`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-[#9CA3AF] truncate">{s.description}</p>
                </div>
                <ChevronRight size={14} className={activeSection === s.id ? "text-[#4CAF82]" : "text-[#D1D5DB]"} />
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#F0F2F5]">
                <User size={18} className="text-[#4CAF82]" />
                <h3 className="font-bold text-[#1A2332]">Perfil do Administrador</h3>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                >
                  AD
                </div>
                <div>
                  <p className="font-semibold text-[#1A2332]">{adminName}</p>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">{adminRole}</p>
                  <button className="text-xs text-[#4CAF82] hover:underline mt-1 font-medium">
                    Alterar foto
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                    <User size={11} className="inline mr-1" />Nome completo
                  </label>
                  <input
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                    <Mail size={11} className="inline mr-1" />Email
                  </label>
                  <input
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    type="email"
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                    <Phone size={11} className="inline mr-1" />Telefone
                  </label>
                  <input
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                    <Shield size={11} className="inline mr-1" />Nível de acesso
                  </label>
                  <input
                    value={adminRole}
                    readOnly
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#9CA3AF] outline-none bg-[#F7F9FC] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#F0F2F5]">
                <Bell size={18} className="text-[#3B8ED0]" />
                <h3 className="font-bold text-[#1A2332]">Preferências de Notificação</h3>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Canais</p>
                {[
                  { label: "Notificações por Email", sub: "Receber alertas no email cadastrado", value: notifEmail, set: setNotifEmail, icon: Mail },
                  { label: "Notificações Push", sub: "Alertas no navegador em tempo real", value: notifPush, set: setNotifPush, icon: Smartphone },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#F0F2F5] last:border-0">
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-[#9CA3AF]" />
                      <div>
                        <p className="text-sm font-medium text-[#1A2332]">{item.label}</p>
                        <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
                      </div>
                    </div>
                    <Toggle checked={item.value} onChange={item.set} />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Tipos de Alerta</p>
                {[
                  { label: "Glicose crítica", sub: "Leituras muito altas ou baixas", value: notifGlucose, set: setNotifGlucose },
                  { label: "Aderência medicamentosa", sub: "Pacientes com doses em atraso", value: notifMedication, set: setNotifMedication },
                  { label: "Metas atingidas", sub: "Conquistas dos pacientes", value: notifGoals, set: setNotifGoals },
                  { label: "Novos usuários", sub: "Cadastros na plataforma", value: notifNewUsers, set: setNotifNewUsers },
                  { label: "Relatórios prontos", sub: "Quando relatórios estão disponíveis", value: notifReports, set: setNotifReports },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#F0F2F5] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1A2332]">{item.label}</p>
                      <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
                    </div>
                    <Toggle checked={item.value} onChange={item.set} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#F0F2F5]">
                <Shield size={18} className="text-[#EF4444]" />
                <h3 className="font-bold text-[#1A2332]">Segurança</h3>
              </div>

              <div className="p-3 rounded-xl bg-[#D1FAE5] flex gap-2">
                <CheckCircle2 size={16} className="text-[#10B981] shrink-0 mt-0.5" />
                <p className="text-xs text-[#065F46]">Sua conta está protegida. Último acesso: hoje às 09:00.</p>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Alterar Senha</p>
                {[
                  { label: "Senha atual", placeholder: "Digite sua senha atual" },
                  { label: "Nova senha", placeholder: "Mínimo 8 caracteres" },
                  { label: "Confirmar nova senha", placeholder: "Repita a nova senha" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                      <Key size={11} className="inline mr-1" />{field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={field.placeholder}
                        className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 pr-10 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Autenticação de Dois Fatores</p>
                <div className="flex items-center justify-between py-3 border border-[#E5E7EB] rounded-xl px-4">
                  <div className="flex items-center gap-3">
                    <Smartphone size={16} className="text-[#9CA3AF]" />
                    <div>
                      <p className="text-sm font-medium text-[#1A2332]">2FA por aplicativo</p>
                      <p className="text-xs text-[#9CA3AF]">Google Authenticator ou similar</p>
                    </div>
                  </div>
                  <button className="text-xs text-[#4CAF82] font-semibold border border-[#4CAF82] px-3 py-1.5 rounded-lg hover:bg-[#E8F5EE] transition-colors">
                    Ativar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === "appearance" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#F0F2F5]">
                <Palette size={18} className="text-[#8B5CF6]" />
                <h3 className="font-bold text-[#1A2332]">Aparência</h3>
              </div>

              {/* Theme */}
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Tema</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Claro", icon: Sun },
                    { value: "dark", label: "Escuro", icon: Moon },
                    { value: "system", label: "Sistema", icon: Monitor },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value as typeof theme)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === t.value
                          ? "border-[#4CAF82] bg-[#E8F5EE]"
                          : "border-[#E5E7EB] hover:border-[#D1D5DB]"
                      }`}
                    >
                      <t.icon size={20} style={{ color: theme === t.value ? "#4CAF82" : "#9CA3AF" }} />
                      <span className={`text-xs font-medium ${theme === t.value ? "text-[#4CAF82]" : "text-[#6B7280]"}`}>
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                  <Globe size={11} className="inline mr-1" />Idioma
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82]"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Visualização</p>
                {[
                  { label: "Visualização compacta", sub: "Reduz espaçamento entre elementos", value: compactView, set: setCompactView },
                  { label: "Animações", sub: "Transições e efeitos visuais", value: animationsEnabled, set: setAnimationsEnabled },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-[#F0F2F5] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1A2332]">{item.label}</p>
                      <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
                    </div>
                    <Toggle checked={item.value} onChange={item.set} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Section */}
          {activeSection === "system" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-[#F0F2F5]">
                <Database size={18} className="text-[#F97316]" />
                <h3 className="font-bold text-[#1A2332]">Configurações do Sistema</h3>
              </div>

              {/* System info */}
              <div className="p-4 rounded-xl bg-[#F7F9FC] border border-[#E5E7EB]">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Informações</p>
                <div className="space-y-2">
                  {[
                    { label: "Versão do sistema", value: "v1.0.0-beta" },
                    { label: "Ambiente", value: "Desenvolvimento" },
                    { label: "Banco de dados", value: "Mock (desenvolvimento)" },
                    { label: "Última atualização", value: "07/04/2026" },
                    { label: "Usuários cadastrados", value: "8 pacientes" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-xs">
                      <span className="text-[#9CA3AF]">{row.label}</span>
                      <span className="font-medium text-[#1A2332]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data retention */}
              <div>
                <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
                  <Database size={11} className="inline mr-1" />Retenção de dados (meses)
                </label>
                <select
                  value={dataRetention}
                  onChange={(e) => setDataRetention(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#4CAF82]"
                >
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="0">Indefinido</option>
                </select>
              </div>

              {/* System toggles */}
              <div className="space-y-1">
                {[
                  { label: "Backup automático", sub: "Realiza backup diário dos dados", value: autoBackup, set: setAutoBackup },
                  { label: "Modo manutenção", sub: "Desabilita acesso para usuários", value: maintenanceMode, set: setMaintenanceMode, danger: true },
                  { label: "Modo debug", sub: "Ativa logs detalhados do sistema", value: debugMode, set: setDebugMode },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between py-3 border-b border-[#F0F2F5] last:border-0 rounded-lg px-2 ${item.danger && item.value ? "bg-[#FEF2F2]" : ""}`}>
                    <div className="flex items-center gap-2">
                      {item.danger && <Info size={14} className="text-[#EF4444] shrink-0" />}
                      <div>
                        <p className={`text-sm font-medium ${item.danger ? "text-[#EF4444]" : "text-[#1A2332]"}`}>{item.label}</p>
                        <p className="text-xs text-[#9CA3AF]">{item.sub}</p>
                      </div>
                    </div>
                    <Toggle checked={item.value} onChange={item.set} />
                  </div>
                ))}
              </div>

              {/* Cache button */}
              <button className="flex items-center gap-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-xl px-4 py-2.5 hover:bg-[#F7F9FC] transition-colors w-full justify-center">
                <RefreshCw size={14} />
                Limpar Cache do Sistema
              </button>
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E5E7EB] px-5 py-3.5 shadow-sm">
            {saved ? (
              <span className="flex items-center gap-2 text-sm text-[#4CAF82] font-medium">
                <CheckCircle2 size={16} />
                Configurações salvas com sucesso!
              </span>
            ) : (
              <span className="text-xs text-[#9CA3AF]">Clique em salvar para aplicar as alterações</span>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-[#4CAF82] hover:bg-[#388E63] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <Save size={15} />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
