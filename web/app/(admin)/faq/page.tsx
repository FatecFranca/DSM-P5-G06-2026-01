"use client";

import { useState, useEffect } from "react";
import {
  Search, Plus, Edit2, Trash2, X, AlertCircle, CheckCircle2,
  HelpCircle, ChevronDown, ChevronUp, Eye, EyeOff,
} from "lucide-react";
import {
  webListarFaq, webCriarFaq, webAtualizarFaq, webDeletarFaq,
  ApiFAQ, CategoriaFAQ, CATEGORIA_FAQ_LABEL, CATEGORIA_FAQ_COLOR,
} from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIAS_ORDEM: CategoriaFAQ[] = [
  "DIABETES",
  "SINTOMAS",
  "ALIMENTACAO",
  "EXERCICIOS",
  "MEDICACAO",
  "MONITORAMENTO",
];

const CATEGORIA_OPTIONS = CATEGORIAS_ORDEM.map((v) => ({
  value: v,
  label: CATEGORIA_FAQ_LABEL[v],
}));

// ─── Form types ───────────────────────────────────────────────────────────────

interface FaqForm {
  pergunta: string;
  resposta: string;
  categoria: CategoriaFAQ;
  ordem: string;
  ativo: boolean;
}

const EMPTY_FORM: FaqForm = {
  pergunta: "",
  resposta: "",
  categoria: "DIABETES",
  ordem: "0",
  ativo: true,
};

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function FaqModal({
  open,
  editing,
  onClose,
  onSave,
  loading,
}: {
  open: boolean;
  editing: ApiFAQ | null;
  onClose: () => void;
  onSave: (form: FaqForm) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<FaqForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FaqForm, string>>>({});

  useEffect(() => {
    if (open) {
      setErrors({});
      if (editing) {
        setForm({
          pergunta: editing.pergunta,
          resposta: editing.resposta,
          categoria: editing.categoria,
          ordem: String(editing.ordem),
          ativo: editing.ativo,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, editing]);

  const set = <K extends keyof FaqForm>(k: K, v: FaqForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e: Partial<Record<keyof FaqForm, string>> = {};
    if (!form.pergunta.trim()) e.pergunta = "Pergunta é obrigatória";
    if (!form.resposta.trim()) e.resposta = "Resposta é obrigatória";
    if (isNaN(Number(form.ordem)) || Number(form.ordem) < 0)
      e.ordem = "Ordem deve ser um número ≥ 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {editing ? "Editar FAQ" : "Nova Pergunta"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Pergunta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Pergunta <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.pergunta}
              onChange={(e) => set("pergunta", e.target.value)}
              rows={2}
              placeholder="Ex: O que é diabetes mellitus?"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 transition ${
                errors.pergunta
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-[#4CAF82]/30 focus:border-[#4CAF82]"
              }`}
            />
            {errors.pergunta && (
              <p className="mt-1 text-xs text-red-500">{errors.pergunta}</p>
            )}
          </div>

          {/* Resposta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Resposta <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.resposta}
              onChange={(e) => set("resposta", e.target.value)}
              rows={6}
              placeholder="Escreva a resposta completa..."
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 transition ${
                errors.resposta
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-200 focus:ring-[#4CAF82]/30 focus:border-[#4CAF82]"
              }`}
            />
            {errors.resposta && (
              <p className="mt-1 text-xs text-red-500">{errors.resposta}</p>
            )}
          </div>

          {/* Categoria + Ordem */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                value={form.categoria}
                onChange={(e) => set("categoria", e.target.value as CategoriaFAQ)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4CAF82]/30 focus:border-[#4CAF82] transition bg-white"
              >
                {CATEGORIA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Ordem
              </label>
              <input
                type="number"
                min={0}
                value={form.ordem}
                onChange={(e) => set("ordem", e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 transition ${
                  errors.ordem
                    ? "border-red-400 focus:ring-red-200"
                    : "border-gray-200 focus:ring-[#4CAF82]/30 focus:border-[#4CAF82]"
                }`}
              />
              {errors.ordem && (
                <p className="mt-1 text-xs text-red-500">{errors.ordem}</p>
              )}
            </div>
          </div>

          {/* Ativo toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("ativo", !form.ativo)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.ativo ? "bg-[#4CAF82]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.ativo ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {form.ativo ? "Visível no app" : "Oculto no app"}
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (form.pergunta.trim() && form.resposta.trim()) {
                const e2: Partial<Record<keyof FaqForm, string>> = {};
                if (!form.pergunta.trim()) e2.pergunta = "Obrigatório";
                if (!form.resposta.trim()) e2.resposta = "Obrigatório";
                if (Object.keys(e2).length === 0) onSave(form);
              } else {
                const e2: Partial<Record<keyof FaqForm, string>> = {};
                if (!form.pergunta.trim()) e2.pergunta = "Pergunta é obrigatória";
                if (!form.resposta.trim()) e2.resposta = "Resposta é obrigatória";
                setErrors(e2);
              }
            }}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
          >
            {loading ? "Salvando..." : editing ? "Salvar Alterações" : "Criar Pergunta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────

function ConfirmDeleteModal({
  open,
  faq,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  faq: ApiFAQ | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!open || !faq) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Deletar FAQ</h3>
        <p className="text-sm text-gray-500 mb-6 line-clamp-2">
          Tem certeza que deseja deletar a pergunta{" "}
          <span className="font-semibold text-gray-700">"{faq.pergunta}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 transition"
          >
            {loading ? "Deletando..." : "Deletar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FAQAdminPage() {
  const [faqs, setFaqs] = useState<ApiFAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<CategoriaFAQ | "all">("all");

  const [expanded, setExpanded] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ApiFAQ | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingFaq, setDeletingFaq] = useState<ApiFAQ | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // ── Load ──────────────────────────────────────────────────────────────────

  const carregar = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await webListarFaq(true);
      setFaqs(data);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar FAQ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────

  const addToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleSave = async (form: FaqForm) => {
    setSaving(true);
    try {
      const payload = {
        pergunta: form.pergunta.trim(),
        resposta: form.resposta.trim(),
        categoria: form.categoria,
        ordem: Number(form.ordem) || 0,
        ativo: form.ativo,
      };

      if (editingFaq) {
        const updated = await webAtualizarFaq(editingFaq.id, payload);
        setFaqs((p) => p.map((f) => (f.id === updated.id ? updated : f)));
        addToast("success", "FAQ atualizado com sucesso!");
      } else {
        const created = await webCriarFaq(payload);
        setFaqs((p) => [...p, created]);
        addToast("success", "FAQ criado com sucesso!");
      }
      setModalOpen(false);
      setEditingFaq(null);
    } catch (e: any) {
      addToast("error", e.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingFaq) return;
    setDeleting(true);
    try {
      await webDeletarFaq(deletingFaq.id);
      setFaqs((p) => p.filter((f) => f.id !== deletingFaq.id));
      addToast("success", "FAQ deletado com sucesso!");
      setDeleteOpen(false);
      setDeletingFaq(null);
    } catch (e: any) {
      addToast("error", e.message ?? "Erro ao deletar");
    } finally {
      setDeleting(false);
    }
  };

  const toggleAtivo = async (faq: ApiFAQ) => {
    try {
      const updated = await webAtualizarFaq(faq.id, { ativo: !faq.ativo });
      setFaqs((p) => p.map((f) => (f.id === updated.id ? updated : f)));
      addToast("success", updated.ativo ? "FAQ ativado!" : "FAQ ocultado!");
    } catch (e: any) {
      addToast("error", e.message ?? "Erro");
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const total = faqs.length;
  const ativos = faqs.filter((f) => f.ativo).length;
  const inativos = total - ativos;
  const catCounts = CATEGORIAS_ORDEM.map((cat) => ({
    cat,
    count: faqs.filter((f) => f.categoria === cat).length,
  }));

  // ── Filter ────────────────────────────────────────────────────────────────

  const filtered = faqs.filter((f) => {
    const matchSearch =
      !search ||
      f.pergunta.toLowerCase().includes(search.toLowerCase()) ||
      f.resposta.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || f.categoria === filterCat;
    return matchSearch && matchCat;
  });

  // Group filtered by category
  const grouped = CATEGORIAS_ORDEM.map((cat) => ({
    cat,
    items: filtered.filter((f) => f.categoria === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto transition-all ${
              t.type === "success"
                ? "bg-white border border-green-200 text-green-700"
                : "bg-white border border-red-200 text-red-600"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 size={16} className="text-green-500 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-500 shrink-0" />
            )}
            {t.message}
          </div>
        ))}
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Perguntas frequentes exibidas no app
          </p>
        </div>
        <button
          onClick={() => { setEditingFaq(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-sm hover:shadow-md active:scale-95"
          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
        >
          <Plus size={16} />
          Nova Pergunta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: total, color: "#4CAF82" },
          { label: "Ativos", value: ativos, color: "#3B8ED0" },
          { label: "Ocultos", value: inativos, color: "#9CA3AF" },
          { label: "Categorias", value: catCounts.filter((c) => c.count > 0).length, color: "#8B5CF6" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-bold" style={{ color: s.color }}>
              {loading ? "–" : s.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar pergunta ou resposta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4CAF82]/30 focus:border-[#4CAF82] transition"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value as CategoriaFAQ | "all")}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4CAF82]/30 focus:border-[#4CAF82] transition bg-white min-w-[180px]"
        >
          <option value="all">Todas as categorias</option>
          {CATEGORIA_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-[#4CAF82]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={carregar}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition"
          >
            Tentar novamente
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <HelpCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma pergunta encontrada.</p>
          <button
            onClick={() => { setEditingFaq(null); setModalOpen(true); }}
            className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
          >
            Criar primeira pergunta
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ cat, items }) => (
            <div key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Category header */}
              <div
                className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100"
                style={{ borderLeftWidth: 4, borderLeftColor: CATEGORIA_FAQ_COLOR[cat] }}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORIA_FAQ_COLOR[cat] }}
                />
                <h3 className="font-bold text-gray-900 flex-1 text-sm">
                  {CATEGORIA_FAQ_LABEL[cat]}
                </h3>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: CATEGORIA_FAQ_COLOR[cat] + "18",
                    color: CATEGORIA_FAQ_COLOR[cat],
                  }}
                >
                  {items.length} {items.length === 1 ? "item" : "itens"}
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-50">
                {items.map((faq) => (
                  <div key={faq.id} className={`transition-colors ${!faq.ativo ? "bg-gray-50/60" : ""}`}>
                    <div className="flex items-start gap-3 px-5 py-4">
                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpanded((p) => (p === faq.id ? null : faq.id))}
                        className="mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                      >
                        {expanded === faq.id ? (
                          <ChevronUp size={16} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-500" />
                        )}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 flex-wrap">
                          <p className={`text-sm font-semibold flex-1 min-w-0 ${!faq.ativo ? "text-gray-400" : "text-gray-900"}`}>
                            {faq.pergunta}
                          </p>
                          {!faq.ativo && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 shrink-0">
                              OCULTO
                            </span>
                          )}
                          {faq.ordem > 0 && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 shrink-0">
                              #{faq.ordem}
                            </span>
                          )}
                        </div>

                        {expanded === faq.id && (
                          <p className="text-sm text-gray-500 mt-2 leading-relaxed whitespace-pre-wrap">
                            {faq.resposta}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleAtivo(faq)}
                          title={faq.ativo ? "Ocultar" : "Ativar"}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                            faq.ativo
                              ? "hover:bg-amber-50 text-amber-400 hover:text-amber-500"
                              : "hover:bg-green-50 text-gray-300 hover:text-green-500"
                          }`}
                        >
                          {faq.ativo ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          onClick={() => { setEditingFaq(faq); setModalOpen(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => { setDeletingFaq(faq); setDeleteOpen(true); }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Deletar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <FaqModal
        open={modalOpen}
        editing={editingFaq}
        onClose={() => { setModalOpen(false); setEditingFaq(null); }}
        onSave={handleSave}
        loading={saving}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        faq={deletingFaq}
        onClose={() => { setDeleteOpen(false); setDeletingFaq(null); }}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
