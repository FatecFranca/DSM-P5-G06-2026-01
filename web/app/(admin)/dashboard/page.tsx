"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Activity, Target, Lightbulb, TrendingUp, TrendingDown,
  ArrowUpRight, Droplets, Moon,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  webListarUsuarios, webListarTodasGlicose, webListarMetas, webListarDicas,
  webListarSono, webListarHidratacao,
  glicoseParaRow,
  type ApiUsuario, type GlucoseStatus,
} from "@/lib/api";
import { glucoseStatusLabel, glucoseStatusColor, formatDate } from "@/lib/utils";

type Row = { id: string; value: number; status: GlucoseStatus; date: string; time: string; usuario?: { nome: string } };

const STATUS_COLORS: Record<GlucoseStatus, string> = {
  normal: "#4CAF82", high: "#F59E0B", very_high: "#EF4444", low: "#3B8ED0",
};

export default function DashboardPage() {
  const [usuarios, setUsuarios] = useState<ApiUsuario[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [readings, setReadings] = useState<Row[]>([]);
  const [totalMetas, setTotalMetas] = useState(0);
  const [metasAtivas, setMetasAtivas] = useState(0);
  const [totalDicas, setTotalDicas] = useState(0);
  const [sonoMedia, setSonoMedia] = useState<number | null>(null);
  const [totalHidratacaoHoje, setTotalHidratacaoHoje] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const [usersRes, glicoseRes, metasRes, dicasRes, sonoRes, hidratRes] = await Promise.allSettled([
        webListarUsuarios(1, 100),
        webListarTodasGlicose(1, 100),
        webListarMetas(1, 100),
        webListarDicas(1, 1),
        webListarSono(1, 30),
        webListarHidratacao(1, 200),
      ]);

      if (usersRes.status === "fulfilled") {
        setUsuarios(usersRes.value.dados);
        setTotalUsuarios(usersRes.value.total);
      }
      if (glicoseRes.status === "fulfilled") {
        setReadings(glicoseRes.value.dados.map(g => glicoseParaRow(g) as Row));
      }
      if (metasRes.status === "fulfilled") {
        setTotalMetas(metasRes.value.total);
        setMetasAtivas(metasRes.value.dados.filter(m => !m.concluida).length);
      }
      if (dicasRes.status === "fulfilled") {
        setTotalDicas(dicasRes.value.total);
      }
      if (sonoRes.status === "fulfilled" && sonoRes.value.dados.length > 0) {
        const avg = sonoRes.value.dados.reduce((s, r) => s + r.duracao, 0) / sonoRes.value.dados.length;
        setSonoMedia(Math.round(avg * 10) / 10);
      }
      if (hidratRes.status === "fulfilled") {
        const todayMl = hidratRes.value.dados
          .filter(h => h.data === today)
          .reduce((s, h) => s + h.quantidade, 0);
        setTotalHidratacaoHoje(todayMl);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Compute derived stats
  const avgGlicose = readings.length > 0
    ? Math.round(readings.reduce((s, r) => s + r.value, 0) / readings.length)
    : null;

  const distribution = readings.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: "Normal", value: distribution["normal"] ?? 0, color: "#4CAF82" },
    { name: "Alto", value: distribution["high"] ?? 0, color: "#F59E0B" },
    { name: "Muito Alto", value: distribution["very_high"] ?? 0, color: "#EF4444" },
    { name: "Baixo", value: distribution["low"] ?? 0, color: "#3B8ED0" },
  ].filter(d => d.value > 0);

  // Trend: group readings by day
  const trendMap: Record<string, number[]> = {};
  readings.forEach(r => {
    if (!trendMap[r.date]) trendMap[r.date] = [];
    trendMap[r.date].push(r.value);
  });
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([date, vals]) => ({
      date: formatDate(date),
      avg: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
      max: Math.max(...vals),
      min: Math.min(...vals),
    }));

  // Diabetes type distribution
  const diabetesDist: Record<string, number> = {};
  usuarios.forEach(u => {
    const t = u.tipoDiabetes ?? "NENHUM";
    diabetesDist[t] = (diabetesDist[t] ?? 0) + 1;
  });
  const DIAB_LABELS: Record<string, string> = {
    TIPO1: "Tipo 1", TIPO2: "Tipo 2", GESTACIONAL: "Gestacional",
    PRE_DIABETES: "Pré-diabetes", NENHUM: "Sem diabetes",
  };
  const DIAB_COLORS: Record<string, string> = {
    TIPO1: "#3B8ED0", TIPO2: "#4CAF82", GESTACIONAL: "#EC4899",
    PRE_DIABETES: "#F59E0B", NENHUM: "#9CA3AF",
  };
  const diabPieData = Object.entries(diabetesDist)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: DIAB_LABELS[k] ?? k, value: v, color: DIAB_COLORS[k] ?? "#9CA3AF" }));

  const recentReadings = readings.slice(0, 6);
  const activeUsers = usuarios.filter(u => u.status === "ATIVO").slice(0, 6);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

  const kpis = [
    {
      label: "Total de Usuários", icon: Users, color: "#4CAF82", bg: "#E8F5EE",
      value: loading ? "..." : String(totalUsuarios),
      sub: `${activeUsers.length} ativos`,
      trend: "up",
    },
    {
      label: "Glicose Média", icon: Activity, color: "#3B8ED0", bg: "#E3F0FB",
      value: loading ? "..." : avgGlicose !== null ? `${avgGlicose} mg/dL` : "—",
      sub: `${readings.length} leituras`,
      trend: avgGlicose !== null && avgGlicose > 140 ? "down" : "up",
    },
    {
      label: "Metas Ativas", icon: Target, color: "#F97316", bg: "#FFF0E5",
      value: loading ? "..." : `${metasAtivas} / ${totalMetas}`,
      sub: totalMetas > 0 ? `${Math.round((metasAtivas / totalMetas) * 100)}% em andamento` : "—",
      trend: "up",
    },
    {
      label: "Artigos Publicados", icon: Lightbulb, color: "#8B5CF6", bg: "#EDE9FE",
      value: loading ? "..." : String(totalDicas),
      sub: "Dicas & artigos",
      trend: "up",
    },
  ];

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
          <p className="text-white/70 text-sm mt-1">{dateLabel}</p>
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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                <kpi.icon size={20} style={{ color: kpi.color }} />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-medium" style={{ color: kpi.trend === "up" ? "#10B981" : "#EF4444" }}>
                {kpi.trend === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#1A2332]">{kpi.value}</p>
            <p className="text-[#6B7280] text-xs mt-0.5">{kpi.label}</p>
            <p className="text-[#9CA3AF] text-[11px] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick stats row: sleep + hydration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0">
            <Moon size={20} className="text-[#8B5CF6]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1A2332]">{sonoMedia !== null ? `${sonoMedia}h` : "—"}</p>
            <p className="text-xs text-[#6B7280]">Média de Sono</p>
            <p className="text-[10px] text-[#9CA3AF]">Últimos 30 registros</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E0F7FA] flex items-center justify-center shrink-0">
            <Droplets size={20} className="text-[#00ACC1]" />
          </div>
          <div>
            <p className="text-xl font-bold text-[#1A2332]">
              {totalHidratacaoHoje > 0 ? `${(totalHidratacaoHoje / 1000).toFixed(1)}L` : "—"}
            </p>
            <p className="text-xs text-[#6B7280]">Hidratação Hoje</p>
            <p className="text-[10px] text-[#9CA3AF]">Meta: 2,5L</p>
          </div>
        </div>
      </div>

      {/* Main row: Glucose trend + Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Glucose Trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1A2332]">Tendência de Glicose</h3>
              <p className="text-xs text-[#9CA3AF]">Média diária — últimos 7 dias (todos os usuários)</p>
            </div>
            {avgGlicose !== null && (
              <span className="text-xs bg-[#E8F5EE] text-[#4CAF82] px-2.5 py-1 rounded-full font-medium">
                Média: {avgGlicose} mg/dL
              </span>
            )}
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4CAF82" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4CAF82" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[60, 220]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} mg/dL`]} />
                <Area type="monotone" dataKey="max" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Máxima" />
                <Area type="monotone" dataKey="avg" stroke="#4CAF82" strokeWidth={2} fill="url(#glGrad)" name="Média" />
                <Area type="monotone" dataKey="min" stroke="#3B8ED0" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Mínima" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[#9CA3AF] text-sm">
              {loading ? "Carregando..." : "Sem dados de glicose registrados"}
            </div>
          )}
          <div className="flex gap-4 mt-3 justify-center">
            {[{ label: "Máxima", color: "#F59E0B" }, { label: "Média", color: "#4CAF82" }, { label: "Mínima", color: "#3B8ED0" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Glucose Distribution */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Distribuição Glicêmica</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">{readings.length} leituras registradas</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} leituras`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span>{d.name}</span>
                    <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-[#9CA3AF] text-sm">
              {loading ? "Carregando..." : "Sem dados"}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Recent readings + Users */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent glucose readings */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F5]">
            <h3 className="font-bold text-[#1A2332]">Últimas Leituras de Glicose</h3>
            <a href="/glucose" className="text-xs text-[#4CAF82] font-medium hover:underline flex items-center gap-1">
              Ver todas <ArrowUpRight size={13} />
            </a>
          </div>
          {loading ? (
            <div className="p-6 text-center text-sm text-[#9CA3AF]">Carregando...</div>
          ) : recentReadings.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#9CA3AF]">Nenhuma leitura registrada</div>
          ) : (
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
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: color + "20", color }}>
                          {label}
                        </span>
                      </div>
                      <p className="text-[#9CA3AF] text-xs truncate">
                        {formatDate(r.date)} às {r.time}
                        {r.usuario ? ` · ${r.usuario.nome}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Users + diabetes type */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F2F5]">
            <h3 className="font-bold text-[#1A2332]">Usuários</h3>
            <a href="/users" className="text-xs text-[#4CAF82] font-medium hover:underline flex items-center gap-1">
              Ver todos <ArrowUpRight size={13} />
            </a>
          </div>
          {diabPieData.length > 0 && (
            <div className="px-5 pt-4">
              <p className="text-xs text-[#9CA3AF] mb-2">Tipos de diabetes</p>
              <div className="flex gap-3 flex-wrap mb-3">
                {diabPieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    {d.name}
                    <span className="font-semibold text-[#1A2332]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {loading ? (
            <div className="p-6 text-center text-sm text-[#9CA3AF]">Carregando...</div>
          ) : (
            <div className="divide-y divide-[#F0F2F5]">
              {activeUsers.map((u) => {
                const initials = u.nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
                const tipoLabel = { TIPO1: "Tipo 1", TIPO2: "Tipo 2", GESTACIONAL: "Gestacional", PRE_DIABETES: "Pré-diabetes", NENHUM: "Sem diabetes" }[u.tipoDiabetes ?? "NENHUM"] ?? "—";
                return (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F7F9FC] transition-colors">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-xs"
                      style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#1A2332] truncate">{u.nome}</p>
                      <p className="text-xs text-[#9CA3AF] truncate">{u.email}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#E8F5EE] text-[#4CAF82] shrink-0">
                      {tipoLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
