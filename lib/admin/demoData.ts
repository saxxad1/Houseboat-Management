import { cabins, galleryImages, packages, siteConfig } from '@/data/houseboatData';
import type {
  AvailabilityBlock,
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
  WebsiteContent,
} from '@/types/database';

const now = new Date().toISOString();

const id = (prefix: string, index: number) => `${prefix}-${String(index).padStart(3, '0')}`;

export const demoSettings: HouseboatSettings = {
  id: 'settings-001',
  houseboat_name: 'FloatBoat',
  tagline: 'An Aesthetic Water Villa',
  description: siteConfig.description,
  phone: siteConfig.phone,
  whatsapp: siteConfig.whatsapp,
  email: siteConfig.email,
  facebook_url: siteConfig.facebook,
  location: siteConfig.location,
  address: 'Anwarpur Ghat, Sunamganj',
  bkash_number: '',
  nagad_number: '',
  bank_info: '',
  padma_price_per_person: 0,
  primary_color: '#075985',
  secondary_color: '#f59e0b',
  logo_url: '/logo-floatboat.svg',
  active_season: 'haor',
  season_updated_at: now,
  created_at: now,
  updated_at: now,
};

export const demoRooms: Room[] = cabins.map((room, index) => ({
  id: id('room', index + 1),
  name: room.name,
  slug: room.nameEn.toLowerCase().replace(/\s+/g, '-'),
  description: room.features.join(', '),
  image_url: room.image,
  bed_type: room.bedType,
  capacity: room.capacity,
  price_per_night: parseInt((room.mainPrice || '0').replace(/\D/g, ''), 10) || 10000,
  has_attached_washroom: room.bath === 'Private Bath',
  has_ac: room.ac !== 'Non-AC',
  facilities: room.features,
  status: room.available ? 'active' : 'inactive',
  sort_order: index + 1,
  season_type: 'haor',
  display_mode: 'cabin',
  created_at: now,
  updated_at: now,
}));

export const demoPackages: TourPackage[] = packages.map((pkg, index) => ({
  id: id('package', index + 1),
  title: pkg.title,
  slug: pkg.titleEn.toLowerCase().replace(/\s+/g, '-'),
  description: pkg.includes.join(', '),
  duration: pkg.duration,
  price: pkg.price,
  max_guests: pkg.maxGuests,
  included_services: pkg.includes,
  meal_info: pkg.meals,
  route_spots: pkg.spots,
  image_url: '',
  status: 'active',
  sort_order: index + 1,
  season_type: 'haor',
  suggested_time: null,
  best_for: null,
  created_at: now,
  updated_at: now,
}));

export const demoCustomers: Customer[] = [
  {
    id: 'customer-001',
    full_name: 'Rafiul Islam',
    phone: '01700000001',
    email: 'rafiul@example.com',
    address: 'Dhaka',
    note: 'Family tour lead',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'customer-002',
    full_name: 'Sumaiya Khan',
    phone: '01700000002',
    email: 'sumaiya@example.com',
    address: 'Chattogram',
    note: 'Corporate group',
    created_at: now,
    updated_at: now,
  },
];

export const demoBookings: Booking[] = [
  {
    id: 'booking-001',
    booking_code: 'FLB-260521-001',
    customer_id: 'customer-001',
    booking_type: 'cabin_wise',
    room_id: 'room-001',
    package_id: 'package-001',
    check_in_date: '2026-05-25',
    check_out_date: '2026-05-26',
    number_of_guests: 2,
    total_amount: 8500,
    advance_amount: 3000,
    due_amount: 5500,
    payment_status: 'partially_paid',
    booking_status: 'confirmed',
    special_request: 'Birthday decoration',
    admin_note: '',
    season_type: 'haor',
    created_at: now,
    updated_at: now,
  },
  {
    id: 'booking-002',
    booking_code: 'FLB-260521-002',
    customer_id: 'customer-002',
    booking_type: 'full_boat',
    room_id: null,
    package_id: 'package-002',
    check_in_date: '2026-06-04',
    check_out_date: '2026-06-06',
    number_of_guests: 18,
    total_amount: 140000,
    advance_amount: 0,
    due_amount: 140000,
    payment_status: 'unpaid',
    booking_status: 'pending',
    special_request: '',
    admin_note: 'Need confirmation call',
    season_type: 'haor',
    created_at: now,
    updated_at: now,
  },
];

