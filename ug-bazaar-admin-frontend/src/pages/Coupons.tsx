import React, { useState, useEffect } from 'react';
import { apiClient } from '@ugbazaar/shared';
import { Trash2 } from 'lucide-react';

interface Coupon {
  _id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  expiresAt: string;
  isActive?: boolean;
}

export default function Coupons() {
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);

  // Coupon Form
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('percent');
  const [couponValue, setCouponValue] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState('0');
  const [couponExpires, setCouponExpires] = useState('');

  const loadCoupons = async () => {
    try {
      const res = await apiClient('/coupons');
      if (res.success && res.coupons) {
        setCouponsList(res.coupons);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadCoupons();
    }, 0);
  }, []);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponValue || !couponExpires) return;

    try {
      const res = await apiClient('/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: couponCode,
          type: couponType,
          value: parseFloat(couponValue),
          minOrder: parseFloat(couponMinOrder),
          expiresAt: new Date(couponExpires)
        })
      });

      if (res.success) {
        setCouponCode('');
        setCouponValue('');
        setCouponMinOrder('0');
        setCouponExpires('');
        loadCoupons();
      }
    } catch (err) {
      const error = err as Error;
      alert(`Failed to create coupon: ${error.message}`);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await apiClient(`/coupons/${id}`, { method: 'DELETE' });
      if (res.success) {
        loadCoupons();
      }
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Create Coupon Form */}
      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="font-extrabold text-lg text-brand-dark border-b border-brand-light pb-4 mb-4">Create Promo Coupon</h2>
        <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-muted uppercase">Code</label>
            <input 
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="e.g. FESTIVAL10"
              className="w-full bg-brand-light border rounded-xl px-3 py-2 text-xs font-bold outline-none border-brand-border/60"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-muted uppercase">Type</label>
            <select 
              value={couponType}
              onChange={(e) => setCouponType(e.target.value)}
              className="w-full bg-brand-light border rounded-xl px-3 py-2 text-xs font-bold outline-none border-brand-border/60"
            >
              <option value="percent">Percentage (%)</option>
              <option value="flat">Flat Cash (₹)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-muted uppercase">Value</label>
            <input 
              type="number"
              value={couponValue}
              onChange={(e) => setCouponValue(e.target.value)}
              className="w-full bg-brand-light border rounded-xl px-3 py-2 text-xs font-bold outline-none border-brand-border/60"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-muted uppercase">Min Order</label>
            <input 
              type="number"
              value={couponMinOrder}
              onChange={(e) => setCouponMinOrder(e.target.value)}
              className="w-full bg-brand-light border rounded-xl px-3 py-2 text-xs font-bold outline-none border-brand-border/60"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-brand-muted uppercase">Expires At</label>
            <input 
              type="date"
              value={couponExpires}
              onChange={(e) => setCouponExpires(e.target.value)}
              className="w-full bg-brand-light border rounded-xl px-3 py-2 text-xs font-bold outline-none border-brand-border/60"
              required
            />
          </div>
          <button 
            type="submit"
            className="btn-primary py-2.5 px-4 text-xs font-bold sm:col-span-5 w-full mt-3 cursor-pointer"
          >
            Create Coupon Code
          </button>
        </form>
      </div>

      {/* Coupons List */}
      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="font-extrabold text-sm text-brand-dark border-b border-brand-light pb-4 mb-4">Active Coupons</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-xs font-bold text-brand-muted uppercase bg-brand-light/35">
                <th className="py-4 px-4">Coupon Code</th>
                <th className="py-4 px-4">Benefit</th>
                <th className="py-4 px-4 text-right">Min Order</th>
                <th className="py-4 px-4 text-center">Uses</th>
                <th className="py-4 px-4 text-center">Expiry</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light text-sm font-semibold">
              {couponsList.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-brand-light/30">
                  <td className="py-4 px-4 font-mono font-bold text-brand-dark">{coupon.code}</td>
                  <td className="py-4 px-4">{coupon.type === 'percent' ? `${coupon.value}% Discount` : `₹${coupon.value} Flat OFF`}</td>
                  <td className="py-4 px-4 text-right">₹{coupon.minOrder}</td>
                  <td className="py-4 px-4 text-center">{coupon.usedCount} Uses</td>
                  <td className="py-4 px-4 text-center">{new Date(coupon.expiresAt).toLocaleDateString('en-IN')}</td>
                  <td className="py-4 px-4 text-center">
                    <button 
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
