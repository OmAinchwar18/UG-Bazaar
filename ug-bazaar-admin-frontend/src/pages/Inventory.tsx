import React, { useState, useEffect } from 'react';
import { apiClient } from '@ugbazaar/shared';

export default function Inventory() {
  const [productsList, setProductsList] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [selectedProductLogs, setSelectedProductLogs] = useState<any[]>([]);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);

  // Stock Adjustment Form
  const [adjQty, setAdjQty] = useState('');
  const [adjType, setAdjType] = useState('stock_adjusted');
  const [adjNote, setAdjNote] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await apiClient('/products?limit=100');
      if (res.success && res.products) {
        setProductsList(res.products);
      }
    } catch {}
  };

  const openAdjustStockModal = (prod: any) => {
    setSelectedProductId(prod._id);
    setSelectedProductName(prod.name);
    setAdjQty('');
    setAdjType('stock_adjusted');
    setAdjNote('');
    setIsAdjustStockModalOpen(true);
  };

  const loadProductLogs = async (prodId: string) => {
    try {
      const res = await apiClient(`/products/${prodId}/inventory/logs`);
      if (res.success) {
        setSelectedProductLogs(res.logs);
      }
    } catch {}
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !adjQty) return;

    try {
      const res = await apiClient(`/products/${selectedProductId}/inventory/adjust`, {
        method: 'POST',
        body: JSON.stringify({
          qtyChange: Number(adjQty),
          type: adjType,
          note: adjNote
        })
      });

      if (res.success) {
        setIsAdjustStockModalOpen(false);
        loadProducts();
        if (selectedProductId) {
          loadProductLogs(selectedProductId);
        }
      }
    } catch (err: any) {
      alert(`Adjustment failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
        <h2 className="font-extrabold text-lg text-brand-dark border-b border-brand-light pb-4 mb-6">Inventory Audit & Adjustments</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-xs font-bold text-brand-muted uppercase bg-brand-light/35">
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4">SKU</th>
                <th className="py-4 px-4">Supplier</th>
                <th className="py-4 px-4 text-center">Min Stock</th>
                <th className="py-4 px-4 text-center">Current Stock</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light text-sm font-semibold">
              {productsList.map((p) => {
                const isLow = p.stock <= (p.minStockLevel || 5);
                return (
                  <tr key={p._id} className="hover:bg-brand-light/30">
                    <td className="py-4 px-4 font-extrabold text-brand-dark">{p.name}</td>
                    <td className="py-4 px-4 font-mono text-xs">{p.sku || 'N/A'}</td>
                    <td className="py-4 px-4">{p.supplierName || 'Local Supplier'}</td>
                    <td className="py-4 px-4 text-center">{p.minStockLevel || 5}</td>
                    <td className="py-4 px-4 text-center font-extrabold text-brand-dark">{p.stock}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        isLow ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' : 'bg-green-50 text-brand-green border-green-200'
                      }`}>
                        {isLow ? '⚠ Low Stock' : 'OK'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openAdjustStockModal(p)}
                          className="text-xs bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-1 rounded-lg font-bold hover:bg-brand-green hover:text-white transition-all cursor-pointer"
                        >
                          Adjust Stock
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedProductId(p._id);
                            setSelectedProductName(p.name);
                            loadProductLogs(p._id);
                          }}
                          className="text-xs text-brand-muted hover:text-brand-dark font-bold cursor-pointer"
                        >
                          View Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Sidebar/Panel */}
      {selectedProductId && (
        <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center border-b border-brand-light pb-4 mb-4">
            <h3 className="font-extrabold text-sm text-brand-dark">Audit Logs: {selectedProductName}</h3>
            <button 
              onClick={() => setSelectedProductId(null)}
              className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
            >
              Clear Panel
            </button>
          </div>

          {selectedProductLogs.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {selectedProductLogs.map((log, idx) => (
                <div key={idx} className="bg-brand-light p-3 rounded-xl border border-brand-border/60 flex items-center justify-between text-xs font-bold text-brand-muted">
                  <div>
                    <span className={`mr-2 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      log.quantityChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                    </span>
                    <span className="text-brand-dark font-extrabold mr-2">Result: {log.resultingStock}</span>
                    <span>Reason: {log.note || log.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-brand-dark font-extrabold">{log.user?.name || 'Automated System'}</p>
                    <p className="text-[9px] mt-0.5">{new Date(log.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-brand-muted text-center py-4">No audit logs found for this product. Trigger "Adjust Stock" to record logs.</p>
          )}
        </div>
      )}

      {/* ADJUST STOCK MODAL */}
      {isAdjustStockModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-brand-border shadow-2xl rounded-3xl p-6 md:p-8 max-w-md w-full animate-slide-up">
            <h3 className="font-extrabold text-lg text-brand-dark mb-4">
              Adjust Stock: {selectedProductName}
            </h3>
            
            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Quantity Change (e.g. +10, -5)</label>
                <input 
                  type="number"
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                  placeholder="Enter positive/negative quantity"
                  className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Audit Change Type</label>
                <select 
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value)}
                  className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                >
                  <option value="stock_adjusted">Manual Adjustment</option>
                  <option value="audit">Inventory Audit Check</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Audit Note / Comment</label>
                <textarea 
                  value={adjNote}
                  onChange={(e) => setAdjNote(e.target.value)}
                  placeholder="e.g. Damaged inventory replacement, Restocked new supplier batch"
                  className="w-full bg-brand-light border rounded-xl p-3 text-xs outline-none h-20 resize-none font-bold"
                  required
                ></textarea>
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-brand-light">
                <button
                  type="button"
                  onClick={() => setIsAdjustStockModalOpen(false)}
                  className="btn-secondary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  Record Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
