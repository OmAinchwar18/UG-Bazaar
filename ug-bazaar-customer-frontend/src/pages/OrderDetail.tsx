import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useOrderDetails, useCancelOrder } from '../api/orderQueries';
import { apiClient, API_BASE } from '../api/apiClient';
import { getProductThumbnail } from '@ugbazaar/shared';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  CheckCircle2, XCircle, CreditCard, Calendar, 
  MapPin, ShoppingBag, ArrowLeft, Trash2, Truck, FileText, Printer, Download
} from 'lucide-react';

export default function OrderDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';

  const { user } = useSelector((state: RootState) => state.auth);

  const { data: orderData, isLoading } = useOrderDetails(id);
  const order = orderData?.order;

  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();

  const handleCancel = () => {
    if (confirm('Aap sach mein ye order cancel karna chahte hain?')) {
      cancelOrder(id, {
        onSuccess: () => {
          alert('Order Cancelled successfully.');
        }
      });
    }
  };

  const handleViewInvoice = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/${id}/invoice/view`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ug_token')}`
        }
      });
      if (!response.ok) throw new Error('Invoice view failed.');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(blobUrl, '_blank');
    } catch (err: any) {
      alert(`Error viewing invoice: ${err.message}`);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/${id}/invoice/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ug_token')}`
        }
      });
      if (!response.ok) throw new Error('Invoice download failed.');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `invoice-${order?.orderId.replace('#', '')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      alert(`Error downloading invoice: ${err.message}`);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/${id}/invoice/view`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ug_token')}`
        }
      });
      if (!response.ok) throw new Error('Invoice loading failed.');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    } catch (err: any) {
      alert(`Error printing invoice: ${err.message}`);
    }
  };

  const triggerRazorpayPayment = async () => {
    if (!order) return;
    try {
      const createRes = await apiClient('/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: order.total, orderId: order._id })
      });
      
      if (!(window as any).Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      const options = {
        key: createRes.key,
        amount: createRes.amount,
        currency: 'INR',
        name: 'UG Bazaar',
        description: `Order Payment for ${order.orderId}`,
        order_id: createRes.orderId,
        prefill: {
          name: order.deliveryAddress?.name || user?.name || '',
          contact: order.deliveryAddress?.mobile || user?.mobile || ''
        },
        theme: {
          color: '#0c831f'
        },
        handler: async (response: any) => {
          try {
            await apiClient('/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order._id
              })
            });
            window.location.reload();
          } catch {
            alert('Verification failed.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      alert(`Razorpay failed: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 w-1/4 rounded"></div>
        <div className="h-96 bg-white rounded-3xl skeleton-pulse"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <h2 className="font-extrabold text-xl text-brand-dark">Order Not Found</h2>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to Home</Link>
      </div>
    );
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Confirmed': case 'Packed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-green-50 text-brand-green border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-brand-muted border-brand-border';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      
      {/* Back button */}
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-dark mb-6 uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Profile</span>
      </Link>

      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-brand-light pb-6">
          <div>
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <h1 className="font-extrabold text-2xl text-brand-dark mt-3">Order {order.orderId}</h1>
            <p className="text-xs text-brand-muted mt-1 flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-brand-muted font-bold">Total Amount</span>
            <span className="font-black text-2xl text-brand-green mt-0.5">₹{order.total}</span>
          </div>
        </div>

        {/* Invoice Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-light/10 border border-brand-border/40 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-green" />
            <div>
              <span className="text-xs font-extrabold text-brand-dark block font-sans">Tax Invoice</span>
              <span className="text-[10px] text-brand-muted font-bold block mt-0.5">GST-ready billing statement</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleViewInvoice}
              className="px-3.5 py-2 bg-white border border-brand-border hover:border-brand-green/40 text-xs font-extrabold text-brand-dark hover:text-brand-green rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Invoice</span>
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="px-3.5 py-2 bg-brand-green hover:bg-brand-green/90 text-xs font-extrabold text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrintInvoice}
              className="px-3.5 py-2 bg-white border border-brand-border hover:border-brand-green/40 text-xs font-extrabold text-brand-dark hover:text-brand-green rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>



        {/* List of items inside order */}
        <div className="space-y-4">
          <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Items Summary</span>
          <div className="divide-y divide-brand-light border border-brand-border/60 rounded-2xl p-4 bg-brand-light/20">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 font-semibold text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl bg-white p-1 rounded-lg border w-8 h-8 flex items-center justify-center overflow-hidden">
                    {getProductThumbnail(item.product?.images) ? (
                      <img src={getProductThumbnail(item.product?.images)} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      '📦'
                    )}
                  </span>
                  <span className="text-brand-dark">{item.name} <span className="text-brand-muted text-xs font-bold">x {item.qty}</span></span>
                </div>
                <span className="font-extrabold text-brand-dark">₹{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recipient Details & Payment info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-brand-light pt-6">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Delivery Address</span>
            <div className="text-sm font-semibold text-brand-dark space-y-1">
              <p className="font-extrabold">{order.deliveryAddress?.name}</p>
              <p>{order.deliveryAddress?.mobile}</p>
              <p className="text-xs text-brand-muted font-medium mt-1 leading-relaxed">
                {order.deliveryAddress?.line}, {order.deliveryAddress?.village}, {order.deliveryAddress?.taluka}, {order.deliveryAddress?.district} - {order.deliveryAddress?.pincode}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t md:border-t-0 md:border-l border-brand-border/60 pt-6 md:pt-0 md:pl-6">
            <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">Payment Details</span>
            <div className="text-sm font-semibold text-brand-dark space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span>Method:</span>
                <span className="font-black uppercase text-brand-green">{order.payment?.method}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Status:</span>
                <span className={`font-black uppercase px-2 py-0.5 border rounded-md ${
                  order.payment?.status === 'paid' ? 'bg-green-50 text-brand-green border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {order.payment?.status}
                </span>
              </div>
              
              {/* Payment trigger */}
              {order.payment?.status !== 'paid' && order.payment?.method !== 'cod' && (
                <button
                  onClick={triggerRazorpayPayment}
                  className="btn-accent w-full text-xs font-black py-2 mt-2"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>PAY ₹{order.total} NOW</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live track & cancel buttons */}
        <div className="border-t border-brand-light pt-6 flex flex-col sm:flex-row justify-between gap-4">
          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <Link 
              to={`/tracking?id=${order._id}`}
              className="btn-primary py-2.5 px-6 text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Track Live Delivery</span>
            </Link>
          )}

          {['Pending', 'Confirmed'].includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="text-xs font-extrabold text-red-500 hover:text-red-700 flex items-center gap-1 hover:underline cursor-pointer border border-transparent px-3 py-2 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isCancelling ? 'Cancelling...' : 'Cancel Order'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
