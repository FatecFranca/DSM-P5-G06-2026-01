"use client";

import { useState, useEffect, useCallback } from "react";
import { UtensilsCrossed, Flame, Wheat, Search, Trash2, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  webListarTodasRefeicoes, webDeletarRefeicao,
  TIPO_REFEICAO_LABEL, TIPO_REFEICAO_ICON, TIPO_REFEICAO_COLOR,
  type ApiRefeicao, type TipoRefeicaoApi,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";

const barColors = ["#4CAF82", "#3B8ED0", "#F97316", "#EC4899", "#8B5CF6", "#14B8A6", "#F59E0B"];

const mealTypes: { key: TipoRefeicaoApi | "all"; label: string }[] = [
  { key: "all",       label: "Todos" },
  { key: "CAFE_MANHA", label: "Café da manhã" },
  { key: "ALMOCO",    label: "Almoço" },
  { key: "JANTAR",    label: "Jantar" },
  { key: "LANCHE",    label: "Lanche" },
];

function buildWeeklyCalories(meals: ApiRefeicao[]) {
  const days: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days[key] = 0;
  }
  meals.forEach(m => {
    if (days[m.data] !== undefined) {
      days[m.data] += m.totalCalorias;
    }
  });
  return Object.entries(days).map(([date, calories]) => ({
    day: date.slice(5).replace("-", "/"),
    calories: Math.round(calories),
  }));
}

function buildTodayMacros(meals: ApiRefeicao[]) {
  const today = new Date().toISOString().split("T")[0];
  const todayMeals = meals.filter(m => m.data === today);
  return {
    carbs:    Math.round(todayMeals.reduce((s, m) => s + m.totalCarbs, 0)),
    proteinas: Math.round(todayMeals.reduce((s, m) => s + m.totalProteinas, 0)),
    gorduras:  Math.round(todayMeals.reduce((s, m) => s + m.totalGorduras, 0)),
    calorias:  Math.round(todayMeals.reduce((s, m) => s + m.totalCalorias, 0)),
    date:      today,
  };
}

