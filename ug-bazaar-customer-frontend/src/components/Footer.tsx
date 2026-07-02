import React from 'react';
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white pt-16 pb-12 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Logo & Intro */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="bg-brand-green text-white p-1.5 rounded-lg">
                <Sparkles className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
              </span>
              <span className="font-extrabold text-xl tracking-tight">UG Bazaar</span>
            </div>
            <p className="text-sm text-brand-muted font-medium leading-relaxed">
              Your trusted hyperlocal multi-department superstore delivering essentials, electricals, furniture, and agri inputs directly to your home.
            </p>
          </div>

          {/* Hyperlocal Coverage */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-sm text-brand-yellow tracking-wider uppercase">Hyperlocal Delivery</h4>
            <ul className="text-sm text-brand-muted space-y-2.5 font-medium">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span>Talodhi (Tq. Gondpipri)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span>Bhangaram Chowk</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span>Chandrapur District, MH</span>
              </li>
            </ul>
          </div>

          {/* Business Timings */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-sm text-brand-yellow tracking-wider uppercase">Store Details</h4>
            <ul className="text-sm text-brand-muted space-y-2.5 font-medium">
              <li>
                <span className="block text-white font-bold text-xs uppercase">Timings</span>
                <span>9:00 AM – 9:00 PM (Daily)</span>
              </li>
              <li>
                <span className="block text-white font-bold text-xs uppercase">Free Delivery Limit</span>
                <span>Orders above ₹500</span>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-sm text-brand-yellow tracking-wider uppercase">Contact Support</h4>
            <ul className="text-sm text-brand-muted space-y-2.5 font-medium">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-green" />
                <span>+91 9422137293</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-green" />
                <span>support@ugbazaar.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-muted font-medium">
            © {new Date().getFullYear()} UG Bazaar. All rights reserved. Registered under MSME Maharashtra.
          </p>
          <div className="flex items-center gap-4 text-xs text-brand-muted font-bold">
            <span className="bg-white/5 px-2.5 py-1 rounded-md">Razorpay SECURE</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md">BHIM UPI APPROVED</span>
            <span className="bg-white/5 px-2.5 py-1 rounded-md">ISO 9001:2015</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
