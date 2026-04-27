import { apiSlice } from './apiSlice';
import type { GetProductsArg, GetProductsResponse } from '@/types/productsApi';

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<GetProductsResponse, GetProductsArg | void>({
      query: (arg) => {
        const { page = 1, limit = 10, category = '' } = arg || {};
        const params = new URLSearchParams();
        params.append('pageNumber', page.toString());
        params.append('limit', limit.toString());
        if (category) {
          params.append('category', category);
        }
        return `/products?${params.toString()}`;
      },
      providesTags: ['Product'],
    }),
    getProductById: builder.query<any, string>({
      query: (id) => `/products/${id}`,
      keepUnusedDataFor: 300,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation({
      query: (formData) => ({
        url: '/products',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApiSlice;
