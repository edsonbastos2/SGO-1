// src/lib/auth/session.ts
import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface UsuarioSession {
  id:     string
  nome:   string
  email:  string
  setor:  string
  login:  string
}

export async function getUsuarioFromRequest(req: NextRequest): Promise<UsuarioSession> {
  const token =
    req.cookies.get('sgo_token')?.value ??
    req.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) throw new Error('Não autenticado')

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const usuarioId = payload.sub as string

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId, status: 'ATIVO' },
      select: { id: true, nome: true, email: true, setor: true, login: true },
    })

    if (!usuario) throw new Error('Usuário não encontrado ou inativo')

    return usuario as UsuarioSession
  } catch (err: any) {
    throw new Error('Token inválido ou expirado')
  }
}
