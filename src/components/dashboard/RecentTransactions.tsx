'use client'

import { formatCurrency, formatDate } from '@/lib/constants'
import type { Transaction } from '@/types/database'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Ultimas Transacoes</h3>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-sm text-primary-light hover:text-primary transition-colors"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="text-text-muted text-center py-8">
          Nenhuma transacao registrada ainda
        </p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {tx.category?.icon ?? '📦'}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {tx.description || tx.category?.name || 'Sem descricao'}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatDate(tx.date)}
                    {tx.member?.nickname && ` • ${tx.member.nickname}`}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  tx.type === 'income' ? 'text-success' : 'text-danger'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}
                {formatCurrency(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
