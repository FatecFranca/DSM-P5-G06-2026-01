"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Dumbbell, Clock, Flame, TrendingUp, Search, Users,
  Plus, X, Pencil, Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  webListarTodosExercicios, webCriarExercicio, webAtualizarExercicio, webDeletarExercicio,
  webListarUsuarios,
  ApiExercicio, IntensidadeApi,
  INTENSIDADE_LABEL, INTENSIDADE_COLOR, INTENSIDADE_BG,
  ApiUsuario,
} from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const INTENSIDADES: IntensidadeApi[] = ["LEVE", "MODERADA", "INTENSA"];

const TIPOS_EXERCICIO = [
  "Corrida", "Caminhada", "Ciclismo", "Natação", "Musculação",
  "Yoga", "Pilates", "Futebol", "Basquete", "Vôlei",
  "Dança", "Funcional", "Elíptico", "Remo", "Outro",
];

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExerciseRow {
  id: string;
  usuarioId: string;
  userName: string;
  tipo: string;
  duracao: number;
  calorias?: number | null;
  data: string;
  hora: string;
  intensidade: IntensidadeApi;
  notas?: string | null;
}

type FilterKey = "all" | IntensidadeApi;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapExercicio(e: ApiExercicio): ExerciseRow {
  return {
    id: e.id,
    usuarioId: e.usuarioId,
    userName: e.usuario?.nome ?? `Usuário ${e.usuarioId.slice(0, 6)}`,
    tipo: e.tipo,
    duracao: e.duracao,
    calorias: e.calorias,
    data: e.data,
    hora: e.hora,
    intensidade: e.intensidade,
    notas: e.notas,
  };
}

function buildWeeklyChart(rows: ExerciseRow[]) {
  const uniqueDates = Array.from(new Set(rows.map(r => r.data))).sort().slice(-7);
  return uniqueDates.map(date => {
    const day = rows.filter(r => r.data === date);
    const totalMin = day.reduce((s, r) => s + r.duracao, 0);
    const totalCal = day.reduce((s, r) => s + (r.calorias ?? 0), 0);
    const counts = day.reduce<Record<string, number>>((acc, r) => {
      acc[r.intensidade] = (acc[r.intensidade] ?? 0) + 1;
      return acc;
    }, {});
    const dominante = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "MODERADA") as IntensidadeApi;
    const dayOfWeek = new Date(date + "T12:00:00").getDay();
    return { day: DAY_LABELS[dayOfWeek], totalMin, totalCal, intensidade: dominante };
  });
}

function buildIntensityDist(rows: ExerciseRow[]) {
  return INTENSIDADES.map(i => ({
    name: INTENSIDADE_LABEL[i],
    value: rows.filter(r => r.intensidade === i).length,
    color: INTENSIDADE_COLOR[i],
  }));
}

function totalMinutes(rows: ExerciseRow[]) {
  return rows.reduce((s, r) => s + r.duracao, 0);
}

function totalCalories(rows: ExerciseRow[]) {
  return rows.reduce((s, r) => s + (r.calorias ?? 0), 0);
}

// ─── Create/Edit Dialog ───────────────────────────────────────────────────────

interface DialogProps {
  editing: ExerciseRow | null;
  users: ApiUsuario[];
  onClose: () => void;
  onSaved: (row: ExerciseRow) => void;
}

