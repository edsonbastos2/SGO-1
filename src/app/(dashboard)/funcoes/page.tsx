"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Pencil,
  PowerOff,
  Briefcase,
  Users,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────
interface Funcao {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  createdAt: string;
  _count: { colaboradores: number; vagas: number };
}

// ─── Schema ───────────────────────────────────────────────────
const schema = z.object({
  nome: z.string().min(2, "Mínimo 2 caracteres").max(80),
  descricao: z.string().max(255).optional(),
  ativo: z.boolean(),
});
type FormData = z.infer<typeof schema>;

// ─── Badge status ─────────────────────────────────────────────
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

// ─── Modal de criar/editar ─────────────────────────────────────
function FuncaoModal({
  funcao,
  onClose,
  onSave,
}: {
  funcao: Funcao | null;
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
      nome: funcao?.nome ?? "",
      descricao: funcao?.descricao ?? "",
      ativo: funcao?.ativo ?? true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErro("");
    try {
      const url = funcao ? `/api/funcoes/${funcao.id}` : "/api/funcoes";
      const method = funcao ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl w-full max-w-md shadow-2xl animate-fade-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a2540]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Briefcase size={13} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              {funcao ? "Editar Função" : "Nova Função"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#445870] hover:text-white text-lg leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Nome */}
          <div>
            <label className="block text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest mb-1.5">
              Nome da Função *
            </label>
            <input
              {...register("nome")}
              placeholder="Ex: Vigilante Patrimonial"
              className={clsx(
                "w-full bg-[#0a0f1a] border rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#2a3f5f]",
                "outline-none transition-all focus:ring-1",
                errors.nome
                  ? "border-red-500/50 focus:ring-red-500/50"
                  : "border-[#1a2540] focus:border-blue-500/50 focus:ring-blue-500/30",
              )}
            />
            {errors.nome && (
              <p className="text-red-400 text-xs mt-1">{errors.nome.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-[10px] font-mono font-medium text-[#445870] uppercase tracking-widest mb-1.5">
              Descrição
            </label>
            <textarea
              {...register("descricao")}
              rows={3}
              placeholder="Descrição opcional da função..."
              className="w-full bg-[#0a0f1a] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none"
            />
            {errors.descricao && (
              <p className="text-red-400 text-xs mt-1">
                {errors.descricao.message}
              </p>
            )}
          </div>

          {/* Ativo */}
          {funcao && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0f1a] border border-[#1a2540]">
              <span className="text-sm text-[#7e9ab5]">Status</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("ativo")}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#1a2540] rounded-full peer-checked:bg-blue-600 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
                <span className="text-xs text-[#7e9ab5] peer-checked:text-blue-400 transition-colors">
                  Ativo
                </span>
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
              {loading
                ? "Salvando..."
                : funcao
                  ? "Salvar Alterações"
                  : "Criar Função"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
export default function FuncoesPage() {
  const [funcoes, setFuncoes] = useState<Funcao[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState<string>("true");
  const [modalAberto, setModalAberto] = useState(false);
  const [funcaoEdit, setFuncaoEdit] = useState<Funcao | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ busca, ativo: filtroAtivo });
      const res = await fetch(`/api/funcoes?${params}`);
      const data = await res.json();
      setFuncoes(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [busca, filtroAtivo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const abrirNovo = () => {
    setFuncaoEdit(null);
    setModalAberto(true);
  };
  const abrirEditar = (f: Funcao) => {
    setFuncaoEdit(f);
    setModalAberto(true);
  };
  const fecharModal = () => {
    setModalAberto(false);
    setFuncaoEdit(null);
  };
  const salvo = () => {
    fecharModal();
    carregar();
  };

  const desativar = async (id: string) => {
    if (!confirm("Desativar esta função?")) return;
    await fetch(`/api/funcoes/${id}`, { method: "DELETE" });
    carregar();
  };

  return (
    <div className="p-5 md:p-7 space-y-6 animate-fade-up">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Funções</h2>
          <p className="text-sm text-[#7e9ab5] mt-0.5">
            Cadastro de funções dos colaboradores
          </p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Nova Função</span>
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
            placeholder="Buscar função..."
            className="w-full bg-[#0f1623] border border-[#1a2540] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#2a3f5f] outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          {[
            ["true", "Ativas"],
            ["false", "Inativas"],
            ["", "Todas"],
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFiltroAtivo(val)}
              className={clsx(
                "px-3 py-2 rounded-lg text-xs font-medium transition-colors border",
                filtroAtivo === val
                  ? "bg-blue-600/20 text-blue-400 border-blue-500/30"
                  : "text-[#445870] bg-[#0f1623] border-[#1a2540] hover:border-[#2a3f5f]",
              )}
            >
              {label}
            </button>
          ))}
          <button
            onClick={carregar}
            className="px-3 py-2 rounded-lg text-[#445870] bg-[#0f1623] border border-[#1a2540] hover:text-white hover:border-[#2a3f5f] transition-colors"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#445870] text-sm">
            <RefreshCw size={16} className="animate-spin mr-2" /> Carregando...
          </div>
        ) : funcoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <Briefcase size={28} className="text-[#2a3f5f]" />
            <p className="text-sm text-[#445870]">Nenhuma função encontrada</p>
            <button
              onClick={abrirNovo}
              className="text-xs text-blue-400 hover:underline mt-1"
            >
              Criar primeira função
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1a2540]">
                  {[
                    "Função",
                    "Descrição",
                    "Colaboradores",
                    "Vagas",
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
                {funcoes.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-[#111827] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase size={13} className="text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-white">
                          {f.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#7e9ab5] max-w-xs truncate">
                      {f.descricao ?? (
                        <span className="text-[#2a3f5f] italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-[#7e9ab5]">
                        <Users size={12} className="text-[#445870]" />
                        <span className="font-mono">
                          {f._count.colaboradores}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-[#7e9ab5]">
                        <MapPin size={12} className="text-[#445870]" />
                        <span className="font-mono">{f._count.vagas}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge ativo={f.ativo} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() => abrirEditar(f)}
                          className="p-1.5 rounded hover:bg-[#1a2540] text-[#445870] hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        {f.ativo && (
                          <button
                            onClick={() => desativar(f.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-[#445870] hover:text-red-400 transition-colors"
                            title="Desativar"
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
        {/* Footer da tabela */}
        {!loading && funcoes.length > 0 && (
          <div className="px-4 py-3 border-t border-[#1a2540] flex items-center justify-between">
            <span className="text-xs text-[#445870] font-mono">
              {funcoes.length} função(ões) encontrada(s)
            </span>
          </div>
        )}
      </div>

      {modalAberto && (
        <FuncaoModal funcao={funcaoEdit} onClose={fecharModal} onSave={salvo} />
      )}
    </div>
  );
}
