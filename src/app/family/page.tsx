'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Copy, Check, UserPlus, Crown, LogIn } from 'lucide-react'
import type { Family, FamilyMember } from '@/types/database'

export default function FamilyPage() {
  const [family, setFamily] = useState<Family | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Create family form
  const [showCreate, setShowCreate] = useState(false)
  const [familyName, setFamilyName] = useState('')
  const [nickname, setNickname] = useState('')
  const [creating, setCreating] = useState(false)

  // Join family form
  const [showJoin, setShowJoin] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [joinNickname, setJoinNickname] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const loadFamily = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: membership } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .single()

    if (membership) {
      const [famRes, memRes] = await Promise.all([
        supabase.from('families').select('*').eq('id', membership.family_id).single(),
        supabase.from('family_members').select('*').eq('family_id', membership.family_id),
      ])
      if (famRes.data) setFamily(famRes.data)
      if (memRes.data) setMembers(memRes.data)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadFamily()
  }, [loadFamily])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')

    const { error: rpcError } = await supabase.rpc('create_family_with_defaults', {
      p_name: familyName,
      p_nickname: nickname,
    })

    if (rpcError) {
      setError(rpcError.message)
      setCreating(false)
      return
    }

    window.location.reload()
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setJoining(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Find family by invite code
    const { data: fam } = await supabase
      .from('families')
      .select('id')
      .eq('invite_code', inviteCode.trim())
      .single()

    if (!fam) {
      setError('Codigo de convite invalido')
      setJoining(false)
      return
    }

    const { error: insertError } = await supabase.from('family_members').insert({
      family_id: fam.id,
      user_id: user.id,
      nickname: joinNickname,
      role: 'member',
    })

    if (insertError) {
      setError(insertError.message.includes('duplicate')
        ? 'Voce ja faz parte desta familia'
        : insertError.message)
      setJoining(false)
      return
    }

    window.location.reload()
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

  // No family — show create/join options
  if (!family) {
    return (
      <div className="max-w-lg mx-auto space-y-6 pt-12">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-primary-light" />
          </div>
          <h1 className="text-2xl font-bold">Grupo Familiar</h1>
          <p className="text-text-secondary">
            Crie um novo grupo ou entre com um codigo de convite
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-3 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Create family */}
        <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
          <button
            onClick={() => { setShowCreate(!showCreate); setShowJoin(false) }}
            className="flex items-center gap-3 w-full text-left"
          >
            <UserPlus className="w-5 h-5 text-primary-light" />
            <span className="font-medium">Criar novo grupo familiar</span>
          </button>

          {showCreate && (
            <form onSubmit={handleCreate} className="space-y-3 pt-2">
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Nome da familia (ex: Familia Silva)"
                required
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Seu apelido (ex: Gabriel)"
                required
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {creating ? 'Criando...' : 'Criar Grupo'}
              </button>
            </form>
          )}
        </div>

        {/* Join family */}
        <div className="bg-bg-card border border-border rounded-2xl p-6 space-y-4">
          <button
            onClick={() => { setShowJoin(!showJoin); setShowCreate(false) }}
            className="flex items-center gap-3 w-full text-left"
          >
            <LogIn className="w-5 h-5 text-success" />
            <span className="font-medium">Entrar com codigo de convite</span>
          </button>

          {showJoin && (
            <form onSubmit={handleJoin} className="space-y-3 pt-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Codigo de convite (8 caracteres)"
                required
                maxLength={8}
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary text-center tracking-widest font-mono text-lg"
              />
              <input
                type="text"
                value={joinNickname}
                onChange={(e) => setJoinNickname(e.target.value)}
                placeholder="Seu apelido"
                required
                className="w-full px-4 py-3 bg-bg-input border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={joining}
                className="w-full py-3 bg-success hover:bg-success/90 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {joining ? 'Entrando...' : 'Entrar no Grupo'}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  // Has family — show members and invite code
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{family.name}</h1>

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
