'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { CheckCircle, ArrowLeft, Package, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { apiSlice } from '@/store/api/apiSlice';
import * as analytics from '@/lib/analytics';

import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const transactionId = searchParams.get('transaction_id');
  const orderId = searchParams.get('order_id');
  const hasFiredPurchase = useRef(false);
  const checkoutDataRef = useRef<any>(null);
  const [totalValue, setTotalValue] = useState<number | null>(null);

  useEffect(() => {
    // تفريغ السلة في الواجهة الأمامية
    dispatch(apiSlice.util.invalidateTags(['Cart' as any]));

    // Track Purchase — guarded by ref to prevent double firing
    const ordIdentifier = transactionId || orderId;
    if (!ordIdentifier || hasFiredPurchase.current) return;
    hasFiredPurchase.current = true;

    const data = analytics.getCheckoutData();
    if (data) {
      checkoutDataRef.current = data;
      setTotalValue(data.value);
      
      analytics.trackPurchase({
        contentIds: data.contentIds || [],
        value: data.value || 0,
        orderId: ordIdentifier,
        numItems: data.numItems,
        email: data.email,
        phone: data.phone,
      });
    }
  }, [dispatch, transactionId, orderId]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="relative mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-store-gold rounded-full flex items-center justify-center mx-auto shadow-xl shadow-store-gold/20"
            >
              <CheckCircle size={48} className="text-store-dark" />
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-store-gold/30 rounded-full"
            ></motion.div>
          </div>

          <h1 className="text-3xl font-black text-gray-900 mb-4">تم الطلب بنجاح!</h1>
          <p className="text-gray-500 font-bold mb-8">
            شكراً لثقتك بنا. تم استلام طلبك وجاري العمل على تجهيزه وشحنه لك في أقرب وقت.
          </p>

            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8 text-right">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-400 font-bold">
                {transactionId ? 'رقم العملية (Transaction ID)' : 'رقم الطلب (Order ID)'}
              </span>
              <span className="text-sm font-black text-store">{transactionId || orderId || '---'}</span>
            </div>
            {totalValue && (
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-400 font-bold">إجمالي المبلغ</span>
                <span className="text-sm font-black text-store-gold">{totalValue.toFixed(2)} ج.م</span>
              </div>
            )}
            <div className="flex gap-3 text-sm text-gray-600 font-bold items-center">
              <Package size={18} className="text-store-gold" />
              <span>يمكنك عرض تفاصيل طلبك في صفحة "طلباتي".</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/')}
              className="w-full py-4 rounded-2xl bg-store hover:bg-store-dark text-white font-black border-0 shadow-lg"
            >
              <Home className="ml-2" size={20} />
              العودة للرئيسية
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/my-orders')}
              className="w-full py-4 rounded-2xl border-gray-100 hover:bg-gray-50 font-black text-gray-600"
            >
              عرض طلباتي السابقة
            </Button>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-store"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
