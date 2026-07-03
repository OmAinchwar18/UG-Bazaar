import React, { useState, useEffect } from 'react';
import { apiClient, API_BASE } from '@ugbazaar/shared';
import { Download } from 'lucide-react';

interface Invoice {
  _id: string;
  invoiceNo: string;
  invoiceDate: string;
  cgst: number;
  sgst: number;
  grandTotal: number;
  order?: {
    _id: string;
    orderId: string;
    total: number;
    createdAt: string;
  };
  user?: {
    name: string;
  };
}

export default function Invoices() {
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState('');

  const loadInvoices = async () => {
    try {
      const res = await apiClient('/orders/admin/invoices/all');
      if (res.success && res.invoices) {
        setInvoicesList(res.invoices);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      loadInvoices();
    }, 0);
  }, []);

  const handlePrintInvoice = (orderId: string) => {
    const token = localStorage.getItem('ug_token');
    const url = `${API_BASE}/orders/${orderId}/invoice/view?token=${token}`;
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const filteredInvoices = invoicesList.filter((invoice: Invoice) => 
    invoice.invoiceNo?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    invoice.order?.orderId?.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
    invoice.user?.name?.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  return (
    <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-light pb-4">
        <h2 className="font-extrabold text-lg text-brand-dark">Invoices Registry</h2>
        <input 
          type="text"
          placeholder="Search Invoice No / Order ID / Customer..."
          value={invoiceSearch}
          onChange={(e) => setInvoiceSearch(e.target.value)}
          className="bg-brand-light border rounded-xl px-4 py-2 text-xs font-bold outline-none w-full sm:w-60"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border text-xs font-bold text-brand-muted uppercase bg-brand-light/35">
              <th className="py-4 px-4">Invoice No</th>
              <th className="py-4 px-4">Order ID</th>
              <th className="py-4 px-4">Customer</th>
              <th className="py-4 px-4">Date</th>
              <th className="py-4 px-4 text-right">CGST</th>
              <th className="py-4 px-4 text-right">SGST</th>
              <th className="py-4 px-4 text-right">Total (₹)</th>
              <th className="py-4 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light text-sm font-semibold">
            {filteredInvoices.map((inv: Invoice) => (
              <tr key={inv._id} className="hover:bg-brand-light/30">
                <td className="py-4 px-4 font-extrabold text-brand-dark">{inv.invoiceNo}</td>
                <td className="py-4 px-4 font-extrabold text-brand-muted">{inv.order?.orderId}</td>
                <td className="py-4 px-4">{inv.user?.name}</td>
                <td className="py-4 px-4">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                <td className="py-4 px-4 text-right">₹{inv.cgst?.toFixed(2) || '0.00'}</td>
                <td className="py-4 px-4 text-right">₹{inv.sgst?.toFixed(2) || '0.00'}</td>
                <td className="py-4 px-4 text-right font-extrabold text-brand-dark">₹{inv.grandTotal}</td>
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <a 
                      href={`${API_BASE}/orders/${inv.order?._id}/invoice/view?token=${localStorage.getItem('ug_token')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-green font-bold hover:underline"
                    >
                      View
                    </a>
                    <a 
                      href={`${API_BASE}/orders/${inv.order?._id}/invoice/download?token=${localStorage.getItem('ug_token')}`}
                      className="text-xs text-indigo-500 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                    <button 
                      onClick={() => handlePrintInvoice(inv.order?._id)}
                      className="text-xs text-brand-muted hover:text-brand-dark font-bold cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
