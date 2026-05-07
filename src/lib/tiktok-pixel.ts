/**
 * TikTok Pixel — lightweight helpers aligned with Meta/GA patterns.
 * Pixel ID: NEXT_PUBLIC_TIKTOK_PIXEL_ID
 *
 * Do not call ttq directly from components; use @/lib/analytics.
 */

declare global {
  interface Window {
    ttq?: {
      track: (...args: any[]) => void;
      page: (...args: any[]) => void;
      identify?: (...args: any[]) => void;
      /** queued stub قبل تحميل السكربت */
      push?: (args: any[]) => void;
    };
  }
}

type Currency = 'EGP';

interface TikTokProductParams {
  id: string;
  name: string;
  price: number;
}

interface TikTokCheckoutParams {
  contentIds: string[];
  value: number;
  numItems: number;
}

interface TikTokPurchaseParams {
  contentIds: string[];
  value: number;
  orderId: string;
  numItems?: number;
}

const CURRENCY: Currency = 'EGP';
const PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '';

const firedEvents = new Set<string>();

function isDuplicate(key: string): boolean {
  if (firedEvents.has(key)) return true;
  firedEvents.add(key);
  return false;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function canTrack(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!PIXEL_ID &&
    typeof window.ttq?.track === 'function'
  );
}

function canIdentify(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!PIXEL_ID &&
    typeof window.ttq?.identify === 'function'
  );
}

function contentsFromIds(ids: string[], quantity = 1) {
  return ids.map((content_id) => ({
    content_id,
    content_type: 'product',
    quantity,
  }));
}

/**
 * TikTok Advanced Matching
 * Hashes email / phone_number (SHA-256) before sending.
 */
export async function identifyUser(params: { email?: string; phone?: string }): Promise<void> {
  if (!canIdentify()) return;

  const email = params.email ? normalizeEmail(params.email) : '';
  const phone = params.phone ? normalizePhone(params.phone) : '';
  if (!email && !phone) return;

  try {
    const payload: Record<string, string> = {};
    if (email) payload.email = await sha256Hex(email);
    if (phone) payload.phone_number = await sha256Hex(phone);

    window.ttq!.identify!(payload);
  } catch {
    // ignore identify failures (privacy tools / unavailable crypto)
  }
}

export function trackViewContent(product: TikTokProductParams): void {
  if (!canTrack()) return;
  const dedupeKey = `ttq_ViewContent_${product.id}`;
  if (isDuplicate(dedupeKey)) return;

  window.ttq!.track('ViewContent', {
    contents: [
      {
        content_id: product.id,
        content_type: 'product',
        content_name: product.name,
      },
    ],
    value: product.price,
    currency: CURRENCY,
  });
}

export function trackAddToCart(product: TikTokProductParams): void {
  if (!canTrack()) return;
  const dedupeKey = `ttq_AddToCart_${product.id}`;
  if (isDuplicate(dedupeKey)) return;
  setTimeout(() => firedEvents.delete(dedupeKey), 2000);

  window.ttq!.track('AddToCart', {
    contents: [
      {
        content_id: product.id,
        content_type: 'product',
        content_name: product.name,
      },
    ],
    value: product.price,
    currency: CURRENCY,
  });
}

export function trackInitiateCheckout(params: TikTokCheckoutParams): void {
  if (!canTrack()) return;
  const dedupeKey = 'ttq_InitiateCheckout';
  if (isDuplicate(dedupeKey)) return;

  window.ttq!.track('InitiateCheckout', {
    contents: contentsFromIds(params.contentIds),
    value: params.value,
    currency: CURRENCY,
  });
}

/** TikTok standard event for completed purchase */
export function trackCompletePayment(params: TikTokPurchaseParams): void {
  if (!canTrack()) return;
  const dedupeKey = `ttq_CompletePayment_${params.orderId}`;
  if (isDuplicate(dedupeKey)) return;

  window.ttq!.track('CompletePayment', {
    contents: contentsFromIds(params.contentIds, 1),
    value: params.value,
    currency: CURRENCY,
  });
}

export function getTikTokPixelId(): string {
  return PIXEL_ID;
}
