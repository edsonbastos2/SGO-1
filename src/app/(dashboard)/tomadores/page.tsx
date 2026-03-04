"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  PowerOff,
  Building2,
  MapPin,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { clsx } from "clsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Tomador {
  id: string;
  cnpjCpf: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cidade: string | null;
  uf: string | null;
  telefone: string | null;
  email: string | null;
  exigeAprovacao: boolean;
  vtdPadrao: number | null;
  vaPadrao: number | null;
  ativo: boolean;
  prestadoraId: string;
  prestadora: { id: string; nomeFantasia: string | null };
  _count: { postos: number };
}

interface Prestadora {
  id: string;
  nomeFantasia: string | null;
  razaoSocial: string;
}

const UF_LIST = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const schema = z.object({
  prestadoraId: z.string().min(1, "Selecione a prestadora"),
  cnpjCpf: z.string().min(11, "Mínimo 11 caracteres").max(18),
  razaoSocial: z.string().min(2, "Mínimo 2 caracteres").max(120),
  nomeFantasia: z.string().max(120).optional(),
  endereco: z.string().max(200).optional(),
  cidade: z.string().max(80).optional(),
  uf: z.string().optional(),
  telefone: z.string().max(20).optional(),
  email: z.string().optional(),
  exigeAprovacao: z.boolean(),
  vtdPadrao: z.string().optional(),
  vaPadrao: z.string().optional(),
  ativo: z.boolean(),
});
type FormData = z.infer<typeof schema>;

function StatusBadge({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium",
        ativo
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          : "bg-[#1a2540] text-[#445870] border border-[#1a2540]",
      )}
    >
      <span
        className={clsx(
          "w-1 h-1 rounded-full",
          ativo ? "bg-emerald-400" : "bg-[#445870]",
        )}
      />
      {ativo ? "Ativo" : "Inativo"}
    </span>
  );
}

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

const inputCls = (err?: boolean) =>
  clsx(
    "w-full bg-[#0a0f1a] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none transition-all focus:ring-1",
    err
      ? "border-red-500/50 focus:ring-red-500/30"
      : "border-[#1a2540] focus:border-blue-500/50 focus:ring-blue-500/30",
  );

