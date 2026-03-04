import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  matricula: z.string().min(1).max(20),
  nome: z.string().min(2).max(120),
  dataNasc: z.string().optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  dataAdmissao: z.string().min(1),
  dataDesligamento: z.string().optional().nullable(),
  funcaoId: z.string().optional().nullable(),
  escalaId: z.string().optional().nullable(),
  status: z.enum(["ATIVO", "RESERVA", "DESLIGADO", "AFASTADO"]),
  tipoPix: z.string().optional().nullable(),
  chavePix: z.string().optional().nullable(),
  banco: z.string().optional().nullable(),
  agencia: z.string().optional().nullable(),
  contaBancaria: z.string().optional().nullable(),
});

type RouteParams = {
  id: string;
};

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const colaborador = await prisma.colaborador.findUnique({
      where: { id: (await params).id },
      include: {
        prestadora: { select: { id: true, nomeFantasia: true } },
        funcao: true,
        escala: true,
        alocacoes: {
          include: {
            posto: { include: { tomador: true } },
            turno: true,
            funcao: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!colaborador)
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(colaborador);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar colaborador" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const colaborador = await prisma.colaborador.update({
      where: { id: (await params).id },
      data: {
        ...data,
        email: data.email || null,
        dataNasc: data.dataNasc ? new Date(data.dataNasc) : null,
        dataAdmissao: new Date(data.dataAdmissao),
        dataDesligamento: data.dataDesligamento
          ? new Date(data.dataDesligamento)
          : null,
      },
    });
    return NextResponse.json(colaborador);
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao atualizar colaborador" },
      { status: 500 },
    );
  }
}
