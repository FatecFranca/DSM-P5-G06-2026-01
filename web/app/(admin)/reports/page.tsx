"use client";

import {
  BarChart2, Users, Activity, Pill, Target, TrendingUp, TrendingDown,
  Download, Calendar, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { MOCK_USERS, GLUCOSE_TREND, WEEKLY_MEALS_CALORIES } from "@/lib/mock-data";

const MONTHLY_USERS = [
  { month: "Out", users: 4 },
  { month: "Nov", users: 5 },
  { month: "Dez", users: 5 },
  { month: "Jan", users: 6 },
  { month: "Fev", users: 7 },
  { month: "Mar", users: 7 },
  { month: "Abr", users: 8 },
];

const GLUCOSE_MONTHLY = [
  { month: "Out", avg: 132, target: 120 },
  { month: "Nov", avg: 128, target: 120 },
  { month: "Dez", avg: 135, target: 120 },
  { month: "Jan", avg: 124, target: 120 },
  { month: "Fev", avg: 119, target: 120 },
  { month: "Mar", avg: 121, target: 120 },
  { month: "Abr", avg: 118, target: 120 },
];

const ADHERENCE_MONTHLY = [
  { month: "Out", adherence: 74 },
  { month: "Nov", adherence: 78 },
  { month: "Dez", adherence: 72 },
  { month: "Jan", adherence: 80 },
  { month: "Fev", adherence: 82 },
  { month: "Mar", adherence: 84 },
  { month: "Abr", adherence: 82 },
];

const HBAC1_DIST = [
  { range: "<6%", count: 1, color: "#4CAF82" },
  { range: "6–7%", count: 3, color: "#3B8ED0" },
  { range: "7–8%", count: 2, color: "#F59E0B" },
  { range: ">8%", count: 2, color: "#EF4444" },
];

const kpis = [
  { label: "Usuários Totais", value: "8", change: "+2", up: true, icon: Users, color: "#4CAF82", bg: "#E8F5EE" },
  { label: "Glicose Média", value: "118 mg/dL", change: "-14 mg/dL", up: true, icon: Activity, color: "#3B8ED0", bg: "#E3F0FB" },
  { label: "Aderência Média", value: "82%", change: "+8%", up: true, icon: Pill, color: "#8B5CF6", bg: "#EDE9FE" },
  { label: "Metas Cumpridas", value: "83%", change: "+3%", up: true, icon: Target, color: "#F97316", bg: "#FFF0E5" },
];

const REPORTS = [
  { title: "Relatório de Usuários", desc: "Cadastros, atividade e perfis clínicos", icon: Users, color: "#4CAF82" },
  { title: "Relatório Glicêmico", desc: "Leituras, tendências e distribuição de status", icon: Activity, color: "#3B8ED0" },
  { title: "Aderência Medicamentosa", desc: "Taxa de adesão por usuário e período", icon: Pill, color: "#8B5CF6" },
  { title: "Metas & Progresso", desc: "Status, conclusões e atrasos de metas", icon: Target, color: "#F97316" },
  { title: "Diário Alimentar", desc: "Calorias, macros e refeições registradas", icon: BarChart2, color: "#EC4899" },
  { title: "Bem-estar & Humor", desc: "Entradas de diário e distribuição de humor", icon: TrendingUp, color: "#14B8A6" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A2332 0%, #374151 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/60 text-sm font-medium">Análise de Dados</p>
          <h2 className="text-2xl font-bold mt-1">Relatórios do Sistema</h2>
          <p className="text-white/50 text-sm mt-1">Visão consolidada da plataforma — Abril 2026</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <BarChart2 size={120} strokeWidth={1} />
        </div>
      </div>

      {/* KPI overview */}
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
                className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={kpi.up ? { backgroundColor: "#D1FAE5", color: "#10B981" } : { backgroundColor: "#FEE2E2", color: "#EF4444" }}
              >
                {kpi.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {kpi.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A2332]">{kpi.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{kpi.label}</p>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5">vs. 6 meses atrás</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* User growth */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1A2332]">Crescimento de Usuários</h3>
              <p className="text-xs text-[#9CA3AF]">Cadastros acumulados — últimos 7 meses</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-[#4CAF82] font-medium hover:underline">
              <Download size={12} /> Exportar
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_USERS} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF82" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4CAF82" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#4CAF82" strokeWidth={2} fill="url(#userGrad)" name="Usuários" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Glucose monthly avg */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1A2332]">Glicose Média Mensal</h3>
              <p className="text-xs text-[#9CA3AF]">vs meta de 120 mg/dL</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-[#3B8ED0] font-medium hover:underline">
              <Download size={12} /> Exportar
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={GLUCOSE_MONTHLY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[100, 145]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} mg/dL`]} />
              <Line type="monotone" dataKey="avg" stroke="#3B8ED0" strokeWidth={2} dot={{ r: 4, fill: "#3B8ED0" }} name="Média" />
              <Line type="monotone" dataKey="target" stroke="#4CAF82" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Meta" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 justify-center">
            {[{ label: "Glicose Média", color: "#3B8ED0" }, { label: "Meta", color: "#4CAF82" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Adherence monthly */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Aderência Medicamentosa</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">% média mensal — últimos 7 meses</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ADHERENCE_MONTHLY} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v}%`]} />
              <Bar dataKey="adherence" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Aderência" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* HbA1c distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Distribuição HbA1c</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Usuários por faixa de controle</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={HBAC1_DIST} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="count">
                {HBAC1_DIST.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} usuários`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {HBAC1_DIST.map((d) => (
              <div key={d.range} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span>HbA1c {d.range}</span>
                <span className="ml-auto font-semibold text-[#1A2332]">{d.count} usuários</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User ranking table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F5]">
          <div>
            <h3 className="font-bold text-[#1A2332]">Ranking de Usuários por Controle</h3>
            <p className="text-xs text-[#9CA3AF]">Score baseado em HbA1c, aderência e atividade</p>
          </div>
          <button className="flex items-center gap-1 text-xs text-[#4CAF82] font-medium hover:underline">
            <Download size={12} /> CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                {["#", "Usuário", "HbA1c", "Glicose Média", "Aderência", "Score"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {[...MOCK_USERS]
                .sort((a, b) => (a.hba1c + (100 - a.medAdherence) / 10) - (b.hba1c + (100 - b.medAdherence) / 10))
                .map((u, idx) => {
                  const hba1cColor = u.hba1c <= 7 ? "#4CAF82" : u.hba1c <= 8 ? "#F59E0B" : "#EF4444";
                  const adhColor = u.medAdherence >= 85 ? "#4CAF82" : u.medAdherence >= 70 ? "#F59E0B" : "#EF4444";
                  const score = Math.round(100 - (u.hba1c - 5) * 8 - (100 - u.medAdherence) * 0.3);
                  const scoreColor = score >= 80 ? "#4CAF82" : score >= 65 ? "#F59E0B" : "#EF4444";
                  return (
                    <tr key={u.id} className="hover:bg-[#F7F9FC] transition-colors">
                      <td className="px-5 py-3">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={
                            idx === 0
                              ? { backgroundColor: "#FEF3C7", color: "#F59E0B" }
                              : idx === 1
                              ? { backgroundColor: "#F3F4F6", color: "#6B7280" }
                              : idx === 2
                              ? { backgroundColor: "#FFF0E5", color: "#F97316" }
                              : { backgroundColor: "#F7F9FC", color: "#9CA3AF" }
                          }
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                          >
                            {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1A2332] text-sm">{u.name}</p>
                            <p className="text-[10px] text-[#9CA3AF]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-bold" style={{ color: hba1cColor }}>{u.hba1c}%</td>
                      <td className="px-5 py-3 text-[#6B7280]">{u.avgGlucose} mg/dL</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${u.medAdherence}%`, backgroundColor: adhColor }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: adhColor }}>{u.medAdherence}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-bold text-lg" style={{ color: scoreColor }}>{score}</span>
                        <span className="text-xs text-[#9CA3AF]">/100</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export reports grid */}
      <div>
        <h3 className="font-bold text-[#1A2332] mb-3">Exportar Relatórios</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {REPORTS.map((r) => (
            <div
              key={r.title}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: r.color + "20" }}>
                <r.icon size={22} style={{ color: r.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1A2332] text-sm">{r.title}</p>
                <p className="text-[10px] text-[#9CA3AF]">{r.desc}</p>
              </div>
              <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-lg hover:bg-[#F7F9FC] text-[#6B7280]">
                  <Download size={14} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-[#F7F9FC] text-[#6B7280]">
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
