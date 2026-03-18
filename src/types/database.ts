export type TransactionType = 'expense' | 'income'
export type MemberRole = 'admin' | 'member'

export interface Family {
  id: string
  name: string
  invite_code: string
  created_at: string
}

export interface FamilyMember {
  id: string
  family_id: string
  user_id: string
  nickname: string
  role: MemberRole
  avatar_url: string | null
  joined_at: string
}

export interface Category {
  id: string
  family_id: string
  name: string
  icon: string
  color: string
  budget_limit: number | null
  is_default: boolean
}

export interface Transaction {
  id: string
  family_id: string
  member_id: string
  category_id: string
  type: TransactionType
  amount: number
  description: string | null
  date: string
  is_recurring: boolean
  created_at: string
  // Joined fields
  category?: Category
  member?: FamilyMember
}

export interface MonthSummary {
  total_income: number
  total_expenses: number
  balance: number
  by_category: CategorySummary[]
}

export interface CategorySummary {
  category_id: string
  category_name: string
  category_icon: string
  category_color: string
  total: number
  budget_limit: number | null
  percentage: number
}
