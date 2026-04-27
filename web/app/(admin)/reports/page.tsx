"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  BarChart2, TrendingUp, TrendingDown, Users, Activity, Target,
  Pill, Moon, Dumbbell, Utensils, RefreshCw,
} from "lucide-react";
import {
  webListarUsuarios, webListarTodasGlicose, webListarSono,
  webListarTodosExercicios, webListarMetas, webListarTodasRefeicoes,
  ApiUsuario, ApiGlicose, ApiSono, ApiExercicio, ApiMeta, ApiRefeicao,
} from "@/lib/api";
import { formatDate } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function isoToDate(s: string) {
  return new Date(s + "T12:00:00");
}

function last7Dates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function nDaysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${MONTH_LABELS_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
}

function avg(arr: number[]) {
  return arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AllData {
  usuarios: ApiUsuario[];
  glicose: ApiGlicose[];
  sono: ApiSono[];
  exercicios: ApiExercicio[];
  metas: ApiMeta[];
  refeicoes: ApiRefeicao[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#F0F2F5] rounded-xl animate-pulse ${className ?? ""}`} />;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon, iconBg, iconColor, label, value, sub, trend,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  label: string; value: string; sub: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#9CA3AF" }}>
            {trend === "up" ? <TrendingUp size={13} /> : trend === "down" ? <TrendingDown size={13} /> : null}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#1A2332]">{value}</p>
      <p className="text-[#6B7280] text-xs mt-0.5">{label}</p>
      <p className="text-[#9CA3AF] text-[11px] mt-0.5">{sub}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [data, setData] = useState<AllData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      const [u, g, s, e, m, r] = await Promise.all([
        webListarUsuarios(1, 500),
        webListarTodasGlicose(1, 500),
        webListarSono(1, 500),
        webListarTodosExercicios(1, 500),
        webListarMetas(1, 500),
        webListarTodasRefeicoes(1, 500),
      ]);
      setData({
        usuarios:   u.dados,
        glicose:    g.dados,
        sono:       s.dados,
        exercicios: e.dados,
        metas:      m.dados,
        refeicoes:  r.dados,
      });
    } catch {
      setError("Não foi possível carregar os dados de relatório.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  // ─── Derived statistics ─────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (!data) return null;
    const { usuarios, glicose, sono, exercicios, metas, refeicoes } = data;
    const cutoff30 = nDaysAgo(30);
    const cutoff7  = nDaysAgo(7);

    // Users KPI
    const totalUsers = usuarios.length;
    const activeUsers = usuarios.filter(u => u.status === "ATIVO").length;

    // User growth (by month, last 7 months)
    const monthGroups: Record<string, number> = {};
    usuarios.forEach(u => {
      const k = monthKey(u.criadoEm.slice(0, 10));
      monthGroups[k] = (monthGroups[k] ?? 0) + 1;
    });
    const monthEntries = Object.entries(monthGroups).slice(-7);
    const userGrowth = (() => {
      let acc = 0;
      return monthEntries.map(([month, count]) => { acc += count; return { month, users: acc }; });
    })();
    const growthPct = userGrowth.length >= 2
      ? Math.round(((userGrowth[userGrowth.length - 1].users - userGrowth[0].users) / Math.max(userGrowth[0].users, 1)) * 100)
      : 0;

    // Glucose KPIs
    const allGlicoseVals = glicose.map(g => g.valor);
    const avgGlicose = Math.round(avg(allGlicoseVals));
    const glicoseDist = [
      { name: "Normal",    value: glicose.filter(g => g.status === "NORMAL").length,    color: "#4CAF82" },
      { name: "Alto",      value: glicose.filter(g => g.status === "ALTO").length,      color: "#F59E0B" },
      { name: "Muito Alto",value: glicose.filter(g => g.status === "MUITO_ALTO").length,color: "#EF4444" },
      { name: "Baixo",     value: glicose.filter(g => g.status === "BAIXO").length,     color: "#3B8ED0" },
    ];
    const normalPct = glicose.length > 0 ? Math.round((glicoseDist[0].value / glicose.length) * 100) : 0;

    // Glucose trend (last 7 days)
    const last7 = last7Dates();
    const glicoseTrend = last7.map(date => {
      const dayReadings = glicose.filter(g => g.data === date);
      const dayAvg = dayReadings.length > 0 ? Math.round(avg(dayReadings.map(g => g.valor))) : null;
      const dayMax = dayReadings.length > 0 ? Math.max(...dayReadings.map(g => g.valor)) : null;
      return { date: date.slice(5).replace("-", "/"), avg: dayAvg, max: dayMax };
    }).filter(d => d.avg !== null);

    // Sleep
    const avgSono = Math.round(avg(sono.map(s => s.duracao)) * 10) / 10;
    const sonoBoa = sono.filter(s => s.qualidade === "BOA" || s.qualidade === "EXCELENTE").length;
    const sonoPct = sono.length > 0 ? Math.round((sonoBoa / sono.length) * 100) : 0;
    const sonoQualDist = [
      { name: "Excelente", value: sono.filter(s => s.qualidade === "EXCELENTE").length, color: "#4CAF82" },
      { name: "Boa",       value: sono.filter(s => s.qualidade === "BOA").length,       color: "#3B8ED0" },
      { name: "Ruim",      value: sono.filter(s => s.qualidade === "RUIM").length,      color: "#F59E0B" },
      { name: "Péssima",   value: sono.filter(s => s.qualidade === "PESSIMA").length,   color: "#EF4444" },
    ];

    // Exercise
    const totalExMin = exercicios.reduce((s, e) => s + e.duracao, 0);
    const totalExCal = exercicios.reduce((s, e) => s + (e.calorias ?? 0), 0);
    const recentEx = exercicios.filter(e => e.data >= cutoff7);
    const exIntensityDist = [
      { name: "Leve",     value: exercicios.filter(e => e.intensidade === "LEVE").length,     color: "#4CAF82" },
      { name: "Moderada", value: exercicios.filter(e => e.intensidade === "MODERADA").length, color: "#F59E0B" },
      { name: "Intensa",  value: exercicios.filter(e => e.intensidade === "INTENSA").length,  color: "#EF4444" },
    ];

    // Goals
    const metasConcluidas = metas.filter(m => m.concluida).length;
    const metasPct = metas.length > 0 ? Math.round((metasConcluidas / metas.length) * 100) : 0;

    // Weekly platform activity (last 7 days)
    const weeklyActivity = last7.map(date => {
      const dayLabel = DAY_LABELS_PT[new Date(date + "T12:00:00").getDay()];
      return {
        day: dayLabel,
        glicose:   glicose.filter(g => g.data === date).length,
        refeicoes: refeicoes.filter(r => r.data === date).length,
        sono:      sono.filter(s => s.data === date).length,
        exercicios:exercicios.filter(e => e.data === date).length,
      };
    });

    // Caloric intake per day (last 7 days)
    const weeklyCalories = last7.map(date => {
      const dayLabel = DAY_LABELS_PT[new Date(date + "T12:00:00").getDay()];
      const dayRefeicoes = refeicoes.filter(r => r.data === date);
      const totalCal = dayRefeicoes.reduce((s, r) => s + r.totalCalorias, 0);
      return { day: dayLabel, calories: Math.round(totalCal / Math.max(totalUsers, 1)) };
    });

    return {
      totalUsers, activeUsers, userGrowth, growthPct,
      avgGlicose, glicoseDist, normalPct, glicoseTrend,
      avgSono, sonoPct, sonoQualDist,
      totalExMin, totalExCal, recentEx, exIntensityDist,
      metasConcluidas, metas: metas.length, metasPct,
      weeklyActivity, weeklyCalories,
    };
  }, [data]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A2332 0%, #2D3748 100%)" }}
      >
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm">Sistema</p>
            <h2 className="text-2xl font-bold mt-1">Relatórios & Analytics</h2>
            <p className="text-white/60 text-sm mt-1">Visão consolidada de toda a plataforma</p>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors border border-white/20 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {loading ? "Carregando..." : "Atualizar"}
          </button>
        </div>
        <div className="absolute right-6 bottom-0 opacity-5">
          <BarChart2 size={160} strokeWidth={1} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px]" />)
        ) : stats ? (
          <>
            <KpiCard
              icon={<Users size={20} color="#4CAF82" />} iconBg="#E8F5EE" iconColor="#4CAF82"
              label="Usuários cadastrados" value={String(stats.totalUsers)}
              sub={`${stats.activeUsers} ativos`} trend="up"
            />
            <KpiCard
              icon={<Activity size={20} color="#3B8ED0" />} iconBg="#E3F0FB" iconColor="#3B8ED0"
              label="Glicose média" value={stats.avgGlicose > 0 ? `${stats.avgGlicose} mg/dL` : "—"}
              sub={`${stats.normalPct}% no alvo`} trend={stats.normalPct >= 70 ? "up" : "down"}
            />
            <KpiCard
              icon={<Target size={20} color="#F97316" />} iconBg="#FFF0E5" iconColor="#F97316"
              label="Metas concluídas" value={`${stats.metasPct}%`}
              sub={`${stats.metasConcluidas} de ${stats.metas}`} trend={stats.metasPct >= 50 ? "up" : "neutral"}
            />
            <KpiCard
              icon={<Moon size={20} color="#8B5CF6" />} iconBg="#EDE9FE" iconColor="#8B5CF6"
              label="Sono médio" value={stats.avgSono > 0 ? `${stats.avgSono}h` : "—"}
              sub={`${stats.sonoPct}% boa/excelente`} trend={stats.avgSono >= 7 ? "up" : "down"}
            />
          </>
        ) : null}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Platform activity */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-[#1A2332]">Atividade da Plataforma</h3>
            <p className="text-xs text-[#9CA3AF]">Registros por tipo — últimos 7 dias</p>
          </div>
          {loading ? (
            <Skeleton className="h-[220px]" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats?.weeklyActivity ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
                <Bar dataKey="glicose"    name="Glicose"    fill="#3B8ED0" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="refeicoes"  name="Refeições"  fill="#4CAF82" radius={[0,0,0,0]} stackId="a" />
                <Bar dataKey="exercicios" name="Exercícios" fill="#8B5CF6" radius={[0,0,0,0]} stackId="a" />
                <Bar dataKey="sono"       name="Sono"       fill="#F97316" radius={[3,3,0,0]} stackId="a" />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* User growth */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1A2332]">Crescimento de Usuários</h3>
              <p className="text-xs text-[#9CA3AF]">Acumulado por mês</p>
            </div>
            {stats && stats.growthPct !== 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-[#4CAF82]">
                <TrendingUp size={12} /> +{stats.growthPct}%
              </span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-[220px]" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats?.userGrowth ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF82" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4CAF82" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} usuários`]} />
                <Area type="monotone" dataKey="users" stroke="#4CAF82" strokeWidth={2} fill="url(#usersGrad)" name="Usuários" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Glucose trend */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Tendência Glicêmica</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Média e máxima diária — últimos 7 dias</p>
          {loading ? (
            <Skeleton className="h-[150px]" />
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={stats?.glicoseTrend ?? []} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[60, "auto"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} mg/dL`]} />
                <Line type="monotone" dataKey="avg" stroke="#4CAF82" strokeWidth={2} dot={false} name="Média" />
                <Line type="monotone" dataKey="max" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Máxima" />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Glucose distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Dist. Glicêmica</h3>
          <p className="text-xs text-[#9CA3AF] mb-3">Status das leituras</p>
          {loading ? <Skeleton className="h-[140px]" /> : (
            <>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={stats?.glicoseDist ?? []} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={2} dataKey="value">
                    {(stats?.glicoseDist ?? []).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} leituras`]} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {(stats?.glicoseDist ?? []).map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="flex-1">{d.name}</span>
                    <span className="font-semibold text-[#1A2332]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sleep quality */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Qualidade do Sono</h3>
          <p className="text-xs text-[#9CA3AF] mb-3">Distribuição de registros</p>
          {loading ? <Skeleton className="h-[140px]" /> : (
            <>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={stats?.sonoQualDist ?? []} cx="50%" cy="50%" innerRadius={28} outerRadius={45} paddingAngle={2} dataKey="value">
                    {(stats?.sonoQualDist ?? []).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} noites`]} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {(stats?.sonoQualDist ?? []).map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="flex-1">{d.name}</span>
                    <span className="font-semibold text-[#1A2332]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Exercise + Calorie row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* Exercise intensity */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
              <Dumbbell size={18} color="#8B5CF6" />
            </div>
            <div>
              <h3 className="font-bold text-[#1A2332]">Exercícios</h3>
              <p className="text-xs text-[#9CA3AF]">Resumo de atividades físicas</p>
            </div>
          </div>
          {loading ? <Skeleton className="h-[160px]" /> : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total", value: stats ? (stats.totalExMin >= 60 ? `${Math.floor(stats.totalExMin / 60)}h ${stats.totalExMin % 60}m` : `${stats.totalExMin}min`) : "—", color: "#8B5CF6" },
                  { label: "Calorias", value: stats?.totalExCal ? `${stats.totalExCal.toLocaleString("pt-BR")} kcal` : "—", color: "#F97316" },
                  { label: "Sessões", value: String(data?.exercicios.length ?? 0), color: "#4CAF82" },
                ].map(k => (
                  <div key={k.label} className="text-center p-3 bg-[#F7F9FC] rounded-xl">
                    <p className="text-lg font-bold" style={{ color: k.color }}>{k.value}</p>
                    <p className="text-xs text-[#9CA3AF]">{k.label}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280] mb-2">Distribuição por intensidade</p>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={stats?.exIntensityDist ?? []} layout="vertical" margin={{ left: 0, right: 8 }}>
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip formatter={(v) => [`${v} sessões`]} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {(stats?.exIntensityDist ?? []).map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Weekly calorie intake */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0E5] flex items-center justify-center">
                <Utensils size={18} color="#F97316" />
              </div>
              <div>
                <h3 className="font-bold text-[#1A2332]">Consumo Calórico</h3>
                <p className="text-xs text-[#9CA3AF]">Média por usuário — últimos 7 dias</p>
              </div>
            </div>
            <span className="text-xs text-[#9CA3AF]">Meta: 1.600–2.000 kcal</span>
          </div>
          {loading ? <Skeleton className="h-[160px]" /> : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats?.weeklyCalories ?? []} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} kcal`]} />
                <Bar dataKey="calories" radius={[6, 6, 0, 0]} name="Calorias">
                  {(stats?.weeklyCalories ?? []).map((entry, i) => (
                    <Cell key={i} fill={entry.calories > 2000 ? "#EF4444" : entry.calories > 1600 ? "#4CAF82" : "#9CA3AF"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Goals breakdown */}
      {!loading && stats && stats.metas > 0 && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0E5] flex items-center justify-center">
              <Target size={18} color="#F97316" />
            </div>
            <div>
              <h3 className="font-bold text-[#1A2332]">Metas por Categoria</h3>
              <p className="text-xs text-[#9CA3AF]">{stats.metasConcluidas} de {stats.metas} concluídas ({stats.metasPct}%)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {(["GLICOSE", "PESO", "EXERCICIO", "AGUA", "SONO", "PASSOS"] as const).map(cat => {
              const catMetas = data!.metas.filter(m => m.categoria === cat);
              const concluidas = catMetas.filter(m => m.concluida).length;
              const catLabels: Record<string, string> = {
                GLICOSE: "Glicose", PESO: "Peso", EXERCICIO: "Exercício",
                AGUA: "Água", SONO: "Sono", PASSOS: "Passos",
              };
              const catColors: Record<string, string> = {
                GLICOSE: "#EF4444", PESO: "#3B8ED0", EXERCICIO: "#8B5CF6",
                AGUA: "#14B8A6", SONO: "#6366F1", PASSOS: "#F97316",
              };
              const pct = catMetas.length > 0 ? Math.round((concluidas / catMetas.length) * 100) : 0;
              return (
                <div key={cat} className="text-center p-3 bg-[#F7F9FC] rounded-xl">
                  <p className="text-xl font-bold" style={{ color: catColors[cat] }}>{pct}%</p>
                  <p className="text-xs font-semibold text-[#1A2332] mt-0.5">{catLabels[cat]}</p>
                  <p className="text-xs text-[#9CA3AF]">{catMetas.length} metas</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom padding */}
      <div className="h-4" />
    </div>
  );
}
