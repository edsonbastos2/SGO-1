-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "Setor" AS ENUM ('TI_ADMIN', 'OPERACAO', 'RH', 'FINANCEIRO', 'CONTROLADORIA', 'SUPERVISOR_EXTERNO');

-- CreateEnum
CREATE TYPE "AcaoPermissao" AS ENUM ('V', 'C', 'E', 'L', 'D', 'A', 'P', 'X', 'AU');

-- CreateEnum
CREATE TYPE "CapacidadeCritica" AS ENUM ('APROVAR_EXTRAS', 'PARAMETRIZAR', 'CANCELAR_EXCLUIR', 'REABRIR_COMPETENCIA', 'AJUSTAR_CALENDARIO');

-- CreateEnum
CREATE TYPE "StatusColaborador" AS ENUM ('ATIVO', 'RESERVA', 'DESLIGADO', 'AFASTADO');

-- CreateEnum
CREATE TYPE "StatusAlocacao" AS ENUM ('ATIVA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "StatusExtra" AS ENUM ('PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "CategoriaExtra" AS ENUM ('HORA_EXTRA', 'SUBSTITUICAO', 'ADICIONAL', 'OUTROS');

-- CreateEnum
CREATE TYPE "TipoFalta" AS ENUM ('INJUSTIFICADA', 'JUSTIFICADA', 'ATESTADO', 'ABONO', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusCompetencia" AS ENUM ('ABERTA', 'FECHADA');

-- CreateEnum
CREATE TYPE "TipoFeriado" AS ENUM ('NACIONAL', 'ESTADUAL', 'MUNICIPAL', 'FACULTATIVO');

-- CreateEnum
CREATE TYPE "FormatoExportacao" AS ENUM ('XLSX', 'CSV', 'XLSM', 'PDF', 'DOCX');

-- CreateEnum
CREATE TYPE "TipoAuditoria" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'APPROVE', 'REJECT', 'BLOCK', 'REOPEN');

-- CreateEnum
CREATE TYPE "TipoRelatorio" AS ENUM ('RPT_001', 'RPT_002', 'RPT_003', 'RPT_004', 'RPT_005', 'RPT_006', 'RPT_007', 'RPT_010', 'RPT_011', 'RPT_012', 'RPT_020', 'RPT_021', 'RPT_022', 'RPT_023');

-- CreateTable
CREATE TABLE "prestadoras" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "cep" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prestadoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "setor" "Setor" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "primeiroAcesso" BOOLEAN NOT NULL DEFAULT true,
    "tentativasLogin" INTEGER NOT NULL DEFAULT 0,
    "ultimoAcesso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_prestadoras" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "prestadoraId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_prestadoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacidades_usuarios" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "capacidade" "CapacidadeCritica" NOT NULL,
    "gerenteId" TEXT NOT NULL,
    "justificativa" TEXT NOT NULL,
    "validadeAte" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revogedAt" TIMESTAMP(3),

    CONSTRAINT "capacidades_usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escopo_supervisores" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escopo_supervisores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escopo_supervisor_itens" (
    "id" TEXT NOT NULL,
    "escopoId" TEXT NOT NULL,
    "tomadorId" TEXT NOT NULL,
    "postoId" TEXT,
    "turnoId" TEXT,

    CONSTRAINT "escopo_supervisor_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissoes_modulos" (
    "id" TEXT NOT NULL,
    "setor" "Setor" NOT NULL,
    "modulo" TEXT NOT NULL,
    "acao" "AcaoPermissao" NOT NULL,

    CONSTRAINT "permissoes_modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tomadores" (
    "id" TEXT NOT NULL,
    "prestadoraId" TEXT NOT NULL,
    "cnpjCpf" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "endereco" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "exigeAprovacao" BOOLEAN NOT NULL DEFAULT false,
    "vtdPadrao" DECIMAL(10,2),
    "vaPadrao" DECIMAL(10,2),
    "vaJornadaMin" DECIMAL(4,2),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tomadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postos_trabalho" (
    "id" TEXT NOT NULL,
    "tomadorId" TEXT NOT NULL,
    "identificador" TEXT NOT NULL,
    "endereco" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "tipo" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postos_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vagas_postos" (
    "id" TEXT NOT NULL,
    "postoId" TEXT NOT NULL,
    "funcaoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "vagas_postos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidatos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores" (
    "id" TEXT NOT NULL,
    "prestadoraId" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNasc" TIMESTAMP(3),
    "telefone" TEXT,
    "email" TEXT,
    "dataAdmissao" TIMESTAMP(3) NOT NULL,
    "dataDesligamento" TIMESTAMP(3),
    "funcaoId" TEXT,
    "escalaId" TEXT,
    "status" "StatusColaborador" NOT NULL DEFAULT 'ATIVO',
    "tipoPix" TEXT,
    "chavePix" TEXT,
    "banco" TEXT,
    "agencia" TEXT,
    "contaBancaria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alocacoes" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "postoId" TEXT NOT NULL,
    "funcaoId" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "motivoEncerramento" TEXT,
    "status" "StatusAlocacao" NOT NULL DEFAULT 'ATIVA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alocacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asos" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "dataAdmissional" TIMESTAMP(3),
    "dataRenovacao" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "padrao" TEXT,
    "jornadaHoras" DECIMAL(4,2) NOT NULL,
    "intervaloMin" INTEGER NOT NULL,
    "regrasSabado" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escalas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turnos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "entrada" TEXT NOT NULL,
    "intervalo" TEXT NOT NULL,
    "retorno" TEXT NOT NULL,
    "saida" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competencias" (
    "id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "dataAbertura" TIMESTAMP(3) NOT NULL,
    "dataFechamento" TIMESTAMP(3),
    "status" "StatusCompetencia" NOT NULL DEFAULT 'ABERTA',
    "justificativaReabertura" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendario_colaboradores" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "competenciaId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "trabalhado" BOOLEAN NOT NULL DEFAULT true,
    "feriado" BOOLEAN NOT NULL DEFAULT false,
    "falta" BOOLEAN NOT NULL DEFAULT false,
    "justificativa" TEXT,
    "ajustadoPorId" TEXT,
    "ajusteJustif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calendario_colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_beneficios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "elegibilidadePadrao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores_beneficios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipo_beneficio_fornecedores" (
    "id" TEXT NOT NULL,
    "tipoId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,

    CONSTRAINT "tipo_beneficio_fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valores_beneficios" (
    "id" TEXT NOT NULL,
    "tipoId" TEXT NOT NULL,
    "prestadoraId" TEXT,
    "localidade" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "vigenciaInicio" DATE NOT NULL,
    "vigenciaFim" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "valores_beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaborador_beneficios" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "tipoId" TEXT NOT NULL,
    "optOut" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colaborador_beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficio_dependentes" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "beneficioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "parentesco" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beneficio_dependentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motivos_extras" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaExtra" NOT NULL,
    "exigeEvidencia" BOOLEAN NOT NULL DEFAULT false,
    "exigeAprovacao" BOOLEAN NOT NULL DEFAULT true,
    "ehSubstituicao" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motivos_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valores_extras" (
    "id" TEXT NOT NULL,
    "motivoId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "vigenciaInicio" DATE NOT NULL,
    "vigenciaFim" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valores_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extras" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "competenciaId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "postoId" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "motivoId" TEXT NOT NULL,
    "ausenteId" TEXT,
    "status" "StatusExtra" NOT NULL DEFAULT 'PENDENTE',
    "observacao" TEXT,
    "aprovadoPorId" TEXT,
    "aprovadoEm" TIMESTAMP(3),
    "justReprovacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias_extras" (
    "id" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT,
    "arquivoUrl" TEXT,
    "enviadoPor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faltas" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "competenciaId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "postoId" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "tipo" "TipoFalta" NOT NULL,
    "substitutoId" TEXT,
    "coberto" BOOLEAN NOT NULL DEFAULT false,
    "cancelado" BOOLEAN NOT NULL DEFAULT false,
    "justCancelamento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faltas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feriados_localidades" (
    "id" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoFeriado" NOT NULL,
    "uf" TEXT,
    "cidade" TEXT,
    "postoId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feriados_localidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feriados_trabalhados" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "competenciaId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "postoId" TEXT NOT NULL,
    "turnoId" TEXT NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feriados_trabalhados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocorrencias" (
    "id" TEXT NOT NULL,
    "colaboradorId" TEXT NOT NULL,
    "postoId" TEXT,
    "data" DATE NOT NULL,
    "descricao" TEXT NOT NULL,
    "arquivoUrl" TEXT,
    "cancelado" BOOLEAN NOT NULL DEFAULT false,
    "justCancelamento" TEXT,
    "canceladoPorId" TEXT,
    "canceladoEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ocorrencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recibos" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "referenciaId" TEXT NOT NULL,
    "referenciaTipo" TEXT NOT NULL,
    "geradoPorId" TEXT NOT NULL,
    "arquivoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recibos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_logs" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "tipo" "TipoAuditoria" NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT,
    "descricao" TEXT NOT NULL,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exportacao_logs" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "relatorio" "TipoRelatorio" NOT NULL,
    "formato" "FormatoExportacao" NOT NULL,
    "filtros" JSONB,
    "arquivoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCESSO',
    "erro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exportacao_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prestadoras_cnpj_key" ON "prestadoras"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_login_key" ON "usuarios"("login");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_prestadoras_usuarioId_prestadoraId_key" ON "usuario_prestadoras"("usuarioId", "prestadoraId");

-- CreateIndex
CREATE UNIQUE INDEX "escopo_supervisores_usuarioId_key" ON "escopo_supervisores"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "permissoes_modulos_setor_modulo_acao_key" ON "permissoes_modulos"("setor", "modulo", "acao");

-- CreateIndex
CREATE UNIQUE INDEX "tomadores_prestadoraId_cnpjCpf_key" ON "tomadores"("prestadoraId", "cnpjCpf");

-- CreateIndex
CREATE UNIQUE INDEX "funcoes_nome_key" ON "funcoes"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "vagas_postos_postoId_funcaoId_key" ON "vagas_postos"("postoId", "funcaoId");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_cpf_key" ON "colaboradores"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "colaboradores_prestadoraId_matricula_key" ON "colaboradores"("prestadoraId", "matricula");

-- CreateIndex
CREATE UNIQUE INDEX "competencias_mes_ano_key" ON "competencias"("mes", "ano");

-- CreateIndex
CREATE UNIQUE INDEX "calendario_colaboradores_colaboradorId_competenciaId_data_key" ON "calendario_colaboradores"("colaboradorId", "competenciaId", "data");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_beneficios_nome_key" ON "tipos_beneficios"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_beneficios_cnpj_key" ON "fornecedores_beneficios"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "tipo_beneficio_fornecedores_tipoId_fornecedorId_key" ON "tipo_beneficio_fornecedores"("tipoId", "fornecedorId");

-- CreateIndex
CREATE UNIQUE INDEX "colaborador_beneficios_colaboradorId_tipoId_key" ON "colaborador_beneficios"("colaboradorId", "tipoId");

-- CreateIndex
CREATE UNIQUE INDEX "motivos_extras_nome_key" ON "motivos_extras"("nome");

-- AddForeignKey
ALTER TABLE "usuario_prestadoras" ADD CONSTRAINT "usuario_prestadoras_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_prestadoras" ADD CONSTRAINT "usuario_prestadoras_prestadoraId_fkey" FOREIGN KEY ("prestadoraId") REFERENCES "prestadoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacidades_usuarios" ADD CONSTRAINT "capacidades_usuarios_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacidades_usuarios" ADD CONSTRAINT "capacidades_usuarios_gerenteId_fkey" FOREIGN KEY ("gerenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escopo_supervisores" ADD CONSTRAINT "escopo_supervisores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escopo_supervisor_itens" ADD CONSTRAINT "escopo_supervisor_itens_escopoId_fkey" FOREIGN KEY ("escopoId") REFERENCES "escopo_supervisores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escopo_supervisor_itens" ADD CONSTRAINT "escopo_supervisor_itens_tomadorId_fkey" FOREIGN KEY ("tomadorId") REFERENCES "tomadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escopo_supervisor_itens" ADD CONSTRAINT "escopo_supervisor_itens_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "postos_trabalho"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escopo_supervisor_itens" ADD CONSTRAINT "escopo_supervisor_itens_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tomadores" ADD CONSTRAINT "tomadores_prestadoraId_fkey" FOREIGN KEY ("prestadoraId") REFERENCES "prestadoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postos_trabalho" ADD CONSTRAINT "postos_trabalho_tomadorId_fkey" FOREIGN KEY ("tomadorId") REFERENCES "tomadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagas_postos" ADD CONSTRAINT "vagas_postos_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "postos_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagas_postos" ADD CONSTRAINT "vagas_postos_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "funcoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_prestadoraId_fkey" FOREIGN KEY ("prestadoraId") REFERENCES "prestadoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "funcoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_escalaId_fkey" FOREIGN KEY ("escalaId") REFERENCES "escalas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacoes" ADD CONSTRAINT "alocacoes_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacoes" ADD CONSTRAINT "alocacoes_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "postos_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacoes" ADD CONSTRAINT "alocacoes_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "funcoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacoes" ADD CONSTRAINT "alocacoes_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asos" ADD CONSTRAINT "asos_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendario_colaboradores" ADD CONSTRAINT "calendario_colaboradores_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendario_colaboradores" ADD CONSTRAINT "calendario_colaboradores_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "competencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendario_colaboradores" ADD CONSTRAINT "calendario_colaboradores_ajustadoPorId_fkey" FOREIGN KEY ("ajustadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_beneficio_fornecedores" ADD CONSTRAINT "tipo_beneficio_fornecedores_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipos_beneficios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipo_beneficio_fornecedores" ADD CONSTRAINT "tipo_beneficio_fornecedores_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores_beneficios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valores_beneficios" ADD CONSTRAINT "valores_beneficios_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipos_beneficios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valores_beneficios" ADD CONSTRAINT "valores_beneficios_prestadoraId_fkey" FOREIGN KEY ("prestadoraId") REFERENCES "prestadoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaborador_beneficios" ADD CONSTRAINT "colaborador_beneficios_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colaborador_beneficios" ADD CONSTRAINT "colaborador_beneficios_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipos_beneficios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficio_dependentes" ADD CONSTRAINT "beneficio_dependentes_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficio_dependentes" ADD CONSTRAINT "beneficio_dependentes_beneficioId_fkey" FOREIGN KEY ("beneficioId") REFERENCES "colaborador_beneficios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valores_extras" ADD CONSTRAINT "valores_extras_motivoId_fkey" FOREIGN KEY ("motivoId") REFERENCES "motivos_extras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extras" ADD CONSTRAINT "extras_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extras" ADD CONSTRAINT "extras_ausenteId_fkey" FOREIGN KEY ("ausenteId") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extras" ADD CONSTRAINT "extras_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "competencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extras" ADD CONSTRAINT "extras_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "postos_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extras" ADD CONSTRAINT "extras_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extras" ADD CONSTRAINT "extras_motivoId_fkey" FOREIGN KEY ("motivoId") REFERENCES "motivos_extras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extras" ADD CONSTRAINT "extras_aprovadoPorId_fkey" FOREIGN KEY ("aprovadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_extras" ADD CONSTRAINT "evidencias_extras_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "extras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faltas" ADD CONSTRAINT "faltas_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faltas" ADD CONSTRAINT "faltas_substitutoId_fkey" FOREIGN KEY ("substitutoId") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faltas" ADD CONSTRAINT "faltas_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "competencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faltas" ADD CONSTRAINT "faltas_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "postos_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faltas" ADD CONSTRAINT "faltas_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feriados_localidades" ADD CONSTRAINT "feriados_localidades_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "postos_trabalho"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feriados_trabalhados" ADD CONSTRAINT "feriados_trabalhados_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feriados_trabalhados" ADD CONSTRAINT "feriados_trabalhados_competenciaId_fkey" FOREIGN KEY ("competenciaId") REFERENCES "competencias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feriados_trabalhados" ADD CONSTRAINT "feriados_trabalhados_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "postos_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feriados_trabalhados" ADD CONSTRAINT "feriados_trabalhados_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "turnos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "colaboradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_postoId_fkey" FOREIGN KEY ("postoId") REFERENCES "postos_trabalho"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocorrencias" ADD CONSTRAINT "ocorrencias_canceladoPorId_fkey" FOREIGN KEY ("canceladoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recibos" ADD CONSTRAINT "recibos_geradoPorId_fkey" FOREIGN KEY ("geradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_logs" ADD CONSTRAINT "auditoria_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exportacao_logs" ADD CONSTRAINT "exportacao_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

