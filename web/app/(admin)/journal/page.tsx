"use client";

import { useState } from "react";
import {
  BookOpen, Search, Filter, Smile, Meh, Frown, TrendingUp,
  Tag, User, Calendar, MessageSquare, Plus,
} from "lucide-react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  MOCK_JOURNAL, MOCK_USERS, MOOD_DISTRIBUTION,
  type Mood,
} from "@/lib/mock-data";
import {
  moodLabel, moodEmoji, moodColor, formatDate, getInitials,
} from "@/lib/utils";

const stats = [
  { label: "Total de Entradas", value: MOCK_JOURNAL.length, color: "#8B5CF6", bg: "#EDE9FE", icon: BookOpen },
  { label: "Esta Semana", value: 3, color: "#4CAF82", bg: "#E8F5EE", icon: TrendingUp },
  { label: "Usuários Ativos", value: 1, color: "#3B8ED0", bg: "#E3F0FB", icon: User },
  { label: "Humor Médio", value: "Bem", color: "#F97316", bg: "#FFF0E5", icon: Smile },
];

const moodFilters: { value: "all" | Mood; label: string; emoji: string }[] = [
  { value: "all", label: "Todos", emoji: "📋" },
  { value: "great", label: "Ótimo", emoji: "😄" },
  { value: "good", label: "Bem", emoji: "😊" },
  { value: "okay", label: "Ok", emoji: "😐" },
  { value: "bad", label: "Mal", emoji: "😔" },
  { value: "terrible", label: "Péssimo", emoji: "😢" },
];

function MoodIcon({ mood }: { mood: Mood }) {
  const color = moodColor(mood);
  if (mood === "great" || mood === "good") return <Smile size={16} style={{ color }} />;
  if (mood === "okay") return <Meh size={16} style={{ color }} />;
  return <Frown size={16} style={{ color }} />;
}

export default function JournalPage() {
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<"all" | Mood>("all");

  const userMap = Object.fromEntries(MOCK_USERS.map((u) => [u.id, u]));

  const filtered = MOCK_JOURNAL.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.content.toLowerCase().includes(search.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchMood = moodFilter === "all" || j.mood === moodFilter;
    return matchSearch && matchMood;
  });

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
        {/* Entries per day */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Entradas por Humor</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Distribuição dos registros emocionais</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOOD_DISTRIBUTION} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="mood" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} entradas`]} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Entradas">
                {MOOD_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mood breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-4">Resumo de Humor</h3>
          <div className="space-y-3">
            {MOOD_DISTRIBUTION.map((m) => (
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
                      style={{ width: `${(m.count / MOCK_JOURNAL.length) * 100}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tags cloud */}
          <div className="mt-5">
            <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Tags Frequentes</h4>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(new Set(MOCK_JOURNAL.flatMap((j) => j.tags))).map((tag) => (
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
        {/* Toolbar */}
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
          <button className="flex items-center gap-1.5 bg-[#8B5CF6] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#7C3AED] transition-colors ml-auto">
            <Plus size={14} />
            Nova Entrada
          </button>
        </div>

        {/* Journal Entries */}
        <div className="divide-y divide-[#F0F2F5]">
          {filtered.map((entry) => {
            const user = userMap[entry.userId];
            const color = moodColor(entry.mood);
            return (
              <div key={entry.id} className="px-5 py-4 hover:bg-[#F7F9FC] transition-colors">
                <div className="flex items-start gap-4">
                  {/* User avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
                  >
                    {user ? getInitials(user.name) : "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-[#1A2332] text-sm">{entry.title}</h4>
                          <span
                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: color + "20", color }}
                          >
                            <MoodIcon mood={entry.mood} />
                            {moodEmoji(entry.mood)} {moodLabel(entry.mood)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] line-clamp-2">{entry.content}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                          <Calendar size={11} />
                          {formatDate(entry.date)}
                        </div>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">{entry.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      {/* User name */}
                      <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                        <User size={11} />
                        {user?.name ?? "Usuário desconhecido"}
                      </span>

                      {/* Symptoms */}
                      {entry.symptoms.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-[#EF4444]">
                          <MessageSquare size={11} />
                          {entry.symptoms.join(", ")}
                        </span>
                      )}

                      {/* Tags */}
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

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#9CA3AF]">
            <BookOpen size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhuma entrada encontrada</p>
          </div>
        )}

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {MOCK_JOURNAL.length} entradas
        </div>
      </div>
    </div>
  );
}