function ExerciseDialog({ editing, users, onClose, onSaved }: DialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [tipo, setTipo] = useState(editing?.tipo ?? "");
  const [tipoCustom, setTipoCustom] = useState(!TIPOS_EXERCICIO.includes(editing?.tipo ?? "") ? (editing?.tipo ?? "") : "");
  const [duracao, setDuracao] = useState(String(editing?.duracao ?? ""));
  const [calorias, setCalorias] = useState(String(editing?.calorias ?? ""));
  const [data, setData] = useState(editing?.data ?? today);
  const [hora, setHora] = useState(editing?.hora ?? nowTime);
  const [intensidade, setIntensidade] = useState<IntensidadeApi>(editing?.intensidade ?? "MODERADA");
  const [notas, setNotas] = useState(editing?.notas ?? "");
  const [usuarioId, setUsuarioId] = useState(editing?.usuarioId ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tipoFinal = tipo === "Outro" ? tipoCustom : tipo;

  async function handleSave() {
    if (!tipoFinal.trim()) return setErr("Informe o tipo de exercício.");
    const dur = parseInt(duracao);
    if (!dur || dur <= 0) return setErr("Duração inválida.");

    setSaving(true);
    setErr(null);
    try {
      const payload = {
        tipo: tipoFinal.trim(),
        duracao: dur,
        calorias: calorias ? parseInt(calorias) : undefined,
        data,
        hora,
        intensidade,
        notas: notas.trim() || undefined,
      };

      if (editing) {
        const updated = await webAtualizarExercicio(editing.id, payload);
        onSaved(mapExercicio({ ...updated, usuario: { id: editing.usuarioId, nome: editing.userName, email: "" } }));
      } else {
        if (!usuarioId) return setErr("Selecione um usuário.");
        const created = await webCriarExercicio(payload);
        const user = users.find(u => u.id === usuarioId);
        onSaved(mapExercicio({ ...created, usuario: { id: usuarioId, nome: user?.nome ?? usuarioId, email: user?.email ?? "" } }));
      }
      onClose();
    } catch (e: any) {
      setErr(e.message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
              <Dumbbell size={18} color="#8B5CF6" />
            </div>
            <h2 className="font-bold text-[#1A2332]">
              {editing ? "Editar Exercício" : "Novo Exercício"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#F3F4F6] flex items-center justify-center transition-colors">
            <X size={16} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {err && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {err}
            </div>
          )}

          {/* Usuário (create only) */}
          {!editing && (
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Paciente</label>
              <select
                value={usuarioId}
                onChange={e => setUsuarioId(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] bg-white outline-none focus:border-[#8B5CF6]"
              >
                <option value="">Selecione um paciente...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Tipo de exercício</label>
            <select
              value={TIPOS_EXERCICIO.includes(tipo) ? tipo : (tipo ? "Outro" : "")}
              onChange={e => { setTipo(e.target.value); if (e.target.value !== "Outro") setTipoCustom(""); }}
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] bg-white outline-none focus:border-[#8B5CF6]"
            >
              <option value="">Selecione...</option>
              {TIPOS_EXERCICIO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {(tipo === "Outro" || (!TIPOS_EXERCICIO.includes(tipo) && tipo)) && (
              <input
                type="text"
                placeholder="Descreva o tipo de exercício"
                value={tipoCustom}
                onChange={e => setTipoCustom(e.target.value)}
                className="mt-2 w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] outline-none focus:border-[#8B5CF6]"
              />
            )}
          </div>

          {/* Intensidade */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Intensidade</label>
            <div className="flex gap-2">
              {INTENSIDADES.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIntensidade(i)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all"
                  style={
                    intensidade === i
                      ? { background: INTENSIDADE_BG[i], borderColor: INTENSIDADE_COLOR[i], color: INTENSIDADE_COLOR[i] }
                      : { background: "#F7F9FC", borderColor: "#E5E7EB", color: "#9CA3AF" }
                  }
                >
                  {INTENSIDADE_LABEL[i]}
                </button>
              ))}
            </div>
          </div>

          {/* Duração + Calorias */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Duração (min)</label>
              <input
                type="number"
                min={1}
                value={duracao}
                onChange={e => setDuracao(e.target.value)}
                placeholder="Ex: 45"
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Calorias (kcal)</label>
              <input
                type="number"
                min={0}
                value={calorias}
                onChange={e => setCalorias(e.target.value)}
                placeholder="Opcional"
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          {/* Data + Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Data</label>
              <input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Hora</label>
              <input
                type="time"
                value={hora}
                onChange={e => setHora(e.target.value)}
                className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-[#6B7280] mb-1.5 uppercase tracking-wide">Observações</label>
            <textarea
              rows={3}
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Observações sobre o treino (opcional)"
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] resize-none outline-none focus:border-[#8B5CF6]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#F0F2F5] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}
          >
            {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar exercício"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const [rows, setRows] = useState<ExerciseRow[]>([]);
  const [users, setUsers] = useState<ApiUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [intensityFilter, setIntensityFilter] = useState<FilterKey>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExerciseRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      webListarTodosExercicios(1, 500),
      webListarUsuarios(1, 500),
    ])
      .then(([ex, us]) => {
        setRows(ex.dados.map(mapExercicio));
        setUsers(us.dados);
      })
      .catch(() => setError("Não foi possível carregar os exercícios."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const matchesIntensity = intensityFilter === "all" || r.intensidade === intensityFilter;
      const term = search.toLowerCase();
      const matchesSearch =
        !term ||
        r.tipo.toLowerCase().includes(term) ||
        r.userName.toLowerCase().includes(term) ||
        r.data.includes(term) ||
        INTENSIDADE_LABEL[r.intensidade].toLowerCase().includes(term) ||
        (r.notas ?? "").toLowerCase().includes(term);
      return matchesIntensity && matchesSearch;
    });
  }, [search, intensityFilter, rows]);

  const totalMin = totalMinutes(rows);
  const totalCal = totalCalories(rows);
  const avgDuration = rows.length > 0 ? Math.round(totalMin / rows.length) : 0;

  const weeklyData = useMemo(() => buildWeeklyChart(rows), [rows]);
  const intensityDist = useMemo(() => buildIntensityDist(rows), [rows]);

  function handleSaved(row: ExerciseRow) {
    setRows(prev => {
      const idx = prev.findIndex(r => r.id === row.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = row;
        return next;
      }
      return [row, ...prev];
    });
  }

  async function handleDelete(id: string) {
    const prev = [...rows];
    setRows(r => r.filter(x => x.id !== id));
    setDeletingId(id);
    try {
      await webDeletarExercicio(id);
    } catch {
      setRows(prev);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">Exercícios</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Atividades físicas registradas pelos pacientes
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}
        >
          <Plus size={16} />
          Novo Exercício
        </button>
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
          icon={<Dumbbell size={20} color="#8B5CF6" />}
          iconBg="#EDE9FE"
          label="Total de sessões"
          value={loading ? "—" : String(rows.length)}
          sub="exercícios registrados"
          valueColor="#8B5CF6"
        />
        <KpiCard
          icon={<Clock size={20} color="#3B8ED0" />}
          iconBg="#E3F0FB"
          label="Tempo total"
          value={loading ? "—" : totalMin >= 60 ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m` : `${totalMin}m`}
          sub="acumulados"
          valueColor="#3B8ED0"
        />
        <KpiCard
          icon={<Flame size={20} color="#F97316" />}
          iconBg="#FEF0E7"
          label="Calorias queimadas"
          value={loading ? "—" : totalCal > 0 ? `${totalCal.toLocaleString("pt-BR")} kcal` : "—"}
          sub="total acumulado"
          valueColor="#F97316"
        />
        <KpiCard
          icon={<TrendingUp size={20} color="#4CAF82" />}
          iconBg="#E8F5EE"
          label="Duração média"
          value={loading ? "—" : `${avgDuration} min`}
          sub="por sessão"
          valueColor="#4CAF82"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart — weekly minutes */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-sm font-semibold text-[#1A2332] mb-4">Minutos de exercício — últimas datas</h2>
          {loading ? (
            <div className="flex items-center justify-center h-[220px] text-[#9CA3AF] text-sm">Carregando...</div>
          ) : weeklyData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-[#9CA3AF] text-sm">Sem dados</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                  formatter={(v: number) => [`${v} min`, "Duração"]}
                />
                <Bar dataKey="totalMin" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell key={i} fill={INTENSIDADE_COLOR[entry.intensidade]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2 flex-wrap">
            {INTENSIDADES.map(i => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: INTENSIDADE_COLOR[i] }} />
                <span className="text-xs text-[#6B7280]">{INTENSIDADE_LABEL[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart — intensity distribution */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
          <h2 className="text-sm font-semibold text-[#1A2332] mb-4">Distribuição por intensidade</h2>
          {loading ? (
            <div className="flex items-center justify-center h-[180px] text-[#9CA3AF] text-sm">Carregando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={intensityDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {intensityDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v} sessões`]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="space-y-1.5 mt-1">
            {intensityDist.map(item => (
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
              placeholder="Buscar por tipo, paciente, data, intensidade..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] placeholder:text-[#9CA3AF] outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", ...INTENSIDADES] as FilterKey[]).map(f => (
              <button
                key={f}
                onClick={() => setIntensityFilter(f)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
                style={
                  intensityFilter === f
                    ? {
                        background: f === "all" ? "#EDE9FE" : INTENSIDADE_BG[f as IntensidadeApi],
                        color: f === "all" ? "#8B5CF6" : INTENSIDADE_COLOR[f as IntensidadeApi],
                      }
                    : { background: "#F7F9FC", color: "#6B7280" }
                }
              >
                {f === "all" ? "Todos" : INTENSIDADE_LABEL[f as IntensidadeApi]}
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
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Exercício</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Duração</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Calorias</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Intensidade</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Hora</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Observações</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-[#F0F2F5] rounded animate-pulse" style={{ width: `${60 + (j * 13) % 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                      <Dumbbell size={36} strokeWidth={1.5} />
                      <p className="text-sm font-medium">Nenhum exercício encontrado</p>
                      <p className="text-xs">Tente ajustar os filtros de busca</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(row => (
                  <tr key={row.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A2332]">{formatDate(row.data)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
                          <Users size={13} color="#8B5CF6" />
                        </div>
                        <span className="text-[#6B7280] truncate max-w-[120px]">{row.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: INTENSIDADE_BG[row.intensidade] }}>
                          <Dumbbell size={13} color={INTENSIDADE_COLOR[row.intensidade]} />
                        </div>
                        <span className="font-medium text-[#1A2332]">{row.tipo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-[#3B8ED0]">
                        {row.duracao >= 60
                          ? `${Math.floor(row.duracao / 60)}h ${row.duracao % 60}m`
                          : `${row.duracao} min`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#F97316] font-semibold">
                      {row.calorias ? `${row.calorias} kcal` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: INTENSIDADE_BG[row.intensidade], color: INTENSIDADE_COLOR[row.intensidade] }}
                      >
                        {INTENSIDADE_LABEL[row.intensidade]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs">{row.hora}</td>
                    <td className="px-4 py-3 text-[#9CA3AF] text-xs max-w-[160px] truncate">
                      {row.notas ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditing(row); setDialogOpen(true); }}
                          className="w-8 h-8 rounded-lg hover:bg-[#EDE9FE] flex items-center justify-center transition-colors group"
                          title="Editar"
                        >
                          <Pencil size={14} className="text-[#9CA3AF] group-hover:text-[#8B5CF6]" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors group disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 size={14} className="text-[#9CA3AF] group-hover:text-[#EF4444]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-[#F0F2F5] flex items-center justify-between">
            <span className="text-xs text-[#9CA3AF]">
              {filtered.length} de {rows.length} exercícios
            </span>
            <span className="text-xs text-[#6B7280]">
              Total filtrado:{" "}
              <strong className="text-[#8B5CF6]">{totalMinutes(filtered)} min</strong>
              {totalCalories(filtered) > 0 && (
                <> · <strong className="text-[#F97316]">{totalCalories(filtered)} kcal</strong></>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <ExerciseDialog
          editing={editing}
          users={users}
          onClose={() => { setDialogOpen(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
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
