export const DISCOUNT_PERCENTAGE = 20;

/**
 * السعر المدخل من الأدمن هو السعر الحقيقي الذي يُحاسَب به العميل فعلياً (بدون أي تغيير).
 * هذه الدالة تحسب "السعر قبل الخصم" للعرض فقط، بعكس نسبة الخصم رياضياً،
 * بحيث تكون شارة "خصم 20%" صحيحة: realPrice = beforeDiscount * (1 - 20%).
 */
export function getOriginalPriceBeforeDiscount(realPrice: number): number {
  return realPrice / (1 - DISCOUNT_PERCENTAGE / 100);
}
