'use client';

import React, { useMemo, useState } from 'react';
import {
  useCreateShippingRateMutation,
  useDeleteShippingRateMutation,
  useGetShippingRatesQuery,
  useUpdateShippingRateMutation,
} from '@/store/api/shippingRatesApiSlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Plus, Edit, Trash2, MapPin, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

type ShippingRateRow = {
  _id: string;
  governorate: string;
  cost: number;
  time: string;
};

export default function ShippingRatesAdminPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingRateRow | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetShippingRatesQuery(undefined);
  const [createRate, { isLoading: isCreating }] = useCreateShippingRateMutation();
  const [updateRate, { isLoading: isUpdating }] = useUpdateShippingRateMutation();
  const [deleteRate, { isLoading: isDeleting }] = useDeleteShippingRateMutation();

  const rates: ShippingRateRow[] = useMemo(() => data?.data || [], [data]);

  const [form, setForm] = useState<{ governorate: string; cost: string; time: string }>({
    governorate: '',
    cost: '',
    time: '',
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ governorate: '', cost: '', time: '' });
    setIsModalOpen(true);
  };

  const openEdit = (row: ShippingRateRow) => {
    setEditing(row);
    setForm({
      governorate: row.governorate || '',
      cost: String(row.cost ?? ''),
      time: row.time || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const governorate = form.governorate.trim();
    const time = form.time.trim();
    const costNumber = Number(form.cost);

    if (!governorate) return alert('يرجى إدخال اسم المحافظة');
    if (!time) return alert('يرجى إدخال مدة التوصيل');
    if (!Number.isFinite(costNumber) || costNumber < 0) return alert('يرجى إدخال تكلفة شحن صحيحة');

    try {
      if (editing?._id) {
        await updateRate({
          id: editing._id,
          body: { governorate, cost: costNumber, time },
        }).unwrap();
      } else {
        await createRate({ governorate, cost: costNumber, time }).unwrap();
      }

      closeModal();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'حدث خطأ أثناء حفظ بيانات الشحن');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المحافظة من أسعار الشحن؟')) return;
    try {
      await deleteRate(id).unwrap();
      refetch();
    } catch (err: any) {
      alert(err?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const busy = isCreating || isUpdating;

  return (
    <div className="space-y-8 md:space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">إعدادات الشحن</h1>
          <p className="text-sm md:text-lg text-slate-500 mt-1 md:mt-2 font-medium tracking-tight">
            إدارة المحافظات، تكلفة الشحن ووقت التوصيل
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary flex items-center group py-3 px-6 md:py-4 md:px-8 text-sm md:text-base"
        >
          <Plus size={18} className="ml-2 md:ml-3 group-hover:rotate-90 transition-transform duration-300" />
          إضافة محافظة
        </button>
      </header>

      <div className="card-modern overflow-hidden border-none shadow-none md:border md:shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">المحافظة</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">التكلفة</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">الوقت</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-10">
                      <div className="h-6 w-64 bg-slate-100 rounded-lg"></div>
                    </td>
                  </tr>
                ))
              ) : rates.length > 0 ? (
                rates.map((row) => (
                  <tr key={row._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                          <MapPin size={18} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-lg tracking-tight">{row.governorate}</span>
                          <span className="text-xs text-slate-400 font-bold mt-1">ID: {row._id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-rose-600 tracking-tight">{row.cost}</span>
                        <span className="text-xs font-black text-slate-400 uppercase">جنيه</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-black tracking-tight">
                        {row.time}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEdit(row)}
                          className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-100 transition-all duration-300 active:scale-90"
                          title="تعديل"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(row._id)}
                          disabled={isDeleting}
                          className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white hover:shadow-lg hover:shadow-rose-100 transition-all duration-300 active:scale-90 disabled:opacity-60 disabled:cursor-not-allowed"
                          title="حذف"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-16">
                    <div className="text-center text-slate-400 font-black">
                      لا توجد محافظات مضافة بعد
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden p-4 space-y-4">
          {(isLoading || isFetching) && (
            <div className="h-24 bg-slate-100 animate-pulse rounded-[2rem]" />
          )}
          {!isLoading && rates.map((row) => (
            <motion.div
              key={row._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-modern p-grid-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="font-black text-slate-900">{row.governorate}</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">{row.time}</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-600">{row.cost}</div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  onClick={() => openEdit(row)}
                  className="p-3 bg-blue-50 text-blue-600 rounded-2xl active:scale-90"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(row._id)}
                  className="p-3 bg-rose-50 text-rose-600 rounded-2xl active:scale-90"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editing ? 'تعديل بيانات الشحن' : 'إضافة محافظة جديدة'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="py-4 space-y-5">
          <Input
            label="اسم المحافظة"
            placeholder="مثال: القاهرة"
            required
            value={form.governorate}
            onChange={(e) => setForm((f) => ({ ...f, governorate: e.target.value }))}
            id="governorate"
          />
          <Input
            label="تكلفة الشحن"
            placeholder="مثال: 70"
            required
            type="number"
            value={form.cost}
            onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
            id="cost"
          />
          <Input
            label="وقت التوصيل"
            placeholder="مثال: 24 ل 48 ساعة"
            required
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            id="time"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-6 py-3 rounded-2xl font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn-primary px-8 py-3 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {busy ? (
                <>
                  <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : (
                'حفظ'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

