export interface LoginRequest {
  login: string
  senha: string
}

export interface LoginResponse {
  token: string
  usuario: {
    id: string
    nome: string
    email: string
    login: string
    setor: string
    primeiroAcesso: boolean
  }
}

export interface ApiError {
  error: string
  details?: unknown
}

export type Setor =
  | 'TI_ADMIN'
  | 'OPERACAO'
  | 'RH'
  | 'FINANCEIRO'
  | 'CONTROLADORIA'
  | 'SUPERVISOR_EXTERNO'

export const SETOR_LABEL: Record<Setor, string> = {
  TI_ADMIN:           'TI / Administração',
  OPERACAO:           'Operação',
  RH:                 'RH',
  FINANCEIRO:         'Financeiro',
  CONTROLADORIA:      'Controladoria',
  SUPERVISOR_EXTERNO: 'Supervisor Externo',
}
