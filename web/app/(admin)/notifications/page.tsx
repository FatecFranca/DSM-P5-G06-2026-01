"use client";

import { useState } from "react";
import {
  Bell, BellOff, CheckCheck, Filter, Plus, Activity,
  UtensilsCrossed, Pill, Calendar, Lightbulb, Target, Users,
  Clock, Trash2, Send,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import { MOCK_NOTIFICATIONS, MOCK_USERS, type NotifType } from "@/lib/mock-data";
import { notifTypeColor, formatDate, getInitials } from "@/lib/utils";

const stats = [
  { label: "Total", value: MOCK_NOTIFICATIONS.length, color: "#3B8ED0", bg: "#E3F0FB", icon: Bell },
  { label: "Não Lidas", value: MOCK_NOTIFICATIONS.filter((n) => !n.read).length, color: "#EF4444", bg: "#FEE2E2", icon: BellOff },
  { label: "Lidas", value: MOCK_NOTIFICATIONS.filter((n) => n.read).length, color: "#4CAF82", bg: "#E8F5EE", icon: CheckCheck },
  { label: "Usuários Notificados", value: new Set(MOCK_NOTIFICATIONS.map((n) => n.userId)).size, color: "#8B5CF6", bg: "#EDE9FE", icon: Users },
];

const typeConfig: Record<NotifType, { label: string; icon: React.ElementType; color: string }> = {
  glucose: { label: "Glicose", icon: Activity, color: "#EF4444" },
  meal: { label: "Refeição", icon: UtensilsCrossed, color: "#4CAF82" },
  medication: { label: "Medicação", icon: Pill, color: "#8B5CF6" },
  appointment: { label: "Consulta", icon: Calendar, color: "#3B8ED0" },
  tip: { label: "Dica", icon: Lightbulb, color: "#F97316" },
  goal: { label: "Meta", icon: Target, color: "#14B8A6" },
};

const typeFilters: { value: "all" | NotifType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "glucose", label: "Glicose" },
  { value: "meal", label: "Refeição" },
  { value: "medication", label: "Medicação" },
  { value: "appointment", label: "Consulta" },
  { value: "tip", label: "Dica" },
  { value: "goal", label: "Meta" },
];

const typeDistribution = (Object.keys(typeConfig) as NotifType[]).map((type) => ({
  name: typeConfig[type].label,
  value: MOCK_NOTIFICATIONS.filter((n) => n.type === type).length,
  color: typeConfig[type].color,
})).filter((d) => d.value > 0);

export default function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState<"all" | NotifType>("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const userMap = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u]));

  const filtered = notifications.filter((n) => {
    const matchType = typeFilter === "all" || n.type === typeFilter;
    const matchRead =
      readFilter === "all" ||
      (readFilter === "unread" ? !n.read : n.read);
    return matchType && matchRead;
  });

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #3B8ED0 0%, #1D4ED8 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Conteúdo</p>
          <h2 className="text-2xl font-bold mt-1">Notificações</h2>
          <p className="text-white/70 text-sm mt-1">
            Central de alertas e comunicados para os pacientes
            {unreadCount > 0 && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                {unreadCount} não lida{unreadCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Bell size={120} strokeWidth={1} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Donut chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Por Tipo</h3>
          <p className="text-xs text-[#9CA3AF] mb-3">Distribuição por categoria</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={typeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {typeDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} notificações`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {typeDistribution.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Send notification card */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-4">Enviar Notificação</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Destinatário</label>
              <select className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] bg-[#F7F9FC] outline-none">
                <option>Todos os usuários</option>
                {MOCK_USERS.map((u) => (
                  <option key={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Tipo</label>
              <select className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] bg-[#F7F9FC] outline-none">
                {(Object.keys(typeConfig) as NotifType[]).map((t) => (
                  <option key={t} value={t}>{typeConfig[t].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Título</label>
              <input
                placeholder="Título da notificação..."
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] bg-[#F7F9FC] outline-none placeholder-[#9CA3AF]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Agendar para</label>
              <input
                type="datetime-local"
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] bg-[#F7F9FC] outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Mensagem</label>
              <textarea
                rows={3}
                placeholder="Texto da notificação..."
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] bg-[#F7F9FC] outline-none placeholder-[#9CA3AF] resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex items-center gap-1.5 bg-[#3B8ED0] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#2563EB] transition-colors">
              <Send size={13} />
              Enviar Agora
            </button>
            <button className="flex items-center gap-1.5 border border-[#E5E7EB] text-[#6B7280] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#F7F9FC] transition-colors">
              <Clock size={13} />
              Agendar
            </button>
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <h3 className="font-bold text-[#1A2332]">Histórico</h3>
          <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
            <Filter size={14} className="text-[#9CA3AF]" />
            {typeFilters.slice(0, 4).map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={
                  typeFilter === f.value
                    ? { backgroundColor: "#E3F0FB", color: "#3B8ED0" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {f.label}
              </button>
            ))}
            <div className="w-px h-4 bg-[#E5E7EB]" />
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setReadFilter(f)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={
                  readFilter === f
                    ? { backgroundColor: "#E8F5EE", color: "#4CAF82" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {{ all: "Todas", unread: "Não lidas", read: "Lidas" }[f]}
              </button>
            ))}
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#4CAF82] text-white hover:bg-[#388E63] transition-colors"
              >
                <CheckCheck size={12} /> Marcar todas
              </button>
            )}
          </div>
          <button className="flex items-center gap-1.5 bg-[#3B8ED0] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#2563EB] transition-colors">
            <Plus size={14} />
            Nova Notificação
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-[#F0F2F5]">
          {filtered.map((notif) => {
            const user = userMap[notif.userId];
            const cfg = typeConfig[notif.type];
            const Icon = cfg.icon;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${notif.read ? "hover:bg-[#F7F9FC]" : "bg-[#FAFBFF] hover:bg-[#F0F4FF]"}`}
              >
                {/* Type icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: cfg.color + "20" }}
                >
                  <Icon size={16} style={{ color: cfg.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-sm font-semibold ${notif.read ? "text-[#1A2332]" : "text-[#111827]"}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#3B8ED0] shrink-0" />
                    )}
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto"
                      style={{ backgroundColor: cfg.color + "15", color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mb-1.5">{notif.message}</p>
                  <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                    {user && (
                      <span className="flex items-center gap-1">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)", fontSize: 8 }}
                        >
                          {getInitials(user.name)}
                        </div>
                        {user.name}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} />
                      {formatDate(notif.date)} às {notif.time}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-[#E8F5EE] transition-colors"
                      title="Marcar como lida"
                    >
                      <CheckCheck size={14} className="text-[#4CAF82]" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    className="p-1.5 rounded-lg hover:bg-[#FEE2E2] transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={14} className="text-[#EF4444]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#9CA3AF]">
            <Bell size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhuma notificação encontrada</p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {notifications.length} notificações
        </div>
      </div>
    </div>
  );
}
