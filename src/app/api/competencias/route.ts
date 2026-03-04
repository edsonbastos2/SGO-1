import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  mes: z.number().min(1).max(12),
  ano: z.number().min(2020).max(2099),
  dataAbertura: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") ?? "24");

    const competencias = await prisma.competencia.findMany({
      where: { ...(status && { status: status as any }) },
      include: {
        _count: {
          select: { extras: true, faltas: true, calendarios: true },
        },
      },
      orderBy: [{ ano: "desc" }, { mes: "desc" }],
      take: limit,
    });

    return NextResponse.json(competencias);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar competências" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existe = await prisma.competencia.findUnique({
      where: { mes_ano: { mes: data.mes, ano: data.ano } },
    });
    if (existe)
      return NextResponse.json(
        { error: "Competência já existe para este mês/ano" },
        { status: 409 },
      );

    const competencia = await prisma.competencia.create({
      data: {
        mes: data.mes,
        ano: data.ano,
        dataAbertura: new Date(data.dataAbertura),
        status: "ABERTA",
      },
    });
    return NextResponse.json(competencia, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao criar competência" },
      { status: 500 },
    );
  }
}
