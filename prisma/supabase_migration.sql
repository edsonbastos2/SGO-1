-- ============================================================
-- SGO - Sistema de Gestão Operacional
-- Script SQL para Supabase (PostgreSQL)
-- v0.3 | Gerado a partir do Prisma Schema
-- ============================================================
-- Execute no Supabase SQL Editor ou via migration
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'INATIVO', 'BLOQUEADO');
CREATE TYPE "Setor" AS ENUM ('TI_ADMIN', 'OPERACAO', 'RH', 'FINANCEIRO', 'CONTROLADORIA', 'SUPERVISOR_EXTERNO');
CREATE TYPE "AcaoPermissao" AS ENUM ('V', 'C', 'E', 'L', 'D', 'A', 'P', 'X', 'AU');
CREATE TYPE "CapacidadeCritica" AS ENUM ('APROVAR_EXTRAS', 'PARAMETRIZAR', 'CANCELAR_EXCLUIR', 'REABRIR_COMPETENCIA', 'AJUSTAR_CALENDARIO');
CREATE TYPE "StatusColaborador" AS ENUM ('ATIVO', 'RESERVA', 'DESLIGADO', 'AFASTADO');
CREATE TYPE "StatusAlocacao" AS ENUM ('ATIVA', 'ENCERRADA');
CREATE TYPE "StatusExtra" AS ENUM ('PENDENTE', 'APROVADO', 'REPROVADO', 'CANCELADO');
CREATE TYPE "CategoriaExtra" AS ENUM ('HORA_EXTRA', 'SUBSTITUICAO', 'ADICIONAL', 'OUTROS');
CREATE TYPE "TipoFalta" AS ENUM ('INJUSTIFICADA', 'JUSTIFICADA', 'ATESTADO', 'ABONO', 'OUTROS');
CREATE TYPE "StatusCompetencia" AS ENUM ('ABERTA', 'FECHADA');
CREATE TYPE "TipoFeriado" AS ENUM ('NACIONAL', 'ESTADUAL', 'MUNICIPAL', 'FACULTATIVO');
CREATE TYPE "FormatoExportacao" AS ENUM ('XLSX', 'CSV', 'XLSM', 'PDF', 'DOCX');
CREATE TYPE "TipoAuditoria" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'APPROVE', 'REJECT', 'BLOCK', 'REOPEN');
CREATE TYPE "TipoRelatorio" AS ENUM ('RPT_001','RPT_002','RPT_003','RPT_004','RPT_005','RPT_006','RPT_007','RPT_010','RPT_011','RPT_012','RPT_020','RPT_021','RPT_022','RPT_023');

-- ============================================================
-- RF-010 | PRESTADORAS
-- ============================================================

