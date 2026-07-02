import React from 'react';
import { Sparkles, MapPin, CheckCircle, Leaf } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in pb-24 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="bg-brand-green/10 text-brand-green text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
          Our Story
        </span>
        <h1 className="font-extrabold text-3xl md:text-5xl text-brand-dark">About UG Bazaar</h1>
        <p className="text-sm text-brand-muted max-w-xl mx-auto font-semibold">
          Bridging the gap between traditional village retail stores and high-fidelity modern digital shopping across Gondpipri Taluka, Maharashtra.
        </p>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-brand-border/60 rounded-3xl p-8 shadow-sm">
        <div className="space-y-4">
          <h2 className="font-extrabold text-2xl text-brand-dark">Hyperlocal Digital Marketplace</h2>
          <p className="text-sm text-brand-muted leading-relaxed font-semibold">
            UG Bazaar was established to empower local shops in Talodhi by giving them a unified digital storefront. We deliver daily essentials, hardware tools, and certified agricultural seeds directly to consumers homes.
          </p>
          <ul className="text-xs text-brand-muted font-bold space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-green" />
              <span>Direct local sourcing from Chandrapur merchants</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-brand-green" />
              <span>10-Minute delivery slots across Talodhi area</span>
            </li>
          </ul>
        </div>

        <div className="bg-brand-light p-8 rounded-2xl border flex flex-col justify-center space-y-4">
          <div className="flex items-center gap-2 text-brand-green font-extrabold text-sm">
            <MapPin className="w-5 h-5" />
            <span>HQ & Dispatch Center</span>
          </div>
          <p className="text-xs text-brand-dark font-extrabold leading-snug">
            Opp. CDCC Bank, Bhangaram Road,<br />
            Talodhi, Tq. Gondpipri,<br />
            Dist. Chandrapur, Maharashtra - 441224
          </p>
        </div>
      </div>

    </div>
  );
}
