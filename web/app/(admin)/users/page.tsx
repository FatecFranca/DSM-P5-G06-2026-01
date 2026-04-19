"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Users, Activity, CheckCircle2, XCircle, Filter, AlertCircle } from "lucide-react";
import { webListarUsuarios, ApiUsuario, TIPO_DIABETES_LABEL } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";

type DiabetesKey = ApiUsuario["tipoDiabetes"];

const DIABETES_LABEL: Record<DiabetesKey, string> = {
  NENHUM: "Sem diagnóstico",
  TIPO1: "Tipo 1",
  TIPO2: "Tipo 2",
  GESTACIONAL: "Gestacional",
  PRE_DIABETES: "Pré-diabetes",
};

const DIABETES_COLOR: Record<DiabetesKey, string> = {
  NENHUM: "#9CA3AF",
  TIPO1: "#3B8ED0",
  TIPO2: "#4CAF82",
  GESTACIONAL: "#EC4899",
  PRE_DIABETES: "#F59E0B",
};

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    (async () => {
      try {
        const result = await webListarUsuarios(1, 100);
        setUsers(result.dados);
      } catch (err: any) {
        setError(err?.message ?? "Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active" ? u.status === "ATIVO" : u.status === "INATIVO");
    return matchSearch && matchFilter;
  });

  const totalAtivos = users.filter((u) => u.status === "ATIVO").length;
  const totalInativos = users.filter((u) => u.status === "INATIVO").length;

  const stats = [
    { label: "Total", value: users.length, color: "#4CAF82", bg: "#E8F5EE", icon: Users },
    { label: "Ativos", value: totalAtivos, color: "#10B981", bg: "#D1FAE5", icon: CheckCircle2 },
    { label: "Inativos", value: totalInativos, color: "#EF4444", bg: "#FEE2E2", icon: XCircle },
    { label: "Perfis", value: users.filter((u) => u.perfil === "ADMIN").length + " admin", color: "#3B8ED0", bg: "#E3F0FB", icon: Activity },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-[#4CAF82]" fill="none" viewBox="0 0 24 24">
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
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <s.icon size={22} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2332]">{s.value}</p>
              <p className="text-xs text-[#6B7280]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2 bg-[#F7F9FC] border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 max-w-sm">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="bg-transparent text-sm outline-none flex-1 text-[#1A2332] placeholder-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#9CA3AF]" />
            {(["all", "active", "inactive"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  filter === f
                    ? { backgroundColor: "#E8F5EE", color: "#4CAF82" }
                    : { backgroundColor: "#F7F9FC", color: "#6B7280" }
                }
              >
                {{ all: "Todos", active: "Ativos", inactive: "Inativos" }[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F7F9FC]">
                {["Usuário", "Tipo Diabetes", "Glicose Alvo", "Médico", "Membro desde", "Status", "Perfil"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-[#9CA3AF] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {filtered.map((u) => {
                const dtColor = DIABETES_COLOR[u.tipoDiabetes] ?? "#9CA3AF";
                return (
                  <tr key={u.id} className="hover:bg-[#F7F9FC] transition-colors">
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                        >
                          {getInitials(u.nome)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A2332]">{u.nome}</p>
                          <p className="text-xs text-[#9CA3AF]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Tipo */}
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: dtColor + "20", color: dtColor }}
                      >
                        {DIABETES_LABEL[u.tipoDiabetes] ?? u.tipoDiabetes}
                      </span>
                    </td>
                    {/* Glicose */}
                    <td className="px-5 py-3.5 text-xs text-[#1A2332]">
                      {u.glicoseAlvoMin && u.glicoseAlvoMax
                        ? `${u.glicoseAlvoMin}–${u.glicoseAlvoMax} mg/dL`
                        : <span className="text-[#9CA3AF]">—</span>
                      }
                    </td>
                    {/* Médico */}
                    <td className="px-5 py-3.5 text-xs text-[#6B7280]">
                      {u.nomeMedico ?? <span className="text-[#9CA3AF]">—</span>}
                    </td>
                    {/* Membro desde */}
                    <td className="px-5 py-3.5 text-xs text-[#6B7280]">
                      {formatDate(u.criadoEm.split("T")[0])}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={
                          u.status === "ATIVO"
                            ? { backgroundColor: "#D1FAE5", color: "#10B981" }
                            : { backgroundColor: "#FEE2E2", color: "#EF4444" }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: u.status === "ATIVO" ? "#10B981" : "#EF4444" }}
                        />
                        {u.status === "ATIVO" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    {/* Perfil */}
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={
                          u.perfil === "ADMIN"
                            ? { backgroundColor: "#EDE9FE", color: "#8B5CF6" }
                            : { backgroundColor: "#F3F4F6", color: "#6B7280" }
                        }
                      >
                        {u.perfil === "ADMIN" ? "Admin" : "Usuário"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#9CA3AF]">
              <Users size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#F0F2F5] text-xs text-[#9CA3AF]">
          {filtered.length} de {users.length} usuários
        </div>
      </div>

      {/* User detail cards */}
      {users.slice(0, 4).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {users.slice(0, 4).map((u) => {
            const dtColor = DIABETES_COLOR[u.tipoDiabetes] ?? "#9CA3AF";
            return (
              <div key={u.id} className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
                  >
                    {getInitials(u.nome)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[#1A2332] text-sm truncate">{u.nome}</p>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: dtColor + "20", color: dtColor }}
                    >
                      {DIABETES_LABEL[u.tipoDiabetes] ?? u.tipoDiabetes}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    { label: "Idade", value: u.idade ? `${u.idade} anos` : "—" },
                    { label: "Peso", value: u.peso ? `${u.peso} kg` : "—" },
                    { label: "Médico", value: u.nomeMedico ?? "—" },
                    { label: "Cadastro", value: formatDate(u.criadoEm.split("T")[0]) },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between">
                      <span className="text-[#9CA3AF]">{row.label}</span>
                      <span className="font-medium text-[#1A2332]">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
