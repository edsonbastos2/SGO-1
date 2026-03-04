"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Network,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  PowerOff,
  Building2,
  Clock,
  Briefcase,
  User,
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

interface Alocacao {
  id: string;
  status: "ATIVA" | "ENCERRADA";
  dataInicio: string;
  dataFim: string | null;
  colaborador: {
    id: string;
    nome: string;
    matricula: string;
    cpf: string;
    status: string;
  };
  posto: {
    id: string;
    identificador: string;
    tomador: { nomeFantasia: string | null; razaoSocial: string };
  };
  turno: { id: string; nome: string; entrada: string; saida: string };
  funcao: { id: string; nome: string };
}

interface Tomador {
  id: string;
  nomeFantasia: string | null;
  razaoSocial: string;
}

function Initials({ nome }: { nome: string }) {
  const p = nome.trim().split(" ");
  const i = p.length >= 2 ? p[0][0] + p[p.length - 1][0] : p[0].slice(0, 2);
  return (
    <span className="text-xs font-mono font-bold text-blue-400">
      {i.toUpperCase()}
    </span>
  );
}

export default function AlocacoesPage() {
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [tomadores, setTomadores] = useState<Tomador[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ATIVA");
  const [filtroTom, setFiltroTom] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        busca,
        page: String(page),
        limit: "20",
      });
      if (filtroStatus) params.set("status", filtroStatus);
      if (filtroTom) params.set("tomadorId", filtroTom);

      const [resAloc, resTom] = await Promise.all([
        fetch(`/api/alocacoes?${params}`),
        fetch("/api/tomadores?ativo=true"),
      ]);
      const [a, t] = await Promise.all([resAloc.json(), resTom.json()]);
      setAlocacoes(a.alocacoes ?? []);
      setTotal(a.total ?? 0);
      setPages(a.pages ?? 1);
      setTomadores(Array.isArray(t) ? t : []);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroStatus, filtroTom, page]);

  useEffect(() => {
    setPage(1);
  }, [busca, filtroStatus, filtroTom]);
  useEffect(() => {
    carregar();
  }, [carregar]);

  const encerrar = async (id: string) => {
    if (!confirm("Encerrar esta alocação?")) return;
    const res = await fetch(`/api/alocacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "ENCERRADA",
        dataFim: new Date().toISOString().split("T")[0],
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error);
      return;
    }
    carregar();
  };

  return (
    <div className="p-5 md:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Alocações</h2>
          <p className="text-sm text-[#7e9ab5] mt-0.5">
            {total > 0
              ? `${total} alocação${total !== 1 ? "ões" : ""} encontrada${total !== 1 ? "s" : ""}`
              : "Vínculos colaborador × posto × turno"}
          </p>
        </div>
        <Link
          href="/colaboradores"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-sm font-medium transition-colors"
        >
          <User size={15} />
          <span className="hidden sm:inline">Via Colaborador</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#445870]"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, matrícula ou CPF..."
            className="w-full bg-[#0f1623] border border-[#1a2540] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <select
          value={filtroTom}
          onChange={(e) => setFiltroTom(e.target.value)}
          className="bg-[#0f1623] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-[#7e9ab5] outline-none focus:border-blue-500/50 transition-colors min-w-[160px]"
        >
          <option value="">Todos os tomadores</option>
          {tomadores.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nomeFantasia ?? t.razaoSocial}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {[
            ["ATIVA", "Ativas"],
            ["ENCERRADA", "Encerradas"],
            ["", "Todas"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFiltroStatus(v)}
              className={clsx(
                "px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                filtroStatus === v
                  ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                  : "text-[#445870] bg-[#0f1623] border-[#1a2540] hover:border-[#2a3f5f]",
              )}
            >
              {l}
            </button>
          ))}
          <button
            onClick={carregar}
            className="px-3 py-2 rounded-lg text-[#445870] bg-[#0f1623] border border-[#1a2540] hover:text-white transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0a0f1a] border border-[#1a2540] text-xs text-[#445870]">
        <Network size={13} className="text-blue-400 flex-shrink-0" />
        <span>
          Para criar uma nova alocação, acesse o perfil do colaborador em{" "}
          <Link href="/colaboradores" className="text-blue-400 hover:underline">
            Colaboradores
          </Link>{" "}
          → aba Alocações.
        </span>
      </div>

      {/* Tabela */}
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#445870] text-sm gap-2">
            <RefreshCw size={15} className="animate-spin" /> Carregando...
          </div>
        ) : alocacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Network size={28} className="text-[#2a3f5f]" />
            <p className="text-sm text-[#445870]">
              Nenhuma alocação encontrada
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2540]">
                    {[
                      "Colaborador",
                      "Posto / Tomador",
                      "Função",
                      "Turno",
                      "Início",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-mono font-medium text-[#2a3f5f] uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2540]">
                  {alocacoes.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-[#111827] transition-colors group"
                    >
                      {/* Colaborador */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Initials nome={a.colaborador.nome} />
                          </div>
                          <div>
                            <Link
                              href={`/colaboradores/${a.colaborador.id}`}
                              className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
                            >
                              {a.colaborador.nome}
                            </Link>
                            <p className="text-[10px] text-[#445870] font-mono">
                              Mat. {a.colaborador.matricula}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Posto */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-sm text-white">
                            <Building2 size={12} className="text-[#445870]" />
                            <span>
                              {a.posto.tomador.nomeFantasia ??
                                a.posto.tomador.razaoSocial}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#445870] font-mono pl-4">
                            {a.posto.identificador}
                          </p>
                        </div>
                      </td>
                      {/* Função */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-[#7e9ab5]">
                          <Briefcase size={12} className="text-[#445870]" />
                          <span>{a.funcao.nome}</span>
                        </div>
                      </td>
                      {/* Turno */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="text-xs text-[#7e9ab5]">
                            {a.turno.nome}
                          </p>
                          <p className="text-[10px] font-mono text-[#445870]">
                            {a.turno.entrada}–{a.turno.saida}
                          </p>
                        </div>
                      </td>
                      {/* Início */}
                      <td className="px-4 py-3 text-sm font-mono text-[#7e9ab5]">
                        {new Date(a.dataInicio).toLocaleDateString("pt-BR")}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                            a.status === "ATIVA"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-[#1a2540] text-[#445870] border-[#1a2540]",
                          )}
                        >
                          <span
                            className={clsx(
                              "w-1 h-1 rounded-full",
                              a.status === "ATIVA"
                                ? "bg-emerald-400"
                                : "bg-[#445870]",
                            )}
                          />
                          {a.status === "ATIVA" ? "Ativa" : "Encerrada"}
                        </span>
                      </td>
                      {/* Ações */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          <Link
                            href={`/colaboradores/${a.colaborador.id}`}
                            className="px-2 py-1.5 rounded text-xs text-[#445870] hover:text-white hover:bg-[#1a2540] transition-colors"
                          >
                            Ver colaborador
                          </Link>
                          {a.status === "ATIVA" && (
                            <button
                              onClick={() => encerrar(a.id)}
                              className="p-1.5 rounded hover:bg-red-500/10 text-[#445870] hover:text-red-400 transition-colors"
                              title="Encerrar"
                            >
                              <PowerOff size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="px-4 py-3 border-t border-[#1a2540] flex items-center justify-between">
              <span className="text-xs text-[#445870] font-mono">
                {pages > 1 ? `Página ${page} de ${pages} · ` : ""}
                {total} alocação(ões)
              </span>
              {pages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded text-[#445870] hover:text-white hover:bg-[#1a2540] disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="p-1.5 rounded text-[#445870] hover:text-white hover:bg-[#1a2540] disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
