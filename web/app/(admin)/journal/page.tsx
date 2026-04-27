"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BookOpen, Search, Filter, Smile, Meh, Frown, TrendingUp,
  Tag, User, Calendar, MessageSquare,
} from "lucide-react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { webListarDiarios, HUMOR_LABEL, type ApiDiario } from "@/lib/api";
import { moodLabel, moodEmoji, moodColor, formatDate, getInitials } from "@/lib/utils";

type Mood = "great" | "good" | "okay" | "bad" | "terrible";

const MOOD_META = [
  { api: "OTIMO",   app: "great"    as Mood, label: "Ótimo",   emoji: "😄", color: "#10B981" },
  { api: "BOM",     app: "good"     as Mood, label: "Bem",     emoji: "😊", color: "#4CAF82" },
  { api: "OK",      app: "okay"     as Mood, label: "Ok",      emoji: "😐", color: "#F59E0B" },
  { api: "MAL",     app: "bad"      as Mood, label: "Mal",     emoji: "😔", color: "#F97316" },
  { api: "PESSIMO", app: "terrible" as Mood, label: "Péssimo", emoji: "😢", color: "#EF4444" },
];

const moodFilters: { value: "all" | Mood; label: string; emoji: string }[] = [
  { value: "all",      label: "Todos",   emoji: "📋" },
  { value: "great",    label: "Ótimo",   emoji: "😄" },
  { value: "good",     label: "Bem",     emoji: "😊" },
  { value: "okay",     label: "Ok",      emoji: "😐" },
  { value: "bad",      label: "Mal",     emoji: "😔" },
  { value: "terrible", label: "Péssimo", emoji: "😢" },
];

function toMood(humor: string): Mood {
  return (HUMOR_LABEL[humor] ?? "okay") as Mood;
}

function MoodIcon({ mood }: { mood: Mood }) {
  const color = moodColor(mood);
  if (mood === "great" || mood === "good") return <Smile size={16} style={{ color }} />;
  if (mood === "okay") return <Meh size={16} style={{ color }} />;
  return <Frown size={16} style={{ color }} />;
}

function avgMoodLabel(entries: ApiDiario[]): string {
  if (entries.length === 0) return "—";
  const scores: Record<string, number> = { OTIMO: 5, BOM: 4, OK: 3, MAL: 2, PESSIMO: 1 };
  const avg = entries.reduce((s, e) => s + (scores[e.humor] ?? 3), 0) / entries.length;
  if (avg >= 4.5) return "Ótimo";
  if (avg >= 3.5) return "Bem";
  if (avg >= 2.5) return "Ok";
  if (avg >= 1.5) return "Mal";
  return "Péssimo";
}

function thisWeekCount(entries: ApiDiario[]): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return entries.filter(e => new Date(e.criadoEm) >= cutoff).length;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<ApiDiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<"all" | Mood>("all");

  useEffect(() => {
    webListarDiarios()
      .then(r => setEntries(r.dados))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeUsers = useMemo(
    () => new Set(entries.map(e => e.usuarioId)).size,
    [entries]
  );

  const stats = [
    { label: "Total de Entradas", value: entries.length,          color: "#8B5CF6", bg: "#EDE9FE", icon: BookOpen   },
    { label: "Esta Semana",        value: thisWeekCount(entries),  color: "#4CAF82", bg: "#E8F5EE", icon: TrendingUp  },
    { label: "Usuários Ativos",    value: activeUsers,             color: "#3B8ED0", bg: "#E3F0FB", icon: User       },
    { label: "Humor Médio",        value: avgMoodLabel(entries),   color: "#F97316", bg: "#FFF0E5", icon: Smile      },
  ];

  const moodDistribution = useMemo(() =>
    MOOD_META.map(m => ({
      mood:  `${m.label} ${m.emoji}`,
      count: entries.filter(e => e.humor === m.api).length,
      color: m.color,
    })),
    [entries]
  );

  const allTags = useMemo(
    () => Array.from(new Set(entries.flatMap(e => e.tags))),
    [entries]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter(e => {
      const matchSearch =
        e.titulo.toLowerCase().includes(q) ||
        e.conteudo.toLowerCase().includes(q) ||
        e.tags.some(t => t.toLowerCase().includes(q));
      const matchMood = moodFilter === "all" || toMood(e.humor) === moodFilter;
      return matchSearch && matchMood;
    });
  }, [entries, search, moodFilter]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Gestão de Conteúdo</p>
          <h2 className="text-2xl font-bold mt-1">Diário Emocional</h2>
          <p className="text-white/70 text-sm mt-1">Acompanhe o bem-estar e estado emocional dos pacientes</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <BookOpen size={120} strokeWidth={1} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Mood Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Entradas por Humor</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Distribuição dos registros emocionais</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={moodDistribution} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="mood" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} entradas`]} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Entradas">
                {moodDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-4">Resumo de Humor</h3>
          <div className="space-y-3">
            {moodDistribution.map((m) => (
              <div key={m.mood} className="flex items-center gap-3">
                <span className="text-xl">{m.mood.split(" ")[1]}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-[#1A2332]">{m.mood.split(" ")[0]}</span>
                    <span className="text-xs text-[#6B7280]">{m.count} entradas</span>
                  </div>
                  <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: entries.length > 0 ? `${(m.count / entries.length) * 100}%` : "0%",
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Tags Frequentes</h4>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full border border-[#E5E7EB] text-[#6B7280] bg-[#F7F9FC]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, conteúdo ou tags..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} className="text-[#9CA3AF]" />
            {moodFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setMoodFilter(f.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={
                  moodFilter === f.value
                    ? { backgroundColor: "#EDE9FE", color: "#8B5CF6" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#F0F2F5]">
          {loading ? (
            <div className="text-center py-12 text-[#9CA3AF]">
              <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">Carregando entradas...</p>
            </div>
          ) : filtered.map((entry) => {
            const mood = toMood(entry.humor);
            const color = moodColor(mood);
            const date = entry.criadoEm.split("T")[0];
            const time = new Date(entry.criadoEm).toTimeString().slice(0, 5);
            return (
              <div key={entry.id} className="px-5 py-4 hover:bg-[#F7F9FC] transition-colors">
                <div className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
                  >
                    {entry.usuario ? getInitials(entry.usuario.nome) : "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-[#1A2332] text-sm">{entry.titulo}</h4>
                          <span
                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: color + "20", color }}
                          >
                            <MoodIcon mood={mood} />
                            {moodEmoji(mood)} {moodLabel(mood)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] line-clamp-2">{entry.conteudo}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                          <Calendar size={11} />
                          {formatDate(date)}
                        </div>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">{time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                        <User size={11} />
                        {entry.usuario?.nome ?? "Usuário desconhecido"}
                      </span>

                      {entry.sintomas.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[#EF4444]">
                          <MessageSquare size={11} />
                          {entry.sintomas.join(", ")}
                        </span>
                      )}

                      {entry.tags.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          <Tag size={11} className="text-[#9CA3AF]" />
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#8B5CF6]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-[#9CA3AF]">
            <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhuma entrada encontrada</p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {entries.length} entradas
        </div>
      </div>
    </div>
  );
}
