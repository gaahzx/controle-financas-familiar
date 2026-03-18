'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ensureSession } from '@/lib/session'
import { Copy, Check, Crown, Pencil } from 'lucide-react'
import type { Family, FamilyMember } from '@/types/database'

export default function FamilyPage() {
  const [family, setFamily] = useState<Family | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [familyName, setFamilyName] = useState('')
  const [nickname, setNickname] = useState('')
  const [saving, setSaving] = useState(false)
  const [sessionUserId, setSessionUserId] = useState('')

  const supabase = createClient()

  const loadFamily = useCallback(async () => {
    const session = await ensureSession()
    if (!session) {
      setLoading(false)
      return
    }

    setSessionUserId(session.userId)

    const [famRes, memRes] = await Promise.all([
      supabase.from('families').select('*').eq('id', session.familyId).single(),
      supabase.from('family_members').select('*').eq('family_id', session.familyId),
    ])

    if (famRes.data) {
      setFamily(famRes.data)
      setFamilyName(famRes.data.name)
    }
    if (memRes.data) {
      setMembers(memRes.data)
      const me = memRes.data.find((m) => m.user_id === session.userId)
      if (me) setNickname(me.nickname)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadFamily()
  }, [loadFamily])

  async function handleSave() {
    if (!family) return
    setSaving(true)

    await supabase
      .from('families')
      .update({ name: familyName })
      .eq('id', family.id)

    if (sessionUserId) {
      await supabase
        .from('family_members')
        .update({ nickname })
        .eq('user_id', sessionUserId)
        .eq('family_id', family.id)
    }

    setSaving(false)
    setEditing(false)
    loadFamily()
  }

  function copyInviteCode() {
    if (family) {
      navigator.clipboard.writeText(family.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (!family) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">Erro ao carregar familia. Recarregue a pagina.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{family.name}</h1>
        <button
          onClick={() => setEditing(!editing)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4 text-text-secondary" />
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-medium text-text-secondary">Editar</h3>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Nome da familia"
            className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Seu apelido"
            className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      )}

      {/* Invite code */}
      <div className="bg-bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-medium text-text-secondary mb-3">
          Codigo de Convite
        </h3>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-center text-2xl font-mono font-bold tracking-[0.3em] text-primary-light bg-bg-input py-3 rounded-xl">
            {family.invite_code}
          </code>
          <button
            onClick={copyInviteCode}
            className="p-3 bg-bg-input hover:bg-border rounded-xl transition-colors"
            title="Copiar codigo"
          >
            {copied ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-text-muted text-xs mt-2">
          Compartilhe este codigo com sua familia para que entrem no grupo
        </p>
      </div>

      {/* Members */}
      <div className="bg-bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-medium text-text-secondary mb-4">
          Membros ({members.length})
        </h3>
        <div className="space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary-light">
                  {m.nickname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{m.nickname}</p>
                  <p className="text-xs text-text-muted">
                    Entrou em {new Date(m.joined_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              {m.role === 'admin' && (
                <div className="flex items-center gap-1 text-warning text-xs">
                  <Crown className="w-3.5 h-3.5" />
                  Admin
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
