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

export type PromoOptions = {
  percent?: number;
  startDate?: string;
  endDate?: string;
  title?: string;
};

export function calculateBookingDiscount(
  subtotal: unknown,
  bookingDate: string | null | undefined,
  specialDates: DiscountSpecialDate[] = [],
  discountPercent = STANDARD_DISCOUNT_PERCENT,
  promoOptions?: PromoOptions
): DiscountCalculation {
  const subtotalAmount = toMoney(subtotal);
  const defaultPercent = Math.max(Number(discountPercent || 0), 0);
  
  let percent = defaultPercent;
  let reason = `${defaultPercent}% weekday discount`;
  let isPromo = false;

  if (
    promoOptions &&
    promoOptions.percent &&
    promoOptions.percent > 0 &&
    promoOptions.startDate &&
    promoOptions.endDate &&
    bookingDate &&
    bookingDate >= promoOptions.startDate &&
    bookingDate <= promoOptions.endDate
  ) {
    percent = Math.max(Number(promoOptions.percent), 0);
    reason = promoOptions.title || `${percent}% Promotional Discount`;
    isPromo = true;
  }

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

  const weekday = getWeekday(bookingDate);
  // We apply the weekday no-discount rule ONLY if it's NOT a promo discount
  // If promo is active, we apply it to ALL days including weekends.
  // Wait, if it's not promo, check if it's a no-discount weekday.
  if (!isPromo && weekday !== null && noDiscountWeekdays.has(weekday)) {
    return {
      subtotalAmount,
      discountAmount: 0,
      totalAmount: subtotalAmount,
      discountPercent: 0,
      discountReason: `${weekdayNames[weekday]} no-discount date`,
      isDiscountApplied: false,
    };
  }

  const discountAmount = Math.round((subtotalAmount * percent) / 100);

  return {
    subtotalAmount,
    discountAmount,
    totalAmount: Math.max(subtotalAmount - discountAmount, 0),
    discountPercent: percent,
    discountReason: reason,
    isDiscountApplied: discountAmount > 0,
  };
}
