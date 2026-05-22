'use client';

import AdminResourcePage from '@/components/admin/AdminResourcePage';
import { expenseCategories, incomeCategories, paymentMethods } from '@/lib/admin/constants';

const yesNoStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'maintenance', label: 'Maintenance' },
];

export function RoomsAdminPage() {
  return (
    <AdminResourcePage
      table="rooms"
      title="রুম/কেবিন তালিকা"
      description="কেবিনের ছবি, দাম, ক্যাপাসিটি, AC ও washroom সুবিধা ম্যানেজ করুন।"
      addLabel="নতুন কেবিন"
      storageFolder="rooms"
      searchKeys={['name', 'slug', 'bed_type']}
      columns={[
        { key: 'image_url', label: 'Image', type: 'image' },
        { key: 'season_type', label: 'Season', type: 'status' },
        { key: 'name', label: 'Name' },
        { key: 'capacity', label: 'Capacity' },
        { key: 'price_per_night', label: 'Price', type: 'money' },
        { key: 'has_ac', label: 'AC', type: 'boolean' },
        { key: 'has_attached_washroom', label: 'Washroom', type: 'boolean' },
        { key: 'status', label: 'Status', type: 'status' },
      ]}
      fields={[
        { name: 'name', label: 'Room name', required: true },
        { name: 'slug', label: 'Slug', required: true },
        { name: 'season_type', label: 'Season', type: 'select', options: [{ value: 'haor', label: 'Haor cabin' }, { value: 'padma', label: 'Padma event space' }] },
        { name: 'display_mode', label: 'Display mode', type: 'select', options: [{ value: 'cabin', label: 'Cabin' }, { value: 'event_space', label: 'Event space' }] },
        { name: 'image_url', label: 'Room image', type: 'image', colSpan: 'full' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'bed_type', label: 'Bed type' },
        { name: 'capacity', label: 'Capacity', type: 'number' },
        { name: 'price_per_night', label: 'Price / starting quote', type: 'number' },
        { name: 'has_ac', label: 'AC available', type: 'boolean' },
        { name: 'has_attached_washroom', label: 'Attached washroom', type: 'boolean' },
        { name: 'facilities', label: 'Facilities (comma separated)', type: 'tags', colSpan: 'full' },
        { name: 'status', label: 'Status', type: 'select', options: yesNoStatuses },
        { name: 'sort_order', label: 'Sort order', type: 'number' },
      ]}
    />
  );
}

export function PackagesAdminPage() {
  return (
    <AdminResourcePage
      table="packages"
      title="প্যাকেজ তালিকা"
      description="ভ্রমণ প্যাকেজ, সেবা, খাবার, রুট ও দাম ম্যানেজ করুন।"
      addLabel="নতুন প্যাকেজ"
      storageFolder="packages"
      searchKeys={['title', 'duration', 'meal_info']}
      columns={[
        { key: 'season_type', label: 'Season', type: 'status' },
        { key: 'title', label: 'Package' },
        { key: 'duration', label: 'Duration' },
        { key: 'price', label: 'Price', type: 'money' },
        { key: 'max_guests', label: 'Guests' },
        { key: 'status', label: 'Status', type: 'status' },
      ]}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'slug', label: 'Slug', required: true },
        { name: 'season_type', label: 'Season', type: 'select', options: [{ value: 'haor', label: 'Haor package' }, { value: 'padma', label: 'Padma event package' }] },
        { name: 'image_url', label: 'Package image', type: 'image', colSpan: 'full' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'duration', label: 'Duration' },
        { name: 'suggested_time', label: 'Suggested time' },
        { name: 'price', label: 'Price', type: 'number' },
        { name: 'best_for', label: 'Best for' },
        { name: 'max_guests', label: 'Max guests', type: 'number' },
        { name: 'included_services', label: 'Included services', type: 'tags', colSpan: 'full' },
        { name: 'meal_info', label: 'Meal info', type: 'textarea' },
        { name: 'route_spots', label: 'Route/spots', type: 'tags', colSpan: 'full' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        { name: 'sort_order', label: 'Sort order', type: 'number' },
      ]}
    />
  );
}

export function CustomersAdminPage() {
  return (
    <AdminResourcePage
      table="customers"
      title="কাস্টমার তালিকা"
      description="কাস্টমারের নাম, ফোন, ইমেইল, ঠিকানা ও নোট সংরক্ষণ করুন।"
      addLabel="নতুন কাস্টমার"
      searchKeys={['full_name', 'phone', 'email']}
      columns={[
        { key: 'full_name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'address', label: 'Address' },
        { key: 'note', label: 'Note' },
      ]}
      fields={[
        { name: 'full_name', label: 'Full name', required: true },
        { name: 'phone', label: 'Phone', required: true },
        { name: 'email', label: 'Email' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'note', label: 'Customer note', type: 'textarea' },
      ]}
    />
  );
}

export function IncomeAdminPage() {
  return (
    <AdminResourcePage
      table="income"
      title="আয়ের তালিকা"
      description="বুকিং, খাবার, BBQ, transport বা অন্যান্য আয় যোগ করুন।"
      addLabel="নতুন আয়"
      searchKeys={['title', 'category', 'income_date']}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category', type: 'status' },
        { key: 'amount', label: 'Amount', type: 'money' },
        { key: 'income_date', label: 'Date' },
        { key: 'note', label: 'Note' },
      ]}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'category', label: 'Category', type: 'select', options: incomeCategories.map((value) => ({ value, label: value })) },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'income_date', label: 'Income date', type: 'date' },
        { name: 'note', label: 'Note', type: 'textarea' },
      ]}
    />
  );
}

