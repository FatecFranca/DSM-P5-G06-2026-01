"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Moon, Clock, Star, TrendingUp, Search, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  webListarSono, ApiSono, QUALIDADE_SONO_MAP,
} from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

type SleepQuality = "excellent" | "good" | "fair" | "poor";
type FilterKey = "all" | SleepQuality;

const QUALITY_CONFIG: Record<SleepQuality, { label: string; color: string; bg: string; text: string }> = {
  excellent: { label: "Excelente", color: "#4CAF82", bg: "#E8F5EE", text: "#4CAF82" },
  good:      { label: "Boa",       color: "#3B8ED0", bg: "#E3F0FB", text: "#3B8ED0" },
  fair:      { label: "Regular",   color: "#F59E0B", bg: "#FEF3C7", text: "#F59E0B" },
  poor:      { label: "Ruim",      color: "#EF4444", bg: "#FEE2E2", text: "#EF4444" },
};

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SleepEntry {
  id: string;
  usuarioId: string;
  userName: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: SleepQuality;
  notes?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapSono(sono: ApiSono): SleepEntry {
  return {
    id: sono.id,
    usuarioId: sono.usuarioId,
    userName: sono.usuario?.nome ?? `Usuário ${sono.usuarioId.slice(0, 6)}`,
    date: sono.data,
    bedtime: sono.horaDeitar,
    wakeTime: sono.horaAcordar,
    duration: sono.duracao,
    quality: QUALIDADE_SONO_MAP[sono.qualidade],
    notes: sono.notas,
  };
}

function avgDuration(entries: SleepEntry[]) {
  if (!entries.length) return 0;
  return Math.round((entries.reduce((s, e) => s + e.duration, 0) / entries.length) * 10) / 10;
}

function buildWeeklyChart(entries: SleepEntry[]) {
  const uniqueDates = [...new Set(entries.map(e => e.date))].sort().slice(-7);
  return uniqueDates.map(date => {
    const day = entries.filter(e => e.date === date);
    const hours = Math.round((day.reduce((s, e) => s + e.duration, 0) / day.length) * 10) / 10;
    const counts = day.reduce<Record<string, number>>((acc, e) => {
      acc[e.quality] = (acc[e.quality] ?? 0) + 1;
      return acc;
    }, {});
    const quality = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "good") as SleepQuality;
    const dayOfWeek = new Date(date + "T12:00:00").getDay();
    return { day: DAY_LABELS[dayOfWeek], hours, quality };
  });
}

