import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  colaboradorId: z.string().min(1),
  postoId: z.string().min(1),
  turnoId: z.string().min(1),
  funcaoId: z.string().min(1),
  dataInicio: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busca = searchParams.get("busca") ?? "";
    const status = searchParams.get("status") ?? "ATIVA";
    const prestadoraId = searchParams.get("prestadoraId");
    const tomadorId = searchParams.get("tomadorId");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const where = {
      ...(status && { status: status as any }),
      ...(busca && {
        colaborador: {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { matricula: { contains: busca } },
            { cpf: { contains: busca } },
          ],
        },
      }),
      ...(prestadoraId && { colaborador: { prestadoraId } }),
      ...(tomadorId && { posto: { tomadorId } }),
    };

    const [alocacoes, total] = await Promise.all([
      prisma.alocacao.findMany({
        where,
        include: {
          colaborador: {
            select: {
              id: true,
              nome: true,
              matricula: true,
              cpf: true,
              status: true,
            },
          },
          posto: {
            select: {
              id: true,
              identificador: true,
              tomador: {
                select: { id: true, nomeFantasia: true, razaoSocial: true },
              },
            },
          },
          turno: {
            select: { id: true, nome: true, entrada: true, saida: true },
          },
          funcao: { select: { id: true, nome: true } },
        },
        orderBy: [{ colaborador: { nome: "asc" } }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.alocacao.count({ where }),
    ]);

    return NextResponse.json({
      alocacoes,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao buscar alocações" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());

    const ativas = await prisma.alocacao.count({
      where: { colaboradorId: data.colaboradorId, status: "ATIVA" },
    });
    if (ativas >= 2)
      return NextResponse.json(
        { error: "Colaborador já possui 2 alocações ativas (limite máximo)" },
        { status: 409 },
      );

    const alocacao = await prisma.alocacao.create({
      data: {
        colaboradorId: data.colaboradorId,
        postoId: data.postoId,
        turnoId: data.turnoId,
        funcaoId: data.funcaoId,
        dataInicio: new Date(data.dataInicio),
        status: "ATIVA",
      },
      include: {
        colaborador: { select: { nome: true, matricula: true } },
        posto: {
          select: {
            identificador: true,
            tomador: { select: { nomeFantasia: true } },
          },
        },
        turno: { select: { nome: true } },
        funcao: { select: { nome: true } },
      },
    });

    return NextResponse.json(alocacao, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao criar alocação" },
      { status: 500 },
    );
  }
}
