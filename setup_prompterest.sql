-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES Table (Optional, but good for joins)
-- Trigger to auto-create profile on signup is recommended usually, 
-- but for MVP we can just query auth.users or rely on minimal logic.
-- We'll create a basic profiles table to store username/avatar if needed later.
create table public.profiles (
  id uuid REFERENCES auth.users on delete cascade primary key,
  email text,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROMPTS Table
create table public.prompts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  prompt_text text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. RATINGS Table
create table public.ratings (
  id uuid default uuid_generate_v4() primary key,
  prompt_id uuid references public.prompts on delete cascade not null,
  user_id uuid references auth.users not null,
  value int not null check (value >= 1 and value <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (prompt_id, user_id)
);

-- 4. COMMENTS Table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  prompt_id uuid references public.prompts on delete cascade not null,
  user_id uuid references auth.users not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.ratings enable row level security;
alter table public.comments enable row level security;

-- POLICIES

-- PROMPTS
create policy "Public prompts are viewable by everyone"
  on public.prompts for select
  using ( true );

create policy "Users can insert their own prompts"
  on public.prompts for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own prompts"
  on public.prompts for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own prompts"
  on public.prompts for delete
  using ( auth.uid() = user_id );

-- RATINGS
create policy "Ratings are viewable by everyone"
  on public.ratings for select
  using ( true );

create policy "Users can insert their own ratings"
  on public.ratings for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own ratings"
  on public.ratings for update
  using ( auth.uid() = user_id );

-- COMMENTS
create policy "Comments are viewable by everyone"
  on public.comments for select
  using ( true );

create policy "Users can insert their own comments"
  on public.comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own comments"
  on public.comments for delete
  using ( auth.uid() = user_id );

-- STORAGE BUCKET
-- Note: You must create the bucket 'prompt-images' in the Storage dashboard manually or via API.
-- This script sets up policies assuming the bucket exists.

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'prompt-images' );

create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check (
    bucket_id = 'prompt-images' 
    and auth.role() = 'authenticated'
  );

-- HELPER VIEWS (Optional)
-- View to get average ratings per prompt
create or replace view public.prompt_stats as
  select 
    p.id as prompt_id,
    count(distinct r.id) as rating_count,
    coalesce(avg(r.value), 0) as average_rating,
    count(distinct c.id) as comment_count
  from public.prompts p
  left join public.ratings r on p.id = r.prompt_id
  left join public.comments c on p.id = c.prompt_id
  group by p.id;
