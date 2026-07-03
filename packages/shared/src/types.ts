export interface User {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  village?: string;
  role: 'user' | 'admin' | 'vendor' | 'driver';
}

export interface Product {
  _id: string;
  name: string;
  nameHindi?: string;
  nameMarathi?: string;
  description?: string;
  dept: 'Grocery' | 'Agriculture' | 'Building Materials' | 'Hardware Tools' | 'Plumbing' | 'Electrical' | 'Furniture' | 'Home Appliances' | 'Electronics' | 'General Store';
  price: number;
  mrp: number;
  cost?: number;
  stock: number;
  images: Array<{ url: string; isPrimary: boolean }>;
  badge?: 'Popular' | 'Hot' | 'Best Buy' | 'Farmer Pick' | 'New' | '';
  tags?: string[];
  ratings?: { average: number; count: number };
  isFeatured?: boolean;
  brand?: string;
  sku?: string;
  minStockLevel?: number;
  purchasePrice?: number;
  supplierName?: string;
}

export interface OrderItem {
  product: any;
  name: string;
  price: number;
  qty: number;
  total: number;
}

export interface Order {
  _id: string;
  orderId: string;
  user: any;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  couponSaving?: number;
  deliveryCharge: number;
  total: number;
  type: 'delivery' | 'pickup';
  deliveryAddress: {
    name: string;
    mobile: string;
    line: string;
    village: string;
    taluka?: string;
    district?: string;
    pincode: string;
    landmark?: string;
  };
  status: string;
  statusHistory: Array<{ status: string; updatedAt: string; note?: string }>;
  payment: {
    method: 'upi' | 'card' | 'netbanking' | 'cod';
    status: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: string;
  };
  cancellationReason?: string;
  cancelledAt?: string;
  returnRequest?: any;
  returnStatus?: string;
  refundStatus?: string;
  refundAmount?: number;
  refundDate?: string;
  refundTransactionId?: string;
  refundMethod?: string;
  orderTimeline?: Array<{ status: string; note?: string; updatedAt: string }>;
  createdAt: string;
}

export interface ReturnRequest {
  _id: string;
  order: any;
  customer: any;
  products: any[];
  reason: string;
  images?: string[];
  comments?: string;
  status: string;
  adminNotes?: string;
  refundAmount?: number;
  refundTransactionId?: string;
  refundMethod?: string;
  createdAt: string;
  updatedAt: string;
}
