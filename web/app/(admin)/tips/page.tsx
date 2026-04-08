"use client";

import { useState } from "react";
import { Search, Lightbulb, Eye, Heart, Star, Filter, Plus } from "lucide-react";
import { MOCK_TIPS } from "@/lib/mock-data";
import type { TipCategory } from "@/lib/mock-data";
import { tipCategoryColor, tipCategoryBg, formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const CATEGORIES: { value: TipCategory | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "Exercício", label: "🏃 Exercício" },
  { value: "Alimentação", label: "🥦 Alimentação" },
  { value: "Emergência", label: "🚨 Emergência" },
  { value: "Bem-estar", label: "🧘 Bem-estar" },
];

const VIEWS_DATA = MOCK_TIPS.map((t) => ({ title: t.title.slice(0, 20) + "…", views: t.views, likes: t.likes }));

const CATEGORY_DIST = [
  { name: "Exercício", value: 1, color: "#4CAF82" },
  { name: "Alimentação", value: 2, color: "#F97316" },
  { name: "Emergência", value: 1, color: "#EF4444" },
  { name: "Bem-estar", value: 2, color: "#8B5CF6" },
];

const stats = [
  { label: "Total de Artigos", value: MOCK_TIPS.length, color: "#F97316", bg: "#FFF0E5" },
  { label: "Em Destaque", value: MOCK_TIPS.filter((t) => t.featured).length, color: "#F59E0B", bg: "#FEF3C7" },
  { label: "Total de Visualizações", value: "4.611", color: "#4CAF82", bg: "#E8F5EE" },
  { label: "Total de Curtidas", value: "349", color: "#EC4899", bg: "#FCE7F3" },
];

export default function TipsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<TipCategory | "all">("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const filtered = MOCK_TIPS.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.summary.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || t.category === catFilter;
    const matchFeatured = !featuredOnly || t.featured;
    return matchSearch && matchCat && matchFeatured;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Gestão de Conteúdo</p>
          <h2 className="text-2xl font-bold mt-1">Dicas & Artigos</h2>
          <p className="text-white/70 text-sm mt-1">Gerencie o conteúdo educativo da plataforma</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Lightbulb size={120} strokeWidth={1} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <Lightbulb size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Category pie */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Por Categoria</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Distribuição de artigos</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CATEGORY_DIST} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                {CATEGORY_DIST.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} artigos`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {CATEGORY_DIST.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Views chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Visualizações por Artigo</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Engajamento de conteúdo</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={VIEWS_DATA} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="title" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="views" fill="#F97316" radius={[6, 6, 0, 0]} name="Views" />
              <Bar dataKey="likes" fill="#EC4899" radius={[6, 6, 0, 0]} name="Curtidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Articles list */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar artigos..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[#9CA3AF]" />
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCatFilter(c.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  catFilter === c.value
                    ? { backgroundColor: "#FFF0E5", color: "#F97316" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {c.label}
              </button>
            ))}
            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
              style={
                featuredOnly
                  ? { backgroundColor: "#FEF3C7", color: "#F59E0B" }
                  : { backgroundColor: "#F7F9FC", color: "#6B7280" }
              }
            >
              <Star size={11} /> Destaques
            </button>
          </div>
          <button className="flex items-center gap-1.5 bg-[#F97316] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#EA580C] transition-colors ml-auto">
            <Plus size={14} />
            Novo Artigo
          </button>
        </div>

        {/* Cards grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((tip) => {
            const catColor = tipCategoryColor(tip.category);
            const catBg = tipCategoryBg(tip.category);
            return (
              <div key={tip.id} className="border border-[#E5E7EB] rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: catBg, color: catColor }}
                  >
                    {tip.category}
                  </span>
                  {tip.featured && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#F59E0B] flex items-center gap-0.5">
                      <Star size={9} /> Destaque
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-[#1A2332] text-sm mb-1 leading-snug">{tip.title}</h4>
                <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{tip.summary}</p>
                <div className="flex items-center justify-between text-[10px] text-[#9CA3AF]">
                  <span>{formatDate(tip.date)} · {tip.readTime} min</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye size={11} /> {tip.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={11} /> {tip.likes}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 text-xs py-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F7F9FC] transition-colors">
                    Editar
                  </button>
                  <button
                    className="flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: catBg, color: catColor }}
                  >
                    Ver artigo
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12 text-[#9CA3AF]">
              <Lightbulb size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum artigo encontrado</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {MOCK_TIPS.length} artigos
        </div>
      </div>
    </div>
  );
}
