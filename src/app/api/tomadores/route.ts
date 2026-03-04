import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  cnpjCpf: z.string().min(11, "CNPJ/CPF inválido").max(18),
  razaoSocial: z.string().min(2, "Mínimo 2 caracteres").max(120),
  nomeFantasia: z.string().max(120).optional().nullable(),
  endereco: z.string().max(200).optional().nullable(),
  cidade: z.string().max(80).optional().nullable(),
  uf: z.string().length(2, "UF inválida").optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  email: z
    .string()
    .email("E-mail inválido")
    .optional()
    .nullable()
    .or(z.literal("")),
  exigeAprovacao: z.boolean().optional().default(false),
  vtdPadrao: z.number().min(0).optional().nullable(),
  vaPadrao: z.number().min(0).optional().nullable(),
  vaJornadaMin: z.number().min(0).optional().nullable(),
  prestadoraId: z.string().min(1, "Prestadora obrigatória"),
  ativo: z.boolean().optional().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busca = searchParams.get("busca") ?? "";
    const ativo = searchParams.get("ativo");
    const prestadoraId = searchParams.get("prestadoraId");

    const tomadores = await prisma.tomador.findMany({
      where: {
        ...(busca && {
          OR: [
            { razaoSocial: { contains: busca, mode: "insensitive" } },
            { nomeFantasia: { contains: busca, mode: "insensitive" } },
            { cnpjCpf: { contains: busca } },
          ],
        }),
        ...(ativo !== null && ativo !== "" && { ativo: ativo === "true" }),
        ...(prestadoraId && { prestadoraId }),
      },
      include: {
        prestadora: { select: { id: true, nomeFantasia: true } },
        _count: { select: { postos: true } },
      },
      orderBy: { razaoSocial: "asc" },
    });

    return NextResponse.json(tomadores);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar tomadores" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existe = await prisma.tomador.findFirst({
      where: { prestadoraId: data.prestadoraId, cnpjCpf: data.cnpjCpf },
    });
    if (existe)
      return NextResponse.json(
        { error: "CNPJ/CPF já cadastrado para esta prestadora" },
        { status: 409 },
      );

    const tomador = await prisma.tomador.create({
      data: { ...data, email: data.email || null },
    });
    return NextResponse.json(tomador, { status: 201 });
  } catch (e: any) {
    if (e?.name === "ZodError")
      return NextResponse.json({ error: e.errors[0].message }, { status: 400 });
    return NextResponse.json(
      { error: "Erro ao criar tomador" },
      { status: 500 },
    );
  }
}
