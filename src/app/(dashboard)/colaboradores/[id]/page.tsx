"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clsx } from "clsx";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Briefcase,
  CreditCard,
  MapPin,
  Save,
  Plus,
  PowerOff,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────
interface Colaborador {
  id: string;
  matricula: string;
  cpf: string;
  nome: string;
  dataNasc: string | null;
  telefone: string | null;
  email: string | null;
  dataAdmissao: string;
  dataDesligamento: string | null;
  status: "ATIVO" | "RESERVA" | "DESLIGADO" | "AFASTADO";
  funcaoId: string | null;
  escalaId: string | null;
  banco: string | null;
  agencia: string | null;
  contaBancaria: string | null;
  tipoPix: string | null;
  chavePix: string | null;
  prestadora: { id: string; nomeFantasia: string | null };
  funcao: { id: string; nome: string } | null;
  escala: { id: string; nome: string } | null;
  alocacoes: Alocacao[];
}

interface Alocacao {
  id: string;
  status: "ATIVA" | "ENCERRADA";
  dataInicio: string;
  dataFim: string | null;
  posto: {
    id: string;
    identificador: string;
    tomador: { nomeFantasia: string | null; razaoSocial: string };
  };
  turno: { id: string; nome: string; entrada: string; saida: string };
  funcao: { id: string; nome: string };
}

