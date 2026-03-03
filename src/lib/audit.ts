// src/lib/audit.ts
import { prisma } from '@/lib/prisma'
import { TipoAuditoria } from '@prisma/client'

interface AuditParams {
  usuarioId?: string
  tipo: TipoAuditoria
  entidade: string
  entidadeId?: string
  descricao: string
  dadosAntes?: object
  dadosDepois?: object
  ip?: string
  userAgent?: string
}

/**
 * Registra uma entrada imutável na tabela auditoria_logs (RF-120)
 */
export async function registrarAuditoria(params: AuditParams) {
  try {
    await prisma.auditoriaLog.create({
      data: {
        usuarioId:   params.usuarioId,
        tipo:        params.tipo,
        entidade:    params.entidade,
        entidadeId:  params.entidadeId,
        descricao:   params.descricao,
        dadosAntes:  params.dadosAntes  ? JSON.parse(JSON.stringify(params.dadosAntes))  : undefined,
        dadosDepois: params.dadosDepois ? JSON.parse(JSON.stringify(params.dadosDepois)) : undefined,
        ip:          params.ip,
        userAgent:   params.userAgent,
      },
    })
  } catch (error) {
    // Auditoria nunca deve quebrar o fluxo principal
    console.error('[AUDIT ERROR]', error)
  }
}

/**
 * Registra uma exportação (RF-110 / RPT-023)
 */
export async function registrarExportacao(params: {
  usuarioId: string
  relatorio: string
  formato: string
  filtros?: object
  arquivoUrl?: string
  status?: string
  erro?: string
}) {
  await prisma.exportacaoLog.create({
    data: {
      usuarioId:  params.usuarioId,
      relatorio:  params.relatorio as any,
      formato:    params.formato as any,
      filtros:    params.filtros ? JSON.parse(JSON.stringify(params.filtros)) : undefined,
      arquivoUrl: params.arquivoUrl,
      status:     params.status ?? 'SUCESSO',
      erro:       params.erro,
    },
  })
}
