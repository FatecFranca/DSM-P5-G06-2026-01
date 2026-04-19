"use client";

import { useState } from "react";
import {
  Lightbulb, Search, Eye, Heart, Star, Plus, Clock,
  TrendingUp, BookOpen, Filter,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { MOCK_TIPS, type TipCategory } from "@/lib/mock-data";
import { tipCategoryColor, tipCategoryBg, formatDate } from "@/lib/utils";

const stats = [
  { label: "Total de Artigos", value: MOCK_TIPS.length, color: "#F97316", bg: "#FFF0E5", icon: Lightbulb },
  { label: "Em Destaque", value: MOCK_TIPS.filter((t) => t.featured).length, color: "#F59E0B", bg: "#FEF3C7", icon: Star },
  { label: "Total de Visualizações", value: MOCK_TIPS.reduce((s, t) => s + t.views, 0).toLocaleString("pt-BR"), color: "#3B8ED0", bg: "#E3F0FB", icon: Eye },
  { label: "Total de Curtidas", value: MOCK_TIPS.reduce((s, t) => s + t.likes, 0), color: "#EC4899", bg: "#FCE7F3", icon: Heart },
];

const categories: { value: "all" | TipCategory; color: string }[] = [
  { value: "all", color: "#6B7280" },
  { value: "Exercício", color: "#4CAF82" },
  { value: "Alimentação", color: "#F97316" },
  { value: "Emergência", color: "#EF4444" },
  { value: "Bem-estar", color: "#8B5CF6" },
];

const viewsData = MOCK_TIPS.map((t) => ({
  title: t.title.split(":")[0].slice(0, 18) + "…",
  views: t.views,
  likes: t.likes,
  category: t.category,
}));

export default function TipsPage() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | TipCategory>("all");
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
      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #DB2777 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Conteúdo</p>
          <h2 className="text-2xl font-bold mt-1">Dicas & Artigos</h2>
          <p className="text-white/70 text-sm mt-1">Gerencie o conteúdo educativo exibido no aplicativo</p>
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
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Featured */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Views chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Visualizações por Artigo</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">Engajamento dos artigos publicados</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={viewsData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="title" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} />
              <Bar dataKey="views" radius={[6, 6, 0, 0]} name="Visualizações">
                {viewsData.map((entry, i) => (
                  <Cell key={i} fill={tipCategoryColor(entry.category as TipCategory)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-4">Por Categoria</h3>
          <div className="space-y-3">
            {(["Exercício", "Alimentação", "Emergência", "Bem-estar"] as TipCategory[]).map((cat) => {
              const catTips = MOCK_TIPS.filter((t) => t.category === cat);
              const totalViews = catTips.reduce((s, t) => s + t.views, 0);
              const color = tipCategoryColor(cat);
              const bg = tipCategoryBg(cat);
              return (
                <div key={cat} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: bg }}>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: color + "20" }}
                  >
                    <BookOpen size={15} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A2332]">{cat}</p>
                    <p className="text-xs text-[#6B7280]">{catTips.length} artigo{catTips.length !== 1 ? "s" : ""} · {totalViews.toLocaleString("pt-BR")} views</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#FFF0E5] flex gap-2 items-start">
            <TrendingUp size={15} className="text-[#F97316] shrink-0 mt-0.5" />
            <p className="text-xs text-[#92400E]">
              <strong>"Como o exercício afeta sua glicose"</strong> é o artigo mais visualizado com 1.240 leituras.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar + Grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
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
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setCatFilter(c.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  catFilter === c.value
                    ? { backgroundColor: c.color + "20", color: c.color }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {c.value === "all" ? "Todos" : c.value}
              </button>
            ))}
            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                featuredOnly
                  ? { backgroundColor: "#FEF3C7", color: "#F59E0B" }
                  : { backgroundColor: "#F7F9FC", color: "#6B7280" }
              }
            >
              <Star size={12} />
              Destaque
            </button>
          </div>
          <button className="flex items-center gap-1.5 bg-[#F97316] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#EA580C] transition-colors ml-auto">
            <Plus size={14} />
            Novo Artigo
          </button>
        </div>

        {/* Tips grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((tip) => {
            const color = tipCategoryColor(tip.category);
            const bg = tipCategoryBg(tip.category);
            return (
              <div
                key={tip.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: bg, color }}
                  >
                    {tip.category}
                  </span>
                  {tip.featured && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-[#FEF3C7] text-[#F59E0B]">
                      <Star size={10} fill="currentColor" /> Destaque
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-[#1A2332] text-sm mb-2 leading-tight">{tip.title}</h4>
                <p className="text-xs text-[#6B7280] flex-1 mb-4 line-clamp-3">{tip.summary}</p>

                <div className="flex items-center gap-3 text-xs text-[#9CA3AF] border-t border-[#F0F2F5] pt-3">
                  <span className="flex items-center gap-1">
                    <Eye size={11} />
                    {tip.views.toLocaleString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={11} />
                    {tip.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {tip.readTime} min
                  </span>
                  <span className="ml-auto">{formatDate(tip.date)}</span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button className="flex-1 text-xs text-[#3B8ED0] border border-[#3B8ED0] rounded-lg py-1.5 hover:bg-[#E3F0FB] transition-colors font-medium">
                    Editar
                  </button>
                  <button
                    className="flex-1 text-xs rounded-lg py-1.5 font-medium transition-colors"
                    style={{ backgroundColor: color + "15", color }}
                  >
                    {tip.featured ? "Remover Destaque" : "Destacar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] py-16 text-center text-[#9CA3AF]">
            <Lightbulb size={36} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhum artigo encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
