import { z } from 'zod';

const optionalNumber = z.coerce.number().finite().min(0).optional().default(0);
const booleanFromForm = z.preprocess((value) => value === 'true' || value === true, z.boolean());

export const customerSchema = z.object({
  full_name: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(8, 'Phone number is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  note: z.string().optional(),
});

export const bookingSchema = z
  .object({
    customer_name: z.string().min(2, 'Customer name is required'),
    phone: z.string().min(8, 'Phone number is required'),
    email: z.string().optional(),
    booking_type: z.enum(['full_boat', 'cabin_wise']),
    room_id: z.string().optional(),
    room_details: z.any().optional(),
    package_id: z.string().optional(),
    check_in_date: z.string().min(1, 'Check-in date is required'),
    check_out_date: z.string().min(1, 'Check-out date is required'),
    number_of_guests: z.coerce.number().int().positive('Guest number must be positive'),
    subtotal_amount: optionalNumber,
    discount_amount: optionalNumber,
    discount_reason: z.string().optional().nullable(),
    total_amount: optionalNumber,
    advance_amount: optionalNumber,
    payment_status: z.enum(['unpaid', 'partially_paid', 'paid', 'refunded']),
    booking_status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled']),
    special_request: z.string().optional(),
    admin_note: z.string().optional(),
    season_type: z.enum(['haor', 'padma']).optional().default('haor'),
    event_type: z.string().optional(),
    event_slot: z.string().optional(),
    event_date: z.string().optional(),
    event_start_time: z.string().optional(),
    event_end_time: z.string().optional(),
    food_package: z.string().optional(),
    decoration_required: booleanFromForm.optional().default(false),
    sound_system_required: booleanFromForm.optional().default(false),
    payment_method: z.enum(['cash', 'bkash', 'nagad', 'bank', 'other']).optional(),
    transaction_id: z.string().optional().nullable(),
    trip_slot_id: z.string().optional().nullable(),
  })
  .superRefine((value, ctx) => {
    const selectedRoomDetails = Array.isArray(value.room_details)
      ? value.room_details.filter((detail) => detail?.roomId && detail.roomId !== 'none')
      : [];

    if (value.check_out_date <= value.check_in_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['check_out_date'],
        message: 'Check-out date must be after check-in date',
      });
    }

    if (value.advance_amount > value.total_amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['advance_amount'],
        message: 'Advance cannot be greater than total amount',
      });
    }

    if (
      value.season_type === 'haor' &&
      value.booking_type === 'cabin_wise' &&
      !value.room_id &&
      selectedRoomDetails.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['room_id'],
        message: 'Select a room for cabin-wise booking',
      });
    }

    if (value.season_type === 'padma' && (!value.event_date || !value.event_slot || !value.event_type)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['event_date'],
        message: 'Event date, type and slot are required for Padma bookings',
      });
    }
  });

export const roomSchema = z.object({
  name: z.string().min(2, 'Room name is required'),
  slug: z.string().min(2, 'Slug is required'),
  capacity: z.coerce.number().int().positive(),
  price_per_night: z.coerce.number().min(0),
  status: z.enum(['active', 'inactive', 'maintenance']),
});

export const packageSchema = z.object({
  title: z.string().min(2, 'Package title is required'),
  slug: z.string().min(2, 'Slug is required'),
  price: z.coerce.number().min(0),
  max_guests: z.coerce.number().int().positive(),
  status: z.enum(['active', 'inactive']),
});
