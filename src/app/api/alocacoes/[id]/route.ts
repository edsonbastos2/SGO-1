import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
export const dynamic = "force-dynamic";
const schema = z.object({
  status: z.enum(["ATIVA", "ENCERRADA"]),
  dataFim: z.string().optional().nullable(),
  motivoEncerramento: z.string().optional().nullable(),
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
    const alocacao = await prisma.alocacao.update({
      where: { id: (await params).id },
      data: {
        status: data.status,
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        motivoEncerramento: data.motivoEncerramento ?? null,
      },
    });
    return NextResponse.json(alocacao);
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao atualizar alocação" },
      { status: 500 },
    );
  }
}
