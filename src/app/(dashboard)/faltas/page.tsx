"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  UserX,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────
interface Falta {
  id: string;
  data: string;
  tipo: string;
  coberto: boolean;
  cancelado: boolean;
  colaborador: { id: string; nome: string; matricula: string };
  substituto: { id: string; nome: string; matricula: string } | null;
  competencia: { id: string; mes: number; ano: number; status: string };
  posto: {
    id: string;
    identificador: string;
    tomador: { nomeFantasia: string | null; razaoSocial: string };
  };
  turno: { id: string; nome: string; entrada: string; saida: string };
}
interface Competencia {
  id: string;
  mes: number;
  ano: number;
  status: string;
}
interface Colaborador {
  id: string;
  nome: string;
  matricula: string;
}
interface Posto {
  id: string;
  identificador: string;
  tomador: { nomeFantasia: string | null; razaoSocial: string };
}
interface Turno {
  id: string;
  nome: string;
  entrada: string;
  saida: string;
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
const TIPOS = ["INJUSTIFICADA", "JUSTIFICADA", "ATESTADO", "ABONO", "OUTROS"];
const TIPO_LABEL: Record<
  string,
  { label: string; color: string; border: string; bg: string }
> = {
  INJUSTIFICADA: {
    label: "Injustificada",
    color: "text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/10",
  },
  JUSTIFICADA: {
    label: "Justificada",
    color: "text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/10",
  },
  ATESTADO: {
    label: "Atestado",
    color: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/10",
  },
  ABONO: {
    label: "Abono",
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/10",
  },
  OUTROS: {
    label: "Outros",
    color: "text-[#7e9ab5]",
    border: "border-[#2a3f5f]",
    bg: "bg-[#1a2540]",
  },
};

// ─── Schema ───────────────────────────────────────────────────
const schema = z.object({
  colaboradorId: z.string().min(1, "Obrigatório"),
  competenciaId: z.string().min(1, "Obrigatório"),
  data: z.string().min(1, "Obrigatório"),
  postoId: z.string().min(1, "Obrigatório"),
  turnoId: z.string().min(1, "Obrigatório"),
  tipo: z.enum(["INJUSTIFICADA", "JUSTIFICADA", "ATESTADO", "ABONO", "OUTROS"]),
  substitutoId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

// ─── Helpers ──────────────────────────────────────────────────
const inputCls = (err?: boolean) =>
  clsx(
    "w-full bg-[#0a0f1a] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none transition-all focus:ring-1",
    err
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-[#1a2540] focus:border-blue-500/50 focus:ring-blue-500/30",
  );

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Modal Nova Falta ─────────────────────────────────────────
function ModalFalta({
  competencias,
  onClose,
  onSave,
}: {
  competencias: Competencia[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [buscaColab, setBuscaColab] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: "INJUSTIFICADA" },
  });

  // Busca colaboradores ao digitar
  useEffect(() => {
    if (buscaColab.length < 2) {
      setColaboradores([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/colaboradores?busca=${buscaColab}&status=ATIVO&limit=10`,
      );
      const data = await res.json();
      setColaboradores(data.colaboradores ?? []);
    }, 300);
    return () => clearTimeout(timer);
  }, [buscaColab]);

  useEffect(() => {
    Promise.all([
      fetch("/api/postos?ativo=true").then((r) => r.json()),
      fetch("/api/turnos?ativo=true").then((r) => r.json()),
    ]).then(([p, t]) => {
      setPostos(Array.isArray(p) ? p : []);
      setTurnos(Array.isArray(t) ? t : []);
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/faltas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  const competenciasAbertas = competencias.filter((c) => c.status === "ABERTA");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2540] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <UserX size={13} className="text-red-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Registrar Falta
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#445870] hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {competenciasAbertas.length === 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle size={13} />
              Nenhuma competência aberta. Abra uma competência antes de lançar
              faltas.
            </div>
          )}

          <Field label="Competência *" error={errors.competenciaId?.message}>
            <select
              {...register("competenciaId")}
              className={inputCls(!!errors.competenciaId)}
            >
              <option value="">Selecione a competência...</option>
              {competenciasAbertas.map((c) => (
                <option key={c.id} value={c.id}>
                  {MESES[c.mes - 1]} / {c.ano}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Colaborador *" error={errors.colaboradorId?.message}>
            <input
              value={buscaColab}
              onChange={(e) => setBuscaColab(e.target.value)}
              placeholder="Digite o nome ou matrícula..."
              className={inputCls(!!errors.colaboradorId)}
            />
            {colaboradores.length > 0 && (
              <div className="mt-1 bg-[#0a0f1a] border border-[#1a2540] rounded-lg overflow-hidden">
                {colaboradores.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-[#1a2540] cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      value={c.id}
                      {...register("colaboradorId")}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded-full border border-[#2a3f5f] peer-checked:border-blue-500 peer-checked:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 peer-checked:opacity-100" />
                    </div>
                    <span className="text-sm text-white">{c.nome}</span>
                    <span className="text-[10px] text-[#445870] font-mono ml-auto">
                      Mat. {c.matricula}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Data *" error={errors.data?.message}>
              <input
                {...register("data")}
                type="date"
                className={inputCls(!!errors.data)}
              />
            </Field>
            <Field label="Tipo *" error={errors.tipo?.message}>
              <select {...register("tipo")} className={inputCls(!!errors.tipo)}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_LABEL[t].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Posto *" error={errors.postoId?.message}>
              <select
                {...register("postoId")}
                className={inputCls(!!errors.postoId)}
              >
                <option value="">Selecione...</option>
                {postos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.tomador.nomeFantasia ?? p.tomador.razaoSocial} ·{" "}
                    {p.identificador}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Turno *" error={errors.turnoId?.message}>
              <select
                {...register("turnoId")}
                className={inputCls(!!errors.turnoId)}
              >
                <option value="">Selecione...</option>
                {turnos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Substituto (opcional)">
            <select {...register("substitutoId")} className={inputCls()}>
              <option value="">Sem substituto</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} — Mat. {c.matricula}
                </option>
              ))}
            </select>
          </Field>

          {erro && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {erro}
            </div>
          )}
        </form>

        <div className="flex gap-3 p-5 border-t border-[#1a2540] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm text-[#7e9ab5] bg-[#0a0f1a] border border-[#1a2540] hover:border-[#2a3f5f] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit(onSubmit)}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Registrando..." : "Registrar Falta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Cancelar ───────────────────────────────────────────
function ModalCancelar({
  falta,
  onClose,
  onSave,
}: {
  falta: Falta;
  onClose: () => void;
  onSave: () => void;
}) {
  const [justificativa, setJustificativa] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const cancelar = async () => {
    if (justificativa.trim().length < 5) {
      setErro("Mínimo 5 caracteres");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(`/api/faltas/${falta.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ justCancelamento: justificativa }),
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
          <h2 className="text-sm font-semibold text-white">Cancelar Falta</h2>
          <button
            onClick={onClose}
            className="text-[#445870] hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-[#0a0f1a] border border-[#1a2540] text-xs text-[#7e9ab5]">
            <p className="font-medium text-white mb-1">
              {falta.colaborador.nome}
            </p>
            <p>
              {new Date(falta.data).toLocaleDateString("pt-BR")} ·{" "}
              {TIPO_LABEL[falta.tipo].label}
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest mb-1.5">
              Justificativa *
            </label>
            <textarea
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={3}
              placeholder="Motivo do cancelamento..."
              className="w-full bg-[#0a0f1a] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all resize-none"
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
              Voltar
            </button>
            <button
              onClick={cancelar}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Cancelando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function FaltasPage() {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [competencias, setCompetencias] = useState<Competencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroComp, setFiltroComp] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroCoberto, setFiltroCoberto] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [modal, setModal] = useState(false);
  const [cancelando, setCancelando] = useState<Falta | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        busca,
        page: String(page),
        limit: "20",
      });
      if (filtroComp) params.set("competenciaId", filtroComp);
      if (filtroTipo) params.set("tipo", filtroTipo);
      if (filtroCoberto) params.set("coberto", filtroCoberto);

      const [resFaltas, resComps] = await Promise.all([
        fetch(`/api/faltas?${params}`),
        fetch("/api/competencias?limit=24"),
      ]);
      const [f, c] = await Promise.all([resFaltas.json(), resComps.json()]);
      setFaltas(f.faltas ?? []);
      setTotal(f.total ?? 0);
      setPages(f.pages ?? 1);
      setCompetencias(Array.isArray(c) ? c : []);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroComp, filtroTipo, filtroCoberto, page]);

  useEffect(() => {
    setPage(1);
  }, [busca, filtroComp, filtroTipo, filtroCoberto]);
  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="p-5 md:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Faltas</h2>
          <p className="text-sm text-[#7e9ab5] mt-0.5">
            {total > 0
              ? `${total} falta${total !== 1 ? "s" : ""} encontrada${total !== 1 ? "s" : ""}`
              : "Registro de ausências"}
          </p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Registrar Falta</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#445870]"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar colaborador..."
            className="w-full bg-[#0f1623] border border-[#1a2540] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <select
          value={filtroComp}
          onChange={(e) => setFiltroComp(e.target.value)}
          className="bg-[#0f1623] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-[#7e9ab5] outline-none focus:border-blue-500/50 min-w-[150px]"
        >
          <option value="">Todas as competências</option>
          {competencias.map((c) => (
            <option key={c.id} value={c.id}>
              {MESES[c.mes - 1]} / {c.ano}
            </option>
          ))}
        </select>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="bg-[#0f1623] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-[#7e9ab5] outline-none focus:border-blue-500/50 min-w-[140px]"
        >
          <option value="">Todos os tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {TIPO_LABEL[t].label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {[
            ["", "Todas"],
            ["false", "Descobertas"],
            ["true", "Cobertas"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFiltroCoberto(v)}
              className={clsx(
                "px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                filtroCoberto === v
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

      {/* Tabela */}
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#445870] text-sm gap-2">
            <RefreshCw size={15} className="animate-spin" /> Carregando...
          </div>
        ) : faltas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <UserX size={28} className="text-[#2a3f5f]" />
            <p className="text-sm text-[#445870]">Nenhuma falta encontrada</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a2540]">
                    {[
                      "Colaborador",
                      "Data",
                      "Posto / Turno",
                      "Tipo",
                      "Substituto",
                      "Competência",
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
                  {faltas.map((f) => {
                    const tc = TIPO_LABEL[f.tipo];
                    return (
                      <tr
                        key={f.id}
                        className="hover:bg-[#111827] transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/colaboradores/${f.colaborador.id}`}
                            className="text-sm font-medium text-white hover:text-blue-400 transition-colors"
                          >
                            {f.colaborador.nome}
                          </Link>
                          <p className="text-[10px] text-[#445870] font-mono">
                            Mat. {f.colaborador.matricula}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-[#7e9ab5]">
                          {new Date(f.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-[#7e9ab5]">
                            {f.posto.tomador.nomeFantasia ??
                              f.posto.tomador.razaoSocial}{" "}
                            · {f.posto.identificador}
                          </p>
                          <p className="text-[10px] text-[#445870] font-mono">
                            {f.turno.nome} {f.turno.entrada}–{f.turno.saida}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                              tc.bg,
                              tc.color,
                              tc.border,
                            )}
                          >
                            {tc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {f.substituto ? (
                            <div>
                              <p className="text-xs text-emerald-400">
                                {f.substituto.nome}
                              </p>
                              <p className="text-[10px] text-[#445870] font-mono">
                                Mat. {f.substituto.matricula}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                              Descoberta
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-mono text-[#7e9ab5]">
                            {MESES[f.competencia.mes - 1]}/{f.competencia.ano}
                          </span>
                          {f.competencia.status === "FECHADA" && (
                            <span className="ml-1.5 text-[9px] text-[#445870] font-mono bg-[#1a2540] px-1 py-0.5 rounded">
                              Fechada
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                            {f.competencia.status === "ABERTA" && (
                              <button
                                onClick={() => setCancelando(f)}
                                className="p-1.5 rounded hover:bg-red-500/10 text-[#445870] hover:text-red-400 transition-colors"
                                title="Cancelar"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="px-4 py-3 border-t border-[#1a2540] flex items-center justify-between">
              <span className="text-xs text-[#445870] font-mono">
                {pages > 1 ? `Página ${page} de ${pages} · ` : ""}
                {total} falta(s)
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

      {modal && (
        <ModalFalta
          competencias={competencias}
          onClose={() => setModal(false)}
          onSave={() => {
            setModal(false);
            carregar();
          }}
        />
      )}
      {cancelando && (
        <ModalCancelar
          falta={cancelando}
          onClose={() => setCancelando(null)}
          onSave={() => {
            setCancelando(null);
            carregar();
          }}
        />
      )}
    </div>
  );
}
