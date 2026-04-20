"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Target, CheckCircle2, Clock, TrendingUp, Filter, Plus, User,
  Droplets, Dumbbell, Moon, Footprints, Scale, Activity, Loader2, Trash2,
} from "lucide-react";
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";
import { goalCategoryIcon, progressPercent, formatDate, getInitials } from "@/lib/utils";
import {
  webListarMetas, webCriarMeta, webAtualizarMeta, webDeletarMeta,
  type ApiMeta, type CategoriaMeta,
} from "@/lib/api";

// ─── Types / constants ────────────────────────────────────────────────────────

type GoalCategory = 'glucose' | 'weight' | 'exercise' | 'water' | 'sleep' | 'steps';

const DB_TO_UI: Record<CategoriaMeta, GoalCategory> = {
  GLICOSE:  'glucose',
  PESO:     'weight',
  EXERCICIO:'exercise',
  AGUA:     'water',
  SONO:     'sleep',
  PASSOS:   'steps',
};

const UI_TO_DB: Record<GoalCategory, CategoriaMeta> = {
  glucose:  'GLICOSE',
  weight:   'PESO',
  exercise: 'EXERCICIO',
  water:    'AGUA',
  sleep:    'SONO',
  steps:    'PASSOS',
};

interface GoalView {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: GoalCategory;
  deadline: string;
  completed: boolean;
  color: string;
}

function apiMetaToView(m: ApiMeta): GoalView {
  return {
    id: m.id,
    userId: m.usuarioId,
    userName: m.usuario?.nome ?? '—',
    title: m.titulo,
    description: m.descricao,
    target: m.alvo,
    current: m.atual,
    unit: m.unidade,
    category: DB_TO_UI[m.categoria] ?? 'glucose',
    deadline: m.prazo,
    completed: m.concluida,
    color: m.cor,
  };
}

const categoryFilters: { value: "all" | GoalCategory; label: string; emoji: string }[] = [
  { value: "all", label: "Todas", emoji: "📋" },
  { value: "glucose", label: "Glicose", emoji: "🩸" },
  { value: "weight", label: "Peso", emoji: "⚖️" },
  { value: "exercise", label: "Exercício", emoji: "🏃" },
  { value: "water", label: "Água", emoji: "💧" },
  { value: "sleep", label: "Sono", emoji: "😴" },
  { value: "steps", label: "Passos", emoji: "👣" },
];

const categoryIconMap: Record<GoalCategory, React.ElementType> = {
  glucose: Activity,
  weight: Scale,
  exercise: Dumbbell,
  water: Droplets,
  sleep: Moon,
  steps: Footprints,
};

// ─── Modal: Nova Meta ─────────────────────────────────────────────────────────

interface NewGoalForm {
  titulo: string;
  descricao: string;
  alvo: string;
  atual: string;
  unidade: string;
  categoria: CategoriaMeta;
  prazo: string;
  cor: string;
}

const DEFAULT_FORM: NewGoalForm = {
  titulo: '', descricao: '', alvo: '', atual: '0',
  unidade: '', categoria: 'GLICOSE', prazo: '', cor: '#4CAF82',
};

