"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck, ChevronDown, ChevronUp, AlertCircle, CheckCircle2,
  AlertTriangle, Search, RefreshCw,
} from "lucide-react";
import {
  webListarTodosDiagnosticos,
  ApiDiagnostico,
  NIVEL_RISCO_LABEL,
  NIVEL_RISCO_COLOR,
  NIVEL_RISCO_BG,
  NivelRisco,
} from "@/lib/api";

// ─── Perguntas do questionário (mesmas do app mobile) ────────────────────────

const QUESTIONS: { id: string; question: string; options: string[] }[] = [
  {
    id: "q1",
    question: "Quantas vezes você já engravidou?",
    options: ["Nunca", "1 vez", "2 vezes", "3 vezes ou mais"],
  },
  {
    id: "q2",
    question: "Nível de glicose no exame de sangue",
    options: ["Abaixo de 100 mg/dL", "100-125 mg/dL", "126-199 mg/dL", "200 mg/dL ou mais"],
  },
  {
    id: "q3",
    question: "Pressão arterial mínima (mmHg)",
    options: ["Abaixo de 80", "80-89", "90-99", "100 ou mais"],
  },
  {
    id: "q4",
    question: "Gordura do braço na região do tríceps (mm)",
    options: ["Menos de 10 mm", "10-14 mm", "15-19 mm", "20 mm ou mais"],
  },
  {
    id: "q5",
    question: "Nível de insulina no exame",
    options: ["Abaixo de 10 µU/mL", "10-19 µU/mL", "20-29 µU/mL", "30 µU/mL ou mais"],
  },
  {
    id: "q6",
    question: "IMC (Índice de Massa Corporal)",
    options: ["Menos de 25", "25-29.9", "30-34.9", "35 ou mais"],
  },
  {
    id: "q7",
    question: "Familiares próximos com diabetes",
    options: ["Nenhum", "1 familiar", "2 familiares", "3 ou mais"],
  },
  {
    id: "q8",
    question: "Idade",
    options: ["Menos de 30 anos", "30-45 anos", "46-60 anos", "Mais de 60 anos"],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function RiskBadge({ nivel }: { nivel: NivelRisco }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color: NIVEL_RISCO_COLOR[nivel], background: NIVEL_RISCO_BG[nivel] }}
    >
      {nivel === "low" && <CheckCircle2 size={12} />}
      {nivel === "medium" && <AlertTriangle size={12} />}
      {nivel === "high" && <AlertCircle size={12} />}
      {NIVEL_RISCO_LABEL[nivel]}
    </span>
  );
}

function PredicaoBadge({ predicao }: { predicao: number }) {
  const isDiabetico = predicao === 1;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        color: isDiabetico ? "#EF4444" : "#4CAF82",
        background: isDiabetico ? "#FEE2E2" : "#E8F5EE",
      }}
    >
      {isDiabetico ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
      {isDiabetico ? "Indicativo" : "Sem Indicativo"}
    </span>
  );
}

function AnswersPanel({ respostas }: { respostas: Record<string, number> }) {
  return (
    <div className="bg-[#F7F9FC] rounded-xl p-4 mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
      {QUESTIONS.map((q) => {
        const val = respostas[q.id];
        const label = val !== undefined ? q.options[val] : "—";
        return (
          <div key={q.id} className="flex flex-col gap-0.5">
            <p className="text-[11px] text-[#9CA3AF] font-medium">{q.question}</p>
            <p className="text-sm text-[#1A2332] font-semibold">{label}</p>
          </div>
        );
      })}
    </div>
  );
}

