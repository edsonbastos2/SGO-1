# SGO — Sistema de Gestão Operacional

> **Versão:** 0.3 | **Stack:** Next.js 15 · Prisma 6 · Supabase · TypeScript · PWA  
> **Status:** Estrutura base gerada a partir do SRS v0.3 (RFs expandidos e mapeados)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Arquitetura de Autenticação e RBAC](#arquitetura-de-autenticação-e-rbac)
- [Módulos e RFs Implementados](#módulos-e-rfs-implementados)
- [API Reference](#api-reference)
- [PWA](#pwa)
- [Relatórios e Exportações](#relatórios-e-exportações)
- [Auditoria](#auditoria)
- [Próximos Passos](#próximos-passos)

---

## Visão Geral

O SGO é um sistema **multiempresa** de gestão operacional para prestadoras de serviços terceirizados. Gerencia colaboradores, alocações, escalas, benefícios (VTD/VA/Saúde/Odonto), extras, faltas, feriados, competências mensais e auditoria imutável.

Características principais do SRS v0.3:

- **Ambiente único multiempresa** — múltiplas prestadoras (CNPJ) em uma única instância
- **Operação desktop e mobile** — web responsiva / PWA
- **Competência mensal** com janela configurável para lançamentos e aprovações
- **RBAC com capacidades críticas** — sem perfil "master"; ações críticas (A, P, D) exigem capacidade atribuída por gerente com justificativa
- **Auditoria imutável** — logs de todas as operações, acesso restrito à Controladoria/TI
- **Supervisor externo** restrito por escopo (tomador + posto + turno)

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router, Server Actions, Turbopack) |
| Linguagem | TypeScript 5.x |
| ORM | Prisma 6 (Client JS) |
| Banco de dados | Supabase (PostgreSQL 15) |
| Auth | JWT (jose) + Supabase SSR |
| Estilo | Tailwind CSS v3 + Radix UI |
| Formulários | React Hook Form + Zod |
| Notificações | Sonner |
| Ícones | Lucide React |
| PWA | next-pwa |
| Exportação | xlsx · jsPDF · docx |
| Datas | date-fns |

---

## Estrutura do Projeto

```
sgo/
├── prisma/
│   ├── schema.prisma              # Schema completo (todos os modelos)
│   └── supabase_migration.sql     # SQL para rodar no Supabase SQL Editor
│
├── src/
│   ├── app/
│   │   ├── api/                   # Route Handlers (API REST)
│   │   │   ├── auth/              # Login, logout, refresh
│   │   │   ├── colaboradores/     # RF-041 CRUD
│   │   │   ├── extras/            # RF-062 lançamento
│   │   │   │   └── aprovar/       # RF-064 aprovação
│   │   │   ├── faltas/            # RF-070
│   │   │   ├── competencias/      # RF-100
│   │   │   ├── beneficios/        # RF-050..056
│   │   │   ├── alocacoes/         # RF-022
│   │   │   ├── postos/            # RF-012
│   │   │   ├── tomadores/         # RF-011
│   │   │   ├── prestadoras/       # RF-010
│   │   │   ├── escalas/           # RF-030
│   │   │   ├── turnos/            # RF-031
│   │   │   ├── feriados/          # RF-080..081
│   │   │   ├── ocorrencias/       # RF-090
│   │   │   ├── relatorios/        # RF-110 + RPT-001..023
│   │   │   └── auditoria/         # RF-120
│   │   │
│   │   ├── (auth)/
│   │   │   └── login/             # Página de login
│   │   │
│   │   └── (dashboard)/
│   │       ├── layout.tsx         # Layout com sidebar responsiva
│   │       ├── page.tsx           # Dashboard principal
│   │       ├── colaboradores/
│   │       ├── extras/
│   │       ├── faltas/
│   │       ├── beneficios/
│   │       ├── competencias/
│   │       ├── relatorios/
│   │       └── admin/
│   │
│   ├── components/
│   │   ├── ui/                    # Componentes base (Button, Input, etc.)
│   │   ├── layout/                # Sidebar, Header, BottomNav (mobile)
│   │   └── modules/               # Componentes específicos por módulo
│   │
│   ├── lib/
│   │   ├── prisma.ts              # Singleton do Prisma Client
│   │   ├── audit.ts               # Helper de auditoria imutável
│   │   ├── auth/
│   │   │   ├── rbac.ts            # RBAC + verificação de capacidades
│   │   │   └── session.ts         # Extração do usuário do JWT
│   │   └── supabase/
│   │       ├── client.ts          # Browser client
│   │       └── server.ts          # Server/service client
│   │
│   ├── hooks/                     # React hooks customizados
│   ├── types/                     # Types TypeScript globais
│   └── middleware.ts              # Proteção de rotas
│
├── public/
│   ├── manifest.json              # PWA manifest
│   └── icons/                     # Ícones PWA (72..512px)
│
├── .env.example                   # Template de variáveis de ambiente
├── next.config.js                 # Config Next.js + PWA
├── package.json
└── tsconfig.json
```

---

## Configuração do Ambiente

### 1. Pré-requisitos

- Node.js 20+
- pnpm (recomendado) ou npm
- Conta no [Supabase](https://supabase.com)

### 2. Clonar e instalar

```bash
git clone <repositório>
cd sgo
pnpm install
```

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha os valores no `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
JWT_SECRET=chave_secreta_minimo_32_chars
```

> As URLs de conexão estão em: Supabase Dashboard → Settings → Database → Connection string

### 4. Banco de dados

**Opção A — Via Supabase SQL Editor (recomendado para setup inicial):**

1. Acesse `https://supabase.com/dashboard/project/SEU_ID/sql`
2. Cole o conteúdo de `prisma/supabase_migration.sql`
3. Execute

**Opção B — Via Prisma Migrate:**

```bash
pnpm db:generate    # Gera o Prisma Client
pnpm db:push        # Sincroniza schema com o banco (dev)
# ou
pnpm db:migrate     # Cria migration versionada
```

### 5. Rodar em desenvolvimento

```bash
pnpm dev
```

Acesse: `http://localhost:3000`

---

## Banco de Dados

### Diagrama de relacionamentos (resumo)

```
prestadoras
  └── usuarios (via usuario_prestadoras)
  └── colaboradores
        └── alocacoes → postos_trabalho → tomadores
        └── extras → motivos_extras
        └── faltas
        └── feriados_trabalhados
        └── calendario_colaboradores → competencias
        └── colaborador_beneficios → tipos_beneficios
              └── beneficio_dependentes
        └── asos
        └── ocorrencias

usuarios
  └── capacidades_usuarios
  └── escopo_supervisores → escopo_supervisor_itens

competencias
  └── extras
  └── faltas
  └── feriados_trabalhados
  └── calendario_colaboradores

auditoria_logs (imutável)
exportacao_logs
```

### Tabelas principais

| Tabela | RF | Descrição |
|--------|-----|-----------|
| `prestadoras` | RF-010 | Empresas prestadoras (CNPJ) |
| `usuarios` | RF-001 | Usuários com setor/perfil |
| `capacidades_usuarios` | RF-003 | Capacidades críticas por usuário |
| `tomadores` | RF-011 | Clientes/tomadores + parâmetros |
| `postos_trabalho` | RF-012 | Postos vinculados ao tomador |
| `funcoes` | RF-020 | Funções para vagas/alocações |
| `vagas_postos` | RF-021 | Qty vagas por posto/função |
| `colaboradores` | RF-041 | Cadastro completo de colaboradores |
| `alocacoes` | RF-022 | Alocação (máx. 2 simultâneas) |
| `escalas` | RF-030 | Escalas e jornadas |
| `turnos` | RF-031 | Turnos/horários |
| `competencias` | RF-100 | Competências mensais |
| `calendario_colaboradores` | RF-032/033 | Calendário gerado por competência |
| `extras` | RF-062 | Lançamentos de extras |
| `faltas` | RF-070 | Lançamentos de faltas |
| `feriados_localidades` | RF-080 | Feriados por cidade/UF |
| `feriados_trabalhados` | RF-081 | Feriados trabalhados |
| `tipos_beneficios` | RF-050 | VTD, VA, Saúde, Odonto |
| `valores_beneficios` | RF-052 | Valores com vigência |
| `auditoria_logs` | RF-120 | Logs imutáveis |
| `exportacao_logs` | RF-110 | Auditoria de exportações (RPT-023) |

### Triggers e constraints de negócio

| Trigger | Regra |
|---------|-------|
| `trg_max_alocacoes` | RF-022: Bloqueia > 2 alocações ativas por colaborador |
| `trg_vaga_disponivel` | RF-021: Bloqueia alocação sem vaga disponível |
| `trg_extra_substituicao` | RF-063: Extra de substituição exige falta do ausente |
| `trg_extras_competencia_aberta` | RF-100: Bloqueia lançamento em competência fechada |
| `trg_faltas_competencia_aberta` | RF-100: Bloqueia lançamento em competência fechada |
| `trg_vigencia_beneficio` | RF-052: Vigências não sobrepostas |
| `auditoria_no_update/delete` | RF-120: Auditoria imutável |

---

## Arquitetura de Autenticação e RBAC

### Fluxo de autenticação (RF-004)

```
1. POST /api/auth/login { login, senha }
2. Verifica usuario ativo + bcrypt(senha)
3. Registra tentativas (bloqueio após N tentativas)
4. Retorna JWT (jose) com payload { sub: userId }
5. Cookie HttpOnly "sgo_token" + registra auditoria LOGIN
```

### RBAC — Matriz de permissões (RF-002)

Cada API route chama `requirePermissao(usuarioId, modulo, acao)` que verifica:

1. Usuário ativo no banco
2. Setor do usuário → `PERMISSOES_PADRAO[setor][modulo]`
3. `TI_ADMIN` tem acesso irrestrito (`*`)
4. `FINANCEIRO` e `CONTROLADORIA` são somente leitura (sem `L`, `C`, `E`)

### Capacidades críticas (RF-003)

Para ações como `APROVAR_EXTRAS`, `REABRIR_COMPETENCIA`, `CANCELAR_EXCLUIR`:

```typescript
await requireCapacidade(usuarioId, 'APROVAR_EXTRAS')
// Verifica tabela capacidades_usuarios (ativo=true, validade não expirada)
```

### Escopo do supervisor externo (RF-024)

Supervisor só acessa dados de `tomador + posto + turno` cadastrados na tabela `escopo_supervisor_itens`.

---

## Módulos e RFs Implementados

### Administração
- `RF-001` Cadastro de usuários
- `RF-002` Perfis e permissões (RBAC)
- `RF-003` Capacidades críticas por usuário
- `RF-004` Autenticação e segurança

### Cadastros Base
- `RF-010` Prestadoras
- `RF-011` Tomadores
- `RF-012` Postos de trabalho
- `RF-020` Funções
- `RF-021` Vagas por posto/função
- `RF-024` Escopo do supervisor externo

### RH e Colaboradores
- `RF-040` Candidatos
- `RF-041` Colaboradores (dados completos + bancários/PIX)
- `RF-042` ASO com alertas de vencimento
- `RF-022` Alocação (até 2 simultâneas)
- `RF-023` Reserva

### Escalas e Calendário
- `RF-030` Escalas
- `RF-031` Turnos/horários
- `RF-032` Geração do calendário por competência
- `RF-033` Ajuste pós-geração (capacidade crítica)

### Benefícios
- `RF-050` Tipos de benefícios
- `RF-051` Fornecedores
- `RF-052` Valores com vigência
- `RF-053` Cálculo VTD
- `RF-054` Cálculo VA
- `RF-055` Saúde e Odontológico (titular + dependentes)
- `RF-056` Faltas suspendem benefícios

### Extras
- `RF-060` Motivos de extras
- `RF-061` Valores com vigência
- `RF-062` Lançamento de extras
- `RF-063` Extra por substituição exige falta
- `RF-064` Aprovação com capacidade crítica
- `RF-065` Evidência de aprovação

### Faltas e Feriados
- `RF-070` Lançamento de faltas
- `RF-080` Feriados por localidade
- `RF-081` Feriados trabalhados

### Outros
- `RF-090` Ocorrências/advertências
- `RF-091` Recibos/comprovantes

### Controle
- `RF-100` Competência mensal com reabertura controlada
- `RF-110` Exportações com auditoria (XLSX, CSV, XLSM, PDF, DOCX)
- `RF-120` Auditoria imutável

---

## API Reference

### Padrão de resposta

```json
// Sucesso (lista)
{ "data": [...], "total": 100, "page": 1, "limit": 20 }

// Sucesso (item)
{ "id": "...", ... }

// Erro
{ "error": "Mensagem de erro" }
```

### Endpoints principais

| Método | Rota | RF | Descrição |
|--------|------|----|-----------|
| POST | `/api/auth/login` | RF-004 | Autenticar |
| POST | `/api/auth/logout` | RF-004 | Deslogar |
| GET | `/api/colaboradores` | RF-041 | Listar colaboradores |
| POST | `/api/colaboradores` | RF-041 | Criar colaborador |
| GET | `/api/colaboradores/:id` | RF-041 | Detalhe |
| PATCH | `/api/colaboradores/:id` | RF-041 | Editar |
| GET | `/api/extras` | RF-062 | Listar extras |
| POST | `/api/extras` | RF-062 | Lançar extra |
| POST | `/api/extras/aprovar` | RF-064 | Aprovar/reprovar |
| GET | `/api/faltas` | RF-070 | Listar faltas |
| POST | `/api/faltas` | RF-070 | Lançar falta |
| GET | `/api/competencias` | RF-100 | Listar competências |
| POST | `/api/competencias` | RF-100 | Criar / Reabrir |
| PATCH | `/api/competencias` | RF-100 | Fechar competência |
| GET | `/api/relatorios/rpt-001` | RPT-001 | Quadro de alocação |
| GET | `/api/relatorios/rpt-011` | RPT-011 | Benefícios devidos |
| GET | `/api/auditoria` | RF-120 | Consultar logs |

### Autenticação

Todas as rotas exigem o cookie `sgo_token` (HttpOnly) ou header `Authorization: Bearer <token>`.

---

## PWA

O sistema é uma **Progressive Web App** totalmente responsiva:

- **Manifest** em `/public/manifest.json` com `display: standalone`
- **Service Worker** via `next-pwa` (cache de assets e chamadas Supabase)
- **Offline** para visualizações já carregadas
- **Instalável** em Android/iOS/Desktop via banner nativo
- **Bottom Navigation** em mobile; **Sidebar** em desktop

---

## Relatórios e Exportações (RF-110)

Todos os 14 relatórios do Catálogo (Anexo D) com filtros mínimos: prestadora, competência, tomador, posto, função, colaborador, turno.

Formatos de exportação: `XLSX`, `CSV`, `XLSM`, `PDF`, `DOCX`

Cada exportação é registrada em `exportacao_logs` (RPT-023).

| RPT | Descrição |
|-----|-----------|
| RPT-001 | Quadro de alocação atual |
| RPT-002 | Mapa de vagas por posto |
| RPT-003 | Escala do período |
| RPT-004 | Faltas por período |
| RPT-005 | Extras por período |
| RPT-006 | Feriados trabalhados |
| RPT-007 | Ocorrências/advertências |
| RPT-010 | Benefícios previstos por escala |
| RPT-011 | Benefícios devidos no período |
| RPT-012 | Benefícios por tomador/posto |
| RPT-020 | Consolidação para pagamento de extras |
| RPT-021 | Pendências de aprovação |
| RPT-022 | Auditoria de lançamentos e aprovações |
| RPT-023 | Auditoria de exportações |

---

## Auditoria (RF-120)

A tabela `auditoria_logs` é **imutável** por rules no PostgreSQL:

```sql
CREATE RULE auditoria_no_update AS ON UPDATE TO auditoria_logs DO INSTEAD NOTHING;
CREATE RULE auditoria_no_delete AS ON DELETE TO auditoria_logs DO INSTEAD NOTHING;
```

Campos: `usuario_id`, `tipo`, `entidade`, `entidade_id`, `descricao`, `dados_antes` (JSONB), `dados_depois` (JSONB), `ip`, `user_agent`, `created_at`.

Acesso: apenas `Controladoria` (ação `AU`) e `TI/Admin`.

---

## Próximos Passos

### MVP (fase 1)
- [ ] Implementar todas as telas do dashboard (Next.js App Router)
- [ ] Componentes de listagem, formulários e modais para cada módulo
- [ ] Motor de cálculo de benefícios (VTD/VA) por competência
- [ ] Geração automática do calendário (RF-032)
- [ ] Exportação XLSX dos 14 relatórios
- [ ] Tela de auditoria para Controladoria

### Pós-MVP (fase 2)
- [ ] Integração Fortes RH
- [ ] Integração TOTVS
- [ ] Notificações push (PWA)
- [ ] Alertas de ASO vencendo
- [ ] Dashboard de indicadores (KPIs operacionais)
- [ ] App mobile nativo (React Native)

---

## Licença

Uso interno. Distribuição controlada.  
© 2026 — Sistema de Gestão Operacional v0.3