function NewGoalModal({ onClose, onCreated }: { onClose: () => void; onCreated: (m: ApiMeta) => void }) {
  const [form, setForm] = useState<NewGoalForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof NewGoalForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const meta = await webCriarMeta({
        titulo: form.titulo,
        descricao: form.descricao,
        alvo: Number(form.alvo),
        atual: Number(form.atual),
        unidade: form.unidade,
        categoria: form.categoria,
        prazo: form.prazo,
        cor: form.cor,
      });
      onCreated(meta);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar meta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-[#1A2332] mb-4">Nova Meta</h2>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
            placeholder="Título *"
            value={form.titulo}
            onChange={set('titulo')}
            required
          />
          <textarea
            className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] resize-none"
            placeholder="Descrição"
            rows={2}
            value={form.descricao}
            onChange={set('descricao')}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              placeholder="Alvo *"
              value={form.alvo}
              onChange={set('alvo')}
              required
              min={0}
              step="any"
            />
            <input
              type="number"
              className="border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              placeholder="Atual"
              value={form.atual}
              onChange={set('atual')}
              min={0}
              step="any"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              placeholder="Unidade *"
              value={form.unidade}
              onChange={set('unidade')}
              required
            />
            <select
              className="border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F97316] bg-white"
              value={form.categoria}
              onChange={set('categoria')}
            >
              <option value="GLICOSE">🩸 Glicose</option>
              <option value="PESO">⚖️ Peso</option>
              <option value="EXERCICIO">🏃 Exercício</option>
              <option value="AGUA">💧 Água</option>
              <option value="SONO">😴 Sono</option>
              <option value="PASSOS">👣 Passos</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              className="border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F97316]"
              value={form.prazo}
              onChange={set('prazo')}
              required
            />
            <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-3 py-2">
              <label className="text-xs text-[#9CA3AF]">Cor</label>
              <input
                type="color"
                className="w-8 h-6 rounded cursor-pointer border-0 bg-transparent"
                value={form.cor}
                onChange={set('cor')}
              />
              <span className="text-xs text-[#6B7280]">{form.cor}</span>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-[#E5E7EB] text-sm text-[#6B7280] hover:bg-[#F7F9FC]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 rounded-xl bg-[#F97316] text-white text-sm font-semibold hover:bg-[#EA580C] disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Criar Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const [goals, setGoals] = useState<GoalView[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<"all" | GoalCategory>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "active">("all");
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await webListarMetas(1, 100);
      setGoals(res.dados.map(apiMetaToView));
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCreated = (m: ApiMeta) => {
    setGoals(prev => [apiMetaToView(m), ...prev]);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await webDeletarMeta(id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleConcluida = async (goal: GoalView) => {
    try {
      const atualizada = await webAtualizarMeta(goal.id, { concluida: !goal.completed });
      setGoals(prev => prev.map(g => g.id === goal.id ? apiMetaToView(atualizada) : g));
    } catch { /* ignore */ }
  };

  const filtered = goals.filter((g) => {
    const matchCat = categoryFilter === "all" || g.category === categoryFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" ? g.completed : !g.completed);
    return matchCat && matchStatus;
  });

  const total = goals.length;
  const completed = goals.filter(g => g.completed).length;
  const inProgress = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: "Total de Metas", value: total, color: "#F97316", bg: "#FFF0E5", icon: Target },
    { label: "Concluídas", value: completed, color: "#4CAF82", bg: "#E8F5EE", icon: CheckCircle2 },
    { label: "Em Andamento", value: inProgress, color: "#3B8ED0", bg: "#E3F0FB", icon: Clock },
    { label: "Taxa de Conclusão", value: `${completionRate}%`, color: "#8B5CF6", bg: "#EDE9FE", icon: TrendingUp },
  ];

  const progressByCategory = (["glucose", "weight", "exercise", "water", "sleep", "steps"] as GoalCategory[]).map((cat) => {
    const catGoals = goals.filter((g) => g.category === cat);
    if (catGoals.length === 0) return null;
    const avg = Math.round(catGoals.reduce((sum, g) => sum + progressPercent(g.current, g.target), 0) / catGoals.length);
    return { category: cat, progress: avg, emoji: goalCategoryIcon(cat) };
  }).filter(Boolean) as { category: GoalCategory; progress: number; emoji: string }[];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {showModal && <NewGoalModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      {/* Header */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Gestão</p>
          <h2 className="text-2xl font-bold mt-1">Metas dos Pacientes</h2>
          <p className="text-white/70 text-sm mt-1">Acompanhe o progresso e conquistas dos pacientes</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
          <Target size={120} strokeWidth={1} />
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

      {/* Charts */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="font-bold text-[#1A2332] mb-1">Progresso Médio por Categoria</h3>
            <p className="text-xs text-[#9CA3AF] mb-4">% de conclusão média</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={progressByCategory} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => goalCategoryIcon(v)} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v}%`, "Progresso"]} labelFormatter={(l) => goalCategoryIcon(l) + " " + l} />
                <Bar dataKey="progress" radius={[6, 6, 0, 0]} name="Progresso">
                  {progressByCategory.map((entry, i) => (
                    <Cell key={i} fill={entry.progress >= 80 ? "#4CAF82" : entry.progress >= 50 ? "#F97316" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
            <h3 className="font-bold text-[#1A2332] mb-1">Visão Geral</h3>
            <p className="text-xs text-[#9CA3AF] mb-3">Todas as metas combinadas</p>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={140}>
                <RadialBarChart cx="50%" cy="50%" innerRadius={35} outerRadius={60}
                  data={[{ name: "Concluídas", value: completionRate, fill: "#4CAF82" }]}
                  startAngle={90} endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#F0F2F5" }} />
                  <Tooltip formatter={(v) => [`${v}%`, "Conclusão"]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-3xl font-bold text-[#1A2332] -mt-12">{completionRate}%</p>
              <p className="text-xs text-[#9CA3AF] mt-8">metas concluídas</p>
            </div>
            <div className="mt-4 space-y-2">
              {progressByCategory.slice(0, 4).map((pc) => {
                const Icon = categoryIconMap[pc.category];
                return (
                  <div key={pc.category} className="flex items-center gap-2">
                    <Icon size={14} className="text-[#9CA3AF]" />
                    <div className="flex-1">
                      <div className="w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pc.progress}%`, backgroundColor: pc.progress >= 80 ? "#4CAF82" : pc.progress >= 50 ? "#F97316" : "#EF4444" }} />
                      </div>
                    </div>
                    <span className="text-xs text-[#6B7280] w-8 text-right">{pc.progress}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters + Goals Grid */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[#9CA3AF]" />
            {categoryFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setCategoryFilter(f.value)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={categoryFilter === f.value ? { backgroundColor: "#FFF0E5", color: "#F97316" } : { backgroundColor: "#F7F9FC", color: "#6B7280" }}
              >
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            {(["all", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={statusFilter === f ? { backgroundColor: "#E8F5EE", color: "#4CAF82" } : { backgroundColor: "#F7F9FC", color: "#6B7280" }}
              >
                {{ all: "Todas", active: "Em andamento", completed: "Concluídas" }[f]}
              </button>
            ))}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-[#F97316] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#EA580C] transition-colors"
            >
              <Plus size={14} />
              Nova Meta
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] py-16 flex flex-col items-center gap-3 text-[#9CA3AF]">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-sm">Carregando metas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((goal) => {
              const Icon = categoryIconMap[goal.category];
              const progress = progressPercent(goal.current, goal.target);
              const progressColor = goal.completed ? "#4CAF82" : progress >= 70 ? "#F97316" : progress >= 40 ? "#F59E0B" : "#EF4444";
              const isOverdue = !goal.completed && new Date(goal.deadline) < new Date();

              return (
                <div key={goal.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: goal.color + "20" }}>
                        <Icon size={20} style={{ color: goal.color }} />
                      </div>
                      <div>
                        <p className="font-bold text-[#1A2332] text-sm">{goal.title}</p>
                        <span className="text-[10px] text-[#9CA3AF]">{goalCategoryIcon(goal.category)} {goal.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {goal.completed ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-[#D1FAE5] text-[#10B981]">
                          <CheckCircle2 size={10} /> Concluída
                        </span>
                      ) : isOverdue ? (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#FEE2E2] text-[#EF4444]">Atrasada</span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-[#FFF0E5] text-[#F97316]">Em andamento</span>
                      )}
                      <button
                        onClick={() => handleDelete(goal.id)}
                        disabled={deleting === goal.id}
                        className="p-1 rounded-lg hover:bg-[#FEE2E2] transition-colors"
                        title="Remover meta"
                      >
                        {deleting === goal.id
                          ? <Loader2 size={13} className="animate-spin text-[#EF4444]" />
                          : <Trash2 size={13} className="text-[#9CA3AF] hover:text-[#EF4444]" />
                        }
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#6B7280] mb-3 line-clamp-2">{goal.description}</p>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#9CA3AF]">Progresso</span>
                      <span className="font-semibold" style={{ color: progressColor }}>
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: progressColor }} />
                    </div>
                    <p className="text-right text-xs mt-0.5 font-bold" style={{ color: progressColor }}>{progress}%</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#9CA3AF]">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {goal.userName.split(" ")[0]}
                    </span>
                    <button
                      onClick={() => handleToggleConcluida(goal)}
                      className="text-[10px] underline hover:text-[#4CAF82]"
                    >
                      {goal.completed ? 'Reabrir' : 'Marcar concluída'}
                    </button>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      Prazo: {formatDate(goal.deadline)}
                    </span>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="md:col-span-2 xl:col-span-3 bg-white rounded-2xl border border-[#E5E7EB] py-16 text-center text-[#9CA3AF]">
                <Target size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhuma meta encontrada</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
