'use client';

import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { assertWritableAdmin } from '@/lib/admin/permissions';
import { demoTableData } from '@/lib/admin/demoData';
import { FLOATBASE_BRAND, normalizeBrandLogoUrl, normalizeBrandName, replaceLegacyBrandText } from '@/lib/branding';
import {
  activeBookingStatuses,
  getBookingRoomIds,
  hasManualTripBookingForRange,
  hasManualTripRoomConflict,
  rangesOverlap,
} from '@/lib/bookingAvailability';
import type {
  AdminTableName,
  AvailabilityBlock,
  BaseRow,
  Booking,
  Customer,
  Expense,
  GalleryImage,
  HouseboatSettings,
  Income,
  Payment,
  Review,
  Room,
  SpecialDate,
  TourPackage,
  TripSlot,
  WebsiteContent,
} from '@/types/database';

export type AdminRow =
  | AvailabilityBlock
  | TripSlot
  | Booking
  | Customer
  | Expense
  | GalleryImage
  | HouseboatSettings
  | Income
  | Payment
  | Review
  | Room
  | SpecialDate
  | TourPackage
  | WebsiteContent
  | (BaseRow & Record<string, unknown>);

const localKey = (table: AdminTableName) => `${FLOATBASE_BRAND.adminStoragePrefix}-${table}`;

const now = () => new Date().toISOString();

function cloneRows<T>(rows: T[]): T[] {
  return JSON.parse(JSON.stringify(rows)) as T[];
}

function getSeedRows<T extends AdminRow>(table: AdminTableName) {
  return cloneRows(((demoTableData as any)[table] || []) as T[]);
}

export function isDemoMode() {
  return !isSupabaseConfigured();
}

export function getLocalRows<T extends AdminRow>(table: AdminTableName) {
  if (typeof window === 'undefined') {
    return getSeedRows<T>(table);
  }

  const existing = window.localStorage.getItem(localKey(table));
  if (existing) {
    return JSON.parse(existing) as T[];
  }

  const seed = getSeedRows<T>(table);
  window.localStorage.setItem(localKey(table), JSON.stringify(seed));
  return seed;
}

export function setLocalRows<T extends AdminRow>(table: AdminTableName, rows: T[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(localKey(table), JSON.stringify(rows));
  }
}

function sortRows<T extends AdminRow>(rows: T[]) {
  return [...rows].sort((a, b) => {
    const aSort = Number('sort_order' in a ? a.sort_order : 0);
    const bSort = Number('sort_order' in b ? b.sort_order : 0);
    if (aSort || bSort) return aSort - bSort;
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });
}

const brandTextFields = [
  'houseboat_name',
  'tagline',
  'description',
  'email',
  'facebook_url',
  'location',
  'address',
  'title',
  'subtitle',
  'content',
  'button_text',
  'button_url',
  'image_url',
  'name',
  'review',
  'note',
  'special_request',
  'admin_note',
  'source_url',
];

function normalizeBrandRow<T extends Partial<AdminRow>>(table: AdminTableName, row: T): T {
  const next = { ...row } as Record<string, unknown>;

  brandTextFields.forEach((field) => {
    if (typeof next[field] === 'string') {
      next[field] = replaceLegacyBrandText(next[field] as string);
    }
  });

  ['facilities', 'included_services', 'route_spots'].forEach((field) => {
    if (Array.isArray(next[field])) {
      next[field] = (next[field] as unknown[]).map((item) =>
        typeof item === 'string' ? replaceLegacyBrandText(item) : item
      );
    }
  });

  if (table === 'houseboat_settings') {
    next.houseboat_name = normalizeBrandName(String(next.houseboat_name || ''));
    next.logo_url = normalizeBrandLogoUrl(String(next.logo_url || ''));
  }

  return next as T;
}

function normalizeBrandRows<T extends AdminRow>(table: AdminTableName, rows: T[]) {
  return rows.map((row) => normalizeBrandRow(table, row));
}

function notifyPublicDataChanged(table: AdminTableName) {
  if (typeof window === 'undefined') return;
  const dashboardTables: AdminTableName[] = [
    'bookings',
    'payments',
    'income',
    'expenses',
    'trip_slots',
    'customers',
    'rooms',
    'availability_blocks',
  ];
  if (!dashboardTables.includes(table)) return;
  window.dispatchEvent(new Event('floatboat-public-data-change'));
}

async function getAdminAccessToken() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client is not configured');
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error('Admin session expired. Please login again.');
  }

  return data.session.access_token;
}

