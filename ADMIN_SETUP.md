# FloatBoat Admin Setup

## Environment

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is only for trusted server-side/admin scripts. Do not expose it in browser code.

## Supabase Database

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/migrations/initial_schema.sql`.
4. Confirm the public bucket `houseboat-media` exists under Storage.

The migration creates:

- Admin profile and houseboat settings tables
- Rooms, packages, customers, bookings, payments, income, expenses
- Availability blocks, gallery, and website content
- RLS policies for public read-only website data and admin-only management data
- A booking conflict trigger to prevent double booking for the same room/date and full-boat overlaps
- A payment trigger to keep booking paid/due status aligned

## First Admin User

1. In Supabase Dashboard, go to Authentication > Users.
2. Create an email/password user.
3. Copy the new user's Auth `id`.
4. Insert the profile:

```sql
insert into public.admin_profiles (user_id, full_name, role, phone)
values ('PASTE_AUTH_USER_ID_HERE', 'Owner Admin', 'admin', '01XXXXXXXXX');
```

Now log in at `/admin/login`.

If Supabase env vars are empty, the admin runs in local demo mode. Any email/password logs in and data is saved in browser localStorage.

## Local Run

```bash
npm install
npm run dev
```

Open:

- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Public Website Integration

The public website reads Supabase data when configured:

- `houseboat_settings`
- active `rooms`
- active `packages`
- `gallery`
- active `website_content`
- `availability_blocks`

If Supabase is empty or not configured, the existing static fallback data stays active so the public website does not break.
