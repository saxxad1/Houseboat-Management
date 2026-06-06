-- Keep room availability consistent across public bookings, admin bookings,
-- and manual bookings stored on trip slots.

create or replace function public.prevent_double_booking()
returns trigger as $$
begin
  if new.booking_status in ('cancelled', 'completed') then
    return new;
  end if;

  if new.season_type = 'padma' then
    new.event_date = coalesce(new.event_date, new.check_in_date);

    if exists (
      select 1
      from public.bookings b
      where b.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
        and b.season_type = 'padma'
        and b.booking_status in ('pending', 'confirmed', 'checked_in')
        and coalesce(b.event_date, b.check_in_date) = coalesce(new.event_date, new.check_in_date)
        and (
          b.event_slot = new.event_slot
          or b.event_slot = 'full_day'
          or new.event_slot = 'full_day'
        )
    ) then
      raise exception 'Selected event slot is already booked';
    end if;
  else
    if exists (
      select 1
      from public.bookings b
      where b.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
        and coalesce(b.season_type, 'haor') = 'haor'
        and b.booking_status in ('pending', 'confirmed', 'checked_in')
        and daterange(b.check_in_date, b.check_out_date, '[)') && daterange(new.check_in_date, new.check_out_date, '[)')
        and (
          b.booking_type = 'full_boat'
          or new.booking_type = 'full_boat'
          or b.room_id = new.room_id
          or exists (
            select 1
            from jsonb_array_elements(coalesce(new.room_details, '[]'::jsonb)) nr
            where nr->>'roomId' = b.room_id::text
          )
          or exists (
            select 1
            from jsonb_array_elements(coalesce(b.room_details, '[]'::jsonb)) br
            where br->>'roomId' = new.room_id::text
          )
          or exists (
            select 1
            from jsonb_array_elements(coalesce(new.room_details, '[]'::jsonb)) nr
            join jsonb_array_elements(coalesce(b.room_details, '[]'::jsonb)) br
              on nr->>'roomId' = br->>'roomId'
          )
        )
    ) then
      raise exception 'Selected date/room is already booked';
    end if;
  end if;

  new.due_amount = greatest(new.total_amount - new.advance_amount, 0);
  if new.advance_amount <= 0 then
    new.payment_status = 'unpaid';
  elsif new.due_amount <= 0 then
    new.payment_status = 'paid';
  else
    new.payment_status = 'partially_paid';
  end if;

  return new;
end;
$$ language plpgsql;

create or replace function public.trip_slot_manual_booking_room_ids(note_text text)
returns table(room_id text) as $$
declare
  manual_data jsonb;
begin
  if note_text is null or btrim(note_text) = '' then
    return;
  end if;

  begin
    manual_data := note_text::jsonb;
  exception when others then
    return;
  end;

  if jsonb_typeof(manual_data->'manualBookings') <> 'array' then
    return;
  end if;

  return query
    select booking.item->>'roomId'
    from jsonb_array_elements(manual_data->'manualBookings') as booking(item)
    where coalesce(booking.item->>'roomId', '') <> ''
    union all
    select detail.item->>'roomId'
    from jsonb_array_elements(manual_data->'manualBookings') as booking(item)
    cross join lateral jsonb_array_elements(coalesce(booking.item->'roomDetails', '[]'::jsonb)) as detail(item)
    where coalesce(detail.item->>'roomId', '') <> '';
end;
$$ language plpgsql stable;

create or replace function public.prevent_trip_slot_manual_room_conflicts()
returns trigger as $$
declare
  manual_data jsonb;
begin
  if new.note is null or btrim(new.note) = '' then
    return new;
  end if;

  begin
    manual_data := new.note::jsonb;
  exception when others then
    return new;
  end;

  if jsonb_typeof(manual_data->'manualBookings') <> 'array' then
    return new;
  end if;

  if exists (
    with manual_rooms as (
      select booking_idx, room_id
      from jsonb_array_elements(manual_data->'manualBookings') with ordinality booking(item, booking_idx)
      cross join lateral (
        select booking.item->>'roomId' as room_id
        where coalesce(booking.item->>'roomId', '') <> ''
        union
        select detail.item->>'roomId' as room_id
        from jsonb_array_elements(coalesce(booking.item->'roomDetails', '[]'::jsonb)) as detail(item)
        where coalesce(detail.item->>'roomId', '') <> ''
      ) rooms
    )
    select 1
    from manual_rooms
    group by room_id
    having count(*) > 1
  ) then
    raise exception 'A room can only be selected once for this trip';
  end if;

  if exists (
    select 1
    from public.bookings b
    where coalesce(b.season_type, 'haor') = 'haor'
      and b.booking_status in ('pending', 'confirmed', 'checked_in')
      and b.booking_type = 'full_boat'
      and daterange(b.check_in_date, b.check_out_date, '[)') && daterange(new.start_date, new.end_date, '[)')
  ) then
    raise exception 'Full boat is already booked for this trip date';
  end if;

  if exists (
    select 1
    from public.trip_slot_manual_booking_room_ids(new.note) nr
    where exists (
        select 1
        from public.bookings b
        where coalesce(b.season_type, 'haor') = 'haor'
          and b.booking_status in ('pending', 'confirmed', 'checked_in')
          and daterange(b.check_in_date, b.check_out_date, '[)') && daterange(new.start_date, new.end_date, '[)')
          and (
            b.room_id::text = nr.room_id
            or exists (
              select 1
              from jsonb_array_elements(coalesce(b.room_details, '[]'::jsonb)) br
              where br->>'roomId' = nr.room_id
            )
          )
      )
  ) then
    raise exception 'Selected room is already booked for this trip date';
  end if;

  if exists (
    select 1
    from public.trip_slot_manual_booking_room_ids(new.note) nr
    where coalesce(nr.room_id, '') <> ''
      and exists (
        select 1
        from public.trip_slots t
        cross join lateral public.trip_slot_manual_booking_room_ids(t.note) tr
        where t.id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
          and daterange(t.start_date, t.end_date, '[)') && daterange(new.start_date, new.end_date, '[)')
          and tr.room_id = nr.room_id
      )
  ) then
    raise exception 'Selected room is already booked for this trip date';
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists prevent_trip_slot_manual_room_conflicts_trigger on public.trip_slots;
create trigger prevent_trip_slot_manual_room_conflicts_trigger
before insert or update on public.trip_slots
for each row execute function public.prevent_trip_slot_manual_room_conflicts();
