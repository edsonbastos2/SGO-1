'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { LoginRequest, LoginResponse } from '@/types/auth'

interface AuthState {
  loading:  boolean
  error:    string | null
}

export function useAuth() {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({ loading: false, error: null })

  const login = useCallback(async (credentials: LoginRequest) => {
    setState({ loading: true, error: null })

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(credentials),
      })

      const data = await res.json()

      if (!res.ok) {
        setState({ loading: false, error: data.error ?? 'Erro ao autenticar.' })
        return null
      }

      const resp = data as LoginResponse

      // Salva dados do usuário no sessionStorage para uso no client
      sessionStorage.setItem('sgo_usuario', JSON.stringify(resp.usuario))

      // Redireciona: primeiro acesso vai para troca de senha
      if (resp.usuario.primeiroAcesso) {
        router.push('/primeiro-acesso')
      } else {
        router.push('/dashboard')
      }

      return resp
    } catch {
      setState({ loading: false, error: 'Falha de conexão. Tente novamente.' })
      return null
    }
  }, [router])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    sessionStorage.removeItem('sgo_usuario')
    router.push('/login')
  }, [router])

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }))
  }, [])

  return { ...state, login, logout, clearError }
}
