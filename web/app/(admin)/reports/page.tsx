"use client";

import {
  BarChart2, Download, TrendingUp, TrendingDown, Users,
  Activity, Target, Pill, BookOpen, Lightbulb, Calendar,
  FileText, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  MOCK_USERS, MOCK_GLUCOSE, MOCK_MEDICATIONS, MOCK_GOALS,
  GLUCOSE_TREND, WEEKLY_MEALS_CALORIES, GLUCOSE_DISTRIBUTION,
  DIABETES_TYPE_DISTRIBUTION,
} from "@/lib/mock-data";
import { progressPercent } from "@/lib/utils";

const kpis = [
  {
    label: "Usuários Cadastrados",
    value: MOCK_USERS.length,
    sub: "+2 este mês",
    trend: "up",
    color: "#4CAF82",
    bg: "#E8F5EE",
    icon: Users,
  },
  {
    label: "HbA1c Médio",
    value: `${(MOCK_USERS.reduce((s, u) => s + u.hba1c, 0) / MOCK_USERS.length).toFixed(1)}%`,
    sub: "Meta: < 7.0%",
    trend: "up",
    color: "#3B8ED0",
    bg: "#E3F0FB",
    icon: Activity,
  },
  {
    label: "Aderência Média",
    value: `${Math.round(MOCK_USERS.reduce((s, u) => s + u.medAdherence, 0) / MOCK_USERS.length)}%`,
    sub: "Medicamentos",
    trend: "up",
    color: "#8B5CF6",
    bg: "#EDE9FE",
    icon: Pill,
  },
  {
    label: "Metas Concluídas",
    value: `${Math.round((MOCK_GOALS.filter((g) => g.completed).length / MOCK_GOALS.length) * 100)}%`,
    sub: `${MOCK_GOALS.filter((g) => g.completed).length} de ${MOCK_GOALS.length}`,
    trend: "up",
    color: "#F97316",
    bg: "#FFF0E5",
    icon: Target,
  },
];

const weeklyActivity = [
  { day: "Seg", glucose: 12, meals: 8, journal: 3 },
  { day: "Ter", glucose: 15, meals: 10, journal: 5 },
  { day: "Qua", glucose: 11, meals: 7, journal: 2 },
  { day: "Qui", glucose: 18, meals: 12, journal: 6 },
  { day: "Sex", glucose: 14, meals: 9, journal: 4 },
  { day: "Sáb", glucose: 9, meals: 6, journal: 3 },
  { day: "Dom", glucose: 7, meals: 5, journal: 2 },
];

const monthlyUsers = [
  { month: "Out/25", users: 3 },
  { month: "Nov/25", users: 4 },
  { month: "Dez/25", users: 4 },
  { month: "Jan/26", users: 5 },
  { month: "Fev/26", users: 6 },
  { month: "Mar/26", users: 7 },
  { month: "Abr/26", users: 8 },
];

const hba1cGroups = [
  { label: "< 7%", count: MOCK_USERS.filter((u) => u.hba1c < 7).length, color: "#4CAF82" },
  { label: "7–8%", count: MOCK_USERS.filter((u) => u.hba1c >= 7 && u.hba1c <= 8).length, color: "#F59E0B" },
  { label: "> 8%", count: MOCK_USERS.filter((u) => u.hba1c > 8).length, color: "#EF4444" },
];

