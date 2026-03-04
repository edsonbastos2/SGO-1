"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MapPin,
  Clock,
} from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

interface Colaborador {
  id: string;
  matricula: string;
  cpf: string;
  nome: string;
  status: "ATIVO" | "RESERVA" | "DESLIGADO" | "AFASTADO";
  dataAdmissao: string;
  prestadora: { id: string; nomeFantasia: string | null };
  funcao: { id: string; nome: string } | null;
  escala: { id: string; nome: string } | null;
  alocacoes: Array<{
    posto: {
      identificador: string;
      tomador: { nomeFantasia: string | null; razaoSocial: string };
    };
    turno: { nome: string; entrada: string; saida: string };
  }>;
}

const STATUS_CONFIG = {
  ATIVO: {
    label: "Ativo",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  RESERVA: {
    label: "Reserva",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
  AFASTADO: {
    label: "Afastado",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  },
  DESLIGADO: {
    label: "Desligado",
    bg: "bg-[#1a2540]",
    text: "text-[#445870]",
    border: "border-[#1a2540]",
    dot: "bg-[#445870]",
  },
};

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
        c.bg,
        c.text,
        c.border,
      )}
    >
      <span className={clsx("w-1 h-1 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function Initials({ nome }: { nome: string }) {
  const parts = nome.trim().split(" ");
  const init =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return (
    <span className="text-xs font-mono font-bold text-blue-400">
      {init.toUpperCase()}
    </span>
  );
}

export default function ColaboradoresPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("ATIVO");
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
      const res = await fetch(`/api/colaboradores?${params}`);
      const data = await res.json();
      setColaboradores(data.colaboradores ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroStatus, page]);

  useEffect(() => {
    setPage(1);
  }, [busca, filtroStatus]);
  useEffect(() => {
    carregar();
  }, [carregar]);

  const formatCPF = (cpf: string) =>
    cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");

  return (
    <div className="p-5 md:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Colaboradores</h2>
          <p className="text-sm text-[#7e9ab5] mt-0.5">
            {total > 0
              ? `${total} colaborador${total !== 1 ? "es" : ""} encontrado${total !== 1 ? "s" : ""}`
              : "Gestão de colaboradores"}
          </p>
        </div>
        <Link
          href="/colaboradores/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Novo Colaborador</span>
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
            placeholder="Buscar por nome, CPF ou matrícula..."
            className="w-full bg-[#0f1623] border border-[#1a2540] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            ["", "Todos"],
            ["ATIVO", "Ativos"],
            ["RESERVA", "Reserva"],
            ["AFASTADO", "Afastados"],
            ["DESLIGADO", "Desligados"],
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

      {/* Lista */}
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#445870] text-sm gap-2">
            <RefreshCw size={15} className="animate-spin" /> Carregando...
          </div>
        ) : colaboradores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Users size={28} className="text-[#2a3f5f]" />
            <p className="text-sm text-[#445870]">
              Nenhum colaborador encontrado
            </p>
            <Link
              href="/colaboradores/novo"
              className="text-xs text-blue-400 hover:underline"
            >
              Cadastrar primeiro colaborador
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2540]">
                    {[
                      "Colaborador",
                      "Matrícula",
                      "Função",
                      "Alocação Atual",
                      "Admissão",
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
                  {colaboradores.map((c) => {
                    const alocacao = c.alocacoes[0];
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-[#111827] transition-colors group"
                      >
                        {/* Nome */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                              <Initials nome={c.nome} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">
                                {c.nome}
                              </p>
                              <p className="text-[10px] text-[#445870] font-mono">
                                {formatCPF(c.cpf)}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Matrícula */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-[#7e9ab5] bg-[#0a0f1a] border border-[#1a2540] px-2 py-0.5 rounded">
                            {c.matricula}
                          </span>
                        </td>
                        {/* Função */}
                        <td className="px-4 py-3">
                          {c.funcao ? (
                            <div className="flex items-center gap-1.5 text-sm text-[#7e9ab5]">
                              <Briefcase size={12} className="text-[#445870]" />
                              <span>{c.funcao.nome}</span>
                            </div>
                          ) : (
                            <span className="text-[#2a3f5f]">—</span>
                          )}
                        </td>
                        {/* Alocação */}
                        <td className="px-4 py-3">
                          {alocacao ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-xs text-[#7e9ab5]">
                                <MapPin size={11} className="text-[#445870]" />
                                <span>
                                  {alocacao.posto.tomador.nomeFantasia ??
                                    alocacao.posto.tomador.razaoSocial}{" "}
                                  · {alocacao.posto.identificador}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-[#445870]">
                                <Clock size={10} />
                                <span className="font-mono">
                                  {alocacao.turno.entrada}–
                                  {alocacao.turno.saida}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                              Sem alocação
                            </span>
                          )}
                        </td>
                        {/* Admissão */}
                        <td className="px-4 py-3 text-sm font-mono text-[#7e9ab5]">
                          {new Date(c.dataAdmissao).toLocaleDateString("pt-BR")}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={c.status} />
                        </td>
                        {/* Ações */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            <Link
                              href={`/colaboradores/${c.id}`}
                              className="px-2.5 py-1.5 rounded text-xs text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-colors"
                            >
                              Ver detalhes
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {pages > 1 && (
              <div className="px-4 py-3 border-t border-[#1a2540] flex items-center justify-between">
                <span className="text-xs text-[#445870] font-mono">
                  Página {page} de {pages} · {total} registros
                </span>
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
              </div>
            )}
            {pages <= 1 && (
              <div className="px-4 py-3 border-t border-[#1a2540]">
                <span className="text-xs text-[#445870] font-mono">
                  {total} colaborador(es)
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
