export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AdminRole = 'admin' | 'manager';
export type RoomStatus = 'active' | 'inactive' | 'maintenance';
export type PackageStatus = 'active' | 'inactive';
export type BookingType = 'full_boat' | 'cabin_wise';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';
export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'bank' | 'other';
export type IncomeCategory = 'booking' | 'food' | 'extra_guest' | 'bbq' | 'transport' | 'service' | 'other';
export type ExpenseCategory = 'food' | 'staff_salary' | 'fuel' | 'maintenance' | 'cleaning' | 'transport' | 'marketing' | 'commission' | 'utility' | 'other';
export type AvailabilityStatus = 'available' | 'partially_booked' | 'fully_booked' | 'blocked' | 'maintenance';
export type SeasonType = 'haor' | 'padma';
export type DisplayMode = 'cabin' | 'event_space';
export type EventSlot = 'morning' | 'afternoon' | 'evening' | 'moonlight' | 'full_day' | 'custom';
export type EventSlotStatus = 'available' | 'inquiry_pending' | 'booked' | 'blocked' | 'maintenance';

export interface BaseRow {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile extends BaseRow {
  user_id: string;
  full_name: string;
  role: AdminRole;
  phone: string | null;
}

export interface HouseboatSettings extends BaseRow {
  houseboat_name: string;
  tagline: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  facebook_url: string | null;
  location: string | null;
  address: string | null;
  bkash_number: string | null;
  nagad_number: string | null;
  bank_info: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  active_season?: SeasonType | null;
  season_updated_at?: string | null;
}

export interface Room extends BaseRow {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  bed_type: string | null;
  capacity: number;
  price_per_night: number;
  has_attached_washroom: boolean;
  has_ac: boolean;
  facilities: string[];
  status: RoomStatus;
  sort_order: number;
  season_type?: SeasonType;
  display_mode?: DisplayMode;
}

export interface TourPackage extends BaseRow {
  title: string;
  slug: string;
  description: string | null;
  duration: string | null;
  price: number;
  max_guests: number;
  included_services: string[];
  meal_info: string | null;
  route_spots: string[];
  image_url: string | null;
  status: PackageStatus;
  sort_order: number;
  season_type?: SeasonType;
  suggested_time?: string | null;
  best_for?: string | null;
}

export interface Customer extends BaseRow {
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  note: string | null;
}

export interface Booking extends BaseRow {
  booking_code: string;
  customer_id: string | null;
  booking_type: BookingType;
  room_id: string | null;
  package_id: string | null;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  total_amount: number;
  advance_amount: number;
  due_amount: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  special_request: string | null;
  admin_note: string | null;
  season_type?: SeasonType;
  event_type?: string | null;
  event_slot?: EventSlot | string | null;
  event_date?: string | null;
  event_start_time?: string | null;
  event_end_time?: string | null;
  food_package?: string | null;
  decoration_required?: boolean;
  sound_system_required?: boolean;
  payment_method?: PaymentMethod | null;
}

export interface Payment extends BaseRow {
  booking_id: string;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id: string | null;
  payment_date: string;
  note: string | null;
}

export interface Income extends BaseRow {
  booking_id: string | null;
  title: string;
  category: IncomeCategory;
  amount: number;
  income_date: string;
  note: string | null;
}

export interface Expense extends BaseRow {
  title: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  vendor_name: string | null;
  note: string | null;
}

export interface AvailabilityBlock extends BaseRow {
  date: string;
  room_id: string | null;
  status: AvailabilityStatus;
  reason: string | null;
  note: string | null;
  season_type?: SeasonType;
  event_slot?: EventSlot | string | null;
  slot_status?: EventSlotStatus | null;
}

export interface GalleryImage extends BaseRow {
  title: string | null;
  image_url: string;
  category: string | null;
  sort_order: number;
  is_featured: boolean;
}

export interface WebsiteContent extends BaseRow {
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  button_text: string | null;
  button_url: string | null;
  is_active: boolean;
}

export type AdminTableName =
  | 'admin_profiles'
  | 'houseboat_settings'
  | 'rooms'
  | 'packages'
  | 'customers'
  | 'bookings'
  | 'payments'
  | 'income'
  | 'expenses'
  | 'availability_blocks'
  | 'gallery'
  | 'website_content';

export interface Database {
  public: {
    Tables: {
      admin_profiles: { Row: AdminProfile; Insert: Partial<AdminProfile>; Update: Partial<AdminProfile> };
      houseboat_settings: { Row: HouseboatSettings; Insert: Partial<HouseboatSettings>; Update: Partial<HouseboatSettings> };
      rooms: { Row: Room; Insert: Partial<Room>; Update: Partial<Room> };
      packages: { Row: TourPackage; Insert: Partial<TourPackage>; Update: Partial<TourPackage> };
      customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer> };
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> };
      income: { Row: Income; Insert: Partial<Income>; Update: Partial<Income> };
      expenses: { Row: Expense; Insert: Partial<Expense>; Update: Partial<Expense> };
      availability_blocks: { Row: AvailabilityBlock; Insert: Partial<AvailabilityBlock>; Update: Partial<AvailabilityBlock> };
      gallery: { Row: GalleryImage; Insert: Partial<GalleryImage>; Update: Partial<GalleryImage> };
      website_content: { Row: WebsiteContent; Insert: Partial<WebsiteContent>; Update: Partial<WebsiteContent> };
    };
  };
}
