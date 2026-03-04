import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(2).max(80),
  padrao: z.string().max(20).optional().nullable(),
  jornadaHoras: z.number().min(1).max(24),
  intervaloMin: z.number().min(0).max(120),
  regrasSabado: z.string().max(200).optional().nullable(),
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
    const data = schema.parse(await req.json());
    const escala = await prisma.escala.update({
      where: { id: (await params).id },
      data,
    });
    return NextResponse.json(escala);
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao atualizar escala" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const escala = await prisma.escala.findUnique({
      where: { id: (await params).id },
      include: { _count: { select: { colaboradores: true } } },
    });
    if (!escala)
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    if (escala._count.colaboradores > 0)
      return NextResponse.json(
        {
          error: `${escala._count.colaboradores} colaborador(es) vinculado(s)`,
        },
        { status: 409 },
      );

    await prisma.escala.update({
      where: { id: (await params).id },
      data: { ativo: false },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir escala" },
      { status: 500 },
    );
  }
}
