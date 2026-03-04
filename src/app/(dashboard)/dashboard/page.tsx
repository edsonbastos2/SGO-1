"use client";
import { useUsuario } from "@/hooks/useUsuario";
import {
  Users,
  Zap,
  UserX,
  CalendarDays,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const KPI_CARDS = [
  {
    label: "Colaboradores Ativos",
    value: "—",
    icon: Users,
    color: "blue",
    delta: null,
  },
  {
    label: "Extras Pendentes",
    value: "—",
    icon: Zap,
    color: "amber",
    delta: null,
  },
  {
    label: "Faltas no Mês",
    value: "—",
    icon: UserX,
    color: "red",
    delta: null,
  },
  {
    label: "Competência Atual",
    value: "—",
    icon: CalendarDays,
    color: "emerald",
    delta: null,
  },
];

const COLOR_MAP: Record<
  string,
  { bg: string; border: string; icon: string; badge: string }
> = {
  blue: {
    bg: "bg-blue-500/8",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400",
  },
  amber: {
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400",
  },
  red: {
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    icon: "text-red-400",
    badge: "bg-red-500/10 text-red-400",
  },
  emerald: {
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400",
  },
};

export default function DashboardPage() {
  const usuario = useUsuario();

  const hora = new Date().getHours();
  const saudacao =
    hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const primeiroNome = usuario?.nome?.split(" ")[0] ?? "";

  return (
    <div className="p-5 md:p-7 space-y-7 animate-fade-up">
      {/* Saudação */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          {saudacao}
          {primeiroNome ? `, ${primeiroNome}` : ""}.
        </h2>
        <p className="text-sm text-[#7e9ab5] mt-0.5">
          Aqui está o resumo operacional do dia.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => {
          const colors = COLOR_MAP[card.color];
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-xl border p-4 ${colors.bg} ${colors.border} flex flex-col gap-3`}
            >
              <div className="flex items-start justify-between">
                <p className="text-xs text-[#7e9ab5] font-medium leading-tight">
                  {card.label}
                </p>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.bg} border ${colors.border}`}
                >
                  <Icon size={14} className={colors.icon} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-mono font-semibold text-white">
                  {card.value}
                </p>
                <p className="text-[10px] text-[#445870] mt-1">
                  Carregando dados...
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Atividade recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pendências */}
        <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Pendências</h3>
            <span className="text-[10px] font-mono text-[#445870] bg-[#0a0f1a] px-2 py-0.5 rounded border border-[#1a2540]">
              HOJE
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              {
                icon: Zap,
                label: "Extras aguardando aprovação",
                color: "amber",
              },
              {
                icon: AlertCircle,
                label: "ASOs próximos do vencimento",
                color: "red",
              },
              {
                icon: Clock,
                label: "Competência do mês aberta",
                color: "blue",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              const c = COLOR_MAP[item.color];
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0a0f1a] border border-[#1a2540]"
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center ${c.bg}`}
                  >
                    <Icon size={12} className={c.icon} />
                  </div>
                  <span className="text-xs text-[#7e9ab5]">{item.label}</span>
                  <span className="ml-auto text-[10px] font-mono text-[#445870]">
                    —
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Atividade recente */}
        <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Atividade Recente
            </h3>
            <span className="text-[10px] font-mono text-[#445870] bg-[#0a0f1a] px-2 py-0.5 rounded border border-[#1a2540]">
              AUDITORIA
            </span>
          </div>
          <div className="space-y-0">
            {[
              { label: "Login realizado", time: "agora mesmo", ok: true },
              { label: "Sistema inicializado", time: "há instantes", ok: true },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2.5 border-b border-[#1a2540] last:border-0"
              >
                <CheckCircle2
                  size={13}
                  className="text-emerald-400 flex-shrink-0"
                />
                <span className="text-xs text-[#7e9ab5] flex-1">
                  {item.label}
                </span>
                <span className="text-[10px] font-mono text-[#2a3f5f]">
                  {item.time}
                </span>
              </div>
            ))}
            <div className="pt-2">
              <p className="text-[11px] text-[#2a3f5f] text-center font-mono">
                Dados de auditoria completos disponíveis em Relatórios
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status do sistema */}
      <div className="bg-[#0f1623] border border-[#1a2540] rounded-xl p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          <span className="text-xs text-[#7e9ab5] font-mono">
            Sistema operacional
          </span>
        </div>
        <div className="w-px h-4 bg-[#1a2540]" />
        <span className="text-xs text-[#445870] font-mono">SGO v0.3</span>
        <div className="w-px h-4 bg-[#1a2540]" />
        <span className="text-xs text-[#445870] font-mono">
          Sessão expira em 8h
        </span>
      </div>
    </div>
  );
}
