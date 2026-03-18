'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ensureSession } from '@/lib/session'
import SummaryCards from '@/components/dashboard/SummaryCards'
import CategoryChart from '@/components/dashboard/CategoryChart'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import BudgetProgress from '@/components/dashboard/BudgetProgress'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { CategorySummary, Transaction } from '@/types/database'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])

  const supabase = createClient()

  const loadData = useCallback(async () => {
    // Garante sessão anônima + família
    const session = await ensureSession()
    if (!session) {
      setLoading(false)
      return
    }

    setFamilyId(session.familyId)

    // Dates for current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0]

    // Get transactions for current month
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, category:categories(*), member:family_members(*)')
      .eq('family_id', session.familyId)
      .gte('date', startOfMonth)
      .lte('date', endOfMonth)
      .order('date', { ascending: false })

    if (transactions) {
      const inc = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const exp = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      setIncome(inc)
      setExpenses(exp)

      // Group by category for expense chart
      const categoryMap = new Map<string, CategorySummary>()
      transactions
        .filter((t) => t.type === 'expense')
        .forEach((t) => {
          const catId = t.category_id
          const existing = categoryMap.get(catId)
          if (existing) {
            existing.total += Number(t.amount)
          } else {
            categoryMap.set(catId, {
              category_id: catId,
              category_name: t.category?.name ?? 'Outros',
              category_icon: t.category?.icon ?? '📦',
              category_color: t.category?.color ?? '#64748b',
              total: Number(t.amount),
              budget_limit: t.category?.budget_limit ?? null,
              percentage: 0,
            })
          }
        })

      let summary = Array.from(categoryMap.values())
      const totalExpenses = summary.reduce((s, c) => s + c.total, 0)
      summary = summary
        .map((c) => ({
          ...c,
          percentage: totalExpenses > 0 ? (c.total / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total)

      setCategorySummary(summary)
      setRecentTransactions((transactions as Transaction[]).slice(0, 5))
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const now = new Date()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">
            {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          href="/transactions?new=1"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Novo Lancamento</span>
        </Link>
      </div>

      {!familyId ? (
        <div className="bg-bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Erro ao carregar</h2>
          <p className="text-text-secondary">
            Nao foi possivel criar a sessao. Recarregue a pagina.
          </p>
        </div>
      ) : (
        <>
          <SummaryCards income={income} expenses={expenses} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart data={categorySummary} />
            <BudgetProgress categories={categorySummary} />
          </div>

          <RecentTransactions transactions={recentTransactions} />
        </>
      )}
    </div>
  )
}
