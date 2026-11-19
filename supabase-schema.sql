-- Exécuter dans Supabase > SQL Editor. Ne jamais mettre la clé service_role dans le site.
create extension if not exists pgcrypto;

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  party text,
  program text,
  photo_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1200),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('support','oppose')),
  created_at timestamptz not null default now(),
  unique(candidate_id,user_id)
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.candidates enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.poll_votes enable row level security;

create policy "Tout le monde voit les candidats publiés" on public.candidates
for select using (published = true);
create policy "Admins gèrent les candidats depuis le tableau de bord" on public.candidates
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "Tout le monde voit les commentaires approuvés" on public.comments
for select using (approved = true);
create policy "Un utilisateur connecté peut proposer un commentaire" on public.comments
for insert to authenticated with check (auth.uid() = user_id);
create policy "Un utilisateur peut modifier son commentaire non approuvé" on public.comments
for update to authenticated using (auth.uid() = user_id and approved = false)
with check (auth.uid() = user_id and approved = false);

create policy "Réactions visibles" on public.reactions
for select using (true);
create policy "Utilisateur gère sa réaction" on public.reactions
for insert to authenticated with check (auth.uid() = user_id);
create policy "Utilisateur met à jour sa réaction" on public.reactions
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Résultats du sondage visibles" on public.poll_votes
for select using (true);
create policy "Un vote par compte" on public.poll_votes
for insert to authenticated with check (auth.uid() = user_id);
create policy "Utilisateur peut corriger son choix" on public.poll_votes
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
