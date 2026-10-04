'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useGetCartQuery, useUpdateCartItemMutation, useRemoveFromCartMutation } from '@/store/api/cartApiSlice';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { DISCOUNT_PERCENTAGE, getOriginalPriceBeforeDiscount } from '@/utils/discount';

export default function CartPage() {
  const { data: cartData, isLoading, error } = useGetCartQuery(undefined);

  const [updateItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveFromCartMutation();

  const cart = cartData?.data || { items: [] };
  const subtotal = cart.items.reduce((acc: number, item: any) => acc + (item.product?.price * item.quantity), 0);
  const subtotalBeforeDiscount = cart.items.reduce((acc: number, item: any) => acc + (getOriginalPriceBeforeDiscount(item.product?.price || 0) * item.quantity), 0);
  const shipping = 0;
  const total = subtotal;

  const handleQuantityChange = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await updateItem({ productId, quantity: newQty }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (productId: string, productName: string) => {
    try {
      const response = await removeItem(productId).unwrap();
      if (response?.success) {
        toast.info(`تم حذف ${productName} من السلة 🗑️`);
      }
    } catch (err) {
      console.error(err);
      toast.error('عذراً، حدث خطأ أثناء الحذف. يرجى المحاولة مرة أخرى.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-store"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50/90 via-store-muted/20 to-gray-50/90">
      <Navbar />

      <main className="flex-1 py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-store-black mb-6 md:mb-8">سلة المشتريات</h1>

          {cart.items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {cart.items.map((item: any) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      key={item._id}
                      className="bg-white p-3 md:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 lg:gap-6"
                    >
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-gray-50 flex-shrink-0">
                        <img 
                          src={item.product?.image} 
                          alt={item.product?.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm md:text-lg truncate md:whitespace-normal">{item.product?.name}</h3>
                            <p className="text-gray-400 text-[10px] md:text-sm">{item.product?.category?.name || 'مستحضرات تجميل'}</p>
                          </div>
                          <button 
                            onClick={() => handleRemove(item.product?._id, item.product?.name)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={18} className="md:w-5 md:h-5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-center mt-3 md:mt-4">
                          <div className="flex items-center bg-gray-50 rounded-lg p-0.5 md:p-1">
                            <button 
                              onClick={() => handleQuantityChange(item.product?._id, item.quantity - 1)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"
                            >
                              <Minus size={14} className="md:w-4 md:h-4" />
                            </button>
                            <span className="w-7 md:w-10 text-center font-bold text-gray-700 text-sm md:text-base">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.product?._id, item.quantity + 1)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm rounded-md transition-all"
                            >
                              <Plus size={14} className="md:w-4 md:h-4" />
                            </button>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 font-bold line-through leading-none mb-0.5">
                              {(getOriginalPriceBeforeDiscount(item.product?.price || 0) * item.quantity).toFixed(2)} ج.م
                            </span>
                            <span className="font-extrabold text-store text-sm md:text-lg">{(item.product?.price * item.quantity).toFixed(2)} ج.م</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">ملخص الطلب</h2>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-400 text-sm">
                      <span>السعر قبل الخصم</span>
                      <span className="line-through">{subtotalBeforeDiscount.toFixed(2)} ج.م</span>
                    </div>

                    <div className="flex justify-between text-rose-500 font-bold">
                      <span>خصم {DISCOUNT_PERCENTAGE}٪</span>
                      <span>- {(subtotalBeforeDiscount - subtotal).toFixed(2)} ج.م</span>
                    </div>

                    <div className="flex justify-between text-gray-500">
                      <span>المجموع الفرعي بعد الخصم</span>
                      <span>{subtotal.toFixed(2)} ج.م</span>
                    </div>

                    <div className="border-t border-gray-50 pt-4 flex justify-between text-xl font-extrabold text-store-black">
                      <span>الإجمالي</span>
                      <span className="text-store">{total.toFixed(2)} ج.م</span>
                    </div>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full py-4 rounded-2xl text-lg font-bold bg-store hover:bg-store-dark text-white border-0 shadow-lg">
                      إتمام الشراء
                    </Button>
                  </Link>
                  
                  <Link href="/" className="mt-4 flex items-center justify-center text-gray-400 text-sm hover:text-store transition-colors">
                    <ArrowRight size={16} className="ml-2" />
                    مواصلة التسوق
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-store/15">
              <div className="mx-auto w-24 h-24 bg-store-muted rounded-full flex items-center justify-center mb-6 text-store/40 ring-1 ring-store/10">
                <ShoppingBag size={48} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">سلتك فارغة</h2>
              <p className="text-gray-500 mt-2 mb-10 text-lg">يبدو أنك لم تضيفي أي منتجات للسلة بعد</p>
              <Link href="/">
                <Button size="lg" className="rounded-2xl px-12 bg-store hover:bg-store-dark text-white border-0 shadow-lg">تسوقي الآن</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
