"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { webLogin, saveSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      setError("Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await webLogin(email.trim(), senha);
      if (data.usuario.perfil !== "ADMIN") {
        setError("Acesso restrito a administradores.");
        return;
      }
      saveSession(data.token, data.usuario);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">
      <div className="w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div
            className="px-8 py-10 text-white text-center"
            style={{ background: "linear-gradient(135deg, #4CAF82 0%, #2E9E6B 100%)" }}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-white" />
            </div>
            <p className="text-2xl font-extrabold tracking-widest">DIABETES</p>
            <p className="text-xs font-medium tracking-[0.5em] text-white/80 mt-0.5 mb-3">CARE</p>
            <p className="text-sm text-white/85">Painel Administrativo</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
            <div>
              <p className="text-xl font-extrabold text-[#1A2332] mb-1">Entrar</p>
              <p className="text-sm text-[#6B7280]">Use sua conta de administrador</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-[#FEE2E2] text-[#EF4444] text-sm px-4 py-3 rounded-xl">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1A2332]">E-mail</label>
              <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-4 h-12 bg-[#F7F9FC] focus-within:border-[#4CAF82] focus-within:ring-2 focus-within:ring-[#4CAF82]/20 transition-all">
                <Mail size={15} className="text-[#9CA3AF] shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  className="flex-1 bg-transparent text-sm outline-none text-[#1A2332] placeholder-[#9CA3AF]"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[#1A2332]">Senha</label>
              <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-xl px-4 h-12 bg-[#F7F9FC] focus-within:border-[#4CAF82] focus-within:ring-2 focus-within:ring-[#4CAF82]/20 transition-all">
                <Lock size={15} className="text-[#9CA3AF] shrink-0" />
                <input
                  type={showSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                  className="flex-1 bg-transparent text-sm outline-none text-[#1A2332] placeholder-[#9CA3AF]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((v) => !v)}
                  className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                >
                  {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-70"
              style={{ backgroundColor: "#4CAF82" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#388E63"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4CAF82"; }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                "Entrar no painel"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          DiabeControl Admin · Acesso restrito
        </p>
      </div>
    </div>
  );
}
