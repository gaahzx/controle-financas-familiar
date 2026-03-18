'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ensureSession } from '@/lib/session'
import { formatCurrency, formatDate } from '@/lib/constants'
import TransactionForm from '@/components/transactions/TransactionForm'
import { Plus, Search, Trash2 } from 'lucide-react'
import type { Transaction, Category, FamilyMember } from '@/types/database'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [currentMemberId, setCurrentMemberId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const loadData = useCallback(async () => {
    const session = await ensureSession()
    if (!session) {
      setLoading(false)
      return
    }

    setFamilyId(session.familyId)
    setCurrentMemberId(session.memberId)

    const [txRes, catRes, memRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, category:categories(*), member:family_members(*)')
        .eq('family_id', session.familyId)
        .order('date', { ascending: false })
        .limit(100),
      supabase
        .from('categories')
        .select('*')
        .eq('family_id', session.familyId)
        .order('name'),
      supabase
        .from('family_members')
        .select('*')
        .eq('family_id', session.familyId),
    ])

    if (txRes.data) setTransactions(txRes.data as Transaction[])
    if (catRes.data) setCategories(catRes.data)
    if (memRes.data) setMembers(memRes.data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Check URL for ?new=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('new') === '1') setShowForm(true)
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta transacao?')) return
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const filtered = transactions.filter((t) => {
    const matchSearch = !search ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !filterCategory || t.category_id === filterCategory
    return matchSearch && matchCategory
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transacoes</h1>
        {familyId && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-5 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Novo</span>
          </button>
        )}
      </div>

      {!familyId ? (
        <p className="text-text-muted text-center py-12">
          Erro ao carregar. Recarregue a pagina.
        </p>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar transacao..."
                className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todas categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction list */}
          <div className="bg-bg-card border border-border rounded-2xl divide-y divide-border">
            {filtered.length === 0 ? (
              <p className="text-text-muted text-center py-12">
                Nenhuma transacao encontrada
              </p>
            ) : (
              filtered.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{tx.category?.icon ?? '📦'}</div>
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
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold ${
                        tx.type === 'income' ? 'text-success' : 'text-danger'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 hover:bg-danger/10 rounded-lg text-text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Transaction form modal */}
      {showForm && familyId && (
        <TransactionForm
          familyId={familyId}
          categories={categories}
          members={members}
          currentMemberId={currentMemberId}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}
