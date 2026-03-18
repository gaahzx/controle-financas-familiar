-- ============================================================
-- CONTROLE DE FINANCAS FAMILIAR — Schema Supabase
-- ============================================================
-- Executar este SQL no Supabase SQL Editor (Dashboard > SQL)
-- ============================================================

-- 1. FAMILIES
create table public.families (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  invite_code text unique not null default substr(md5(random()::text), 1, 8),
  created_at timestamptz default now() not null
);

-- 2. FAMILY MEMBERS
create table public.family_members (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  nickname text not null,
  role text check (role in ('admin', 'member')) default 'member' not null,
  avatar_url text,
  joined_at timestamptz default now() not null,
  unique(family_id, user_id)
);

-- 3. CATEGORIES
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  name text not null,
  icon text not null default '📦',
  color text not null default '#64748b',
  budget_limit decimal(12,2),
  is_default boolean default false not null
);

-- 4. TRANSACTIONS
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade not null,
  member_id uuid references public.family_members(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  type text check (type in ('expense', 'income')) not null,
  amount decimal(12,2) not null check (amount > 0),
  description text,
  date date not null default current_date,
  is_recurring boolean default false not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_transactions_family_date on public.transactions(family_id, date desc);
create index idx_transactions_category on public.transactions(category_id);
create index idx_transactions_member on public.transactions(member_id);
create index idx_family_members_user on public.family_members(user_id);
create index idx_family_members_family on public.family_members(family_id);
create index idx_categories_family on public.categories(family_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- Users can see families they belong to
create policy "Users can view own families"
  on public.families for select
  using (
    id in (
      select family_id from public.family_members
      where user_id = auth.uid()
    )
  );

-- Users can create families
create policy "Users can create families"
  on public.families for insert
  with check (true);

-- Users can see family members of their families
create policy "Users can view family members"
  on public.family_members for select
  using (
    family_id in (
      select family_id from public.family_members
      where user_id = auth.uid()
    )
  );

-- Users can join families (insert themselves)
create policy "Users can join families"
  on public.family_members for insert
  with check (user_id = auth.uid());

-- Admins can update family members
create policy "Admins can update members"
  on public.family_members for update
  using (
    family_id in (
      select family_id from public.family_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Users can see categories of their families
create policy "Users can view categories"
  on public.categories for select
  using (
    family_id in (
      select family_id from public.family_members
      where user_id = auth.uid()
    )
  );

-- Members can manage categories
create policy "Members can manage categories"
  on public.categories for all
  using (
    family_id in (
      select family_id from public.family_members
      where user_id = auth.uid()
    )
  );

-- Users can see transactions of their families
create policy "Users can view transactions"
  on public.transactions for select
  using (
    family_id in (
      select family_id from public.family_members
      where user_id = auth.uid()
    )
  );

-- Members can create transactions
create policy "Members can create transactions"
  on public.transactions for insert
  with check (
    family_id in (
      select family_id from public.family_members
      where user_id = auth.uid()
    )
  );

-- Members can update their own transactions
create policy "Members can update own transactions"
  on public.transactions for update
  using (
    member_id in (
      select id from public.family_members
      where user_id = auth.uid()
    )
  );

-- Members can delete their own transactions
create policy "Members can delete own transactions"
  on public.transactions for delete
  using (
    member_id in (
      select id from public.family_members
      where user_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCTION: Create family with default categories
-- ============================================================

create or replace function public.create_family_with_defaults(
  p_name text,
  p_nickname text
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_family_id uuid;
  v_user_id uuid := auth.uid();
begin
  -- Create family
  insert into public.families (name)
  values (p_name)
  returning id into v_family_id;

  -- Add creator as admin
  insert into public.family_members (family_id, user_id, nickname, role)
  values (v_family_id, v_user_id, p_nickname, 'admin');

  -- Insert default categories
  insert into public.categories (family_id, name, icon, color, is_default) values
    (v_family_id, 'Moradia',       '🏠', '#6366f1', true),
    (v_family_id, 'Mercado',       '🛒', '#10b981', true),
    (v_family_id, 'Saude',         '💊', '#ef4444', true),
    (v_family_id, 'Educacao',      '🎓', '#f59e0b', true),
    (v_family_id, 'Transporte',    '🚗', '#3b82f6', true),
    (v_family_id, 'Lazer',         '🎮', '#8b5cf6', true),
    (v_family_id, 'Contas Fixas',  '💡', '#ec4899', true),
    (v_family_id, 'Vestuario',     '👗', '#14b8a6', true),
    (v_family_id, 'Alimentacao',   '🍕', '#f97316', true),
    (v_family_id, 'Salario',       '💰', '#22c55e', true),
    (v_family_id, 'Outros',        '📦', '#64748b', true);

  return v_family_id;
end;
$$;
