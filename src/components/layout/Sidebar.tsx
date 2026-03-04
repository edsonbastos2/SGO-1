"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Activity, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import * as Icons from "lucide-react";
import { getNavGroups, type NavGroup } from "./nav-config";
import { useUsuario } from "@/hooks/useUsuario";
import { useAuth } from "@/hooks/useAuth";
import type { Setor } from "@/types/auth";

const SETOR_LABEL: Record<Setor, string> = {
  TI_ADMIN: "TI / Admin",
  OPERACAO: "Operação",
  RH: "RH",
  FINANCEIRO: "Financeiro",
  CONTROLADORIA: "Controladoria",
  SUPERVISOR_EXTERNO: "Supervisor",
};

function NavIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = (Icons as any)[name];
  return Icon ? <Icon size={size} /> : null;
}

export function Sidebar() {
  const pathname = usePathname();
  const usuario = useUsuario();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [groups, setGroups] = useState<NavGroup[]>([]);

  useEffect(() => {
    if (usuario?.setor) setGroups(getNavGroups(usuario.setor as Setor));
  }, [usuario?.setor]);

  const initials = usuario?.nome
    ? usuario.nome
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "??";

  return (
    <aside
      className={clsx(
        "hidden md:flex flex-col h-screen sticky top-0",
        "bg-[#0a0f1a] border-r border-[#1a2540]",
        "transition-all duration-300 ease-in-out flex-shrink-0",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div
        className={clsx(
          "flex items-center h-14 border-b border-[#1a2540] px-4 flex-shrink-0",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Activity size={14} className="text-blue-400" />
            </div>
            <span className="font-mono text-sm font-semibold text-white tracking-tight">
              SGO
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Activity size={14} className="text-blue-400" />
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className={clsx(
            "w-6 h-6 rounded flex items-center justify-center",
            "text-[#445870] hover:text-white hover:bg-[#1a2540]",
            "transition-colors duration-150",
            collapsed && "hidden",
          )}
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-mono font-medium text-[#2a3f5f] uppercase tracking-widest">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={clsx(
                      "flex items-center gap-2.5 px-2 py-2 rounded-md text-sm",
                      "transition-all duration-150 group relative",
                      collapsed && "justify-center",
                      active
                        ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                        : "text-[#7e9ab5] hover:text-white hover:bg-[#111827]",
                    )}
                  >
                    <span className="flex-shrink-0">
                      <NavIcon name={item.icon} size={15} />
                    </span>
                    {!collapsed && (
                      <span className="font-medium truncate">{item.label}</span>
                    )}
                    {/* Tooltip quando collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a2540] border border-[#2a3f5f] rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer do sidebar */}
      <div className="flex-shrink-0 border-t border-[#1a2540] p-3 space-y-1">
        {/* Expand quando collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center p-2 text-[#445870] hover:text-white hover:bg-[#1a2540] rounded-md transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        )}
        {/* Usuário */}
        <div
          className={clsx(
            "flex items-center gap-2.5 px-2 py-2 rounded-md",
            collapsed && "justify-center",
          )}
        >
          <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-mono font-bold text-blue-400">
              {initials}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {usuario?.nome ?? "..."}
              </p>
              <p className="text-[10px] text-[#445870] truncate font-mono">
                {usuario?.setor ? SETOR_LABEL[usuario.setor as Setor] : ""}
              </p>
            </div>
          )}
        </div>
        {/* Logout */}
        <button
          onClick={logout}
          className={clsx(
            "w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm",
            "text-[#445870] hover:text-red-400 hover:bg-red-500/8 transition-colors",
            collapsed && "justify-center",
          )}
          title={collapsed ? "Sair" : undefined}
        >
          <LogOut size={14} />
          {!collapsed && <span className="text-xs">Sair do sistema</span>}
        </button>
      </div>
    </aside>
  );
}
