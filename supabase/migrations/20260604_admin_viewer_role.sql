-- Add read-only admin viewer role.

alter table public.admin_profiles
  drop constraint if exists admin_profiles_role_check;

alter table public.admin_profiles
  add constraint admin_profiles_role_check
  check (role in ('admin', 'manager', 'viewer'));

create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role in ('admin', 'manager')
  );
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_admin_viewer()
returns boolean as $$
begin
  return exists (
    select 1
    from public.admin_profiles
    where user_id = auth.uid()
      and role in ('admin', 'manager', 'viewer')
  );
end;
$$ language plpgsql security definer set search_path = public;
