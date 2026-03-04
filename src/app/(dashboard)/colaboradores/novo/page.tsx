"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clsx } from "clsx";
import {
  ArrowLeft,
  User,
  Briefcase,
  CreditCard,
  MapPin,
  Check,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────
interface Prestadora {
  id: string;
  nomeFantasia: string | null;
  razaoSocial: string;
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

// ─── Schema ───────────────────────────────────────────────────
const schema = z.object({
  // Pessoal
  prestadoraId: z.string().min(1, "Obrigatório"),
  nome: z.string().min(2, "Mínimo 2 caracteres").max(120),
  cpf: z.string()
    .min(11, 'CPF inválido')
    .max(14)
    .refine(v => v.replace(/\D/g, '').length === 11, 'CPF deve ter 11 dígitos'),
  dataNasc: z.string().optional(),
  telefone: z.string().max(20).optional(),
  email: z.string().optional(),
  // Profissional
  matricula: z.string().min(1, "Obrigatório").max(20),
  dataAdmissao: z.string().min(1, "Obrigatório"),
  funcaoId: z.string().optional(),
  escalaId: z.string().optional(),
  // Bancário
  banco: z.string().optional(),
  agencia: z.string().optional(),
  contaBancaria: z.string().optional(),
  tipoPix: z.string().optional(),
  chavePix: z.string().optional(),
  // Alocação
  postoId: z.string().optional(),
  turnoId: z.string().optional(),
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
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─── Abas ─────────────────────────────────────────────────────
const TABS = [
  { id: "pessoal", label: "Dados Pessoais", icon: User },
  { id: "profissional", label: "Dados Profissionais", icon: Briefcase },
  { id: "bancario", label: "Dados Bancários", icon: CreditCard },
  { id: "alocacao", label: "Alocação", icon: MapPin },
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

// ─── Page ─────────────────────────────────────────────────────
export default function NovoColaboradorPage() {
  const router = useRouter();
  const [aba, setAba] = useState("pessoal");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [prestadoras, setPrestadoras] = useState<Prestadora[]>([]);
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [postos, setPostos] = useState<Posto[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipoPix: "", banco: "", postoId: "", turnoId: "" },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/prestadoras").then((r) => r.json()),
      fetch("/api/funcoes?ativo=true").then((r) => r.json()),
      fetch("/api/escalas?ativo=true").then((r) => r.json()),
      fetch("/api/postos?ativo=true").then((r) => r.json()),
      fetch("/api/turnos?ativo=true").then((r) => r.json()),
    ]).then(([p, f, e, po, t]) => {
      setPrestadoras(Array.isArray(p) ? p : []);
      setFuncoes(Array.isArray(f) ? f : []);
      setEscalas(Array.isArray(e) ? e : []);
      setPostos(Array.isArray(po) ? po : []);
      setTurnos(Array.isArray(t) ? t : []);
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErro("");
    try {
      // 1. Criar colaborador
      const resCol = await fetch("/api/colaboradores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          cpf: data.cpf.replace(/\D/g, ""),
        }),
      });
      const col = await resCol.json();
      if (!resCol.ok) {
        setErro(col.error ?? "Erro ao criar colaborador");
        setAba("pessoal");
        return;
      }

      // 2. Criar alocação se posto e turno informados
      if (data.postoId && data.turnoId && data.funcaoId) {
        await fetch("/api/alocacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            colaboradorId: col.id,
            postoId: data.postoId,
            turnoId: data.turnoId,
            funcaoId: data.funcaoId,
            dataInicio: data.dataAdmissao,
          }),
        });
      }

      router.push("/colaboradores");
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const abaIdx = TABS.findIndex((t) => t.id === aba);
  const proximaAba = async () => {
    const camposPorAba: Record<string, (keyof FormData)[]> = {
      pessoal:      ['prestadoraId', 'nome', 'cpf'],
      profissional: ['matricula', 'dataAdmissao'],
      bancario:     [],
      alocacao:     [],
    }
    const campos = camposPorAba[aba] ?? []
    const valido = await trigger(campos)
    if (!valido) return
  
    setAba(TABS[Math.min(abaIdx + 1, TABS.length - 1)].id)
  }
  const voltarAba = () => setAba(TABS[Math.max(abaIdx - 1, 0)].id);

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
        <div>
          <h2 className="text-xl font-semibold text-white">Novo Colaborador</h2>
          <p className="text-sm text-[#7e9ab5]">
            Preencha os dados em cada aba
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-[#0a0f1a] border border-[#1a2540] rounded-xl p-1">
        {TABS.map((t, i) => {
          const Icon = t.icon;
          const ativo = aba === t.id;
          const passado = i < abaIdx;
          return (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={clsx(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all",
                ativo
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : passado
                    ? "text-emerald-400 hover:bg-[#1a2540]"
                    : "text-[#445870] hover:bg-[#1a2540] hover:text-[#7e9ab5]",
              )}
            >
              {passado ? <Check size={12} /> : <Icon size={12} />}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl p-6 space-y-5">
          {/* ── Aba: Dados Pessoais ── */}
          {aba === "pessoal" && (
            <>
              <Field
                label="Prestadora"
                required
                error={errors.prestadoraId?.message}
              >
                <select
                  {...register("prestadoraId")}
                  className={inputCls(!!errors.prestadoraId)}
                >
                  <option value="">Selecione a prestadora...</option>
                  {prestadoras.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nomeFantasia ?? p.razaoSocial}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Field
                    label="Nome completo"
                    required
                    error={errors.nome?.message}
                  >
                    <input
                      {...register("nome")}
                      placeholder="Nome completo do colaborador"
                      className={inputCls(!!errors.nome)}
                    />
                  </Field>
                </div>
                <Field label="CPF" required error={errors.cpf?.message}>
                  <input
                    {...register("cpf")}
                    placeholder="000.000.000-00"
                    className={inputCls(!!errors.cpf)}
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
                <Field label="E-mail" error={errors.email?.message}>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="email@exemplo.com"
                    className={inputCls(!!errors.email)}
                  />
                </Field>
              </div>
            </>
          )}

          {/* ── Aba: Dados Profissionais ── */}
          {aba === "profissional" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Matrícula"
                required
                error={errors.matricula?.message}
              >
                <input
                  {...register("matricula")}
                  placeholder="Ex: 00123"
                  className={inputCls(!!errors.matricula)}
                />
              </Field>
              <Field
                label="Data de Admissão"
                required
                error={errors.dataAdmissao?.message}
              >
                <input
                  {...register("dataAdmissao")}
                  type="date"
                  className={inputCls(!!errors.dataAdmissao)}
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

          {/* ── Aba: Dados Bancários ── */}
          {aba === "bancario" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Banco">
                  <select {...register("banco")} className={inputCls()}>
                    <option value="">Selecione o banco...</option>
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

              <div className="border-t border-[#1a2540] pt-5">
                <p className="text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest mb-4">
                  Chave PIX
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
            </div>
          )}

          {/* ── Aba: Alocação ── */}
          {aba === "alocacao" && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-[#0a0f1a] border border-blue-500/20 text-xs text-blue-400">
                Opcional — você pode alocar o colaborador agora ou depois pela
                tela de Alocações. Para alocar, preencha os 3 campos abaixo.
              </div>
              <Field label="Posto de Trabalho">
                <select {...register("postoId")} className={inputCls()}>
                  <option value="">Selecione o posto...</option>
                  {postos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.tomador.nomeFantasia ?? p.tomador.razaoSocial} ·{" "}
                      {p.identificador}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Turno">
                  <select {...register("turnoId")} className={inputCls()}>
                    <option value="">Selecione o turno...</option>
                    {turnos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nome} ({t.entrada}–{t.saida})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Função no Posto">
                  <select {...register("funcaoId")} className={inputCls()}>
                    <option value="">Selecione a função...</option>
                    {funcoes.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}
        </div>

        {erro && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {erro}
          </div>
        )}

        {/* Navegação entre abas */}
        <div className="flex gap-3 mt-5">
          {abaIdx > 0 && (
            <button
              type="button"
              onClick={voltarAba}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-[#7e9ab5] bg-[#0f1623] border border-[#1a2540] hover:border-[#2a3f5f] transition-colors"
            >
              Voltar
            </button>
          )}
          {abaIdx === 0 && (
            <Link
              href="/colaboradores"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm text-center text-[#7e9ab5] bg-[#0f1623] border border-[#1a2540] hover:border-[#2a3f5f] transition-colors"
            >
              Cancelar
            </Link>
          )}
          {abaIdx < TABS.length - 1 ? (
            <button
              type="button"
              onClick={proximaAba}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
            >
              Próximo
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Salvando..." : "Cadastrar Colaborador"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
