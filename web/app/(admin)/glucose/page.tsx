"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, TrendingUp, TrendingDown, Search, Plus, Trash2, X, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  webListarTodasGlicose, webCriarGlicose, webDeletarGlicose,
  glicoseParaRow,
  type GlucoseStatus,
} from "@/lib/api";
import { glucoseStatusLabel, glucoseStatusColor, glucoseStatusBg, contextLabel, formatDate } from "@/lib/utils";

type Row = {
  id: string; value: number; context: string; status: GlucoseStatus;
  date: string; time: string; notes?: string;
  usuario?: { id: string; nome: string; email: string };
};

type FilterKey = "all" | "normal" | "high" | "very_high" | "low";

const CONTEXTS = [
  { value: "fasting", label: "Jejum" },
  { value: "before_meal", label: "Pré-refeição" },
  { value: "after_meal", label: "Pós-refeição" },
  { value: "bedtime", label: "Antes de dormir" },
  { value: "random", label: "Aleatório" },
];

function FormError({ msg }: { msg: string }) {
  return msg ? <p className="text-xs text-[#EF4444] mt-1">{msg}</p> : null;
}

export default function GlucosePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterKey>("all");

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ valor: "", contexto: "fasting", data: "", hora: "", notas: "" });
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const listRes = await webListarTodasGlicose(1, 500);
      setRows(listRes.dados.map(glicoseParaRow));
    } catch {
      // keep state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter((r) => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch =
      r.date.includes(search) ||
      r.value.toString().includes(search) ||
      contextLabel(r.context).toLowerCase().includes(search.toLowerCase()) ||
      (r.notes ?? "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filterOptions: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "normal", label: "Normal" },
    { key: "high", label: "Alto" },
    { key: "very_high", label: "Muito Alto" },
    { key: "low", label: "Baixo" },
  ];

  const openCreate = () => {
    const now = new Date();
    setForm({
      valor: "",
      contexto: "fasting",
      data: now.toISOString().split("T")[0],
      hora: now.toTimeString().slice(0, 5),
      notas: "",
    });
    setFormErr("");
    setShowCreate(true);
  };

  const handleCreate = async () => {
    const v = parseInt(form.valor);
    if (isNaN(v) || v < 20 || v > 600) {
      setFormErr("Valor deve estar entre 20 e 600 mg/dL.");
      return;
    }
    if (!form.data || !form.hora) { setFormErr("Data e hora são obrigatórios."); return; }
    setSaving(true);
    try {
      const g = await webCriarGlicose({
        valor: v, contexto: form.contexto,
        data: form.data, hora: form.hora,
        notas: form.notas.trim() || undefined,
      });
      setRows(prev => [glicoseParaRow(g), ...prev]);
      setShowCreate(false);
      load(); // refresh stats & trend
    } catch (e: any) {
      setFormErr(e?.message ?? "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await webDeletarGlicose(deleteId);
      setRows(prev => prev.filter(r => r.id !== deleteId));
      setDeleteId(null);
      load();
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  };

  // Compute stats from rows
  const total = rows.length;
  const avgGlicose = total > 0 ? Math.round(rows.reduce((s, r) => s + r.value, 0) / total) : null;
  const normalCount = rows.filter(r => r.status === "normal").length;
  const highCount = rows.filter(r => r.status === "high" || r.status === "very_high").length;
  const lowCount = rows.filter(r => r.status === "low").length;
  const inRangePct = total > 0 ? Math.round((normalCount / total) * 100) : 0;
  const highPct = total > 0 ? Math.round((highCount / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((lowCount / total) * 100) : 0;

  const statCards = [
    {
      label: "Média Geral", icon: Activity,
      value: avgGlicose !== null ? `${avgGlicose} mg/dL` : "—",
      sub: `${total} leituras`,
      color: "#4CAF82", bg: "#E8F5EE",
    },
    {
      label: "No Alvo", icon: TrendingUp,
      value: total > 0 ? `${inRangePct}%` : "—",
      sub: `Normal (70–140 mg/dL)`,
      color: "#10B981", bg: "#D1FAE5",
    },
    {
      label: "Acima do Alvo", icon: TrendingUp,
      value: total > 0 ? `${highPct}%` : "—",
      sub: "Leituras elevadas",
      color: "#F59E0B", bg: "#FEF3C7",
    },
    {
      label: "Abaixo do Alvo", icon: TrendingDown,
      value: total > 0 ? `${lowPct}%` : "—",
      sub: "Hipoglicemia",
      color: "#3B8ED0", bg: "#E3F0FB",
    },
  ];

  // Compute trend from rows grouped by day (last 30 days)
  const trendMap: Record<string, number[]> = {};
  rows.forEach(r => {
    if (!trendMap[r.date]) trendMap[r.date] = [];
    trendMap[r.date].push(r.value);
  });
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, vals]) => ({
      date: formatDate(date),
      avg: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
      max: Math.max(...vals),
      min: Math.min(...vals),
    }));

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
              <p className="text-[10px] text-[#9CA3AF]">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-[#1A2332]">Evolução Glicêmica</h3>
            <p className="text-xs text-[#9CA3AF]">Tendência diária — mín/média/máx</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[#4CAF82]" />Média</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[#F59E0B]" />Máx</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-[#3B8ED0]" />Mín</span>
          </div>
        </div>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="avgGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF82" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#4CAF82" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[50, 230]} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v} mg/dL`]} />
              <ReferenceLine y={70} stroke="#3B8ED0" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Mín 70", position: "right", fontSize: 10, fill: "#3B8ED0" }} />
              <ReferenceLine y={140} stroke="#F59E0B" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Máx 140", position: "right", fontSize: 10, fill: "#F59E0B" }} />
              <Area type="monotone" dataKey="max" stroke="#F59E0B" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Máxima" />
              <Area type="monotone" dataKey="avg" stroke="#4CAF82" strokeWidth={2.5} fill="url(#avgGrad2)" name="Média" />
              <Area type="monotone" dataKey="min" stroke="#3B8ED0" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Mínima" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[260px] flex items-center justify-center text-[#9CA3AF] text-sm">
            {loading ? "Carregando..." : "Sem dados para exibir"}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por data, valor, contexto..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  statusFilter === key
                    ? { backgroundColor: "#E8F5EE", color: "#4CAF82" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-[#4CAF82] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#388E63] transition-colors ml-auto shrink-0"
          >
            <Plus size={14} /> Nova Leitura
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                {["Paciente", "Data / Hora", "Valor", "Contexto", "Status", "Observações", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {loading && rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-[#9CA3AF] text-sm">Carregando...</td></tr>
              ) : filtered.map((r) => {
                const color = glucoseStatusColor(r.status);
                const bg = glucoseStatusBg(r.status);
                const label = glucoseStatusLabel(r.status);
                const initials = r.usuario
                  ? r.usuario.nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
                  : "?";
                return (
                  <tr key={r.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4CAF82] to-[#2E9E6B] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                          {initials}
                        </div>
                        <span className="text-xs text-[#1A2332] truncate max-w-[120px]">{r.usuario?.nome ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#6B7280] text-xs whitespace-nowrap">
                      {formatDate(r.date)} <span className="text-[#9CA3AF]">·</span> {r.time}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1A2332]">{r.value}</span>
                        <span className="text-xs text-[#9CA3AF]">mg/dL</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B7280]">{contextLabel(r.context)}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: bg, color }}>
                        {label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#6B7280] max-w-[180px] truncate">
                      {r.notes ?? <span className="text-[#D1D5DB]">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setDeleteId(r.id)}
                        className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && rows.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Activity size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma leitura encontrada</p>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {rows.length} leituras
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F5]">
              <h2 className="font-bold text-[#1A2332]">Nova Leitura de Glicose</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#9CA3AF] hover:text-[#1A2332]"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Valor (mg/dL) *</label>
                <input
                  type="number" min={20} max={600}
                  value={form.valor}
                  onChange={e => { setForm(p => ({ ...p, valor: e.target.value })); setFormErr(""); }}
                  placeholder="Ex: 120"
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4CAF82] text-[#1A2332]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Contexto *</label>
                <select
                  value={form.contexto}
                  onChange={e => setForm(p => ({ ...p, contexto: e.target.value }))}
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4CAF82] text-[#1A2332] bg-white"
                >
                  {CONTEXTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Data *</label>
                  <input
                    type="date" value={form.data}
                    onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4CAF82] text-[#1A2332]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Hora *</label>
                  <input
                    type="time" value={form.hora}
                    onChange={e => setForm(p => ({ ...p, hora: e.target.value }))}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4CAF82] text-[#1A2332]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Observações</label>
                <textarea
                  rows={2} value={form.notas}
                  onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                  placeholder="Ex: Em jejum, após exercício..."
                  className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#4CAF82] text-[#1A2332] resize-none"
                />
              </div>
              <FormError msg={formErr} />
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] hover:bg-[#F7F9FC] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#4CAF82] text-white text-sm font-semibold hover:bg-[#388E63] disabled:opacity-60 transition-colors"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={22} className="text-[#EF4444]" />
            </div>
            <h3 className="font-bold text-[#1A2332] mb-1">Excluir leitura?</h3>
            <p className="text-sm text-[#6B7280] mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] hover:bg-[#F7F9FC] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626] disabled:opacity-60 transition-colors"
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
