"use client";
// src/components/colaboradores/ModalImportar.tsx
import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import { clsx } from "clsx";
import * as XLSX from "xlsx";

interface Prestadora {
  id: string;
  nomeFantasia: string | null;
  razaoSocial: string;
}
interface RowPreview {
  linha: number;
  matricula: string;
  nome: string;
  cpf: string;
  dataAdmissao: string;
  funcao?: string;
  status: "ok" | "erro";
  erros?: string[];
}
interface ImportResult {
  total: number;
  criados: number;
  erros: number;
  resultados: {
    linha: number;
    status: "ok" | "erro";
    nome?: string;
    erros?: string[];
  }[];
}

// Normaliza chave: remove acento, espaço, lowercase
function nk(k: string) {
  return k
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

const KEY_MAP: Record<string, string> = {
  matricula: "matricula",
  nome: "nome",
  cpf: "cpf",
  dataadmissao: "dataAdmissao",
  admissao: "dataAdmissao",
  datanasc: "dataNasc",
  datanascimento: "dataNasc",
  telefone: "telefone",
  celular: "telefone",
  email: "email",
  funcao: "funcao",
  cargo: "funcao",
  escala: "escala",
  banco: "banco",
  agencia: "agencia",
  contabancaria: "contaBancaria",
  conta: "contaBancaria",
  tipopix: "tipoPix",
  chavepix: "chavePix",
  pix: "chavePix",
};

function mapRow(raw: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const dest = KEY_MAP[nk(k)] ?? nk(k);
    out[dest] = v == null ? "" : String(v).trim();
  }
  return out;
}

function validateRow(r: Record<string, string>): string[] {
  const erros: string[] = [];
  if (!r.matricula) erros.push("Matrícula obrigatória");
  if (!r.nome) erros.push("Nome obrigatório");
  if (!r.cpf) erros.push("CPF obrigatório");
  else if (r.cpf.replace(/\D/g, "").length !== 11) erros.push("CPF inválido");
  if (!r.dataAdmissao) erros.push("Data de admissão obrigatória");
  return erros;
}

