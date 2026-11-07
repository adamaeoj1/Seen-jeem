-- ============================================================================
-- SEEN JEEM x GIMNIM (سين جيم × قمنم) — PRODUCTION SUPABASE SQL SCHEMA (v2)
-- Run this script directly in the Supabase SQL Editor.
-- Safe & Idempotent: Can be run on a fresh DB or an existing DB without data loss.
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. PROFILES TABLE (Linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null default 'مضيف السهرة',
  tier text not null default 'free' check (tier in ('free', 'party_pass', 'pro')),
  free_sessions_remaining integer not null default 1 check (free_sessions_remaining >= 0),
  pass_expires_at timestamptz null,
  stripe_customer_id text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Automatically create a profile row when a new user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, tier, free_sessions_remaining)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, 'مضيف'), '@', 1)),
    'free',
    1
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. ROOMS TABLE (Active Game Sessions)
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id uuid null references public.profiles(id) on delete set null,
  edition text not null default 'MA' check (edition in ('MA', 'MENA')),
  board_size integer not null default 18 check (board_size in (18, 36)),
  answering_mode text not null default 'TYPING' check (answering_mode in ('TYPING', 'BUZZER')),
  status text not null default 'LOBBY' check (
    status in ('LOBBY', 'MODE_SELECT', 'ROUND_INTRO', 'PLAYING', 'LOCKED', 'REVEAL_AND_SCORE', 'LEADERBOARD')
  ),
  active_mode text not null default 'SEEN_JEEM' check (
    active_mode in ('SEEN_JEEM', 'MINI_GAMES', 'MIXED_PARTY')
  ),
  current_question jsonb not null default '{}'::jsonb,
  team1_score integer not null default 0,
  team2_score integer not null default 0,
  settings jsonb not null default '{
    "team1Name": "أسود الأطلس",
    "team1Color": "#3B66B4",
    "team2Name": "القراصنة",
    "team2Color": "#E65C2E",
    "timerSec": 45,
    "soundEnabled": true,
    "musicEnabled": true
  }'::jsonb,
  state_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Non-destructive migration for existing rooms table
alter table public.rooms add column if not exists edition text not null default 'MA';
alter table public.rooms add column if not exists board_size integer not null default 18;
alter table public.rooms add column if not exists answering_mode text not null default 'TYPING';

create index if not exists idx_rooms_code on public.rooms(code);

-- 3. ROOM_PLAYERS TABLE (Real-Time Connected Controllers)
create table if not exists public.room_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  team text not null default 'team1' check (team in ('team1', 'team2')),
  avatar_id text not null default 'abu_sultan',
  voice_id text not null default 'hype_horn',
  is_captain boolean not null default false,
  is_online boolean not null default true,
  score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_room_players_room_id on public.room_players(room_id);

-- 4. CUSTOM_PACKS TABLE (Pro Host Custom Question & Category Builder)
create table if not exists public.custom_packs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid null references public.profiles(id) on delete cascade,
  title text not null,
  subtitle text not null default '',
  pack_type text not null default 'seen_jeem' check (pack_type in ('seen_jeem', 'gimnim')),
  color text not null default '#F4D03F',
  thumbnail_url text null,
  questions jsonb not null default '[]'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_custom_packs_owner on public.custom_packs(owner_id);

-- ============================================================================
-- 5. ATOMIC PLAYER JOIN RPC (Prevents Mobile Join from Overwriting Team Names)
-- ============================================================================
create or replace function public.join_room_player(
  p_room_code text,
  p_player jsonb
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_room public.rooms%rowtype;
  v_players jsonb;
  v_filtered jsonb := '[]'::jsonb;
  v_elem jsonb;
  v_next_snapshot jsonb;
begin
  select * into v_room
  from public.rooms
  where code = upper(trim(p_room_code))
  for update;

  if not found then
    return null;
  end if;

  v_players := coalesce(v_room.state_snapshot->'players', '[]'::jsonb);

  for v_elem in select * from jsonb_array_elements(v_players)
  loop
    if (v_elem->>'id') is distinct from (p_player->>'id')
       and (v_elem->>'name') is distinct from (p_player->>'name')
       and (v_elem->>'id') not in ('p-falcon-cap', 'p-tiger-cap')
    then
      v_filtered := v_filtered || jsonb_build_array(v_elem);
    end if;
  end loop;

  v_filtered := v_filtered || jsonb_build_array(p_player);
  v_next_snapshot := jsonb_set(
    coalesce(v_room.state_snapshot, '{}'::jsonb),
    '{players}',
    v_filtered,
    true
  );

  update public.rooms
  set state_snapshot = v_next_snapshot,
      updated_at = now()
  where id = v_room.id;

  return v_next_snapshot;
end;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_players enable row level security;
alter table public.custom_packs enable row level security;

-- Profiles: Users can read, insert, and update their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Rooms: Anyone with the room code can read, insert, update & delete active game room state
drop policy if exists "Public read rooms" on public.rooms;
create policy "Public read rooms"
  on public.rooms for select
  using (true);

drop policy if exists "Host and players can insert rooms" on public.rooms;
create policy "Host and players can insert rooms"
  on public.rooms for insert
  with check (true);

drop policy if exists "Host and players can update rooms" on public.rooms;
create policy "Host and players can update rooms"
  on public.rooms for update
  using (true);

drop policy if exists "Host can delete rooms" on public.rooms;
create policy "Host can delete rooms"
  on public.rooms for delete
  using (true);

-- Room Players: Players join without needing an account (QR code / 4-char code)
drop policy if exists "Public read room_players" on public.room_players;
create policy "Public read room_players"
  on public.room_players for select
  using (true);

drop policy if exists "Public insert room_players" on public.room_players;
create policy "Public insert room_players"
  on public.room_players for insert
  with check (true);

drop policy if exists "Public update room_players" on public.room_players;
create policy "Public update room_players"
  on public.room_players for update
  using (true);

drop policy if exists "Public delete room_players" on public.room_players;
create policy "Public delete room_players"
  on public.room_players for delete
  using (true);

-- Custom Packs: Owners manage their own packs; public packs readable by all
drop policy if exists "Read custom packs" on public.custom_packs;
create policy "Read custom packs"
  on public.custom_packs for select
  using (is_public = true or auth.uid() = owner_id or owner_id is null);

drop policy if exists "Insert custom packs" on public.custom_packs;
create policy "Insert custom packs"
  on public.custom_packs for insert
  with check (auth.uid() = owner_id or owner_id is null);

drop policy if exists "Update custom packs" on public.custom_packs;
create policy "Update custom packs"
  on public.custom_packs for update
  using (auth.uid() = owner_id or owner_id is null);

drop policy if exists "Delete custom packs" on public.custom_packs;
create policy "Delete custom packs"
  on public.custom_packs for delete
  using (auth.uid() = owner_id or owner_id is null);

-- ============================================================================
-- ENABLE SUPABASE REALTIME ON ROOMS & ROOM_PLAYERS
-- ============================================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.rooms;
    exception when duplicate_object then null;
    end;
    begin
      alter publication supabase_realtime add table public.room_players;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
