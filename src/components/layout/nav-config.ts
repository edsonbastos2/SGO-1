import type { Setor } from "@/types/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const ALL_GROUPS: NavGroup[] = [
  {
    label: "Geral",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    ],
  },
  {
    label: "Cadastros",
    items: [
      { label: "Tomadores", href: "/tomadores", icon: "Building2" },
      { label: "Postos", href: "/postos", icon: "MapPin" },
      { label: "Funcoes", href: "/funcoes", icon: "Briefcase" },
      { label: "Escalas", href: "/escalas", icon: "Timer" },
      { label: "Turnos", href: "/turnos", icon: "Clock" },
    ],
  },
  {
    label: "RH",
    items: [
      { label: "Colaboradores", href: "/colaboradores", icon: "Users" },
      { label: "Alocacoes", href: "/alocacoes", icon: "Network" },
    ],
  },
  {
    label: "Operacao",
    items: [
      { label: "Competencias", href: "/competencias", icon: "CalendarDays" },
      { label: "Faltas", href: "/faltas", icon: "UserX" },
      { label: "Extras", href: "/extras", icon: "Zap" },
      { label: "Feriados", href: "/feriados", icon: "CalendarCheck" },
    ],
  },
  {
    label: "Beneficios",
    items: [{ label: "Beneficios", href: "/beneficios", icon: "Gift" }],
  },
  {
    label: "Relatorios",
    items: [{ label: "Relatorios", href: "/relatorios", icon: "BarChart3" }],
  },
  {
    label: "Admin",
    items: [
      { label: "Usuarios", href: "/usuarios", icon: "ShieldCheck" },
      { label: "Configuracoes", href: "/configuracoes", icon: "Settings2" },
    ],
  },
];

const SETOR_GROUPS: Record<Setor, string[]> = {
  TI_ADMIN: [
    "Geral",
    "Cadastros",
    "RH",
    "Operacao",
    "Beneficios",
    "Relatorios",
    "Admin",
  ],
  OPERACAO: ["Geral", "Cadastros", "RH", "Operacao"],
  RH: ["Geral", "Cadastros", "RH", "Beneficios", "Relatorios"],
  FINANCEIRO: ["Geral", "Beneficios", "Relatorios"],
  CONTROLADORIA: ["Geral", "Relatorios", "Admin"],
  SUPERVISOR_EXTERNO: ["Geral", "Operacao"],
};

export function getNavGroups(setor: Setor): NavGroup[] {
  const allowed = SETOR_GROUPS[setor] ?? ["Geral"];
  return ALL_GROUPS.filter((g) => allowed.includes(g.label));
}

export const BOTTOM_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Colaboradores", href: "/colaboradores", icon: "Users" },
  { label: "Extras", href: "/extras", icon: "Zap" },
  { label: "Relatorios", href: "/relatorios", icon: "BarChart3" },
];
