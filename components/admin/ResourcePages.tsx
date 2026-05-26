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
      title="Room/Cabin List"
      description="Manage cabin photos, price, capacity, AC, and washroom facilities."
      addLabel="New Cabin"
      storageFolder="rooms"
      searchKeys={['name', 'slug', 'bed_type']}
      columns={[
        { key: 'image_url', label: 'Image', type: 'images' },
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
        { name: 'image_url', label: 'Room Images (Up to 4)', type: 'images', colSpan: 'full' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'bed_type', label: 'Bed type' },
        { name: 'capacity', label: 'Capacity (e.g. "2" or "2-3")', type: 'text', defaultValue: '2' },
        { name: 'price_per_night', label: 'Price / starting quote', type: 'number', defaultValue: 0, min: 0 },
        { name: 'price_2_pax', label: 'Price for 2 Pax (Per Person)', type: 'number', defaultValue: 0, min: 0 },
        { name: 'price_3_pax', label: 'Price for 3 Pax (Per Person)', type: 'number', defaultValue: 0, min: 0 },
        { name: 'has_ac', label: 'AC available', type: 'boolean' },
        { name: 'has_attached_washroom', label: 'Attached washroom', type: 'boolean' },
        { name: 'facilities', label: 'Facilities (comma separated)', type: 'tags', colSpan: 'full' },
        { name: 'status', label: 'Status', type: 'select', options: yesNoStatuses },
        { name: 'sort_order', label: 'Sort order', type: 'number', defaultValue: 0 },
      ]}
    />
  );
}

import PackagesSectionToggle from '@/components/admin/PackagesSectionToggle';

export function PackagesAdminPage() {
  return (
    <AdminResourcePage
      table="packages"
      renderTop={() => <PackagesSectionToggle />}
      title="Package List"
      description="Manage travel packages, services, food, routes, and price."
      addLabel="New Package"
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
        { name: 'price', label: 'Price', type: 'number', defaultValue: 0, min: 0 },
        { name: 'best_for', label: 'Best for' },
        { name: 'max_guests', label: 'Max guests', type: 'number', defaultValue: 1, min: 1 },
        { name: 'included_services', label: 'Included services', type: 'tags', colSpan: 'full' },
        { name: 'meal_info', label: 'Meal info', type: 'textarea' },
        { name: 'route_spots', label: 'Route/spots', type: 'tags', colSpan: 'full' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }] },
        { name: 'sort_order', label: 'Sort order', type: 'number', defaultValue: 0 },
      ]}
    />
  );
}

export function CustomersAdminPage() {
  return (
    <AdminResourcePage
      table="customers"
      title="Customer List"
      description="Save customer name, phone, email, address, and notes."
      addLabel="New Customer"
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

import { usePublicData } from '@/components/PublicDataProvider';

export function IncomeAdminPage() {
  const { tripSlots } = usePublicData();
  const tripOptions = [{ value: 'none', label: 'None (No Trip)' }, ...tripSlots.map(t => ({ 
    value: t.id, 
    label: `${new Date(t.start_date).toLocaleDateString('en-GB')} to ${new Date(t.end_date).toLocaleDateString('en-GB')}` 
  }))];

  return (
    <AdminResourcePage
      table="income"
      title="Income List"
      description="Add income from booking, food, BBQ, transport, or others."
      addLabel="New Income"
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
        { name: 'amount', label: 'Amount', type: 'number', defaultValue: 0, min: 0 },
        { name: 'income_date', label: 'Income date', type: 'date' },
        { name: 'trip_slot_id', label: 'Link to Trip (Optional)', type: 'select', options: tripOptions },
        { name: 'note', label: 'Note', type: 'textarea' },
      ]}
    />
  );
}

import ExpensesChart from '@/components/admin/ExpensesChart';
import type { Expense } from '@/types/database';

export function ExpensesAdminPage() {
  const { tripSlots } = usePublicData();
  const tripOptions = [{ value: 'none', label: 'None (No Trip)' }, ...tripSlots.map(t => ({ 
    value: t.id, 
    label: `${new Date(t.start_date).toLocaleDateString('en-GB')} to ${new Date(t.end_date).toLocaleDateString('en-GB')}` 
  }))];

  return (
    <AdminResourcePage
      table="expenses"
      title="Expense List"
      description="Keep track of all expenses including food, staff salary, fuel, maintenance."
      addLabel="New Expense"
      searchKeys={['title', 'category', 'vendor_name', 'expense_date']}
      renderTop={(rows) => <ExpensesChart expenses={rows as Expense[]} />}
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
        { name: 'amount', label: 'Amount', type: 'number', defaultValue: 0, min: 0 },
        { name: 'expense_date', label: 'Expense date', type: 'date' },
        { name: 'vendor_name', label: 'Vendor name' },
        { name: 'trip_slot_id', label: 'Link to Trip (Optional)', type: 'select', options: tripOptions },
        { name: 'note', label: 'Note', type: 'textarea' },
      ]}
    />
  );
}

export function GalleryAdminPage() {
  return (
    <AdminResourcePage
      table="gallery"
      title="Gallery Images"
      description="Upload website gallery images, manage category, featured status, and sort order."
      addLabel="New Image"
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
        { name: 'image_url', label: 'Image', type: 'image', colSpan: 'full', required: true },
        { name: 'category', label: 'Category' },
        { name: 'is_featured', label: 'Featured', type: 'boolean' },
        { name: 'sort_order', label: 'Sort order', type: 'number', defaultValue: 0 },
      ]}
    />
  );
}

export function ContentAdminPage() {
  return (
    <AdminResourcePage
      table="website_content"
      title="Website Content"
      description="Manage Hero, About, FAQ, Contact, CTA etc. section-wise content."
      addLabel="New Content"
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
        { name: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
      ]}
    />
  );
}

export function SettingsAdminPage() {
  return (
    <AdminResourcePage
      table="houseboat_settings"
      title="Houseboat Settings"
      description="Update brand, phone, WhatsApp, payment number, logo, and theme color."
      addLabel="Add Settings"
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
      title="Payments"
      description="Manage booking payment, method, transaction ID, and notes."
      addLabel="New Payment"
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
        { name: 'amount', label: 'Amount', type: 'number', defaultValue: 1, min: 1 },
        { name: 'payment_method', label: 'Method', type: 'select', options: paymentMethods },
        { name: 'transaction_id', label: 'Transaction ID' },
        { name: 'payment_date', label: 'Payment date', type: 'date' },
        { name: 'note', label: 'Note', type: 'textarea' },
      ]}
    />
  );
}
