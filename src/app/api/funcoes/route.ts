import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  nome: z.string().min(2, "Mínimo 2 caracteres").max(80),
  descricao: z.string().max(255).optional().nullable(),
  ativo: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busca = searchParams.get("busca") ?? "";
    const ativo = searchParams.get("ativo");

    const funcoes = await prisma.funcao.findMany({
      where: {
        ...(busca && { nome: { contains: busca, mode: "insensitive" } }),
        ...(ativo !== null && ativo !== "" && { ativo: ativo === "true" }),
      },
      include: { _count: { select: { colaboradores: true, vagas: true } } },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(funcoes);
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao buscar funções" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existe = await prisma.funcao.findUnique({
      where: { nome: data.nome },
    });
    if (existe)
      return NextResponse.json(
        { error: "Já existe uma função com esse nome" },
        { status: 409 },
      );

    const funcao = await prisma.funcao.create({ data });
    return NextResponse.json(funcao, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao criar função" },
      { status: 500 },
    );
  }
}