// ─── Componente ───────────────────────────────────────────────
export function ModalImportar({
  prestadoras,
  onClose,
  onSave,
}: {
  prestadoras: Prestadora[];
  onClose: () => void;
  onSave: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [etapa, setEtapa] = useState<"upload" | "preview" | "resultado">(
    "upload",
  );
  const [prestadoraId, setPrestadoraId] = useState(prestadoras[0]?.id ?? "");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [preview, setPreview] = useState<RowPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<ImportResult | null>(null);
  const [expandErros, setExpandErros] = useState(false);
  const [dragging, setDragging] = useState(false);

  const processarArquivo = useCallback(async (file: File) => {
    setErro("");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, {
        type: "array",
        raw: false,
        cellDates: false,
      });
      const ws = wb.Sheets[wb.SheetNames[0]];
      // range: 2 = pular linhas 1-2 (título e aviso), usar linha 3 como cabeçalho
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
        range: 2,
        raw: false,
        defval: "",
      });

      // Filtrar linha de exemplo
      const filtered = raw.filter((r) => {
        const nome = String(Object.values(r)[1] ?? "");
        return !nome.toUpperCase().includes("EXEMPLO");
      });

      if (filtered.length === 0) {
        setErro("Arquivo vazio ou sem dados");
        return;
      }
      if (filtered.length > 500) {
        setErro("Máximo 500 colaboradores");
        return;
      }

      const mapped = filtered.map(mapRow);
      const prev: RowPreview[] = mapped.map((r, i) => {
        const erros = validateRow(r);
        return {
          linha: i + 1,
          matricula: r.matricula || "—",
          nome: r.nome || "—",
          cpf: r.cpf || "—",
          dataAdmissao: r.dataAdmissao || "—",
          funcao: r.funcao || undefined,
          status: erros.length > 0 ? "erro" : "ok",
          erros: erros.length > 0 ? erros : undefined,
        };
      });

      setRows(mapped);
      setPreview(prev);
      setEtapa("preview");
    } catch {
      setErro("Erro ao ler arquivo. Verifique se é .xlsx ou .csv válido.");
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) processarArquivo(f);
  };

  const importar = async () => {
    const validas = rows.filter((_, i) => preview[i]?.status === "ok");
    if (validas.length === 0) {
      setErro("Nenhuma linha válida");
      return;
    }
    setLoading(true);
    setErro("");
    try {
      const res = await fetch("/api/colaboradores/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prestadoraId, rows: validas }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Erro");
        return;
      }
      setResultado(data);
      setEtapa("resultado");
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const validos = preview.filter((p) => p.status === "ok").length;
  const invalidos = preview.filter((p) => p.status === "erro").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl w-full max-w-3xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-border)] flex items-center justify-center">
              <Users size={15} className="text-[var(--accent-text)]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Importar Colaboradores
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {etapa === "upload" && "Envie um arquivo .xlsx ou .csv"}
                {etapa === "preview" &&
                  `${preview.length} linha(s) detectada(s) — ${validos} válida(s)`}
                {etapa === "resultado" && "Importação concluída"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ── Upload ── */}
          {etapa === "upload" && (
            <>
              {prestadoras.length > 1 && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5">
                    Prestadora *
                  </label>
                  <select
                    value={prestadoraId}
                    onChange={(e) => setPrestadoraId(e.target.value)}
                    className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                  >
                    {prestadoras.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nomeFantasia ?? p.razaoSocial}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Drop zone */}
              <div
                onDrop={onDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onClick={() => fileRef.current?.click()}
                className={clsx(
                  "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                  dragging
                    ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
                    : "border-[var(--border-default)] hover:border-[var(--accent)] hover:bg-[var(--bg-subtle)]",
                )}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) processarArquivo(f);
                  }}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={clsx(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                      dragging
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-subtle)] text-[var(--text-muted)]",
                    )}
                  >
                    <Upload size={26} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {dragging
                        ? "Solte o arquivo aqui"
                        : "Arraste ou clique para selecionar"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      .xlsx ou .csv — máximo 500 colaboradores
                    </p>
                  </div>
                </div>
              </div>

              {/* Banner template */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet
                    size={20}
                    className="text-[var(--success-text)]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Template Excel
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Modelo com todos os campos e instruções
                    </p>
                  </div>
                </div>
                <a
                  href="/templates/template_colaboradores.xlsx"
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--success-text)] bg-[var(--success-subtle)] border border-[var(--success-border)] hover:opacity-80 transition-opacity"
                >
                  <Download size={13} /> Baixar template
                </a>
              </div>
            </>
          )}

          {/* ── Preview ── */}
          {etapa === "preview" && (
            <>
              {/* Contadores */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Total",
                    value: preview.length,
                    color: "text-[var(--text-primary)]",
                    bg: "bg-[var(--bg-subtle)] border-[var(--border-subtle)]",
                  },
                  {
                    label: "Válidos",
                    value: validos,
                    color: "text-[var(--success-text)]",
                    bg: "bg-[var(--success-subtle)] border-[var(--success-border)]",
                  },
                  {
                    label: "Com erro",
                    value: invalidos,
                    color: "text-[var(--danger-text)]",
                    bg: "bg-[var(--danger-subtle)] border-[var(--danger-border)]",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={clsx(
                      "rounded-xl p-4 text-center border",
                      item.bg,
                    )}
                  >
                    <p
                      className={clsx(
                        "text-3xl font-bold font-mono",
                        item.color,
                      )}
                    >
                      {item.value}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {invalidos > 0 && (
                <div className="p-3 rounded-lg bg-[var(--warning-subtle)] border border-[var(--warning-border)] text-[var(--warning-text)] text-xs flex items-center gap-2">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  {invalidos} linha(s) com erro serão ignoradas. Apenas as{" "}
                  {validos} válidas serão importadas.
                </div>
              )}

              {/* Tabela */}
              <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[var(--bg-subtle)]">
                        {[
                          "#",
                          "Nome",
                          "Matrícula",
                          "CPF",
                          "Admissão",
                          "Função",
                          "Status",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2.5 text-left font-semibold text-[var(--text-muted)] whitespace-nowrap border-b border-[var(--border-subtle)]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {preview.map((row) => (
                        <tr
                          key={row.linha}
                          className={clsx(
                            "transition-colors",
                            row.status === "erro"
                              ? "bg-[var(--danger-subtle)]"
                              : "hover:bg-[var(--bg-hover)]",
                          )}
                        >
                          <td className="px-3 py-2 font-mono text-[var(--text-muted)]">
                            {row.linha}
                          </td>
                          <td className="px-3 py-2 font-medium text-[var(--text-primary)] max-w-[140px] truncate">
                            {row.nome}
                          </td>
                          <td className="px-3 py-2 font-mono text-[var(--text-secondary)]">
                            {row.matricula}
                          </td>
                          <td className="px-3 py-2 font-mono text-[var(--text-secondary)]">
                            {row.cpf}
                          </td>
                          <td className="px-3 py-2 text-[var(--text-secondary)]">
                            {row.dataAdmissao}
                          </td>
                          <td className="px-3 py-2 text-[var(--text-muted)]">
                            {row.funcao ?? "—"}
                          </td>
                          <td className="px-3 py-2">
                            {row.status === "erro" ? (
                              <span
                                title={row.erros?.join(", ")}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium bg-[var(--danger-subtle)] text-[var(--danger-text)] border border-[var(--danger-border)]"
                              >
                                <X size={9} /> {row.erros?.[0] ?? "Erro"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium bg-[var(--success-subtle)] text-[var(--success-text)] border border-[var(--success-border)]">
                                <CheckCircle2 size={9} /> OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── Resultado ── */}
          {etapa === "resultado" && resultado && (
            <>
              <div
                className={clsx(
                  "flex items-center gap-4 p-5 rounded-xl border",
                  resultado.erros === 0
                    ? "bg-[var(--success-subtle)] border-[var(--success-border)]"
                    : "bg-[var(--warning-subtle)] border-[var(--warning-border)]",
                )}
              >
                <div
                  className={clsx(
                    "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                    resultado.erros === 0 ? "bg-white/30" : "bg-white/30",
                  )}
                >
                  {resultado.erros === 0 ? (
                    <CheckCircle2
                      size={28}
                      className="text-[var(--success-text)]"
                    />
                  ) : (
                    <AlertCircle
                      size={28}
                      className="text-[var(--warning-text)]"
                    />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] text-base">
                    {resultado.criados} colaborador(es) importado(s) com sucesso
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                    {resultado.erros > 0
                      ? `${resultado.erros} linha(s) foram ignoradas por erro`
                      : "Todos os registros foram importados"}
                  </p>
                </div>
              </div>

              {resultado.erros > 0 && (
                <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandErros((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-subtle)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <AlertCircle
                        size={14}
                        className="text-[var(--danger-text)]"
                      />{" "}
                      Ver {resultado.erros} linha(s) rejeitada(s)
                    </span>
                    {expandErros ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                  {expandErros && (
                    <div className="divide-y divide-[var(--border-subtle)] max-h-48 overflow-y-auto">
                      {resultado.resultados
                        .filter((r) => r.status === "erro")
                        .map((r) => (
                          <div
                            key={r.linha}
                            className="px-4 py-2.5 flex items-start gap-3"
                          >
                            <span className="text-xs font-mono text-[var(--text-muted)] w-10 flex-shrink-0">
                              L{r.linha}
                            </span>
                            <div>
                              <p className="text-xs font-medium text-[var(--text-primary)]">
                                {r.nome}
                              </p>
                              <p className="text-xs text-[var(--danger-text)]">
                                {r.erros?.join(", ")}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Erro global */}
          {erro && (
            <div className="p-3 rounded-lg bg-[var(--danger-subtle)] border border-[var(--danger-border)] text-[var(--danger-text)] text-xs flex items-center gap-2">
              <AlertCircle size={13} className="flex-shrink-0" /> {erro}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[var(--border-subtle)] flex-shrink-0">
          {etapa === "upload" && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              Cancelar
            </button>
          )}

          {etapa === "preview" && (
            <>
              <button
                onClick={() => {
                  setEtapa("upload");
                  setRows([]);
                  setPreview([]);
                }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={importar}
                disabled={loading || validos === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Importando...
                  </>
                ) : (
                  <>
                    <Upload size={14} /> Importar {validos} colaborador(es)
                  </>
                )}
              </button>
            </>
          )}

          {etapa === "resultado" && (
            <>
              {resultado && resultado.erros > 0 && (
                <button
                  onClick={() => {
                    setEtapa("upload");
                    setRows([]);
                    setPreview([]);
                  }}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Nova importação
                </button>
              )}
              <button
                onClick={() => {
                  onSave();
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-colors"
              >
                <CheckCircle2 size={14} /> Concluir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