async function adminJsonRequest<T>(path: string, init: RequestInit = {}) {
  const token = await getAdminAccessToken();
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, {
    ...init,
    headers,
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Admin request failed');
  }
  return result as T;
}

export async function listRows<T extends AdminRow>(table: AdminTableName) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return sortRows(normalizeBrandRows(table, getLocalRows<T>(table)));
  }

  const result = await adminJsonRequest<{ rows: T[] }>(`/api/admin/data/${table}`);
  return sortRows(normalizeBrandRows(table, result.rows || []));
}

export async function saveRow<T extends AdminRow>(table: AdminTableName, row: Partial<T> & { id?: string }) {
  assertWritableAdmin(table);
  const timestamp = now();
  const normalizedRow = normalizeBrandRow(table, row);
  const payload = {
    ...normalizedRow,
    updated_at: timestamp,
    created_at: normalizedRow.created_at || timestamp,
  };
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    const rows = getLocalRows<T>(table);
    const nextRow = {
      ...payload,
      id: row.id || crypto.randomUUID(),
    } as T;
    const nextRows = row.id
      ? rows.map((item) => (item.id === row.id ? { ...item, ...nextRow } : item))
      : [nextRow, ...rows];
    setLocalRows(table, nextRows);
    notifyPublicDataChanged(table);
    return nextRow;
  }

  const result = await adminJsonRequest<{ row: T }>(`/api/admin/data/${table}`, {
    method: 'POST',
    body: JSON.stringify({ row: payload }),
  });
  notifyPublicDataChanged(table);
  return result.row;
}

