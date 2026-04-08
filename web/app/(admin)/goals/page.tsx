"use client";

import { useState } from "react";
import { Search, Target, Filter, CheckCircle2, Clock } from "lucide-react";
import { MOCK_GOALS, MOCK_USERS } from "@/lib/mock-data";
import type { GoalCategory } from "@/lib/mock-data";
import { goalCategoryIcon, formatDate, progressPercent, getInitials } from "@/lib/utils";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";

const CATEGORY_FILTERS: { value: GoalCategory | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "glucose", label: "🩸 Glicose" },
  { value: "weight", label: "⚖️ Peso" },
  { value: "exercise", label: "🏃 Exercício" },
  { value: "water", label: "💧 Água" },
  { value: "sleep", label: "😴 Sono" },
  { value: "steps", label: "👣 Passos" },
];

const CATEGORY_COLORS: Record<GoalCategory, string> = {
  glucose: "#4CAF82",
  weight: "#3B8ED0",
  exercise: "#F97316",
  water: "#14B8A6",
  sleep: "#8B5CF6",
  steps: "#EC4899",
};

const GOAL_DISTRIBUTION = [
  { name: "Concluída", value: 1, color: "#4CAF82" },
  { name: "Em andamento", value: 4, color: "#3B8ED0" },
  { name: "Atrasada", value: 1, color: "#EF4444" },
];

const stats = [
  { label: "Total de Metas", value: MOCK_GOALS.length, color: "#14B8A6", bg: "#CCFBF1" },
  { label: "Concluídas", value: MOCK_GOALS.filter((g) => g.completed).length, color: "#4CAF82", bg: "#E8F5EE" },
  { label: "Em Andamento", value: MOCK_GOALS.filter((g) => !g.completed).length, color: "#3B8ED0", bg: "#E3F0FB" },
  { label: "Concl. Global", value: "83%", color: "#F97316", bg: "#FFF0E5" },
];

export default function GoalsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<GoalCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed">("all");

  const filtered = MOCK_GOALS.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || g.category === catFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" ? g.completed : !g.completed);
    return matchSearch && matchCat && matchStatus;
  });

  const getUserName = (userId: string) =>
    MOCK_USERS.find((u) => u.id === userId)?.name ?? `Usuário ${userId}`;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Gestão de Saúde</p>
          <h2 className="text-2xl font-bold mt-1">Metas dos Usuários</h2>
          <p className="text-white/70 text-sm mt-1">Acompanhe o progresso e conquistas</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Target size={120} strokeWidth={1} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <Target size={22} style={{ color: s.color }} />
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
        {/* Status distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Status das Metas</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Distribuição por situação</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={GOAL_DISTRIBUTION} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {GOAL_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} metas`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {GOAL_DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span>{d.name}</span>
                <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress overview */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Progresso por Meta</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">% concluído de cada objetivo ativo</p>
          <div className="space-y-3">
            {MOCK_GOALS.map((goal) => {
              const pct = progressPercent(goal.current, goal.target);
              const color = CATEGORY_COLORS[goal.category];
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#1A2332] font-medium">
                      {goalCategoryIcon(goal.category)} {goal.title}
                    </span>
                    <span className="font-bold" style={{ color }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                    {goal.current} / {goal.target} {goal.unit} · prazo: {formatDate(goal.deadline)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Goals table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
              <Search size={15} className="text-[#9CA3AF] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar meta..."
                className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#9CA3AF]" />
              {(["all", "active", "completed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={
                    statusFilter === f
                      ? { backgroundColor: "#CCFBF1", color: "#14B8A6" }
                      : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                  }
                >
                  {{ all: "Todas", active: "Em andamento", completed: "Concluídas" }[f]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setCatFilter(f.value)}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={
                  catFilter === f.value
                    ? { backgroundColor: "#CCFBF1", color: "#14B8A6" }
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
                {["Meta", "Categoria", "Progresso", "Prazo", "Usuário", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {filtered.map((goal) => {
                const pct = progressPercent(goal.current, goal.target);
                const color = CATEGORY_COLORS[goal.category];
                const isOverdue = !goal.completed && new Date(goal.deadline) < new Date();
                return (
                  <tr key={goal.id} className="hover:bg-[#F7F9FC] transition-colors">
                    {/* Title */}
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#1A2332]">{goal.title}</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">{goal.description}</p>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: color + "20", color }}
                      >
                        {goalCategoryIcon(goal.category)} {goal.category}
                      </span>
                    </td>
                    {/* Progress */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: goal.completed ? "#4CAF82" : color }}
                          />
                        </div>
                        <span className="text-xs font-medium text-[#6B7280]">
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                    </td>
                    {/* Deadline */}
                    <td className="px-5 py-3.5">
                      <span className={`text-xs ${isOverdue ? "text-[#EF4444] font-semibold" : "text-[#6B7280]"}`}>
                        {formatDate(goal.deadline)}
                        {isOverdue && " ⚠️"}
                      </span>
                    </td>
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                        >
                          {getInitials(getUserName(goal.userId))}
                        </div>
                        <span className="text-xs text-[#6B7280]">{getUserName(goal.userId)}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {goal.completed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#10B981]">
                          <CheckCircle2 size={11} /> Concluída
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E3F0FB] text-[#3B8ED0]">
                          <Clock size={11} /> Em andamento
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
              <Target size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma meta encontrada</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {MOCK_GOALS.length} metas
        </div>
      </div>
    </div>
  );
}
