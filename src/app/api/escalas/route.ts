import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(2, "Mínimo 2 caracteres").max(80),
  padrao: z.string().max(20).optional().nullable(),
  jornadaHoras: z.number().min(1).max(24),
  intervaloMin: z.number().min(0).max(120),
  regrasSabado: z.string().max(200).optional().nullable(),
  ativo: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busca = searchParams.get("busca") ?? "";
    const ativo = searchParams.get("ativo");

    const escalas = await prisma.escala.findMany({
      where: {
        ...(busca && { nome: { contains: busca, mode: "insensitive" } }),
        ...(ativo !== null && ativo !== "" && { ativo: ativo === "true" }),
      },
      include: { _count: { select: { colaboradores: true } } },
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(escalas);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar escalas" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const escala = await prisma.escala.create({ data });
    return NextResponse.json(escala, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao criar escala" },
      { status: 500 },
    );
  }
}
