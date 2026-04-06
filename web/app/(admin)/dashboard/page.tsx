"use client";

import {
  Users, Activity, Target, Lightbulb, TrendingUp, TrendingDown,
  ArrowUpRight, AlertCircle, CheckCircle2, Clock,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  MOCK_USERS, MOCK_GLUCOSE, MOCK_NOTIFICATIONS, MOCK_MEDICATIONS,
  GLUCOSE_TREND, GLUCOSE_DISTRIBUTION, DIABETES_TYPE_DISTRIBUTION, WEEKLY_MEALS_CALORIES,
} from "@/lib/mock-data";
import { glucoseStatusLabel, glucoseStatusColor, formatDate } from "@/lib/utils";

const kpis = [
  {
    label: "Total de Usuários",
    value: "8",
    sub: "+2 este mês",
    trend: "up",
    icon: Users,
    color: "#4CAF82",
    bg: "#E8F5EE",
  },
  {
    label: "Glicose Média",
    value: "118 mg/dL",
    sub: "Últimas 24h",
    trend: "down",
    icon: Activity,
    color: "#3B8ED0",
    bg: "#E3F0FB",
  },
  {
    label: "Metas Ativas",
    value: "5 / 6",
    sub: "83% em andamento",
    trend: "up",
    icon: Target,
    color: "#F97316",
    bg: "#FFF0E5",
  },
  {
    label: "Artigos Publicados",
    value: "6",
    sub: "2 em destaque",
    trend: "up",
    icon: Lightbulb,
    color: "#8B5CF6",
    bg: "#EDE9FE",
  },
];

const recentAlerts = [
  { id: "1", type: "danger", text: "João Santos: glicose 210 mg/dL (muito alta)", time: "há 2h" },
  { id: "2", type: "warning", text: "Carlos Silva: glicose 189 mg/dL após jantar", time: "há 6h" },
  { id: "3", type: "info", text: "Ana Costa: consulta agendada amanhã às 14h", time: "há 8h" },
  { id: "4", type: "success", text: "Maria Oliveira: meta de exercícios atingida!", time: "há 12h" },
  { id: "5", type: "warning", text: "Pedro Lima: inativo há 55 dias", time: "há 2d" },
];

const alertColors = {
  danger: { bg: "#FEE2E2", text: "#EF4444", icon: AlertCircle },
  warning: { bg: "#FEF3C7", text: "#F59E0B", icon: AlertCircle },
  info: { bg: "#E3F0FB", text: "#3B8ED0", icon: Clock },
  success: { bg: "#D1FAE5", text: "#10B981", icon: CheckCircle2 },
};

const recentReadings = MOCK_GLUCOSE.slice(0, 6);

