import { apiSlice } from './apiSlice';

export type PublicShippingRate = {
  _id: string;
  governorate: string;
  cost: number;
  time: string;
};

export type ShippingRate = PublicShippingRate;

export const shippingRatesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // جلب المحافظات للعملاء (بدون توكن)
    getPublicShippingRates: builder.query<
      { success: boolean; data: PublicShippingRate[] },
      void
    >({
      query: () => ({
        url: '/shippingrates/public',
        method: 'GET',
      }),
    }),

    // جلب كل البيانات للمسؤولين (Admin-only)
    getShippingRates: builder.query<{ success: boolean; data: ShippingRate[] }, void>({
      query: () => ({
        url: '/shippingrates',
        method: 'GET',
      }),
    }),

    // إضافة محافظة جديدة
    createShippingRate: builder.mutation<
      { success: boolean; data: ShippingRate },
      { governorate: string; cost: number; time: string }
    >({
      query: (body) => ({
        url: '/shippingrates',
        method: 'POST',
        body,
      }),
    }),

    // التعديل (هنا تم إصلاح الخطأ 500)
    updateShippingRate: builder.mutation<
      { success: boolean; data: ShippingRate },
      { id: string; body: { governorate: string; cost: number; time: string } }
    >({
      query: ({ id, body }) => ({
        // تأكدنا من إرسال الـ ID في المسار كما تطلب الوثيقة (القسم 3)
        url: `/shippingrates/${id}`,
        method: 'PUT',
        body, // إرسال البيانات (governorate, cost, time) في الـ body
      }),
    }),

    // حذف محافظة
    deleteShippingRate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/shippingrates/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetPublicShippingRatesQuery,
  useGetShippingRatesQuery,
  useCreateShippingRateMutation,
  useUpdateShippingRateMutation,
  useDeleteShippingRateMutation,
} = shippingRatesApiSlice;