-- Create profiles table as source of truth for user roles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'doctor', 'company', 'company_admin', 'organization_admin')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Add RLS policies
alter table public.profiles enable row level security;

-- Users can read their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = user_id);

-- Service role can manage all profiles
create policy "Service role can manage profiles" on public.profiles
  for all using (auth.jwt() ->> 'role' = 'service_role');

-- Create index for faster lookups
create index if not exists profiles_user_id_idx on public.profiles(user_id);

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Check if user has role in metadata, otherwise default to 'patient'
  insert into public.profiles (user_id, email, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_app_meta_data->>'role',
      new.raw_user_meta_data->>'role',
      'patient'
    )::text
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Function to update timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

-- Insert some example profiles for existing users (if any)
-- This will be a no-op if no users exist yet
insert into public.profiles (user_id, role)
select
  id,
  coalesce(
    raw_app_meta_data->>'role',
    raw_user_meta_data->>'role',
    'patient'
  )::text
from auth.users
on conflict (user_id) do nothing;