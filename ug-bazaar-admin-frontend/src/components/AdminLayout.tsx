import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { apiClient, API_BASE } from '@ugbazaar/shared';
import { io } from 'socket.io-client';
import { 
  ShieldCheck, LineChart, Layers, AlertTriangle, 
  ShoppingBag, FileText, Users, Plus, BarChart3, 
  Settings, LogOut, Activity 
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const activeTab = pathname.split('/').pop() || 'dashboard';

  // Real-time alerts queue
  const [liveAlerts, setLiveAlerts] = useState<any[]>([]);

  // Real-Time Sockets Listener for Admins
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const socketUrl = API_BASE.replace('/api', '');
    const socket = io(socketUrl);

    socket.on('connect', () => {
      socket.emit('join_user', user._id);
    });

    socket.on('new_order', (data: any) => {
      setLiveAlerts(prev => [{
        id: Math.random().toString(),
        type: 'info',
        text: `🛒 New Order Placed: ${data.orderId} (₹${data.total}) by ${data.userName}`,
        time: new Date()
      }, ...prev]);
    });

    socket.on('low_stock_alert', (data: any) => {
      setLiveAlerts(prev => [{
        id: Math.random().toString(),
        type: 'warning',
        text: `⚠️ Low Stock Alert: Product "${data.name}" has only ${data.stock} units left!`,
        time: new Date()
      }, ...prev]);
    });

    socket.on('admin_payment_success', (data: any) => {
      setLiveAlerts(prev => [{
        id: Math.random().toString(),
        type: 'success',
        text: `💰 Payment Verified: Order ${data.orderId} (₹${data.total}) from ${data.userName}`,
        time: new Date()
      }, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LineChart },
    { key: 'products', label: 'Products Catalog', icon: Layers },
    { key: 'inventory', label: 'Stock & Logs', icon: AlertTriangle },
    { key: 'orders', label: 'Orders Logs', icon: ShoppingBag },
    { key: 'invoices', label: 'Invoices History', icon: FileText },
    { key: 'customers', label: 'Customer Directory', icon: Users },
    { key: 'coupons', label: 'Promo Coupons', icon: Plus },
    { key: 'analytics', label: 'Detailed Analytics', icon: BarChart3 },
    { key: 'settings', label: 'Store Settings', icon: Settings },
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
            Logged in as: <span className="text-white block mt-0.5">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
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
                  Dismiss
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
