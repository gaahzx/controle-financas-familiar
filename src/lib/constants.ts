export const DEFAULT_CATEGORIES = [
  { name: 'Moradia', icon: '🏠', color: '#6366f1' },
  { name: 'Mercado', icon: '🛒', color: '#10b981' },
  { name: 'Saude', icon: '💊', color: '#ef4444' },
  { name: 'Educacao', icon: '🎓', color: '#f59e0b' },
  { name: 'Transporte', icon: '🚗', color: '#3b82f6' },
  { name: 'Lazer', icon: '🎮', color: '#8b5cf6' },
  { name: 'Contas Fixas', icon: '💡', color: '#ec4899' },
  { name: 'Vestuario', icon: '👗', color: '#14b8a6' },
  { name: 'Alimentacao', icon: '🍕', color: '#f97316' },
  { name: 'Salario', icon: '💰', color: '#22c55e' },
  { name: 'Outros', icon: '📦', color: '#64748b' },
] as const

export const CURRENCY_FORMAT = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(value: number): string {
  return CURRENCY_FORMAT.format(value)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}
