"use client";

import { useState, useEffect } from "react";
import {
  Search, Lightbulb, Eye, Heart, Star, Filter, Plus, Edit2, Trash2,
  X, AlertCircle, CheckCircle2,
} from "lucide-react";
import {
  webListarDicas, webCriarDica, webAtualizarDica, webDeletarDica,
  ApiDica, CATEGORIA_LABEL, LABEL_CATEGORIA,
} from "@/lib/api";
import { tipCategoryColor, tipCategoryBg, formatDate } from "@/lib/utils";
import type { TipCategory } from "@/lib/mock-data";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type CategoriaApi = ApiDica["categoria"];

const CATEGORIAS: { value: CategoriaApi | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "EXERCICIO", label: "🏃 Exercício" },
  { value: "ALIMENTACAO", label: "🥦 Alimentação" },
  { value: "EMERGENCIA", label: "🚨 Emergência" },
  { value: "BEM_ESTAR", label: "🧘 Bem-estar" },
];

const CAT_PIE_COLORS: Record<string, string> = {
  EXERCICIO: "#4CAF82",
  ALIMENTACAO: "#F97316",
  EMERGENCIA: "#EF4444",
  BEM_ESTAR: "#8B5CF6",
};

interface DicaForm {
  titulo: string;
  sumario: string;
  conteudo: string;
  categoria: CategoriaApi;
  tempoLeitura: string;
  destaque: boolean;
}

const EMPTY_FORM: DicaForm = {
  titulo: "",
  sumario: "",
  conteudo: "",
  categoria: "EXERCICIO",
  tempoLeitura: "3",
  destaque: false,
};

// ─── Modal ────────────────────────────────────────────────────────────────────