function DiagRow({ diag }: { diag: ApiDiagnostico }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(diag.criadoEm).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const time = new Date(diag.criadoEm).toLocaleTimeString("pt-BR", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="border border-[#E5E7EB] rounded-2xl bg-white overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#F7F9FC] transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
        >
          {(diag.usuario?.nome ?? "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        {/* Name / email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A2332] truncate">
            {diag.usuario?.nome ?? "Usuário desconhecido"}
          </p>
          <p className="text-xs text-[#9CA3AF] truncate">{diag.usuario?.email ?? ""}</p>
        </div>

        {/* Badges */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <RiskBadge nivel={diag.nivelRisco} />
          <PredicaoBadge predicao={diag.predicao} />
        </div>

        {/* Score */}
        <div className="hidden md:flex flex-col items-center shrink-0 px-4">
          <p className="text-lg font-bold text-[#1A2332]">{diag.pontuacao}</p>
          <p className="text-[10px] text-[#9CA3AF]">/ 24 pts</p>
        </div>

        {/* Probability */}
        <div className="hidden md:flex flex-col items-center shrink-0 px-2">
          <p className="text-lg font-bold" style={{ color: diag.predicao === 1 ? "#EF4444" : "#4CAF82" }}>
            {Math.round(diag.probabilidade * 100)}%
          </p>
          <p className="text-[10px] text-[#9CA3AF]">probabilidade</p>
        </div>

        {/* Date */}
        <div className="hidden lg:flex flex-col items-end shrink-0 px-2">
          <p className="text-xs font-medium text-[#6B7280]">{date}</p>
          <p className="text-[10px] text-[#9CA3AF]">{time}</p>
        </div>

        {/* Expand icon */}
        <div className="shrink-0 text-[#9CA3AF]">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Mobile badges row */}
      {!expanded && (
        <div className="sm:hidden flex items-center gap-2 px-5 pb-3">
          <RiskBadge nivel={diag.nivelRisco} />
          <PredicaoBadge predicao={diag.predicao} />
          <span className="text-xs text-[#9CA3AF] ml-auto">{date}</span>
        </div>
      )}

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#E5E7EB]">
          {/* Stats row (visible on mobile too) */}
          <div className="flex flex-wrap gap-4 py-4">
            <div className="flex flex-col">
              <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wide">Pontuação</p>
              <p className="text-xl font-bold text-[#1A2332]">{diag.pontuacao} / 24</p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wide">Percentual de risco</p>
              <p className="text-xl font-bold text-[#1A2332]">{diag.percentual}%</p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wide">Probabilidade (ML)</p>
              <p
                className="text-xl font-bold"
                style={{ color: diag.predicao === 1 ? "#EF4444" : "#4CAF82" }}
              >
                {Math.round(diag.probabilidade * 100)}%
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] text-[#9CA3AF] font-medium uppercase tracking-wide">Data</p>
              <p className="text-xl font-bold text-[#1A2332]">{date} {time}</p>
            </div>
          </div>

          {/* Answers */}
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">
            Respostas do questionário
          </p>
          <AnswersPanel respostas={diag.respostas} />
        </div>
      )}
    </div>
  );
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, color, sub }: {
  label: string; value: string | number; color: string; sub?: string;
}) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl px-5 py-4">
      <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-[#9CA3AF] mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DiagnosisPage() {
  const [dados, setDados] = useState<ApiDiagnostico[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRisco, setFilterRisco] = useState<NivelRisco | "">("");
  const [filterPredicao, setFilterPredicao] = useState<"" | "0" | "1">("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await webListarTodosDiagnosticos(1, 200);
      setDados(res.dados);
      setTotal(res.total);
    } catch {
      // handled by auto-logout in apiReq
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = dados.filter((d) => {
    if (filterRisco && d.nivelRisco !== filterRisco) return false;
    if (filterPredicao !== "" && String(d.predicao) !== filterPredicao) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !d.usuario?.nome?.toLowerCase().includes(q) &&
        !d.usuario?.email?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  // Summary stats
  const totalHigh   = dados.filter((d) => d.nivelRisco === "high").length;
  const totalMedium = dados.filter((d) => d.nivelRisco === "medium").length;
  const totalDiab   = dados.filter((d) => d.predicao === 1).length;
  const avgScore    = dados.length
    ? Math.round(dados.reduce((s, d) => s + d.pontuacao, 0) / dados.length)
    : 0;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #4CAF82, #2E9E6B)" }}
        >
          <ShieldCheck size={20} color="white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1A2332]">Diagnósticos</h1>
          <p className="text-sm text-[#9CA3AF]">
            {total} resultado{total !== 1 ? "s" : ""} registrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={load}
          className="ml-auto flex items-center gap-2 text-sm text-[#4CAF82] font-medium hover:underline"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Total" value={total} color="#3B8ED0" />
        <SummaryCard label="Alto risco" value={totalHigh} color="#EF4444" sub="nível alto" />
        <SummaryCard label="Indicativo ML" value={totalDiab} color="#EF4444" sub="de diabetes" />
        <SummaryCard label="Pontuação média" value={`${avgScore} pts`} color="#4CAF82" sub="de 24 possíveis" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 flex-1 min-w-[180px]">
          <Search size={15} className="text-[#9CA3AF] shrink-0" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#1A2332] placeholder-[#9CA3AF] outline-none"
          />
        </div>

        <select
          value={filterRisco}
          onChange={(e) => setFilterRisco(e.target.value as NivelRisco | "")}
          className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] outline-none cursor-pointer"
        >
          <option value="">Todos os riscos</option>
          <option value="low">Risco Baixo</option>
          <option value="medium">Risco Médio</option>
          <option value="high">Risco Alto</option>
        </select>

        <select
          value={filterPredicao}
          onChange={(e) => setFilterPredicao(e.target.value as "" | "0" | "1")}
          className="bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#1A2332] outline-none cursor-pointer"
        >
          <option value="">Todos (ML)</option>
          <option value="1">Indicativo de Diabetes</option>
          <option value="0">Sem Indicativo</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-[#4CAF82]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-[#9CA3AF] gap-3">
          <ShieldCheck size={40} className="opacity-30" />
          <p className="text-sm">Nenhum diagnóstico encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <DiagRow key={d.id} diag={d} />
          ))}
        </div>
      )}
    </div>
  );
}
