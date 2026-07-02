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
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Out for Delivery' | 'Ready for Pickup' | 'Delivered' | 'Picked Up' | 'Cancelled' | 'Refunded';
  statusHistory: Array<{ status: string; updatedAt: string; note?: string }>;
  payment: {
    method: 'upi' | 'card' | 'netbanking' | 'cod';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: string;
  };
  createdAt: string;
}
