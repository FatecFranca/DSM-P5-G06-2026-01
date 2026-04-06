"use client";

import { useState } from "react";
import { UtensilsCrossed, Flame, Wheat, Search, Plus } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { MOCK_MEALS, WEEKLY_MEALS_CALORIES } from "@/lib/mock-data";
import { mealTypeLabel, mealTypeIcon, mealTypeColor, formatDate } from "@/lib/utils";
import type { MealType } from "@/lib/mock-data";

const stats = [
  { label: "Média Calórica", value: "1.676 kcal", sub: "Últimos 7 dias", color: "#F97316", bg: "#FFF0E5", icon: Flame },
  { label: "Carboidratos Médios", value: "172g", sub: "Meta: 200g/dia", color: "#4CAF82", bg: "#E8F5EE", icon: Wheat },
  { label: "Refeições Registradas", value: "5", sub: "Últimos 3 dias", color: "#3B8ED0", bg: "#E3F0FB", icon: UtensilsCrossed },
  { label: "Dias com Registro", value: "2 / 7", sub: "Esta semana", color: "#8B5CF6", bg: "#EDE9FE", icon: UtensilsCrossed },
];

const mealTypes: { key: MealType | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "breakfast", label: "Café da manhã" },
  { key: "lunch", label: "Almoço" },
  { key: "dinner", label: "Jantar" },
  { key: "snack", label: "Lanche" },
];

const barColors = ["#4CAF82", "#3B8ED0", "#F97316", "#EC4899", "#8B5CF6", "#14B8A6", "#F59E0B"];

export default function MealsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MealType | "all">("all");

  const filtered = MOCK_MEALS.filter((m) => {
    const matchType = typeFilter === "all" || m.type === typeFilter;
    const matchSearch =
      m.date.includes(search) ||
      mealTypeLabel(m.type).toLowerCase().includes(search.toLowerCase()) ||
      m.foods.some((f) => f.name.toLowerCase().includes(search.toLowerCase())) ||
      (m.notes ?? "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
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
              <p className="text-lg font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
              <p className="text-[10px] text-[#9CA3AF]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Calorie bar chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Calorias por Dia</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Últimos 7 dias</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={WEEKLY_MEALS_CALORIES} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v} kcal`]} />
              <Bar dataKey="calories" radius={[6, 6, 0, 0]} name="Calorias">
                {WEEKLY_MEALS_CALORIES.map((_, i) => (
                  <Cell key={i} fill={barColors[i % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Macro breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Macronutrientes Hoje</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Total · 06/04/2026</p>
          <div className="space-y-4 mt-6">
            {[
              { label: "Carboidratos", current: 129, goal: 200, color: "#F97316", unit: "g" },
              { label: "Proteínas", current: 49, goal: 100, color: "#4CAF82", unit: "g" },
              { label: "Gorduras", current: 31, goal: 60, color: "#3B8ED0", unit: "g" },
              { label: "Calorias", current: 1076, goal: 1800, color: "#8B5CF6", unit: "kcal" },
            ].map((m) => {
              const pct = Math.min(100, Math.round((m.current / m.goal) * 100));
              return (
                <div key={m.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#1A2332]">{m.label}</span>
                    <span className="text-xs text-[#6B7280]">
                      {m.current}
                      <span className="text-[#9CA3AF]"> / {m.goal}{m.unit}</span>
                    </span>
                  </div>
                  <div className="h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: m.color }}
                    />
                  </div>
                  <p className="text-right text-[10px] text-[#9CA3AF] mt-0.5">{pct}%</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Meals list */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar refeição, alimento..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mealTypes.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  typeFilter === key
                    ? { backgroundColor: "#FFF0E5", color: "#F97316" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 bg-[#F97316] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#EA580C] transition-colors ml-auto shrink-0">
            <Plus size={14} />
            Nova Refeição
          </button>
        </div>

        <div className="divide-y divide-[#F0F2F5]">
          {filtered.map((meal) => {
            const typeColor = mealTypeColor(meal.type);
            return (
              <div key={meal.id} className="px-5 py-4 hover:bg-[#F7F9FC] transition-colors">
                <div className="flex items-start gap-4">
                  {/* Type badge */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: typeColor + "20" }}
                  >
                    {mealTypeIcon(meal.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#1A2332] text-sm">{mealTypeLabel(meal.type)}</span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: typeColor + "20", color: typeColor }}
                      >
                        {meal.time}
                      </span>
                      <span className="text-xs text-[#9CA3AF]">{formatDate(meal.date)}</span>
                    </div>

                    {/* Macros */}
                    <div className="flex gap-3 mt-2">
                      {[
                        { label: "kcal", value: meal.totalCalories, color: "#F97316" },
                        { label: "carbs", value: `${meal.totalCarbs}g`, color: "#4CAF82" },
                      ].map((m) => (
                        <div key={m.label} className="flex items-center gap-1 text-xs">
                          <span className="font-bold" style={{ color: m.color }}>{m.value}</span>
                          <span className="text-[#9CA3AF]">{m.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Foods */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {meal.foods.map((f) => (
                        <span
                          key={f.id}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-[#F7F9FC] border border-[#E5E7EB] text-[#6B7280]"
                        >
                          {f.name} <span className="text-[#9CA3AF]">· {f.portion}</span>
                        </span>
                      ))}
                    </div>

                    {meal.notes && (
                      <p className="text-xs text-[#9CA3AF] mt-1.5 italic">{meal.notes}</p>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-[#F97316]">{meal.totalCalories}</p>
                    <p className="text-[10px] text-[#9CA3AF]">kcal</p>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <UtensilsCrossed size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma refeição encontrada</p>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {MOCK_MEALS.length} refeições
        </div>
      </div>
    </div>
  );
}
