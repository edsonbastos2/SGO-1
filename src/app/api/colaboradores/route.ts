// src/app/api/colaboradores/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requirePermissao } from '@/lib/auth/rbac'
import { registrarAuditoria } from '@/lib/audit'
import { z } from 'zod'
import { getUsuarioFromRequest } from '@/lib/auth/session'

const ColaboradorSchema = z.object({
  prestadoraId:  z.string().min(1),
  matricula:     z.string().min(1).max(50),
  cpf:           z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  nome:          z.string().min(2).max(200),
  dataNasc:      z.string().datetime().optional(),
  telefone:      z.string().optional(),
  email:         z.string().email().optional(),
  dataAdmissao:  z.string(),
  funcaoId:      z.string().optional(),
  escalaId:      z.string().optional(),
  tipoPix:       z.string().optional(),
  chavePix:      z.string().optional(),
  banco:         z.string().optional(),
  agencia:       z.string().optional(),
  contaBancaria: z.string().optional(),
})

// GET /api/colaboradores
export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioFromRequest(req)
    await requirePermissao(usuario.id, 'colaboradores', 'V')

    const { searchParams } = new URL(req.url)
    const prestadoraId = searchParams.get('prestadoraId')
    const status       = searchParams.get('status')
    const nome         = searchParams.get('nome')
    const page         = parseInt(searchParams.get('page') ?? '1')
    const limit        = parseInt(searchParams.get('limit') ?? '20')

    const where: any = {}
    if (prestadoraId) where.prestadoraId = prestadoraId
    if (status)       where.status = status
    if (nome)         where.nome = { contains: nome, mode: 'insensitive' }

    // Supervisor externo: filtrar por escopo
    if (usuario.setor === 'SUPERVISOR_EXTERNO') {
      const escopo = await prisma.escopoSupervisor.findUnique({
        where: { usuarioId: usuario.id },
        include: { itens: true },
      })
      const tomadorIds = escopo?.itens.map(i => i.tomadorId) ?? []
      const postos = await prisma.postoTrabalho.findMany({
        where: { tomadorId: { in: tomadorIds } },
        select: { id: true },
      })
      const postoIds = postos.map(p => p.id)
      where.alocacoes = {
        some: { postoId: { in: postoIds }, status: 'ATIVA' },
      }
    }

    const [data, total] = await Promise.all([
      prisma.colaborador.findMany({
        where,
        include: {
          prestadora: { select: { nomeFantasia: true, cnpj: true } },
          funcao:     { select: { nome: true } },
          escala:     { select: { nome: true } },
          alocacoes:  {
            where: { status: 'ATIVA' },
            include: {
              posto:  { select: { identificador: true } },
              turno:  { select: { nome: true } },
              funcao: { select: { nome: true } },
            },
          },
        },
        skip:  (page - 1) * limit,
        take:  limit,
        orderBy: { nome: 'asc' },
      }),
      prisma.colaborador.count({ where }),
    ])

    return NextResponse.json({ data, total, page, limit })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 })
  }
}

// POST /api/colaboradores
export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioFromRequest(req)
    await requirePermissao(usuario.id, 'colaboradores', 'C')

    const body = await req.json()
    const parsed = ColaboradorSchema.parse(body)

    // Verificar duplicidade de CPF
    const cpfExiste = await prisma.colaborador.findUnique({
      where: { cpf: parsed.cpf },
    })
    if (cpfExiste) {
      return NextResponse.json(
        { error: 'CPF já cadastrado no sistema.' },
        { status: 409 }
      )
    }

    // Verificar duplicidade de matrícula na prestadora
    const matExiste = await prisma.colaborador.findUnique({
      where: {
        prestadoraId_matricula: {
          prestadoraId: parsed.prestadoraId,
          matricula:    parsed.matricula,
        },
      },
    })
    if (matExiste) {
      return NextResponse.json(
        { error: 'Matrícula já existe nesta prestadora.' },
        { status: 409 }
      )
    }

    const colaborador = await prisma.colaborador.create({
      data: {
        ...parsed,
        dataNasc:     parsed.dataNasc ? new Date(parsed.dataNasc) : undefined,
        dataAdmissao: new Date(parsed.dataAdmissao),
      },
    })

    await registrarAuditoria({
      usuarioId:   usuario.id,
      tipo:        'CREATE',
      entidade:    'colaboradores',
      entidadeId:  colaborador.id,
      descricao:   `Colaborador ${colaborador.nome} (${colaborador.cpf}) cadastrado`,
      dadosDepois: colaborador,
      ip:          req.headers.get('x-forwarded-for') ?? undefined,
    })

    return NextResponse.json(colaborador, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