CREATE TABLE prestadoras (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    cnpj          VARCHAR(18) NOT NULL UNIQUE,
    razao_social  VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    endereco      TEXT,
    cidade        VARCHAR(100),
    uf            CHAR(2),
    cep           VARCHAR(9),
    telefone      VARCHAR(20),
    email         VARCHAR(200),
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE prestadoras IS 'RF-010 - Cadastro de Prestadoras (CNPJ) no ambiente multiempresa';

-- ============================================================
-- RF-001 | USUÁRIOS
-- ============================================================

CREATE TABLE usuarios (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome             VARCHAR(200) NOT NULL,
    login            VARCHAR(100) NOT NULL UNIQUE,
    email            VARCHAR(200) NOT NULL UNIQUE,
    senha_hash       TEXT NOT NULL,
    setor            "Setor" NOT NULL,
    status           "UserStatus" NOT NULL DEFAULT 'ATIVO',
    primeiro_acesso  BOOLEAN NOT NULL DEFAULT TRUE,
    tentativas_login INT NOT NULL DEFAULT 0,
    ultimo_acesso    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE usuarios IS 'RF-001/RF-004 - Cadastro e autenticação de usuários';

CREATE TABLE usuario_prestadoras (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id    TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    prestadora_id TEXT NOT NULL REFERENCES prestadoras(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(usuario_id, prestadora_id)
);

-- ============================================================
-- RF-003 | CAPACIDADES CRÍTICAS
-- ============================================================

CREATE TABLE capacidades_usuarios (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id    TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    capacidade    "CapacidadeCritica" NOT NULL,
    gerente_id    TEXT NOT NULL REFERENCES usuarios(id),
    justificativa TEXT NOT NULL,
    validade_ate  TIMESTAMPTZ,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at    TIMESTAMPTZ
);

COMMENT ON TABLE capacidades_usuarios IS 'RF-003 - Capacidades críticas por usuário (A, P, D, etc.)';

-- ============================================================
-- RF-024 | ESCOPO DO SUPERVISOR
-- ============================================================

CREATE TABLE escopo_supervisores (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id TEXT NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RF-002 | PERMISSÕES POR MÓDULO (RBAC)
-- ============================================================

CREATE TABLE permissoes_modulos (
    id     TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    setor  "Setor" NOT NULL,
    modulo VARCHAR(100) NOT NULL,
    acao   "AcaoPermissao" NOT NULL,
    UNIQUE(setor, modulo, acao)
);

COMMENT ON TABLE permissoes_modulos IS 'RF-002 - Matriz RBAC: setor x módulo x ação';

-- ============================================================
-- RF-011 | TOMADORES
-- ============================================================

CREATE TABLE tomadores (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    prestadora_id    TEXT NOT NULL REFERENCES prestadoras(id),
    cnpj_cpf         VARCHAR(18) NOT NULL,
    razao_social     VARCHAR(200) NOT NULL,
    nome_fantasia    VARCHAR(200),
    endereco         TEXT,
    cidade           VARCHAR(100),
    uf               CHAR(2),
    telefone         VARCHAR(20),
    email            VARCHAR(200),
    exige_aprovacao  BOOLEAN NOT NULL DEFAULT FALSE,
    vtd_padrao       DECIMAL(10,2),
    va_padrao        DECIMAL(10,2),
    va_jornada_min   DECIMAL(4,2) DEFAULT 6.0,
    ativo            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(prestadora_id, cnpj_cpf)
);

COMMENT ON TABLE tomadores IS 'RF-011 - Cadastro de tomadores/clientes com parâmetros contratuais';

-- ============================================================
-- RF-012 | POSTOS DE TRABALHO
-- ============================================================

CREATE TABLE postos_trabalho (
    id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tomador_id    TEXT NOT NULL REFERENCES tomadores(id),
    identificador VARCHAR(100) NOT NULL,
    endereco      TEXT,
    cidade        VARCHAR(100),
    uf            CHAR(2),
    tipo          VARCHAR(100),
    observacoes   TEXT,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE postos_trabalho IS 'RF-012 - Postos de trabalho vinculados ao tomador';

-- ============================================================
-- RF-020 | FUNÇÕES
-- ============================================================

CREATE TABLE funcoes (
    id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome      VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE funcoes IS 'RF-020 - Funções para vagas e alocações';

-- ============================================================
-- RF-021 | VAGAS POR POSTO
-- ============================================================

CREATE TABLE vagas_postos (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    posto_id   TEXT NOT NULL REFERENCES postos_trabalho(id),
    funcao_id  TEXT NOT NULL REFERENCES funcoes(id),
    quantidade INT NOT NULL CHECK (quantidade >= 0),
    UNIQUE(posto_id, funcao_id)
);

COMMENT ON TABLE vagas_postos IS 'RF-021 - Quantidade de vagas por posto/função';

-- ============================================================
-- RF-024 | ITENS DO ESCOPO DO SUPERVISOR
-- ============================================================

-- (turnos precisa existir antes — criado abaixo, FK adicionada via ALTER)

CREATE TABLE escopo_supervisor_itens (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    escopo_id   TEXT NOT NULL REFERENCES escopo_supervisores(id) ON DELETE CASCADE,
    tomador_id  TEXT NOT NULL REFERENCES tomadores(id),
    posto_id    TEXT REFERENCES postos_trabalho(id),
    turno_id    TEXT -- FK adicionada após criação de turnos
);

-- ============================================================
-- RF-030 | ESCALAS
-- ============================================================

CREATE TABLE escalas (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome           VARCHAR(100) NOT NULL,
    padrao         VARCHAR(20),
    jornada_horas  DECIMAL(4,2) NOT NULL,
    intervalo_min  INT NOT NULL,
    regras_sabado  TEXT,
    ativo          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE escalas IS 'RF-030 - Escalas e regras de jornada/folga';

-- ============================================================
-- RF-031 | TURNOS
-- ============================================================

CREATE TABLE turnos (
    id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome      VARCHAR(100) NOT NULL,
    entrada   VARCHAR(5) NOT NULL, -- HH:MM
    intervalo VARCHAR(5) NOT NULL, -- HH:MM
    retorno   VARCHAR(5) NOT NULL, -- HH:MM
    saida     VARCHAR(5) NOT NULL, -- HH:MM
    ativo     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Validação: saída deve ser após entrada (considera virada de dia)
    CONSTRAINT turno_horario_valido CHECK (saida >= entrada OR saida < '06:00')
);

COMMENT ON TABLE turnos IS 'RF-031 - Turnos/horários para alocação e validação de conflito';

-- Adicionar FK de turno_id em escopo_supervisor_itens
ALTER TABLE escopo_supervisor_itens
    ADD CONSTRAINT fk_escopo_turno FOREIGN KEY (turno_id) REFERENCES turnos(id);

-- ============================================================
-- RF-040 | CANDIDATOS
-- ============================================================

CREATE TABLE candidatos (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome        VARCHAR(200) NOT NULL,
    cpf         VARCHAR(14),
    telefone    VARCHAR(20),
    email       VARCHAR(200),
    status      VARCHAR(50) NOT NULL DEFAULT 'ATIVO',
    observacoes TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE candidatos IS 'RF-040 - Candidatos mantidos pelo RH';

-- ============================================================
-- RF-041 | COLABORADORES
-- ============================================================

CREATE TABLE colaboradores (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    prestadora_id    TEXT NOT NULL REFERENCES prestadoras(id),
    matricula        VARCHAR(50) NOT NULL,
    cpf              VARCHAR(14) NOT NULL UNIQUE,
    nome             VARCHAR(200) NOT NULL,
    data_nasc        DATE,
    telefone         VARCHAR(20),
    email            VARCHAR(200),
    data_admissao    DATE NOT NULL,
    data_desligamento DATE,
    funcao_id        TEXT REFERENCES funcoes(id),
    escala_id        TEXT REFERENCES escalas(id),
    status           "StatusColaborador" NOT NULL DEFAULT 'ATIVO',
    tipo_pix         VARCHAR(30),
    chave_pix        VARCHAR(150),
    banco            VARCHAR(100),
    agencia          VARCHAR(10),
    conta_bancaria   VARCHAR(20),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(prestadora_id, matricula)
);

COMMENT ON TABLE colaboradores IS 'RF-041 - Cadastro completo de colaboradores';

-- ============================================================
-- RF-022 | ALOCAÇÕES
-- ============================================================

CREATE TABLE alocacoes (
    id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    colaborador_id        TEXT NOT NULL REFERENCES colaboradores(id),
    posto_id             TEXT NOT NULL REFERENCES postos_trabalho(id),
    funcao_id            TEXT NOT NULL REFERENCES funcoes(id),
    turno_id             TEXT NOT NULL REFERENCES turnos(id),
    data_inicio          DATE NOT NULL,
    data_fim             DATE,
    motivo_encerramento  TEXT,
    status               "StatusAlocacao" NOT NULL DEFAULT 'ATIVA',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE alocacoes IS 'RF-022 - Alocação de colaboradores (máx. 2 simultâneas)';

-- ============================================================
-- RF-042 | ASO
-- ============================================================

CREATE TABLE asos (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    colaborador_id  TEXT NOT NULL REFERENCES colaboradores(id),
    data_admissional DATE,
    data_renovacao  DATE,
    observacoes     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE asos IS 'RF-042 - ASO admissional e renovação com alertas';

-- ============================================================
-- RF-100 | COMPETÊNCIAS
-- ============================================================

CREATE TABLE competencias (
    id                       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    mes                      INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    ano                      INT NOT NULL CHECK (ano >= 2020),
    data_abertura            TIMESTAMPTZ NOT NULL,
    data_fechamento          TIMESTAMPTZ,
    status                   "StatusCompetencia" NOT NULL DEFAULT 'ABERTA',
    justificativa_reabertura TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(mes, ano)
);

COMMENT ON TABLE competencias IS 'RF-100 - Competências mensais com janela configurável';

-- ============================================================
-- RF-032 / RF-033 | CALENDÁRIO DO COLABORADOR
-- ============================================================

CREATE TABLE calendario_colaboradores (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    colaborador_id  TEXT NOT NULL REFERENCES colaboradores(id),
    competencia_id  TEXT NOT NULL REFERENCES competencias(id),
    data            DATE NOT NULL,
    trabalhado      BOOLEAN NOT NULL DEFAULT TRUE,
    feriado         BOOLEAN NOT NULL DEFAULT FALSE,
    falta           BOOLEAN NOT NULL DEFAULT FALSE,
    justificativa   TEXT,
    ajustado_por    TEXT REFERENCES usuarios(id),
    ajuste_justif   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(colaborador_id, competencia_id, data)
);

COMMENT ON TABLE calendario_colaboradores IS 'RF-032/033 - Calendário gerado por competência por colaborador';

-- ============================================================
-- RF-050 | TIPOS DE BENEFÍCIO
-- ============================================================

CREATE TABLE tipos_beneficios (
    id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome                 VARCHAR(100) NOT NULL UNIQUE,
    unidade              VARCHAR(50) NOT NULL,
    elegibilidade_padrao TEXT,
    ativo                BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tipos_beneficios IS 'RF-050 - Tipos de benefícios: VTD, VA, Saúde, Odonto etc.';

-- Dados iniciais
INSERT INTO tipos_beneficios (nome, unidade, elegibilidade_padrao) VALUES
    ('VTD', 'valor', 'Por dia trabalhado'),
    ('VA', 'valor', 'Por jornada acima de 6h'),
    ('Saúde', 'mensal', 'Titular e dependentes'),
    ('Odontológico', 'mensal', 'Titular e dependentes');

-- ============================================================
-- RF-051 | FORNECEDORES DE BENEFÍCIOS
-- ============================================================

CREATE TABLE fornecedores_beneficios (
    id        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome      VARCHAR(200) NOT NULL,
    cnpj      VARCHAR(18) NOT NULL UNIQUE,
    telefone  VARCHAR(20),
    email     VARCHAR(200),
    ativo     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tipo_beneficio_fornecedores (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tipo_id      TEXT NOT NULL REFERENCES tipos_beneficios(id),
    fornecedor_id TEXT NOT NULL REFERENCES fornecedores_beneficios(id),
    UNIQUE(tipo_id, fornecedor_id)
);

-- ============================================================
-- RF-052 | VALORES DE BENEFÍCIOS COM VIGÊNCIA
-- ============================================================

CREATE TABLE valores_beneficios (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tipo_id         TEXT NOT NULL REFERENCES tipos_beneficios(id),
    prestadora_id   TEXT REFERENCES prestadoras(id),
    localidade      VARCHAR(100),
    valor           DECIMAL(10,2) NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim    DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Vigências não sobrepostas por chave
    CONSTRAINT vigencia_valida CHECK (vigencia_fim IS NULL OR vigencia_fim > vigencia_inicio)
);

COMMENT ON TABLE valores_beneficios IS 'RF-052 - Valores de benefícios com vigência (sem sobreposição)';

-- ============================================================
-- RF-041 (benefícios do colaborador) / RF-055
-- ============================================================

CREATE TABLE colaborador_beneficios (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    colaborador_id  TEXT NOT NULL REFERENCES colaboradores(id),
    tipo_id         TEXT NOT NULL REFERENCES tipos_beneficios(id),
    opt_out         BOOLEAN NOT NULL DEFAULT FALSE,
    observacoes     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(colaborador_id, tipo_id)
);

CREATE TABLE beneficio_dependentes (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    colaborador_id  TEXT NOT NULL REFERENCES colaboradores(id),
    beneficio_id    TEXT NOT NULL REFERENCES colaborador_beneficios(id),
    nome            VARCHAR(200) NOT NULL,
    cpf             VARCHAR(14),
    parentesco      VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RF-060 | MOTIVOS DE EXTRAS
-- ============================================================

CREATE TABLE motivos_extras (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    nome            VARCHAR(100) NOT NULL UNIQUE,
    categoria       "CategoriaExtra" NOT NULL,
    exige_evidencia BOOLEAN NOT NULL DEFAULT FALSE,
    exige_aprovacao BOOLEAN NOT NULL DEFAULT TRUE,
    eh_substituicao BOOLEAN NOT NULL DEFAULT FALSE,
    ativo           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE motivos_extras IS 'RF-060 - Motivos de extras com categoria e flags de controle';

-- ============================================================
-- RF-061 | VALORES DE EXTRAS COM VIGÊNCIA
-- ============================================================

CREATE TABLE valores_extras (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    motivo_id       TEXT NOT NULL REFERENCES motivos_extras(id),
    valor           DECIMAL(10,2) NOT NULL,
    vigencia_inicio DATE NOT NULL,
    vigencia_fim    DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT vigencia_extra_valida CHECK (vigencia_fim IS NULL OR vigencia_fim > vigencia_inicio)
);

-- ============================================================
-- RF-062 / RF-063 / RF-064 / RF-065 | EXTRAS
-- ============================================================

CREATE TABLE extras (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    colaborador_id  TEXT NOT NULL REFERENCES colaboradores(id),
    competencia_id  TEXT NOT NULL REFERENCES competencias(id),
    data            DATE NOT NULL,
    posto_id        TEXT NOT NULL REFERENCES postos_trabalho(id),
    turno_id        TEXT NOT NULL REFERENCES turnos(id),
    motivo_id       TEXT NOT NULL REFERENCES motivos_extras(id),
    ausente_id      TEXT REFERENCES colaboradores(id), -- para substituição
    status          "StatusExtra" NOT NULL DEFAULT 'PENDENTE',
    observacao      TEXT,
    aprovado_por    TEXT REFERENCES usuarios(id),
    aprovado_em     TIMESTAMPTZ,
    just_reprovacao TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE extras IS 'RF-062 - Lançamento de extras; RF-063 valida falta prévia para substituição';

CREATE TABLE evidencias_extras (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    extra_id     TEXT NOT NULL REFERENCES extras(id),
    tipo         VARCHAR(100) NOT NULL,
    data_hora    TIMESTAMPTZ NOT NULL,
    descricao    TEXT,
    arquivo_url  TEXT,
    enviado_por  TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE evidencias_extras IS 'RF-065 - Upload estruturado de evidências para aprovação';

-- ============================================================
-- RF-070 | FALTAS
-- ============================================================

CREATE TABLE faltas (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    colaborador_id   TEXT NOT NULL REFERENCES colaboradores(id),
    competencia_id   TEXT NOT NULL REFERENCES competencias(id),
    data             DATE NOT NULL,
    posto_id         TEXT NOT NULL REFERENCES postos_trabalho(id),
    turno_id         TEXT NOT NULL REFERENCES turnos(id),
    tipo             "TipoFalta" NOT NULL,
    substituto_id    TEXT REFERENCES colaboradores(id),
    coberto          BOOLEAN NOT NULL DEFAULT FALSE,
    cancelado        BOOLEAN NOT NULL DEFAULT FALSE,
    just_cancelamento TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE faltas IS 'RF-070 - Lançamento de faltas; suspende benefícios (RF-056)';

-- ============================================================
-- RF-080 | FERIADOS POR LOCALIDADE
-- ============================================================

CREATE TABLE feriados_localidades (
    id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    data       DATE NOT NULL,
    nome       VARCHAR(150) NOT NULL,
    tipo       "TipoFeriado" NOT NULL,
    uf         CHAR(2),
    cidade     VARCHAR(100),
    posto_id   TEXT REFERENCES postos_trabalho(id),
    ativo      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE feriados_localidades IS 'RF-080 - Feriados cadastráveis por cidade/UF/posto';

-- ============================================================
-- RF-081 | FERIADOS TRABALHADOS
-- ============================================================

CREATE TABLE feriados_trabalhados (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    colaborador_id  TEXT NOT NULL REFERENCES colaboradores(id),
    competencia_id  TEXT NOT NULL REFERENCES competencias(id),
    data            DATE NOT NULL,
    posto_id        TEXT NOT NULL REFERENCES postos_trabalho(id),
    turno_id        TEXT NOT NULL REFERENCES turnos(id),
    observacao      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE feriados_trabalhados IS 'RF-081 - Registro de feriados trabalhados (sem aprovação)';

-- ============================================================
-- RF-090 | OCORRÊNCIAS/ADVERTÊNCIAS
-- ============================================================

CREATE TABLE ocorrencias (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    colaborador_id   TEXT NOT NULL REFERENCES colaboradores(id),
    posto_id         TEXT REFERENCES postos_trabalho(id),
    data             DATE NOT NULL,
    descricao        TEXT NOT NULL,
    arquivo_url      TEXT,
    cancelado        BOOLEAN NOT NULL DEFAULT FALSE,
    just_cancelamento TEXT,
    cancelado_por    TEXT REFERENCES usuarios(id),
    cancelado_em     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ocorrencias IS 'RF-090 - Ocorrências/advertências; exclusão exige capacidade crítica';

-- ============================================================
-- RF-091 | RECIBOS/COMPROVANTES
-- ============================================================

CREATE TABLE recibos (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    tipo             VARCHAR(100) NOT NULL,
    referencia_id    TEXT NOT NULL,
    referencia_tipo  VARCHAR(50) NOT NULL, -- 'extra', 'falta', etc.
    gerado_por       TEXT NOT NULL REFERENCES usuarios(id),
    arquivo_url      TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RF-120 | AUDITORIA IMUTÁVEL
-- ============================================================

CREATE TABLE auditoria_logs (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id   TEXT REFERENCES usuarios(id),
    tipo         "TipoAuditoria" NOT NULL,
    entidade     VARCHAR(100) NOT NULL,
    entidade_id  TEXT,
    descricao    TEXT NOT NULL,
    dados_antes  JSONB,
    dados_depois JSONB,
    ip           VARCHAR(50),
    user_agent   TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE auditoria_logs IS 'RF-120 - Auditoria imutável; acesso restrito à Controladoria/TI';

-- Imutabilidade: impedir UPDATE e DELETE na tabela de auditoria
CREATE RULE auditoria_no_update AS ON UPDATE TO auditoria_logs DO INSTEAD NOTHING;
CREATE RULE auditoria_no_delete AS ON DELETE TO auditoria_logs DO INSTEAD NOTHING;

-- ============================================================
-- RF-110 | EXPORTAÇÕES (com auditoria)
-- ============================================================

CREATE TABLE exportacao_logs (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    usuario_id  TEXT NOT NULL REFERENCES usuarios(id),
    relatorio   "TipoRelatorio" NOT NULL,
    formato     "FormatoExportacao" NOT NULL,
    filtros     JSONB,
    arquivo_url TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'SUCESSO',
    erro        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE exportacao_logs IS 'RF-110/RPT-023 - Auditoria de exportações';

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================

-- Colaboradores
CREATE INDEX idx_colaboradores_prestadora ON colaboradores(prestadora_id);
CREATE INDEX idx_colaboradores_status ON colaboradores(status);
CREATE INDEX idx_colaboradores_cpf ON colaboradores(cpf);

-- Alocações
CREATE INDEX idx_alocacoes_colaborador ON alocacoes(colaborador_id);
CREATE INDEX idx_alocacoes_posto ON alocacoes(posto_id);
CREATE INDEX idx_alocacoes_status ON alocacoes(status);
CREATE INDEX idx_alocacoes_datas ON alocacoes(data_inicio, data_fim);

-- Extras
CREATE INDEX idx_extras_colaborador ON extras(colaborador_id);
CREATE INDEX idx_extras_competencia ON extras(competencia_id);
CREATE INDEX idx_extras_status ON extras(status);
CREATE INDEX idx_extras_data ON extras(data);

-- Faltas
CREATE INDEX idx_faltas_colaborador ON faltas(colaborador_id);
CREATE INDEX idx_faltas_competencia ON faltas(competencia_id);
CREATE INDEX idx_faltas_data ON faltas(data);

-- Calendário
CREATE INDEX idx_calendario_colaborador ON calendario_colaboradores(colaborador_id);
CREATE INDEX idx_calendario_competencia ON calendario_colaboradores(competencia_id);
CREATE INDEX idx_calendario_data ON calendario_colaboradores(data);

-- Auditoria
CREATE INDEX idx_auditoria_usuario ON auditoria_logs(usuario_id);
CREATE INDEX idx_auditoria_entidade ON auditoria_logs(entidade, entidade_id);
CREATE INDEX idx_auditoria_created ON auditoria_logs(created_at DESC);

-- Feriados
CREATE INDEX idx_feriados_data ON feriados_localidades(data);
CREATE INDEX idx_feriados_uf ON feriados_localidades(uf);
CREATE INDEX idx_feriados_cidade ON feriados_localidades(cidade);

-- Benefícios
CREATE INDEX idx_valores_beneficios_vigencia ON valores_beneficios(vigencia_inicio, vigencia_fim);
CREATE INDEX idx_valores_extras_vigencia ON valores_extras(vigencia_inicio, vigencia_fim);

-- ============================================================
-- FUNCTIONS E TRIGGERS
-- ============================================================

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.columns
             WHERE column_name = 'updated_at'
             AND table_schema = 'public'
    LOOP
        EXECUTE format('
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
        ', t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Validar máximo de 2 alocações ativas por colaborador
CREATE OR REPLACE FUNCTION validar_max_alocacoes()
RETURNS TRIGGER AS $$
DECLARE
    total_ativas INT;
BEGIN
    IF NEW.status = 'ATIVA' THEN
        SELECT COUNT(*) INTO total_ativas
        FROM alocacoes
        WHERE colaborador_id = NEW.colaborador_id
          AND status = 'ATIVA'
          AND id != COALESCE(NEW.id, '');

        IF total_ativas >= 2 THEN
            RAISE EXCEPTION 'Colaborador já possui 2 alocações ativas. Máximo permitido: 2.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_max_alocacoes
    BEFORE INSERT OR UPDATE ON alocacoes
    FOR EACH ROW EXECUTE FUNCTION validar_max_alocacoes();

-- Function: Validar vagas disponíveis antes de alocar
CREATE OR REPLACE FUNCTION validar_vaga_disponivel()
RETURNS TRIGGER AS $$
DECLARE
    total_vagas INT;
    ocupadas    INT;
BEGIN
    IF NEW.status = 'ATIVA' THEN
        SELECT quantidade INTO total_vagas
        FROM vagas_postos
        WHERE posto_id = NEW.posto_id AND funcao_id = NEW.funcao_id;

        IF total_vagas IS NULL THEN
            RAISE EXCEPTION 'Não há vagas cadastradas para este posto/função.';
        END IF;

        SELECT COUNT(*) INTO ocupadas
        FROM alocacoes
        WHERE posto_id = NEW.posto_id
          AND funcao_id = NEW.funcao_id
          AND status = 'ATIVA'
          AND id != COALESCE(NEW.id, '');

        IF ocupadas >= total_vagas THEN
            RAISE EXCEPTION 'Não há vagas disponíveis para este posto/função. Ocupadas: %, Total: %', ocupadas, total_vagas;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vaga_disponivel
    BEFORE INSERT OR UPDATE ON alocacoes
    FOR EACH ROW EXECUTE FUNCTION validar_vaga_disponivel();

-- Function: Extra de substituição exige falta (RF-063)
CREATE OR REPLACE FUNCTION validar_extra_substituicao()
RETURNS TRIGGER AS $$
DECLARE
    motivo_sub BOOLEAN;
    falta_existe BOOLEAN;
BEGIN
    SELECT eh_substituicao INTO motivo_sub
    FROM motivos_extras WHERE id = NEW.motivo_id;

    IF motivo_sub THEN
        IF NEW.ausente_id IS NULL THEN
            RAISE EXCEPTION 'Extra de substituição exige informar o colaborador ausente.';
        END IF;

        SELECT EXISTS (
            SELECT 1 FROM faltas
            WHERE colaborador_id = NEW.ausente_id
              AND data = NEW.data
              AND turno_id = NEW.turno_id
              AND cancelado = FALSE
        ) INTO falta_existe;

        IF NOT falta_existe THEN
            RAISE EXCEPTION 'Extra de substituição exige falta registrada para o colaborador ausente na mesma data/turno.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_extra_substituicao
    BEFORE INSERT OR UPDATE ON extras
    FOR EACH ROW EXECUTE FUNCTION validar_extra_substituicao();

-- Function: Bloquear lançamentos em competência fechada
CREATE OR REPLACE FUNCTION validar_competencia_aberta(p_competencia_id TEXT)
RETURNS VOID AS $$
DECLARE
    comp_status "StatusCompetencia";
BEGIN
    SELECT status INTO comp_status
    FROM competencias WHERE id = p_competencia_id;

    IF comp_status != 'ABERTA' THEN
        RAISE EXCEPTION 'Competência fechada. Lançamentos não permitidos.';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Aplicar em extras
CREATE OR REPLACE FUNCTION trg_fn_extras_competencia()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM validar_competencia_aberta(NEW.competencia_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_extras_competencia_aberta
    BEFORE INSERT ON extras
    FOR EACH ROW EXECUTE FUNCTION trg_fn_extras_competencia();

-- Aplicar em faltas
CREATE OR REPLACE FUNCTION trg_fn_faltas_competencia()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM validar_competencia_aberta(NEW.competencia_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_faltas_competencia_aberta
    BEFORE INSERT ON faltas
    FOR EACH ROW EXECUTE FUNCTION trg_fn_faltas_competencia();

-- Function: Vigências não sobrepostas para valores de benefícios
CREATE OR REPLACE FUNCTION validar_vigencia_beneficio()
RETURNS TRIGGER AS $$
DECLARE
    sobreposicao INT;
BEGIN
    SELECT COUNT(*) INTO sobreposicao
    FROM valores_beneficios
    WHERE tipo_id = NEW.tipo_id
      AND COALESCE(prestadora_id, '') = COALESCE(NEW.prestadora_id, '')
      AND id != COALESCE(NEW.id, '')
      AND (
          (NEW.vigencia_fim IS NULL AND vigencia_fim IS NULL)
          OR (NEW.vigencia_inicio <= COALESCE(vigencia_fim, '9999-12-31'::date)
              AND COALESCE(NEW.vigencia_fim, '9999-12-31'::date) >= vigencia_inicio)
      );

    IF sobreposicao > 0 THEN
        RAISE EXCEPTION 'Existe sobreposição de vigência para este benefício/prestadora.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vigencia_beneficio
    BEFORE INSERT OR UPDATE ON valores_beneficios
    FOR EACH ROW EXECUTE FUNCTION validar_vigencia_beneficio();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) para Supabase
-- ============================================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exportacao_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;

-- Policy: usuários só veem seus próprios dados (autenticação via Supabase Auth)
-- A lógica de RBAC é implementada na API Next.js; RLS é camada adicional de segurança.

-- Policy básica: service_role tem acesso total (usado pela API)
CREATE POLICY "service_role_full_access" ON usuarios
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_full_access" ON auditoria_logs
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "service_role_full_access" ON colaboradores
    FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ============================================================
-- VIEW: Quadro de Alocação Atual (RPT-001)
-- ============================================================

CREATE OR REPLACE VIEW vw_rpt_001_alocacao_atual AS
SELECT
    p.nome_fantasia AS prestadora,
    t.razao_social  AS tomador,
    pt.identificador AS posto,
    f.nome          AS funcao,
    tu.nome         AS turno,
    c.matricula,
    c.nome          AS colaborador,
    c.status        AS status_colaborador,
    a.data_inicio,
    a.data_fim,
    a.status        AS status_alocacao
FROM alocacoes a
JOIN colaboradores c ON c.id = a.colaborador_id
JOIN prestadoras p ON p.id = c.prestadora_id
JOIN postos_trabalho pt ON pt.id = a.posto_id
JOIN tomadores t ON t.id = pt.tomador_id
JOIN funcoes f ON f.id = a.funcao_id
JOIN turnos tu ON tu.id = a.turno_id
WHERE a.status = 'ATIVA';

-- ============================================================
-- VIEW: Mapa de Vagas (RPT-002)
-- ============================================================

CREATE OR REPLACE VIEW vw_rpt_002_vagas AS
SELECT
    t.razao_social  AS tomador,
    pt.identificador AS posto,
    f.nome          AS funcao,
    vp.quantidade   AS total_vagas,
    COUNT(a.id)     AS ocupadas,
    vp.quantidade - COUNT(a.id) AS disponiveis
FROM vagas_postos vp
JOIN postos_trabalho pt ON pt.id = vp.posto_id
JOIN tomadores t ON t.id = pt.tomador_id
JOIN funcoes f ON f.id = vp.funcao_id
LEFT JOIN alocacoes a ON a.posto_id = vp.posto_id
    AND a.funcao_id = vp.funcao_id
    AND a.status = 'ATIVA'
GROUP BY t.razao_social, pt.identificador, f.nome, vp.quantidade;

-- ============================================================
-- VIEW: Pendências de Aprovação (RPT-021)
-- ============================================================

CREATE OR REPLACE VIEW vw_rpt_021_pendencias AS
SELECT
    e.id,
    c.nome          AS colaborador,
    pt.identificador AS posto,
    tu.nome         AS turno,
    me.nome         AS motivo,
    me.categoria,
    e.data,
    e.status,
    e.created_at    AS lancado_em
FROM extras e
JOIN colaboradores c ON c.id = e.colaborador_id
JOIN postos_trabalho pt ON pt.id = e.posto_id
JOIN turnos tu ON tu.id = e.turno_id
JOIN motivos_extras me ON me.id = e.motivo_id
WHERE e.status = 'PENDENTE';

-- ============================================================
-- GRANTS (para o role anon e authenticated do Supabase)
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON vw_rpt_001_alocacao_atual TO authenticated;
GRANT SELECT ON vw_rpt_002_vagas TO authenticated;
GRANT SELECT ON vw_rpt_021_pendencias TO authenticated;