export default function MealsPage() {
  const [meals, setMeals]           = useState<ApiRefeicao[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState<TipoRefeicaoApi | "all">("all");
  const [deleting, setDeleting]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await webListarTodasRefeicoes(1, 200);
      setMeals(result.dados);
    } catch {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta refeição?")) return;
    setDeleting(id);
    try {
      await webDeletarRefeicao(id);
      setMeals(prev => prev.filter(m => m.id !== id));
    } catch {
      alert("Erro ao remover refeição.");
    } finally {
      setDeleting(null);
    }
  };

  const filtered = meals.filter(m => {
    const matchType   = typeFilter === "all" || m.tipo === typeFilter;
    const matchSearch =
      m.data.includes(search) ||
      TIPO_REFEICAO_LABEL[m.tipo].toLowerCase().includes(search.toLowerCase()) ||
      (m.alimentos as any[]).some((f: any) => f.nome?.toLowerCase().includes(search.toLowerCase())) ||
      (m.notas ?? "").toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const weeklyData  = buildWeeklyCalories(meals);
  const todayMacros = buildTodayMacros(meals);
  const today       = new Date().toISOString().split("T")[0];
  const todayMeals  = meals.filter(m => m.data === today);

  const avgCalories = (() => {
    const last7days = weeklyData.filter(d => d.calories > 0);
    if (!last7days.length) return 0;
    return Math.round(last7days.reduce((s, d) => s + d.calories, 0) / last7days.length);
  })();

  const stats = [
    { label: "Média Calórica",        value: `${avgCalories} kcal`,   sub: "Últimos 7 dias",        color: "#F97316", bg: "#FFF0E5", icon: Flame },
    { label: "Carboidratos Hoje",     value: `${todayMacros.carbs}g`, sub: "Meta: 200g/dia",         color: "#4CAF82", bg: "#E8F5EE", icon: Wheat },
    { label: "Refeições Hoje",        value: String(todayMeals.length), sub: "Registradas hoje",    color: "#3B8ED0", bg: "#E3F0FB", icon: UtensilsCrossed },
    { label: "Total Registradas",     value: String(meals.length),    sub: "Todas as refeições",     color: "#8B5CF6", bg: "#EDE9FE", icon: UtensilsCrossed },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F97316]" />
      </div>
    );
  }

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
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v} kcal`]} />
              <Bar dataKey="calories" radius={[6, 6, 0, 0]} name="Calorias">
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={barColors[i % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Macro breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Macronutrientes Hoje</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">
            Total · {formatDate(todayMacros.date)}
          </p>
          <div className="space-y-4 mt-6">
            {[
              { label: "Carboidratos", current: todayMacros.carbs,    goal: 200,  color: "#F97316", unit: "g" },
              { label: "Proteínas",    current: todayMacros.proteinas, goal: 100,  color: "#4CAF82", unit: "g" },
              { label: "Gorduras",     current: todayMacros.gorduras,  goal: 60,   color: "#3B8ED0", unit: "g" },
              { label: "Calorias",     current: todayMacros.calorias,  goal: 1800, color: "#8B5CF6", unit: "kcal" },
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
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-[#6B7280] text-xs font-medium px-3 py-2 rounded-xl hover:bg-[#F7F9FC] transition-colors ml-auto shrink-0"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>

        <div className="divide-y divide-[#F0F2F5]">
          {filtered.map((meal) => {
            const typeColor = TIPO_REFEICAO_COLOR[meal.tipo];
            const alimentos = meal.alimentos as any[];
            return (
              <div key={meal.id} className="px-5 py-4 hover:bg-[#F7F9FC] transition-colors">
                <div className="flex items-start gap-4">
                  {/* Type badge */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: typeColor + "20" }}
                  >
                    {TIPO_REFEICAO_ICON[meal.tipo]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#1A2332] text-sm">
                        {TIPO_REFEICAO_LABEL[meal.tipo]}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: typeColor + "20", color: typeColor }}
                      >
                        {meal.hora}
                      </span>
                      <span className="text-xs text-[#9CA3AF]">{formatDate(meal.data)}</span>
                      {meal.usuario && (
                        <span className="text-[10px] text-[#9CA3AF] ml-1">
                          · {meal.usuario.nome}
                        </span>
                      )}
                    </div>

                    {/* Macros */}
                    <div className="flex gap-3 mt-2">
                      {[
                        { label: "kcal",     value: Math.round(meal.totalCalorias),  color: "#F97316" },
                        { label: "carbs",    value: `${Math.round(meal.totalCarbs)}g`,    color: "#4CAF82" },
                        { label: "prot.",    value: `${Math.round(meal.totalProteinas)}g`, color: "#3B8ED0" },
                        { label: "gord.",    value: `${Math.round(meal.totalGorduras)}g`,  color: "#8B5CF6" },
                      ].map((m) => (
                        <div key={m.label} className="flex items-center gap-1 text-xs">
                          <span className="font-bold" style={{ color: m.color }}>{m.value}</span>
                          <span className="text-[#9CA3AF]">{m.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Foods */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {alimentos.map((f: any, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-[#F7F9FC] border border-[#E5E7EB] text-[#6B7280]"
                        >
                          {f.nome} <span className="text-[#9CA3AF]">· {f.porcao}</span>
                        </span>
                      ))}
                    </div>

                    {meal.notas && (
                      <p className="text-xs text-[#9CA3AF] mt-1.5 italic">{meal.notas}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#F97316]">{Math.round(meal.totalCalorias)}</p>
                      <p className="text-[10px] text-[#9CA3AF]">kcal</p>
                    </div>
                    <button
                      onClick={() => handleDelete(meal.id)}
                      disabled={deleting === meal.id}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#9CA3AF] hover:text-red-500 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
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
          {filtered.length} de {meals.length} refeições
        </div>
      </div>
    </div>
  );
}
