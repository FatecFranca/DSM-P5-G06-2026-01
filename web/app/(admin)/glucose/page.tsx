"use client";

import { useState } from "react";
import { Activity, TrendingUp, TrendingDown, Search, Plus } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { MOCK_GLUCOSE, GLUCOSE_TREND } from "@/lib/mock-data";
import {
  glucoseStatusLabel, glucoseStatusColor, glucoseStatusBg,
  contextLabel, formatDate,
} from "@/lib/utils";

const statCards = [
  { label: "Média Geral", value: "122 mg/dL", sub: "Todas as leituras", color: "#4CAF82", bg: "#E8F5EE", icon: Activity },
  { label: "No Alvo", value: "57%", sub: "8 de 14 leituras", color: "#10B981", bg: "#D1FAE5", icon: TrendingUp },
  { label: "Acima do Alvo", value: "36%", sub: "5 leituras altas", color: "#F59E0B", bg: "#FEF3C7", icon: TrendingUp },
  { label: "Abaixo do Alvo", value: "7%", sub: "1 hipoglicemia", color: "#3B8ED0", bg: "#E3F0FB", icon: TrendingDown },
];

type FilterKey = "all" | "normal" | "high" | "very_high" | "low";

export default function GlucosePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterKey>("all");

  const filtered = MOCK_GLUCOSE.filter((r) => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch =
      r.date.includes(search) ||
      r.value.toString().includes(search) ||
      contextLabel(r.context).toLowerCase().includes(search.toLowerCase()) ||
      (r.notes ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filterOptions: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "normal", label: "Normal" },
    { key: "high", label: "Alto" },
    { key: "very_high", label: "Muito Alto" },
    { key: "low", label: "Baixo" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
              <p className="text-[10px] text-[#9CA3AF]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#1A2332]">Evolução Glicêmica</h3>
            <p className="text-xs text-[#9CA3AF]">Últimos 7 dias — mín/média/máx</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[#4CAF82]" />Média</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[#F59E0B]" />Máx</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[#3B8ED0]" />Mín</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={GLUCOSE_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="avgGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF82" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#4CAF82" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[50, 230]} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} mg/dL`]} />
            <ReferenceLine y={70} stroke="#3B8ED0" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Mín 70", position: "right", fontSize: 10, fill: "#3B8ED0" }} />
            <ReferenceLine y={140} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Máx 140", position: "right", fontSize: 10, fill: "#F59E0B" }} />
            <Area type="monotone" dataKey="max" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Máxima" />
            <Area type="monotone" dataKey="avg" stroke="#4CAF82" strokeWidth={2.5} fill="url(#avgGrad2)" name="Média" />
            <Area type="monotone" dataKey="min" stroke="#3B8ED0" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Mínima" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por data, valor, contexto..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  statusFilter === key
                    ? { backgroundColor: "#E8F5EE", color: "#4CAF82" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 bg-[#4CAF82] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#388E63] transition-colors ml-auto shrink-0">
            <Plus size={14} />
            Nova Leitura
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                {["Usuário", "Data / Hora", "Valor", "Contexto", "Status", "Observações"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {filtered.map((r) => {
                const color = glucoseStatusColor(r.status);
                const bg = glucoseStatusBg(r.status);
                const label = glucoseStatusLabel(r.status);
                return (
                  <tr key={r.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4CAF82] to-[#2E9E6B] flex items-center justify-center text-white text-[10px] font-bold">
                        U{r.userId}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#6B7280] text-xs whitespace-nowrap">
                      {formatDate(r.date)} <span className="text-[#9CA3AF]">·</span> {r.time}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1A2332]">{r.value}</span>
                        <span className="text-xs text-[#9CA3AF]">mg/dL</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B7280]">{contextLabel(r.context)}</td>
                    <td className="px-5 py-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: bg, color }}
                      >
                        {label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B7280] max-w-[180px] truncate">
                      {r.notes ?? <span className="text-[#D1D5DB]">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Activity size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma leitura encontrada</p>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {MOCK_GLUCOSE.length} leituras
        </div>
      </div>
    </div>
  );
}