export async function deleteRow(table: AdminTableName, id: string) {
  assertWritableAdmin(table);
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    const rows = getLocalRows(table).filter((row) => row.id !== id);
    setLocalRows(table, rows);
    notifyPublicDataChanged(table);
    return;
  }

  await adminJsonRequest(`/api/admin/data/${table}?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  notifyPublicDataChanged(table);
}

export function generateBookingCode() {
  const date = new Date();
  const datePart = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const suffix = Math.floor(100 + Math.random() * 900);
  return `FLB-${datePart}-${suffix}`;
}

export { rangesOverlap };

export function hasBookingConflict(candidate: Partial<Booking>, bookings: Booking[], tripSlots: TripSlot[] = []) {
  if ((candidate.season_type || 'haor') === 'padma') {
    if (!candidate.event_date || !candidate.event_slot) return false;
    return bookings.some((booking) => {
      if (booking.id === candidate.id) return false;
      if ((booking.season_type || 'haor') !== 'padma') return false;
      if (!activeBookingStatuses.includes(booking.booking_status)) return false;
      if ((booking.event_date || booking.check_in_date) !== candidate.event_date) return false;
      return booking.event_slot === candidate.event_slot || booking.event_slot === 'full_day' || candidate.event_slot === 'full_day';
    });
  }

  if (!candidate.check_in_date || !candidate.check_out_date) return false;

  return bookings.some((booking) => {
    if (booking.id === candidate.id) return false;
    if ((booking.season_type || 'haor') !== 'haor') return false;
    if (!activeBookingStatuses.includes(booking.booking_status)) return false;
    if (!rangesOverlap(candidate.check_in_date!, candidate.check_out_date!, booking.check_in_date, booking.check_out_date)) {
      return false;
    }

    if (candidate.booking_type === 'full_boat' || booking.booking_type === 'full_boat') {
      return true;
    }

    const candidateRoomIds = getBookingRoomIds(candidate);
    const bookedRoomIds = getBookingRoomIds(booking);
    return Array.from(candidateRoomIds).some((roomId) => bookedRoomIds.has(roomId));
  }) || (
    candidate.booking_type === 'full_boat'
      ? hasManualTripBookingForRange(tripSlots, candidate.check_in_date, candidate.check_out_date)
      : hasManualTripRoomConflict(
          getBookingRoomIds(candidate),
          tripSlots,
          candidate.check_in_date,
          candidate.check_out_date
        )
  );
}

export async function saveBookingWithCustomer(
  values: Partial<Booking> & { customer_name: string; phone: string; email?: string },
  existingBookingId?: string
) {
  const customers = await listRows<Customer>('customers');
  const foundCustomer = customers.find((customer) => customer.phone === values.phone);
  const customer = await saveRow<Customer>('customers', {
    id: foundCustomer?.id,
    full_name: values.customer_name,
    phone: values.phone,
    email: values.email || foundCustomer?.email || null,
    address: foundCustomer?.address || '',
    note: foundCustomer?.note || '',
  });
  const totalAmount = Number(values.total_amount || 0);
  const subtotalAmount = Number(values.subtotal_amount ?? totalAmount);
  const discountAmount = Number(values.discount_amount || 0);
  const advanceAmount = Number(values.advance_amount || 0);
  const dueAmount = Math.max(totalAmount - advanceAmount, 0);
  const paymentStatus = totalAmount <= 0 || advanceAmount <= 0
    ? 'unpaid'
    : advanceAmount >= totalAmount
      ? 'paid'
      : 'partially_paid';

  return saveRow<Booking>('bookings', {
    id: existingBookingId,
    booking_code: values.booking_code || generateBookingCode(),
    customer_id: customer.id,
    booking_type: values.booking_type || 'cabin_wise',
    room_id: values.booking_type === 'full_boat' ? null : values.room_id || null,
    room_details: values.booking_type === 'full_boat' ? null : values.room_details || null,
    package_id: values.package_id || null,
    check_in_date: values.check_in_date!,
    check_out_date: values.check_out_date!,
    number_of_guests: Number(values.number_of_guests || 1),
    subtotal_amount: subtotalAmount,
    discount_amount: discountAmount,
    discount_reason: values.discount_reason || null,
    total_amount: totalAmount,
    advance_amount: advanceAmount,
    due_amount: dueAmount,
    payment_status: values.payment_status || paymentStatus,
    booking_status: values.booking_status || 'pending',
    special_request: values.special_request || '',
    admin_note: values.admin_note || '',
    season_type: values.season_type || 'haor',
    event_type: values.event_type || null,
    event_slot: values.event_slot || null,
    event_date: values.event_date || null,
    event_start_time: values.event_start_time || null,
    event_end_time: values.event_end_time || null,
    food_package: values.food_package || null,
    decoration_required: Boolean(values.decoration_required),
    sound_system_required: Boolean(values.sound_system_required),
    payment_method: values.payment_method || null,
    transaction_id: values.transaction_id || null,
    trip_slot_id: values.trip_slot_id || null,
  });
}

export async function recordPayment(values: Partial<Payment>) {
  const payment = await saveRow<Payment>('payments', {
    id: values.id,
    booking_id: values.booking_id!,
    amount: Number(values.amount || 0),
    payment_method: values.payment_method || 'cash',
    transaction_id: values.transaction_id || '',
    payment_date: values.payment_date || new Date().toISOString().slice(0, 10),
    note: values.note || '',
  });
  const bookings = await listRows<Booking>('bookings');
  const booking = bookings.find((item) => item.id === values.booking_id);
  if (booking) {
    const payments = await listRows<Payment>('payments');
    const paid = payments
      .filter((item) => item.booking_id === booking.id)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const due = Math.max(Number(booking.total_amount || 0) - paid, 0);
    await saveRow<Booking>('bookings', {
      ...booking,
      advance_amount: paid,
      due_amount: due,
      payment_status: paid <= 0 ? 'unpaid' : due <= 0 ? 'paid' : 'partially_paid',
    });
    if (!values.id) {
      await saveRow<Income>('income', {
        booking_id: booking.id,
        title: `Payment ${booking.booking_code}`,
        category: 'booking',
        amount: Number(values.amount || 0),
        income_date: values.payment_date || new Date().toISOString().slice(0, 10),
        note: values.note || '',
      });
    }
  }
  return payment;
}

export async function fetchAdminDataset() {
  const [
    settings,
    rooms,
    packages,
    customers,
    bookings,
    payments,
    income,
    expenses,
    availability,
    gallery,
    content,
    trip_slots,
    special_dates,
  ] = await Promise.all([
    listRows<HouseboatSettings>('houseboat_settings'),
    listRows<Room>('rooms'),
    listRows<TourPackage>('packages'),
    listRows<Customer>('customers'),
    listRows<Booking>('bookings'),
    listRows<Payment>('payments'),
    listRows<Income>('income'),
    listRows<Expense>('expenses'),
    listRows<AvailabilityBlock>('availability_blocks'),
    listRows<GalleryImage>('gallery'),
    listRows<WebsiteContent>('website_content'),
    listRows<TripSlot>('trip_slots'),
    listRows<SpecialDate>('special_dates'),
  ]);

  return {
    settings,
    rooms,
    packages,
    customers,
    bookings,
    payments,
    income,
    expenses,
    availability,
    gallery,
    content,
    trip_slots,
    special_dates,
  };
}
