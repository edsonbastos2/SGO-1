// src/app/api/colaboradores/importar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RowSchema = z.object({
  matricula: z.string().min(1, "Matrícula obrigatória").max(20),
  nome: z.string().min(2, "Nome obrigatório").max(120),
  cpf: z
    .string()
    .min(11, "CPF obrigatório")
    .max(14)
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 11, "CPF inválido"),
  dataAdmissao: z.string().min(1, "Data de admissão obrigatória"),
  dataNasc: z.string().optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  email: z.string().optional().nullable(),
  funcao: z.string().optional().nullable(),
  escala: z.string().optional().nullable(),
  banco: z.string().optional().nullable(),
  agencia: z.string().optional().nullable(),
  contaBancaria: z.string().optional().nullable(),
  tipoPix: z.string().optional().nullable(),
  chavePix: z.string().optional().nullable(),
});

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const v = String(value).trim();
  // DD/MM/AAAA
  const br = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br)
    return new Date(
      `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}T00:00:00.000Z`,
    );
  // ISO AAAA-MM-DD
  const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(`${iso[0]}T00:00:00.000Z`);
  // Serial Excel
  const n = Number(v);
  if (!isNaN(n) && n > 1000) return new Date((n - 25569) * 86400 * 1000);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { prestadoraId, rows } = (await req.json()) as {
      prestadoraId: string;
      rows: Record<string, string>[];
    };

    if (!prestadoraId)
      return NextResponse.json(
        { error: "prestadoraId obrigatório" },
        { status: 400 },
      );
    if (!Array.isArray(rows) || rows.length === 0)
      return NextResponse.json({ error: "Nenhuma linha" }, { status: 400 });
    if (rows.length > 500)
      return NextResponse.json(
        { error: "Máximo 500 por importação" },
        { status: 400 },
      );

    const prestadora = await prisma.prestadora.findUnique({
      where: { id: prestadoraId },
    });
    if (!prestadora)
      return NextResponse.json(
        { error: "Prestadora não encontrada" },
        { status: 404 },
      );

    const [funcoes, escalas] = await Promise.all([
      prisma.funcao.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
      }),
      prisma.escala.findMany({
        where: { ativo: true },
        select: { id: true, nome: true },
      }),
    ]);
    const funcaoMap = new Map(
      funcoes.map((f) => [f.nome.toLowerCase().trim(), f.id]),
    );
    const escalaMap = new Map(
      escalas.map((e) => [e.nome.toLowerCase().trim(), e.id]),
    );

    const resultados: {
      linha: number;
      status: "ok" | "erro";
      nome?: string;
      erros?: string[];
    }[] = [];
    let criados = 0;

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const linha = i + 1;
      const parsed = RowSchema.safeParse({
        matricula: raw.matricula || "",
        nome: raw.nome || "",
        cpf: raw.cpf || "",
        dataAdmissao: raw.dataAdmissao || "",
        dataNasc: raw.dataNasc || null,
        telefone: raw.telefone || null,
        email: raw.email || null,
        funcao: raw.funcao || null,
        escala: raw.escala || null,
        banco: raw.banco || null,
        agencia: raw.agencia || null,
        contaBancaria: raw.contaBancaria || null,
        tipoPix: raw.tipoPix || null,
        chavePix: raw.chavePix || null,
      });

      if (!parsed.success) {
        resultados.push({
          linha,
          status: "erro",
          nome: raw.nome,
          erros: parsed.error.errors.map((e) => e.message),
        });
        continue;
      }

      const d = parsed.data;

      const [cpfExiste, matExiste] = await Promise.all([
        prisma.colaborador.findUnique({ where: { cpf: d.cpf } }),
        prisma.colaborador.findUnique({
          where: {
            prestadoraId_matricula: { prestadoraId, matricula: d.matricula },
          },
        }),
      ]);

      if (cpfExiste) {
        resultados.push({
          linha,
          status: "erro",
          nome: d.nome,
          erros: [`CPF ${d.cpf} já cadastrado`],
        });
        continue;
      }
      if (matExiste) {
        resultados.push({
          linha,
          status: "erro",
          nome: d.nome,
          erros: [`Matrícula ${d.matricula} já existe`],
        });
        continue;
      }

      const dataAdmissao = parseDate(d.dataAdmissao);
      if (!dataAdmissao) {
        resultados.push({
          linha,
          status: "erro",
          nome: d.nome,
          erros: ["Data de admissão inválida. Use DD/MM/AAAA"],
        });
        continue;
      }

      try {
        await prisma.colaborador.create({
          data: {
            prestadoraId,
            matricula: d.matricula,
            cpf: d.cpf,
            nome: d.nome,
            dataAdmissao,
            dataNasc: parseDate(d.dataNasc ?? null),
            telefone: d.telefone || null,
            email: d.email || null,
            funcaoId: d.funcao
              ? (funcaoMap.get(d.funcao.toLowerCase().trim()) ?? null)
              : null,
            escalaId: d.escala
              ? (escalaMap.get(d.escala.toLowerCase().trim()) ?? null)
              : null,
            banco: d.banco || null,
            agencia: d.agencia || null,
            contaBancaria: d.contaBancaria || null,
            tipoPix: d.tipoPix || null,
            chavePix: d.chavePix || null,
            status: "ATIVO",
          },
        });
        resultados.push({ linha, status: "ok", nome: d.nome });
        criados++;
      } catch (e: any) {
        resultados.push({
          linha,
          status: "erro",
          nome: d.nome,
          erros: [e.message ?? "Erro ao criar"],
        });
      }
    }

    return NextResponse.json({
      total: rows.length,
      criados,
      erros: rows.length - criados,
      resultados,
    });
  } catch (e: any) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
