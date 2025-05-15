
import type { CATEGORIES, BILLING_CYCLES, STATUSES, CARD_TYPES } from '@/lib/constants';

export type SubscriptionBillingCycle = typeof BILLING_CYCLES[number];
export type SubscriptionStatus = typeof STATUSES[number];
export type SubscriptionCategory = typeof CATEGORIES[number];
export type PaymentCardType = typeof CARD_TYPES[number] | ""; // Allow empty string for unselected

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  price: number;
  billingCycle: SubscriptionBillingCycle;
  startDate: Date;
  status: SubscriptionStatus;
  notes?: string;
  paymentCardType?: PaymentCardType;
  paymentCardLastFour?: string;
}
