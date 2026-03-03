// src/lib/auth/rbac.ts
import { Setor, AcaoPermissao, CapacidadeCritica } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// Matriz de permissões padrão por setor (espelha o RF-002 e Anexo A)
export const PERMISSOES_PADRAO: Record<Setor, Record<string, AcaoPermissao[]>> = {
  TI_ADMIN: {
    '*': ['V', 'C', 'E', 'D', 'L', 'A', 'P', 'X', 'AU'],
  },
  OPERACAO: {
    faltas:           ['V', 'L', 'E'],
    extras:           ['V', 'L', 'E'],
    feriados_trab:    ['V', 'L', 'E'],
    colaboradores:    ['V', 'C', 'E'],
    postos_vagas:     ['V', 'C', 'E'],
    beneficios:       ['V'],
    escalas:          ['V', 'C', 'E'],
    turnos:           ['V', 'C', 'E'],
    competencias:     ['V', 'E'],
    ocorrencias:      ['V', 'L', 'E'],
    recibos:          ['V', 'C'],
  },
  RH: {
    candidatos:       ['V', 'C', 'E'],
    colaboradores:    ['V', 'C', 'E'],
    beneficios:       ['V', 'C', 'E'],
    asos:             ['V', 'C', 'E'],
    funcoes:          ['V', 'C', 'E'],
    alocacoes:        ['C', 'E'],
  },
  FINANCEIRO: {
    colaboradores:    ['V', 'X'],
    beneficios:       ['V', 'X'],
    extras:           ['V', 'X'],
    faltas:           ['V', 'X'],
    feriados_trab:    ['V', 'X'],
    recibos:          ['V', 'X'],
  },
  CONTROLADORIA: {
    colaboradores:    ['V', 'X', 'AU'],
    beneficios:       ['V', 'X', 'AU'],
    extras:           ['V', 'X', 'AU'],
    faltas:           ['V', 'X', 'AU'],
    feriados_trab:    ['V', 'X', 'AU'],
    recibos:          ['V', 'X', 'AU'],
    auditoria:        ['V', 'AU'],
    exportacoes:      ['V', 'X', 'AU'],
  },
  SUPERVISOR_EXTERNO: {
    faltas:           ['V', 'L', 'E'],
    extras:           ['V', 'L', 'E'],
    feriados_trab:    ['V', 'L', 'E'],
  },
}

export async function verificarPermissao(
  usuarioId: string,
  modulo: string,
  acao: AcaoPermissao
): Promise<boolean> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId, status: 'ATIVO' },
    select: { setor: true },
  })

  if (!usuario) return false

  const permissoes = PERMISSOES_PADRAO[usuario.setor]

  // TI_ADMIN tem acesso total
  if (permissoes['*']) return true

  const acoesMod = permissoes[modulo] ?? []
  return acoesMod.includes(acao)
}

export async function verificarCapacidade(
  usuarioId: string,
  capacidade: CapacidadeCritica
): Promise<boolean> {
  const cap = await prisma.capacidadeUsuario.findFirst({
    where: {
      usuarioId,
      capacidade,
      ativo: true,
      OR: [
        { validadeAte: null },
        { validadeAte: { gte: new Date() } },
      ],
    },
  })
  return !!cap
}

// Helper para usar em API Routes
export async function requirePermissao(
  usuarioId: string,
  modulo: string,
  acao: AcaoPermissao
) {
  const ok = await verificarPermissao(usuarioId, modulo, acao)
  if (!ok) {
    throw new Error(`Acesso negado: ${acao} em ${modulo}`)
  }
}

export async function requireCapacidade(
  usuarioId: string,
  capacidade: CapacidadeCritica
) {
  const ok = await verificarCapacidade(usuarioId, capacidade)
  if (!ok) {
    throw new Error(`Capacidade crítica requerida: ${capacidade}`)
  }
}
