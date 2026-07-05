import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useTranslation } from '../hooks/useTranslation';
import { API_BASE, getTranslated } from '@ugbazaar/shared';
import { io } from 'socket.io-client';
import { 
  ShieldCheck, LineChart, Layers, AlertTriangle, 
  ShoppingBag, FileText, Users, Plus, BarChart3, 
  Settings, LogOut, Activity, RotateCcw
} from 'lucide-react';

interface LiveAlert {
  id: string;
  type: 'info' | 'warning' | 'success';
  text: string;
  time: Date;
}

interface NewOrderAlertData {
  orderId: string;
  total: number;
  userName: string;
}

interface LowStockAlertData {
  name: any;
  stock: number;
}

interface PaymentSuccessAlertData {
  orderId: string;
  total: number;
  userName: string;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentDict, lang, changeLanguage } = useTranslation();
  const activeTab = pathname.split('/').pop() || 'dashboard';

  // Real-time alerts queue
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);

  // Real-Time Sockets Listener for Admins
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const socketUrl = API_BASE.replace('/api', '');
    const socket = io(socketUrl);

    socket.on('connect', () => {
      socket.emit('join_user', user._id);
    });

    socket.on('new_order', (data: NewOrderAlertData) => {
      const msg = lang === 'hi' 
        ? `🛒 नया ऑर्डर आया: ${data.orderId} (₹${data.total}) - ${data.userName} द्वारा`
        : lang === 'mr'
        ? `🛒 नवीन ऑर्डर आली: ${data.orderId} (₹${data.total}) - ${data.userName} द्वारे`
        : `🛒 New Order Placed: ${data.orderId} (₹${data.total}) by ${data.userName}`;

      setLiveAlerts(prev => [{
        id: Math.random().toString(),
        type: 'info',
        text: msg,
        time: new Date()
      }, ...prev]);
    });

    socket.on('low_stock_alert', (data: LowStockAlertData) => {
      const prodName = getTranslated(data.name, lang);
      const msg = lang === 'hi'
        ? `⚠️ कम स्टॉक चेतावनी: उत्पाद "${prodName}" में केवल ${data.stock} नग बचे हैं!`
        : lang === 'mr'
        ? `⚠️ कमी स्टॉक चेतावणी: उत्पादन "${prodName}" मध्ये फक्त ${data.stock} नग शिल्लक आहेत!`
        : `⚠️ Low Stock Alert: Product "${prodName}" has only ${data.stock} units left!`;

      setLiveAlerts(prev => [{
        id: Math.random().toString(),
        type: 'warning',
        text: msg,
        time: new Date()
      }, ...prev]);
    });

    socket.on('admin_payment_success', (data: PaymentSuccessAlertData) => {
      const msg = lang === 'hi'
        ? `💰 भुगतान सत्यापित: ऑर्डर ${data.orderId} (₹${data.total}) - ${data.userName} का`
        : lang === 'mr'
        ? `💰 पेमेंट सत्यापित: ऑर्डर ${data.orderId} (₹${data.total}) - ${data.userName} चे`
        : `💰 Payment Verified: Order ${data.orderId} (₹${data.total}) from ${data.userName}`;

      setLiveAlerts(prev => [{
        id: Math.random().toString(),
        type: 'success',
        text: msg,
        time: new Date()
      }, ...prev]);
    });

    socket.on('admin_new_cancellation', (data: { orderId: string; reason: string }) => {
      const msg = lang === 'hi'
        ? `❌ ऑर्डर रद्द: ${data.orderId} (कारण: ${data.reason})`
        : lang === 'mr'
        ? `❌ ऑर्डर रद्द: ${data.orderId} (कारण: ${data.reason})`
        : `❌ Order Cancelled: ${data.orderId} (Reason: ${data.reason})`;

      setLiveAlerts(prev => [{
        id: Math.random().toString(),
        type: 'warning',
        text: msg,
        time: new Date()
      }, ...prev]);
    });

    socket.on('admin_new_return_request', (data: { orderId: string; reason: string }) => {
      const msg = lang === 'hi'
        ? `🔄 वापसी अनुरोध: ऑर्डर ${data.orderId} (कारण: ${data.reason})`
        : lang === 'mr'
        ? `🔄 परतावा विनंती: ऑर्डर ${data.orderId} (कारण: ${data.reason})`
        : `🔄 Return Requested: Order ${data.orderId} (Reason: ${data.reason})`;

      setLiveAlerts(prev => [{
        id: Math.random().toString(),
        type: 'warning',
        text: msg,
        time: new Date()
      }, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, lang]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { key: 'dashboard', label: currentDict.admin.dashboard, icon: LineChart },
    { key: 'products', label: currentDict.admin.catalog, icon: Layers },
    { key: 'inventory', label: currentDict.admin.inventory, icon: AlertTriangle },
    { key: 'orders', label: currentDict.admin.orders, icon: ShoppingBag },
    { key: 'returns', label: currentDict.admin.returns, icon: RotateCcw },
    { key: 'invoices', label: currentDict.admin.invoices, icon: FileText },
    { key: 'customers', label: currentDict.admin.customers, icon: Users },
    { key: 'coupons', label: currentDict.admin.coupons, icon: Plus },
    { key: 'analytics', label: currentDict.admin.analytics, icon: BarChart3 },
    { key: 'settings', label: currentDict.admin.settings, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-light flex text-brand-dark font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col justify-between flex-shrink-0 min-h-screen">
        <div>
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-green fill-brand-green" />
            <span className="font-extrabold text-lg">Admin Cockpit</span>
          </div>

          {/* Sidebar Language Selectors */}
          <div className="px-6 py-3.5 border-b border-white/5 flex gap-2">
            {(['en', 'hi', 'mr'] as const).map((l) => (
              <button
                key={l}
                onClick={() => changeLanguage(l)}
                className={`flex-1 text-[10px] font-black py-1 px-1.5 rounded-lg border transition-all uppercase cursor-pointer ${
                  lang === l 
                    ? 'bg-brand-green border-brand-green text-white font-black' 
                    : 'bg-transparent border-white/20 text-white/60 hover:text-white hover:border-white/40'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => navigate('/' + tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-colors text-left cursor-pointer ${
                    isActive 
                      ? 'bg-brand-green text-white shadow-md shadow-brand-green/20' 
                      : 'hover:bg-white/5 text-brand-muted hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="text-xs px-4 text-brand-muted font-bold">
            {lang === 'hi' ? 'लॉग इन किया है:' : lang === 'mr' ? 'लॉग इन केले आहे:' : 'Logged in as:'}
            <span className="text-white block mt-0.5 font-extrabold">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{lang === 'hi' ? 'लॉग आउट' : lang === 'mr' ? 'लॉग आउट' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow p-8 md:p-10 overflow-y-auto max-h-screen">
        
        {/* Real-time Alerts Panel */}
        {liveAlerts.length > 0 && (
          <div className="mb-6 space-y-2.5">
            {liveAlerts.slice(0, 3).map((alert) => (
              <div 
                key={alert.id}
                className={`flex items-center justify-between border px-5 py-3 rounded-2xl text-xs font-bold shadow-sm animate-slide-up ${
                  alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  alert.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                  'bg-indigo-50 border-indigo-200 text-indigo-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span>{alert.text}</span>
                </div>
                <button 
                  onClick={() => setLiveAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="hover:text-black font-extrabold text-[10px] uppercase ml-4 cursor-pointer"
                >
                  {lang === 'hi' ? 'खारिज करें' : lang === 'mr' ? 'काढून टाका' : 'Dismiss'}
                </button>
              </div>
            ))}
          </div>
        )}

        <Outlet />
      </main>
    </div>
  );
}
