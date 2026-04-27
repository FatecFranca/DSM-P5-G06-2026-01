"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell, BellOff, CheckCheck, Filter, Plus, Activity,
  UtensilsCrossed, Pill, Calendar, Lightbulb, Target, Users,
  Clock, Trash2, Send, X, Loader2, RefreshCw, Search, ChevronDown,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  webListarTodasNotificacoes, webCriarNotificacao, webMarcarNotificacaoLida,
  webDeletarNotificacao, webListarUsuarios,
  type ApiNotificacao, type TipoNotificacaoApi, type ApiUsuario,
  TIPO_NOTIFICACAO_LABEL, TIPO_NOTIFICACAO_COLOR,
} from "@/lib/api";

// ─── Config ───────────────────────────────────────────────────────────────────

const TIPOS: TipoNotificacaoApi[] = ["GLICOSE", "REFEICAO", "MEDICAMENTO", "CONSULTA", "DICA", "META"];

const TYPE_ICON: Record<TipoNotificacaoApi, React.ElementType> = {
  GLICOSE: Activity, REFEICAO: UtensilsCrossed, MEDICAMENTO: Pill,
  CONSULTA: Calendar, DICA: Lightbulb, META: Target,
};

// ─── Multiselect de usuários ──────────────────────────────────────────────────

interface UserMultiselectProps {
  usuarios: ApiUsuario[];
  selectedIds: string[];
  todos: boolean;
  onChange: (ids: string[], todos: boolean) => void;
}

function UserMultiselect({ usuarios, selectedIds, todos, onChange }: UserMultiselectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function toggleTodos() {
    onChange([], !todos);
  }

  function toggleUser(id: string) {
    if (todos) {
      onChange([id], false);
      return;
    }
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(next, false);
  }

  function getLabel() {
    if (todos) return "Todos os usuários";
    if (selectedIds.length === 0) return "Selecionar destinatários...";
    if (selectedIds.length === 1) {
      const u = usuarios.find((u) => u.id === selectedIds[0]);
      return u?.nome ?? "1 usuário";
    }
    return `${selectedIds.length} usuários selecionados`;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm bg-[#F7F9FC] outline-none text-left"
      >
        <span className={todos || selectedIds.length > 0 ? "text-[#1A2332]" : "text-[#9CA3AF]"}>
          {getLabel()}
        </span>
        <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden">
          {/* Todos */}
          <label className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#F7F9FC] cursor-pointer border-b border-[#F0F2F5]">
            <input
              type="checkbox"
              checked={todos}
              onChange={toggleTodos}
              className="w-4 h-4 accent-[#3B8ED0] rounded"
            />
            <Users size={14} className="text-[#6B7280] shrink-0" />
            <span className="text-sm font-semibold text-[#1A2332]">Todos os usuários</span>
          </label>

          {/* Search */}
          <div className="px-3 py-2 border-b border-[#F0F2F5]">
            <div className="flex items-center gap-2 bg-[#F7F9FC] rounded-lg px-2 py-1.5">
              <Search size={12} className="text-[#9CA3AF] shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar usuário..."
                className="flex-1 bg-transparent text-xs outline-none text-[#1A2332] placeholder-[#9CA3AF]"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-xs text-[#9CA3AF] text-center py-4">Nenhum usuário encontrado</p>
            )}
            {filtered.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F7F9FC] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!todos && selectedIds.includes(u.id)}
                  onChange={() => toggleUser(u.id)}
                  className="w-4 h-4 accent-[#3B8ED0] rounded"
                />
                <div className="w-6 h-6 rounded-full bg-[#3B8ED0] flex items-center justify-center text-white shrink-0" style={{ fontSize: 9 }}>
                  {u.nome.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1A2332] truncate">{u.nome}</p>
                  <p className="text-[10px] text-[#9CA3AF] truncate">{u.email}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dialog de criação ────────────────────────────────────────────────────────

interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
  usuarios: ApiUsuario[];
  onCreated: () => void;
}

