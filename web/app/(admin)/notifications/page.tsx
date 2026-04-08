"use client";

import { useState } from "react";
import { Search, Bell, Filter, CheckCircle2, Send, Plus } from "lucide-react";
import { MOCK_NOTIFICATIONS, MOCK_USERS } from "@/lib/mock-data";
import type { NotifType } from "@/lib/mock-data";
import { notifTypeIcon, notifTypeColor, formatDate, getInitials } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const TYPE_FILTERS: { value: NotifType | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "glucose", label: "🩸 Glicose" },
  { value: "meal", label: "🍽️ Refeição" },
  { value: "medication", label: "💊 Medicação" },
  { value: "appointment", label: "📅 Consulta" },
  { value: "tip", label: "💡 Dica" },
  { value: "goal", label: "🎯 Meta" },
];

const TYPE_DIST = [
  { name: "Glicose", value: 2, color: "#EF4444" },
  { name: "Refeição", value: 1, color: "#4CAF82" },
  { name: "Medicação", value: 1, color: "#8B5CF6" },
  { name: "Consulta", value: 1, color: "#3B8ED0" },
  { name: "Dica", value: 2, color: "#F97316" },
  { name: "Meta", value: 1, color: "#14B8A6" },
];

const WEEKLY_NOTIFS = [
  { day: "Seg", sent: 12, read: 9 },
  { day: "Ter", sent: 8, read: 7 },
  { day: "Qua", sent: 15, read: 11 },
  { day: "Qui", sent: 10, read: 8 },
  { day: "Sex", sent: 14, read: 12 },
  { day: "Sáb", sent: 6, read: 5 },
  { day: "Dom", sent: 9, read: 6 },
];

const stats = [
  { label: "Total Enviadas", value: MOCK_NOTIFICATIONS.length, color: "#3B8ED0", bg: "#E3F0FB" },
  { label: "Não Lidas", value: MOCK_NOTIFICATIONS.filter((n) => !n.read).length, color: "#EF4444", bg: "#FEE2E2" },
  { label: "Lidas", value: MOCK_NOTIFICATIONS.filter((n) => n.read).length, color: "#4CAF82", bg: "#E8F5EE" },
  { label: "Taxa de Leitura", value: "75%", color: "#F97316", bg: "#FFF0E5" },
];

export default function NotificationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotifType | "all">("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");

  const filtered = MOCK_NOTIFICATIONS.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || n.type === typeFilter;
    const matchRead =
      readFilter === "all" ||
      (readFilter === "read" ? n.read : !n.read);
    return matchSearch && matchType && matchRead;
  });

  const getUserName = (userId: string) =>
    MOCK_USERS.find((u) => u.id === userId)?.name ?? `Usuário ${userId}`;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #3B8ED0 0%, #2563EB 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Centro de Comunicação</p>
          <h2 className="text-2xl font-bold mt-1">Notificações</h2>
          <p className="text-white/70 text-sm mt-1">Gerencie alertas e comunicados enviados aos usuários</p>
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
              <Bell size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Type distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Por Tipo</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Distribuição por categoria</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={TYPE_DIST} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                {TYPE_DIST.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} notificações`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {TYPE_DIST.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly sent vs read */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Enviadas vs Lidas</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Últimos 7 dias</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEKLY_NOTIFS} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="sent" fill="#3B8ED0" radius={[6, 6, 0, 0]} name="Enviadas" />
              <Bar dataKey="read" fill="#4CAF82" radius={[6, 6, 0, 0]} name="Lidas" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            {[{ label: "Enviadas", color: "#3B8ED0" }, { label: "Lidas", color: "#4CAF82" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-3 h-2 rounded" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar notificações..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[#9CA3AF]" />
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setReadFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  readFilter === f
                    ? { backgroundColor: "#E3F0FB", color: "#3B8ED0" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {{ all: "Todas", unread: "Não lidas", read: "Lidas" }[f]}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 bg-[#3B8ED0] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#2A6FAD] transition-colors ml-auto">
            <Plus size={14} />
            Nova Notificação
          </button>
        </div>

        {/* Type filters */}
        <div className="flex gap-2 px-5 py-3 border-b border-[#F0F2F5] flex-wrap">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={
                typeFilter === f.value
                  ? { backgroundColor: "#E3F0FB", color: "#3B8ED0" }
                  : { backgroundColor: "#F7F9FC", color: "#6B7280" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                {["Notificação", "Tipo", "Destinatário", "Data / Hora", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {filtered.map((notif) => {
                const color = notifTypeColor(notif.type);
                const icon = notifTypeIcon(notif.type);
                return (
                  <tr
                    key={notif.id}
                    className="hover:bg-[#F7F9FC] transition-colors"
                    style={!notif.read ? { backgroundColor: "#F0F7FF" } : {}}
                  >
                    {/* Title + message */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 mt-0.5"
                          style={{ backgroundColor: color + "20" }}
                        >
                          {icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#1A2332] text-sm">{notif.title}</p>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-[#3B8ED0] shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[#6B7280] mt-0.5 max-w-xs">{notif.message}</p>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-5 py-3.5">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: color + "20", color }}
                      >
                        {notif.type}
                      </span>
                    </td>
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                        >
                          {getInitials(getUserName(notif.userId))}
                        </div>
                        <span className="text-xs text-[#6B7280]">{getUserName(notif.userId)}</span>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-3.5 text-xs text-[#6B7280]">
                      {formatDate(notif.date)} às {notif.time}
                    </td>
                    {/* Read status */}
                    <td className="px-5 py-3.5">
                      {notif.read ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#10B981]">
                          <CheckCircle2 size={11} /> Lida
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E3F0FB] text-[#3B8ED0]">
                          <Bell size={11} /> Não lida
                        </span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <button className="p-1.5 rounded-lg hover:bg-[#E3F0FB] text-[#3B8ED0] transition-colors">
                        <Send size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Bell size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma notificação encontrada</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {MOCK_NOTIFICATIONS.length} notificações
        </div>
      </div>
    </div>
  );
}