function buildQualityDist(entries: SleepEntry[]) {
  return [
    { name: "Excelente", value: entries.filter(e => e.quality === "excellent").length, color: "#4CAF82" },
    { name: "Boa",       value: entries.filter(e => e.quality === "good").length,      color: "#3B8ED0" },
    { name: "Regular",   value: entries.filter(e => e.quality === "fair").length,      color: "#F59E0B" },
    { name: "Ruim",      value: entries.filter(e => e.quality === "poor").length,      color: "#EF4444" },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SleepPage() {
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [qualityFilter, setQualityFilter] = useState<FilterKey>("all");

  useEffect(() => {
    setLoading(true);
    webListarSono(1, 200)
      .then(data => setEntries(data.dados.map(mapSono)))
      .catch(() => setError("Não foi possível carregar os registros de sono."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchesQuality = qualityFilter === "all" || e.quality === qualityFilter;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        e.date.includes(term) ||
        QUALITY_CONFIG[e.quality].label.toLowerCase().includes(term) ||
        (e.notes ?? "").toLowerCase().includes(term) ||
        String(e.duration).includes(term) ||
        e.userName.toLowerCase().includes(term);
      return matchesQuality && matchesSearch;
    });
  }, [search, qualityFilter, entries]);

  const avg = avgDuration(entries);
  const excellentCount = entries.filter(e => e.quality === "excellent").length;
  const poorCount = entries.filter(e => e.quality === "poor").length;
  const aboveGoalCount = entries.filter(e => e.duration >= 7).length;
  const aboveGoalPct = entries.length > 0 ? Math.round((aboveGoalCount / entries.length) * 100) : 0;

  const weeklyData = useMemo(() => buildWeeklyChart(entries), [entries]);
  const qualityDist = useMemo(() => buildQualityDist(entries), [entries]);

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A2332]">Sono</h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Monitoramento do sono dos pacientes — qualidade e duração
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Moon size={20} color="#8B5CF6" />}
          iconBg="#EDE9FE"
          label="Média de sono"
          value={loading ? "—" : `${avg}h`}
          sub="por noite"
          valueColor="#8B5CF6"
        />
        <KpiCard
          icon={<TrendingUp size={20} color="#4CAF82" />}
          iconBg="#E8F5EE"
          label="Meta atingida (≥7h)"
          value={loading ? "—" : `${aboveGoalPct}%`}
          sub={loading ? "" : `${aboveGoalCount} de ${entries.length} noites`}
          valueColor="#4CAF82"
        />
        <KpiCard
          icon={<Star size={20} color="#3B8ED0" />}
          iconBg="#E3F0FB"
          label="Sono excelente"
          value={loading ? "—" : String(excellentCount)}
          sub="registros"
          valueColor="#3B8ED0"
        />
        <KpiCard
          icon={<Clock size={20} color="#EF4444" />}
          iconBg="#FEE2E2"
          label="Sono ruim"
          value={loading ? "—" : String(poorCount)}
          sub="registros"
          valueColor="#EF4444"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart — weekly hours */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-sm font-semibold text-[#1A2332] mb-4">Horas de sono — últimas datas</h2>
          {loading ? (
            <div className="flex items-center justify-center h-[220px] text-[#9CA3AF] text-sm">Carregando...</div>
          ) : weeklyData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-[#9CA3AF] text-sm">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                  formatter={(v: number) => [`${v}h`, "Sono"]}
                />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell key={i} fill={QUALITY_CONFIG[entry.quality].color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2 flex-wrap">
            {(Object.entries(QUALITY_CONFIG) as [SleepQuality, typeof QUALITY_CONFIG[SleepQuality]][]).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />
                <span className="text-xs text-[#6B7280]">{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart — quality distribution */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-sm font-semibold text-[#1A2332] mb-4">Distribuição de qualidade</h2>
          {loading ? (
            <div className="flex items-center justify-center h-[180px] text-[#9CA3AF] text-sm">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={qualityDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {qualityDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} registros`]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-1.5 mt-1">
            {qualityDist.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-xs text-[#6B7280]">{item.name}</span>
                </div>
                <span className="text-xs font-semibold text-[#1A2332]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#F0F2F5] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Buscar por data, paciente, qualidade, notas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] placeholder:text-[#9CA3AF] outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "excellent", "good", "fair", "poor"] as FilterKey[]).map(f => (
              <button
                key={f}
                onClick={() => setQualityFilter(f)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                style={
                  qualityFilter === f
                    ? { background: f === "all" ? "#EDE9FE" : QUALITY_CONFIG[f as SleepQuality].bg, color: f === "all" ? "#8B5CF6" : QUALITY_CONFIG[f as SleepQuality].text }
                    : { background: "#F7F9FC", color: "#6B7280" }
                }
              >
                {f === "all" ? "Todos" : QUALITY_CONFIG[f as SleepQuality].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC] text-left">
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Data</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Paciente</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Dormiu</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Acordou</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Duração</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Qualidade</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#9CA3AF] text-sm">
                    Carregando registros...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                      <Moon size={36} strokeWidth={1.5} />
                      <p className="text-sm font-medium">Nenhum registro encontrado</p>
                      <p className="text-xs">Tente ajustar os filtros de busca</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(entry => {
                  const cfg = QUALITY_CONFIG[entry.quality];
                  const durationColor = entry.duration >= 7 ? "#4CAF82" : entry.duration >= 6 ? "#F59E0B" : "#EF4444";
                  return (
                    <tr key={entry.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1A2332]">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                            <Users size={13} color="#8B5CF6" />
                          </div>
                          <span className="text-[#6B7280]">{entry.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#1A2332]">{entry.bedtime}</td>
                      <td className="px-4 py-3 text-[#1A2332]">{entry.wakeTime}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold" style={{ color: durationColor }}>{entry.duration}h</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: cfg.bg, color: cfg.text }}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#9CA3AF] text-xs max-w-[180px] truncate">
                        {entry.notes ?? "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-[#F0F2F5] flex items-center justify-between">
            <span className="text-xs text-[#9CA3AF]">
              {filtered.length} de {entries.length} registros
            </span>
            <span className="text-xs text-[#6B7280]">
              Média filtrada: <strong className="text-[#8B5CF6]">{avgDuration(filtered)}h</strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon, iconBg, label, value, sub, valueColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  sub: string;
  valueColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[#6B7280] leading-tight">{label}</p>
        <p className="text-2xl font-bold leading-tight mt-0.5" style={{ color: valueColor }}>{value}</p>
        <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
