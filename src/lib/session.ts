import { createClient } from '@/lib/supabase/client'

const SESSION_KEY = 'financas_session_ready'

/**
 * MVP: Garante que existe um usuário anônimo logado e com família criada.
 * Retorna { familyId, memberId } ou null se falhar.
 */
export async function ensureSession(): Promise<{
  familyId: string
  memberId: string
  userId: string
} | null> {
  const supabase = createClient()

  // 1. Verificar se já tem sessão
  let { data: { user } } = await supabase.auth.getUser()

  // 2. Se não tem, criar sessão anônima
  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error || !data.user) {
      console.error('Erro ao criar sessão anônima:', error)
      return null
    }
    user = data.user
  }

  // 3. Verificar se já tem família
  const { data: membership } = await supabase
    .from('family_members')
    .select('id, family_id')
    .eq('user_id', user.id)
    .single()

  if (membership) {
    return {
      familyId: membership.family_id,
      memberId: membership.id,
      userId: user.id,
    }
  }

  // 4. Criar família default
  const { data: newFamilyId, error: rpcError } = await supabase.rpc(
    'create_family_with_defaults',
    {
      p_name: 'Minha Familia',
      p_nickname: 'Eu',
    }
  )

  if (rpcError) {
    console.error('Erro ao criar família:', rpcError)
    return null
  }

  // 5. Buscar membership recém-criada
  const { data: newMembership } = await supabase
    .from('family_members')
    .select('id, family_id')
    .eq('user_id', user.id)
    .single()

  if (!newMembership) return null

  return {
    familyId: newMembership.family_id,
    memberId: newMembership.id,
    userId: user.id,
  }
}
