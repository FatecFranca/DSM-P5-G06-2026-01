"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Pill, Search, CheckCircle2, XCircle, Clock, Plus, Trash2, Pencil,
  TrendingUp, AlertCircle, X, Filter,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import {
  webListarTodasMedicacoes, webCriarMedicacao, webAtualizarMedicacao, webDeletarMedicacao,
  tipoMedicacaoLabel, tipoMedicacaoBg, tipoMedicacaoColor,
  type ApiMedicacao, type TipoMedicacaoApi,
} from "@/lib/api";

type FilterKey = "all" | "INSULINA" | "ORAL" | "SUPLEMENTO" | "OUTRO";
type StatusFilter = "all" | "taken" | "pending";

const TIPOS: TipoMedicacaoApi[] = ["ORAL", "INSULINA", "SUPLEMENTO", "OUTRO"];
const PRESET_COLORS = ["#4CAF82", "#3B8ED0", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#14B8A6"];

const EMPTY_FORM = {
  nome: "", dosagem: "", frequencia: "", horarios: ["08:00"],
  tipo: "ORAL" as TipoMedicacaoApi, notas: "", cor: PRESET_COLORS[0],
};

function FormError({ msg }: { msg: string }) {
  return msg ? <p className="text-xs text-[#EF4444] mt-1">{msg}</p> : null;
}

export default function MedicationsPage() {
  const [rows, setRows] = useState<ApiMedicacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterKey>("all");
  const [takenFilter, setTakenFilter] = useState<StatusFilter>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await webListarTodasMedicacoes(1, 500);
      setRows(res.dados);
    } catch {
      // keep state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rows.filter(m => {
    const matchSearch =
      m.nome.toLowerCase().includes(search.toLowerCase()) ||
      m.dosagem.toLowerCase().includes(search.toLowerCase()) ||
      (m.usuario?.nome ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || m.tipo === typeFilter;
    const matchTaken = takenFilter === "all" || (takenFilter === "taken" ? m.tomado : !m.tomado);
    return matchSearch && matchType && matchTaken;
  });

  // Stats
  const total = rows.length;
  const takenToday = rows.filter(m => m.tomado).length;
  const pending = rows.filter(m => !m.tomado).length;
  const adherencePct = total > 0 ? Math.round((takenToday / total) * 100) : 0;

  // Adherence per user
  const userMap: Record<string, { nome: string; total: number; tomados: number }> = {};
  rows.forEach(m => {
    if (!m.usuario) return;
    const uid = m.usuarioId;
    if (!userMap[uid]) userMap[uid] = { nome: m.usuario.nome, total: 0, tomados: 0 };
    userMap[uid].total++;
    if (m.tomado) userMap[uid].tomados++;
  });
  const adherenceData = Object.values(userMap)
    .map(u => ({ name: u.nome.split(" ")[0], adherence: u.total > 0 ? Math.round((u.tomados / u.total) * 100) : 0 }))
    .sort((a, b) => b.adherence - a.adherence)
    .slice(0, 6);

  // Per-type count
  const typeCounts = TIPOS.reduce((acc, t) => {
    acc[t] = rows.filter(m => m.tipo === t).length;
    return acc;
  }, {} as Record<TipoMedicacaoApi, number>);

  const lowAdherenceCount = Object.values(userMap).filter(u => u.total > 0 && (u.tomados / u.total) < 0.7).length;

  // Form helpers
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormErr("");
    setShowForm(true);
  };

  const openEdit = (m: ApiMedicacao) => {
    setEditingId(m.id);
    setForm({ nome: m.nome, dosagem: m.dosagem, frequencia: m.frequencia, horarios: m.horarios, tipo: m.tipo, notas: m.notas ?? "", cor: m.cor });
    setFormErr("");
    setShowForm(true);
  };

  const addHorario = () => setForm(p => ({ ...p, horarios: [...p.horarios, "08:00"] }));
  const removeHorario = (i: number) => setForm(p => ({ ...p, horarios: p.horarios.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.nome.trim()) { setFormErr("Nome é obrigatório"); return; }
    if (!form.dosagem.trim()) { setFormErr("Dosagem é obrigatória"); return; }
    if (!form.frequencia.trim()) { setFormErr("Frequência é obrigatória"); return; }
    if (form.horarios.length === 0) { setFormErr("Informe pelo menos um horário"); return; }
    setSaving(true);
    try {
      const params = { nome: form.nome.trim(), dosagem: form.dosagem.trim(), frequencia: form.frequencia.trim(), horarios: form.horarios, tipo: form.tipo, notas: form.notas.trim() || undefined, cor: form.cor };
      if (editingId) {
        const updated = await webAtualizarMedicacao(editingId, params);
        setRows(prev => prev.map(m => m.id === editingId ? updated : m));
      } else {
        const created = await webCriarMedicacao(params);
        setRows(prev => [created, ...prev]);
      }
      setShowForm(false);
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
      await webDeletarMedicacao(deleteId);
      setRows(prev => prev.filter(m => m.id !== deleteId));
      setDeleteId(null);
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  const statCards = [
    { label: "Total de Medicamentos", value: total, color: "#8B5CF6", bg: "#EDE9FE", icon: Pill },
    { label: "Tomados Hoje", value: takenToday, color: "#4CAF82", bg: "#E8F5EE", icon: CheckCircle2 },
    { label: "Pendentes", value: pending, color: "#EF4444", bg: "#FEE2E2", icon: XCircle },
    { label: "Aderência Geral", value: `${adherencePct}%`, color: "#F97316", bg: "#FFF0E5", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #4F46E5 100%)" }}>
        <div className="relative z-10">
          <p className="text-white/80 text-sm font-medium">Gestão</p>
          <h2 className="text-2xl font-bold mt-1">Medicamentos</h2>
          <p className="text-white/70 text-sm mt-1">Controle e aderência farmacológica dos pacientes</p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10"><Pill size={120} strokeWidth={1} /></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#1A2332]">{loading ? "..." : s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Adherence chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Aderência por Paciente</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">% de doses tomadas (top 6 pacientes)</p>
          {adherenceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={adherenceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E5E7EB", fontSize: 12 }} formatter={(v) => [`${v}%`, "Aderência"]} />
                <Bar dataKey="adherence" radius={[6, 6, 0, 0]}>
                  {adherenceData.map((entry, i) => (
                    <Cell key={i} fill={entry.adherence >= 85 ? "#4CAF82" : entry.adherence >= 70 ? "#F59E0B" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-[#9CA3AF]">
              {loading ? "Carregando..." : "Sem dados"}
            </div>
          )}
          <div className="flex gap-4 mt-2 justify-center">
            {[{ label: "≥ 85% (Boa)", color: "#4CAF82" }, { label: "70–84% (Regular)", color: "#F59E0B" }, { label: "< 70% (Baixa)", color: "#EF4444" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <span className="w-3 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: l.color }} />{l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Type breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-bold text-[#1A2332] mb-4">Por Tipo</h3>
          <div className="space-y-3">
            {TIPOS.map(tipo => (
              <div key={tipo} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: tipoMedicacaoBg(tipo) }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: tipoMedicacaoColor(tipo) + "20" }}>
                  <Pill size={18} style={{ color: tipoMedicacaoColor(tipo) }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1A2332]">{tipoMedicacaoLabel(tipo)}</p>
                  <p className="text-xs text-[#6B7280]">{typeCounts[tipo]} medicamento{typeCounts[tipo] !== 1 ? "s" : ""}</p>
                </div>
                <span className="text-sm font-bold" style={{ color: tipoMedicacaoColor(tipo) }}>{typeCounts[tipo]}</span>
              </div>
            ))}
          </div>
          {lowAdherenceCount > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-[#FEF3C7] flex gap-2">
              <AlertCircle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
              <p className="text-xs text-[#92400E]">
                <strong>{lowAdherenceCount} paciente{lowAdherenceCount !== 1 ? "s" : ""}</strong> com aderência abaixo de 70%.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar medicamento ou paciente..." className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[#9CA3AF]" />
            {(["all", ...TIPOS] as FilterKey[]).map(f => (
              <button key={f} onClick={() => setTypeFilter(f)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={typeFilter === f ? { backgroundColor: "#EDE9FE", color: "#8B5CF6" } : { backgroundColor: "#F7F9FC", color: "#6B7280" }}>
                {f === "all" ? "Todos" : tipoMedicacaoLabel(f as TipoMedicacaoApi)}
              </button>
            ))}
            <div className="w-px h-4 bg-[#E5E7EB]" />
            {(["all", "taken", "pending"] as StatusFilter[]).map(f => (
              <button key={f} onClick={() => setTakenFilter(f)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={takenFilter === f ? { backgroundColor: "#E8F5EE", color: "#4CAF82" } : { backgroundColor: "#F7F9FC", color: "#6B7280" }}>
                {{ all: "Todos", taken: "Tomados", pending: "Pendentes" }[f]}
              </button>
            ))}
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 bg-[#8B5CF6] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#7C3AED] transition-colors ml-auto">
            <Plus size={14} /> Novo Medicamento
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                {["Medicamento", "Paciente", "Tipo", "Dosagem", "Frequência", "Horários", "Status", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {loading && rows.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-[#9CA3AF] text-sm">Carregando...</td></tr>
              ) : filtered.map(med => {
                const typeColor = tipoMedicacaoColor(med.tipo);
                const typeBg = tipoMedicacaoBg(med.tipo);
                const initials = med.usuario ? med.usuario.nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() : "?";
                return (
                  <tr key={med.id} className="hover:bg-[#F7F9FC] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: med.cor + "20" }}>
                          <Pill size={15} style={{ color: med.cor }} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A2332]">{med.nome}</p>
                          {med.notas && <p className="text-[10px] text-[#9CA3AF]">{med.notas}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}>{initials}</div>
                        <span className="text-xs text-[#6B7280]">{med.usuario?.nome ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: typeBg, color: typeColor }}>{tipoMedicacaoLabel(med.tipo)}</span>
                    </td>
                    <td className="px-5 py-3.5"><span className="font-bold text-[#1A2332]">{med.dosagem}</span></td>
                    <td className="px-5 py-3.5 text-xs text-[#6B7280]">{med.frequencia}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1 flex-wrap">
                        {med.horarios.map(t => (
                          <span key={t} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-[#F0F2F5] text-[#6B7280]">
                            <Clock size={9} />{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={med.tomado ? { backgroundColor: "#D1FAE5", color: "#10B981" } : { backgroundColor: "#FEE2E2", color: "#EF4444" }}>
                        {med.tomado ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                        {med.tomado ? "Tomado" : "Pendente"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(med)} className="p-1.5 rounded-lg hover:bg-[#EDE9FE] text-[#9CA3AF] hover:text-[#8B5CF6] transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteId(med.id)} className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444] transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Pill size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum medicamento encontrado</p>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {rows.length} medicamentos
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F5] sticky top-0 bg-white z-10">
              <h2 className="font-bold text-[#1A2332]">{editingId ? "Editar Medicamento" : "Novo Medicamento"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#9CA3AF] hover:text-[#1A2332]"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Nome *</label>
                <input value={form.nome} onChange={e => { setForm(p => ({ ...p, nome: e.target.value })); setFormErr(""); }}
                  placeholder="Ex: Metformina" className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#8B5CF6] text-[#1A2332]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Dosagem *</label>
                  <input value={form.dosagem} onChange={e => setForm(p => ({ ...p, dosagem: e.target.value }))}
                    placeholder="Ex: 500mg" className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#8B5CF6] text-[#1A2332]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] mb-1">Frequência *</label>
                  <input value={form.frequencia} onChange={e => setForm(p => ({ ...p, frequencia: e.target.value }))}
                    placeholder="Ex: 2x ao dia" className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#8B5CF6] text-[#1A2332]" />
                </div>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-2">Tipo *</label>
                <div className="flex gap-2 flex-wrap">
                  {TIPOS.map(t => (
                    <button key={t} onClick={() => setForm(p => ({ ...p, tipo: t }))}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                      style={form.tipo === t ? { backgroundColor: tipoMedicacaoColor(t), color: "#fff", borderColor: tipoMedicacaoColor(t) } : { backgroundColor: "#F7F9FC", color: "#6B7280", borderColor: "#E5E7EB" }}>
                      {tipoMedicacaoLabel(t)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Horários */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-2">Horários *</label>
                <div className="space-y-2">
                  {form.horarios.map((h, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="time" value={h} onChange={e => setForm(p => ({ ...p, horarios: p.horarios.map((v, idx) => idx === i ? e.target.value : v) }))}
                        className="flex-1 border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#8B5CF6] text-[#1A2332]" />
                      {form.horarios.length > 1 && (
                        <button onClick={() => removeHorario(i)} className="p-2 rounded-lg hover:bg-[#FEE2E2] text-[#9CA3AF] hover:text-[#EF4444] transition-colors border border-[#E5E7EB]"><X size={14} /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={addHorario} className="flex items-center gap-1 text-xs text-[#8B5CF6] font-medium mt-1">
                    <Plus size={13} /> Adicionar horário
                  </button>
                </div>
              </div>

              {/* Cor */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-2">Cor</label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(p => ({ ...p, cor: c }))}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{ backgroundColor: c, outline: form.cor === c ? `3px solid ${c}` : "none", outlineOffset: "2px" }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Observações</label>
                <textarea rows={2} value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
                  placeholder="Ex: Tomar com alimento" className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#8B5CF6] text-[#1A2332] resize-none" />
              </div>
              <FormError msg={formErr} />
            </div>
            <div className="px-6 pb-5 flex gap-3 sticky bottom-0 bg-white border-t border-[#F0F2F5] pt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] hover:bg-[#F7F9FC] transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] disabled:opacity-60 transition-colors">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-[#FEE2E2] rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-[#EF4444]" />
            </div>
            <h3 className="font-bold text-[#1A2332] mb-1">Excluir medicamento?</h3>
            <p className="text-sm text-[#6B7280] mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-semibold text-[#6B7280] hover:bg-[#F7F9FC] transition-colors">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-semibold hover:bg-[#DC2626] disabled:opacity-60 transition-colors">
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
