import { useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';

import { Product } from '@ugbazaar/shared';
export type { Product };

export function useProducts(filters: Record<string, string | number | boolean> = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
      return apiClient<{ success: boolean; total: number; products: Product[] }>(`/products?${params.toString()}`);
    }
  });
}

export function useProductDetails(id?: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient<{ success: boolean; product: Product }>(`/products/${id}`),
    enabled: !!id,
  });
}

export function useProductSearch(q: string, dept?: string) {
  return useQuery({
    queryKey: ['search', q, dept],
    queryFn: () => {
      const params = new URLSearchParams({ q });
      if (dept) params.append('dept', dept);
      return apiClient<{ success: boolean; count: number; products: Product[] }>(`/products/search?${params.toString()}`);
    },
    enabled: q !== undefined && q !== '',
  });
}

export function useRecommendations(productId?: string, limit = 5) {
  return useQuery({
    queryKey: ['recommendations', productId, limit],
    queryFn: () => {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      params.append('limit', String(limit));
      return apiClient<{ success: boolean; recommendations: Product[] }>(`/products/recommendations?${params.toString()}`);
    }
  });
}
export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: () => apiClient<{ success: boolean; coupons: any[] }>('/coupons')
  });
}
