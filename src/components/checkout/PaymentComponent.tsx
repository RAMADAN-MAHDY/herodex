'use client';

import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useCheckoutMutation } from '@/store/api/orderApiSlice';
import { useGetCartQuery } from '@/store/api/cartApiSlice';
import { useGetPublicShippingRatesQuery } from '@/store/api/shippingRatesApiSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CreditCard, Wallet, MapPin, Phone, User, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { cn } from '@/utils/cn';
import * as analytics from '@/lib/analytics';

interface ShippingAddress {
  address: string;
  detailedAddress?: string;
  city: string;
  governorateId: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

export function PaymentComponent() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: cartData, isLoading: cartLoading } = useGetCartQuery(undefined);
  const [checkout, { isLoading: isProcessing }] = useCheckoutMutation();
  const { data: shippingRatesResponse } = useGetPublicShippingRatesQuery();

  const [guestName, setGuestName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'COD'>('card');
  const [walletNumber, setWalletNumber] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: '',
    detailedAddress: '',
    city: 'القاهرة',
    governorateId: '',
    postalCode: '12345',
    country: 'Egypt',
    phone: '',
    email: '',
  });

  const cart = cartData?.data || { items: [] };
  const subtotal = cart.items.reduce((acc: number, item: any) => acc + (item.product?.price * item.quantity), 0);

  const shippingRates = shippingRatesResponse?.data || [];
  const selectedShippingRate = useMemo(() => {
    if (!shippingAddress.governorateId) return null;
    return shippingRates.find((r: any) => r?._id === shippingAddress.governorateId) || null;
  }, [shippingAddress.governorateId, shippingRates]);

  const shipping = useMemo(() => {
    const cost = Number((selectedShippingRate as any)?.cost);
    return Number.isFinite(cost) ? cost : 0;
  }, [selectedShippingRate]);

  const total = subtotal + shipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user && !guestName) {
      toast.error('يرجى إدخال اسمك بالكامل');
      return;
    }

    if (!shippingAddress.phone || shippingAddress.phone.length < 11) {
      toast.error('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    if (!shippingAddress.governorateId) {
      toast.error('يرجى اختيار المحافظة');
      return;
    }

    if (paymentMethod === 'wallet' && (!walletNumber || walletNumber.length < 11)) {
      toast.error('يرجى إدخال رقم المحفظة الإلكترونية');
      return;
    }

    try {
      const payload: any = {
        paymentMethod,
        shippingAddress,
      };

      if (!user) {
        payload.guestName = guestName;
      }

      if (paymentMethod === 'wallet') {
        payload.walletNumber = walletNumber;
      }

      // Store checkout data for Purchase event on success page
      analytics.storeCheckoutData({
        contentIds: cart.items.map((item: any) => item.product?._id).filter(Boolean),
        value: total,
        numItems: cart.items.length,
      });

      const result: any = await checkout(payload).unwrap();

      if (result.success) {
        if (paymentMethod === 'COD') {
          toast.success('تم تسجيل طلبك بنجاح');
          window.location.href = `/checkout/success?order_id=${result.data.orderId}`;
        } else if (result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        } else {
          toast.error('حدث خطأ أثناء بدء عملية الدفع');
        }
      } else {
        toast.error('حدث خطأ أثناء معالجة الطلب');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(err.data?.message || 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.');
    }
  };

  if (cartLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-store animate-spin mb-4" />
        <p className="text-gray-500 font-bold">جاري تحميل بيانات الطلب...</p>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">سلتك فارغة</h2>
        <p className="text-gray-500 mt-2">لا يوجد منتجات لإتمام عملية الشراء</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Checkout Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-8 space-y-6"
      >
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-store/10 flex items-center justify-center text-store">
              <MapPin size={22} />
            </div>
            <h2 className="text-xl font-black text-gray-900">عنوان الشحن</h2>
          </div>

          <form id="checkout-form" onSubmit={handleCheckout} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {!user && (
              <Input 
                label="اسم العميل بالكامل"
                placeholder="مثال: محمد أحمد علي"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="md:col-span-2"
              />
            )}
            <Input 
              label="العنوان بالتفصيل"
              placeholder="مثال: 123 شارع التحرير، الدقي"
              required
              value={shippingAddress.address}
              onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
              className="md:col-span-2"
            />
            <Input
              label="عنوان تفصيلي (اختياري)"
              placeholder="مثال: شقة 5، الدور الثالث"
              value={shippingAddress.detailedAddress || ''}
              onChange={(e) => setShippingAddress({ ...shippingAddress, detailedAddress: e.target.value })}
              className="md:col-span-2"
            />
            <Input 
              label="المدينة"
              required
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
            />
            <div className="w-full space-y-2">
              <label className="text-sm font-black text-slate-700 block mr-1 tracking-tight">
                المحافظة
              </label>
              <div className="flex items-center gap-3">
                <select
                  required
                  value={shippingAddress.governorateId}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, governorateId: e.target.value })
                  }
                  className={cn(
                    'flex h-14 w-full rounded-2xl border-none bg-slate-50 px-5 py-4 text-base font-bold text-slate-900 ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20 focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300'
                  )}
                >
                  <option value="" disabled>
                    اختر المحافظة
                  </option>
                  {shippingRates.map((rate: any) => (
                    <option key={rate._id} value={rate._id}>
                      {rate.governorate}
                    </option>
                  ))}
                </select>
                {selectedShippingRate && (
                  <div className="shrink-0 text-xs font-black text-slate-700 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                    <div>{shipping === 0 ? 'مجاني' : `${shipping} ج.م`}</div>
                    <div className="text-[10px] font-bold text-slate-500 mt-1">
                      {selectedShippingRate.time}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Input 
              label="رقم الهاتف"
              placeholder="01XXXXXXXXX"
              required
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
            />
            <Input
              label="البريد الإلكتروني (اختياري)"
              placeholder="user@example.com"
              type="email"
              value={shippingAddress.email || ''}
              onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
              className="md:col-span-2"
            />
          </form>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-store/10 flex items-center justify-center text-store">
              <CreditCard size={22} />
            </div>
            <h2 className="text-xl font-black text-gray-900">اختر وسيلة الدفع</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* <button
              onClick={() => setPaymentMethod('card')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                paymentMethod === 'card' 
                  ? "border-store bg-store/5 text-store shadow-sm" 
                  : "border-gray-100 hover:border-gray-200 text-gray-500"
              )}
            >
              <CreditCard size={32} />
              <span className="font-bold">بطاقة بنكية</span>
            </button> */}
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                paymentMethod === 'wallet' 
                  ? "border-store bg-store/5 text-store shadow-sm" 
                  : "border-gray-100 hover:border-gray-200 text-gray-500"
              )}
            >
              <Wallet size={32} />
              <span className="font-bold">محفظة ذكية <span className='text-red-500'>(فودافون كاش)</span></span>
            </button>
            <button
              onClick={() => setPaymentMethod('COD')}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                paymentMethod === 'COD' 
                  ? "border-store bg-store/5 text-store shadow-sm" 
                  : "border-gray-100 hover:border-gray-200 text-gray-500"
              )}
            >
              <CheckCircle2 size={32} />
              <span className="font-bold">دفع عند الاستلام</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* {paymentMethod === 'card' && (
              <motion.div
                key="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-50 p-6 rounded-2xl border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-store flex items-center justify-center text-white">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="font-black text-store">الدفع بالبطاقة البنكية</p>
                    <p className="text-xs text-gray-500 font-bold">فيزا، ماستركارد، ميزة</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500 font-bold leading-relaxed">
                  سيتم توجيهك إلى صفحة Paymob الآمنة لإتمام عملية الدفع باستخدام بيانات بطاقتك.
                </p>
              </motion.div>
            )} */}

            {paymentMethod === 'wallet' && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-store/5 p-6 rounded-2xl border border-store/10"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-store flex items-center justify-center text-white">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="font-black text-store">المحافظ الإلكترونية الذكية</p>
                    <p className="text-xs text-gray-500 font-bold">فودافون كاش، اتصالات كاش، أورانج كاش، وي باي</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-store/10">
                  <Input 
                    label="رقم المحفظة (الرقم الذي ستقوم بالدفع منه)"
                    placeholder="01XXXXXXXXX"
                    required
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                  />
                  <p className="mt-3 text-xs text-gray-400 font-bold flex items-center gap-1">
                    <AlertCircle size={14} className="text-store-gold" />
                    تأكد من وجود رصيد كافٍ في محفظتك قبل إتمام العملية.
                  </p>
                </div>
              </motion.div>
            )}

            {paymentMethod === 'COD' && (
              <motion.div
                key="COD"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-store-gold/5 p-6 rounded-2xl border border-store-gold/10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-store-gold flex items-center justify-center text-store-dark">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="font-black text-store-dark">الدفع عند الاستلام (COD)</p>
                    <p className="text-xs text-gray-600 font-bold">ادفع نقداً عند استلام طلبك</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 font-bold leading-relaxed">
                  سيتم معالجة طلبك فوراً، وسيقوم مندوب الشحن بالتحصيل عند تسليم المنتج.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>

      {/* Summary */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-4"
      >
        <div className="bg-store-dark text-white p-8 rounded-[2rem] shadow-xl sticky top-24 overflow-hidden group">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-store-gold/10 rounded-full blur-3xl transition-transform duration-1000 group-hover:scale-150"></div>
          
          <h2 className="text-xl font-black mb-6 flex items-center justify-between relative">
            ملخص الطلب
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full">{cart.items.length} منتجات</span>
          </h2>

          <div className="max-h-[300px] overflow-y-auto mb-8 pr-2 custom-scrollbar space-y-4">
            {cart.items.map((item: any) => (
              <div key={item._id} className="flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/10 p-1 flex-shrink-0">
                  <img src={item.product?.image} alt={item.product?.name} className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.product?.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-white/60 font-medium">الكمية: {item.quantity}</span>
                    <span className="text-sm font-black text-store-gold">{(item.product?.price * item.quantity).toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 relative border-t border-white/10 pt-6">
            <div className="flex justify-between text-white/70 font-bold">
              <span>المجموع الفرعي</span>
              <span>{subtotal.toFixed(2)} ج.م</span>
            </div>
            <div className="flex justify-between text-white/70 font-bold">
              <span>الشحن</span>
              <span>{shipping === 0 ? 'مجاني' : `${shipping.toFixed(2)} ج.م`}</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between text-2xl font-black">
              <span>الإجمالي</span>
              <span className="text-store-gold">{total.toFixed(2)} ج.م</span>
            </div>
          </div>

          <Button 
            form="checkout-form"
            type="submit"
            disabled={isProcessing}
            className="w-full mt-8 py-5 rounded-2xl text-lg font-black bg-store-gold hover:bg-store-gold/90 text-store-dark border-0 shadow-lg shadow-store-gold/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isProcessing ? (
              <>
                <Loader2 className="ml-2 w-5 h-5 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                إتمام الطلب
                <ArrowRight className="mr-2 w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
              </>
            )}
          </Button>
          
          <p className="text-center mt-6 text-[10px] text-white/40 font-bold uppercase tracking-wider">
            جميع المعاملات مؤمنة بتشفير 256-بت بموجب شروط Paymob
          </p>
        </div>
      </motion.div>
    </div>
  );
}
