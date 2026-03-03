// src/app/api/competencias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermissao, requireCapacidade } from '@/lib/auth/rbac'
import { registrarAuditoria } from '@/lib/audit'
import { z } from 'zod'
import { getUsuarioFromRequest } from '@/lib/auth/session'

const CompetenciaSchema = z.object({
  mes:           z.number().min(1).max(12),
  ano:           z.number().min(2020),
  dataAbertura:  z.string(),
  dataFechamento: z.string().optional(),
})

const ReopenSchema = z.object({
  competenciaId: z.string().min(1),
  justificativa: z.string().min(10, 'Justificativa deve ter pelo menos 10 caracteres'),
})

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioFromRequest(req)
    await requirePermissao(usuario.id, 'competencias', 'V')

    const competencias = await prisma.competencia.findMany({
      orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
    })

    return NextResponse.json(competencias)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioFromRequest(req)
    await requirePermissao(usuario.id, 'competencias', 'E')

    const body   = await req.json()

    // Reabertura de competência (RF-100)
    if (body.action === 'reabrir') {
      const parsed = ReopenSchema.parse(body)

      // Exige capacidade crítica
      await requireCapacidade(usuario.id, 'REABRIR_COMPETENCIA')

      const competencia = await prisma.competencia.findUnique({
        where: { id: parsed.competenciaId },
      })

      if (!competencia) {
        return NextResponse.json({ error: 'Competência não encontrada.' }, { status: 404 })
      }

      if (competencia.status === 'ABERTA') {
        return NextResponse.json({ error: 'Competência já está aberta.' }, { status: 422 })
      }

      const atualizada = await prisma.competencia.update({
        where: { id: parsed.competenciaId },
        data: {
          status: 'ABERTA',
          dataFechamento: null,
          justificativaReabertura: parsed.justificativa,
        },
      })

      await registrarAuditoria({
        usuarioId:   usuario.id,
        tipo:        'REOPEN',
        entidade:    'competencias',
        entidadeId:  parsed.competenciaId,
        descricao:   `Competência ${competencia.mes}/${competencia.ano} reaberta. Justificativa: ${parsed.justificativa}`,
        dadosAntes:  { status: competencia.status },
        dadosDepois: { status: 'ABERTA', justificativa: parsed.justificativa },
      })

      return NextResponse.json(atualizada)
    }

    // Criar nova competência
    const parsed = CompetenciaSchema.parse(body)

    const existente = await prisma.competencia.findUnique({
      where: { mes_ano: { mes: parsed.mes, ano: parsed.ano } },
    })

    if (existente) {
      return NextResponse.json(
        { error: 'Já existe uma competência para este mês/ano.' },
        { status: 409 }
      )
    }

    const competencia = await prisma.competencia.create({
      data: {
        ...parsed,
        dataAbertura:   new Date(parsed.dataAbertura),
        dataFechamento: parsed.dataFechamento ? new Date(parsed.dataFechamento) : undefined,
      },
    })

    await registrarAuditoria({
      usuarioId:   usuario.id,
      tipo:        'CREATE',
      entidade:    'competencias',
      entidadeId:  competencia.id,
      descricao:   `Competência ${competencia.mes}/${competencia.ano} criada`,
      dadosDepois: competencia,
    })

    return NextResponse.json(competencia, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/competencias - Fechar competência
export async function PATCH(req: NextRequest) {
  try {
    const usuario = await getUsuarioFromRequest(req)
    await requirePermissao(usuario.id, 'competencias', 'E')

    const { competenciaId } = await req.json()

    const competencia = await prisma.competencia.update({
      where: { id: competenciaId },
      data:  { status: 'FECHADA', dataFechamento: new Date() },
    })

    await registrarAuditoria({
      usuarioId:  usuario.id,
      tipo:       'UPDATE',
      entidade:   'competencias',
      entidadeId: competenciaId,
      descricao:  `Competência ${competencia.mes}/${competencia.ano} fechada`,
      dadosDepois: { status: 'FECHADA' },
    })

    return NextResponse.json(competencia)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
