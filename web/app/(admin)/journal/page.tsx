"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, Smile, Filter, Tag, AlertCircle } from "lucide-react";
import { webListarDiarios, ApiDiario, HUMOR_LABEL } from "@/lib/api";
import { moodLabel, moodEmoji, moodColor, formatDate, getInitials } from "@/lib/utils";
import type { Mood } from "@/lib/mock-data";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

// ─── Humor mapping ────────────────────────────────────────────────────────────

type HumorApi = ApiDiario["humor"];

const HUMOR_TO_MOOD: Record<HumorApi, Mood> = {
  OTIMO: "great",
  BOM: "good",
  OK: "okay",
  MAL: "bad",
  PESSIMO: "terrible",
};

const MOODS_API: { value: HumorApi | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "OTIMO", label: "Ótimo 😄" },
  { value: "BOM", label: "Bem 😊" },
  { value: "OK", label: "Ok 😐" },
  { value: "MAL", label: "Mal 😔" },
  { value: "PESSIMO", label: "Péssimo 😢" },
];

const WEEKLY_MOODS = [
  { day: "Seg", avg: 4.2 },
  { day: "Ter", avg: 3.8 },
  { day: "Qua", avg: 4.5 },
  { day: "Qui", avg: 3.1 },
  { day: "Sex", avg: 4.0 },
  { day: "Sáb", avg: 4.7 },
  { day: "Dom", avg: 3.9 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [entries, setEntries] = useState<ApiDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<HumorApi | "all">("all");

  useEffect(() => {
    (async () => {
      try {
        const result = await webListarDiarios(1, 200);
        setEntries(result.dados);
      } catch (err: any) {
        setError(err?.message ?? "Erro ao carregar diários");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = entries.filter((j) => {
    const matchSearch =
      j.titulo.toLowerCase().includes(search.toLowerCase()) ||
      j.conteudo.toLowerCase().includes(search.toLowerCase());
    const matchMood = moodFilter === "all" || j.humor === moodFilter;
    return matchSearch && matchMood;
  });

  // Stats
  const stats = [
    { label: "Total de Entradas", value: entries.length, color: "#8B5CF6", bg: "#EDE9FE" },
    {
      label: "Humor + Frequente",
      value: (() => {
        if (entries.length === 0) return "—";
        const freq: Record<string, number> = {};
        entries.forEach((e) => { freq[e.humor] = (freq[e.humor] ?? 0) + 1; });
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
        const mood = HUMOR_TO_MOOD[top as HumorApi];
        return top ? `${moodLabel(mood)} ${moodEmoji(mood)}` : "—";
      })(),
      color: "#4CAF82",
      bg: "#E8F5EE",
    },
    {
      label: "Usuários com Diário",
      value: new Set(entries.map((e) => e.usuarioId)).size,
      color: "#3B8ED0",
      bg: "#E3F0FB",
    },
    {
      label: "Esta Semana",
      value: entries.filter((e) => {
        const d = new Date(e.criadoEm);
        const now = new Date();
        const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }).length,
      color: "#F97316",
      bg: "#FFF0E5",
    },
  ];

  // Mood distribution for pie
  const moodDist = Object.entries(
    entries.reduce((acc, e) => {
      const mood = HUMOR_TO_MOOD[e.humor];
      acc[mood] = (acc[mood] ?? 0) + 1;
      return acc;
    }, {} as Record<Mood, number>)
  ).map(([mood, count]) => ({
    mood: `${moodLabel(mood as Mood)} ${moodEmoji(mood as Mood)}`,
    count,
    color: moodColor(mood as Mood),
  }));

  const getUserDisplay = (entry: ApiDiario) => {
    if (entry.usuario?.nome) return entry.usuario.nome;
    return `Usuário`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#EF4444]">
        <AlertCircle size={36} />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Moderação de Conteúdo</p>
          <h2 className="text-2xl font-bold mt-1">Diário Emocional</h2>
          <p className="text-white/70 text-sm mt-1">Monitore o bem-estar e humor dos usuários</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <BookOpen size={120} strokeWidth={1} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm">
            <p className="text-2xl font-bold text-[#1A2332]">{s.value}</p>
            <p className="text-xs text-[#6B7280] mt-0.5">{s.label}</p>
            <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: s.color, width: "40%" }} />
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Mood distribution pie */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Distribuição de Humor</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Total de registros por estado</p>
          {moodDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={moodDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="count">
                    {moodDist.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} entradas`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {moodDist.map((d) => (
                  <div key={d.mood} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate">{d.mood}</span>
                    <span className="ml-auto font-semibold text-[#1A2332]">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-[#9CA3AF] text-sm">
              Sem dados ainda
            </div>
          )}
        </div>

        {/* Mood trend */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Humor Médio Semanal</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Escala de 1 (péssimo) a 5 (ótimo) — últimos 7 dias</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEKLY_MOODS} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 5]} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} formatter={(v) => [`${v} / 5`]} />
              <Bar dataKey="avg" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Humor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Journal entries table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou conteúdo..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[#9CA3AF]" />
            {MOODS_API.map((m) => (
              <button
                key={m.value}
                onClick={() => setMoodFilter(m.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  moodFilter === m.value
                    ? { backgroundColor: "#EDE9FE", color: "#8B5CF6" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-[#F0F2F5]">
          {filtered.map((entry) => {
            const mood = HUMOR_TO_MOOD[entry.humor];
            const color = moodColor(mood);
            const userName = getUserDisplay(entry);
            const dateStr = entry.criadoEm.split("T")[0];
            const timeStr = entry.criadoEm.split("T")[1]?.slice(0, 5) ?? "";
            return (
              <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#F7F9FC] transition-colors">
                {/* Mood emoji */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: color + "20" }}
                >
                  {moodEmoji(mood)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[#1A2332]">{entry.titulo}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: color + "20", color }}
                    >
                      {moodLabel(mood)} {moodEmoji(mood)}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">{entry.conteudo}</p>
                  {entry.sintomas.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {entry.sintomas.map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 bg-[#FEE2E2] text-[#EF4444] rounded-full font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <Tag size={10} className="text-[#9CA3AF] mt-0.5" />
                      {entry.tags.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-full">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="text-right shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold ml-auto mb-1"
                    style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                  >
                    {getInitials(userName)}
                  </div>
                  <p className="text-[10px] text-[#9CA3AF]">{entry.usuario?.nome ?? "Usuário"}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{formatDate(dateStr)}</p>
                  {timeStr && <p className="text-[10px] text-[#9CA3AF]">{timeStr}</p>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Smile size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {entries.length === 0 ? "Nenhuma entrada no diário ainda" : "Nenhuma entrada encontrada"}
              </p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {entries.length} entradas
        </div>
      </div>
    </div>
  );
}
