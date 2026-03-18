'use client'

import { formatCurrency } from '@/lib/constants'
import type { CategorySummary } from '@/types/database'
import { AlertTriangle } from 'lucide-react'

interface BudgetProgressProps {
  categories: CategorySummary[]
}

export default function BudgetProgress({ categories }: BudgetProgressProps) {
  const withBudget = categories.filter((c) => c.budget_limit && c.budget_limit > 0)

  if (withBudget.length === 0) {
    return null
  }

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Orcamento por Categoria</h3>

      <div className="space-y-4">
        {withBudget.map((cat) => {
          const pct = cat.budget_limit ? (cat.total / cat.budget_limit) * 100 : 0
          const isOver = pct >= 100
          const isWarning = pct >= 70 && pct < 100

          return (
            <div key={cat.category_id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span>{cat.category_icon}</span>
                  <span className="text-sm font-medium">{cat.category_name}</span>
                  {isOver && <AlertTriangle className="w-4 h-4 text-danger" />}
                </div>
                <span className="text-sm text-text-secondary">
                  {formatCurrency(cat.total)} / {formatCurrency(cat.budget_limit!)}
                </span>
              </div>
              <div className="w-full h-2 bg-bg-input rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isOver
                      ? 'bg-danger'
                      : isWarning
                      ? 'bg-warning'
                      : 'bg-success'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
