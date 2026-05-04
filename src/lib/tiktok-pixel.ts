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

function canTrack(): boolean {
  return (
    typeof window !== 'undefined' &&
    !!PIXEL_ID &&
    typeof window.ttq?.track === 'function'
  );
}

function contentsFromIds(ids: string[], quantity = 1) {
  return ids.map((content_id) => ({
    content_id,
    content_type: 'product',
    quantity,
  }));
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
