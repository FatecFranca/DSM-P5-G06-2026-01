"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { Droplets, Search, Users, Edit2, Trash2, X, Plus, Check, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  webListarHidratacao, webCriarHidratacao, webAtualizarHidratacao, webDeletarHidratacao,
  ApiHidratacao,
} from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HydrationEntry {
  id: string;
  usuarioId: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  amount: number;
  createdAt: string;
}

interface HydrationForm {
  data: string;
  hora: string;
  quantidade: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TEAL = "#14B8A6";
const TEAL_BG = "#CCFBF1";
const TEAL_TEXT = "#0D9488";
const TODAY = () => new Date().toISOString().split("T")[0];
const NOW_TIME = () => new Date().toTimeString().slice(0, 5);

function mapHidratacao(h: ApiHidratacao): HydrationEntry {
  return {
    id: h.id,
    usuarioId: h.usuarioId,
    userName: h.usuario?.nome ?? `Usuário ${h.usuarioId.slice(0, 6)}`,
    userEmail: h.usuario?.email ?? "",
    date: h.data,
    time: h.hora,
    amount: h.quantidade,
    createdAt: h.criadoEm,
  };
}

function buildDailyChart(entries: HydrationEntry[]) {
  const byDate = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] ?? 0) + e.amount;
    return acc;
  }, {});
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, total]) => ({
      date: date.slice(5),
      total: Math.round(total / 1000 * 100) / 100,
      rawTotal: total,
    }));
}