const reportCards = [
  {
    title: "Relatório de Glicose",
    description: "Médias, picos e tendências glicêmicas de todos os pacientes.",
    icon: Activity,
    color: "#3B8ED0",
    bg: "#E3F0FB",
    count: `${MOCK_GLUCOSE.length} leituras`,
  },
  {
    title: "Relatório de Medicamentos",
    description: "Aderência farmacológica e histórico de doses.",
    icon: Pill,
    color: "#8B5CF6",
    bg: "#EDE9FE",
    count: `${MOCK_MEDICATIONS.length} medicamentos`,
  },
  {
    title: "Relatório de Metas",
    description: "Progresso e cumprimento das metas estabelecidas.",
    icon: Target,
    color: "#F97316",
    bg: "#FFF0E5",
    count: `${MOCK_GOALS.length} metas`,
  },
  {
    title: "Relatório do Diário",
    description: "Bem-estar emocional e registros diários.",
    icon: BookOpen,
    color: "#EC4899",
    bg: "#FCE7F3",
    count: "5 entradas",
  },
  {
    title: "Relatório Nutricional",
    description: "Análise de consumo calórico e macronutrientes.",
    icon: Lightbulb,
    color: "#14B8A6",
    bg: "#CCFBF1",
    count: "5 refeições",
  },
  {
    title: "Relatório Completo",
    description: "Consolidado de todos os dados do período selecionado.",
    icon: FileText,
    color: "#4CAF82",
    bg: "#E8F5EE",
    count: "Todos os dados",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A2332 0%, #2D3748 100%)" }}
      >
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">Sistema</p>
            <h2 className="text-2xl font-bold mt-1">Relatórios & Analytics</h2>
            <p className="text-white/70 text-sm mt-1">Visão consolidada de toda a plataforma</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors border border-white/20">
              <Calendar size={13} />
              Abr 2026
            </button>
            <button className="flex items-center gap-2 bg-[#4CAF82] hover:bg-[#388E63] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
              <Download size={13} />
              Exportar PDF
            </button>
          </div>
        </div>
        <div className="absolute right-6 bottom-0 opacity-5">
          <BarChart2 size={160} strokeWidth={1} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
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

      {/* Main charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Platform activity */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1A2332]">Atividade da Plataforma</h3>
              <p className="text-xs text-[#9CA3AF]">Registros por tipo — últimos 7 dias</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="glucose" name="Glicose" fill="#3B8ED0" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="meals" name="Refeições" fill="#4CAF82" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="journal" name="Diário" fill="#8B5CF6" radius={[4, 4, 0, 0]} stackId="a" />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User growth */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1A2332]">Crescimento de Usuários</h3>
              <p className="text-xs text-[#9CA3AF]">Últimos 7 meses</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-[#4CAF82]">
              <TrendingUp size={12} /> +167%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyUsers} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
        </div>
      </div>

      {/* Second row charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Glucose trend */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Tendência Glicêmica</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Média diária — últimos 7 dias</p>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={GLUCOSE_TREND} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[60, 220]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} mg/dL`]} />
              <Line type="monotone" dataKey="avg" stroke="#4CAF82" strokeWidth={2} dot={false} name="Média" />
              <Line type="monotone" dataKey="max" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Máxima" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Glucose distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Dist. Glicêmica</h3>
          <p className="text-xs text-[#9CA3AF] mb-3">Status das leituras</p>
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={GLUCOSE_DISTRIBUTION} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value">
                {GLUCOSE_DISTRIBUTION.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} leituras`]} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {GLUCOSE_DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="font-semibold text-[#1A2332]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HbA1c groups */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">HbA1c Grupos</h3>
          <p className="text-xs text-[#9CA3AF] mb-3">Controle glicêmico</p>
          <div className="space-y-3">
            {hba1cGroups.map((g) => (
              <div key={g.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#1A2332]">{g.label}</span>
                  <span className="font-bold" style={{ color: g.color }}>{g.count} pac.</span>
                </div>
                <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(g.count / MOCK_USERS.length) * 100}%`, backgroundColor: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-2.5 rounded-xl bg-[#E8F5EE]">
            <p className="text-xs text-[#166534] font-medium">
              {Math.round((MOCK_USERS.filter((u) => u.hba1c < 7).length / MOCK_USERS.length) * 100)}% dos pacientes com HbA1c controlada
            </p>
          </div>
        </div>
      </div>

      {/* Calorie chart */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#1A2332]">Consumo Calórico Semanal</h3>
            <p className="text-xs text-[#9CA3AF]">Média diária dos pacientes — últimos 7 dias</p>
          </div>
          <span className="text-xs text-[#9CA3AF]">Meta: 1.600–2.000 kcal/dia</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={WEEKLY_MEALS_CALORIES} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} kcal`]} />
            <Bar dataKey="calories" radius={[6, 6, 0, 0]} name="Calorias">
              {WEEKLY_MEALS_CALORIES.map((entry, i) => (
                <Cell key={i} fill={entry.calories > 2000 ? "#EF4444" : entry.calories > 1800 ? "#F59E0B" : "#4CAF82"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Report download cards */}
      <div>
        <h3 className="font-bold text-[#1A2332] mb-4">Gerar Relatórios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reportCards.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: card.bg }}>
                  <card.icon size={20} style={{ color: card.color }} />
                </div>
                <div>
                  <h4 className="font-bold text-[#1A2332] text-sm">{card.title}</h4>
                  <p className="text-xs text-[#9CA3AF]">{card.count}</p>
                </div>
              </div>
              <p className="text-xs text-[#6B7280] mb-4">{card.description}</p>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold border border-[#E5E7EB] rounded-xl py-2 hover:bg-[#F7F9FC] transition-colors text-[#6B7280]">
                  <ArrowUpRight size={13} />
                  Visualizar
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold rounded-xl py-2 text-white transition-colors"
                  style={{ backgroundColor: card.color }}
                >
                  <Download size={13} />
                  Exportar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