function Modal({
  tomador,
  prestadoras,
  onClose,
  onSave,
}: {
  tomador: Tomador | null;
  prestadoras: Prestadora[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      prestadoraId: tomador?.prestadoraId ?? prestadoras[0]?.id ?? "",
      cnpjCpf: tomador?.cnpjCpf ?? "",
      razaoSocial: tomador?.razaoSocial ?? "",
      nomeFantasia: tomador?.nomeFantasia ?? "",
      endereco: "",
      cidade: tomador?.cidade ?? "",
      uf: tomador?.uf ?? "",
      telefone: tomador?.telefone ?? "",
      email: tomador?.email ?? "",
      exigeAprovacao: tomador?.exigeAprovacao ?? false,
      vtdPadrao: tomador?.vtdPadrao?.toString() ?? "",
      vaPadrao: tomador?.vaPadrao?.toString() ?? "",
      ativo: tomador?.ativo ?? true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErro("");
    try {
      const payload = {
        ...data,
        vtdPadrao: data.vtdPadrao ? parseFloat(data.vtdPadrao) : null,
        vaPadrao: data.vaPadrao ? parseFloat(data.vaPadrao) : null,
        email: data.email || null,
      };
      const res = await fetch(
        tomador ? `/api/tomadores/${tomador.id}` : "/api/tomadores",
        {
          method: tomador ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        setErro(json.error ?? "Erro desconhecido");
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
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2540] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Building2 size={13} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              {tomador ? "Editar Tomador" : "Novo Tomador"}
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
          {/* Prestadora */}
          {!tomador && (
            <Field label="Prestadora *" error={errors.prestadoraId?.message}>
              <select
                {...register("prestadoraId")}
                className={inputCls(!!errors.prestadoraId)}
              >
                <option value="">Selecione...</option>
                {prestadoras.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nomeFantasia ?? p.razaoSocial}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* CNPJ + Razão Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="CNPJ / CPF *" error={errors.cnpjCpf?.message}>
              <input
                {...register("cnpjCpf")}
                placeholder="00.000.000/0001-00"
                className={inputCls(!!errors.cnpjCpf)}
              />
            </Field>
            <Field label="Razão Social *" error={errors.razaoSocial?.message}>
              <input
                {...register("razaoSocial")}
                placeholder="Razão social"
                className={inputCls(!!errors.razaoSocial)}
              />
            </Field>
          </div>

          {/* Nome Fantasia + Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome Fantasia">
              <input
                {...register("nomeFantasia")}
                placeholder="Nome fantasia"
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
          </div>

          {/* Email */}
          <Field label="E-mail" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              placeholder="contato@empresa.com"
              className={inputCls(!!errors.email)}
            />
          </Field>

          {/* Cidade + UF */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Field label="Cidade">
                <input
                  {...register("cidade")}
                  placeholder="Cidade"
                  className={inputCls()}
                />
              </Field>
            </div>
            <Field label="UF">
              <select {...register("uf")} className={inputCls()}>
                <option value="">—</option>
                {UF_LIST.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Benefícios padrão */}
          <div className="p-4 rounded-lg bg-[#0a0f1a] border border-[#1a2540] space-y-3">
            <p className="text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest">
              Benefícios Padrão
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="VTD Padrão (R$)">
                <input
                  {...register("vtdPadrao")}
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className={inputCls()}
                />
              </Field>
              <Field label="VA Padrão (R$)">
                <input
                  {...register("vaPadrao")}
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className={inputCls()}
                />
              </Field>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1623] border border-[#1a2540]">
              <div>
                <p className="text-xs text-white">Exige aprovação de extras</p>
                <p className="text-[10px] text-[#445870]">
                  Extras precisam de aprovação antes de serem confirmados
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer ml-4">
                <input
                  type="checkbox"
                  {...register("exigeAprovacao")}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#1a2540] rounded-full peer-checked:bg-blue-600 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
              </label>
            </div>
          </div>

          {/* Status (edição) */}
          {tomador && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0f1a] border border-[#1a2540]">
              <span className="text-sm text-[#7e9ab5]">Status</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("ativo")}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#1a2540] rounded-full peer-checked:bg-blue-600 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
                <span className="text-xs text-[#7e9ab5]">Ativo</span>
              </label>
            </div>
          )}

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
            form="tomador-form"
            type="submit"
            disabled={loading}
            onClick={handleSubmit(onSubmit)}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Salvando..." : tomador ? "Salvar" : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TomadoresPage() {
  const [tomadores, setTomadores] = useState<Tomador[]>([]);
  const [prestadoras, setPrestadoras] = useState<Prestadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("true");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Tomador | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [resTom, resPrest] = await Promise.all([
        fetch(`/api/tomadores?busca=${busca}&ativo=${filtroAtivo}`),
        fetch("/api/prestadoras"),
      ]);
      const [tom, prest] = await Promise.all([resTom.json(), resPrest.json()]);
      setTomadores(Array.isArray(tom) ? tom : []);
      setPrestadoras(Array.isArray(prest) ? prest : []);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroAtivo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrir = (t?: Tomador) => {
    setEditando(t ?? null);
    setModal(true);
  };
  const fechar = () => {
    setModal(false);
    setEditando(null);
  };
  const salvo = () => {
    fechar();
    carregar();
  };

  const desativar = async (id: string) => {
    if (!confirm("Desativar este tomador?")) return;
    await fetch(`/api/tomadores/${id}`, { method: "DELETE" });
    carregar();
  };

  return (
    <div className="p-5 md:p-7 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Tomadores</h2>
          <p className="text-sm text-[#7e9ab5] mt-0.5">
            Empresas tomadoras de serviço
          </p>
        </div>
        <button
          onClick={() => abrir()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Novo Tomador</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#445870]"
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou CNPJ..."
            className="w-full bg-[#0f1623] border border-[#1a2540] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {[
            ["true", "Ativos"],
            ["false", "Inativos"],
            ["", "Todos"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFiltroAtivo(v)}
              className={clsx(
                "px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                filtroAtivo === v
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

      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#445870] text-sm gap-2">
            <RefreshCw size={15} className="animate-spin" /> Carregando...
          </div>
        ) : tomadores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Building2 size={28} className="text-[#2a3f5f]" />
            <p className="text-sm text-[#445870]">Nenhum tomador encontrado</p>
            <button
              onClick={() => abrir()}
              className="text-xs text-blue-400 hover:underline"
            >
              Cadastrar primeiro tomador
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a2540]">
                  {[
                    "Tomador",
                    "CNPJ/CPF",
                    "Cidade",
                    "Postos",
                    "Aprovação",
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
                {tomadores.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-[#111827] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Building2 size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {t.nomeFantasia ?? t.razaoSocial}
                          </p>
                          {t.nomeFantasia && (
                            <p className="text-[10px] text-[#445870] truncate max-w-[160px]">
                              {t.razaoSocial}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-[#7e9ab5]">
                      {t.cnpjCpf}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#7e9ab5]">
                      {t.cidade ? (
                        `${t.cidade}${t.uf ? ` / ${t.uf}` : ""}`
                      ) : (
                        <span className="text-[#2a3f5f]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-[#7e9ab5]">
                        <MapPin size={12} className="text-[#445870]" />
                        <span className="font-mono">{t._count.postos}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "text-[10px] font-mono px-2 py-0.5 rounded border",
                          t.exigeAprovacao
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-[#1a2540] text-[#445870] border-[#1a2540]",
                        )}
                      >
                        {t.exigeAprovacao ? "Exige" : "Não exige"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge ativo={t.ativo} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => abrir(t)}
                          className="p-1.5 rounded hover:bg-[#1a2540] text-[#445870] hover:text-white transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        {t.ativo && (
                          <button
                            onClick={() => desativar(t.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-[#445870] hover:text-red-400 transition-colors"
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
        )}
        {!loading && tomadores.length > 0 && (
          <div className="px-4 py-3 border-t border-[#1a2540]">
            <span className="text-xs text-[#445870] font-mono">
              {tomadores.length} tomador(es)
            </span>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          tomador={editando}
          prestadoras={prestadoras}
          onClose={fechar}
          onSave={salvo}
        />
      )}
    </div>
  );
}
