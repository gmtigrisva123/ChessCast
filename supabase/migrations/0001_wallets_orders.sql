-- ChessCast: server-side wallet + Stripe orders.
-- Run once in Supabase → SQL Editor (or `supabase db push`).

create table if not exists public.wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coins integer not null default 300 check (coins >= 0),
  plan text not null default 'free',
  plan_renews_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  stripe_session_id text unique not null,
  kind text not null,
  item_id text not null,
  cycle text,
  coins integer not null default 0,
  amount_cents integer not null,
  created_at timestamptz not null default now()
);

-- Users can only READ their own rows; all writes go through the server (secret key).
alter table public.wallets enable row level security;
alter table public.orders  enable row level security;

drop policy if exists "own wallet" on public.wallets;
create policy "own wallet" on public.wallets for select using ((select auth.uid()) = user_id);
drop policy if exists "own orders" on public.orders;
create policy "own orders" on public.orders for select using ((select auth.uid()) = user_id);

-- Every new account gets a wallet.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.wallets (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Idempotent credit used by the Stripe webhook: a session is only ever credited once.
create or replace function public.credit_checkout(
  p_user_id uuid,
  p_session_id text,
  p_kind text,
  p_item_id text,
  p_cycle text,
  p_coins integer,
  p_amount_cents integer
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare inserted integer;
begin
  insert into public.orders (user_id, stripe_session_id, kind, item_id, cycle, coins, amount_cents)
  values (p_user_id, p_session_id, p_kind, p_item_id, nullif(p_cycle, ''), p_coins, p_amount_cents)
  on conflict (stripe_session_id) do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return false; end if;

  insert into public.wallets (user_id) values (p_user_id) on conflict do nothing;
  update public.wallets set
    coins = coins + p_coins,
    plan = case when p_kind = 'plan' then p_item_id else plan end,
    plan_renews_at = case when p_kind = 'plan'
      then now() + (case when p_cycle = 'yearly' then interval '365 days' else interval '30 days' end)
      else plan_renews_at end,
    updated_at = now()
  where user_id = p_user_id;
  return true;
end $$;

revoke all on function public.credit_checkout(uuid, text, text, text, text, integer, integer) from public, anon, authenticated;