const activeUsers = MOCK_USERS.filter((u) => u.status === "active");

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Welcome */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4CAF82 0%, #2E9E6B 50%, #1d7a52 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Bem-vindo ao painel</p>
          <h2 className="text-2xl font-bold mt-1">DiabetesCare Admin</h2>
          <p className="text-white/70 text-sm mt-1">06 de Abril de 2026 — Tudo sob controle ✓</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Activity size={120} strokeWidth={1} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: kpi.bg }}
              >
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
              <span
                className="flex items-center gap-0.5 text-xs font-medium"
                style={{ color: kpi.trend === "up" ? "#10B981" : "#EF4444" }}
              >
                {kpi.trend === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A2332]">{kpi.value}</p>
            <p className="text-[#6B7280] text-xs mt-0.5">{kpi.label}</p>
            <p className="text-[#9CA3AF] text-[11px] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Main row: Chart + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Glucose Trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1A2332]">Tendência de Glicose</h3>
              <p className="text-xs text-[#9CA3AF]">Média diária — últimos 7 dias (Carlos Silva)</p>
            </div>
            <span className="text-xs bg-[#E8F5EE] text-[#4CAF82] px-2.5 py-1 rounded-full font-medium">
              Média: 122 mg/dL
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={GLUCOSE_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="glGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF82" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4CAF82" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[60, 220]} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }}
                formatter={(v) => [`${v} mg/dL`]}
              />
              <Area type="monotone" dataKey="max" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Máxima" />
              <Area type="monotone" dataKey="avg" stroke="#4CAF82" strokeWidth={2} fill="url(#glGrad)" name="Média" />
              <Area type="monotone" dataKey="min" stroke="#3B8ED0" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Mínima" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 justify-center">
            {[{ label: "Máxima", color: "#F59E0B" }, { label: "Média", color: "#4CAF82" }, { label: "Mínima", color: "#3B8ED0" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1A2332]">Alertas Recentes</h3>
            <span className="text-xs text-[#4CAF82] font-medium cursor-pointer hover:underline">Ver todos</span>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => {
              const cfg = alertColors[alert.type as keyof typeof alertColors];
              const Icon = cfg.icon;
              return (
                <div key={alert.id} className="flex gap-2.5 p-3 rounded-xl" style={{ backgroundColor: cfg.bg }}>
                  <Icon size={15} style={{ color: cfg.text }} className="shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-[#1A2332] leading-relaxed">{alert.text}</p>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">{alert.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Second row: Distribution charts + recent readings */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Glucose Distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Distribuição Glicêmica</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Últimas 14 leituras</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={GLUCOSE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {GLUCOSE_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} leituras`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {GLUCOSE_DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span>{d.name}</span>
                <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Diabetes Types */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Tipos de Diabetes</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Distribuição de usuários</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={DIABETES_TYPE_DISTRIBUTION} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                {DIABETES_TYPE_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} usuários`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {DIABETES_TYPE_DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span>{d.name}</span>
                <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calorie trend */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Calorias Semanais</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Consumo diário — últimos 7 dias</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEKLY_MEALS_CALORIES} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v} kcal`]} />
              <Bar dataKey="calories" fill="#F97316" radius={[6, 6, 0, 0]} name="Calorias" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: Recent readings + Active users */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent glucose readings */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F5]">
            <h3 className="font-bold text-[#1A2332]">Últimas Leituras de Glicose</h3>
            <a href="/glucose" className="text-xs text-[#4CAF82] font-medium hover:underline flex items-center gap-1">
              Ver todas <ArrowUpRight size={13} />
            </a>
          </div>
          <div className="divide-y divide-[#F0F2F5]">
            {recentReadings.map((r) => {
              const color = glucoseStatusColor(r.status);
              const label = glucoseStatusLabel(r.status);
              return (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F9FC] transition-colors">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: color + "20" }}>
                    <Activity size={15} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1A2332] text-sm">{r.value} mg/dL</span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: color + "20", color }}
                      >
                        {label}
                      </span>
                    </div>
                    <p className="text-[#9CA3AF] text-xs truncate">
                      {formatDate(r.date)} às {r.time} {r.notes ? `· ${r.notes}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-[#6B7280]">User {r.userId}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active users */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F5]">
            <h3 className="font-bold text-[#1A2332]">Usuários Ativos</h3>
            <a href="/users" className="text-xs text-[#4CAF82] font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight size={13} />
            </a>
          </div>
          <div className="divide-y divide-[#F0F2F5]">
            {activeUsers.map((u) => {
              const hba1cColor = u.hba1c <= 7 ? "#4CAF82" : u.hba1c <= 8 ? "#F59E0B" : "#EF4444";
              return (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F9FC] transition-colors">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-xs"
                    style={{ background: `linear-gradient(135deg, #4CAF82, #2E9E6B)` }}
                  >
                    {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#1A2332] truncate">{u.name}</p>
                    <p className="text-xs text-[#9CA3AF] truncate">{u.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: hba1cColor }}>
                      HbA1c {u.hba1c}%
                    </p>
                    <p className="text-[10px] text-[#9CA3AF]">{u.avgGlucose} mg/dL avg</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