export function ExpensesAdminPage() {
  return (
    <AdminResourcePage
      table="expenses"
      title="খরচের তালিকা"
      description="খাবার, staff salary, fuel, maintenance সহ সব খরচ রাখুন।"
      addLabel="নতুন খরচ"
      searchKeys={['title', 'category', 'vendor_name', 'expense_date']}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category', type: 'status' },
        { key: 'amount', label: 'Amount', type: 'money' },
        { key: 'expense_date', label: 'Date' },
        { key: 'vendor_name', label: 'Vendor' },
      ]}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'category', label: 'Category', type: 'select', options: expenseCategories.map((value) => ({ value, label: value })) },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'expense_date', label: 'Expense date', type: 'date' },
        { name: 'vendor_name', label: 'Vendor name' },
        { name: 'note', label: 'Note', type: 'textarea' },
      ]}
    />
  );
}

export function GalleryAdminPage() {
  return (
    <AdminResourcePage
      table="gallery"
      title="গ্যালারি ছবি"
      description="ওয়েবসাইটের গ্যালারি ছবি আপলোড, category, featured status ও sort order ম্যানেজ করুন।"
      addLabel="নতুন ছবি"
      storageFolder="gallery"
      searchKeys={['title', 'category']}
      columns={[
        { key: 'image_url', label: 'Image', type: 'image' },
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'is_featured', label: 'Featured', type: 'boolean' },
        { key: 'sort_order', label: 'Order' },
      ]}
      fields={[
        { name: 'title', label: 'Title' },
        { name: 'image_url', label: 'Image', type: 'image', colSpan: 'full' },
        { name: 'category', label: 'Category' },
        { name: 'is_featured', label: 'Featured', type: 'boolean' },
        { name: 'sort_order', label: 'Sort order', type: 'number' },
      ]}
    />
  );
}

export function ContentAdminPage() {
  return (
    <AdminResourcePage
      table="website_content"
      title="ওয়েবসাইট কনটেন্ট"
      description="Hero, About, FAQ, Contact, CTA ইত্যাদি section-wise কনটেন্ট ম্যানেজ করুন।"
      addLabel="নতুন কনটেন্ট"
      storageFolder="content"
      searchKeys={['section_key', 'title', 'subtitle']}
      columns={[
        { key: 'section_key', label: 'Section' },
        { key: 'title', label: 'Title' },
        { key: 'subtitle', label: 'Subtitle' },
        { key: 'is_active', label: 'Active', type: 'boolean' },
      ]}
      fields={[
        { name: 'section_key', label: 'Section key', required: true },
        { name: 'title', label: 'Title' },
        { name: 'subtitle', label: 'Subtitle' },
        { name: 'content', label: 'Content', type: 'textarea', colSpan: 'full' },
        { name: 'image_url', label: 'Image', type: 'image', colSpan: 'full' },
        { name: 'button_text', label: 'Button text' },
        { name: 'button_url', label: 'Button URL' },
        { name: 'is_active', label: 'Active', type: 'boolean' },
      ]}
    />
  );
}

export function SettingsAdminPage() {
  return (
    <AdminResourcePage
      table="houseboat_settings"
      title="হাউসবোট সেটিংস"
      description="ব্র্যান্ড, ফোন, WhatsApp, payment number, logo এবং theme color আপডেট করুন।"
      addLabel="সেটিংস যোগ করুন"
      storageFolder="settings"
      searchKeys={['houseboat_name', 'phone', 'whatsapp', 'email']}
      columns={[
        { key: 'logo_url', label: 'Logo', type: 'image' },
        { key: 'houseboat_name', label: 'Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'whatsapp', label: 'WhatsApp' },
        { key: 'email', label: 'Email' },
      ]}
      fields={[
        { name: 'houseboat_name', label: 'Houseboat name', required: true },
        { name: 'tagline', label: 'Tagline' },
        { name: 'description', label: 'Description', type: 'textarea', colSpan: 'full' },
        { name: 'logo_url', label: 'Logo', type: 'image', colSpan: 'full' },
        { name: 'phone', label: 'Phone' },
        { name: 'whatsapp', label: 'WhatsApp' },
        { name: 'email', label: 'Email' },
        { name: 'facebook_url', label: 'Facebook URL' },
        { name: 'location', label: 'Location' },
        { name: 'address', label: 'Address', type: 'textarea' },
        { name: 'bkash_number', label: 'bKash number' },
        { name: 'nagad_number', label: 'Nagad number' },
        { name: 'bank_info', label: 'Bank info', type: 'textarea', colSpan: 'full' },
        { name: 'primary_color', label: 'Primary color' },
        { name: 'secondary_color', label: 'Secondary color' },
      ]}
    />
  );
}

export function PaymentsFallbackResourcePage() {
  return (
    <AdminResourcePage
      table="payments"
      title="পেমেন্ট"
      description="Booking payment, method, transaction ID ও note ম্যানেজ করুন।"
      addLabel="নতুন পেমেন্ট"
      searchKeys={['payment_method', 'transaction_id', 'payment_date']}
      columns={[
        { key: 'booking_id', label: 'Booking ID' },
        { key: 'amount', label: 'Amount', type: 'money' },
        { key: 'payment_method', label: 'Method', type: 'status' },
        { key: 'transaction_id', label: 'Transaction' },
        { key: 'payment_date', label: 'Date' },
      ]}
      fields={[
        { name: 'booking_id', label: 'Booking ID' },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'payment_method', label: 'Method', type: 'select', options: paymentMethods },
        { name: 'transaction_id', label: 'Transaction ID' },
        { name: 'payment_date', label: 'Payment date', type: 'date' },
        { name: 'note', label: 'Note', type: 'textarea' },
      ]}
    />
  );
}
