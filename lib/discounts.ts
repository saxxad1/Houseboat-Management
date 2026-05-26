import type { SpecialDate } from '@/types/database';

export const STANDARD_DISCOUNT_PERCENT = 10;

export type DiscountSpecialDate = Pick<
  SpecialDate,
  'date' | 'title' | 'date_type' | 'is_discount_excluded' | 'is_active'
>;

export type DiscountCalculation = {
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  discountPercent: number;
  discountReason: string | null;
  isDiscountApplied: boolean;
};

const noDiscountWeekdays = new Set([4, 5, 6]);
const weekdayNames: Record<number, string> = {
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

function toMoney(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.max(Math.round(parsed), 0) : 0;
}

function getWeekday(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getDay();
}

function getSpecialDate(date: string, specialDates: DiscountSpecialDate[]) {
  return specialDates.find((item) => {
    const isActive = item.is_active !== false;
    return isActive && item.date === date && item.is_discount_excluded !== false;
  });
}

export function calculateBookingDiscount(
  subtotal: unknown,
  bookingDate: string | null | undefined,
  specialDates: DiscountSpecialDate[] = [],
  discountPercent = STANDARD_DISCOUNT_PERCENT
): DiscountCalculation {
  const subtotalAmount = toMoney(subtotal);
  const percent = Math.max(Number(discountPercent || 0), 0);

  if (!subtotalAmount || !bookingDate || !percent) {
    return {
      subtotalAmount,
      discountAmount: 0,
      totalAmount: subtotalAmount,
      discountPercent: 0,
      discountReason: null,
      isDiscountApplied: false,
    };
  }

  const weekday = getWeekday(bookingDate);
  if (weekday !== null && noDiscountWeekdays.has(weekday)) {
    return {
      subtotalAmount,
      discountAmount: 0,
      totalAmount: subtotalAmount,
      discountPercent: 0,
      discountReason: `${weekdayNames[weekday]} no-discount date`,
      isDiscountApplied: false,
    };
  }

  const blockedDate = getSpecialDate(bookingDate, specialDates);
  if (blockedDate) {
    return {
      subtotalAmount,
      discountAmount: 0,
      totalAmount: subtotalAmount,
      discountPercent: 0,
      discountReason: blockedDate.title || 'Special no-discount date',
      isDiscountApplied: false,
    };
  }

  const discountAmount = Math.round((subtotalAmount * percent) / 100);

  return {
    subtotalAmount,
    discountAmount,
    totalAmount: Math.max(subtotalAmount - discountAmount, 0),
    discountPercent: percent,
    discountReason: `${percent}% weekday discount`,
    isDiscountApplied: discountAmount > 0,
  };
}
