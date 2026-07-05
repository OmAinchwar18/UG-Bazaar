import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useOrderDetails, useCancelOrder, useReturnOrder } from '../api/orderQueries';
import { apiClient, API_BASE } from '../api/apiClient';
import { getProductThumbnail, getTranslated } from '@ugbazaar/shared';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useTranslation } from '../hooks/useTranslation';
import { 
  CheckCircle2, XCircle, CreditCard, Calendar, 
  MapPin, ArrowLeft, Trash2, Truck, FileText, Printer, Download, Undo, Upload, RotateCcw
} from 'lucide-react';

export default function OrderDetail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';
  const { currentDict, lang } = useTranslation();

  const { user } = useSelector((state: RootState) => state.auth);

  const { data: orderData, isLoading } = useOrderDetails(id);
  const order = orderData?.order;

  const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder();
  const { mutate: returnOrder, isPending: isReturning } = useReturnOrder();

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelText, setCancelText] = useState('');

  // Return Modal State
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged product');
  const [returnComments, setReturnComments] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingReturnImages, setUploadingReturnImages] = useState(false);

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    cancelOrder(
      { id, reason: cancelReason, comments: cancelText },
      {
        onSuccess: () => {
          alert(lang === 'hi' ? 'ऑर्डर सफलतापूर्वक रद्द कर दिया गया।' : lang === 'mr' ? 'ऑर्डर यशस्वीपणे रद्द केली.' : 'Order Cancelled successfully.');
          setIsCancelModalOpen(false);
        },
        onError: (err: any) => {
          alert(err.message || 'Cancellation failed.');
        }
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (files.length > 5) {
      alert(lang === 'hi' ? 'आप केवल 5 तस्वीरें तक ही अपलोड कर सकते हैं।' : lang === 'mr' ? 'तुम्ही फक्त ५ प्रतिमा अपलोड करू शकता.' : 'You can only upload up to 5 images as proof.');
      return;
    }

    setUploadingReturnImages(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const token = localStorage.getItem('ug_token');
      const res = await fetch(`${API_BASE}/upload/return`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.urls) {
        setUploadedImages(data.urls);
        alert(lang === 'hi' ? 'प्रमाण फ़ाइलें सफलतापूर्वक अपलोड हो गईं।' : lang === 'mr' ? 'पुरावा फाइली यशस्वीपणे अपलोड केल्या.' : 'Proof images uploaded successfully.');
      } else {
        alert(data.message || 'Image upload failed.');
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingReturnImages(false);
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    returnOrder(
      {
        id,
        reason: returnReason,
        comments: returnComments,
        images: uploadedImages
      },
      {
        onSuccess: () => {
          alert(lang === 'hi' ? 'वापसी अनुरोध सफलतापूर्वक जमा कर दिया गया।' : lang === 'mr' ? 'परतावा विनंती यशस्वीपणे सबमिट केली.' : 'Return request submitted successfully.');
          setIsReturnModalOpen(false);
          setUploadedImages([]);
          setReturnComments('');
        },
        onError: (err: any) => {
          alert(err.message || 'Return submission failed.');
        }
      }
    );
  };

  const getDeliveredDate = () => {
    const deliveredEvent = order?.statusHistory?.find((h: any) => h.status === 'Delivered');
    return deliveredEvent ? new Date(deliveredEvent.updatedAt) : (order ? new Date((order as any).updatedAt || order.createdAt) : new Date());
  };

  const isReturnEligible = () => {
    if (!order || order.status !== 'Delivered') return false;
    const deliveredAt = getDeliveredDate();
    const diffTime = Math.abs(new Date().getTime() - deliveredAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
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
        <h2 className="font-extrabold text-xl text-brand-dark">
          {lang === 'hi' ? 'ऑर्डर नहीं मिला' : lang === 'mr' ? 'ऑर्डर आढळला नाही' : 'Order Not Found'}
        </h2>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          {lang === 'hi' ? 'होम पेज पर वापस जाएं' : lang === 'mr' ? 'मुख्यपृष्ठावर परत जा' : 'Back to Home'}
        </Link>
      </div>
    );
  }

  const getOrderStatusText = (s: string) => {
    const map: Record<string, Record<string, string>> = {
      Placed: { en: 'Placed', hi: 'ऑर्डर भेजा गया', mr: 'ऑर्डर पाठवली' },
      Confirmed: { en: 'Confirmed', hi: 'पुष्टि की गई', mr: 'पुष्टी केली' },
      Packed: { en: 'Packed', hi: 'पैक किया गया', mr: 'पॅक केले' },
      Shipped: { en: 'Shipped', hi: 'भेजा गया', mr: 'पाठवले' },
      'Out For Delivery': { en: 'Out For Delivery', hi: 'वितरण के लिए बाहर', mr: 'डिलिव्हरीसाठी बाहेर' },
      Delivered: { en: 'Delivered', hi: 'वितरित हुआ', mr: 'वितरित झाले' },
      Cancelled: { en: 'Cancelled', hi: 'रद्द किया गया', mr: 'रद्द केले' },
      'Return Requested': { en: 'Return Requested', hi: 'वापसी का अनुरोध', mr: 'परतावा विनंती केली' },
      'Refund Completed': { en: 'Refund Completed', hi: 'रिफंड पूरा हुआ', mr: 'परतावा पूर्ण झाला' }
    };
    return map[s]?.[lang] || map[s]?.en || s;
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
      case 'Return Requested': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Refund Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-brand-muted border-brand-border';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      
      {/* Back button */}
      <Link to="/profile" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-dark mb-6 uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'hi' ? 'प्रोफाइल पर वापस जाएं' : lang === 'mr' ? 'प्रोफाइलवर परत जा' : 'Back to Profile'}</span>
      </Link>

      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-brand-light pb-6">
          <div>
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
              {getOrderStatusText(order.status)}
            </span>
            <h1 className="font-extrabold text-2xl text-brand-dark mt-3">
              {lang === 'hi' ? 'ऑर्डर' : lang === 'mr' ? 'ऑर्डर' : 'Order'} {order.orderId}
            </h1>
            <p className="text-xs text-brand-muted mt-1 flex items-center gap-1.5 font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(order.createdAt).toLocaleDateString(lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-brand-muted font-bold">{lang === 'hi' ? 'कुल राशि' : lang === 'mr' ? 'एकूण रक्कम' : 'Total Amount'}</span>
            <span className="font-black text-2xl text-brand-green mt-0.5">₹{order.total}</span>
          </div>
        </div>

        {/* Invoice Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-light/10 border border-brand-border/40 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-green" />
            <div>
              <span className="text-xs font-extrabold text-brand-dark block font-sans">
                {lang === 'hi' ? 'टैक्स इनवॉइस' : lang === 'mr' ? 'कर बीजक (टॅक्स इनव्हॉइस)' : 'Tax Invoice'}
              </span>
              <span className="text-[10px] text-brand-muted font-bold block mt-0.5">GST-ready billing statement</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleViewInvoice}
              className="px-3.5 py-2 bg-white border border-brand-border hover:border-brand-green/40 text-xs font-extrabold text-brand-dark hover:text-brand-green rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'इनवॉइस देखें' : lang === 'mr' ? 'इनव्हॉइस पहा' : 'View Invoice'}</span>
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="px-3.5 py-2 bg-brand-green hover:bg-brand-green/90 text-xs font-extrabold text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पीडीएफ डाउनलोड करें' : lang === 'mr' ? 'पीडीएफ डाउनलोड करा' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handlePrintInvoice}
              className="px-3.5 py-2 bg-white border border-brand-border hover:border-brand-green/40 text-xs font-extrabold text-brand-dark hover:text-brand-green rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'इनवॉइस प्रिंट करें' : lang === 'mr' ? 'इनव्हॉइस प्रिंट करा' : 'Print Invoice'}</span>
            </button>
          </div>
        </div>

        {/* Visual Stepper Timeline */}
        {order.orderTimeline && order.orderTimeline.length > 0 && (
          <div className="border border-brand-border/50 rounded-2xl p-5 bg-[#fafbfd] space-y-4">
            <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">
              {lang === 'hi' ? 'ऑर्डर ट्रैकिंग यात्रा' : lang === 'mr' ? 'ऑर्डर ट्रॅकिंग प्रवास' : 'Order Tracking Journey'}
            </span>
            <div className="relative pl-6 border-l-2 border-brand-green/30 space-y-5">
              {order.orderTimeline.map((step: any, idx: number) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-brand-green border-2 border-white rounded-full shadow-sm ring-4 ring-brand-green/10"></div>
                  <p className="text-xs font-black text-brand-dark leading-none uppercase">{getOrderStatusText(step.status)}</p>
                  {step.note && <p className="text-xs text-brand-muted font-medium mt-1 leading-relaxed">{step.note}</p>}
                  <p className="text-[10px] text-brand-muted font-bold mt-1">
                    {new Date(step.updatedAt).toLocaleDateString(lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN', { 
                      hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refund Status Segment if active */}
        {order.refundStatus && order.refundStatus !== 'None' && (
          <div className="border border-emerald-100 rounded-2xl p-4 bg-emerald-50/25 space-y-2.5">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">
              {lang === 'hi' ? 'रिफंड स्थिति विवरण' : lang === 'mr' ? 'परतावा स्थिती तपशील' : 'Refund Status Details'}
            </span>
            <div className="grid grid-cols-2 gap-4 text-xs font-bold">
              <div>
                <span className="text-brand-muted block uppercase text-[10px]">{lang === 'hi' ? 'रिफंड स्थिति' : lang === 'mr' ? 'परतावा स्थिती' : 'Refund State'}</span>
                <span className="text-emerald-700 font-extrabold text-sm capitalize">{order.refundStatus}</span>
              </div>
              {(order.refundAmount ?? 0) > 0 && (
                <div>
                  <span className="text-brand-muted block uppercase text-[10px]">{lang === 'hi' ? 'रिफंड की गई राशि' : lang === 'mr' ? 'परतावा केलेली रक्कम' : 'Amount Refunded'}</span>
                  <span className="text-brand-dark font-extrabold text-sm">₹{order.refundAmount}</span>
                </div>
              )}
              {order.refundMethod && (
                <div>
                  <span className="text-brand-muted block uppercase text-[10px]">{lang === 'hi' ? 'रिफंड विधि' : lang === 'mr' ? 'परतावा पद्धत' : 'Refund Method'}</span>
                  <span className="text-brand-dark uppercase">{order.refundMethod}</span>
                </div>
              )}
              {order.refundTransactionId && (
                <div>
                  <span className="text-brand-muted block uppercase text-[10px]">Transaction ID</span>
                  <span className="text-brand-dark font-mono text-[11px]">{order.refundTransactionId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* List of items inside order */}
        <div className="space-y-4">
          <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">
            {lang === 'hi' ? 'सामग्री का सारांश' : lang === 'mr' ? 'वस्तूंचा सारांश' : 'Items Summary'}
          </span>
          <div className="divide-y divide-brand-light border border-brand-border/60 rounded-2xl p-4 bg-brand-light/20">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 font-semibold text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xl bg-white p-1 rounded-lg border w-8 h-8 flex items-center justify-center overflow-hidden">
                    {getProductThumbnail(item.product?.images) ? (
                      <img src={getProductThumbnail(item.product?.images)} alt={getTranslated(item.product?.name, lang) || item.name} className="w-full h-full object-contain" />
                    ) : (
                      '📦'
                    )}
                  </span>
                  <span className="text-brand-dark">
                    {getTranslated(item.product?.name, lang) || item.name} <span className="text-brand-muted text-xs font-bold">x {item.qty}</span>
                  </span>
                </div>
                <span className="font-extrabold text-brand-dark">₹{item.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recipient Details & Payment info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-brand-light pt-6">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">
              {lang === 'hi' ? 'डिलिव्हरी पता' : lang === 'mr' ? 'डिलिव्हरी पत्ता' : 'Delivery Address'}
            </span>
            <div className="text-sm font-semibold text-brand-dark space-y-1">
              <p className="font-extrabold">{order.deliveryAddress?.name}</p>
              <p>{order.deliveryAddress?.mobile}</p>
              <p className="text-xs text-brand-muted font-medium mt-1 leading-relaxed">
                {order.deliveryAddress?.line}, {order.deliveryAddress?.village}, {order.deliveryAddress?.taluka}, {order.deliveryAddress?.district} - {order.deliveryAddress?.pincode}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t md:border-t-0 md:border-l border-brand-border/60 pt-6 md:pt-0 md:pl-6">
            <span className="text-xs font-extrabold text-brand-muted uppercase tracking-wider block">
              {lang === 'hi' ? 'भुगतान विवरण' : lang === 'mr' ? 'पेमेंट तपशील' : 'Payment Details'}
            </span>
            <div className="text-sm font-semibold text-brand-dark space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span>{lang === 'hi' ? 'विधि:' : lang === 'mr' ? 'पद्धत:' : 'Method:'}</span>
                <span className="font-black uppercase text-brand-green">{order.payment?.method}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>{lang === 'hi' ? 'स्थिति:' : lang === 'mr' ? 'स्थिती:' : 'Status:'}</span>
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
                  <span>{lang === 'hi' ? `अभी ₹${order.total} भुगतान करें` : lang === 'mr' ? `आता ₹${order.total} पेमेंट करा` : `PAY ₹${order.total} NOW`}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live track & cancel buttons */}
        <div className="border-t border-brand-light pt-6 flex flex-col sm:flex-row justify-between gap-4">
          {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.status !== 'Refund Completed' && (
            <Link 
              to={`/tracking?id=${order._id}`}
              className="btn-primary py-2.5 px-6 text-xs font-extrabold flex items-center justify-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>{lang === 'hi' ? 'लाइव डिलीवरी ट्रैक करें' : lang === 'mr' ? 'लाइव्ह डिलिव्हरी ट्रॅक करा' : 'Track Live Delivery'}</span>
            </Link>
          )}

          <div className="flex items-center gap-3 ml-auto">
            {['Placed', 'Confirmed', 'Pending'].includes(order.status) && (
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="text-xs font-extrabold text-red-500 hover:text-red-700 flex items-center gap-1.5 hover:underline cursor-pointer border hover:bg-red-50 px-3 py-2 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
                <span>{lang === 'hi' ? 'ऑर्डर रद्द करें' : lang === 'mr' ? 'ऑर्डर रद्द करा' : 'Cancel Order'}</span>
              </button>
            )}

            {isReturnEligible() && (
              <button
                onClick={() => setIsReturnModalOpen(true)}
                className="text-xs font-extrabold text-brand-green hover:text-green-800 flex items-center gap-1.5 hover:underline cursor-pointer border hover:bg-green-50 px-3 py-2 rounded-xl"
              >
                <Undo className="w-4 h-4" />
                <span>{lang === 'hi' ? 'ऑर्डर वापस करें' : lang === 'mr' ? 'ऑर्डर परत करा' : 'Return Order'}</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: CANCEL ORDER */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border shadow-2xl rounded-3xl p-6 md:p-8 max-w-md w-full animate-slide-up">
            <h3 className="font-extrabold text-lg text-brand-dark mb-4">
              {lang === 'hi' ? 'ऑर्डर रद्द करें' : lang === 'mr' ? 'ऑर्डर रद्द करा' : 'Cancel Order'}
            </h3>
            
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">
                  {lang === 'hi' ? 'रद्द करने का कारण' : lang === 'mr' ? 'रद्द करण्याचे कारण' : 'Reason for Cancellation'}
                </label>
                <select 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found a better price">Found a better price</option>
                  <option value="Delivery time too long">Delivery time too long</option>
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Wrong product selected">Wrong product selected</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">
                  {lang === 'hi' ? 'अतिरिक्त टिप्पणियाँ (वैकल्पिक)' : lang === 'mr' ? 'अतिरिक्त टिप्पण्या (पर्यायी)' : 'Additional Comments (Optional)'}
                </label>
                <textarea 
                  value={cancelText}
                  onChange={(e) => setCancelText(e.target.value)}
                  placeholder="Kripya cancel karne ka kaaran likhein..."
                  className="w-full bg-brand-light border rounded-xl p-3 text-xs outline-none h-20 resize-none font-bold"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-brand-light">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="btn-secondary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  {lang === 'hi' ? 'पीछे' : lang === 'mr' ? 'मागे' : 'Back'}
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="btn-primary bg-red-500 hover:bg-red-600 text-white py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  {isCancelling ? '...' : (lang === 'hi' ? 'रद्द करने की पुष्टि करें' : lang === 'mr' ? 'रद्द करण्याची पुष्टी करा' : 'Confirm Cancellation')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RETURN ORDER */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border shadow-2xl rounded-3xl p-6 md:p-8 max-w-md w-full animate-slide-up">
            <h3 className="font-extrabold text-lg text-brand-dark mb-4">
              {lang === 'hi' ? 'ऑर्डर वापसी अनुरोध' : lang === 'mr' ? 'ऑर्डर परतावा विनंती' : 'Return Order Request'}
            </h3>
            
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">
                  {lang === 'hi' ? 'वापसी का कारण' : lang === 'mr' ? 'परताव्याचे कारण' : 'Reason for Return'}
                </label>
                <select 
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="Damaged product">Damaged product</option>
                  <option value="Wrong item received">Wrong item received</option>
                  <option value="Missing accessories">Missing accessories</option>
                  <option value="Product not as described">Product not as described</option>
                  <option value="Defective product">Defective product</option>
                  <option value="Quality issue">Quality issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">
                  {lang === 'hi' ? 'प्रमाण फोटो अपलोड करें (अधिकतम 5)' : lang === 'mr' ? 'पुरावा फोटो अपलोड करा (जास्तीत जास्त ५)' : 'Upload Proof Images (Max 5)'}
                </label>
                <div className="flex items-center gap-2">
                  <label className="w-full border-2 border-dashed border-brand-border hover:border-brand-green/50 p-4 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer bg-brand-light/10 hover:bg-brand-light/30 transition-all">
                    <Upload className="w-5 h-5 text-brand-muted" />
                    <span className="text-[10px] font-bold text-brand-dark">{lang === 'hi' ? 'तस्वीरें चुनें' : lang === 'mr' ? 'फोटो निवडा' : 'Choose images'}</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                {uploadingReturnImages && (
                  <span className="text-[10px] font-bold text-brand-green animate-pulse block mt-1">Uploading...</span>
                )}
                {uploadedImages.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto py-1">
                    {uploadedImages.map((img, idx) => (
                      <img key={idx} src={img} alt="proof" className="w-10 h-10 object-cover rounded-lg border bg-white flex-shrink-0" />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">
                  {lang === 'hi' ? 'अतिरिक्त टिप्पणियाँ (वैकल्पिक)' : lang === 'mr' ? 'अतिरिक्त टिप्पण्या (पर्यायी)' : 'Additional Comments (Optional)'}
                </label>
                <textarea 
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Kripya details likhein (damages/issues)..."
                  className="w-full bg-brand-light border rounded-xl p-3 text-xs outline-none h-20 resize-none font-bold"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-brand-light">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="btn-secondary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isReturning || uploadingReturnImages}
                  className="btn-primary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  {isReturning ? '...' : (lang === 'hi' ? 'अनुरोध भेजें' : lang === 'mr' ? 'विनंती सबमिट करा' : 'Submit Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
