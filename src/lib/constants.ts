
import type { Subscription } from '@/types';

export const CATEGORIES = ["Streaming", "Software", "Gaming", "Utilities", "Health", "Education", "Shopping", "Finance", "Productivity", "Other"] as const;
export const BILLING_CYCLES = ['monthly', 'yearly', 'one-time'] as const;
export const STATUSES = ['active', 'cancelled', 'paused'] as const;
export const CARD_TYPES = ["Visa", "Mastercard", "Amex", "Discover", "PayPal", "Other"] as const;

// Ensure all startDates are initialized as UTC midnight for consistency
export const INITIAL_SUBSCRIPTIONS_DATA: Subscription[] = [
  { id: '1', name: 'Netflix Premium', category: 'Streaming', price: 19.99, billingCycle: 'monthly', startDate: new Date('2023-01-15T00:00:00.000Z'), status: 'active', paymentCardType: 'Visa', paymentCardLastFour: '1234' },
  { id: '2', name: 'Spotify Family', category: 'Streaming', price: 16.99, billingCycle: 'monthly', startDate: new Date('2022-11-01T00:00:00.000Z'), status: 'active', paymentCardType: 'Mastercard', paymentCardLastFour: '5678' },
  { id: '3', name: 'Adobe Creative Cloud', category: 'Software', price: 59.99, billingCycle: 'monthly', startDate: new Date('2023-03-01T00:00:00.000Z'), status: 'cancelled' },
  { id: '4', name: 'Gym Membership', category: 'Health', price: 40.00, billingCycle: 'monthly', startDate: new Date('2023-05-20T00:00:00.000Z'), status: 'active', paymentCardType: 'Amex', paymentCardLastFour: '9012' },
  { id: '5', name: 'Amazon Prime', category: 'Shopping', price: 139.00, billingCycle: 'yearly', startDate: new Date('2023-02-10T00:00:00.000Z'), status: 'active' },
  { id: '6', name: 'Coursera Plus', category: 'Education', price: 399.00, billingCycle: 'yearly', startDate: new Date('2024-01-01T00:00:00.000Z'), status: 'paused' },
  { id: '7', name: 'Microsoft Office 365', category: 'Productivity', price: 99.99, billingCycle: 'yearly', startDate: new Date('2023-08-15T00:00:00.000Z'), status: 'active', paymentCardType: 'Visa', paymentCardLastFour: '3456' },
  { id: '8', name: 'Xbox Game Pass Ultimate', category: 'Gaming', price: 14.99, billingCycle: 'monthly', startDate: new Date('2023-07-01T00:00:00.000Z'), status: 'active' },
];
