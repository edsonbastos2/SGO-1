'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Button }  from '@/components/ui/Button'
import { Input }   from '@/components/ui/Input'
import { Alert }   from '@/components/ui/Alert'
import { User, Lock, Activity } from 'lucide-react'

const schema = z.object({
  login: z.string().min(1, 'Informe seu login ou e-mail'),
  senha: z.string().min(1, 'Informe sua senha'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth()
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Animação de partículas no canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Partículas
    const particles = Array.from({ length: 55 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 1.5 + 0.5,
      a:  Math.random() * 0.4 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Linhas entre partículas próximas
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dx   = p.x - q.x
          const dy   = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(59,130,246,${0.06 * (1 - dist / 120)})`
            ctx.lineWidth   = 0.5
            ctx.stroke()
          }
        })
      })

      // Pontos
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59,130,246,${p.a})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    clearError()
    login({ login: data.login, senha: data.senha })
  }

  if (!mounted) return null

  return (
    <div className="relative min-h-screen bg-[#080c14] flex items-center justify-center overflow-hidden">

      {/* Canvas de partículas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Gradiente central suave */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full
                        bg-blue-600/5 blur-[120px]" />
      </div>

      {/* Linha decorativa topo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      {/* Container principal */}
      <div className={`relative z-10 w-full max-w-md px-6 transition-all duration-700 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>

        {/* Header */}
        <div className="mb-10 text-center" style={{ animationDelay: '0ms' }}>
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl
                          bg-blue-600/10 border border-blue-500/20 mb-6
                          shadow-[0_0_40px_rgba(59,130,246,0.15)]">
            <Activity size={24} className="text-blue-400" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-['IBM_Plex_Mono'] text-2xl font-semibold tracking-tight text-white">
              SGO
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-['IBM_Plex_Mono'] font-medium
                            bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
              v0.3
            </span>
          </div>

          <p className="text-[var(--text-muted)] text-sm font-['IBM_Plex_Mono'] tracking-widest uppercase">
            Sistema de Gestão Operacional
          </p>
        </div>

        {/* Card do formulário */}
        <div className="bg-[#0d1420]/80 backdrop-blur-xl border border-[#1a2540]
                        rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5)]
                        overflow-hidden">

          {/* Linha decorativa topo do card */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

          <div className="p-8">
            <h1 className="text-lg font-semibold text-white mb-1">
              Acesso ao sistema
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-7">
              Informe suas credenciais para continuar
            </p>

            {/* Alerta de erro */}
            {error && (
              <div className="mb-5">
                <Alert variant="error" message={error} onClose={clearError} />
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <Input
                label="Login ou E-mail"
                type="text"
                placeholder="seu.login ou email@empresa.com"
                autoComplete="username"
                autoFocus
                prefix={<User size={14} />}
                error={errors.login?.message}
                {...register('login')}
              />

              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                prefix={<Lock size={14} />}
                error={errors.senha?.message}
                {...register('senha')}
              />

              {/* Esqueci a senha */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-[var(--text-muted)] hover:text-blue-400
                             transition-colors duration-150 font-['IBM_Plex_Mono']"
                >
                  Esqueci minha senha
                </button>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="mt-2 font-['IBM_Plex_Mono'] tracking-wide"
              >
                {loading ? 'Autenticando...' : 'Entrar no sistema'}
              </Button>
            </form>
          </div>

          {/* Footer do card */}
          <div className="px-8 py-4 bg-[#080c14]/60 border-t border-[#1a2540]
                          flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="text-[11px] text-[var(--text-muted)] font-['IBM_Plex_Mono']">
                Ambiente de produção
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-['IBM_Plex_Mono']">
              Sessão · 8h
            </span>
          </div>
        </div>

        {/* Aviso de segurança */}
        <p className="mt-6 text-center text-[11px] text-[var(--text-muted)] font-['IBM_Plex_Mono'] leading-relaxed">
          Acesso restrito a usuários autorizados.
          <br />
          Todas as sessões são monitoradas e registradas.
        </p>
      </div>

      {/* Linha decorativa fundo */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </div>
  )
}
