import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schemaCancelar = z.object({
  justCancelamento: z.string().min(5, "Mínimo 5 caracteres"),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const data = schemaCancelar.parse(body);

    const falta = await prisma.falta.findUnique({ where: { id: params.id } });
    if (!falta)
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    // Verificar se competência ainda está aberta
    const competencia = await prisma.competencia.findUnique({
      where: { id: falta.competenciaId },
    });
    if (competencia?.status === "FECHADA")
      return NextResponse.json(
        { error: "Competência fechada — cancelamento bloqueado" },
        { status: 409 },
      );

    await prisma.falta.update({
      where: { id: params.id },
      data: { cancelado: true, justCancelamento: data.justCancelamento },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao cancelar falta" },
      { status: 500 },
    );
  }
}
