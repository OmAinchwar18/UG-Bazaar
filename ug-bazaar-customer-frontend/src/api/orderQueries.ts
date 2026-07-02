import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './apiClient';

import { Order, OrderItem } from '@ugbazaar/shared';
export type { Order, OrderItem };

export function useMyOrders() {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: () => apiClient<{ success: boolean; orders: Order[] }>('/orders/my-orders'),
  });
}

export function useOrderDetails(id?: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => apiClient<{ success: boolean; order: Order }>(`/orders/${id}`),
    enabled: !!id,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderData: any) => apiClient<{ success: boolean; order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient<{ success: boolean; message: string }>(`/orders/${id}/cancel`, {
      method: 'PUT'
    }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    }
  });
}

export function useAdminOrders(filters: Record<string, string | number | boolean> = {}) {
  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      return apiClient<{ success: boolean; total: number; orders: Order[] }>(`/orders/admin/all?${params.toString()}`);
    }
  });
}

export function useAdminUpdateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: string; note?: string }) => apiClient<{ success: boolean; message: string }>(`/orders/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note })
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    }
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiClient<{ success: boolean; stats: any }>('/orders/admin/dashboard'),
  });
}
export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => apiClient<{ success: boolean; cart: any }>('/cart'),
  });
}
export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) => apiClient('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, qty })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, qty }: { productId: string; qty: number }) => apiClient(`/cart/update/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ qty })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}
export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient('/cart/clear', {
      method: 'DELETE'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
}
