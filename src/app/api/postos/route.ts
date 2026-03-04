import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  tomadorId: z.string().min(1, "Tomador obrigatório"),
  identificador: z.string().min(2, "Mínimo 2 caracteres").max(100),
  endereco: z.string().max(200).optional().nullable(),
  cidade: z.string().max(80).optional().nullable(),
  uf: z.string().length(2).optional().nullable(),
  tipo: z.string().max(60).optional().nullable(),
  observacoes: z.string().max(500).optional().nullable(),
  ativo: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busca = searchParams.get("busca") ?? "";
    const ativo = searchParams.get("ativo");
    const tomadorId = searchParams.get("tomadorId");

    const postos = await prisma.postoTrabalho.findMany({
      where: {
        ...(busca && {
          OR: [
            { identificador: { contains: busca, mode: "insensitive" } },
            { cidade: { contains: busca, mode: "insensitive" } },
          ],
        }),
        ...(ativo !== null && ativo !== "" && { ativo: ativo === "true" }),
        ...(tomadorId !== null && tomadorId !== "" && { tomadorId: tomadorId }),
      },
      include: {
        tomador: {
          select: { id: true, nomeFantasia: true, razaoSocial: true },
        },
        _count: { select: { vagas: true, alocacoes: true } },
      },
      orderBy: [{ tomador: { razaoSocial: "asc" } }, { identificador: "asc" }],
    });

    return NextResponse.json(postos);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar postos" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const posto = await prisma.postoTrabalho.create({ data });
    return NextResponse.json(posto, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Erro ao criar posto" }, { status: 500 });
  }
}
