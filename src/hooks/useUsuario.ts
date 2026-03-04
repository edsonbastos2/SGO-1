"use client";
import { useState, useEffect } from "react";
import type { Setor } from "@/types/auth";

export interface UsuarioSession {
  id: string;
  nome: string;
  email: string;
  login: string;
  setor: Setor;
  primeiroAcesso: boolean;
}

export function useUsuario(): UsuarioSession | null {
  const [usuario, setUsuario] = useState<UsuarioSession | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("sgo_usuario");
      if (raw) setUsuario(JSON.parse(raw));
    } catch {
      setUsuario(null);
    }
  }, []);

  return usuario;
}
