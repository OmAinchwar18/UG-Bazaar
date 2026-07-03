import React, { useState, useEffect } from 'react';
import { apiClient } from '@ugbazaar/shared';
import { RotateCcw } from 'lucide-react';

interface ReturnRequest {
  _id: string;
  order?: {
    _id: string;
    orderId: string;
    total: number;
    status: string;
  };
  customer?: {
    name: string;
    mobile: string;
  };
  products: Array<{
    _id: string;
    name: string;
    price: number;
    images?: Array<{ url: string }>;
  }>;
  reason: string;
  images?: string[];
  comments?: string;
  status: string;
  adminNotes?: string;
  refundAmount?: number;
  refundTransactionId?: string;
  refundMethod?: string;
  createdAt: string;
}

export default function Returns() {
  const [returnsList, setReturnsList] = useState<ReturnRequest[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  
  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  
  // Refund completed fields
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundTransactionId, setRefundTransactionId] = useState('');
  const [refundMethod, setRefundMethod] = useState('upi');

  // Preview Image Overlay State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadReturns = async () => {
    try {
      const res = await apiClient('/orders/admin/returns/all');
      if (res.success && res.returns) {
        setReturnsList(res.returns);
      }
    } catch (err) {
      console.error('Failed to load returns:', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadReturns();
    }, 0);
  }, []);

  const openStatusModal = (ret: ReturnRequest, status: string) => {
    setSelectedReturn(ret);
    setTargetStatus(status);
    setAdminNotes(ret.adminNotes || '');
    setRefundAmount(ret.refundAmount || ret.order?.total || 0);
    setRefundTransactionId(ret.refundTransactionId || '');
    setRefundMethod(ret.refundMethod || 'upi');
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    try {
      interface StatusUpdateBody {
        status: string;
        adminNotes: string;
        refundAmount?: number;
        refundTransactionId?: string;
        refundMethod?: string;
        refundDate?: string;
      }

      const body: StatusUpdateBody = {
        status: targetStatus,
        adminNotes: adminNotes || `Return status set to ${targetStatus}`
      };

      if (targetStatus === 'Refund Completed') {
        body.refundAmount = Number(refundAmount);
        body.refundTransactionId = refundTransactionId;
        body.refundMethod = refundMethod;
        body.refundDate = new Date().toISOString();
      }

      const res = await apiClient(`/orders/admin/returns/${selectedReturn._id}/status`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      if (res.success) {
        setIsStatusModalOpen(false);
        loadReturns();
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      alert(`Error updating return status: ${errMsg}`);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Return Requested': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Under Review': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Approved': return 'bg-green-50 text-brand-green border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'Pickup Scheduled': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Product Received': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Refund Initiated': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Refund Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-brand-muted border-brand-border';
    }
  };

  return (
    <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-brand-light pb-4 mb-2">
        <RotateCcw className="w-6 h-6 text-brand-green" />
        <div>
          <h2 className="font-extrabold text-lg text-brand-dark leading-tight">Returns & Refunds Cockpit</h2>
          <span className="text-xs text-brand-muted font-bold">Review and authorize customer return requests</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border text-xs font-bold text-brand-muted uppercase bg-brand-light/35">
              <th className="py-4 px-4">Return ID</th>
              <th className="py-4 px-4">Order ID</th>
              <th className="py-4 px-4">Customer</th>
              <th className="py-4 px-4">Product Details</th>
              <th className="py-4 px-4">Return Reason</th>
              <th className="py-4 px-4">Proof Proofs</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-center">Manage Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light text-sm font-semibold">
            {returnsList.length > 0 ? (
              returnsList.map((r) => (
                <tr key={r._id} className="hover:bg-brand-light/30">
                  <td className="py-4 px-4 font-mono text-xs text-brand-muted">#{r._id.slice(-6).toUpperCase()}</td>
                  <td className="py-4 px-4 font-extrabold text-brand-dark">{r.order?.orderId || 'N/A'}</td>
                  <td className="py-4 px-4 text-xs font-bold">
                    <span className="block text-brand-dark">{r.customer?.name}</span>
                    <span className="text-brand-muted mt-0.5 block">{r.customer?.mobile}</span>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    {r.products?.map((p, idx) => (
                      <span key={idx} className="block font-bold text-brand-dark">{p.name}</span>
                    ))}
                  </td>
                  <td className="py-4 px-4">
                    <span className="block text-xs font-extrabold text-brand-dark">{r.reason}</span>
                    {r.comments && <span className="block text-[10px] text-brand-muted font-medium mt-1 italic">"{r.comments}"</span>}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {r.images && r.images.length > 0 ? (
                        r.images.map((img, idx) => (
                          <img 
                            key={idx} 
                            src={img} 
                            alt="proof" 
                            className="w-7 h-7 object-cover rounded-md border bg-slate-100 cursor-zoom-in hover:scale-105 transition-all"
                            onClick={() => setPreviewImage(img)}
                          />
                        ))
                      ) : (
                        <span className="text-[10px] font-bold text-brand-muted">No proofs</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      {r.status === 'Return Requested' && (
                        <>
                          <button 
                            onClick={() => openStatusModal(r, 'Under Review')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-1 rounded-md border border-blue-200 cursor-pointer"
                          >
                            Under Review
                          </button>
                          <button 
                            onClick={() => openStatusModal(r, 'Approved')}
                            className="bg-green-50 hover:bg-green-100 text-brand-green text-[10px] font-extrabold px-2 py-1 rounded-md border border-green-200 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => openStatusModal(r, 'Rejected')}
                            className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-1 rounded-md border border-red-200 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {r.status === 'Under Review' && (
                        <>
                          <button 
                            onClick={() => openStatusModal(r, 'Approved')}
                            className="bg-green-50 hover:bg-green-100 text-brand-green text-[10px] font-extrabold px-2 py-1 rounded-md border border-green-200 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => openStatusModal(r, 'Rejected')}
                            className="bg-red-50 hover:bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-1 rounded-md border border-red-200 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {r.status === 'Approved' && (
                        <button 
                          onClick={() => openStatusModal(r, 'Pickup Scheduled')}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded-md border border-indigo-200 cursor-pointer"
                        >
                          Schedule Pickup
                        </button>
                      )}

                      {r.status === 'Pickup Scheduled' && (
                        <button 
                          onClick={() => openStatusModal(r, 'Product Received')}
                          className="bg-orange-50 hover:bg-orange-100 text-orange-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded-md border border-orange-200 cursor-pointer"
                        >
                          Product Received
                        </button>
                      )}

                      {r.status === 'Product Received' && (
                        <button 
                          onClick={() => openStatusModal(r, 'Refund Initiated')}
                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded-md border border-purple-200 cursor-pointer"
                        >
                          Initiate Refund
                        </button>
                      )}

                      {r.status === 'Refund Initiated' && (
                        <button 
                          onClick={() => openStatusModal(r, 'Refund Completed')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2.5 py-1.5 rounded-md border border-emerald-200 cursor-pointer"
                        >
                          Complete Refund
                        </button>
                      )}

                      {(r.status === 'Refund Completed' || r.status === 'Rejected') && (
                        <span className="text-[10px] font-bold text-brand-muted italic">No further actions</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-brand-muted font-bold text-sm">
                  No return requests logged yet!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: MANAGE RETURN STATUS */}
      {isStatusModalOpen && selectedReturn && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border shadow-2xl rounded-3xl p-6 md:p-8 max-w-md w-full animate-slide-up">
            <h3 className="font-extrabold text-lg text-brand-dark mb-4 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-brand-green" />
              <span>Update Return Process</span>
            </h3>
            
            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div className="bg-brand-light/35 p-3.5 rounded-xl text-xs space-y-1 text-brand-muted font-bold border border-brand-border/40">
                <p>Order: <span className="text-brand-dark">{selectedReturn.order?.orderId}</span></p>
                <p>Action target: <span className="text-brand-green uppercase font-black">{targetStatus}</span></p>
              </div>

              {targetStatus === 'Refund Completed' && (
                <div className="space-y-3.5 border border-brand-green/20 bg-green-50/10 p-4 rounded-2xl">
                  <span className="text-[10px] font-black text-brand-green uppercase block">Refund Transaction cockpit</span>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-muted uppercase">Refund Amount (₹)</label>
                    <input 
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      className="w-full bg-brand-light border rounded-xl px-3.5 py-2 text-xs font-bold outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-muted uppercase">Transaction Reference ID</label>
                    <input 
                      type="text"
                      placeholder="e.g. TXN920391039"
                      value={refundTransactionId}
                      onChange={(e) => setRefundTransactionId(e.target.value)}
                      className="w-full bg-brand-light border rounded-xl px-3.5 py-2 text-xs font-bold outline-none font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-muted uppercase">Refund Channel</label>
                    <select 
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                      className="w-full bg-brand-light border rounded-xl px-3.5 py-2 text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="upi">UPI / Instant Transfer</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="cod">Cash Refund</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-brand-muted uppercase">Admin Remarks & Notes</label>
                <textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Kripya review remarks likhein..."
                  className="w-full bg-brand-light border rounded-xl p-3 text-xs outline-none h-20 resize-none font-bold"
                  required
                ></textarea>
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-brand-light">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="btn-secondary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-bold cursor-pointer bg-brand-green text-white"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERLAY PREVIEW IMAGE */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-brand-dark/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="Preview" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
        </div>
      )}

    </div>
  );
}
