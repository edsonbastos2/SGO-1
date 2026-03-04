"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  CalendarDays,
  RefreshCw,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";

interface Competencia {
  id: string;
  mes: number;
  ano: number;
  status: "ABERTA" | "FECHADA";
  dataAbertura: string;
  dataFechamento: string | null;
  justificativaReabertura: string | null;
  _count: { extras: number; faltas: number; calendarios: number };
}

const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function ModalNovaCompetencia({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const salvar = async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/competencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mes,
          ano,
          dataAbertura: new Date().toISOString().split("T")[0],
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.error ?? "Erro");
        return;
      }
      onSave();
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const anos = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 1 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2540]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <CalendarDays size={13} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Nova Competência
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#445870] hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest mb-1.5">
                Mês
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="w-full bg-[#0a0f1a] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
              >
                {MESES.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest mb-1.5">
                Ano
              </label>
              <select
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                className="w-full bg-[#0a0f1a] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50 transition-colors"
              >
                {anos.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {erro && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {erro}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-[#7e9ab5] bg-[#0a0f1a] border border-[#1a2540] hover:border-[#2a3f5f] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Abrindo..." : "Abrir Competência"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalReabrir({
  competencia,
  onClose,
  onSave,
}: {
  competencia: Competencia;
  onClose: () => void;
  onSave: () => void;
}) {
  const [justificativa, setJustificativa] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const salvar = async () => {
    if (!justificativa.trim()) {
      setErro("Justificativa obrigatória");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(`/api/competencias/${competencia.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reabrir",
          justificativaReabertura: justificativa,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.error ?? "Erro");
        return;
      }
      onSave();
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2540]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Unlock size={13} className="text-amber-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Reabrir Competência
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#445870] hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-2">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            <span>
              Reabertura de competência requer justificativa e será registrada
              na auditoria.
            </span>
          </div>
          <div>
            <label className="block text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest mb-1.5">
              Justificativa *
            </label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={3}
              placeholder="Motivo da reabertura..."
              className="w-full bg-[#0a0f1a] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all resize-none"
            />
          </div>
          {erro && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {erro}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-[#7e9ab5] bg-[#0a0f1a] border border-[#1a2540] hover:border-[#2a3f5f] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={salvar}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Reabrindo..." : "Confirmar Reabertura"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompetenciasPage() {
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("");
  const [modalNova, setModalNova] = useState(false);
  const [modalReabrir, setModalReabrir] = useState<Competencia | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroStatus) params.set("status", filtroStatus);
      const res = await fetch(`/api/competencias?${params}`);
      const data = await res.json();
      setCompetencias(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const fechar = async (id: string) => {
    if (
      !confirm(
        "Fechar esta competência? Após fechada, lançamentos serão bloqueados.",
      )
    )
      return;
    const res = await fetch(`/api/competencias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "fechar" }),
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
          <h2 className="text-xl font-semibold text-white">Competências</h2>
          <p className="text-sm text-[#7e9ab5] mt-0.5">
            Controle de períodos de apuração
          </p>
        </div>
        <button
          onClick={() => setModalNova(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Nova Competência</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {[
          ["", "Todas"],
          ["ABERTA", "Abertas"],
          ["FECHADA", "Fechadas"],
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
          className="px-3 py-2 rounded-lg text-[#445870] bg-[#0f1623] border border-[#1a2540] hover:text-white transition-colors ml-auto"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-[#445870] text-sm gap-2">
          <RefreshCw size={15} className="animate-spin" /> Carregando...
        </div>
      ) : competencias.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 bg-[#0f1623] border border-[#1a2540] rounded-xl">
          <CalendarDays size={28} className="text-[#2a3f5f]" />
          <p className="text-sm text-[#445870]">
            Nenhuma competência encontrada
          </p>
          <button
            onClick={() => setModalNova(true)}
            className="text-xs text-blue-400 hover:underline"
          >
            Abrir primeira competência
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competencias.map((c) => {
            const aberta = c.status === "ABERTA";
            return (
              <div
                key={c.id}
                className={clsx(
                  "bg-[#0f1623] border rounded-xl p-5 space-y-4 transition-colors",
                  aberta ? "border-blue-500/20" : "border-[#1a2540]",
                )}
              >
                {/* Título */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-mono font-bold text-white">
                      {MESES[c.mes - 1]}{" "}
                      <span className="text-[#445870]">{c.ano}</span>
                    </p>
                    <p className="text-[10px] text-[#445870] font-mono mt-0.5">
                      Aberta em{" "}
                      {new Date(c.dataAbertura).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                      aberta
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-[#1a2540] text-[#445870] border-[#1a2540]",
                    )}
                  >
                    {aberta ? (
                      <>
                        <span className="w-1 h-1 rounded-full bg-emerald-400" />
                        Aberta
                      </>
                    ) : (
                      <>
                        <Lock size={9} />
                        Fechada
                      </>
                    )}
                  </span>
                </div>

                {/* Contadores */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "Extras",
                      value: c._count.extras,
                      color: "text-blue-400",
                    },
                    {
                      label: "Faltas",
                      value: c._count.faltas,
                      color: "text-red-400",
                    },
                    {
                      label: "Calendário",
                      value: c._count.calendarios,
                      color: "text-[#7e9ab5]",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-[#0a0f1a] border border-[#1a2540] rounded-lg p-2 text-center"
                    >
                      <p
                        className={clsx(
                          "text-lg font-mono font-bold",
                          item.color,
                        )}
                      >
                        {item.value}
                      </p>
                      <p className="text-[9px] text-[#445870] font-mono uppercase tracking-wider">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Fechamento */}
                {!aberta && c.dataFechamento && (
                  <div className="flex items-center gap-1.5 text-[10px] text-[#445870] font-mono">
                    <CheckCircle2 size={11} className="text-[#445870]" />
                    Fechada em{" "}
                    {new Date(c.dataFechamento).toLocaleDateString("pt-BR")}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-1 border-t border-[#1a2540]">
                  {aberta ? (
                    <button
                      onClick={() => fechar(c.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#7e9ab5] bg-[#0a0f1a] border border-[#1a2540] hover:border-red-500/30 hover:text-red-400 transition-colors"
                    >
                      <Lock size={12} /> Fechar
                    </button>
                  ) : (
                    <button
                      onClick={() => setModalReabrir(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#7e9ab5] bg-[#0a0f1a] border border-[#1a2540] hover:border-amber-500/30 hover:text-amber-400 transition-colors"
                    >
                      <Unlock size={12} /> Reabrir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalNova && (
        <ModalNovaCompetencia
          onClose={() => setModalNova(false)}
          onSave={() => {
            setModalNova(false);
            carregar();
          }}
        />
      )}
      {modalReabrir && (
        <ModalReabrir
          competencia={modalReabrir}
          onClose={() => setModalReabrir(null)}
          onSave={() => {
            setModalReabrir(null);
            carregar();
          }}
        />
      )}
    </div>
  );
}
