'use client';

import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { demoTableData } from '@/lib/admin/demoData';
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
  Room,
  TourPackage,
  WebsiteContent,
} from '@/types/database';

export type AdminRow =
  | AvailabilityBlock
  | Booking
  | Customer
  | Expense
  | GalleryImage
  | HouseboatSettings
  | Income
  | Payment
  | Room
  | TourPackage
  | WebsiteContent
  | (BaseRow & Record<string, unknown>);

const localKey = (table: AdminTableName) => `kuhelika-admin-${table}`;

const now = () => new Date().toISOString();

function cloneRows<T>(rows: T[]): T[] {
  return JSON.parse(JSON.stringify(rows)) as T[];
}

function getSeedRows<T extends AdminRow>(table: AdminTableName) {
  return cloneRows((demoTableData[table] || []) as T[]);
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

export async function listRows<T extends AdminRow>(table: AdminTableName) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return sortRows(getLocalRows<T>(table));
  }

  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return sortRows((data || []) as T[]);
}

export async function saveRow<T extends AdminRow>(table: AdminTableName, row: Partial<T> & { id?: string }) {
  const timestamp = now();
  const payload = {
    ...row,
    updated_at: timestamp,
    created_at: row.created_at || timestamp,
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
    return nextRow;
  }

  if (row.id) {
    const { data, error } = await supabase.from(table).update(payload as never).eq('id', row.id).select().single();
    if (error) throw error;
    return data as T;
  }

  const { data, error } = await supabase.from(table).insert(payload as never).select().single();
  if (error) throw error;
  return data as T;
}

export async function deleteRow(table: AdminTableName, id: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    const rows = getLocalRows(table).filter((row) => row.id !== id);
    setLocalRows(table, rows);
    return;
  }

  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

export function generateBookingCode() {
  const date = new Date();
  const datePart = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const suffix = Math.floor(100 + Math.random() * 900);
  return `KHL-${datePart}-${suffix}`;
}

export function rangesOverlap(startA: string, endA: string, startB: string, endB: string) {
  return startA < endB && startB < endA;
}

export function hasBookingConflict(candidate: Partial<Booking>, bookings: Booking[]) {
  const activeStatuses = ['pending', 'confirmed', 'checked_in'];
  if ((candidate.season_type || 'haor') === 'padma') {
    if (!candidate.event_date || !candidate.event_slot) return false;
    return bookings.some((booking) => {
      if (booking.id === candidate.id) return false;
      if ((booking.season_type || 'haor') !== 'padma') return false;
      if (!activeStatuses.includes(booking.booking_status)) return false;
      if ((booking.event_date || booking.check_in_date) !== candidate.event_date) return false;
      return booking.event_slot === candidate.event_slot || booking.event_slot === 'full_day' || candidate.event_slot === 'full_day';
    });
  }

  if (!candidate.check_in_date || !candidate.check_out_date) return false;

  return bookings.some((booking) => {
    if (booking.id === candidate.id) return false;
    if ((booking.season_type || 'haor') !== 'haor') return false;
    if (!activeStatuses.includes(booking.booking_status)) return false;
    if (!rangesOverlap(candidate.check_in_date!, candidate.check_out_date!, booking.check_in_date, booking.check_out_date)) {
      return false;
    }

    if (candidate.booking_type === 'full_boat' || booking.booking_type === 'full_boat') {
      return true;
    }

    return Boolean(candidate.room_id && booking.room_id && candidate.room_id === booking.room_id);
  });
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
    package_id: values.package_id || null,
    check_in_date: values.check_in_date!,
    check_out_date: values.check_out_date!,
    number_of_guests: Number(values.number_of_guests || 1),
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
  };
}
