import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  cnpjCpf: z.string().min(11).max(18),
  razaoSocial: z.string().min(2).max(120),
  nomeFantasia: z.string().max(120).optional().nullable(),
  endereco: z.string().max(200).optional().nullable(),
  cidade: z.string().max(80).optional().nullable(),
  uf: z.string().length(2).optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  exigeAprovacao: z.boolean(),
  vtdPadrao: z.number().min(0).optional().nullable(),
  vaPadrao: z.number().min(0).optional().nullable(),
  vaJornadaMin: z.number().min(0).optional().nullable(),
  ativo: z.boolean(),
});

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tomador = await prisma.tomador.findUnique({
      where: { id: params.id },
      include: { postos: true, _count: { select: { postos: true } } },
    });
    if (!tomador)
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    return NextResponse.json(tomador);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar tomador" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const tomador = await prisma.tomador.update({
      where: { id: params.id },
      data: { ...data, email: data.email || null },
    });
    return NextResponse.json(tomador);
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao atualizar tomador" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const tomador = await prisma.tomador.findUnique({
      where: { id: params.id },
      include: { _count: { select: { postos: true } } },
    });
    if (!tomador)
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    if (tomador._count.postos > 0)
      return NextResponse.json(
        {
          error: `Não é possível excluir: ${tomador._count.postos} posto(s) vinculado(s)`,
        },
        { status: 409 },
      );

    await prisma.tomador.update({
      where: { id: params.id },
      data: { ativo: false },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir tomador" },
      { status: 500 },
    );
  }
}
