"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  PowerOff,
  Clock,
  Network,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Turno {
  id: string;
  nome: string;
  entrada: string;
  intervalo: string;
  retorno: string;
  saida: string;
  ativo: boolean;
  _count: { alocacoes: number };
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const schema = z.object({
  nome: z.string().min(2, "Mínimo 2 caracteres").max(80),
  entrada: z.string().regex(timeRegex, "Formato HH:MM"),
  intervalo: z.string().regex(timeRegex, "Formato HH:MM"),
  retorno: z.string().regex(timeRegex, "Formato HH:MM"),
  saida: z.string().regex(timeRegex, "Formato HH:MM"),
  ativo: z.boolean(),
});
type FormData = z.infer<typeof schema>;

const inputCls = (err?: boolean) =>
  clsx(
    "w-full bg-[#0a0f1a] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none transition-all focus:ring-1 font-mono",
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

function Modal({
  turno,
  onClose,
  onSave,
}: {
  turno: Turno | null;
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
      nome: turno?.nome ?? "",
      entrada: turno?.entrada ?? "07:00",
      intervalo: turno?.intervalo ?? "12:00",
      retorno: turno?.retorno ?? "13:00",
      saida: turno?.saida ?? "16:00",
      ativo: turno?.ativo ?? true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErro("");
    try {
      const res = await fetch(
        turno ? `/api/turnos/${turno.id}` : "/api/turnos",
        {
          method: turno ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
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
              <Clock size={13} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              {turno ? "Editar Turno" : "Novo Turno"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#445870] hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <Field label="Nome *" error={errors.nome?.message}>
            <input
              {...register("nome")}
              placeholder="Ex: Turno Diurno, Noturno"
              className={clsx(inputCls(!!errors.nome), "font-sans")}
            />
          </Field>

          <div className="p-4 rounded-lg bg-[#0a0f1a] border border-[#1a2540] space-y-3">
            <p className="text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest">
              Horários
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Entrada *" error={errors.entrada?.message}>
                <input
                  {...register("entrada")}
                  type="time"
                  className={inputCls(!!errors.entrada)}
                />
              </Field>
              <Field
                label="Início Intervalo *"
                error={errors.intervalo?.message}
              >
                <input
                  {...register("intervalo")}
                  type="time"
                  className={inputCls(!!errors.intervalo)}
                />
              </Field>
              <Field label="Retorno *" error={errors.retorno?.message}>
                <input
                  {...register("retorno")}
                  type="time"
                  className={inputCls(!!errors.retorno)}
                />
              </Field>
              <Field label="Saída *" error={errors.saida?.message}>
                <input
                  {...register("saida")}
                  type="time"
                  className={inputCls(!!errors.saida)}
                />
              </Field>
            </div>
          </div>

          {turno && (
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

          <div className="flex gap-3 pt-1">
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
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Salvando..." : turno ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TurnosPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("true");
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Turno | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/turnos?busca=${busca}&ativo=${filtroAtivo}`,
      );
      const data = await res.json();
      setTurnos(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroAtivo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrir = (t?: Turno) => {
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
    if (!confirm("Desativar este turno?")) return;
    const res = await fetch(`/api/turnos/${id}`, { method: "DELETE" });
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
          <h2 className="text-xl font-semibold text-white">Turnos</h2>
          <p className="text-sm text-[#7e9ab5] mt-0.5">
            Horários de trabalho dos postos
          </p>
        </div>
        <button
          onClick={() => abrir()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Novo Turno</span>
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
            placeholder="Buscar turno..."
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
        ) : turnos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Clock size={28} className="text-[#2a3f5f]" />
            <p className="text-sm text-[#445870]">Nenhum turno encontrado</p>
            <button
              onClick={() => abrir()}
              className="text-xs text-blue-400 hover:underline"
            >
              Criar primeiro turno
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a2540]">
                  {[
                    "Turno",
                    "Entrada",
                    "Intervalo",
                    "Retorno",
                    "Saída",
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
                {turnos.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-[#111827] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Clock size={13} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {t.nome}
                        </span>
                      </div>
                    </td>
                    {[t.entrada, t.intervalo, t.retorno, t.saida].map(
                      (h, i) => (
                        <td key={i} className="px-4 py-3">
                          <span className="text-sm font-mono text-[#7e9ab5] bg-[#0a0f1a] border border-[#1a2540] px-2 py-0.5 rounded">
                            {h}
                          </span>
                        </td>
                      ),
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-[#7e9ab5]">
                        <Network size={12} className="text-[#445870]" />
                        <span className="font-mono">{t._count.alocacoes}</span>
                      </div>
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
        {!loading && turnos.length > 0 && (
          <div className="px-4 py-3 border-t border-[#1a2540]">
            <span className="text-xs text-[#445870] font-mono">
              {turnos.length} turno(s)
            </span>
          </div>
        )}
      </div>

      {modal && <Modal turno={editando} onClose={fechar} onSave={salvo} />}
    </div>
  );
}
