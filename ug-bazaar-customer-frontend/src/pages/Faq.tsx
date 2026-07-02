import React, { useState } from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';

const faqs = [
  { q: "What is UG Bazaar delivery timing?", a: "We operate daily from 9:00 AM to 9:00 PM. Local deliveries within Talodhi village limits are dispatched instantly and typically arrive in under 10-15 minutes." },
  { q: "What are the shipping charges?", a: "Home delivery is completely FREE for orders above ₹500. For orders below ₹500, a flat delivery fee of ₹40 is applied." },
  { q: "How can I pay for my orders?", a: "We accept payments through BHIM UPI, debit/credit cards, net banking via secure Razorpay checkout, or Cash on Delivery (COD) / Pay on Delivery." },
  { q: "How do I return a product?", a: "We offer a 7-day hassle-free return policy on non-perishable grocery items, electrical components, and hardware. Sacks of seed or fertilizers must be unopened to qualify for returns." }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in pb-24 space-y-8">
      
      <div className="text-center">
        <h1 className="font-extrabold text-3xl text-brand-dark">Frequently Asked Questions</h1>
        <p className="text-xs text-brand-muted mt-2 font-bold uppercase tracking-wider">Help & Support Center</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              className="bg-white border border-brand-border/60 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left p-5 font-extrabold text-sm text-brand-dark flex items-center justify-between hover:bg-brand-light/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-5 h-5 text-brand-green" />
                  <span>{faq.q}</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-brand-muted transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
              </button>
              
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-brand-muted font-semibold leading-relaxed border-t border-brand-light/60 bg-brand-light/10">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
