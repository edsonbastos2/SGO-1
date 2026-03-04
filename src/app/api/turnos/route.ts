import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const schema = z.object({
  nome: z.string().min(2, "Mínimo 2 caracteres").max(80),
  entrada: z.string().regex(timeRegex, "Formato HH:MM"),
  intervalo: z.string().regex(timeRegex, "Formato HH:MM"),
  retorno: z.string().regex(timeRegex, "Formato HH:MM"),
  saida: z.string().regex(timeRegex, "Formato HH:MM"),
  ativo: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busca = searchParams.get("busca") ?? "";
    const ativo = searchParams.get("ativo");

    const turnos = await prisma.turno.findMany({
      where: {
        ...(busca && { nome: { contains: busca, mode: "insensitive" } }),
        ...(ativo !== null && ativo !== "" && { ativo: ativo === "true" }),
      },
      include: { _count: { select: { alocacoes: true } } },
      orderBy: [{ entrada: "asc" }, { nome: "asc" }],
    });
    return NextResponse.json(turnos);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar turnos" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const turno = await prisma.turno.create({ data });
    return NextResponse.json(turno, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erro ao criar turno" }, { status: 500 });
  }
}
