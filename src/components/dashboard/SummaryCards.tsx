'use client'

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'

interface SummaryCardsProps {
  income: number
  expenses: number
}

export default function SummaryCards({ income, expenses }: SummaryCardsProps) {
  const balance = income - expenses

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Receitas */}
      <div className="bg-bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm">Receitas</span>
          <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
        </div>
        <p className="text-2xl font-bold text-success">{formatCurrency(income)}</p>
      </div>

      {/* Despesas */}
      <div className="bg-bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm">Despesas</span>
          <div className="w-9 h-9 rounded-lg bg-danger/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-danger" />
          </div>
        </div>
        <p className="text-2xl font-bold text-danger">{formatCurrency(expenses)}</p>
      </div>

      {/* Saldo */}
      <div className="bg-bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-sm">Saldo</span>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            balance >= 0 ? 'bg-primary/10' : 'bg-danger/10'
          }`}>
            <Wallet className={`w-5 h-5 ${balance >= 0 ? 'text-primary-light' : 'text-danger'}`} />
          </div>
        </div>
        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-primary-light' : 'text-danger'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  )
}
