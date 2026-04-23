-- Run this in your Supabase SQL Editor
-- (If you already created the table, run the ALTER line separately first)

create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text default '',
  category text not null default 'personal',
  priority text not null default 'medium',
  due_date date,
  due_time time,
  completed boolean default false,
  created_at timestamptz default now()
);

alter table tasks enable row level security;

create policy "Users can manage their own tasks"
  on tasks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
