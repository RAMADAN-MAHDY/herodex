import { apiSlice } from './apiSlice';

export const cartApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart' as any],
    }),
    addToCart: builder.mutation({
      query: (data) => ({
        url: '/cart',
        method: 'POST',
        body: { productId: data.productId, quantity: data.quantity },
      }),
      async onQueryStarted({ productId, product, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApiSlice.util.updateQueryData('getCart', undefined, (draft) => {
            if (!draft.data) draft.data = { items: [] };
            const targetProductId = product?._id || productId;
            if (!targetProductId) return;
            const existingItem = draft.data.items?.find((item: any) => item.product?._id === targetProductId);
            if (existingItem) {
              existingItem.quantity += quantity;
            } else {
              if (!product) return;
              if (!draft.data.items) draft.data.items = [];
              draft.data.items.push({
                _id: 'temp-id-' + Date.now(),
                product: product,
                quantity: quantity
              });
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Cart' as any],
    }),
    updateCartItem: builder.mutation({
      query: (data) => ({
        url: '/cart',
        method: 'PUT',
        body: data,
      }),
      async onQueryStarted({ productId, quantity }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApiSlice.util.updateQueryData('getCart', undefined, (draft) => {
            const item = draft?.data?.items?.find((i: any) => i.product._id === productId);
            if (item) {
              item.quantity = quantity;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Cart' as any],
    }),
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url: `/cart/${productId}`,
        method: 'DELETE',
      }),
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApiSlice.util.updateQueryData('getCart', undefined, (draft) => {
            if (draft?.data?.items) {
              draft.data.items = draft.data.items.filter((item: any) => item.product._id !== productId);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Cart' as any],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart' as any],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApiSlice;
