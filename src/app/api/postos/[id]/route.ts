import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  identificador: z.string().min(2).max(100),
  endereco: z.string().max(200).optional().nullable(),
  cidade: z.string().max(80).optional().nullable(),
  uf: z.string().length(2).optional().nullable(),
  tipo: z.string().max(60).optional().nullable(),
  observacoes: z.string().max(500).optional().nullable(),
  ativo: z.boolean(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const posto = await prisma.postoTrabalho.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(posto);
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao atualizar posto" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const posto = await prisma.postoTrabalho.findUnique({
      where: { id: params.id },
      include: { _count: { select: { alocacoes: true } } },
    });
    if (!posto)
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    if (posto._count.alocacoes > 0)
      return NextResponse.json(
        {
          error: `Não é possível excluir: ${posto._count.alocacoes} alocação(ões) vinculada(s)`,
        },
        { status: 409 },
      );

    await prisma.postoTrabalho.update({
      where: { id: params.id },
      data: { ativo: false },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao excluir posto" },
      { status: 500 },
    );
  }
}
