"use client";

import { useState } from "react";
import { Search, Pill, Filter, CheckCircle2, XCircle, Clock } from "lucide-react";
import { MOCK_MEDICATIONS, MOCK_USERS } from "@/lib/mock-data";
import type { MedType } from "@/lib/mock-data";
import { medTypeLabel, medTypeColor, medTypeBg, formatDate, getInitials } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const ADHERENCE_WEEKLY = [
  { day: "Seg", adherence: 88 },
  { day: "Ter", adherence: 75 },
  { day: "Qua", adherence: 92 },
  { day: "Qui", adherence: 80 },
  { day: "Sex", adherence: 87 },
  { day: "Sáb", adherence: 70 },
  { day: "Dom", adherence: 83 },
];

const TYPE_DISTRIBUTION = [
  { name: "Oral", value: 2, color: "#4CAF82" },
  { name: "Insulina", value: 1, color: "#8B5CF6" },
  { name: "Suplemento", value: 2, color: "#F97316" },
];

const FILTERS: { value: MedType | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "oral", label: "Oral" },
  { value: "insulin", label: "Insulina" },
  { value: "supplement", label: "Suplemento" },
];

const stats = [
  { label: "Total de Medicamentos", value: MOCK_MEDICATIONS.length, color: "#8B5CF6", bg: "#EDE9FE" },
  { label: "Tomados Hoje", value: 2, color: "#4CAF82", bg: "#E8F5EE" },
  { label: "Pendentes", value: 3, color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Aderência Média", value: "82%", color: "#3B8ED0", bg: "#E3F0FB" },
];

export default function MedicationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MedType | "all">("all");

  const filtered = MOCK_MEDICATIONS.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.dosage.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const getUserName = (userId: string) =>
    MOCK_USERS.find((u) => u.id === userId)?.name ?? `Usuário ${userId}`;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Gestão Clínica</p>
          <h2 className="text-2xl font-bold mt-1">Medicamentos</h2>
          <p className="text-white/70 text-sm mt-1">Monitore adesão e histórico de medicamentos</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Pill size={120} strokeWidth={1} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <Pill size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Type distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Por Tipo</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Distribuição por categoria</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={TYPE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {TYPE_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} medicamentos`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {TYPE_DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span>{d.name}</span>
                <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Adherence weekly */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Aderência Semanal</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">% de medicamentos tomados por dia — últimos 7 dias</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ADHERENCE_WEEKLY} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v}%`]} />
              <Bar dataKey="adherence" fill="#4CAF82" radius={[6, 6, 0, 0]} name="Aderência" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Medications table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou dosagem..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#9CA3AF]" />
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  typeFilter === f.value
                    ? { backgroundColor: "#EDE9FE", color: "#8B5CF6" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                {["Medicamento", "Tipo", "Dosagem", "Frequência", "Horários", "Usuário", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {filtered.map((med) => {
                const typeColor = medTypeColor(med.type);
                const typeBg = medTypeBg(med.type);
                return (
                  <tr key={med.id} className="hover:bg-[#F7F9FC] transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: med.color + "20" }}
                        >
                          <Pill size={16} style={{ color: med.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A2332]">{med.name}</p>
                          {med.notes && <p className="text-[10px] text-[#9CA3AF]">{med.notes}</p>}
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: typeBg, color: typeColor }}
                      >
                        {medTypeLabel(med.type)}
                      </span>
                    </td>
                    {/* Dosage */}
                    <td className="px-5 py-3.5 font-medium text-[#1A2332]">{med.dosage}</td>
                    {/* Frequency */}
                    <td className="px-5 py-3.5 text-xs text-[#6B7280]">{med.frequency}</td>
                    {/* Times */}
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {med.times.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-md font-medium">
                            <Clock size={9} className="inline mr-0.5" />{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                        >
                          {getInitials(getUserName(med.userId))}
                        </div>
                        <span className="text-xs text-[#6B7280]">{getUserName(med.userId)}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {med.taken ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#10B981]">
                          <CheckCircle2 size={11} /> Tomado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEE2E2] text-[#EF4444]">
                          <XCircle size={11} /> Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Pill size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum medicamento encontrado</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {MOCK_MEDICATIONS.length} medicamentos
        </div>
      </div>

      {/* User adherence cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_USERS.filter((u) => u.status === "active").slice(0, 4).map((u) => {
          const adherenceColor = u.medAdherence >= 85 ? "#4CAF82" : u.medAdherence >= 70 ? "#F59E0B" : "#EF4444";
          return (
            <div key={u.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                >
                  {getInitials(u.name)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#1A2332] text-sm truncate">{u.name}</p>
                  <p className="text-[10px] text-[#9CA3AF]">Última atividade: {formatDate(u.lastActivity)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">Aderência</span>
                  <span className="font-bold" style={{ color: adherenceColor }}>{u.medAdherence}%</span>
                </div>
                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${u.medAdherence}%`, backgroundColor: adherenceColor }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
