export function getOriginalPriceFromDbPrice(price?: number | null): number {
  const numeric = Number(price ?? 0);
  if (!Number.isFinite(numeric)) return 0;
  return numeric * 1.2;
}

export function formatPrice(value?: number | null): string {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return '0';
  return numeric.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