interface Funcao {
  id: string;
  nome: string;
}
interface Escala {
  id: string;
  nome: string;
  jornadaHoras: number;
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

// ─── Schema edição ────────────────────────────────────────────
const schema = z.object({
  matricula: z.string().min(1, "Obrigatório").max(20),
  nome: z.string().min(2, "Mínimo 2 caracteres").max(120),
  dataNasc: z.string().optional(),
  telefone: z.string().max(20).optional(),
  email: z.string().optional(),
  dataAdmissao: z.string().min(1, "Obrigatório"),
  dataDesligamento: z.string().optional(),
  status: z.enum(["ATIVO", "RESERVA", "DESLIGADO", "AFASTADO"]),
  funcaoId: z.string().optional(),
  escalaId: z.string().optional(),
  banco: z.string().optional(),
  agencia: z.string().optional(),
  contaBancaria: z.string().optional(),
  tipoPix: z.string().optional(),
  chavePix: z.string().optional(),
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

const STATUS_CONFIG = {
  ATIVO: {
    label: "Ativo",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  RESERVA: {
    label: "Reserva",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  AFASTADO: {
    label: "Afastado",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  DESLIGADO: {
    label: "Desligado",
    bg: "bg-[#1a2540]",
    text: "text-[#445870]",
    border: "border-[#1a2540]",
  },
};

const TABS = [
  { id: "pessoal", label: "Pessoal", icon: User },
  { id: "profissional", label: "Profissional", icon: Briefcase },
  { id: "bancario", label: "Bancário", icon: CreditCard },
  { id: "alocacoes", label: "Alocações", icon: MapPin },
];

const BANCOS = [
  "001 - Banco do Brasil",
  "033 - Santander",
  "041 - Banrisul",
  "104 - Caixa Econômica",
  "237 - Bradesco",
  "341 - Itaú",
  "077 - Inter",
  "260 - Nubank",
  "290 - PagBank",
  "336 - C6 Bank",
  "Outro",
];
const TIPOS_PIX = ["CPF", "CNPJ", "E-mail", "Telefone", "Chave aleatória"];

// ─── Modal Nova Alocação ──────────────────────────────────────
function ModalAlocacao({
  colaboradorId,
  funcaoId,
  postos,
  turnos,
  funcoes,
  onClose,
  onSave,
}: {
  colaboradorId: string;
  funcaoId: string | null;
  postos: Posto[];
  turnos: Turno[];
  funcoes: Funcao[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [postoId, setPostoId] = useState("");
  const [turnoId, setTurnoId] = useState("");
  const [fId, setFId] = useState(funcaoId ?? "");
  const [dataInicio, setDataInicio] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const salvar = async () => {
    if (!postoId || !turnoId || !fId) {
      setErro("Posto, turno e função são obrigatórios");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/alocacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colaboradorId,
          postoId,
          turnoId,
          funcaoId: fId,
          dataInicio,
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
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2540]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <MapPin size={13} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Nova Alocação</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#445870] hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Posto *">
            <select
              value={postoId}
              onChange={(e) => setPostoId(e.target.value)}
              className={inputCls()}
            >
              <option value="">Selecione o posto...</option>
              {postos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.tomador.nomeFantasia ?? p.tomador.razaoSocial} ·{" "}
                  {p.identificador}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Turno *">
              <select
                value={turnoId}
                onChange={(e) => setTurnoId(e.target.value)}
                className={inputCls()}
              >
                <option value="">Selecione...</option>
                {turnos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Função *">
              <select
                value={fId}
                onChange={(e) => setFId(e.target.value)}
                className={inputCls()}
              >
                <option value="">Selecione...</option>
                {funcoes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Data de início *">
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className={inputCls()}
            />
          </Field>
          {erro && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {erro}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
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
              {loading ? "Salvando..." : "Alocar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function ColaboradorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [col, setCol] = useState<Colaborador | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [aba, setAba] = useState("pessoal");
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [modalAloc, setModalAloc] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const carregar = async () => {
    setLoading(true);
    try {
      const [resCol, resFun, resEsc, resPo, resTu] = await Promise.all([
        fetch(`/api/colaboradores/${id}`),
        fetch("/api/funcoes?ativo=true"),
        fetch("/api/escalas?ativo=true"),
        fetch("/api/postos?ativo=true"),
        fetch("/api/turnos?ativo=true"),
      ]);
      const [c, f, e, p, t] = await Promise.all([
        resCol.json(),
        resFun.json(),
        resEsc.json(),
        resPo.json(),
        resTu.json(),
      ]);
      setCol(c);
      setFuncoes(Array.isArray(f) ? f : []);
      setEscalas(Array.isArray(e) ? e : []);
      setPostos(Array.isArray(p) ? p : []);
      setTurnos(Array.isArray(t) ? t : []);
      reset({
        matricula: c.matricula,
        nome: c.nome,
        dataNasc: c.dataNasc ? c.dataNasc.split("T")[0] : "",
        telefone: c.telefone ?? "",
        email: c.email ?? "",
        dataAdmissao: c.dataAdmissao ? c.dataAdmissao.split("T")[0] : "",
        dataDesligamento: c.dataDesligamento
          ? c.dataDesligamento.split("T")[0]
          : "",
        status: c.status,
        funcaoId: c.funcaoId ?? "",
        escalaId: c.escalaId ?? "",
        banco: c.banco ?? "",
        agencia: c.agencia ?? "",
        contaBancaria: c.contaBancaria ?? "",
        tipoPix: c.tipoPix ?? "",
        chavePix: c.chavePix ?? "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [id]);

  const onSubmit = async (data: FormData) => {
    setSalvando(true);
    setErro("");
    setSucesso(false);
    try {
      const res = await fetch(`/api/colaboradores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.error ?? "Erro ao salvar");
        return;
      }
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
      carregar();
    } catch {
      setErro("Erro de conexão");
    } finally {
      setSalvando(false);
    }
  };

  const encerrarAlocacao = async (alocId: string) => {
    if (!confirm("Encerrar esta alocação?")) return;
    await fetch(`/api/alocacoes/${alocId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "ENCERRADA",
        dataFim: new Date().toISOString().split("T")[0],
      }),
    });
    carregar();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-[#445870] gap-2">
        <RefreshCw size={16} className="animate-spin" /> Carregando...
      </div>
    );

  if (!col)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[#445870]">Colaborador não encontrado</p>
        <Link
          href="/colaboradores"
          className="text-blue-400 text-sm hover:underline"
        >
          Voltar
        </Link>
      </div>
    );

  const sc = STATUS_CONFIG[col.status];

  return (
    <div className="p-5 md:p-7 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/colaboradores"
          className="p-2 rounded-lg text-[#445870] hover:text-white hover:bg-[#1a2540] transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-semibold text-white truncate">
              {col.nome}
            </h2>
            <span
              className={clsx(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium border",
                sc.bg,
                sc.text,
                sc.border,
              )}
            >
              {sc.label}
            </span>
          </div>
          <p className="text-sm text-[#7e9ab5] font-mono mt-0.5">
            Mat. {col.matricula} · CPF{" "}
            {col.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-[#0a0f1a] border border-[#1a2540] rounded-xl p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const ativo = aba === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all",
                ativo
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-[#445870] hover:bg-[#1a2540] hover:text-[#7e9ab5]",
              )}
            >
              <Icon size={12} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Formulário */}
      {aba !== "alocacoes" ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl p-6 space-y-5">
            {/* Pessoal */}
            {aba === "pessoal" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Field label="Nome completo" error={errors.nome?.message}>
                    <input
                      {...register("nome")}
                      className={inputCls(!!errors.nome)}
                    />
                  </Field>
                </div>
                <Field label="CPF">
                  <input
                    value={col.cpf.replace(
                      /(\d{3})(\d{3})(\d{3})(\d{2})/,
                      "$1.$2.$3-$4",
                    )}
                    disabled
                    className="w-full bg-[#0a0f1a] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-[#445870] font-mono cursor-not-allowed"
                  />
                </Field>
                <Field label="Data de Nascimento">
                  <input
                    {...register("dataNasc")}
                    type="date"
                    className={inputCls()}
                  />
                </Field>
                <Field label="Telefone">
                  <input
                    {...register("telefone")}
                    placeholder="(00) 00000-0000"
                    className={inputCls()}
                  />
                </Field>
                <Field label="E-mail">
                  <input
                    {...register("email")}
                    type="email"
                    className={inputCls()}
                  />
                </Field>
              </div>
            )}

            {/* Profissional */}
            {aba === "profissional" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Matrícula" error={errors.matricula?.message}>
                  <input
                    {...register("matricula")}
                    className={inputCls(!!errors.matricula)}
                  />
                </Field>
                <Field label="Status">
                  <select {...register("status")} className={inputCls()}>
                    <option value="ATIVO">Ativo</option>
                    <option value="RESERVA">Reserva</option>
                    <option value="AFASTADO">Afastado</option>
                    <option value="DESLIGADO">Desligado</option>
                  </select>
                </Field>
                <Field
                  label="Data de Admissão"
                  error={errors.dataAdmissao?.message}
                >
                  <input
                    {...register("dataAdmissao")}
                    type="date"
                    className={inputCls(!!errors.dataAdmissao)}
                  />
                </Field>
                <Field label="Data de Desligamento">
                  <input
                    {...register("dataDesligamento")}
                    type="date"
                    className={inputCls()}
                  />
                </Field>
                <Field label="Função">
                  <select {...register("funcaoId")} className={inputCls()}>
                    <option value="">Selecione...</option>
                    {funcoes.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Escala">
                  <select {...register("escalaId")} className={inputCls()}>
                    <option value="">Selecione...</option>
                    {escalas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nome} ({e.jornadaHoras}h)
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {/* Bancário */}
            {aba === "bancario" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Banco">
                    <select {...register("banco")} className={inputCls()}>
                      <option value="">Selecione...</option>
                      {BANCOS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Agência">
                    <input
                      {...register("agencia")}
                      placeholder="0000"
                      className={inputCls()}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Conta Bancária">
                      <input
                        {...register("contaBancaria")}
                        placeholder="00000-0"
                        className={inputCls()}
                      />
                    </Field>
                  </div>
                </div>
                <div className="border-t border-[#1a2540] pt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Tipo de Chave PIX">
                    <select {...register("tipoPix")} className={inputCls()}>
                      <option value="">Sem PIX</option>
                      {TIPOS_PIX.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {watch("tipoPix") && (
                    <Field label="Chave PIX">
                      <input
                        {...register("chavePix")}
                        placeholder="Informe a chave"
                        className={inputCls()}
                      />
                    </Field>
                  )}
                </div>
              </div>
            )}
          </div>

          {erro && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {erro}
            </div>
          )}
          {sucesso && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={13} /> Salvo com sucesso!
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <Link
              href="/colaboradores"
              className="px-4 py-2.5 rounded-lg text-sm text-[#7e9ab5] bg-[#0f1623] border border-[#1a2540] hover:border-[#2a3f5f] transition-colors"
            >
              Voltar
            </Link>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              <Save size={14} />
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      ) : (
        /* ── Aba Alocações ── */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#7e9ab5]">Histórico de alocações</p>
            <button
              onClick={() => setModalAloc(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-medium transition-colors"
            >
              <Plus size={13} /> Nova Alocação
            </button>
          </div>

          {col.alocacoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 bg-[#0f1623] border border-[#1a2540] rounded-xl">
              <MapPin size={24} className="text-[#2a3f5f]" />
              <p className="text-sm text-[#445870]">
                Nenhuma alocação registrada
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {col.alocacoes.map((a) => (
                <div
                  key={a.id}
                  className={clsx(
                    "bg-[#0f1623] border rounded-xl p-4 space-y-3",
                    a.status === "ATIVA"
                      ? "border-blue-500/20"
                      : "border-[#1a2540]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 size={13} className="text-[#445870]" />
                        <span className="text-sm font-medium text-white">
                          {a.posto.tomador.nomeFantasia ??
                            a.posto.tomador.razaoSocial}
                        </span>
                        <span className="text-[10px] font-mono text-[#445870] bg-[#0a0f1a] border border-[#1a2540] px-1.5 py-0.5 rounded">
                          {a.posto.identificador}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#7e9ab5]">
                        <span className="flex items-center gap-1">
                          <Briefcase size={11} />
                          {a.funcao.nome}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {a.turno.nome} · {a.turno.entrada}–{a.turno.saida}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={clsx(
                          "text-[10px] font-mono px-2 py-0.5 rounded border",
                          a.status === "ATIVA"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-[#1a2540] text-[#445870] border-[#1a2540]",
                        )}
                      >
                        {a.status === "ATIVA" ? "Ativa" : "Encerrada"}
                      </span>
                      {a.status === "ATIVA" && (
                        <button
                          onClick={() => encerrarAlocacao(a.id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-[#445870] hover:text-red-400 transition-colors"
                          title="Encerrar"
                        >
                          <PowerOff size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#445870] pt-1 border-t border-[#1a2540]">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span>
                      Início:{" "}
                      {new Date(a.dataInicio).toLocaleDateString("pt-BR")}
                    </span>
                    {a.dataFim && (
                      <>
                        <XCircle size={11} className="text-red-400 ml-2" />
                        <span>
                          Fim: {new Date(a.dataFim).toLocaleDateString("pt-BR")}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modalAloc && (
        <ModalAlocacao
          colaboradorId={col.id}
          funcaoId={col.funcaoId}
          postos={postos}
          turnos={turnos}
          funcoes={funcoes}
          onClose={() => setModalAloc(false)}
          onSave={() => {
            setModalAloc(false);
            carregar();
          }}
        />
      )}
    </div>
  );
}
