"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  PowerOff,
  MapPin,
  RefreshCw,
  Building2,
  Network,
} from "lucide-react";
import { clsx } from "clsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Posto {
  id: string;
  tomadorId: string;
  identificador: string;
  endereco: string | null;
  cidade: string | null;
  uf: string | null;
  tipo: string | null;
  observacoes: string | null;
  ativo: boolean;
  tomador: { id: string; nomeFantasia: string | null; razaoSocial: string };
  _count: { vagas: number; alocacoes: number };
}
interface Tomador {
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

const TIPOS_POSTO = [
  "Sede",
  "Filial",
  "Agência",
  "Fábrica",
  "Depósito",
  "Condomínio",
  "Shopping",
  "Hospital",
  "Escola",
  "Outros",
];

const schema = z.object({
  tomadorId: z.string().min(1, "Tomador obrigatório"),
  identificador: z.string().min(2, "Mínimo 2 caracteres").max(100),
  endereco: z.string().max(200).optional(),
  cidade: z.string().max(80).optional(),
  uf: z.string().optional(),
  tipo: z.string().optional(),
  observacoes: z.string().max(500).optional(),
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

function Modal({
  posto,
  tomadores,
  onClose,
  onSave,
}: {
  posto: Posto | null;
  tomadores: Tomador[];
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
      tomadorId: posto?.tomadorId ?? tomadores[0]?.id ?? "",
      identificador: posto?.identificador ?? "",
      endereco: posto?.endereco ?? "",
      cidade: posto?.cidade ?? "",
      uf: posto?.uf ?? "",
      tipo: posto?.tipo ?? "",
      observacoes: posto?.observacoes ?? "",
      ativo: posto?.ativo ?? true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(
        posto ? `/api/postos/${posto.id}` : "/api/postos",
        {
          method: posto ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
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
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2540] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <MapPin size={13} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              {posto ? "Editar Posto" : "Novo Posto"}
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
          {/* Tomador */}
          <Field label="Tomador *" error={errors.tomadorId?.message}>
            <select
              {...register("tomadorId")}
              disabled={!!posto}
              className={clsx(
                inputCls(!!errors.tomadorId),
                posto && "opacity-60 cursor-not-allowed",
              )}
            >
              <option value="">Selecione o tomador...</option>
              {tomadores.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nomeFantasia ?? t.razaoSocial}
                </option>
              ))}
            </select>
          </Field>

          {/* Identificador + Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Identificador *"
              error={errors.identificador?.message}
            >
              <input
                {...register("identificador")}
                placeholder="Ex: Matriz SP, Unidade 01"
                className={inputCls(!!errors.identificador)}
              />
            </Field>
            <Field label="Tipo">
              <select {...register("tipo")} className={inputCls()}>
                <option value="">Selecione...</option>
                {TIPOS_POSTO.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Endereço */}
          <Field label="Endereço">
            <input
              {...register("endereco")}
              placeholder="Rua, número, bairro"
              className={inputCls()}
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

          {/* Observações */}
          <Field label="Observações">
            <textarea
              {...register("observacoes")}
              rows={2}
              placeholder="Observações sobre o posto..."
              className="w-full bg-[#0a0f1a] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
            />
          </Field>

          {/* Status */}
          {posto && (
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
            type="submit"
            disabled={loading}
            onClick={handleSubmit(onSubmit)}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Salvando..." : posto ? "Salvar" : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostosPage() {
  const [postos, setPostos] = useState<Posto[]>([]);
  const [tomadores, setTomadores] = useState<Tomador[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("true");
  const [filtroTom, setFiltroTom] = useState("");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Posto | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        busca,
        ativo: filtroAtivo,
        tomadorId: filtroTom,
      });
      const [resPostos, resTom] = await Promise.all([
        fetch(`/api/postos?${params}`),
        fetch("/api/tomadores?ativo=true"),
      ]);
      const [p, t] = await Promise.all([resPostos.json(), resTom.json()]);
      setPostos(Array.isArray(p) ? p : []);
      setTomadores(Array.isArray(t) ? t : []);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroAtivo, filtroTom]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrir = (p?: Posto) => {
    setEditando(p ?? null);
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
    if (!confirm("Desativar este posto?")) return;
    const res = await fetch(`/api/postos/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error);
      return;
    }
    carregar();
  };

  return (
    <div className="p-5 md:p-7 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Postos de Trabalho
          </h2>
          <p className="text-sm text-[#7e9ab5] mt-0.5">
            Locais de prestação de serviço
          </p>
        </div>
        <button
          onClick={() => abrir()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Novo Posto</span>
        </button>
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
            placeholder="Buscar por identificador ou cidade..."
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

      {/* Tabela */}
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#445870] text-sm gap-2">
            <RefreshCw size={15} className="animate-spin" /> Carregando...
          </div>
        ) : postos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <MapPin size={28} className="text-[#2a3f5f]" />
            <p className="text-sm text-[#445870]">Nenhum posto encontrado</p>
            <button
              onClick={() => abrir()}
              className="text-xs text-blue-400 hover:underline"
            >
              Cadastrar primeiro posto
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a2540]">
                  {[
                    "Posto",
                    "Tomador",
                    "Localização",
                    "Tipo",
                    "Vagas",
                    "Alocações",
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
                {postos.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#111827] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <MapPin size={13} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {p.identificador}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-[#7e9ab5]">
                        <Building2
                          size={12}
                          className="text-[#445870] flex-shrink-0"
                        />
                        <span className="truncate max-w-[140px]">
                          {p.tomador.nomeFantasia ?? p.tomador.razaoSocial}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#7e9ab5]">
                      {p.cidade ? (
                        `${p.cidade}${p.uf ? ` / ${p.uf}` : ""}`
                      ) : (
                        <span className="text-[#2a3f5f]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {p.tipo ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a2540] text-[#7e9ab5] border border-[#2a3f5f]">
                          {p.tipo}
                        </span>
                      ) : (
                        <span className="text-[#2a3f5f]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-[#7e9ab5]">
                      {p._count.vagas}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-[#7e9ab5]">
                        <Network size={12} className="text-[#445870]" />
                        <span className="font-mono">{p._count.alocacoes}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge ativo={p.ativo} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => abrir(p)}
                          className="p-1.5 rounded hover:bg-[#1a2540] text-[#445870] hover:text-white transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        {p.ativo && (
                          <button
                            onClick={() => desativar(p.id)}
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
        {!loading && postos.length > 0 && (
          <div className="px-4 py-3 border-t border-[#1a2540]">
            <span className="text-xs text-[#445870] font-mono">
              {postos.length} posto(s)
            </span>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          posto={editando}
          tomadores={tomadores}
          onClose={fechar}
          onSave={salvo}
        />
      )}
    </div>
  );
}
