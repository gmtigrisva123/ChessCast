-- ChessCast: server-side coin spending and rewards.
-- Run after 0001 in Supabase → SQL Editor (or `supabase db push`).

-- Every coin movement that is not a Stripe purchase.
create table if not exists public.coin_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  delta integer not null,
  reason text not null,          -- 'card' | 'tip' | 'court_vote'
  ref text not null default '',  -- card id, tip target, case id…
  created_at timestamptz not null default now()
);
create index if not exists coin_ledger_user_idx on public.coin_ledger (user_id, created_at desc);
-- A court case pays its jury reward only once per user.
create unique index if not exists coin_ledger_vote_once on public.coin_ledger (user_id, ref) where reason = 'court_vote';

alter table public.coin_ledger enable row level security;
drop policy if exists "own ledger" on public.coin_ledger;
create policy "own ledger" on public.coin_ledger for select using ((select auth.uid()) = user_id);

-- Atomic spend: deducts only if the balance covers it. Returns the new balance, or null if it doesn't.
create or replace function public.spend_coins(p_user_id uuid, p_amount integer, p_reason text, p_ref text)
returns integer
language plpgsql security definer set search_path = '' as $$
declare new_balance integer;
begin
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  update public.wallets set coins = coins - p_amount, updated_at = now()
    where user_id = p_user_id and coins >= p_amount
    returning coins into new_balance;
  if new_balance is null then return null; end if;
  insert into public.coin_ledger (user_id, delta, reason, ref) values (p_user_id, -p_amount, p_reason, coalesce(p_ref, ''));
  return new_balance;
end $$;

-- Jury reward: +p_amount once per case. Returns the new balance, or null if this case was already rewarded.
create or replace function public.reward_court_vote(p_user_id uuid, p_case_id text, p_amount integer)
returns integer
language plpgsql security definer set search_path = '' as $$
declare new_balance integer;
begin
  insert into public.coin_ledger (user_id, delta, reason, ref) values (p_user_id, p_amount, 'court_vote', p_case_id)
    on conflict do nothing;
  if not found then return null; end if;
  insert into public.wallets (user_id) values (p_user_id) on conflict do nothing;
  update public.wallets set coins = coins + p_amount, updated_at = now()
    where user_id = p_user_id returning coins into new_balance;
  return new_balance;
end $$;

revoke all on function public.spend_coins(uuid, integer, text, text) from public, anon, authenticated;
revoke all on function public.reward_court_vote(uuid, text, integer) from public, anon, authenticated;
