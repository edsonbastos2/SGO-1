import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(2).max(80),
  descricao: z.string().max(255).optional().nullable(),
  ativo: z.boolean(),
});

type RouteParams = {
  id: string;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existe = await prisma.funcao.findFirst({
      where: { nome: data.nome, NOT: { id: (await params).id } },
    });
    if (existe)
      return NextResponse.json(
        { error: "Já existe uma função com esse nome" },
        { status: 409 },
      );

    const funcao = await prisma.funcao.update({
      where: { id: (await params).id },
      data,
    });
    return NextResponse.json(funcao);
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao atualizar função" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const funcao = await prisma.funcao.findUnique({
      where: { id: (await params).id },
      include: { _count: { select: { colaboradores: true } } },
    });
    if (!funcao)
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    if (funcao._count.colaboradores > 0)
      return NextResponse.json(
        {
          error: `Não é possível excluir: ${funcao._count.colaboradores} colaborador(es) vinculado(s)`,
        },
        { status: 409 },
      );

    // Soft delete — apenas desativa
    await prisma.funcao.update({
      where: { id: (await params).id },
      data: { ativo: false },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir função" },
      { status: 500 },
    );
  }
}