function validateForm(form: HydrationForm): string | null {
  const qty = parseInt(form.quantidade, 10);
  if (!qty || qty <= 0 || qty > 5000) return "Quantidade inválida (1–5000 ml)";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.data)) return "Data deve estar no formato YYYY-MM-DD";
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.hora)) return "Hora deve estar no formato HH:MM";
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WaterPage() {
  const [entries, setEntries] = useState<HydrationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<HydrationEntry | null>(null);
  const [showDelete, setShowDelete] = useState<HydrationEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState<HydrationForm>({ data: TODAY(), hora: NOW_TIME(), quantidade: "" });

  const loadData = () => {
    setLoading(true);
    webListarHidratacao(1, 500)
      .then(data => setEntries(data.dados.map(mapHidratacao)))
      .catch(() => setError("Não foi possível carregar os registros de hidratação."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return entries;
    return entries.filter(e =>
      e.date.includes(term) ||
      e.userName.toLowerCase().includes(term) ||
      e.userEmail.toLowerCase().includes(term) ||
      String(e.amount).includes(term) ||
      e.time.includes(term)
    );
  }, [search, entries]);

  const totalRecords = entries.length;
  const totalMl = entries.reduce((s, e) => s + e.amount, 0);
  const avgPerRecord = totalRecords ? Math.round(totalMl / totalRecords) : 0;
  const uniqueUsers = new Set(entries.map(e => e.usuarioId)).size;
  const todayTotal = entries
    .filter(e => e.date === TODAY())
    .reduce((s, e) => s + e.amount, 0);

  const chartData = useMemo(() => buildDailyChart(entries), [entries]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm({ data: TODAY(), hora: NOW_TIME(), quantidade: "" });
    setFormError(null);
    setShowCreate(true);
  };

  const openEdit = (entry: HydrationEntry) => {
    setForm({ data: entry.date, hora: entry.time, quantidade: String(entry.amount) });
    setFormError(null);
    setShowEdit(entry);
  };

  const handleCreate = async () => {
    const err = validateForm(form);
    if (err) { setFormError(err); return; }
    setSaving(true);
    setFormError(null);
    try {
      const h = await webCriarHidratacao({
        data: form.data,
        hora: form.hora,
        quantidade: parseInt(form.quantidade, 10),
      });
      setEntries(prev => [mapHidratacao(h), ...prev]);
      setShowCreate(false);
    } catch (e: any) {
      setFormError(e.message ?? "Erro ao criar registro");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!showEdit) return;
    const err = validateForm(form);
    if (err) { setFormError(err); return; }
    setSaving(true);
    setFormError(null);
    try {
      const h = await webAtualizarHidratacao(showEdit.id, {
        data: form.data,
        hora: form.hora,
        quantidade: parseInt(form.quantidade, 10),
      });
      setEntries(prev => prev.map(e => e.id === showEdit.id ? mapHidratacao(h) : e));
      setShowEdit(null);
    } catch (e: any) {
      setFormError(e.message ?? "Erro ao atualizar registro");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDelete) return;
    setSaving(true);
    try {
      await webDeletarHidratacao(showDelete.id);
      setEntries(prev => prev.filter(e => e.id !== showDelete.id));
      setShowDelete(null);
    } catch (e: any) {
      setError(e.message ?? "Erro ao deletar registro");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2332]">Hidratação</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Monitoramento do consumo de água dos pacientes
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: TEAL }}
        >
          <Plus size={16} />
          Novo registro
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Droplets size={20} color={TEAL_TEXT} />}
          iconBg={TEAL_BG}
          label="Total registros"
          value={loading ? "—" : String(totalRecords)}
          sub="de hidratação"
          valueColor={TEAL_TEXT}
        />
        <KpiCard
          icon={<Droplets size={20} color="#4CAF82" />}
          iconBg="#E8F5EE"
          label="Volume total"
          value={loading ? "—" : `${(totalMl / 1000).toFixed(1)}L`}
          sub="consumido"
          valueColor="#4CAF82"
        />
        <KpiCard
          icon={<Droplets size={20} color="#F59E0B" />}
          iconBg="#FEF3C7"
          label="Média por registro"
          value={loading ? "—" : `${avgPerRecord}ml`}
          sub="por entrada"
          valueColor="#F59E0B"
        />
        <KpiCard
          icon={<Users size={20} color="#8B5CF6" />}
          iconBg="#EDE9FE"
          label="Usuários ativos"
          value={loading ? "—" : String(uniqueUsers)}
          sub="com registros"
          valueColor="#8B5CF6"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#1A2332]">Consumo diário — últimos 14 dias (litros)</h2>
          <span className="text-xs text-[#6B7280]">
            Hoje: <strong style={{ color: TEAL_TEXT }}>{(todayTotal / 1000).toFixed(2)}L</strong>
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-[220px] text-[#9CA3AF] text-sm">Carregando...</div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-[#9CA3AF] text-sm">Sem dados</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F2F5" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} unit="L" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}
                formatter={(v: number) => [`${v}L`, "Total consumido"]}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={TEAL} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#F0F2F5] flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Buscar por data, paciente, quantidade, hora..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] placeholder:text-[#9CA3AF] outline-none focus:border-[#14B8A6]"
            />
          </div>
          <span className="text-xs text-[#9CA3AF] shrink-0">
            {filtered.length} de {entries.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC] text-left">
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Data</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Hora</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Paciente</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Quantidade</th>
                <th className="px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#9CA3AF] text-sm">
                    Carregando registros...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                      <Droplets size={36} strokeWidth={1.5} />
                      <p className="text-sm font-medium">Nenhum registro encontrado</p>
                      <p className="text-xs">Tente ajustar os filtros ou adicionar um novo registro</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(entry => {
                  const amountColor = entry.amount >= 500 ? "#4CAF82" : entry.amount >= 200 ? TEAL_TEXT : "#F59E0B";
                  return (
                    <tr key={entry.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#1A2332]">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 text-[#6B7280]">{entry.time}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: TEAL_BG }}>
                            <Users size={13} color={TEAL_TEXT} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[#1A2332] font-medium truncate">{entry.userName}</p>
                            {entry.userEmail && (
                              <p className="text-[#9CA3AF] text-xs truncate">{entry.userEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: TEAL_BG, color: amountColor }}>
                          <Droplets size={11} />
                          {entry.amount}ml
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(entry)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#CCFBF1]"
                            title="Editar"
                          >
                            <Edit2 size={13} color={TEAL_TEXT} />
                          </button>
                          <button
                            onClick={() => setShowDelete(entry)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 size={13} color="#EF4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-[#F0F2F5] flex items-center justify-between">
            <span className="text-xs text-[#9CA3AF]">
              {filtered.length} de {entries.length} registros
            </span>
            <span className="text-xs text-[#6B7280]">
              Volume filtrado:{" "}
              <strong style={{ color: TEAL_TEXT }}>
                {(filtered.reduce((s, e) => s + e.amount, 0) / 1000).toFixed(2)}L
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* ── Modal: Criar ────────────────────────────────────────── */}
      {showCreate && (
        <ModalOverlay onClose={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <ModalHeader title="Novo registro" onClose={() => setShowCreate(false)} />
            <HydrationFormFields form={form} setForm={setForm} />
            {formError && <FormError message={formError} />}
            <ModalActions
              onCancel={() => setShowCreate(false)}
              onConfirm={handleCreate}
              confirmLabel="Salvar"
              saving={saving}
              confirmColor={TEAL}
            />
          </div>
        </ModalOverlay>
      )}

      {/* ── Modal: Editar ────────────────────────────────────────── */}
      {showEdit && (
        <ModalOverlay onClose={() => setShowEdit(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <ModalHeader title="Editar registro" onClose={() => setShowEdit(null)} />
            <HydrationFormFields form={form} setForm={setForm} />
            {formError && <FormError message={formError} />}
            <ModalActions
              onCancel={() => setShowEdit(null)}
              onConfirm={handleEdit}
              confirmLabel="Atualizar"
              saving={saving}
              confirmColor={TEAL}
            />
          </div>
        </ModalOverlay>
      )}

      {/* ── Modal: Confirmar exclusão ────────────────────────────── */}
      {showDelete && (
        <ModalOverlay onClose={() => setShowDelete(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} color="#EF4444" />
            </div>
            <h3 className="text-lg font-bold text-[#1A2332] mb-2">Excluir registro</h3>
            <p className="text-sm text-[#6B7280] mb-6">
              Deseja remover o registro de{" "}
              <strong className="text-[#1A2332]">{showDelete.amount}ml</strong> de{" "}
              <strong className="text-[#1A2332]">{showDelete.userName}</strong>?
              <br />Esta ação não pode ser desfeita.
            </p>
            <ModalActions
              onCancel={() => setShowDelete(null)}
              onConfirm={handleDelete}
              confirmLabel="Excluir"
              saving={saving}
              confirmColor="#EF4444"
              danger
            />
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-lg font-bold text-[#1A2332]">{title}</h3>
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F4F6] transition-colors"
      >
        <X size={18} color="#6B7280" />
      </button>
    </div>
  );
}

function HydrationFormFields({
  form, setForm,
}: {
  form: HydrationForm;
  setForm: React.Dispatch<React.SetStateAction<HydrationForm>>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Data</label>
          <input
            type="date"
            value={form.data}
            onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
            className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] outline-none focus:border-[#14B8A6]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Hora</label>
          <input
            type="time"
            value={form.hora}
            onChange={e => setForm(p => ({ ...p, hora: e.target.value }))}
            className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] outline-none focus:border-[#14B8A6]"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5">Quantidade (ml)</label>
        <input
          type="number"
          min={1}
          max={5000}
          value={form.quantidade}
          onChange={e => setForm(p => ({ ...p, quantidade: e.target.value }))}
          placeholder="Ex: 300"
          className="w-full px-3 py-2.5 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl text-sm text-[#1A2332] outline-none focus:border-[#14B8A6] placeholder:text-[#9CA3AF]"
        />
      </div>
    </div>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 mt-3 p-2.5 bg-red-50 border border-red-100 rounded-xl">
      <AlertCircle size={14} color="#EF4444" className="shrink-0" />
      <p className="text-xs text-red-600">{message}</p>
    </div>
  );
}

function ModalActions({
  onCancel, onConfirm, confirmLabel, saving, confirmColor, danger,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  saving: boolean;
  confirmColor: string;
  danger?: boolean;
}) {
  return (
    <div className="flex gap-3 mt-5">
      <button
        onClick={onCancel}
        disabled={saving}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#6B7280] bg-[#F7F9FC] border border-[#E5E7EB] hover:bg-[#F3F4F6] transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
      <button
        onClick={onConfirm}
        disabled={saving}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: confirmColor }}
      >
        {saving ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Check size={15} />
            {confirmLabel}
          </>
        )}
      </button>
    </div>
  );
}
