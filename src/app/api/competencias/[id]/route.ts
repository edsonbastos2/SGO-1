import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schemaFechar = z.object({
  action: z.enum(["fechar", "reabrir"]),
  justificativaReabertura: z.string().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const data = schemaFechar.parse(body);

    if (data.action === "fechar") {
      const competencia = await prisma.competencia.update({
        where: { id: params.id },
        data: { status: "FECHADA", dataFechamento: new Date() },
      });
      return NextResponse.json(competencia);
    }

    if (data.action === "reabrir") {
      if (!data.justificativaReabertura)
        return NextResponse.json(
          { error: "Justificativa obrigatória para reabertura" },
          { status: 400 },
        );

      const competencia = await prisma.competencia.update({
        where: { id: params.id },
        data: {
          status: "ABERTA",
          dataFechamento: null,
          justificativaReabertura: data.justificativaReabertura,
        },
      });
      return NextResponse.json(competencia);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao atualizar competência" },
      { status: 500 },
    );
  }
}
