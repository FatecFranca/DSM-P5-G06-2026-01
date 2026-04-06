"use client";

import { useState } from "react";
import { Search, UserPlus, Users, Activity, CheckCircle2, XCircle, Filter } from "lucide-react";
import { MOCK_USERS } from "@/lib/mock-data";
import { diabetesTypeLabel, diabetesTypeColor, formatDate, bmi, getInitials } from "@/lib/utils";

const stats = [
  { label: "Total", value: 8, color: "#4CAF82", bg: "#E8F5EE", icon: Users },
  { label: "Ativos", value: 6, color: "#10B981", bg: "#D1FAE5", icon: CheckCircle2 },
  { label: "Inativos", value: 2, color: "#EF4444", bg: "#FEE2E2", icon: XCircle },
  { label: "Avg HbA1c", value: "7.0%", color: "#3B8ED0", bg: "#E3F0FB", icon: Activity },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = MOCK_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" || (filter === "active" ? u.status === "active" : u.status === "inactive");
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#9CA3AF]" />
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  filter === f
                    ? { backgroundColor: "#E8F5EE", color: "#4CAF82" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {{ all: "Todos", active: "Ativos", inactive: "Inativos" }[f]}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 bg-[#4CAF82] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#388E63] transition-colors ml-auto">
            <UserPlus size={14} />
            Novo Usuário
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                {["Usuário", "Tipo", "HbA1c", "Glicose Média", "Ader. Med.", "Última Atividade", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {filtered.map((u) => {
                const typeColor = diabetesTypeColor(u.diabetesType);
                const hba1cColor = u.hba1c <= 7 ? "#4CAF82" : u.hba1c <= 8 ? "#F59E0B" : "#EF4444";
                const adherenceColor = u.medAdherence >= 85 ? "#4CAF82" : u.medAdherence >= 70 ? "#F59E0B" : "#EF4444";
                return (
                  <tr key={u.id} className="hover:bg-[#F7F9FC] transition-colors">
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                        >
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A2332]">{u.name}</p>
                          <p className="text-xs text-[#9CA3AF]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: typeColor + "20", color: typeColor }}
                      >
                        {diabetesTypeLabel(u.diabetesType)}
                      </span>
                    </td>
                    {/* HbA1c */}
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-sm" style={{ color: hba1cColor }}>
                        {u.hba1c}%
                      </span>
                    </td>
                    {/* Avg glucose */}
                    <td className="px-5 py-3.5">
                      <span className="text-[#1A2332] font-medium">{u.avgGlucose} mg/dL</span>
                    </td>
                    {/* Adherence */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${u.medAdherence}%`, backgroundColor: adherenceColor }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: adherenceColor }}>
                          {u.medAdherence}%
                        </span>
                      </div>
                    </td>
                    {/* Last activity */}
                    <td className="px-5 py-3.5 text-xs text-[#6B7280]">{formatDate(u.lastActivity)}</td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={
                          u.status === "active"
                            ? { backgroundColor: "#D1FAE5", color: "#10B981" }
                            : { backgroundColor: "#FEE2E2", color: "#EF4444" }
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: u.status === "active" ? "#10B981" : "#EF4444" }} />
                        {u.status === "active" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <button className="text-xs text-[#3B8ED0] font-medium hover:underline">Ver</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Users size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {MOCK_USERS.length} usuários
        </div>
      </div>

      {/* User detail cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_USERS.slice(0, 4).map((u) => (
          <div key={u.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
              >
                {getInitials(u.name)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#1A2332] text-sm truncate">{u.name}</p>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: diabetesTypeColor(u.diabetesType) + "20", color: diabetesTypeColor(u.diabetesType) }}
                >
                  {diabetesTypeLabel(u.diabetesType)}
                </span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                { label: "Idade", value: `${u.age} anos` },
                { label: "IMC", value: bmi(u.weight, u.height) },
                { label: "Médico", value: u.doctorName },
                { label: "Último Checkup", value: formatDate(u.lastCheckup) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[#9CA3AF]">{row.label}</span>
                  <span className="font-medium text-[#1A2332]">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
