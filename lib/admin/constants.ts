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
  ToggleLeft,
  Users,
  Wallet,
} from 'lucide-react';

export const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', labelBn: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', labelBn: 'বুকিং', icon: CalendarDays },
  { href: '/admin/availability', label: 'Availability', labelBn: 'উপলব্ধতা', icon: Home },
  { href: '/admin/rooms', label: 'Rooms/Cabins', labelBn: 'রুম/কেবিন', icon: BedDouble },
  { href: '/admin/packages', label: 'Packages', labelBn: 'প্যাকেজ', icon: Package },
  { href: '/admin/customers', label: 'Customers', labelBn: 'কাস্টমার', icon: Users },
  { href: '/admin/payments', label: 'Payments', labelBn: 'পেমেন্ট', icon: CreditCard },
  { href: '/admin/income', label: 'Income', labelBn: 'আয়', icon: Wallet },
  { href: '/admin/expenses', label: 'Expenses', labelBn: 'খরচ', icon: ReceiptText },
  { href: '/admin/reports', label: 'Reports', labelBn: 'রিপোর্ট', icon: FileBarChart },
  { href: '/admin/gallery', label: 'Gallery', labelBn: 'গ্যালারি', icon: Camera },
  { href: '/admin/content', label: 'Website Content', labelBn: 'ওয়েবসাইট কনটেন্ট', icon: Image },
  { href: '/admin/season-settings', label: 'Season Mode', labelBn: 'সিজন মোড', icon: ToggleLeft },
  { href: '/admin/settings', label: 'Settings', labelBn: 'সেটিংস', icon: Settings },
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

export const currencyFormatter = new Intl.NumberFormat('bn-BD', {
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
  '/admin/dashboard': { title: 'ড্যাশবোর্ড', subtitle: 'আজকের অবস্থা, আয়-খরচ ও বুকিং এক নজরে' },
  '/admin/bookings': { title: 'বুকিং ম্যানেজমেন্ট', subtitle: 'নতুন বুকিং, স্ট্যাটাস, পেমেন্ট ও কাস্টমার তথ্য' },
  '/admin/availability': { title: 'তারিখ ও উপলব্ধতা', subtitle: 'কোন তারিখে কোন কেবিন খালি বা বুকড দেখুন' },
  '/admin/rooms': { title: 'রুম/কেবিন', subtitle: 'কেবিন, দাম, ক্যাপাসিটি ও সুবিধা ম্যানেজ করুন' },
  '/admin/packages': { title: 'প্যাকেজ', subtitle: 'ভ্রমণ প্যাকেজ, দাম ও অন্তর্ভুক্ত সেবা ম্যানেজ করুন' },
  '/admin/customers': { title: 'কাস্টমার', subtitle: 'কাস্টমার তালিকা ও বুকিং ইতিহাস' },
  '/admin/payments': { title: 'পেমেন্ট', subtitle: 'অগ্রিম, বাকি ও ট্রানজেকশন ট্র্যাক করুন' },
  '/admin/income': { title: 'আয়', subtitle: 'বুকিং ও অন্যান্য আয়ের হিসাব' },
  '/admin/expenses': { title: 'খরচ', subtitle: 'খাবার, স্টাফ, জ্বালানি, মেইনটেন্যান্সসহ সব খরচ' },
  '/admin/reports': { title: 'রিপোর্ট', subtitle: 'আয়-খরচ, লাভ, বাকি পেমেন্ট ও বুকিং রিপোর্ট' },
  '/admin/gallery': { title: 'গ্যালারি', subtitle: 'ওয়েবসাইটের ছবি আপলোড ও সাজান' },
  '/admin/content': { title: 'ওয়েবসাইট কনটেন্ট', subtitle: 'Hero, About, FAQ, CTA ও অন্যান্য টেক্সট' },
  '/admin/season-settings': { title: 'সিজন মোড', subtitle: 'হাওর সিজন বা পদ্মা ইভেন্ট সিজন সক্রিয় করুন' },
  '/admin/settings': { title: 'সেটিংস', subtitle: 'ব্র্যান্ড, কন্ট্যাক্ট, পেমেন্ট ও রঙের সেটিংস' },
};

export const dashboardMetricIcons = {
  bookings: BarChart3,
  pending: CalendarDays,
  confirmed: CalendarDays,
  money: Wallet,
  rooms: BedDouble,
};
