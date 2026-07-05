const getApiBase = (): string => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000/api';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    hostname.endsWith('.local') ||
    protocol === 'file:';

  if (isLocal) {
    // If it's localhost or loopback, use explicit IPv4 loopback to avoid DNS/IPv6 resolution delays on Windows
    if (hostname === 'localhost' || hostname === '::1' || hostname === '[::1]') {
      return 'http://127.0.0.1:5000/api';
    }
    return `http://${hostname}:5000/api`;
  }

  return 'https://ug-bazaar-backend-production.up.railway.app/api';
};

export const API_BASE = getApiBase();

export async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('ug_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Error ${res.status}`);
  }

  return data;
}
