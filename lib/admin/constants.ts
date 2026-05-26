import {
  BarChart3,
  BedDouble,
  CalendarDays,
  Camera,
  CreditCard,
  FileBarChart,
  Home,
  Image,
  LayoutDashboard,
  Package,
  ReceiptText,
  Settings,
  Star,
  ToggleLeft,
  Users,
  Wallet,
} from 'lucide-react';

export const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', labelBn: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', labelBn: 'Bookings', icon: CalendarDays },
  { href: '/admin/availability', label: 'Availability', labelBn: 'Booking Calendar', icon: Home },
  { href: '/admin/trips', label: 'Trips', labelBn: 'Trips', icon: Package },
  { href: '/admin/rooms', label: 'Rooms/Cabins', labelBn: 'Rooms/Cabins', icon: BedDouble },
  { href: '/admin/packages', label: 'Packages', labelBn: 'Packages', icon: Package },
  { href: '/admin/customers', label: 'Customers', labelBn: 'Customers', icon: Users },
  { href: '/admin/payments', label: 'Payments', labelBn: 'Payments', icon: CreditCard },
  { href: '/admin/income', label: 'Income', labelBn: 'Income', icon: Wallet },
  { href: '/admin/expenses', label: 'Expenses', labelBn: 'Expenses', icon: ReceiptText },
  { href: '/admin/reports', label: 'Reports', labelBn: 'Reports', icon: FileBarChart },
  { href: '/admin/gallery', label: 'Gallery', labelBn: 'Gallery', icon: Camera },
  { href: '/admin/content', label: 'Website Content', labelBn: 'Website Content', icon: Image },
  { href: '/admin/reviews', label: 'Reviews', labelBn: 'Reviews', icon: Star },
  { href: '/admin/season-settings', label: 'Season Mode', labelBn: 'Season Mode', icon: ToggleLeft },
  { href: '/admin/settings', label: 'Settings', labelBn: 'Settings', icon: Settings },
];

export const bookingStatusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked-in',
  checked_out: 'Checked-out',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const paymentStatusLabels: Record<string, string> = {
  unpaid: 'Unpaid',
  partially_paid: 'Partial',
  paid: 'Paid',
  refunded: 'Refunded',
};

export const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-50 text-slate-600 border-slate-200',
  maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  haor: 'bg-sky-50 text-sky-700 border-sky-200',
  padma: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  cabin: 'bg-slate-50 text-slate-700 border-slate-200',
  event_space: 'bg-violet-50 text-violet-700 border-violet-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
  checked_in: 'bg-violet-50 text-violet-700 border-violet-200',
  checked_out: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  unpaid: 'bg-red-50 text-red-700 border-red-200',
  partially_paid: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  refunded: 'bg-slate-50 text-slate-600 border-slate-200',
  available: 'bg-emerald-100 text-emerald-800',
  inquiry_pending: 'bg-amber-100 text-amber-800',
  booked: 'bg-red-100 text-red-800',
  partially_booked: 'bg-amber-100 text-amber-800',
  fully_booked: 'bg-red-100 text-red-800',
  blocked: 'bg-slate-200 text-slate-700',
};

export const paymentMethods = [
  { value: 'cash', label: 'Cash' },
  { value: 'bkash', label: 'bKash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'bank', label: 'Bank' },
  { value: 'other', label: 'Other' },
];

export const incomeCategories = ['booking', 'food', 'extra_guest', 'bbq', 'transport', 'service', 'other'];
export const expenseCategories = ['food', 'staff_salary', 'fuel', 'maintenance', 'cleaning', 'transport', 'marketing', 'commission', 'utility', 'other'];

export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'BDT',
  maximumFractionDigits: 0,
});

export const chartColors = {
  income: '#059669',
  expense: '#dc2626',
  bookings: '#0284c7',
  pending: '#d97706',
};

export const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': { title: 'Dashboard', subtitle: 'Today\'s status, income-expenses, and bookings at a glance' },
  '/admin/bookings': { title: 'Booking Management', subtitle: 'New bookings, status, payments, and customer info' },
  '/admin/availability': { title: 'Booking Calendar', subtitle: 'See which cabins are available or booked on specific dates' },
  '/admin/trips': { title: 'Trips Management', subtitle: 'Manage trip slots, income, expenses, and profit' },
  '/admin/rooms': { title: 'Rooms/Cabins', subtitle: 'Manage cabins, prices, capacity, and facilities' },
  '/admin/packages': { title: 'Packages', subtitle: 'Manage tour packages, prices, and included services' },
  '/admin/customers': { title: 'Customers', subtitle: 'Customer list and booking history' },
  '/admin/payments': { title: 'Payments', subtitle: 'Track advances, dues, and transactions' },
  '/admin/income': { title: 'Income', subtitle: 'Accounting for bookings and other income' },
  '/admin/expenses': { title: 'Expenses', subtitle: 'Food, staff, fuel, maintenance, and all other expenses' },
  '/admin/reports': { title: 'Reports', subtitle: 'Income-expense, profit, due payments, and booking reports' },
  '/admin/gallery': { title: 'Gallery', subtitle: 'Upload and arrange website images' },
  '/admin/content': { title: 'Website Content', subtitle: 'Hero, About, FAQ, CTA, and other texts' },
  '/admin/reviews': { title: 'Reviews', subtitle: 'Add, edit, and delete guest reviews' },
  '/admin/season-settings': { title: 'Season Mode', subtitle: 'Activate Haor season or Padma event season' },
  '/admin/settings': { title: 'Settings', subtitle: 'Brand, contact, payment, and color settings' },
};

export const dashboardMetricIcons = {
  bookings: BarChart3,
  pending: CalendarDays,
  confirmed: CalendarDays,
  money: Wallet,
  rooms: BedDouble,
};

