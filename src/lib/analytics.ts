/**
 * Unified Analytics Abstraction Layer
 *
 * Single entry point for all tracking.
 * Components import from here — never from GA/Meta directly.
 *
 * Usage:
 *   import * as analytics from '@/lib/analytics';
 *   analytics.trackViewContent(product);
 */

import { trackViewContent as fbViewContent, trackAddToCart as fbAddToCart, trackInitiateCheckout as fbInitiateCheckout, trackPurchase as fbPurchase, trackLead as fbLead, storeCheckoutData as fbStoreCheckoutData, getCheckoutData as fbGetCheckoutData } from '@/lib/meta-pixel';
import { trackGaViewItem, trackGaAddToCart, trackGaBeginCheckout, trackGaPurchase } from '@/lib/google-analytics';
import {
  trackViewContent as ttqViewContent,
  trackAddToCart as ttqAddToCart,
  trackInitiateCheckout as ttqInitiateCheckout,
  trackCompletePayment as ttqCompletePayment,
  identifyUser as ttqIdentifyUser,
} from '@/lib/tiktok-pixel';

// ─── Shared Types ────────────────────────────────────────────────────

export interface ProductParams {
  id: string;
  name: string;
  price: number;
  category?: string;
}

export interface CheckoutParams {
  contentIds: string[];
  value: number;
  numItems: number;
}

export interface PurchaseParams {
  contentIds: string[];
  value: number;
  orderId: string;
  numItems?: number;
}

// ─── Unified Event Functions ─────────────────────────────────────────

/**
 * Track product detail view (modal open / product page).
 * Fires: Meta Pixel ViewContent + GA4 view_item
 */
export function trackViewContent(product: ProductParams): void {
  fbViewContent(product);
  trackGaViewItem(product);
  ttqViewContent(product);
}

/**
 * Track add to cart.
 * Fires: Meta Pixel AddToCart + GA4 add_to_cart
 */
export function trackAddToCart(product: ProductParams): void {
  fbAddToCart(product);
  trackGaAddToCart(product);
  ttqAddToCart(product);
}

/**
 * Track checkout initiation.
 * Fires: Meta Pixel InitiateCheckout + GA4 begin_checkout
 */
export function trackInitiateCheckout(params: CheckoutParams): void {
  fbInitiateCheckout(params);
  trackGaBeginCheckout(params);
  ttqInitiateCheckout(params);
}

/**
 * Track completed purchase.
 * Fires: Meta Pixel Purchase + GA4 purchase
 */
export function trackPurchase(params: PurchaseParams): void {
  fbPurchase(params);
  trackGaPurchase(params);
  ttqCompletePayment(params);
}

/**
 * Track lead event.
 * Fires: Meta Pixel Lead only (no GA equivalent needed).
 */
export function trackLead(): void {
  fbLead();
}

/**
 * TikTok Advanced Matching (email/phone).
 * Used to improve match quality and remove diagnostics warning.
 */
export async function identifyUser(params: { email?: string; phone?: string }): Promise<void> {
  await ttqIdentifyUser(params);
}

// ─── Re-export session helpers (used by PaymentComponent + success page) ─

export const storeCheckoutData = fbStoreCheckoutData;
export const getCheckoutData = fbGetCheckoutData;
