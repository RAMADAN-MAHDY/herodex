'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShoppingCart, Star, ArrowRight, ChevronLeft, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGetProductByIdQuery } from '@/store/api/productApiSlice';
import { useAddToCartMutation } from '@/store/api/cartApiSlice';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = typeof params.id === 'string' ? params.id : '';

  React.useLayoutEffect(() => {
    if (!productId) return;
    window.scrollTo(0, 0);
  }, [productId]);

  const {
    data: singleProductRes,
    isLoading: isLoadingSingle,
    isFetching: isFetchingSingle,
    isUninitialized,
  } = useGetProductByIdQuery(productId, {
    skip: !productId,
    refetchOnFocus: false,
    refetchOnReconnect: true,
  });
  const product = singleProductRes?.data || (singleProductRes?._id ? singleProductRes : null);
  // Avoid flashing "not found" before the query runs (skip / uninitialized) or while fetching.
  const isLoading =
    !productId ||
    (!product && (isUninitialized || isLoadingSingle || isFetchingSingle));

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  const handleAddToCart = () => {
    // Trigger in background and keep UI responsive immediately.
    addToCart({ productId, quantity: 1, product })
      .unwrap()
      .catch((err: any) => {
        if (err?.data?.message?.includes('already') || err?.status === 400) {
          toast.info('هذا المنتج موجود بالفعل في سلتك 😊');
          return;
        }
        toast.error('عذراً، حدث خطأ أثناء الإضافة. يرجى المحاولة مرة أخرى.');
      });
    toast.success(`تم إضافة ${product?.name} إلى السلة بنجاح ✨`);
  };

  const handleBuyNow = () => {
    // Run add request in background; navigate instantly.
    addToCart({ productId, quantity: 1, product })
      .unwrap()
      .catch((err: any) => {
        if (err?.data?.message?.includes('already') || err?.status === 400) return;
        toast.error('عذراً، حدث خطأ أثناء تجهيز السلة.');
      });
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-store-muted border-t-store rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-24 h-24 rounded-full bg-store-muted/20 flex items-center justify-center">
            <span className="text-5xl">🔍</span>
          </div>
          <h1 className="text-2xl font-black text-store-dark">المنتج غير موجود</h1>
          <p className="text-gray-500 font-medium">عذراً، لم نتمكن من العثور على هذا المنتج</p>
          <Link href="/">
            <Button className="gap-2">
              <ArrowRight size={18} />
              العودة للرئيسية
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-store-muted/20 to-white">
      <Navbar />

      <main className="flex-1 py-6 md:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-store hover:text-store-dark mb-6 md:mb-8 font-bold transition-colors group"
          >
            <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            <span>العودة</span>
          </button>

          <div className="bg-white rounded-[2rem] shadow-xl border border-neutral-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto relative bg-store-muted/20">
                <Image
                  src={product.image || '/placeholder.png'}
                  alt={product.name || 'منتج'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>

              <div className="w-full lg:w-1/2 p-6 md:p-10 lg:py-12 flex flex-col justify-between space-y-6 lg:space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-store-gold bg-store-gold/5 px-4 py-1.5 rounded-full border border-store-gold/10">
                      {product.category?.name || 'مستحضرات تجميل'}
                    </span>
                    <div className="flex items-center bg-store-muted/50 px-3 py-1.5 rounded-full">
                      <Star size={14} className="text-store-gold fill-store-gold ml-1.5" />
                      <span className="text-xs font-black text-store-dark">4.8</span>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                      {product.name}
                    </h1>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-black text-store-dark flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-store rounded-full" />
                      وصف المنتج:
                    </h4>
                    <p className="text-gray-600 text-base leading-relaxed font-medium">
                      {product.description}
                    </p>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-store-muted/50 to-white rounded-2xl border border-store/10 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-store/10 flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 bg-store rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-store uppercase tracking-wider">تركيبة هندية متطورة</p>
                      <p className="text-sm font-bold text-gray-600">غنية بالكافيين لنتائج في ٣٠ يوم</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 line-through decoration-store-gold/40 font-bold mb-1">
                        {((product.price || 0) * 1.2).toFixed(2)} ج.م
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black text-store tracking-tighter">
                          {(product.price || 0).toLocaleString('en-US')}
                        </span>
                        <span className="text-xl font-bold text-store">ج.م</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      size="lg"
                      className="h-14 rounded-2xl bg-store hover:bg-store-dark text-white shadow-xl shadow-store/20 transition-all active:scale-95 font-black text-lg gap-3"
                      onClick={handleAddToCart}
                      isLoading={isAddingToCart}
                    >
                      <ShoppingCart size={24} />
                      أضف للسلة
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 rounded-2xl border-2 border-store text-store hover:bg-store hover:text-white shadow-lg transition-all active:scale-95 font-black text-lg gap-3"
                      onClick={handleBuyNow}
                    >
                      <CreditCard size={24} />
                      اشتري الآن
                    </Button>
                  </div>

                  <div className="mt-8 flex items-center justify-center">
                    <Link href="/">
                      <Button variant="ghost" className="text-gray-500 hover:text-store font-bold gap-2">
                        <ArrowRight size={20} />
                        العودة للمتجر
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}