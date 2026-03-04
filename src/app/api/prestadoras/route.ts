import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prestadoras = await prisma.prestadora.findMany({
      where: { ativo: true },
      select: { id: true, nomeFantasia: true, razaoSocial: true },
      orderBy: { razaoSocial: "asc" },
    });
    return NextResponse.json(prestadoras);
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar prestadoras" },
      { status: 500 },
    );
  }
}