function CreateDialog({ open, onClose, usuarios, onCreated }: CreateDialogProps) {
  const today = new Date().toISOString().split("T")[0];
  const nowTime = new Date().toTimeString().slice(0, 5);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [todosFlag, setTodosFlag] = useState(true);
  const [tipo, setTipo] = useState<TipoNotificacaoApi>("DICA");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [data, setData] = useState(today);
  const [hora, setHora] = useState(nowTime);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setSelectedIds([]);
    setTodosFlag(true);
    setTipo("DICA");
    setTitulo("");
    setMensagem("");
    setData(today);
    setHora(nowTime);
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSend() {
    if (!titulo.trim()) { setError("Título é obrigatório."); return; }
    if (!mensagem.trim()) { setError("Mensagem é obrigatória."); return; }
    if (!todosFlag && selectedIds.length === 0) { setError("Selecione ao menos um destinatário."); return; }

    setSending(true);
    setError("");
    try {
      if (todosFlag) {
        await webCriarNotificacao({ todos: true, titulo, mensagem, tipo, data, hora });
      } else {
        await Promise.all(
          selectedIds.map((id) =>
            webCriarNotificacao({ usuarioId: id, titulo, mensagem, tipo, data, hora })
          )
        );
      }
      onCreated();
      handleClose();
    } catch (e: any) {
      setError(e.message ?? "Erro ao enviar notificação.");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F2F5]">
          <div>
            <h2 className="font-bold text-[#1A2332] text-base">Nova Notificação</h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">Envie um alerta para um ou mais pacientes</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-[#F7F9FC] transition-colors"
          >
            <X size={16} className="text-[#9CA3AF]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl">
              <X size={12} className="shrink-0" /> {error}
            </div>
          )}

          {/* Destinatários */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">
              Destinatários
            </label>
            <UserMultiselect
              usuarios={usuarios}
              selectedIds={selectedIds}
              todos={todosFlag}
              onChange={(ids, all) => { setSelectedIds(ids); setTodosFlag(all); }}
            />
            {!todosFlag && selectedIds.length > 0 && (
              <p className="text-[10px] text-[#9CA3AF] mt-1">
                {selectedIds.length} usuário{selectedIds.length > 1 ? "s" : ""} selecionado{selectedIds.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Tipo</label>
            <div className="grid grid-cols-3 gap-2">
              {TIPOS.map((t) => {
                const Icon = TYPE_ICON[t];
                const color = TIPO_NOTIFICACAO_COLOR[t];
                const active = tipo === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-medium transition-all"
                    style={
                      active
                        ? { borderColor: color, backgroundColor: color + "12", color }
                        : { borderColor: "#E5E7EB", backgroundColor: "#F7F9FC", color: "#6B7280" }
                    }
                  >
                    <Icon size={13} />
                    {TIPO_NOTIFICACAO_LABEL[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título da notificação..."
              maxLength={150}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] bg-[#F7F9FC] outline-none focus:border-[#3B8ED0] transition-colors placeholder-[#9CA3AF]"
            />
          </div>

          {/* Data e hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] bg-[#F7F9FC] outline-none focus:border-[#3B8ED0] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Hora</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] bg-[#F7F9FC] outline-none focus:border-[#3B8ED0] transition-colors"
              />
            </div>
          </div>

          {/* Mensagem */}
          <div>
            <label className="text-xs font-semibold text-[#6B7280] block mb-1.5">Mensagem</label>
            <textarea
              rows={3}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Texto da notificação..."
              maxLength={500}
              className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] bg-[#F7F9FC] outline-none focus:border-[#3B8ED0] transition-colors placeholder-[#9CA3AF] resize-none"
            />
            <p className="text-[10px] text-[#9CA3AF] text-right mt-0.5">{mensagem.length}/500</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#F0F2F5] bg-[#FAFBFC]">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#6B7280] border border-[#E5E7EB] hover:bg-[#F7F9FC] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-[#3B8ED0] text-white hover:bg-[#2563EB] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            {sending ? "Enviando..." : todosFlag ? "Enviar para todos" : `Enviar para ${selectedIds.length || 1}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

const TYPE_FILTERS: { value: "all" | TipoNotificacaoApi; label: string }[] = [
  { value: "all", label: "Todos" },
  ...TIPOS.map((t) => ({ value: t as "all" | TipoNotificacaoApi, label: TIPO_NOTIFICACAO_LABEL[t] })),
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ApiNotificacao[]>([]);
  const [usuarios, setUsuarios] = useState<ApiUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | TipoNotificacaoApi>("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [total, setTotal] = useState(0);
  const [naoLidas, setNaoLidas] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [notifRes, usersRes] = await Promise.all([
        webListarTodasNotificacoes(1, 200),
        webListarUsuarios(1, 200),
      ]);
      setNotifications(notifRes.dados);
      setTotal(notifRes.total);
      setNaoLidas(notifRes.naoLidas);
      setUsuarios(usersRes.dados);
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = notifications.filter((n) => {
    const matchType = typeFilter === "all" || n.tipo === typeFilter;
    const matchRead = readFilter === "all" || (readFilter === "unread" ? !n.lida : n.lida);
    return matchType && matchRead;
  });

  async function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
    setNaoLidas((c) => Math.max(0, c - 1));
    try {
      await webMarcarNotificacaoLida(id);
    } catch {
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, lida: false } : n));
      setNaoLidas((c) => c + 1);
    }
  }

  async function handleMarkAllRead() {
    const unreadIds = notifications.filter((n) => !n.lida).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, lida: true })));
    setNaoLidas(0);
    try {
      await Promise.all(unreadIds.map(webMarcarNotificacaoLida));
    } catch {
      loadAll();
    }
  }

  async function handleDelete(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setTotal((c) => c - 1);
    try {
      await webDeletarNotificacao(id);
    } catch {
      loadAll();
    }
  }

  const lidas = notifications.filter((n) => n.lida).length;
  const usuariosNotificados = new Set(notifications.map((n) => n.usuarioId)).size;

  const stats = [
    { label: "Total", value: total, color: "#3B8ED0", bg: "#E3F0FB", icon: Bell },
    { label: "Não Lidas", value: naoLidas, color: "#EF4444", bg: "#FEE2E2", icon: BellOff },
    { label: "Lidas", value: lidas, color: "#4CAF82", bg: "#E8F5EE", icon: CheckCheck },
    { label: "Usuários Notificados", value: usuariosNotificados, color: "#8B5CF6", bg: "#EDE9FE", icon: Users },
  ];

  const typeDistribution = TIPOS.map((tipo) => ({
    name: TIPO_NOTIFICACAO_LABEL[tipo],
    value: notifications.filter((n) => n.tipo === tipo).length,
    color: TIPO_NOTIFICACAO_COLOR[tipo],
  })).filter((d) => d.value > 0);

  function formatDate(date: string) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (date === today) return "Hoje";
    if (date === yesterday) return "Ontem";
    return date.split("-").reverse().join("/");
  }

  function getInitials(nome: string) {
    return nome.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  }

  return (
    <>
      <CreateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        usuarios={usuarios}
        onCreated={loadAll}
      />

      <div className="space-y-6 max-w-[1400px]">
        {/* Header */}
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #3B8ED0 0%, #1D4ED8 100%)" }}
        >
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <p className="text-white/80 text-sm font-medium">Conteúdo</p>
              <h2 className="text-2xl font-bold mt-1">Notificações</h2>
              <p className="text-white/70 text-sm mt-1">
                Central de alertas e comunicados para os pacientes
                {naoLidas > 0 && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                    {naoLidas} não lida{naoLidas !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setDialogOpen(true)}
              className="shrink-0 flex items-center gap-2 bg-white text-[#1D4ED8] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-white/90 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Nova Notificação
            </button>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <Bell size={120} strokeWidth={1} />
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
                {loading ? (
                  <div className="w-8 h-5 bg-gray-100 animate-pulse rounded mb-1" />
                ) : (
                  <p className="text-xl font-bold text-[#1A2332]">{s.value}</p>
                )}
                <p className="text-xs text-[#6B7280]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm w-full max-w-sm">
          <h3 className="font-bold text-[#1A2332] mb-1">Por Tipo</h3>
          <p className="text-xs text-[#9CA3AF] mb-3">Distribuição por categoria</p>
          {loading ? (
            <div className="h-36 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-[#3B8ED0]" />
            </div>
          ) : typeDistribution.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-xs text-[#9CA3AF]">Sem dados</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {typeDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} notificações`]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {typeDistribution.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate">{d.name}</span>
                    <span className="ml-auto font-semibold text-[#1A2332]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
            <h3 className="font-bold text-[#1A2332]">Histórico</h3>
            <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
              <Filter size={14} className="text-[#9CA3AF]" />
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={
                    typeFilter === f.value
                      ? { backgroundColor: "#E3F0FB", color: "#3B8ED0" }
                      : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                  }
                >
                  {f.label}
                </button>
              ))}
              <div className="w-px h-4 bg-[#E5E7EB]" />
              {(["all", "unread", "read"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setReadFilter(f)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={
                    readFilter === f
                      ? { backgroundColor: "#E8F5EE", color: "#4CAF82" }
                      : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                  }
                >
                  {{ all: "Todas", unread: "Não lidas", read: "Lidas" }[f]}
                </button>
              ))}
              {naoLidas > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#4CAF82] text-white hover:bg-[#388E63] transition-colors"
                >
                  <CheckCheck size={12} /> Marcar todas
                </button>
              )}
            </div>
            <button
              onClick={loadAll}
              className="flex items-center gap-1.5 border border-[#E5E7EB] text-[#6B7280] text-xs font-semibold px-3 py-2 rounded-xl hover:bg-[#F7F9FC] transition-colors"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Atualizar
            </button>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="divide-y divide-[#F0F2F5]">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-2 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Rows */}
          {!loading && (
            <div className="divide-y divide-[#F0F2F5]">
              {filtered.map((notif) => {
                const cfg = {
                  label: TIPO_NOTIFICACAO_LABEL[notif.tipo],
                  color: TIPO_NOTIFICACAO_COLOR[notif.tipo],
                  Icon: TYPE_ICON[notif.tipo],
                };
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 px-5 py-4 transition-colors ${notif.lida ? "hover:bg-[#F7F9FC]" : "bg-[#FAFBFF] hover:bg-[#F0F4FF]"}`}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: cfg.color + "20" }}>
                      <cfg.Icon size={16} style={{ color: cfg.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm font-semibold ${notif.lida ? "text-[#1A2332]" : "text-[#111827]"}`}>
                          {notif.titulo}
                        </p>
                        {!notif.lida && <span className="w-2 h-2 rounded-full bg-[#3B8ED0] shrink-0" />}
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto shrink-0"
                          style={{ backgroundColor: cfg.color + "15", color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7280] mb-1.5">{notif.mensagem}</p>
                      <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                        {notif.usuario && (
                          <span className="flex items-center gap-1">
                            <div
                              className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                              style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)", fontSize: 8 }}
                            >
                              {getInitials(notif.usuario.nome)}
                            </div>
                            {notif.usuario.nome}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Clock size={9} />
                          {formatDate(notif.data)} às {notif.hora}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.lida && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="p-1.5 rounded-lg hover:bg-[#E8F5EE] transition-colors"
                          title="Marcar como lida"
                        >
                          <CheckCheck size={14} className="text-[#4CAF82]" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-[#FEE2E2] transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={14} className="text-[#EF4444]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Bell size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma notificação encontrada</p>
            </div>
          )}

          <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
            {loading ? "Carregando..." : `${filtered.length} de ${total} notificações`}
          </div>
        </div>
      </div>
    </>
  );
}
