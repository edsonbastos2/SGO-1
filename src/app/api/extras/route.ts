// src/app/api/extras/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermissao, requireCapacidade } from '@/lib/auth/rbac'
import { registrarAuditoria } from '@/lib/audit'
import { z } from 'zod'
import { getUsuarioFromRequest } from '@/lib/auth/session'

const ExtraSchema = z.object({
  colaboradorId: z.string().min(1),
  competenciaId: z.string().min(1),
  data:          z.string(),
  postoId:       z.string().min(1),
  turnoId:       z.string().min(1),
  motivoId:      z.string().min(1),
  ausenteId:     z.string().optional(),
  observacao:    z.string().optional(),
})

const AprovacaoSchema = z.object({
  extraId:        z.string().min(1),
  decisao:        z.enum(['APROVADO', 'REPROVADO']),
  justReprovacao: z.string().optional(),
})

// GET /api/extras
export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioFromRequest(req)
    await requirePermissao(usuario.id, 'extras', 'V')

    const { searchParams } = new URL(req.url)
    const competenciaId = searchParams.get('competenciaId')
    const status        = searchParams.get('status')
    const colaboradorId = searchParams.get('colaboradorId')

    const where: any = {}
    if (competenciaId) where.competenciaId = competenciaId
    if (status)        where.status = status
    if (colaboradorId) where.colaboradorId = colaboradorId

    const extras = await prisma.extra.findMany({
      where,
      include: {
        colaborador: { select: { nome: true, matricula: true } },
        posto:       { select: { identificador: true } },
        turno:       { select: { nome: true } },
        motivo:      { select: { nome: true, categoria: true, exigeEvidencia: true } },
        evidencias:  true,
      },
      orderBy: { data: 'desc' },
    })

    return NextResponse.json(extras)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}

// POST /api/extras — Lançar extra (RF-062)
export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioFromRequest(req)
    await requirePermissao(usuario.id, 'extras', 'L')

    const body   = await req.json()
    const parsed = ExtraSchema.parse(body)

    // Verificar competência aberta
    const competencia = await prisma.competencia.findUnique({
      where: { id: parsed.competenciaId },
    })
    if (!competencia || competencia.status !== 'ABERTA') {
      return NextResponse.json(
        { error: 'Competência fechada. Lançamentos não permitidos.' },
        { status: 422 }
      )
    }

    // RF-063: se substituição, verificar falta do ausente
    const motivo = await prisma.motivoExtra.findUnique({
      where: { id: parsed.motivoId },
    })
    if (motivo?.ehSubstituicao) {
      if (!parsed.ausenteId) {
        return NextResponse.json(
          { error: 'Extra de substituição exige informar o colaborador ausente.' },
          { status: 422 }
        )
      }
      const faltaExiste = await prisma.falta.findFirst({
        where: {
          colaboradorId: parsed.ausenteId,
          data:          new Date(parsed.data),
          turnoId:       parsed.turnoId,
          cancelado:     false,
        },
      })
      if (!faltaExiste) {
        return NextResponse.json(
          { error: 'Extra de substituição exige falta registrada para o colaborador ausente na mesma data/turno.' },
          { status: 422 }
        )
      }
    }

    const extra = await prisma.extra.create({
      data: {
        ...parsed,
        data:   new Date(parsed.data),
        status: motivo?.exigeAprovacao ? 'PENDENTE' : 'APROVADO',
      },
    })

    await registrarAuditoria({
      usuarioId:   usuario.id,
      tipo:        'CREATE',
      entidade:    'extras',
      entidadeId:  extra.id,
      descricao:   `Extra lançado: ${motivo?.nome} para colaborador ${parsed.colaboradorId}`,
      dadosDepois: extra,
    })

    return NextResponse.json(extra, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
