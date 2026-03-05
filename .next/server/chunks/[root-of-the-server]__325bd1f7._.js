module.exports = [
"[project]/.next-internal/server/app/api/colaboradores/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/prisma.ts
__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        'query',
        'error',
        'warn'
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/auth/rbac.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/auth/rbac.ts
__turbopack_context__.s([
    "PERMISSOES_PADRAO",
    ()=>PERMISSOES_PADRAO,
    "requireCapacidade",
    ()=>requireCapacidade,
    "requirePermissao",
    ()=>requirePermissao,
    "verificarCapacidade",
    ()=>verificarCapacidade,
    "verificarPermissao",
    ()=>verificarPermissao
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
const PERMISSOES_PADRAO = {
    TI_ADMIN: {
        '*': [
            'V',
            'C',
            'E',
            'D',
            'L',
            'A',
            'P',
            'X',
            'AU'
        ]
    },
    OPERACAO: {
        faltas: [
            'V',
            'L',
            'E'
        ],
        extras: [
            'V',
            'L',
            'E'
        ],
        feriados_trab: [
            'V',
            'L',
            'E'
        ],
        colaboradores: [
            'V',
            'C',
            'E'
        ],
        postos_vagas: [
            'V',
            'C',
            'E'
        ],
        beneficios: [
            'V'
        ],
        escalas: [
            'V',
            'C',
            'E'
        ],
        turnos: [
            'V',
            'C',
            'E'
        ],
        competencias: [
            'V',
            'E'
        ],
        ocorrencias: [
            'V',
            'L',
            'E'
        ],
        recibos: [
            'V',
            'C'
        ]
    },
    RH: {
        candidatos: [
            'V',
            'C',
            'E'
        ],
        colaboradores: [
            'V',
            'C',
            'E'
        ],
        beneficios: [
            'V',
            'C',
            'E'
        ],
        asos: [
            'V',
            'C',
            'E'
        ],
        funcoes: [
            'V',
            'C',
            'E'
        ],
        alocacoes: [
            'C',
            'E'
        ]
    },
    FINANCEIRO: {
        colaboradores: [
            'V',
            'X'
        ],
        beneficios: [
            'V',
            'X'
        ],
        extras: [
            'V',
            'X'
        ],
        faltas: [
            'V',
            'X'
        ],
        feriados_trab: [
            'V',
            'X'
        ],
        recibos: [
            'V',
            'X'
        ]
    },
    CONTROLADORIA: {
        colaboradores: [
            'V',
            'X',
            'AU'
        ],
        beneficios: [
            'V',
            'X',
            'AU'
        ],
        extras: [
            'V',
            'X',
            'AU'
        ],
        faltas: [
            'V',
            'X',
            'AU'
        ],
        feriados_trab: [
            'V',
            'X',
            'AU'
        ],
        recibos: [
            'V',
            'X',
            'AU'
        ],
        auditoria: [
            'V',
            'AU'
        ],
        exportacoes: [
            'V',
            'X',
            'AU'
        ]
    },
    SUPERVISOR_EXTERNO: {
        faltas: [
            'V',
            'L',
            'E'
        ],
        extras: [
            'V',
            'L',
            'E'
        ],
        feriados_trab: [
            'V',
            'L',
            'E'
        ]
    }
};
async function verificarPermissao(usuarioId, modulo, acao) {
    const usuario = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].usuario.findUnique({
        where: {
            id: usuarioId,
            status: 'ATIVO'
        },
        select: {
            setor: true
        }
    });
    if (!usuario) return false;
    const permissoes = PERMISSOES_PADRAO[usuario.setor];
    // TI_ADMIN tem acesso total
    if (permissoes['*']) return true;
    const acoesMod = permissoes[modulo] ?? [];
    return acoesMod.includes(acao);
}
async function verificarCapacidade(usuarioId, capacidade) {
    const cap = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].capacidadeUsuario.findFirst({
        where: {
            usuarioId,
            capacidade,
            ativo: true,
            OR: [
                {
                    validadeAte: null
                },
                {
                    validadeAte: {
                        gte: new Date()
                    }
                }
            ]
        }
    });
    return !!cap;
}
async function requirePermissao(usuarioId, modulo, acao) {
    const ok = await verificarPermissao(usuarioId, modulo, acao);
    if (!ok) {
        throw new Error(`Acesso negado: ${acao} em ${modulo}`);
    }
}
async function requireCapacidade(usuarioId, capacidade) {
    const ok = await verificarCapacidade(usuarioId, capacidade);
    if (!ok) {
        throw new Error(`Capacidade crítica requerida: ${capacidade}`);
    }
}
}),
"[project]/src/lib/audit.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/audit.ts
__turbopack_context__.s([
    "registrarAuditoria",
    ()=>registrarAuditoria,
    "registrarExportacao",
    ()=>registrarExportacao
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
async function registrarAuditoria(params) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].auditoriaLog.create({
            data: {
                usuarioId: params.usuarioId,
                tipo: params.tipo,
                entidade: params.entidade,
                entidadeId: params.entidadeId,
                descricao: params.descricao,
                dadosAntes: params.dadosAntes ? JSON.parse(JSON.stringify(params.dadosAntes)) : undefined,
                dadosDepois: params.dadosDepois ? JSON.parse(JSON.stringify(params.dadosDepois)) : undefined,
                ip: params.ip,
                userAgent: params.userAgent
            }
        });
    } catch (error) {
        // Auditoria nunca deve quebrar o fluxo principal
        console.error('[AUDIT ERROR]', error);
    }
}
async function registrarExportacao(params) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].exportacaoLog.create({
        data: {
            usuarioId: params.usuarioId,
            relatorio: params.relatorio,
            formato: params.formato,
            filtros: params.filtros ? JSON.parse(JSON.stringify(params.filtros)) : undefined,
            arquivoUrl: params.arquivoUrl,
            status: params.status ?? 'SUCESSO',
            erro: params.erro
        }
    });
}
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[project]/src/lib/auth/session.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/lib/auth/session.ts
__turbopack_context__.s([
    "getUsuarioFromRequest",
    ()=>getUsuarioFromRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$node$2f$esm$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/jose/dist/node/esm/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
;
;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
async function getUsuarioFromRequest(req) {
    const token = req.cookies.get('sgo_token')?.value ?? req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Não autenticado');
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$jose$2f$dist$2f$node$2f$esm$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, JWT_SECRET);
        const usuarioId = payload.sub;
        const usuario = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].usuario.findUnique({
            where: {
                id: usuarioId,
                status: 'ATIVO'
            },
            select: {
                id: true,
                nome: true,
                email: true,
                setor: true,
                login: true
            }
        });
        if (!usuario) throw new Error('Usuário não encontrado ou inativo');
        return usuario;
    } catch (err) {
        throw new Error('Token inválido ou expirado');
    }
}
}),
"[project]/src/app/api/colaboradores/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/app/api/colaboradores/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prisma.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/rbac.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audit.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/session.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const ColaboradorSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    prestadoraId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Prestadora obrigatória'),
    matricula: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Matrícula obrigatória').max(20),
    cpf: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(11).max(14).transform((v)=>v.replace(/\D/g, '')),
    nome: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(2, 'Mínimo 2 caracteres').max(120),
    dataNasc: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((v)=>v || null),
    telefone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().max(20).optional().nullable().transform((v)=>v || null),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((v)=>v || null),
    dataAdmissao: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1, 'Data de admissão obrigatória'),
    funcaoId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((v)=>v || null),
    escalaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((v)=>v || null),
    tipoPix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((v)=>v || null),
    chavePix: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((v)=>v || null),
    banco: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((v)=>v || null),
    agencia: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((v)=>v || null),
    contaBancaria: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().nullable().transform((v)=>v || null)
});
async function GET(req) {
    try {
        const usuario = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsuarioFromRequest"])(req);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermissao"])(usuario.id, 'colaboradores', 'V');
        const { searchParams } = new URL(req.url);
        const prestadoraId = searchParams.get('prestadoraId');
        const status = searchParams.get('status');
        const nome = searchParams.get('nome');
        const page = parseInt(searchParams.get('page') ?? '1');
        const limit = parseInt(searchParams.get('limit') ?? '20');
        const where = {};
        if (prestadoraId) where.prestadoraId = prestadoraId;
        if (status) where.status = status;
        if (nome) where.nome = {
            contains: nome,
            mode: 'insensitive'
        };
        // Supervisor externo: filtrar por escopo
        if (usuario.setor === 'SUPERVISOR_EXTERNO') {
            const escopo = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].escopoSupervisor.findUnique({
                where: {
                    usuarioId: usuario.id
                },
                include: {
                    itens: true
                }
            });
            const tomadorIds = escopo?.itens.map((i)=>i.tomadorId) ?? [];
            const postos = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].postoTrabalho.findMany({
                where: {
                    tomadorId: {
                        in: tomadorIds
                    }
                },
                select: {
                    id: true
                }
            });
            const postoIds = postos.map((p)=>p.id);
            where.alocacoes = {
                some: {
                    postoId: {
                        in: postoIds
                    },
                    status: 'ATIVA'
                }
            };
        }
        const [data, total] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].colaborador.findMany({
                where,
                include: {
                    prestadora: {
                        select: {
                            nomeFantasia: true,
                            cnpj: true
                        }
                    },
                    funcao: {
                        select: {
                            nome: true
                        }
                    },
                    escala: {
                        select: {
                            nome: true
                        }
                    },
                    alocacoes: {
                        where: {
                            status: 'ATIVA'
                        },
                        include: {
                            posto: {
                                select: {
                                    identificador: true
                                }
                            },
                            turno: {
                                select: {
                                    nome: true
                                }
                            },
                            funcao: {
                                select: {
                                    nome: true
                                }
                            }
                        }
                    }
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    nome: 'asc'
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].colaborador.count({
                where
            })
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data,
            total,
            page,
            limit
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 403
        });
    }
}
async function POST(req) {
    try {
        const usuario = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$session$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUsuarioFromRequest"])(req);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$rbac$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["requirePermissao"])(usuario.id, 'colaboradores', 'C');
        const body = await req.json();
        const parsed = ColaboradorSchema.parse(body);
        // Verificar duplicidade de CPF
        const cpfExiste = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].colaborador.findUnique({
            where: {
                cpf: parsed.cpf
            }
        });
        if (cpfExiste) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'CPF já cadastrado no sistema.'
            }, {
                status: 409
            });
        }
        // Verificar duplicidade de matrícula na prestadora
        const matExiste = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].colaborador.findUnique({
            where: {
                prestadoraId_matricula: {
                    prestadoraId: parsed.prestadoraId,
                    matricula: parsed.matricula
                }
            }
        });
        if (matExiste) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Matrícula já existe nesta prestadora.'
            }, {
                status: 409
            });
        }
        const colaborador = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].colaborador.create({
            data: {
                ...parsed,
                dataNasc: parsed.dataNasc ? new Date(parsed.dataNasc) : undefined,
                dataAdmissao: new Date(parsed.dataAdmissao)
            }
        });
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audit$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["registrarAuditoria"])({
            usuarioId: usuario.id,
            tipo: 'CREATE',
            entidade: 'colaboradores',
            entidadeId: colaborador.id,
            descricao: `Colaborador ${colaborador.nome} (${colaborador.cpf}) cadastrado`,
            dadosDepois: colaborador,
            ip: req.headers.get('x-forwarded-for') ?? undefined
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(colaborador, {
            status: 201
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: error.errors
            }, {
                status: 400
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__325bd1f7._.js.map