function DicaModal({
  open,
  form,
  onClose,
  onSave,
  saving,
  editingId,
}: {
  open: boolean;
  form: DicaForm;
  onClose: () => void;
  onSave: (f: DicaForm) => void;
  saving: boolean;
  editingId: string | null;
}) {
  const [local, setLocal] = useState<DicaForm>(form);
  useEffect(() => { setLocal(form); }, [form]);

  if (!open) return null;

  const set = (key: keyof DicaForm, value: unknown) =>
    setLocal((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F5]">
          <h3 className="font-bold text-[#1A2332] text-lg">
            {editingId ? "Editar Artigo" : "Novo Artigo"}
          </h3>
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Título */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Título *</label>
            <input
              value={local.titulo}
              onChange={(e) => set("titulo", e.target.value)}
              placeholder="Título do artigo"
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
            />
          </div>

          {/* Sumário */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Resumo *</label>
            <textarea
              value={local.sumario}
              onChange={(e) => set("sumario", e.target.value)}
              placeholder="Breve descrição do artigo"
              rows={2}
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 resize-none"
            />
          </div>

          {/* Conteúdo */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">
              Conteúdo * <span className="font-normal text-[#9CA3AF]">(suporta Markdown)</span>
            </label>
            <textarea
              value={local.conteudo}
              onChange={(e) => set("conteudo", e.target.value)}
              placeholder={"## Título da seção\n\nTexto do artigo...\n\n• Item da lista"}
              rows={8}
              className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 resize-none font-mono"
            />
          </div>

          {/* Row: categoria + tempo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Categoria *</label>
              <select
                value={local.categoria}
                onChange={(e) => set("categoria", e.target.value as CategoriaApi)}
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#F97316] bg-white"
              >
                <option value="EXERCICIO">🏃 Exercício</option>
                <option value="ALIMENTACAO">🥦 Alimentação</option>
                <option value="EMERGENCIA">🚨 Emergência</option>
                <option value="BEM_ESTAR">🧘 Bem-estar</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] mb-1.5 block">Tempo de leitura (min) *</label>
              <input
                type="number"
                min="1"
                max="60"
                value={local.tempoLeitura}
                onChange={(e) => set("tempoLeitura", e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#1A2332] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
              />
            </div>
          </div>

          {/* Destaque */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set("destaque", !local.destaque)}
              className="relative w-10 h-5 rounded-full transition-colors"
              style={{ backgroundColor: local.destaque ? "#F97316" : "#D1D5DB" }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform"
                style={{ transform: local.destaque ? "translateX(20px)" : "translateX(2px)" }}
              />
            </div>
            <span className="text-sm font-medium text-[#1A2332]">Artigo em destaque</span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F2F5] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-medium text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F7F9FC] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(local)}
            disabled={saving || !local.titulo.trim() || !local.sumario.trim() || !local.conteudo.trim()}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
            style={{ backgroundColor: "#F97316" }}
          >
            {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar artigo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────

function ConfirmDeleteModal({
  open, titulo, onConfirm, onCancel, deleting,
}: { open: boolean; titulo: string; onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-[#EF4444]" />
        </div>
        <h3 className="font-bold text-[#1A2332] text-center mb-2">Excluir artigo</h3>
        <p className="text-sm text-[#6B7280] text-center mb-6">
          Tem certeza que deseja excluir <strong>&quot;{titulo}&quot;</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F7F9FC] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-60 transition-colors"
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TipsPage() {
  const [dicas, setDicas] = useState<ApiDica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<CategoriaApi | "all">("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DicaForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<ApiDica | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDicas = async () => {
    try {
      const result = await webListarDicas(1, 200);
      setDicas(result.dados);
    } catch (err: any) {
      setError(err?.message ?? "Erro ao carregar artigos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDicas(); }, []);

  const filtered = dicas.filter((t) => {
    const matchSearch =
      t.titulo.toLowerCase().includes(search.toLowerCase()) ||
      t.sumario.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || t.categoria === catFilter;
    const matchFeatured = !featuredOnly || t.destaque;
    return matchSearch && matchCat && matchFeatured;
  });

  // ─── CRUD handlers ─────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (dica: ApiDica) => {
    setEditingId(dica.id);
    setForm({
      titulo: dica.titulo,
      sumario: dica.sumario,
      conteudo: dica.conteudo,
      categoria: dica.categoria,
      tempoLeitura: String(dica.tempoLeitura),
      destaque: dica.destaque,
    });
    setModalOpen(true);
  };

  const handleSave = async (f: DicaForm) => {
    setSaving(true);
    try {
      const payload = {
        titulo: f.titulo.trim(),
        sumario: f.sumario.trim(),
        conteudo: f.conteudo.trim(),
        categoria: f.categoria,
        tempoLeitura: Math.max(1, Number(f.tempoLeitura) || 3),
        destaque: f.destaque,
      };
      if (editingId) {
        const updated = await webAtualizarDica(editingId, payload);
        setDicas((prev) => prev.map((d) => d.id === editingId ? updated : d));
        showToast("success", "Artigo atualizado com sucesso!");
      } else {
        const created = await webCriarDica(payload);
        setDicas((prev) => [created, ...prev]);
        showToast("success", "Artigo criado com sucesso!");
      }
      setModalOpen(false);
    } catch (err: any) {
      showToast("error", err?.message ?? "Erro ao salvar artigo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await webDeletarDica(deleteTarget.id);
      setDicas((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      showToast("success", "Artigo excluído!");
    } catch (err: any) {
      showToast("error", err?.message ?? "Erro ao excluir");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── Charts data ───────────────────────────────────────────────────────────

  const viewsData = dicas.slice(0, 6).map((t) => ({
    title: t.titulo.slice(0, 18) + "…",
    leituras: t.tempoLeitura * 100 + Math.floor(Math.random() * 200), // approximation
  }));

  const catDist = Object.entries(
    dicas.reduce((acc, d) => {
      acc[d.categoria] = (acc[d.categoria] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([cat, value]) => ({
    name: CATEGORIA_LABEL[cat] ?? cat,
    value,
    color: CAT_PIE_COLORS[cat] ?? "#9CA3AF",
  }));

  const stats = [
    { label: "Total de Artigos", value: dicas.length, color: "#F97316", bg: "#FFF0E5" },
    { label: "Em Destaque", value: dicas.filter((t) => t.destaque).length, color: "#F59E0B", bg: "#FEF3C7" },
    { label: "Exercício", value: dicas.filter((t) => t.categoria === "EXERCICIO").length, color: "#4CAF82", bg: "#E8F5EE" },
    { label: "Alimentação", value: dicas.filter((t) => t.categoria === "ALIMENTACAO").length, color: "#F97316", bg: "#FFF0E5" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-[#F97316]" fill="none" viewBox="0 0 24 24">
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
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-medium"
          style={{ backgroundColor: toast.type === "success" ? "#4CAF82" : "#EF4444" }}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      <DicaModal
        open={modalOpen}
        form={form}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
        editingId={editingId}
      />
      <ConfirmDeleteModal
        open={!!deleteTarget}
        titulo={deleteTarget?.titulo ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />

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
      {dicas.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Category pie */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="font-bold text-[#1A2332] mb-1">Por Categoria</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">Distribuição de artigos</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={catDist} cx="50%" cy="50%" outerRadius={70} paddingAngle={3} dataKey="value">
                  {catDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} artigos`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {catDist.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="truncate">{d.name}</span>
                  <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Read time chart */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="font-bold text-[#1A2332] mb-1">Tempo de Leitura por Artigo</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">Minutos estimados</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={dicas.slice(0, 8).map((t) => ({ title: t.titulo.slice(0, 16) + "…", min: t.tempoLeitura }))}
                margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="title" tick={{ fontSize: 9, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="min" fill="#F97316" radius={[6, 6, 0, 0]} name="min" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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
            {CATEGORIAS.map((c) => (
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
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-[#F97316] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#EA580C] transition-colors ml-auto"
          >
            <Plus size={14} />
            Novo Artigo
          </button>
        </div>

        {/* Cards grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((tip) => {
            const catLabel = CATEGORIA_LABEL[tip.categoria] ?? tip.categoria;
            const catColor = tipCategoryColor(catLabel as TipCategory) ?? "#9CA3AF";
            const catBg = tipCategoryBg(catLabel as TipCategory) ?? "#F3F4F6";
            return (
              <div key={tip.id} className="border border-[#E5E7EB] rounded-2xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: catBg, color: catColor }}
                  >
                    {catLabel}
                  </span>
                  {tip.destaque && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#F59E0B] flex items-center gap-0.5">
                      <Star size={9} /> Destaque
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-[#1A2332] text-sm mb-1 leading-snug">{tip.titulo}</h4>
                <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{tip.sumario}</p>
                <div className="flex items-center justify-between text-[10px] text-[#9CA3AF] mb-3">
                  <span>{formatDate(tip.criadoEm.split("T")[0])} · {tip.tempoLeitura} min</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(tip)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F7F9FC] transition-colors"
                  >
                    <Edit2 size={11} /> Editar
                  </button>
                  <button
                    onClick={() => setDeleteTarget(tip)}
                    className="flex items-center justify-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-[#FEE2E2] text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                  >
                    <Trash2 size={11} />
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
          {filtered.length} de {dicas.length} artigos
        </div>
      </div>
    </div>
  );
}
