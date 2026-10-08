-- Pegá este archivo en Supabase → SQL Editor → Run.
-- Proyecto: kredian. No subas llaves al repo.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  usuario text not null unique,
  foto_url text,
  descripcion text,
  creado_en timestamptz not null default now()
);

create table if not exists public.credenciales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  fuente text not null default 'credly',
  url text not null,
  badge_id text,
  titulo text,
  emisor text,
  nombre_en_insignia text,
  fecha_emision date,
  fecha_vencimiento date,
  estado text,
  nombre_coincide boolean,
  hash text,
  tx_hash text,
  sellado_en timestamptz,
  rango text
);

create table if not exists public.rangos (
  id uuid primary key default gen_random_uuid(),
  patron text not null,
  area text,
  subarea text,
  rango text not null,
  peso int not null check (peso between 1 and 4)
);

create index if not exists credenciales_user_id_idx on public.credenciales (user_id);
create index if not exists profiles_usuario_idx on public.profiles (usuario);

alter table public.profiles enable row level security;
alter table public.credenciales enable row level security;
alter table public.rangos enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

drop policy if exists "credenciales_select_public" on public.credenciales;
create policy "credenciales_select_public"
  on public.credenciales for select
  using (true);

drop policy if exists "credenciales_insert_own" on public.credenciales;
create policy "credenciales_insert_own"
  on public.credenciales for insert
  with check (auth.uid() = user_id);

drop policy if exists "credenciales_update_own" on public.credenciales;
create policy "credenciales_update_own"
  on public.credenciales for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "credenciales_delete_own" on public.credenciales;
create policy "credenciales_delete_own"
  on public.credenciales for delete
  using (auth.uid() = user_id);

drop policy if exists "rangos_select_public" on public.rangos;
create policy "rangos_select_public"
  on public.rangos for select
  using (true);

drop policy if exists "rangos_write_authenticated" on public.rangos;
create policy "rangos_write_authenticated"
  on public.rangos for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
