import React, { useState, useEffect } from 'react';
import { apiClient } from '@ugbazaar/shared';

interface Order {
  _id: string;
  orderId: string;
  status: string;
  total: number;
  createdAt: string;
  paymentStatus: string;
  paymentMethod: string;
  user?: {
    name: string;
    mobile: string;
  };
}

export default function Orders() {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [isOrderStatusModalOpen, setIsOrderStatusModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState('Placed');
  const [orderStatusNote, setOrderStatusNote] = useState('');

  const loadOrders = async () => {
    try {
      const res = await apiClient('/orders/admin/all');
      if (res.success && res.orders) {
        setOrdersList(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadOrders();
    }, 0);
  }, []);

  const openOrderStatusModal = (order: Order) => {
    setSelectedOrderId(order._id);
    setOrderStatus(order.status);
    setOrderStatusNote('');
    setIsOrderStatusModalOpen(true);
  };

  const handleOrderStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;

    try {
      const res = await apiClient(`/orders/admin/${selectedOrderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({
          status: orderStatus,
          note: orderStatusNote || `Status updated to ${orderStatus} by Admin`
        })
      });

      if (res.success) {
        setIsOrderStatusModalOpen(false);
        loadOrders();
      }
    } catch (err) {
      const error = err as Error;
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Placed': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Packed': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Out For Delivery': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-green-50 text-brand-green border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'Returned': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-brand-muted border-brand-border';
    }
  };

  return (
    <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
      <h2 className="font-extrabold text-lg text-brand-dark">Orders Management log</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border text-xs font-bold text-brand-muted uppercase bg-brand-light/35">
              <th className="py-4 px-4">Order ID</th>
              <th className="py-4 px-4">Customer</th>
              <th className="py-4 px-4">Type</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right">Grand Total</th>
              <th className="py-4 px-4 text-center">Timeline Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light text-sm font-semibold">
            {ordersList.map((o) => (
              <tr key={o._id} className="hover:bg-brand-light/30">
                <td className="py-4 px-4 font-extrabold text-brand-dark">{o.orderId}</td>
                <td className="py-4 px-4">{o.deliveryAddress?.name || 'Customer'}</td>
                <td className="py-4 px-4 capitalize">{o.type}</td>
                <td className="py-4 px-4">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right font-extrabold text-brand-dark">₹{o.total}</td>
                <td className="py-4 px-4 text-center">
                  <button 
                    onClick={() => openOrderStatusModal(o)}
                    className="bg-brand-light hover:bg-slate-200 border rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer"
                  >
                    Modify Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: MODIFY ORDER STATUS */}
      {isOrderStatusModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-brand-border shadow-2xl rounded-3xl p-6 md:p-8 max-w-md w-full animate-slide-up">
            <h3 className="font-extrabold text-lg text-brand-dark mb-4">
              Update Order Status
            </h3>
            
            <form onSubmit={handleOrderStatusChange} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Select Status</label>
                <select 
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                >
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Timeline Status Note</label>
                <textarea 
                  value={orderStatusNote}
                  onChange={(e) => setOrderStatusNote(e.target.value)}
                  placeholder="e.g. Packing items at Talodhi hub, Handed over to courier"
                  className="w-full bg-brand-light border rounded-xl p-3 text-xs outline-none h-20 resize-none font-bold"
                  required
                ></textarea>
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-brand-light">
                <button
                  type="button"
                  onClick={() => setIsOrderStatusModalOpen(false)}
                  className="btn-secondary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
