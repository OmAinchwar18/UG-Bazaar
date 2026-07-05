import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateUser } from '../store/slices/authSlice';
import { useMyOrders } from '../api/orderQueries';
import { apiClient, API_BASE } from '../api/apiClient';
import { useTranslation } from '../hooks/useTranslation';
import { 
  User, MapPin, ClipboardList, Mail, Phone, ChevronRight, FileDown
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentDict, lang } = useTranslation();

  const [name, setName] = useState(user?.name || '');
  const [village, setVillage] = useState(user?.village || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const handleDownloadInvoice = async (orderId: string, orderNumber: string) => {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/invoice/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('ug_token')}`
        }
      });
      if (!response.ok) throw new Error('Invoice download failed.');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `invoice-${orderNumber.replace('#', '')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      alert(`Error downloading invoice: ${err.message}`);
    }
  };

  const { data: ordersData, isLoading: ordersLoading } = useMyOrders();
  const orders = ordersData?.orders || [];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdating(true);
    setUpdateMsg(null);

    try {
      const res = await apiClient('/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify({ name, village, email })
      });
      if (res.success) {
        dispatch(updateUser({ name, village, email }));
        setUpdateMsg(lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' : lang === 'mr' ? 'प्रोफाइल यशस्वीपणे अपडेट झाली!' : 'Profile updated successfully!');
      }
    } catch (err: any) {
      setUpdateMsg(err.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Confirmed': case 'Packed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Out for Delivery': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Delivered': case 'Picked Up': return 'bg-green-50 text-brand-green border-green-200';
      case 'Cancelled': case 'Refunded': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-brand-muted border-brand-border';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Profile Edit Form */}
        <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-brand-light pb-4">
            <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center font-bold text-brand-green text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-brand-dark text-lg leading-tight">{user?.name}</h3>
              <span className="text-xs text-brand-muted font-semibold uppercase tracking-wider">{user?.role} Profile</span>
            </div>
          </div>

          {updateMsg && (
            <div className={`p-3.5 rounded-xl text-xs font-bold text-center border ${
              updateMsg.includes('success') || updateMsg.includes('सफलतापूर्वक') || updateMsg.includes('यशस्वीपणे')
                ? 'bg-green-50 text-brand-green border-green-200' 
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {updateMsg}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">
                {lang === 'hi' ? 'पूरा नाम' : lang === 'mr' ? 'पूर्ण नाव' : 'Full Name'}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                  required
                />
                <User className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">
                {lang === 'hi' ? 'गाँव का नाम' : lang === 'mr' ? 'गावाचे नाव' : 'Village Name'}
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                />
                <MapPin className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">
                {lang === 'hi' ? 'ईमेल पता (वैकल्पिक)' : lang === 'mr' ? 'ईमेल पत्ता (पर्यायी)' : 'Email Address (Optional)'}
              </label>
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium"
                />
                <Mail className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-brand-muted uppercase">
                {lang === 'hi' ? 'पंजीकृत मोबाइल' : lang === 'mr' ? 'नोंदणीकृत मोबाईल' : 'Registered Mobile'}
              </label>
              <div className="relative flex items-center opacity-70">
                <input
                  type="text"
                  value={user?.mobile}
                  disabled
                  className="w-full bg-brand-light border rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none font-medium cursor-not-allowed"
                />
                <Phone className="w-4 h-4 text-brand-muted absolute left-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="btn-primary w-full py-3 mt-4 text-sm font-extrabold"
            >
              {isUpdating ? '...' : currentDict.profile.saveProfileBtn}
            </button>
          </form>
        </div>

        {/* Right Side: Orders list */}
        <div className="lg:col-span-2 space-y-6 bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
          
          <h2 className="font-extrabold text-xl text-brand-dark flex items-center gap-2 border-b border-brand-light pb-4">
            <ClipboardList className="w-5 h-5 text-brand-green" />
            <span>{currentDict.profile.ordersTab}</span>
          </h2>

          {ordersLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-slate-100 skeleton-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {orders.map((order) => (
                <div 
                  key={order._id}
                  className="border border-brand-border/60 hover:border-brand-green/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-light pb-3.5 mb-3.5">
                    <div>
                      <span className="font-extrabold text-sm text-brand-dark block">{order.orderId}</span>
                      <span className="text-[10px] text-brand-muted font-bold block mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(lang === 'en' ? 'en-IN' : lang === 'hi' ? 'hi-IN' : 'mr-IN', { 
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                      <span className="text-[10px] font-black uppercase bg-slate-100 border text-brand-dark px-2.5 py-1 rounded-full">
                        {order.type === 'delivery' ? (lang === 'hi' ? 'होम डिलीवरी' : lang === 'mr' ? 'होम डिलिव्हरी' : 'Home Delivery') : (lang === 'hi' ? 'पिकअप' : lang === 'mr' ? 'पिकअप' : 'Pickup')}
                      </span>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="flex justify-between items-center gap-4">
                    <p className="text-xs text-brand-muted font-semibold line-clamp-1">
                      {order.items.map(i => `${i.name} (${i.qty})`).join(', ')}
                    </p>
                    <div className="flex items-center gap-3.5 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-brand-muted font-bold block">{currentDict.cart.total}</span>
                        <span className="font-black text-base text-brand-dark">₹{order.total}</span>
                      </div>
                      <button 
                        onClick={() => handleDownloadInvoice(order._id, order.orderId)}
                        title="Download Invoice"
                        className="p-1.5 rounded-xl border hover:bg-brand-light transition-all text-brand-muted hover:text-brand-green cursor-pointer"
                      >
                        <FileDown className="w-5 h-5" />
                      </button>
                      <Link 
                        to={`/order-detail?id=${order._id}`}
                        className="p-1.5 rounded-xl border hover:bg-brand-light transition-all text-brand-muted hover:text-brand-green"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-brand-muted font-bold text-sm">
              {lang === 'hi' ? 'आपने अभी तक कोई ऑर्डर बुक नहीं किया है!' : lang === 'mr' ? 'तुम्ही अजून कोणतीही ऑर्डर बुक केलेली नाही!' : "You haven't booked any orders yet!"}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
