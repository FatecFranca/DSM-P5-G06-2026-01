"use client";

import { useState } from "react";
import {
  Pill, Search, Filter, CheckCircle2, XCircle, Clock, Plus,
  TrendingUp, Users, AlertCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { MOCK_MEDICATIONS, MOCK_USERS, type MedType } from "@/lib/mock-data";
import { medTypeLabel, medTypeBg, medTypeColor, formatDate, getInitials } from "@/lib/utils";

const stats = [
  { label: "Total de Medicamentos", value: MOCK_MEDICATIONS.length, color: "#8B5CF6", bg: "#EDE9FE", icon: Pill },
  { label: "Tomados Hoje", value: MOCK_MEDICATIONS.filter((m) => m.taken).length, color: "#4CAF82", bg: "#E8F5EE", icon: CheckCircle2 },
  { label: "Pendentes", value: MOCK_MEDICATIONS.filter((m) => !m.taken).length, color: "#EF4444", bg: "#FEE2E2", icon: XCircle },
  { label: "Aderência Geral", value: "87%", color: "#F97316", bg: "#FFF0E5", icon: TrendingUp },
];

const typeFilters: { value: "all" | MedType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "oral", label: "Oral" },
  { value: "insulin", label: "Insulina" },
  { value: "supplement", label: "Suplemento" },
];

const adherenceData = MOCK_USERS.slice(0, 6).map((u) => ({
  name: u.name.split(" ")[0],
  adherence: u.medAdherence,
}));

export default function MedicationsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MedType>("all");
  const [takenFilter, setTakenFilter] = useState<"all" | "taken" | "pending">("all");

  const filtered = MOCK_MEDICATIONS.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.dosage.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || m.type === typeFilter;
    const matchTaken =
      takenFilter === "all" ||
      (takenFilter === "taken" ? m.taken : !m.taken);
    return matchSearch && matchType && matchTaken;
  });

  const userMap = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u]));

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Gestão</p>
          <h2 className="text-2xl font-bold mt-1">Medicamentos</h2>
          <p className="text-white/70 text-sm mt-1">Controle e aderência farmacológica dos pacientes</p>
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
        {/* Adherence chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Aderência por Paciente</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">% de doses tomadas no período</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={adherenceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v}%`, "Aderência"]} />
              <Bar dataKey="adherence" radius={[6, 6, 0, 0]} name="Aderência">
                {adherenceData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.adherence >= 85 ? "#4CAF82" : entry.adherence >= 70 ? "#F59E0B" : "#EF4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            {[{ label: "≥ 85% (Boa)", color: "#4CAF82" }, { label: "70–84% (Regular)", color: "#F59E0B" }, { label: "< 70% (Baixa)", color: "#EF4444" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-3 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Type breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-4">Por Tipo</h3>
          <div className="space-y-3">
            {(["oral", "insulin", "supplement"] as MedType[]).map((type) => {
              const count = MOCK_MEDICATIONS.filter((m) => m.type === type).length;
              const color = medTypeColor(type);
              const bg = medTypeBg(type);
              return (
                <div key={type} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: bg }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "20" }}>
                    <Pill size={18} style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A2332]">{medTypeLabel(type)}</p>
                    <p className="text-xs text-[#6B7280]">{count} medicamento{count !== 1 ? "s" : ""}</p>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Alert reminder */}
          <div className="mt-4 p-3 rounded-xl bg-[#FEF3C7] flex gap-2">
            <AlertCircle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E]">
              <strong>3 pacientes</strong> com aderência abaixo de 70%. Considere enviar um alerta.
            </p>
          </div>
        </div>
      </div>

      {/* Medications Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar medicamento..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[#9CA3AF]" />
            {typeFilters.map((f) => (
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
            <div className="w-px h-4 bg-[#E5E7EB]" />
            {(["all", "taken", "pending"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTakenFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  takenFilter === f
                    ? { backgroundColor: "#E8F5EE", color: "#4CAF82" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {{ all: "Todos", taken: "Tomados", pending: "Pendentes" }[f]}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 bg-[#8B5CF6] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#7C3AED] transition-colors ml-auto">
            <Plus size={14} />
            Novo Medicamento
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                {["Medicamento", "Paciente", "Tipo", "Dosagem", "Frequência", "Horários", "Status", "Última Dose"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {filtered.map((med) => {
                const user = userMap[med.userId];
                const typeColor = medTypeColor(med.type);
                const typeBg = medTypeBg(med.type);
                return (
                  <tr key={med.id} className="hover:bg-[#F7F9FC] transition-colors">
                    {/* Med name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: med.color + "20" }}
                        >
                          <Pill size={15} style={{ color: med.color }} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A2332]">{med.name}</p>
                          {med.notes && <p className="text-[10px] text-[#9CA3AF]">{med.notes}</p>}
                        </div>
                      </div>
                    </td>
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                        >
                          {user ? getInitials(user.name) : "?"}
                        </div>
                        <span className="text-xs text-[#6B7280]">{user?.name ?? "—"}</span>
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
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-[#1A2332]">{med.dosage}</span>
                    </td>
                    {/* Frequency */}
                    <td className="px-5 py-3.5 text-xs text-[#6B7280]">{med.frequency}</td>
                    {/* Times */}
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {med.times.map((t) => (
                          <span
                            key={t}
                            className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-[#F0F2F5] text-[#6B7280]"
                          >
                            <Clock size={9} />
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={
                          med.taken
                            ? { backgroundColor: "#D1FAE5", color: "#10B981" }
                            : { backgroundColor: "#FEE2E2", color: "#EF4444" }
                        }
                      >
                        {med.taken ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {med.taken ? "Tomado" : "Pendente"}
                      </span>
                    </td>
                    {/* Last taken */}
                    <td className="px-5 py-3.5 text-xs text-[#9CA3AF]">
                      {med.lastTaken ? med.lastTaken.split(" ")[1] : "—"}
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
        {MOCK_USERS.slice(0, 4).map((u) => {
          const adherenceColor = u.medAdherence >= 85 ? "#4CAF82" : u.medAdherence >= 70 ? "#F59E0B" : "#EF4444";
          const userMeds = MOCK_MEDICATIONS.filter((m) => m.userId === u.id);
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
                  <p className="text-xs text-[#9CA3AF]">{userMeds.length} medicamento{userMeds.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#9CA3AF]">Aderência</span>
                  <span className="font-bold" style={{ color: adherenceColor }}>{u.medAdherence}%</span>
                </div>
                <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${u.medAdherence}%`, backgroundColor: adherenceColor }} />
                </div>
              </div>
              {userMeds.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {userMeds.map((m) => (
                    <span
                      key={m.id}
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                      style={{ backgroundColor: m.color + "20", color: m.color }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
