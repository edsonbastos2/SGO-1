// src/app/api/extras/aprovar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapacidade } from "@/lib/auth/rbac";
import { registrarAuditoria } from "@/lib/audit";
import { z } from "zod";
import { getUsuarioFromRequest } from "@/lib/auth/session";

const AprovacaoSchema = z.object({
  extraId: z.string().min(1),
  decisao: z.enum(["APROVADO", "REPROVADO"]),
  justReprovacao: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioFromRequest(req);
    await requireCapacidade(usuario.id, "APROVAR_EXTRAS");

    const body = await req.json();
    const parsed = AprovacaoSchema.parse(body);

    const extra = await prisma.extra.findUnique({
      where: { id: parsed.extraId },
      include: {
        motivo: { select: { exigeEvidencia: true, nome: true } },
        evidencias: true,
      },
    });

    if (!extra) {
      return NextResponse.json(
        { error: "Extra não encontrado." },
        { status: 404 },
      );
    }

    if (extra.status !== "PENDENTE") {
      return NextResponse.json(
        { error: `Extra já está com status: ${extra.status}` },
        { status: 422 },
      );
    }

    if (
      parsed.decisao === "APROVADO" &&
      extra.motivo.exigeEvidencia &&
      extra.evidencias.length === 0
    ) {
      return NextResponse.json(
        { error: "Este motivo exige evidência antes da aprovação." },
        { status: 422 },
      );
    }

    if (parsed.decisao === "REPROVADO" && !parsed.justReprovacao) {
      return NextResponse.json(
        { error: "Justificativa obrigatória para reprovação." },
        { status: 422 },
      );
    }

    const extraAtualizado = await prisma.extra.update({
      where: { id: parsed.extraId },
      data: {
        status: parsed.decisao,
        aprovadoPorId: usuario.id,
        aprovadoEm: new Date(),
        justReprovacao: parsed.justReprovacao,
      },
    });

    await registrarAuditoria({
      usuarioId: usuario.id,
      tipo: parsed.decisao === "APROVADO" ? "APPROVE" : "REJECT",
      entidade: "extras",
      entidadeId: extra.id,
      descricao: `Extra ${extra.motivo.nome}: ${parsed.decisao}`,
      dadosAntes: { status: extra.status },
      dadosDepois: {
        status: parsed.decisao,
        justReprovacao: parsed.justReprovacao,
      },
    });

    return NextResponse.json(extraAtualizado);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
