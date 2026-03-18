'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'
import type { Category, FamilyMember, TransactionType } from '@/types/database'

interface TransactionFormProps {
  familyId: string
  categories: Category[]
  members: FamilyMember[]
  currentMemberId: string
  onClose: () => void
  onSuccess: () => void
}

export default function TransactionForm({
  familyId,
  categories,
  members,
  currentMemberId,
  onClose,
  onSuccess,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [memberId, setMemberId] = useState(currentMemberId)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !categoryId) {
      setError('Preencha valor e categoria')
      return
    }

    setLoading(true)
    setError('')

    const { error: insertError } = await supabase.from('transactions').insert({
      family_id: familyId,
      member_id: memberId,
      category_id: categoryId,
      type,
      amount: parseFloat(amount),
      description: description || null,
      date,
      is_recurring: false,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-bg-secondary border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold">Novo Lancamento</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Type toggle */}
          <div className="flex gap-2 bg-bg-input rounded-xl p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                type === 'expense'
                  ? 'bg-danger text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                type === 'income'
                  ? 'bg-success text-white'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Receita
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Valor (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
              className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-2xl font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary text-center"
            />
          </div>

          {/* Category grid */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Categoria
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-xs transition-colors ${
                    categoryId === cat.id
                      ? 'border-primary bg-primary/10 text-primary-light'
                      : 'border-border hover:border-border-light text-text-secondary'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Member */}
          {members.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Quem gastou
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nickname}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date and Description */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Descricao
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opcional"
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-medium text-white transition-colors disabled:opacity-50 ${
              type === 'expense'
                ? 'bg-danger hover:bg-danger/90'
                : 'bg-success hover:bg-success/90'
            }`}
          >
            {loading ? 'Salvando...' : `Registrar ${type === 'expense' ? 'Despesa' : 'Receita'}`}
          </button>
        </form>
      </div>
    </div>
  )
}
