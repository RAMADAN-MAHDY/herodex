/**
 * Meta Pixel (Facebook Pixel) Tracking Utility
 *
 * Centralized, SSR-safe, deduplicated event tracking for e-commerce.
 * All pixel events should be fired through this module — never call fbq() directly.
 *
 * Pixel ID is read from NEXT_PUBLIC_META_PIXEL_ID env variable.
 */

// ─── Types ───────────────────────────────────────────────────────────
declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: (...args: any[]) => void;
  }
}

type Currency = 'EGP';

interface PixelProductParams {
  id: string;
  name: string;
  price: number;
  category?: string;
}

interface PixelCheckoutParams {
  contentIds: string[];
  value: number;
  numItems: number;
  email?: string;
  phone?: string;
}

interface PixelPurchaseParams {
  contentIds: string[];
  value: number;
  orderId: string;
  numItems?: number;
  email?: string;
  phone?: string;
}

// ─── Constants ───────────────────────────────────────────────────────
const CURRENCY: Currency = 'EGP';
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

// ─── Deduplication ───────────────────────────────────────────────────
const firedEvents = new Set<string>();

function isDuplicate(key: string): boolean {
  if (firedEvents.has(key)) return true;
  firedEvents.add(key);
  return false;
}

// ─── Guard ───────────────────────────────────────────────────────────
function canTrack(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function' && !!PIXEL_ID;
}

// ─── Session Storage helpers (for Purchase event) ────────────────────
const CHECKOUT_DATA_KEY = 'meta_pixel_checkout_data';

export function storeCheckoutData(data: PixelCheckoutParams): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CHECKOUT_DATA_KEY, JSON.stringify(data));
  } catch {
    // sessionStorage might be unavailable in some contexts
  }
}

export function getCheckoutData(): PixelCheckoutParams | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    sessionStorage.removeItem(CHECKOUT_DATA_KEY); // read once
    return parsed;
  } catch {
    return null;
  }
}

// ─── Event Functions ─────────────────────────────────────────────────

/**
 * Track when a user views a product detail (opens modal).
 * Deduplicated per product ID per session.
 */
export function trackViewContent(product: PixelProductParams): void {
  if (!canTrack()) return;
  const dedupeKey = `ViewContent_${product.id}`;
  if (isDuplicate(dedupeKey)) return;

  window.fbq('track', 'ViewContent', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: CURRENCY,
  });
}

/**
 * Track when a user adds a product to cart.
 * Deduplicated per product ID per session.
 */
export function trackAddToCart(product: PixelProductParams): void {
  if (!canTrack()) return;
  // Allow re-adding — only deduplicate rapid double-clicks (same event within same render cycle)
  // Use a timeout-based approach: clear dedup key after 2 seconds
  const dedupeKey = `AddToCart_${product.id}`;
  if (isDuplicate(dedupeKey)) return;

  // Allow firing again after 2s (user might legitimately add same product again)
  setTimeout(() => firedEvents.delete(dedupeKey), 2000);

  window.fbq('track', 'AddToCart', {
    content_name: product.name,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: CURRENCY,
  });
}

/**
 * Track when the user reaches the checkout page.
 * Deduplicated per page load (fires once per mount).
 */
export function trackInitiateCheckout(params: PixelCheckoutParams): void {
  if (!canTrack()) return;
  const dedupeKey = `InitiateCheckout`;
  if (isDuplicate(dedupeKey)) return;

  window.fbq('track', 'InitiateCheckout', {
    content_ids: params.contentIds,
    content_type: 'product',
    value: params.value,
    currency: CURRENCY,
    num_items: params.numItems,
  });
}

/**
 * Track a completed purchase.
 * Deduplicated per order ID (never fires twice for the same order).
 * Includes user data for Meta Advanced Matching.
 */
export function trackPurchase(params: PixelPurchaseParams): void {
  if (!canTrack()) return;
  const dedupeKey = `Purchase_${params.orderId}`;
  if (isDuplicate(dedupeKey)) return;

  // If we have user data, we can re-init or use the data in the track call.
  // Facebook recommends providing user data in the init call for best results,
  // but we can also provide it in the 'track' call if needed.
  // Note: Meta Pixel automatically hashes data if passed as clear text.
  
  const userData = params.email || params.phone ? {
    em: params.email?.toLowerCase().trim(),
    ph: params.phone?.replace(/\D/g, ''),
  } : undefined;

  if (userData) {
    // Re-initialize with user data to enable Advanced Matching
    window.fbq('init', PIXEL_ID, userData);
  }

  window.fbq('track', 'Purchase', {
    content_ids: params.contentIds,
    content_type: 'product',
    value: params.value,
    currency: CURRENCY,
    num_items: params.numItems,
  });
}

/**
 * Track a lead event (e.g. WhatsApp click).
 */
export function trackLead(): void {
  if (!canTrack()) return;
  const dedupeKey = 'Lead';
  if (isDuplicate(dedupeKey)) return;

  window.fbq('track', 'Lead');
}

/**
 * Identify user for Advanced Matching.
 */
export function identifyUser(params: { email?: string; phone?: string }): void {
  if (!canTrack()) return;
  
  const userData: any = {};
  if (params.email) userData.em = params.email.toLowerCase().trim();
  if (params.phone) userData.ph = params.phone.replace(/\D/g, '');

  if (Object.keys(userData).length > 0) {
    window.fbq('init', PIXEL_ID, userData);
  }
}

/**
 * Get the pixel ID (for use in layout Script component).
 */
export function getPixelId(): string {
  return PIXEL_ID;
}
