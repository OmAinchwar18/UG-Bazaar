import React, { useState, useEffect } from 'react';
import { apiClient } from '@ugbazaar/shared';
import { 
  DollarSign, ShoppingBag, Users, Layers, AlertTriangle, 
  TrendingUp, Activity, Sparkles, RotateCcw, XCircle, CheckCircle 
} from 'lucide-react';

interface Stats {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  lowStockCount: number;
  totalReturns: number;
  pendingReturns: number;
  approvedReturns: number;
  cancelledOrders: number;
  refundsCompleted: number;
}

interface MonthlySale {
  name: string;
  revenue: number;
}

interface BestSeller {
  name: string;
  sales: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    lowStockCount: 0,
    totalReturns: 0,
    pendingReturns: 0,
    approvedReturns: 0,
    cancelledOrders: 0,
    refundsCompleted: 0
  });

  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const loadStats = async () => {
    try {
      const res = await apiClient('/admin/dashboard');
      const lowStockRes = await apiClient('/admin/inventory/low-stock');
      if (res.success && res.stats) {
        setStats({
          revenue: res.stats.totalRevenue || 0,
          orders: res.stats.totalOrders || 0,
          customers: res.stats.totalUsers || 0,
          products: res.stats.totalProducts || 0,
          lowStockCount: lowStockRes.success ? lowStockRes.count : 0,
          totalReturns: res.stats.totalReturns || 0,
          pendingReturns: res.stats.pendingReturns || 0,
          approvedReturns: res.stats.approvedReturns || 0,
          cancelledOrders: res.stats.cancelledOrders || 0,
          refundsCompleted: res.stats.refundsCompleted || 0
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const res = await apiClient('/admin/analytics/summary');
      if (res.success && res.analytics) {
        setMonthlySales(res.analytics.monthlySales || []);
        setBestSellers(res.analytics.bestSellers || []);
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadStats();
      loadAnalyticsData();
    }, 0);
  }, []);

  const runAIInsights = async () => {
    setAiLoading(true);
    setAiInsight(null);
    try {
      const res = await apiClient('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: `Provide a 3-bullet point sales prediction for Chandrapur village store based on sales: ₹${stats.revenue}, products count: ${stats.products}. Keep bullets brief.`
        })
      });
      if (res.success && res.reply) {
        setAiInsight(res.reply);
      }
    } catch {
      setAiInsight("Unable to load insights. Try adding more inventory details!");
    } finally {
      setAiLoading(false);
    }
  };

  const renderMonthlySalesChart = () => {
    if (monthlySales.length === 0) {
      return <div className="h-44 flex items-center justify-center text-xs font-bold text-brand-muted">No sales aggregated yet</div>;
    }

    const width = 500;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const maxVal = Math.max(...monthlySales.map(x => x.revenue), 100);

    const points = monthlySales.map((m, idx) => {
      const x = paddingLeft + (idx * (width - paddingLeft - paddingRight)) / Math.max(monthlySales.length - 1, 1);
      const y = height - paddingBottom - (m.revenue / maxVal) * (height - paddingTop - paddingBottom);
      return { x, y, name: m.name, revenue: m.revenue };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : '';

    return (
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="text-[9px] font-bold fill-brand-muted"
                >
                  ₹{val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaPath && (
            <path d={areaPath} fill="url(#salesGrad)" />
          )}

          {/* Line stroke */}
          {linePath && (
            <path d={linePath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Data points */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle 
                cx={p.x} 
                cy={p.y} 
                r="4" 
                className="fill-white stroke-brand-green stroke-2 hover:r-6 hover:fill-brand-green transition-all"
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="text-[9px] font-black fill-brand-green opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1.5 py-0.5 rounded shadow pointer-events-none"
              >
                ₹{p.revenue}
              </text>
              <text
                x={p.x}
                y={height - 10}
                textAnchor="middle"
                className="text-[10px] font-bold fill-brand-muted"
              >
                {p.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const renderBestsellersSVGChart = () => {
    if (bestSellers.length === 0) {
      return <div className="text-xs font-bold text-brand-muted text-center py-4">No bestselling data yet</div>;
    }

    const maxVal = Math.max(...bestSellers.map(x => x.sales), 1);
    const chartHeight = 160;
    const barHeight = 16;
    const barSpacing = 36;
    const width = 400;

    return (
      <svg viewBox={`0 0 ${width} ${chartHeight}`} className="w-full h-44 overflow-visible">
        {bestSellers.slice(0, 4).map((item, idx) => {
          const y = 15 + idx * barSpacing;
          const barWidth = (item.sales / maxVal) * (width - 120);

          return (
            <g key={idx}>
              <text 
                x="0" 
                y={y + 12} 
                className="text-xs font-bold fill-brand-dark"
              >
                {item.name.length > 15 ? `${item.name.slice(0, 15)}...` : item.name}
              </text>
              <rect 
                x="100" 
                y={y} 
                width={width - 140} 
                height={barHeight} 
                rx="4" 
                fill="#f1f5f9" 
              />
              <rect 
                x="100" 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                rx="4" 
                fill="#10b981" 
                className="transition-all duration-1000 ease-out"
              />
              <text 
                x={110 + barWidth} 
                y={y + 12} 
                className="text-[10px] font-black fill-brand-green"
              >
                {item.sales} sold
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const statItems = [
    { label: 'Total Revenue', val: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-green-600 bg-green-50 border-green-100' },
    { label: 'Total Orders', val: stats.orders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'Customers', val: stats.customers, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { label: 'Products', val: stats.products, icon: Layers, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'Low Stock', val: stats.lowStockCount, icon: AlertTriangle, color: stats.lowStockCount > 0 ? 'text-red-600 bg-red-50 border-red-200 animate-pulse' : 'text-slate-500 bg-slate-50 border-slate-100' },
  ];

  const returnStatItems = [
    { label: 'Total Returns', val: stats.totalReturns, icon: RotateCcw, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'Pending Returns', val: stats.pendingReturns, icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
    { label: 'Approved Returns', val: stats.approvedReturns, icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-100' },
    { label: 'Cancelled Orders', val: stats.cancelledOrders, icon: XCircle, color: 'text-red-600 bg-red-50 border-red-100' },
    { label: 'Refunds Completed', val: stats.refundsCompleted, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {statItems.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="border p-5 rounded-2xl bg-white shadow-sm flex items-center gap-4 border-brand-border/60">
              <div className={`p-3.5 rounded-xl ${c.color.split(' ')[1]} ${c.color.split(' ')[0]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-brand-muted uppercase block">{c.label}</span>
                <span className="font-black text-xl text-brand-dark block mt-0.5">{c.val}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Returns & Refunds Cockpit Overview */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-xs text-brand-muted uppercase tracking-wider flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4 text-brand-green" />
          <span>Returns & Refunds Cockpit</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {returnStatItems.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="border p-5 rounded-2xl bg-white shadow-sm flex items-center gap-4 border-brand-border/60">
                <div className={`p-3.5 rounded-xl ${c.color.split(' ')[1]} ${c.color.split(' ')[0]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-muted uppercase block">{c.label}</span>
                  <span className="font-black text-xl text-brand-dark block mt-0.5">{c.val}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Monthly Sales Area Chart */}
        <div className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm">
          <h3 className="font-extrabold text-sm text-brand-dark mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-brand-green" />
            <span>Monthly Sales Trend</span>
          </h3>
          
          {renderMonthlySalesChart()}
        </div>

        {/* Best Sellers */}
        <div className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-brand-dark mb-4 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand-yellow fill-brand-yellow" />
              <span>Bestselling Products</span>
            </h3>
            
            <div className="pt-2">
              {renderBestsellersSVGChart()}
            </div>
          </div>
        </div>

      </div>

      {/* AI Insights Card */}
      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-brand-light pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-green" />
            <div>
              <h3 className="font-extrabold text-base text-brand-dark">Gemini AI Sales Predictions</h3>
              <p className="text-xs text-brand-muted font-bold mt-0.5">Analyze local agricultural and festival seasons</p>
            </div>
          </div>
          <button 
            onClick={runAIInsights}
            disabled={aiLoading}
            className="btn-primary py-2 px-4 text-xs font-bold cursor-pointer"
          >
            {aiLoading ? 'Thinking...' : 'Generate Prediction Insights'}
          </button>
        </div>

        {aiInsight ? (
          <div className="p-4 bg-brand-light border border-brand-border/60 rounded-2xl text-xs font-semibold text-brand-dark whitespace-pre-line leading-relaxed">
            {aiInsight}
          </div>
        ) : (
          <p className="text-xs font-bold text-brand-muted text-center py-4">Click generate to receive crop season suggestions and sales forecasting details.</p>
        )}
      </div>

    </div>
  );
}
