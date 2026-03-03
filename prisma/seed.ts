import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...\n')

  // ─── Prestadora base ───────────────────────────────────────────
  const prestadora = await prisma.prestadora.upsert({
    where:  { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      cnpj:        '00.000.000/0001-00',
      razaoSocial: 'Empresa Demo Ltda',
      nomeFantasia: 'Demo',
      cidade:      'São Paulo',
      uf:          'SP',
      ativo:       true,
    },
  })
  console.log(`✅ Prestadora: ${prestadora.nomeFantasia} (${prestadora.cnpj})`)

  // ─── Usuários de teste ─────────────────────────────────────────
  const usuarios = [
    {
      nome:   'Administrador TI',
      login:  'admin',
      email:  'admin@demo.com',
      senha:  'Admin@123',
      setor:  'TI_ADMIN' as const,
    },
    {
      nome:   'Gestor Operação',
      login:  'operacao',
      email:  'operacao@demo.com',
      senha:  'Operacao@123',
      setor:  'OPERACAO' as const,
    },
    {
      nome:   'Analista RH',
      login:  'rh',
      email:  'rh@demo.com',
      senha:  'Rh@123456',
      setor:  'RH' as const,
    },
    {
      nome:   'Analista Financeiro',
      login:  'financeiro',
      email:  'financeiro@demo.com',
      senha:  'Financeiro@123',
      setor:  'FINANCEIRO' as const,
    },
    {
      nome:   'Analista Controladoria',
      login:  'controladoria',
      email:  'controladoria@demo.com',
      senha:  'Controladoria@123',
      setor:  'CONTROLADORIA' as const,
    },
    {
      nome:   'Supervisor Externo',
      login:  'supervisor',
      email:  'supervisor@demo.com',
      senha:  'Supervisor@123',
      setor:  'SUPERVISOR_EXTERNO' as const,
    },
  ]

  console.log('\n👤 Criando usuários:')

  for (const u of usuarios) {
    const senhaHash = await bcrypt.hash(u.senha, 12)

    const usuario = await prisma.usuario.upsert({
      where:  { login: u.login },
      update: { senhaHash, status: 'ATIVO', tentativasLogin: 0 },
      create: {
        nome:           u.nome,
        login:          u.login,
        email:          u.email,
        senhaHash,
        setor:          u.setor,
        status:         'ATIVO',
        primeiroAcesso: false, // false para não pedir troca no primeiro acesso de teste
        tentativasLogin: 0,
      },
    })

    // Vincular à prestadora
    await prisma.usuarioPrestadora.upsert({
      where:  { usuarioId_prestadoraId: { usuarioId: usuario.id, prestadoraId: prestadora.id } },
      update: {},
      create: { usuarioId: usuario.id, prestadoraId: prestadora.id },
    })

    console.log(`   ✅ ${u.setor.padEnd(20)} | login: ${u.login.padEnd(15)} | senha: ${u.senha}`)
  }

  // ─── Capacidades críticas para o admin ────────────────────────
  const admin = await prisma.usuario.findUnique({ where: { login: 'admin' } })
  const oper  = await prisma.usuario.findUnique({ where: { login: 'operacao' } })

  if (admin && oper) {
    const capacidades: Array<'APROVAR_EXTRAS' | 'PARAMETRIZAR' | 'CANCELAR_EXCLUIR' | 'REABRIR_COMPETENCIA' | 'AJUSTAR_CALENDARIO'> = [
      'APROVAR_EXTRAS',
      'PARAMETRIZAR',
      'CANCELAR_EXCLUIR',
      'REABRIR_COMPETENCIA',
      'AJUSTAR_CALENDARIO',
    ]

    for (const cap of capacidades) {
      const existe = await prisma.capacidadeUsuario.findFirst({
        where: { usuarioId: admin.id, capacidade: cap, ativo: true },
      })
      if (!existe) {
        await prisma.capacidadeUsuario.create({
          data: {
            usuarioId:    admin.id,
            capacidade:   cap,
            gerenteId:    admin.id,
            justificativa: 'Capacidade inicial concedida via seed',
            ativo:        true,
          },
        })
      }
    }

    // Gestor de Operação: apenas APROVAR_EXTRAS
    const existeAprov = await prisma.capacidadeUsuario.findFirst({
      where: { usuarioId: oper.id, capacidade: 'APROVAR_EXTRAS', ativo: true },
    })
    if (!existeAprov) {
      await prisma.capacidadeUsuario.create({
        data: {
          usuarioId:    oper.id,
          capacidade:   'APROVAR_EXTRAS',
          gerenteId:    admin.id,
          justificativa: 'Aprovação de extras concedida via seed',
          ativo:        true,
        },
      })
    }

    console.log('\n🔑 Capacidades críticas atribuídas:')
    console.log('   ✅ admin      → todas as capacidades')
    console.log('   ✅ operacao   → APROVAR_EXTRAS')
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ Seed concluído com sucesso!\n')
  console.log('📋 Resumo de acesso:')
  console.log('   URL:   http://localhost:3000/login')
  console.log('   Login rápido: admin / Admin@123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch(e => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
