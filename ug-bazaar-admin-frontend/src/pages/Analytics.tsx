import React, { useState, useEffect } from 'react';
import { apiClient, API_BASE } from '@ugbazaar/shared';
import { DollarSign, ShoppingBag, Users, AlertTriangle, Download, PieChart } from 'lucide-react';

interface Stats {
  revenue: number;
  orders: number;
  customers: number;
  lowStockCount: number;
}

export default function Analytics() {
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    orders: 0,
    customers: 0,
    lowStockCount: 0
  });

  const [topCategories, setTopCategories] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadAnalyticsData();
  }, []);

  const loadStats = async () => {
    try {
      const res = await apiClient('/admin/dashboard');
      const lowStockRes = await apiClient('/admin/inventory/low-stock');
      if (res.success && res.stats) {
        setStats({
          revenue: res.stats.totalRevenue || 0,
          orders: res.stats.totalOrders || 0,
          customers: res.stats.totalUsers || 0,
          lowStockCount: lowStockRes.success ? lowStockRes.count : 0
        });
      }
    } catch {}
  };

  const loadAnalyticsData = async () => {
    try {
      const res = await apiClient('/admin/analytics/summary');
      if (res.success && res.analytics) {
        setTopCategories(res.analytics.topCategories || []);
      }
    } catch {}
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    const token = localStorage.getItem('ug_token');
    window.open(`${API_BASE}/admin/analytics/export?format=${format}&token=${token}`, '_blank');
  };

  const renderCategoryDonutChart = () => {
    if (topCategories.length === 0) {
      return <div className="text-xs font-bold text-brand-muted text-center py-4">No categories data yet</div>;
    }

    const totalValue = topCategories.reduce((sum, item) => sum + item.value, 0) || 1;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let accumulatedPercent = 0;

    const colors = [
      '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#14b8a6'
    ];

    return (
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
        <div className="relative w-48 h-48 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            {topCategories.map((c, idx) => {
              const percent = c.value / totalValue;
              const strokeDashoffset = circumference - (percent * circumference);
              const strokeDasharray = circumference;
              const rotationOffset = accumulatedPercent * 360;
              accumulatedPercent += percent;
              const color = colors[idx % colors.length];

              return (
                <circle
                  key={idx}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${rotationOffset} 100 100)`}
                  className="transition-all duration-500 hover:stroke-[24] cursor-pointer"
                >
                  <title>{`${c.name}: ₹${c.value}`}</title>
                </circle>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-12 shadow-inner border text-center">
            <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Total Sales</span>
            <span className="font-black text-sm text-brand-dark mt-0.5">₹{totalValue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {topCategories.map((c, idx) => {
            const color = colors[idx % colors.length];
            const percent = (c.value / totalValue) * 100;
            return (
              <div key={idx} className="flex items-center gap-3 p-3 bg-brand-light/30 border border-brand-border/40 rounded-2xl hover:bg-brand-light/60 transition-all">
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                <div className="flex-grow min-w-0">
                  <span className="text-xs font-bold text-brand-dark truncate block">{c.name}</span>
                  <span className="text-[10px] text-brand-muted font-bold block mt-0.5">
                    ₹{c.value.toLocaleString('en-IN')} ({percent.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Revenue Share (Total)', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: DollarSign, change: '+12% this month' },
          { label: 'Order Dispatch Count', value: stats.orders, icon: ShoppingBag, change: '+8% this month' },
          { label: 'B2C Registries', value: stats.customers, icon: Users, change: '+15% growth' },
          { label: 'Low Stock Level Alerts', value: stats.lowStockCount, icon: AlertTriangle, change: stats.lowStockCount > 0 ? 'Urgent Restock Needed' : 'All Stock Healthy' }
        ].map((c, idx) => (
          <div key={idx} className="bg-white border border-brand-border/60 p-6 rounded-2xl shadow-sm flex items-start justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-brand-muted uppercase">{c.label}</span>
              <h3 className="font-black text-2xl text-brand-dark">{c.value}</h3>
              <span className="text-[10px] font-extrabold text-brand-green bg-green-50 px-2 py-0.5 rounded block w-fit">{c.change}</span>
            </div>
            <c.icon className="w-5 h-5 text-brand-muted" />
          </div>
        ))}
      </div>

      {/* Export options */}
      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-brand-dark">Confidential Report Downloader</h3>
          <p className="text-xs text-brand-muted font-bold mt-0.5">Export store summaries in standard CSV or PDF formats</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => handleExport('csv')}
            className="bg-brand-light hover:bg-slate-200 border text-brand-dark font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer w-full sm:w-auto text-center"
          >
            Export CSV Report
          </button>
          <button 
            onClick={() => handleExport('pdf')}
            className="bg-brand-green hover:bg-brand-green/90 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer w-full sm:w-auto text-center flex items-center justify-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* Category breakdown SVG donut chart */}
      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <h3 className="font-extrabold text-sm text-brand-dark border-b border-brand-light pb-4 flex items-center gap-1">
          <PieChart className="w-4 h-4 text-brand-green" />
          <span>Department / Category Sales Share</span>
        </h3>
        
        {renderCategoryDonutChart()}
      </div>
    </div>
  );
}
