import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registrarAuditoria } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { z } from 'zod'

const MAX_TENTATIVAS = 5

const LoginSchema = z.object({
  login: z.string().min(1, 'Login obrigatório'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

export async function POST(req: NextRequest) {
  const ip        = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const userAgent = req.headers.get('user-agent') ?? undefined

  try {
    const body   = await req.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { login, senha } = parsed.data

    const usuario = await prisma.usuario.findFirst({
      where: { OR: [{ login }, { email: login }] },
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Login ou senha incorretos.' }, { status: 401 })
    }

    if (usuario.status === 'BLOQUEADO') {
      await registrarAuditoria({
        usuarioId: usuario.id, tipo: 'BLOCK', entidade: 'usuarios',
        entidadeId: usuario.id, descricao: 'Tentativa de login em conta bloqueada', ip, userAgent,
      })
      return NextResponse.json(
        { error: 'Conta bloqueada. Entre em contato com o administrador.' },
        { status: 403 }
      )
    }

    if (usuario.status === 'INATIVO') {
      return NextResponse.json(
        { error: 'Conta inativa. Entre em contato com o administrador.' },
        { status: 403 }
      )
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash)

    if (!senhaCorreta) {
      const novasTentativas = usuario.tentativasLogin + 1
      const bloquear        = novasTentativas >= MAX_TENTATIVAS

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { tentativasLogin: novasTentativas, status: bloquear ? 'BLOQUEADO' : undefined },
      })

      await registrarAuditoria({
        usuarioId: usuario.id, tipo: 'LOGIN', entidade: 'usuarios',
        entidadeId: usuario.id,
        descricao: `Login falhou (${novasTentativas}/${MAX_TENTATIVAS})${bloquear ? ' — bloqueado' : ''}`,
        ip, userAgent,
      })

      if (bloquear) {
        return NextResponse.json(
          { error: `Conta bloqueada após ${MAX_TENTATIVAS} tentativas. Contate o administrador.` },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: `Login ou senha incorretos. ${MAX_TENTATIVAS - novasTentativas} tentativa(s) restante(s).` },
        { status: 401 }
      )
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { tentativasLogin: 0, ultimoAcesso: new Date() },
    })

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
    const token  = await new SignJWT({ sub: usuario.id, nome: usuario.nome, setor: usuario.setor })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRES_IN ?? '8h')
      .sign(secret)

    await registrarAuditoria({
      usuarioId: usuario.id, tipo: 'LOGIN', entidade: 'usuarios',
      entidadeId: usuario.id, descricao: 'Login realizado com sucesso', ip, userAgent,
    })

    const response = NextResponse.json({
      token,
      usuario: {
        id: usuario.id, nome: usuario.nome, email: usuario.email,
        login: usuario.login, setor: usuario.setor, primeiroAcesso: usuario.primeiroAcesso,
      },
    })

    response.cookies.set('sgo_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 8,
      path:     '/',
    })

    return response
  } catch (error) {
    console.error('[LOGIN ERROR]', error)
    return NextResponse.json({ error: 'Erro interno. Tente novamente.' }, { status: 500 })
  }
}
