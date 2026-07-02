import React, { useState } from 'react';

export default function Settings() {
  const [storeName, setStoreName] = useState('UG Bazaar');
  const [whatsappNumber, setWhatsappNumber] = useState('918390901925');
  const [deliveryCharge, setDeliveryCharge] = useState(40);
  const [minFreeDelivery, setMinFreeDelivery] = useState(500);

  return (
    <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
      <h2 className="font-extrabold text-lg text-brand-dark">Global Store Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">Store Name</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border-brand-border/60"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">WhatsApp Alerts line</label>
          <input
            type="text"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border-brand-border/60"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">Delivery charge (₹)</label>
          <input
            type="number"
            value={deliveryCharge}
            onChange={(e) => setDeliveryCharge(Number(e.target.value))}
            className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border-brand-border/60"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-brand-muted uppercase">Free shipping threshold limit (₹)</label>
          <input
            type="number"
            value={minFreeDelivery}
            onChange={(e) => setMinFreeDelivery(Number(e.target.value))}
            className="w-full bg-brand-light border rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border-brand-border/60"
          />
        </div>
      </div>

      <button 
        onClick={() => alert('Settings saved locally!')}
        className="btn-primary py-3 px-6 text-xs font-extrabold mt-4 cursor-pointer"
      >
        Save Configuration
      </button>
    </div>
  );
}
