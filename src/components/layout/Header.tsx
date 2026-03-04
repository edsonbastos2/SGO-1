"use client";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { useUsuario } from "@/hooks/useUsuario";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/colaboradores": "Colaboradores",
  "/tomadores": "Tomadores",
  "/postos": "Postos de Trabalho",
  "/funcoes": "Funções",
  "/escalas": "Escalas",
  "/turnos": "Turnos",
  "/competencias": "Competências",
  "/faltas": "Faltas",
  "/extras": "Extras",
  "/feriados": "Feriados",
  "/beneficios": "Benefícios",
  "/relatorios": "Relatórios",
  "/usuarios": "Usuários",
  "/configuracoes": "Configurações",
  "/alocacoes": "Alocações",
};

export function Header() {
  const pathname = usePathname();
  const usuario = useUsuario();

  const title =
    PAGE_TITLES[pathname] ??
    PAGE_TITLES[
      Object.keys(PAGE_TITLES).find((k) => pathname.startsWith(k + "/")) ?? ""
    ] ??
    "SGO";

  return (
    <header className="h-14 border-b border-[#1a2540] bg-[#0a0f1a]/80 backdrop-blur-sm sticky top-0 z-30 flex items-center px-4 gap-4">
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        <p className="text-[10px] text-[#445870] font-mono hidden sm:block">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#445870] hover:text-white hover:bg-[#1a2540] transition-colors">
          <Search size={15} />
        </button>
        <button className="relative w-8 h-8 flex items-center justify-center rounded-md text-[#445870] hover:text-white hover:bg-[#1a2540] transition-colors">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#1a2540]">
          <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-blue-400">
              {usuario?.nome
                ? usuario.nome
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "??"}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-white leading-none">
              {usuario?.nome?.split(" ")[0]}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
