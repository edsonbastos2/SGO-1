import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  colaboradorId: z.string().min(1, "Colaborador obrigatório"),
  competenciaId: z.string().min(1, "Competência obrigatória"),
  data: z.string().min(1, "Data obrigatória"),
  postoId: z.string().min(1, "Posto obrigatório"),
  turnoId: z.string().min(1, "Turno obrigatório"),
  tipo: z.enum(["INJUSTIFICADA", "JUSTIFICADA", "ATESTADO", "ABONO", "OUTROS"]),
  substitutoId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busca = searchParams.get("busca") ?? "";
    const competenciaId = searchParams.get("competenciaId");
    const tipo = searchParams.get("tipo");
    const coberto = searchParams.get("coberto");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const where = {
      cancelado: false,
      ...(competenciaId && { competenciaId }),
      ...(tipo && { tipo: tipo as any }),
      ...(coberto !== null &&
        coberto !== "" && { coberto: coberto === "true" }),
      ...(busca && {
        colaborador: {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { matricula: { contains: busca } },
          ],
        },
      }),
    };

    const [faltas, total] = await Promise.all([
      prisma.falta.findMany({
        where,
        include: {
          colaborador: { select: { id: true, nome: true, matricula: true } },
          substituto: { select: { id: true, nome: true, matricula: true } },
          competencia: {
            select: { id: true, mes: true, ano: true, status: true },
          },
          posto: {
            select: {
              id: true,
              identificador: true,
              tomador: { select: { nomeFantasia: true, razaoSocial: true } },
            },
          },
          turno: {
            select: { id: true, nome: true, entrada: true, saida: true },
          },
        },
        orderBy: [{ data: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.falta.count({ where }),
    ]);

    return NextResponse.json({
      faltas,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao buscar faltas" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Verificar se competência está aberta
    const competencia = await prisma.competencia.findUnique({
      where: { id: data.competenciaId },
    });
    if (!competencia)
      return NextResponse.json(
        { error: "Competência não encontrada" },
        { status: 404 },
      );
    if (competencia.status === "FECHADA")
      return NextResponse.json(
        { error: "Competência fechada — lançamentos bloqueados" },
        { status: 409 },
      );

    // Verificar duplicidade
    const existe = await prisma.falta.findFirst({
      where: {
        colaboradorId: data.colaboradorId,
        data: new Date(data.data),
        turnoId: data.turnoId,
        cancelado: false,
      },
    });
    if (existe)
      return NextResponse.json(
        {
          error:
            "Já existe falta lançada para este colaborador nesta data e turno",
        },
        { status: 409 },
      );

    const falta = await prisma.falta.create({
      data: {
        colaboradorId: data.colaboradorId,
        competenciaId: data.competenciaId,
        data: new Date(data.data),
        postoId: data.postoId,
        turnoId: data.turnoId,
        tipo: data.tipo,
        substitutoId: data.substitutoId ?? null,
        coberto: !!data.substitutoId,
      },
    });

    return NextResponse.json(falta, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao registrar falta" },
      { status: 500 },
    );
  }
}
