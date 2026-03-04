"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import * as Icons from "lucide-react";
import { BOTTOM_NAV } from "./nav-config";

function NavIcon({ name }: { name: string }) {
  const Icon = (Icons as any)[name];
  return Icon ? <Icon size={20} /> : null;
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1a]/95 backdrop-blur-md border-t border-[#1a2540]">
      <div className="flex">
        {BOTTOM_NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-mono transition-colors",
                active ? "text-blue-400" : "text-[#445870]",
              )}
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
