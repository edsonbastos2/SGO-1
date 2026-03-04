import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const schema = z.object({
  nome: z.string().min(2).max(80),
  entrada: z.string().regex(timeRegex, "Formato HH:MM"),
  intervalo: z.string().regex(timeRegex, "Formato HH:MM"),
  retorno: z.string().regex(timeRegex, "Formato HH:MM"),
  saida: z.string().regex(timeRegex, "Formato HH:MM"),
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
    const turno = await prisma.turno.update({
      where: { id: (await params).id },
      data,
    });
    return NextResponse.json(turno);
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao atualizar turno" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<RouteParams> },
) {
  try {
    const turno = await prisma.turno.findUnique({
      where: { id: (await params).id },
      include: { _count: { select: { alocacoes: true } } },
    });
    if (!turno)
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    if (turno._count.alocacoes > 0)
      return NextResponse.json(
        { error: `${turno._count.alocacoes} alocação(ões) vinculada(s)` },
        { status: 409 },
      );

    await prisma.turno.update({
      where: { id: (await params).id },
      data: { ativo: false },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir turno" },
      { status: 500 },
    );
  }
}