export const demoPayments: Payment[] = [
  {
    id: 'payment-001',
    booking_id: 'booking-001',
    amount: 3000,
    payment_method: 'bkash',
    transaction_id: 'DEMO12345',
    payment_date: '2026-05-21',
    note: 'Advance',
    created_at: now,
    updated_at: now,
  },
];

export const demoIncome: Income[] = [
  {
    id: 'income-001',
    booking_id: 'booking-001',
    title: 'Booking advance',
    category: 'booking',
    amount: 3000,
    income_date: '2026-05-21',
    note: '',
    created_at: now,
    updated_at: now,
  },
];

export const demoExpenses: Expense[] = [
  {
    id: 'expense-001',
    title: 'Kitchen supplies',
    category: 'food',
    amount: 1800,
    expense_date: '2026-05-21',
    vendor_name: 'Local market',
    note: '',
    created_at: now,
    updated_at: now,
  },
];

export const demoAvailabilityBlocks: AvailabilityBlock[] = [
  {
    id: 'availability-001',
    date: '2026-05-30',
    room_id: null,
    status: 'maintenance',
    reason: 'Generator service',
    note: '',
    created_at: now,
    updated_at: now,
  },
];

export const demoGallery: GalleryImage[] = galleryImages.map((image, index) => ({
  id: id('gallery', index + 1),
  title: image.alt,
  image_url: image.src,
  category: image.category,
  sort_order: index + 1,
  is_featured: index < 3,
  created_at: now,
  updated_at: now,
}));

export const demoWebsiteContent: WebsiteContent[] = [
  {
    id: 'content-hero',
    section_key: 'hero',
    title: 'FloatBoat',
    subtitle: 'An Aesthetic Water Villa',
    content: siteConfig.description,
    image_url: '',
    button_text: 'Book Now',
    button_url: '#booking',
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'content-about',
    section_key: 'about',
    title: 'About FloatBoat',
    subtitle: 'Welcome to Tanguar Haor',
    content: 'An aesthetic houseboat experience, perfect for family and group tours.',
    image_url: '',
    button_text: '',
    button_url: '',
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];

export const demoReviews: Review[] = [
  {
    id: 'review-001',
    name: 'Sumaiya Khan',
    location: 'Dhaka',
    rating: 5,
    review: 'Beautiful houseboat, clean cabins, and very helpful team.',
    avatar: 'SK',
    is_published: true,
    source: 'manual',
    external_id: null,
    source_url: null,
    external_created_at: null,
    is_featured: false,
    created_at: now,
    updated_at: now,
  },
];

export const demoSpecialDates: SpecialDate[] = [
  {
    id: 'special-date-001',
    date: '2026-06-01',
    title: 'Demo public holiday',
    date_type: 'public_holiday',
    is_discount_excluded: true,
    is_active: true,
    note: 'Add full moon and government holidays here.',
    created_at: now,
    updated_at: now,
  },
];

export const demoTableData = {
  admin_profiles: [],
  houseboat_settings: [demoSettings],
  rooms: demoRooms,
  packages: demoPackages,
  customers: demoCustomers,
  bookings: demoBookings,
  payments: demoPayments,
  income: demoIncome,
  expenses: demoExpenses,
  availability_blocks: demoAvailabilityBlocks,
  trip_slots: [],
  special_dates: demoSpecialDates,
  gallery: demoGallery,
  website_content: demoWebsiteContent,
  reviews: demoReviews,
};
